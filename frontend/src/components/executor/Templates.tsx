'use client'

import { Template } from "../../lib/types"
import { useQuery } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

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

export function TemplatesModal({ isOpen, onClose, onSelect }: TemplatesModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)

  const { data: templates, isLoading: isLoadingTemplates, error: templatesError } = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
    enabled: isOpen,
  })

  const { data: selectedTemplate, isLoading: isLoadingTemplate } = useQuery({
    queryKey: ['template', selectedTemplateId],
    queryFn: () => selectedTemplateId ? fetchTemplateById(selectedTemplateId) : null,
    enabled: !!selectedTemplateId
  })

  useEffect(() => {
  console.log("selected template rerender")
    if (selectedTemplate?.code) {
      onSelect(selectedTemplate.code)
      onClose()
    }
  }, [selectedTemplate])

  if (!isOpen) return null

  if (isLoadingTemplate) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading template...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[80vh] overflow-auto bg-card rounded-2xl shadow-lg border border-border animate-slideUp">
        <div className="border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Strategy Templates</h2>
          <button
            onClick={onClose}
            className="hover:bg-accent/50 p-2 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          {isLoadingTemplates ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-card animate-pulse">
                  <div className="h-6 w-3/4 bg-muted rounded mb-2" />
                  <div className="h-4 w-full bg-muted rounded opacity-50" />
                </div>
              ))}
            </div>
          ) : templatesError ? (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load templates. Please try again later.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {templates?.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary hover:shadow-[0_0_15px_rgba(var(--primary),0.1)] transition-all text-left group"
                >
                  <h3 className="font-medium mb-2 group-hover:text-primary transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                  {template.tags && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {template.tags.split(',').map((tag) => (
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}