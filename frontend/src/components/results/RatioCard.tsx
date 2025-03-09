import { formatters } from "@/utils/formatters";

interface RatioCardProps {
  label: string;
  value: number | string;
  description: string;
}



export const RatioCard = ({ label, value, description }: RatioCardProps) => (
  <div className="group relative metric-card">
    <div className="text-sm text-gray-400">{label}</div>
    <div className="text-xl font-semibold">{typeof value === "number" ? formatters.decimal.format(value) : value}</div>
    <div className="ratio-tooltip">
      {description}
    </div>
  </div>
); 