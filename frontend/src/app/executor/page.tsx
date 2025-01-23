'use client'

import { useState, useCallback, useEffect } from 'react'
import { CodeEditor } from '@/components/executor/CodeEditor'
import { Header } from '@/components/executor/Header'
import { TemplatesModal } from '@/components/executor/Templates'
import { BookOpen, ChevronRight, Settings2 } from 'lucide-react'
import DebouncedSearch from "@/components/executor/SearchBar"

const DEFAULT_CODE = `# 

def handle_data(context, data):
    ""
      data: panda dataframe for selected instrument's data
    ""`

export default function Executor() {
  const [showTemplates, setShowTemplates] = useState(false)
  const [showParameters, setShowParameters] = useState(true)
  const [code, setCode] = useState(DEFAULT_CODE)
  const [result, setResult] = useState<string | null>(null)
  const [panelWidth, setPanelWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }

  const handleMouseUp = () => {
    setIsResizing(false)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return
      
      const newWidth = window.innerWidth - e.clientX
      if (newWidth > 280 && newWidth < 600) {
        setPanelWidth(newWidth)
      }
    },
    [isResizing]
  )

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, handleMouseMove])

  const handleRunStrategy = async () => {
    // TODO: Implement strategy execution
    setResult(JSON.stringify({
      returns: 15.7,
      sharpe_ratio: 1.2,
      max_drawdown: -8.5,
      trades: 24
    }, null, 2))
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[var(--background)] to-[var(--background-subtle)]">
      <Header onRunStrategy={handleRunStrategy} onShowTemplates={() => setShowTemplates(true)} />

      <div className="flex-1 flex mt-16">
        <div className="flex-1 p-4 min-w-0">
          <div className="w-full h-full rounded-2xl border border-[var(--border)] bg-[var(--card)] backdrop-blur-xl overflow-hidden shadow-[var(--shadow-lg)]">
            <CodeEditor value={code} onChange={setCode} />
          </div>
        </div>

        <div
          className="resizer"
          onMouseDown={handleMouseDown}
        />

        <div 
          style={{ width: showParameters ? panelWidth : 0 }}
          className={`border-l border-[var(--border)] bg-[var(--card)] backdrop-blur-xl transition-all duration-300 ease-in-out ${
            showParameters ? 'translate-x-0' : 'translate-x-full'
          } ${isResizing ? 'transition-none' : ''}`}
        >
          <div className="h-12 border-b border-[var(--border)] flex items-center justify-between px-4">
            <div className="flex items-center">
              <Settings2 className="w-4 h-4 mr-2 text-[var(--foreground-subtle)]" />
              <span className="font-medium">Parameters</span>
            </div>
            <button
              onClick={() => setShowParameters(!showParameters)}
              className="btn-ghost p-1 hover:bg-[var(--card-hover)] rounded-lg"
            >
              <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${showParameters ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
            {result ? (
              <div className="space-y-6">
                <h3 className="font-medium text-lg">Results</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="card bg-[var(--card-hover)]">
                    <div className="text-2xl font-bold text-[var(--success)]">+15.7%</div>
                    <div className="text-sm text-[var(--foreground-subtle)]">Returns</div>
                  </div>
                  <div className="card bg-[var(--card-hover)]">
                    <div className="text-2xl font-bold">1.2</div>
                    <div className="text-sm text-[var(--foreground-subtle)]">Sharpe Ratio</div>
                  </div>
                  <div className="card bg-[var(--card-hover)]">
                    <div className="text-2xl font-bold text-[var(--error)]">-8.5%</div>
                    <div className="text-sm text-[var(--foreground-subtle)]">Max Drawdown</div>
                  </div>
                  <div className="card bg-[var(--card-hover)]">
                    <div className="text-2xl font-bold">24</div>
                    <div className="text-sm text-[var(--foreground-subtle)]">Total Trades</div>
                  </div>
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="btn-secondary w-full"
                >
                  Edit Parameters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Intrument</label>
                  <DebouncedSearch/>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time Period</label>
                  <select className="input">
                    <option>Last 1 Year</option>
                    <option>Last 2 Years</option>
                    <option>Last 5 Years</option>
                    <option>Custom Range</option>
                  </select>   
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Initial Capital</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="Enter amount"
                    defaultValue={100000}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Risk Per Trade (%)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="Enter percentage"
                    defaultValue={1}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <TemplatesModal isOpen={showTemplates} onClose={() => setShowTemplates(false)} />
    </div>
  )
}