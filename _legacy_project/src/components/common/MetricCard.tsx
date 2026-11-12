import React from 'react';
import { LucideIcon } from 'lucide-react';
import { DataSourceBadge, DataSourceType } from './DataSourceBadge';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  dataSource?: DataSourceType;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  iconColor = 'text-emerald-400',
  dataSource,
  trend,
  highlight = false,
}) => {
  return (
    <div
      className={`agri-card relative overflow-hidden transition-all duration-200 hover:border-emerald-500/40 ${
        highlight ? 'border-emerald-500/50 bg-emerald-950/20 shadow-lg shadow-emerald-950/30' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <p className="text-xs font-medium text-slate-400">{title}</p>
            {dataSource && <DataSourceBadge type={dataSource} />}
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
            {unit && <span className="text-xs text-slate-400 font-medium">{unit}</span>}
          </div>
        </div>
        <div className={`p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          {subtitle && <span className="truncate max-w-[200px]">{subtitle}</span>}
          {trend && (
            <span
              className={`font-medium ${
                trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
