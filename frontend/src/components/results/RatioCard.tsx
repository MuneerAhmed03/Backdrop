import { formatters } from "@/utils/formatters";

interface RatioCardProps {
  title: string;
  value: number | string;
  description?: string;
}

export const RatioCard = ({ title, value, description }: RatioCardProps) => (
  <div className="metric-card group relative">
    <div className="text-sm text-muted-foreground">{title}</div>
    <div className="text-xl font-semibold">{typeof value === "number" ? formatters.decimal.format(value) : value}</div>
    {description && (
      <div className="ratio-tooltip">
        {description}
      </div>
    )}
  </div>
); 