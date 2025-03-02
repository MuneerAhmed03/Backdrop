import { useRef, useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StrategyResult } from "@/lib/types"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formatters = {
  currency: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }),
  percent: new Intl.NumberFormat('en-IN', { style: 'percent', minimumFractionDigits: 2 }),
  decimal: new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 })
};

const ratioDescriptions = {
  sharpeRatio: "Measures risk-adjusted returns using the risk-free rate and standard deviation of returns",
  calmarRatio: "Compares average annual compounded returns to maximum drawdown risk",
  sortinoRatio: "Similar to Sharpe ratio but only considers downside volatility",
  profitFactor: "Ratio of gross profits to gross losses"
};

const RatioCard = ({ label, value, description }: { label: string; value: number | string ; description: string }) => (
  <div className="group relative metric-card">
    <div className="text-sm text-gray-400">{label}</div>
    <div className="text-xl font-semibold">{typeof value ==="number" ? formatters.decimal.format(value) : value}</div>
    <div className="ratio-tooltip">
      {description}
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="metric-card animate-pulse motion-safe:[animation-duration:3s]">
    <div className="h-4 w-24 bg-gray-700/50 rounded mb-2"></div>
    <div className="h-6 w-32 bg-gray-700/50 rounded"></div>
  </div>
);

const SkeletonChart = () => (
  <div className="h-64 glassmorphism p-4 rounded-lg animate-pulse motion-safe:[animation-duration:3s]">
    <div className="w-full h-full bg-gray-700/50 rounded"></div>
  </div>
);

interface ChartDataPoint {
  date: string;
  equity: number;
  drawdown: number;
}

interface ResultProps {
  data: StrategyResult | null;
  isLoading: boolean;
  onStrategySelect?: (strategy: string) => void;
}

const Index = ({ data, isLoading, onStrategySelect = () => {} }: ResultProps) => {
  const [syncedTooltipIndex, setSyncedTooltipIndex] = useState<number | null>(null);
  const equityChartRef = useRef<any>(null);
  const drawdownChartRef = useRef<any>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    if (data) {
      setChartData(
        data.equityCurve.map((point, index) => ({
          date: new Date(point.date).toLocaleDateString(),
          equity: point.value,
          drawdown: (data.drawdownCurve[index]?.value ?? 0) * 100
        }))
      );
    }
  }, [data]);

  const formatIndianNumber = (value:number) => {
    if (value >= 1_00_00_000) {
      return (value / 1_00_00_000).toFixed(1).replace(/\.0$/, '') + 'Cr'; 
    } else if (value >= 1_00_000) {
      return (value / 1_00_000).toFixed(1).replace(/\.0$/, '') + 'L';
    } else if (value >= 1_000) {
      return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'; 
    }
    return value.toString(); 
  };
  
  const { min, max } = chartData.reduce(
    (acc, d) => ({
      min: Math.min(acc.min, d.equity),
      max: Math.max(acc.max, d.equity),
    }),
    { min: Infinity, max: -Infinity }
  );
  
  const upperMax = Math.ceil(max / 100) * 100; 
  const lowerMin = Math.floor(min/100) * 100;
  const range = upperMax - min;
  const step = Math.ceil(range / 5 / 100) * 100; 
  
  const ticks = [];
  for (let i = lowerMin; i <= upperMax; i += step) {
    ticks.push(i);
  }

  if (!ticks.includes(upperMax)) {
    ticks.push(upperMax); 
  }
  
  
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Backtest Result</h1>
          {/* <Select defaultValue="Loss Cutting" onValueChange={onStrategySelect}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Loss Cutting">Loss Cutting</SelectItem>
              <SelectItem value="Risk Reduction">Risk Reduction</SelectItem>
            </SelectContent>
          </Select> */}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slideUp">
          <div className="metric-card">
            <div className="text-sm text-gray-400">Initial Capital</div>
            <div className="text-xl font-semibold">
              {formatters.currency.format(data.initialCapital)}
            </div>
          </div>
          <div className="metric-card">
            <div className="text-sm text-gray-400">Final Capital</div>
            <div className={`text-2xl font-bold text-profit`}>
              {formatters.currency.format(data.finalCapital)}
            </div>
          </div>
          <div className="metric-card">
            <div className="text-sm text-gray-400">Total Return</div>
            <div className={`text-xl font-semibold ${data.totalReturn >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatters.currency.format(data.totalReturn)}
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
                <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 12 }} />
                <YAxis
                  dataKey="equity"
                  stroke="#6B7280"
                  tickFormatter={(value) => formatIndianNumber(value)}
                  domain={['dataMin', 'dataMax']}
                  padding={{ top: 10 , bottom : 10 }}
                  tick={{ fontSize: 12 }}
                  ticks={ticks}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                  formatter={(value: any) => [
                    formatters.currency.format(value),
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
                <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 12 }} />
                <YAxis
                  dataKey="drawdown" 
                  stroke="#6B7280"
                  tickFormatter={(value) => `${value.toFixed(2)}%`}
                  domain={[
                    (dataMin: number) => Math.floor(dataMin / 5) * 5,
                    (dataMax: number) => Math.ceil(dataMax / 5) * 5
                  ]}
                  padding={{ top: 20 }}
                  tick={{ fontSize: 12 }}
                  interval={0}
                  ticks={(() => {
                    const min = Math.floor(Math.min(...chartData.map(d => d.drawdown)) / 5) * 5;
                    const max = Math.ceil(Math.max(...chartData.map(d => d.drawdown)) / 5) * 5;
                    const ticks = [];
                    for (let i = min; i <= max; i += 5) {
                      ticks.push(i);
                    }
                    return ticks;
                  })()}
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
            <div className="text-xl font-semibold">{data.numTrades}</div>
          </div>
          <div className="metric-card">
            <div className="text-sm text-gray-400">Avg Trade P&L</div>
            <div className={`text-xl font-semibold ${data.avgTradePnl >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatters.currency.format(data.avgTradePnl)}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="metric-card">
            <div className="text-sm text-gray-400">Avg Winner P&L</div>
            <div className="text-xl font-semibold text-profit">
              {typeof data.avgWinnerPnl === "number" ? formatters.currency.format(data.avgWinnerPnl) : data.avgWinnerPnl}
            </div>
          </div>
          <div className="metric-card">
            <div className="text-sm text-gray-400">Avg Loser P&L</div>
            <div className="text-xl font-semibold text-loss">
              {typeof data.avgLoserPnl === "number" ? formatters.currency.format(data.avgLoserPnl) : data.avgLoserPnl}
            </div>
          </div>
          <div className="metric-card">
            <div className="text-sm text-gray-400">Annualized Volatality</div>
            <div className="text-xl font-semibold">{formatters.percent.format(data.annualizedVolatility / 100)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;