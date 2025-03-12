'use client'

import Link from 'next/link'
import { LayoutTemplate, Play, Save } from 'lucide-react'
import { AuthButton } from '../AuthButton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SaveDialog } from './SaveDialog'
import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface HeaderProps {
  onRunStrategy: () => void
  onShowTemplates: () => void
  isRunDisabled: boolean
  validationErrors: string[]
  strategyContent: string
}

export function Header({ onRunStrategy, onShowTemplates, isRunDisabled, validationErrors, strategyContent }: HeaderProps) {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-xl h-16  top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Backdrop
          </Link>
          <div className="h-6 w-px bg-border" />
          <button
            onClick={onShowTemplates}
            className="flex items-center text-sm hover:bg-accent/50 px-3 py-2 rounded-lg transition-colors"
          >
            <LayoutTemplate className="w-4 h-4 mr-1.5" />
            Templates
          </button>
        </div>

        <div className="flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
          <div className="flex items-center bg-accent/20 rounded-xl p-2 gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={onRunStrategy}
                    disabled={isRunDisabled}
                    className={`h-8 px-4 rounded-lg transition-colors flex items-center
                      ${isRunDisabled 
                        ? 'bg-blue-600/50 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                  >
                    <Play className="w-4 h-4 mr-1.5" />
                    Run
                  </button>
                </TooltipTrigger>
                {isRunDisabled && validationErrors.length > 0 && (
                  <TooltipContent>
                    <div className="max-w-xs">
                      <p className="font-medium mb-1">Please fix the following:</p>
                      <ul className="list-disc list-inside">
                        {validationErrors.map((error, i) => (
                          <li key={i} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => session ? setIsSaveDialogOpen(true) : undefined}
                    className={`hover:bg-accent/50 h-8 px-3 rounded-lg transition-colors flex items-center ${!session ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    Save
                  </button>
                </TooltipTrigger>
                {!session && (
                  <TooltipContent>
                    <p>Login to save custom strategies</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AuthButton />
        </div>
      </div>

      <SaveDialog 
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        strategyContent={strategyContent}
      />
    </nav>
  )
}