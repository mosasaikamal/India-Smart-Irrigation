import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import {
  Leaf,
  Menu,
  X,
  Sun,
  CloudRain,
  CloudSun,
  Droplet,
  Sparkles,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    fieldState,
    isRunning,
    toggleSimulationClock,
    resetSimulation,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    setIsAIDetailsOpen,
  } = useSimulation();

  const isRainy = fieldState.environment.rainProbability >= 60;
  const isCloudy = fieldState.environment.rainProbability >= 30 && fieldState.environment.rainProbability < 60;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 px-4 lg:px-8 py-3.5 shadow-2xs">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
        {/* Brand & Product Name */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Toggle Menu"
            aria-label="Toggle Menu"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5 text-emerald-700" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm">
            <Leaf className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">
                AgroSmart
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Smart Irrigation Planner
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Precision soil water balance & autonomous schedule optimization
            </p>
          </div>
        </div>

        {/* Right Actions: Weather summary & AI System Details Evaluation Button */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Quick Weather Chip */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            {isRainy ? (
              <CloudRain className="w-4 h-4 text-sky-600" />
            ) : isCloudy ? (
              <CloudSun className="w-4 h-4 text-amber-500" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <span className="text-slate-700 font-medium">
              {fieldState.environment.temperature}°C
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 flex items-center space-x-1 font-medium">
              <Droplet className="w-3.5 h-3.5" />
              <span>{fieldState.soil.currentMoisture}% Soil</span>
            </span>
          </div>

          {/* Simulation Clock minimal toggle */}
          <button
            onClick={toggleSimulationClock}
            className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              isRunning
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title={isRunning ? 'Pause simulation clock' : 'Run simulation clock'}
          >
            {isRunning ? (
              <>
                <Pause className="w-3 h-3 fill-current text-amber-700" />
                <span>Sim Running</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current text-slate-600" />
                <span>Sim Clock</span>
              </>
            )}
          </button>

          {/* AI System Details Viva / Presentation Modal Trigger */}
          <button
            onClick={() => setIsAIDetailsOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-300 text-xs font-semibold transition-colors shadow-2xs"
            title="Inspect all 6 AI & Mathematical concepts for viva presentation"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">AI System Details</span>
            <span className="sm:hidden">AI Details</span>
          </button>
        </div>
      </div>
    </header>
  );
};
