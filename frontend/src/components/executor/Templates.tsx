'use client'

interface TemplatesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TemplatesModal({ isOpen, onClose }: TemplatesModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center">
      <div className="w-full max-w-4xl max-h-[80vh] overflow-auto bg-[var(--card)] rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border)]">
        <div className="border-b border-[var(--border)] p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Strategy Templates</h2>
          <button
            onClick={onClose}
            className="btn-ghost p-2 hover:bg-[var(--card-hover)] rounded-lg"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'Moving Average Crossover',
              'RSI Strategy',
              'MACD Strategy',
              'Bollinger Bands',
              'Mean Reversion',
              'Trend Following'
            ].map((template) => (
              <button
                key={template}
                className="card hover:border-[var(--primary)] hover:shadow-[var(--shadow-glow)] text-left bg-[var(--card-hover)]"
              >
                <h3 className="font-medium mb-2">{template}</h3>
                <p className="text-sm text-[var(--foreground-subtle)]">
                  A basic implementation of the {template.toLowerCase()} strategy.
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}