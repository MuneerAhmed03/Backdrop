import React from "react";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  Target,
  LineChart,
} from "lucide-react";
import { StatCard } from "./StatCard";
import { MetricsGrid } from "./MetricsGrid";
import { PerformanceCharts } from "./PerformanceCharts";
import { mockData } from "./mockData";

export const Result: React.FC = () => {
  const isPositiveReturn = mockData.totalReturn > 0;

  const headerStats = [
    {
      title: "Final Capital",
      value: mockData.finalCapital,
      icon: TrendingUp,
      iconBgColor: "bg-indigo-500/10",
      iconColor: "text-indigo-400",
      valueColor: "text-indigo-400",
      prefix: "$",
    },
    {
      title: "Total Return",
      value: mockData.totalReturnPct.toFixed(2),
      icon: isPositiveReturn ? ArrowUpRight : ArrowDownRight,
      iconBgColor: isPositiveReturn ? "bg-emerald-500/10" : "bg-red-500/10",
      iconColor: isPositiveReturn ? "text-emerald-400" : "text-red-400",
      valueColor: isPositiveReturn ? "text-emerald-400" : "text-red-400",
      prefix: isPositiveReturn ? "+" : "",
      suffix: "%",
    },
    {
      title: "Max Drawdown",
      value: mockData.maxDrawdownPct.toFixed(2),
      icon: ArrowDownRight,
      iconBgColor: "bg-red-500/10",
      iconColor: "text-red-400",
      valueColor: "text-red-400",
      prefix: "-",
      suffix: "%",
    },
  ];

  const riskMetrics = [
    { label: "Sharpe Ratio", value: mockData.sharpeRatio },
    { label: "Sortino Ratio", value: mockData.sortinoRatio },
    {
      label: "Annualized Volatility",
      value: mockData.annualizedVolatility,
      suffix: "%",
    },
  ];

  const performanceMetrics = [
    { label: "Calmar Ratio", value: mockData.calmarRatio },
    { label: "Profit Factor", value: mockData.profitFactor },
    { label: "Win Rate", value: mockData.winRate * 100, suffix: "%" },
  ];

  const tradingStats = [
    { label: "Number of Trades", value: mockData.numTrades },
    { label: "Avg Trade P&L", value: mockData.avgTradePnl, prefix: "$" },
    { label: "Avg Winner", value: mockData.avgWinnerPnl, prefix: "$" },
    { label: "Avg Loser", value: mockData.avgLoserPnl, prefix: "$" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 p-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {headerStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Charts */}
        <PerformanceCharts
          equityCurve={mockData.equityCurve}
          drawdownCurve={mockData.drawdownCurve}
        />

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <MetricsGrid title="Risk Metrics" metrics={riskMetrics} />
          <MetricsGrid
            title="Performance Metrics"
            metrics={performanceMetrics}
          />
          <MetricsGrid title="Trading Statistics" metrics={tradingStats} />
        </div>
      </div>
    </div>
  );
}

export default Result;
