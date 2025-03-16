'use client'

import { Template, SavedStrategy } from "../../lib/types"
import { useQuery } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"

interface TemplatesModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (code:string) => void
}

const fetchTemplates = async (): Promise<Template[]> => {
  const response = await fetch('http://localhost:8001/strategy/templates/')
  if (!response.ok) {
    throw new Error('Failed to fetch templates')
  }
  return response.json()
}

const fetchTemplateById = async (id: number): Promise<{code : string}> => {
  const response = await fetch(`http://localhost:8001/strategy/template/${id}/`)
  if (!response.ok) {
    throw new Error('Failed to fetch template')
  }
  return response.json()
}

const fetchSavedStrategies = async (token: string): Promise<SavedStrategy[]> => {
  const response = await fetch('http://localhost:8001/strategy/retrieve', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  if (!response.ok) {
    throw new Error('Failed to fetch saved strategies')
  }
  return response.json()
}

const fetchSavedStrategyById = async (id: number, token: string): Promise<{code: string}> => {
  const response = await fetch(`http://localhost:8001/strategy/retrieve/${id}/`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  if (!response.ok) {
    throw new Error('Failed to fetch saved strategy')
  }
  return response.json()
}

export function TemplatesModal({ isOpen, onClose, onSelect }: TemplatesModalProps) {
  const { data: session } = useSession()
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [selectedSavedId, setSelectedSavedId] = useState<number | null>(null)
  const [showSaved, setShowSaved] = useState(false)

  const { data: templates, isLoading: isLoadingTemplates, error: templatesError } = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
    enabled: isOpen && !showSaved,
    staleTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const { data: savedStrategies, isLoading: isLoadingSaved, error: savedError } = useQuery({
    queryKey: ['saved-strategies'],
    queryFn: () => session?.accessToken ? fetchSavedStrategies(session.accessToken) : Promise.resolve([]),
    enabled: isOpen && showSaved && !!session?.accessToken,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const { data: selectedTemplate, isLoading: isLoadingTemplate } = useQuery({
    queryKey: ['template', selectedTemplateId],
    queryFn: () => selectedTemplateId ? fetchTemplateById(selectedTemplateId) : null,
    enabled: !!selectedTemplateId,
    staleTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const { data: selectedSaved, isLoading: isLoadingSavedStrategy } = useQuery({
    queryKey: ['saved-strategy', selectedSavedId],
    queryFn: () => selectedSavedId && session?.accessToken ? 
      fetchSavedStrategyById(selectedSavedId, session.accessToken) : null,
    enabled: !!selectedSavedId && !!session?.accessToken,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (selectedTemplate?.code) {
      onSelect(selectedTemplate.code)
      onClose()
    }
  }, [selectedTemplate])

  useEffect(() => {
    if (selectedSaved?.code) {
      onSelect(selectedSaved.code)
      onClose()
    }
  }, [selectedSaved])

  if (!isOpen) return null

  if (isLoadingTemplate || isLoadingSavedStrategy) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading strategy...</p>
        </div>
      </div>
    )
  }

  const renderSkeletons = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="glassmorphism p-4 rounded-xl animate-pulse">
          <div className="h-6 w-3/4 bg-muted rounded mb-2" />
          <div className="h-4 w-full bg-muted rounded opacity-50" />
        </div>
      ))}
    </div>
  )

  const renderStrategyCard = (item: Template | SavedStrategy, onClick: () => void) => {
    const isTemplate = 'tags' in item
    
    return (
      <button
        key={item.id}
        onClick={onClick}
        className="neo-blur p-4 rounded-xl card-hover text-left group"
      >
        <h3 className="font-medium mb-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {item.description}
        </p>
        {isTemplate && item.tags && (
          <div className="mt-3 flex flex-wrap gap-2">
            {item.tags.split(',').map((tag: string) => (
              <span 
                key={tag} 
                className="px-2 py-1 text-xs rounded-full bg-accent/50 text-muted-foreground"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
      </button>
    )
  }

  const renderContent = () => {
    const isLoading = showSaved ? isLoadingSaved : isLoadingTemplates
    const error = showSaved ? savedError : templatesError
    const data = showSaved ? savedStrategies : templates

    if (isLoading) return renderSkeletons()

    if (error) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          Failed to load {showSaved ? 'saved strategies' : 'templates'}. Please try again later.
        </div>
      )
    }

    if (!data?.length) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {showSaved ? 
            'You don\'t have any saved strategies yet.' : 
            'No templates available.'}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {data.map((item) => renderStrategyCard(
          item, 
          () => showSaved ? setSelectedSavedId(item.id) : setSelectedTemplateId(item.id)
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-4xl max-h-[80vh] overflow-auto glassmorphism rounded-2xl animate-scale-up">
        <div className="border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSaved(false)}
              className={`px-3 py-1.5 rounded-md transition-colors ${!showSaved ? 'bg-primary/10 text-primary' : 'hover:bg-accent/50'}`}
            >
              Templates
            </button>
            {session && (
              <button
                onClick={() => setShowSaved(true)}
                className={`px-3 py-1.5 rounded-md transition-colors ${showSaved ? 'bg-primary/10 text-primary' : 'hover:bg-accent/50'}`}
              >
                Saved Strategies
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="hover:bg-accent/50 p-2 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}