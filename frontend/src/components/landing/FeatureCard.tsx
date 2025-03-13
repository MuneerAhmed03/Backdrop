
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

export const FeatureCard = ({ icon: Icon, title, description, index }: FeatureCardProps) => {
  const animationDelay = `${index * 0.1}s`;
  
  return (
    <div 
      className="glassmorphism p-8 rounded-xl card-hover interactive-shadow opacity-0 animate-fade-in-up"
      style={{ animationDelay }}
    >
      <div className="flex items-start">
        <div className="h-12 w-12 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-400/20 mb-5">
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
      </div>
      <h3 className="text-xl font-medium mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;