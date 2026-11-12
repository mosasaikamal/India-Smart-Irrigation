import React from 'react';

export type DataSourceType = 'LIVE' | 'USER_ENTERED' | 'SIMULATED' | 'CALCULATED' | 'PREDICTED';

interface DataSourceBadgeProps {
  type: DataSourceType;
  label?: string;
  className?: string;
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({ type, label, className = '' }) => {
  switch (type) {
    case 'LIVE':
      return (
        <span
          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${className}`}
          title="Live authenticated data from physical sensors or live Open-Meteo meteorological feed"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{label || 'Live Data'}</span>
        </span>
      );
    case 'USER_ENTERED':
      return (
        <span
          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-blue-500/15 text-blue-400 border border-blue-500/30 ${className}`}
          title="User-specified agricultural parameters and custom profiles"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span>{label || 'User-Entered'}</span>
        </span>
      );
    case 'SIMULATED':
      return (
        <span
          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-purple-500/15 text-purple-300 border border-purple-500/30 ${className}`}
          title="Deterministic physical and atmospheric simulation model"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          <span>{label || 'Simulated'}</span>
        </span>
      );
    case 'CALCULATED':
      return (
        <span
          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-amber-500/15 text-amber-300 border border-amber-500/30 ${className}`}
          title="Derived via scientific formulas (FAO-56 Penman-Monteith, root-zone mass balance)"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>{label || 'Calculated'}</span>
        </span>
      );
    case 'PREDICTED':
      return (
        <span
          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 ${className}`}
          title="Optimized Beam Search trajectory or multi-day soil water balance projection"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>{label || 'Predicted'}</span>
        </span>
      );
    default:
      return null;
  }
};
