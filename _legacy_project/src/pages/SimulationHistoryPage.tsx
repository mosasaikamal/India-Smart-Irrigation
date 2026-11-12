import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { History, Trash2, ArrowUpRight, CheckCircle2, Droplets, Calendar, RotateCcw } from 'lucide-react';

export const SimulationHistoryPage: React.FC = () => {
  const { history, loadHistoryRun, clearHistory } = useSimulation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <History className="w-5 h-5 text-emerald-400" />
              <span>Simulation History & Historical Run Replay</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review and inspect previous simulation iterations, irrigation decisions, algorithms, and water savings.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={clearHistory}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-colors flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        </div>
      </div>

      {/* History Items Grid */}
      <div className="space-y-3">
        {history.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-900/60 rounded-2xl border border-dashed border-slate-800">
            No simulations recorded yet. Run a simulation from the Dashboard or Field Simulator.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="agri-card hover:border-slate-700 transition-all duration-150 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {item.crop}
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="text-xs text-slate-400">{item.soilType}</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-xs text-slate-300 font-medium">Stage: {item.growthStage}</span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-slate-500 font-mono flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{item.timestamp}</span>
                    </span>
                    <button
                      onClick={() => loadHistoryRun(item)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 border border-slate-700 transition-colors flex items-center space-x-1"
                    >
                      <span>Replay Run</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Action Recommended</span>
                    <span className="font-mono font-bold text-white">
                      {item.recommendedAction}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">Moisture Shift</span>
                    <span className="font-mono font-bold text-teal-300">
                      {item.initialMoisture}% → {item.finalMoisture}%
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">Water Applied</span>
                    <span className="font-mono font-bold text-white">
                      {item.waterUsedLiters.toLocaleString()} L
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">Water Conserved</span>
                    <span className="font-mono font-bold text-emerald-400">
                      +{item.waterSavedLiters.toLocaleString()} L
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">Algorithm Used</span>
                    <span className="font-mono font-semibold text-cyan-300">
                      {item.algorithmUsed}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-slate-300 font-medium">Agent Consensus: </span>
                  {item.agentConsensus}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
