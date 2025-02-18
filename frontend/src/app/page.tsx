import Link from 'next/link'
import { AuthButton } from '@/components/AuthButton'
import { ArrowRight, Code2, LineChart, ChartBar,Rocket} from 'lucide-react'

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glassmorphism">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold">Backdrop</div>
          <AuthButton/>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8 animate-fadeIn">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Python Strategy Backtesting Platform
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Test your Python trading strategies against historical EOD data with institutional-grade analytics and visualization
            </p>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 px-6 py-3 text-lg font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glassmorphism p-6 rounded-lg space-y-4 animate-slideUp" style={{animationDelay: "0.1s"}}>
              <div className="h-12 w-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <ChartBar className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold">Historical EOD Data</h3>
              <p className="text-gray-400">
                Access comprehensive end-of-day market data to thoroughly test your trading strategies
              </p>
            </div>
            
            <div className="glassmorphism p-6 rounded-lg space-y-4 animate-slideUp" style={{animationDelay: "0.2s"}}>
              <div className="h-12 w-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <LineChart className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold">Python Integration</h3>
              <p className="text-gray-400">
                Write and test your strategies in Python with our intuitive API and comprehensive documentation
              </p>
            </div>
            
            <div className="glassmorphism p-6 rounded-lg space-y-4 animate-slideUp" style={{animationDelay: "0.3s"}}>
              <div className="h-12 w-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <Rocket className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold">Performance Analytics</h3>
              <p className="text-gray-400">
                Get detailed insights with Sharpe ratio, drawdown analysis, and other key performance metrics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="glassmorphism rounded-lg p-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Start Backtesting Your Strategies</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Transform your Python trading strategies into quantifiable results with our professional backtesting platform
            </p>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 px-6 py-3 text-lg font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Try Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;