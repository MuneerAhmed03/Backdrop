import { ArrowRight } from "lucide-react";
import Link from "next/link"

interface GradientButtonProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  showArrow?: boolean;
}

export const GradientButton = ({ 
  to, 
  children, 
  className = "", 
  showArrow = true 
}: GradientButtonProps) => {
  return (
    <Link
      href={to}
      className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg relative overflow-hidden group ${className}`}
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-blue-500 opacity-100"></span>
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-700 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      <span className="absolute inset-[-2px] bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-lg opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 group-hover:duration-200"></span>
      
      <span className="relative font-medium text-white flex items-center gap-2">
        {children}
        {showArrow && (
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </span>
    </Link>
  );
};

export default GradientButton;
