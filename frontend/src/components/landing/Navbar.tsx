import { useState, useEffect } from "react";
import { ChartBar, LineChart, Laptop, Menu, X } from "lucide-react";
import { AuthButton } from "../AuthButton";
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

        <AuthButton/>
      </div>
    </header>
  );
};

export default NavBar;
