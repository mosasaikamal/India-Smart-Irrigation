import React from 'react';
import { IrrigationStatus } from '../../types';
import { CheckCircle2, AlertCircle, CloudRain, Droplets, ShieldCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: IrrigationStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  }[size];

  switch (status) {
    case 'IRRIGATION_REQUIRED':
      return (
        <span className={`inline-flex items-center space-x-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 ${sizeClasses}`}>
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Irrigation Required</span>
        </span>
      );
    case 'IRRIGATION_NOT_REQUIRED':
      return (
        <span className={`inline-flex items-center space-x-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Irrigation Not Required</span>
        </span>
      );
    case 'RAIN_EXPECTED':
      return (
        <span className={`inline-flex items-center space-x-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 ${sizeClasses}`}>
          <CloudRain className="w-3.5 h-3.5 animate-bounce" />
          <span>Rain Expected (Delay)</span>
        </span>
      );
    case 'SOIL_MOISTURE_LOW':
      return (
        <span className={`inline-flex items-center space-x-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 animate-pulse ${sizeClasses}`}>
          <Droplets className="w-3.5 h-3.5" />
          <span>Soil Moisture Critical</span>
        </span>
      );
    case 'OPTIMAL':
    default:
      return (
        <span className={`inline-flex items-center space-x-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 ${sizeClasses}`}>
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Optimal Condition</span>
        </span>
      );
  }
};
