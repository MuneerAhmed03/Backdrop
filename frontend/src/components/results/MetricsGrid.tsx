import React from "react";
import { RatioTooltip } from "./RatioTooltip";

interface MetricsGridProps {
  metrics: {
    label: string;
    value: number;
    prefix?: string;
    suffix?: string;
  }[];
  title: string;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics, title }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-xl">
      <h3 className="text-lg font-semibold mb-6 text-gray-300">{title}</h3>
      <div className="space-y-6">
        {metrics.map((metric) => (
          <RatioTooltip
            key={metric.label}
            label={metric.label}
            value={metric.value}
            prefix={metric.prefix}
            suffix={metric.suffix}
          />
        ))}
      </div>
    </div>
  );
};
