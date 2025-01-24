"use client"

import { useState, useCallback } from "react"
import { useDebounceHook as useDebouncedCallback } from "@/lib/useDebouncer"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

// Mock API call
const fetchSearchResults = async (query: string): Promise<string[]> => {
  const response = await fetch(`http://127.0.0.1:8000/data/search/?q=${query}`)

  console.log(response)
  if (!response.ok) {
    throw new Error("Failed to fetch search results")
  }

  const results = await response.json()
  //@ts-ignore
  return results.map((item) => `${item.symbol} - ${item.stock_name}`)
}

export default function DebouncedSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState("")

  const debouncedSearch = useDebouncedCallback(async (value) => {
    if (value) {
      setIsLoading(true)
      const searchResults = await fetchSearchResults(value)
      setResults(searchResults)
      setIsLoading(false)
    } else {
      setResults([])
    }
  }, 300)

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setQuery(value)
      debouncedSearch(value)
    },
    [debouncedSearch],
  )

  const handleSelectItem = useCallback((item: string) => {
    setSelectedItem(item)
    setQuery(item) // Set the search input value to the selected item
    setResults([]) // Clear the results after selection
  }, [])

  return (
<div className="w-full space-y-4">
  <div className="relative w-full">
    <input
      type="text"
      placeholder="Search Instrument"
      value={query}
      onChange={handleInputChange}
      className="w-full input"
    />
    {isLoading && (
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <Loader2 className="h-4 w-4 animate-spin text-[var(--foreground-subtle)]" />
      </div>
    )}
    {results.length > 0 && (
      <ul className="absolute left-0 my-2 w-full bg-[#1e2533] border border-[var(--border-hover)] 
               shadow-[var(--shadow-md)] rounded-lg z-50">

        {results.map((result, index) => (
          <li
            key={index}
            className="p-2 hover:bg-[var(--card-hover)] cursor-pointer rounded-lg transition-colors duration-200 text-sm"
            onClick={() => handleSelectItem(result)}
          >
            <span className="text-[var(--foreground)]">{result}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
</div>


  )
}