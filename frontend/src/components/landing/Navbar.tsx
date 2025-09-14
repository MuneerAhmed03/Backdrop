import { useState, useEffect } from "react";
import { AuthButton } from "../AuthButton";
import Link from "next/link";
import Image from "next/image";

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
          <Image
            src="/backdrop.svg"
            alt="Backdrop logo"
            width={32}
            height={32}
            className="h-8 w-8 rounded-md"
            priority
          />
          <span className="text-xl font-medium tracking-tight">Backdrop</span>
        </Link>

        <AuthButton/>
      </div>
    </header>
  );
};

export default NavBar;
