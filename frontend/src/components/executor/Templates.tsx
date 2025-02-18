'use client'

interface TemplatesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TemplatesModal({ isOpen, onClose }: TemplatesModalProps) {
  if (!isOpen) return null

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
                className="p-4 rounded-xl border border-border bg-card hover:border-primary hover:shadow-[0_0_15px_rgba(var(--primary),0.1)] transition-all text-left group"
              >
                <h3 className="font-medium mb-2 group-hover:text-primary transition-colors">{template}</h3>
                <p className="text-sm text-muted-foreground">
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