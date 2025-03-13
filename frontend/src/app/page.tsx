"use client"
import { useEffect, useRef } from "react";
import { NavBar } from "@/components/landing/Navbar";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { GradientButton } from "@/components/landing/GradientButton";
import { ArrowRight, Code2, LineChart, ChartBar, Rocket, CheckCircle2, Database, Lock } from "lucide-react";
import Link  from  "next/link";

const Index = () => {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!gridRef.current) return;
      
      const rect = gridRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const moveX = (x - centerX) / 20;
      const moveY = (y - centerY) / 20;
      
      gridRef.current.style.transform = `perspective(1000px) rotateX(${-moveY * 0.5}deg) rotateY(${moveX * 0.5}deg)`;
    };
    
    const gridElement = gridRef.current;
    
    if (gridElement) {
      gridElement.addEventListener("mousemove", handleMouseMove);
      
      return () => {
        gridElement.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, []);

  const features = [
    {
      icon: ChartBar,
      title: "Historical EOD Data",
      description: "Access comprehensive end-of-day market data to thoroughly test your trading strategies across multiple timeframes and market conditions."
    },
    {
      icon: Code2,
      title: "Python Integration",
      description: "Write and test your strategies in Python with our intuitive API and comprehensive documentation. Import your favorite libraries like pandas, numpy, and scikit-learn."
    },
    {
      icon: LineChart,
      title: "Performance Analytics",
      description: "Get detailed insights with Sharpe ratio, drawdown analysis, alpha, beta, and other key performance metrics to refine your strategies."
    },
    {
      icon: Database,
      title: "Data Warehouse",
      description: "Store and manage your backtesting results, compare multiple strategy variations, and track performance improvements over time."
    },
    {
      icon: Lock,
      title: "Secure Environment",
      description: "Your strategies and data are protected with enterprise-grade security. Run your tests in isolated environments without worrying about data leakage."
    },
    {
      icon: Rocket,
      title: "Strategy Deployment",
      description: "Seamlessly transition from backtesting to paper trading and live deployment with our integrated workflow and API connections."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <NavBar />
      

      <section className="relative pt-32 lg:pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 radial-gradient opacity-70"></div>
        <div className="absolute inset-0 grid-pattern"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col items-center text-center space-y-8 opacity-0 animate-fade-in">
            <div className="px-4 py-1.5 rounded-full glassmorphism text-xs font-medium uppercase tracking-wider mb-2 opacity-80">
              Professional Python Backtesting
            </div>
            
            <h1 className="text-4xl md:text-7xl font-bold leading-tight tracking-tight">
              <span className="text-gradient">Backtest</span> your <br className="hidden md:block" />
              trading strategies
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform your Python trading ideas into quantifiable results with our professional backtesting platform. Test, iterate, and optimize with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <GradientButton to="/dashboard" className="text-base font-medium">
                Start backtesting now
              </GradientButton>
              
              <Link href="/demo" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-base font-medium border border-white/10 hover:bg-white/5 transition-colors">
                Watch demo
              </Link>
            </div>
          </div>
          

          <div 
            ref={gridRef}
            className="mt-20 lg:mt-24 relative max-w-3xl mx-auto opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.3s", transformStyle: "preserve-3d", transition: "transform 0.1s ease" }}
          >
            <div className="glassmorphism rounded-2xl overflow-hidden p-1 interactive-shadow">
              <div className="bg-black/40 rounded-xl overflow-hidden">
                <div className="h-[500px] bg-black/80 rounded-lg relative">
                  <div className="absolute top-0 left-0 right-0 h-10 bg-black/80 flex items-center px-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
                    </div>
                    <div className="mx-auto text-xs text-white/50">strategy_backtest.py</div>
                  </div>
                  
                  <div className="pt-12 px-6 text-left font-mono text-sm text-blue-200/90 animate-fade-in" style={{ animationDelay: "0.6s" }}>
                    <p><span className="text-pink-400">import</span> <span className="text-blue-300">pandas</span> <span className="text-pink-400">as</span> <span className="text-blue-300">pd</span></p>
                    <p><span className="text-pink-400">import</span> <span className="text-blue-300">numpy</span> <span className="text-pink-400">as</span> <span className="text-blue-300">np</span></p>
                    <p><span className="text-pink-400">from</span> <span className="text-blue-300">backdrop</span> <span className="text-pink-400">import</span> <span className="text-blue-300">Strategy, Backtest</span></p>
                    <br />
                    <p><span className="text-pink-400">class</span> <span className="text-yellow-300">MACrossoverStrategy</span>(Strategy):</p>
                    <p className="pl-4"><span className="text-pink-400">def</span> <span className="text-yellow-200">__init__</span>(self):</p>
                    <p className="pl-8">self.short_window = <span className="text-green-300">20</span></p>
                    <p className="pl-8">self.long_window = <span className="text-green-300">50</span></p>
                    <br />
                    <p className="pl-4"><span className="text-pink-400">def</span> <span className="text-yellow-200">generate_signals</span>(self, data):</p>
                    <p className="pl-8">signals = pd.DataFrame(index=data.index)</p>
                    <p className="pl-8">signals['signal'] = <span className="text-green-300">0.0</span></p>
                    <br />
                    <p className="pl-8">signals['short_ma'] = data['close'].rolling(window=self.short_window).mean()</p>
                    <p className="pl-8">signals['long_ma'] = data['close'].rolling(window=self.long_window).mean()</p>
                    <br />
                    <p className="pl-8">signals['signal'] = np.where(signals['short_ma'] {'>'} signals['long_ma'], <span className="text-green-300">1.0</span>, <span className="text-green-300">0.0</span>)</p>
                    <p className="pl-8">signals['positions'] = signals['signal'].diff()</p>
                    <br />
                    <p className="pl-8"><span className="text-pink-400">return</span> signals</p>
                  </div>
                </div>
              </div>
            </div>
            

            <div className="absolute -bottom-10 left-0 right-0 h-10 blur-md opacity-30 bg-gradient-to-b from-blue-500 to-transparent"></div>
          </div>
        </div>
      </section>
      
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 opacity-0 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Advanced Trading Strategy Tools</h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to develop, test, and refine your quantitative trading strategies in one powerful platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard 
                key={i}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>
      
      
      <section className="py-20 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <div className="glassmorphism rounded-2xl p-10 opacity-0 animate-fade-in-up">
            <div className="flex flex-col md:flex-row gap-10">
              <div className="w-full md:w-1/3 flex flex-col justify-center">
                <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-400/20 flex items-center justify-center mb-4">
                  <div className="text-2xl font-bold text-blue-400">"</div>
                </div>
                <div className="font-medium text-lg mb-1">John Doe</div>
                <div className="text-muted-foreground text-sm">Quantitative Analyst, Hedge Fund</div>
              </div>
              
              <div className="w-full md:w-2/3">
                <p className="text-xl leading-relaxed text-muted-foreground">
                  "Backdrop has completely transformed how we develop and test our trading strategies. The platform's speed and reliability allow us to iterate quickly, while the comprehensive metrics give us confidence in our strategy performance."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="glassmorphism rounded-2xl p-12 lg:p-20 text-center space-y-8 opacity-0 animate-fade-in-up">
            <h2 className="text-3xl md:text-5xl font-bold">Ready to transform your trading strategies?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join traders and quants who use Backdrop to build, test, and deploy winning strategies.
            </p>
            
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
              <GradientButton to="/dashboard" className="text-base font-medium">
                Start backtesting for free
              </GradientButton>
              
              <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-base font-medium border border-white/10 hover:bg-white/5 transition-colors">
                Talk to our team
              </Link>
            </div>
          </div>
        </div>
      </section>
      

      <footer className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Backdrop. All rights reserved.
            </div>
            
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
