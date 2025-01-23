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
    <nav className="border-b border-[var(--border)] bg-[var(--card)] backdrop-blur-xl h-16 fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] bg-clip-text text-transparent">
            Backdrop
          </Link>
          <div className="h-6 w-px bg-[var(--border)]" />
          <button
            onClick={onShowTemplates}
            className="btn-ghost text-sm"
          >
            <LayoutTemplate className="w-4 h-4 mr-1.5" />
            Templates
          </button>
        </div>

        <div className="flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
          <div className="flex items-center bg-[var(--card-hover)] rounded-xl p-2 gap-2">
            <button 
              onClick={onRunStrategy}
              className="btn-primary h-8 px-4 shadow-none"
            >
              <Play className="w-4 h-4 mr-1.5" />
              Run
            </button>
            <button className="btn-ghost h-8 px-3 hover:bg-[var(--card)] shadow-none">
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