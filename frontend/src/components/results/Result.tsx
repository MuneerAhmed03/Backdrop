import { useRef, useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StrategyResult } from "@/lib/types"
import { formatNumber } from "@/lib/utils";

const formatters = {
  currency: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
  percent: new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 }),
  decimal: new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
};

const ratioDescriptions = {
  sharpeRatio: "Measures risk-adjusted returns using the risk-free rate and standard deviation of returns",
  calmarRatio: "Compares average annual compounded returns to maximum drawdown risk",
  sortinoRatio: "Similar to Sharpe ratio but only considers downside volatility",
  profitFactor: "Ratio of gross profits to gross losses"
};

const RatioCard = ({ label, value, description }: { label: string; value: number; description: string }) => (
  <div className="group relative metric-card">
    <div className="text-sm text-gray-400">{label}</div>
    <div className="text-xl font-semibold">{formatters.decimal.format(value)}</div>
    <div className="ratio-tooltip">
      {description}
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="metric-card animate-pulse">
    <div className="h-4 w-24 bg-gray-700/50 rounded mb-2"></div>
    <div className="h-6 w-32 bg-gray-700/50 rounded"></div>
  </div>
);

const SkeletonChart = () => (
  <div className="h-64 glassmorphism p-4 rounded-lg animate-pulse">
    <div className="w-full h-full bg-gray-700/50 rounded"></div>
  </div>
);

interface ResultProps {
  data: StrategyResult | null;
  isLoading: boolean;
}

const Index = ({ data, isLoading }: ResultProps) => {
  const [syncedTooltipIndex, setSyncedTooltipIndex] = useState<number | null>(null);
  const equityChartRef = useRef<any>(null);
  const drawdownChartRef = useRef<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      setChartData(data.equityCurve.map((equity, index) => ({
        date: new Date(2023, 0, index).toLocaleDateString(),
        equity,
        drawdown: data.drawdownCurve[index]
      })));
    }
  }, [data]);

  const handleMouseMove = (ref: any) => (props: any) => {
    if (props.activeTooltipIndex !== syncedTooltipIndex) {
      setSyncedTooltipIndex(props.activeTooltipIndex);
      
      if (ref.current) {
        const chart = ref.current;
        if (chart.state && props.activeTooltipIndex !== null) {
          chart.state.activeTooltipIndex = props.activeTooltipIndex;
          chart.forceUpdate();
        }
      }
    }
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 animate-fadeIn">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonChart />
            <SkeletonChart />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slideUp">
          <div className="metric-card">
            <div className="text-sm text-gray-400">Initial Capital</div>
            <div className="text-xl font-semibold">
              {formatNumber(data.initialCapital, { style: 'currency', currency: 'USD' })}
            </div>
          </div>
          <div className="metric-card">
            <div className="text-sm text-gray-400">Final Capital</div>
            <div className={`text-2xl font-bold text-profit`}>
              {formatNumber(data.finalCapital, { style: 'currency', currency: 'USD' })}
            </div>
          </div>
          <div className="metric-card">
            <div className="text-sm text-gray-400">Total Return</div>
            <div className={`text-xl font-semibold ${data.totalReturn >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatNumber(data.totalReturn, { style: 'currency', currency: 'USD' })}
              <span className="text-sm ml-2">
                ({formatters.percent.format(data.totalReturnPct / 100)})
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 glassmorphism p-4 rounded-lg">
            <ResponsiveContainer>
              <AreaChart
                data={chartData}
                onMouseMove={handleMouseMove(drawdownChartRef)}
                ref={equityChartRef}
              >
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis 
                  stroke="#6B7280"
                  tickFormatter={(value) => formatNumber(value, { style: 'currency', currency: 'USD' })}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                  formatter={(value: any) => [
                    formatNumber(value, { style: 'currency', currency: 'USD' }),
                    "Equity"
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke="#6366F1"
                  fill="url(#equityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="h-64 glassmorphism p-4 rounded-lg">
            <ResponsiveContainer>
              <AreaChart
                data={chartData}
                onMouseMove={handleMouseMove(equityChartRef)}
                ref={drawdownChartRef}
              >
                <defs>
                  <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis 
                  stroke="#6B7280"
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                  formatter={(value: any) => [
                    `${value.toFixed(2)}%`,
                    "Drawdown"
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="drawdown"
                  stroke="#EF4444"
                  fill="url(#drawdownGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <RatioCard
            label="Sharpe Ratio"
            value={data.sharpeRatio}
            description={ratioDescriptions.sharpeRatio}
          />
          <RatioCard
            label="Calmar Ratio"
            value={data.calmarRatio}
            description={ratioDescriptions.calmarRatio}
          />
          <RatioCard
            label="Sortino Ratio"
            value={data.sortinoRatio}
            description={ratioDescriptions.sortinoRatio}
          />
          <RatioCard
            label="Profit Factor"
            value={data.profitFactor}
            description={ratioDescriptions.profitFactor}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="metric-card">
            <div className="text-sm text-gray-400">Win Rate</div>
            <div className="text-xl font-semibold">{formatters.percent.format(data.winRate / 100)}</div>
          </div>
          <div className="metric-card">
            <div className="text-sm text-gray-400">Max Drawdown</div>
            <div className="text-xl font-semibold text-loss">
              {formatters.percent.format(data.maxDrawdownPct / 100)}
            </div>
          </div>
          <div className="metric-card">
            <div className="text-sm text-gray-400">Total Trades</div>
            <div className="text-xl font-semibold">{formatNumber(data.numTrades)}</div>
          </div>
          <div className="metric-card">
            <div className="text-sm text-gray-400">Avg Trade P&L</div>
            <div className={`text-xl font-semibold ${data.avgTradePnl >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatNumber(data.avgTradePnl, { style: 'currency', currency: 'USD' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;