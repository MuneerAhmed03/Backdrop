import React from "react";
import { Info } from "lucide-react";

const ratioDescriptions: Record<string, string> = {
  sharpeRatio:
    "Measures risk-adjusted returns. Higher is better. Values > 1 are good, > 2 are very good.",
  calmarRatio:
    "Measures return relative to maximum drawdown. Higher is better. Values > 2 are considered good.",
  sortinoRatio:
    "Similar to Sharpe but only considers downside volatility. Higher is better. Values > 2 are good.",
  profitFactor:
    "Ratio of gross profits to gross losses. Values > 1.5 are considered good.",
  winRate:
    "Percentage of trades that are profitable. Generally, > 50% is considered good.",
  avgTradePnl: "Average profit/loss per trade across all trades.",
  avgWinnerPnl: "Average profit per winning trade.",
  avgLoserPnl: "Average loss per losing trade.",
  annualizedVolatility: "Yearly standard deviation of returns, measuring risk.",
};

interface RatioTooltipProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
}

export const RatioTooltip: React.FC<RatioTooltipProps> = ({
  label,
  value,
  prefix = "",
  suffix = "",
}) => {
  const tooltipKey = label.toLowerCase().replace(/\s+/g, "");
  const hasTooltip = tooltipKey in ratioDescriptions;

  return (
    <div className="relative group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">{label}</span>
          {hasTooltip && <Info size={16} className="text-gray-500" />}
        </div>
        <span className="font-bold text-xl">
          {prefix}
          {value.toFixed(2)}
          {suffix}
        </span>
      </div>
      {hasTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-gray-700 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 w-72 pointer-events-none shadow-xl border border-gray-600">
          {ratioDescriptions[tooltipKey]}
        </div>
      )}
    </div>
  );
};
