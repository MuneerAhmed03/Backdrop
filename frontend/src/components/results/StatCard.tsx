import React from "react";
import { DivideIcon as LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  iconBgColor: string;
  iconColor: string;
  valueColor?: string;
  prefix?: string;
  suffix?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconColor,
  valueColor = "text-gray-100",
  prefix = "",
  suffix = "",
}) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-3 text-gray-400 mb-3">
        <div className={`${iconBgColor} p-3 rounded-xl`}>
          <Icon size={24} className={iconColor} />
        </div>
        <span className="text-lg font-medium">{title}</span>
      </div>
      <div className={`text-4xl font-bold ${valueColor}`}>
        {prefix}
        {typeof value === "number" ? value.toLocaleString() : value}
        {suffix}
      </div>
    </div>
  );
};
