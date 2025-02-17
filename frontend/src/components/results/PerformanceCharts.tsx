import React from "react";
import { SyncedCharts } from "./SyncedCharts";

interface PerformanceChartsProps {
  equityCurve: number[];
  drawdownCurve: number[];
}

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({
  equityCurve,
  drawdownCurve,
}) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
          Performance Analysis
        </h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            <span className="text-sm text-gray-400">Equity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span className="text-sm text-gray-400">Drawdown</span>
          </div>
        </div>
      </div>
      <SyncedCharts equityCurve={equityCurve} drawdownCurve={drawdownCurve} />
    </div>
  );
};
