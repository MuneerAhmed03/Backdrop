import Link from 'next/link'
import { AuthButton } from '@/components/AuthButton'
import { ArrowRight, Code2, LineChart, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-[var(--border)] bg-[var(--card)] backdrop-blur-xl fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] bg-clip-text text-transparent">
            Backdrop
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/docs" className="btn-ghost">
              Docs
            </Link>
            <AuthButton />
          </div>
        </div>
      </nav>

      <section className="flex-1 pt-28 lg:pt-40 pb-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_65%)] opacity-[0.03] blur-3xl" />
          <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-b from-transparent to-[var(--background-subtle)]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground-subtle)] bg-clip-text text-transparent leading-tight">
              Backtest Trading Strategies with Precision
            </h1>
            <p className="text-lg sm:text-xl text-[var(--foreground-subtle)] mb-12 leading-relaxed max-w-2xl mx-auto">
              Test your strategies on historical Indian stock market data using Python.
              Get accurate insights and optimize your trading performance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Link 
                href="/executor" 
                className="btn-primary text-base w-full sm:w-auto px-8 py-6 h-auto shadow-[var(--shadow-glow)]"
              >
                Start Building
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                href="/demo" 
                className="btn-secondary text-base w-full sm:w-auto px-8 py-6 h-auto"
              >
                Try Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 relative section-transition">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--primary)_0%,_transparent_70%)] opacity-[0.03] blur-3xl" />
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[var(--background-subtle)] to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[var(--background)]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-2xl mx-auto text-center mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground-subtle)] bg-clip-text text-transparent mt-8">
              Professional Trading Tools
            </h2>
            <p className="mt-4 text-[var(--foreground-subtle)]">
              Everything you need to build and test your trading strategies
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            <div className="card group hover:scale-[1.02] transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Code2 className="w-7 h-7 text-[var(--primary)]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Python Code Editor</h3>
              <p className="text-[var(--foreground-subtle)]">
                Write and test your strategies using our advanced Monaco-based code editor with Python support.
              </p>
            </div>
            <div className="card group hover:scale-[1.02] transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-7 h-7 text-[var(--primary)]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Template Strategies</h3>
              <p className="text-[var(--foreground-subtle)]">
                Get started quickly with our collection of proven trading strategies and templates.
              </p>
            </div>
            <div className="card group hover:scale-[1.02] transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <LineChart className="w-7 h-7 text-[var(--primary)]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Historical EOD Data</h3>
              <p className="text-[var(--foreground-subtle)]">
                Access comprehensive historical data for Indian markets with OHLC prices.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 relative border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-[var(--foreground-subtle)]">
               Backdrop
            </div>
            <div className="flex gap-6 sm:gap-8">
              <Link href="/about" className="text-sm text-[var(--foreground-subtle)] hover:text-[var(--foreground)] transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-sm text-[var(--foreground-subtle)] hover:text-[var(--foreground)] transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
