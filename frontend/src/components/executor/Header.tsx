'use client'

import Link from 'next/link'
import { LayoutTemplate, Play, Save } from 'lucide-react'
import { AuthButton } from '../AuthButton'

interface HeaderProps {
  onRunStrategy: () => void
  onShowTemplates: () => void
}

export function Header({ onRunStrategy, onShowTemplates }: HeaderProps) {
  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-xl h-16 fixed top-0 w-full z-50">
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
            <button 
              onClick={onRunStrategy}
              className="bg-blue-600 hover:bg-blue-700  h-8 px-4 rounded-lg transition-colors flex items-center"
            >
              <Play className="w-4 h-4 mr-1.5" />
              Run
            </button>
            <button className="hover:bg-accent/50 h-8 px-3 rounded-lg transition-colors flex items-center">
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AuthButton />
        </div>
      </div>
    </nav>
  )
}