import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";

interface ChartData {
  date: string;
  equity: number;
  drawdown: number;
}

interface SyncedChartsProps {
  equityCurve: number[];
  drawdownCurve: number[];
}

export const SyncedCharts: React.FC<SyncedChartsProps> = ({
  equityCurve,
  drawdownCurve,
}) => {
  const [syncId] = useState("syncCharts");
  const startDate = new Date("2024-01-01");

  const data: ChartData[] = equityCurve.map((equity, index) => ({
    date: format(
      new Date(startDate.getTime() + index * 24 * 60 * 60 * 1000),
      "MMM dd",
    ),
    equity,
    drawdown: drawdownCurve[index],
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-700 p-4 rounded-xl border border-gray-600 shadow-xl">
          <p className="text-gray-400 mb-2">{label}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} className="text-sm">
              <span
                className={
                  entry.name === "equity" ? "text-emerald-400" : "text-red-400"
                }
              >
                {entry.name === "equity" ? "$" : ""}
                {entry.value.toFixed(2)}
                {entry.name === "drawdown" ? "%" : ""}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const commonChartProps = {
    margin: { top: 10, right: 10, left: 50, bottom: 0 },
    style: { minHeight: "300px" },
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="h-[300px] lg:h-[400px] w-full lg:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} syncId={syncId} {...commonChartProps}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              tick={{ fill: "#9ca3af" }}
              interval="preserveStartEnd"
              tickCount={3}
            />
            <YAxis
              stroke="#6b7280"
              tick={{ fill: "#9ca3af" }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={equityCurve[0]}
              stroke="#6b7280"
              strokeDasharray="3 3"
              label={{
                value: "Initial",
                position: "right",
                fill: "#9ca3af",
              }}
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="#34d399"
              strokeWidth={2}
              fill="url(#equityGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="h-[300px] lg:h-[400px] w-full lg:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} syncId={syncId} {...commonChartProps}>
            <defs>
              <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              tick={{ fill: "#9ca3af" }}
              interval="preserveStartEnd"
              tickCount={3}
            />
            <YAxis
              reversed
              stroke="#6b7280"
              tick={{ fill: "#9ca3af" }}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="drawdown"
              stroke="#f87171"
              strokeWidth={2}
              fill="url(#drawdownGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
