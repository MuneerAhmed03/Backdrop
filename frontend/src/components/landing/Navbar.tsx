import { useState, useEffect } from "react";
import { ChartBar, LineChart, Laptop, Menu, X } from "lucide-react";
import Link  from "next/link";

export const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "py-3 glassmorphism shadow-lg"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8 flex items-center justify-center rounded-md bg-blue-600/20 border border-blue-400/20">
            <LineChart className="w-4 h-4 text-blue-400 absolute animate-pulse-soft" />
            <ChartBar className="w-4 h-4 text-blue-500 animate-pulse-soft" style={{ animationDelay: "1s" }} />
          </div>
          <span className="text-xl font-medium tracking-tight">Backdrop</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Documentation
          </Link>
          <Link href="/dashboard" className="text-sm px-4 py-2 rounded-md bg-blue-600/90 hover:bg-blue-600 transition-colors">
            Dashboard
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden glassmorphism mt-1 animate-fade-in-down">
          <div className="px-6 py-4 flex flex-col space-y-4">
            <Link href="/features" className="py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Documentation
            </Link>
            <Link href="/dashboard" className="py-2 text-sm text-center rounded-md bg-blue-600/90 hover:bg-blue-600 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;
