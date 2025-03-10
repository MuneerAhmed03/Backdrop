import { useRef, useState, useEffect, useMemo } from "react";
import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StrategyResult } from "@/lib/types";
import { formatters, formatIndianNumber } from "@/utils/formatters";
import { safeCalculations } from "@/utils/calculations";
import { ratioDescriptions } from "@/components/results/ratioDescriptions";
import { RatioCard } from "./RatioCard";
import { SkeletonCard, SkeletonChart } from "./LoadingStates";
import { ResultErrorBoundary } from "./ErrorBoundary";
import { ChartDataPoint } from "@/lib/types";


interface ResultProps {
  data: StrategyResult | null;
  isLoading: boolean;
  onStrategySelect?: (strategy: string) => void;
}

const NoDataState = () => (
  <div className="min-h-screen bg-background text-foreground p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-500">No Trading Activity</h2>
        <p className="text-sm text-blue-400">
          There were no trades executed during the selected time period. 
          Try adjusting your strategy parameters or date range.
        </p>
      </div>
    </div>
  </div>
);

const Result = ({ data, isLoading, onStrategySelect = () => { } }: ResultProps) => {
  const [syncedTooltipIndex, setSyncedTooltipIndex] = useState<number | null>(null);
  const equityChartRef = useRef<any>(null);
  const drawdownChartRef = useRef<any>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const processedChartData = useMemo(() => {
    if (!data?.equityCurve) return [];
    return data.equityCurve.map((point, index) => ({
      date: new Date(point.date).toLocaleDateString(),
      equity: point.value,
      drawdown: (data.drawdownCurve[index]?.value ?? 0) * 100
    }));
  }, [data]);

  useEffect(() => {
    if (data) {
      setChartData(processedChartData);
    }
  }, [data, processedChartData]);

  const { min, max } = safeCalculations.getMinMax(chartData);

  const upperMax = min === max ? max + 100 : Math.ceil(max / 100) * 100;
  const lowerMin = min === max ? min - 100 : Math.floor(min / 100) * 100;
  const range = upperMax - lowerMin;
  const step = Math.max(Math.ceil(range / 5 / 100) * 100, 100);

  const ticks = useMemo(() => {
    if (upperMax === lowerMin) {
      return [lowerMin - step, lowerMin, lowerMin + step];
    }
    
    const result = [];
    for (let i = lowerMin; i <= upperMax && result.length < 10; i += step) {
      result.push(i);
    }
    if (!result.includes(upperMax) && result.length < 10) {
      result.push(upperMax);
    }
    return result;
  }, [upperMax, lowerMin, step]);

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

  const hasNoTrades = useMemo(() => {
    if (!data) return false;
    return data.numTrades === 0 && data.totalReturn === 0;
  }, [data]);

  if (isLoading) {
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
        </div>
      </div>
    );
  }

  if (!data) return null;
  if (hasNoTrades) return <NoDataState />;

  return (
    <ResultErrorBoundary>
      <div className="min-h-screen bg-background text-foreground p-6 animate-fadeIn">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Backtest Result</h1>
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
                  onMouseMove={handleMouseMove(equityChartRef)}
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
                    padding={{ top: 10, bottom: 10 }}
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
                  onMouseMove={handleMouseMove(drawdownChartRef)}
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
                      (dataMin: number) => Math.min(0, Math.floor(dataMin / 5) * 5),
                      (dataMax: number) => Math.max(0, Math.ceil(dataMax / 5) * 5)
                    ]}
                    padding={{ top: 20 }}
                    tick={{ fontSize: 12 }}
                    interval={0}
                    ticks={(() => {
                      const values = chartData.map(d => d.drawdown);
                      return safeCalculations.calculateDrawdownTicks(values);
                    })()}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.9)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                    formatter={(value: any) => [
                      `${Number(value).toFixed(2)}%`,
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
    </ResultErrorBoundary>
  );
};

export default Result;