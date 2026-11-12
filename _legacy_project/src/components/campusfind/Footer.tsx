import React from 'react';
import { useCampusFind } from '../../context/CampusFindContext';
import { Compass, RefreshCw } from 'lucide-react';
import { PROJECT_INFO } from '../../data/sampleData';

export const CampusFindFooter: React.FC = () => {
  const { resetToDemoData, navigateTo } = useCampusFind();

  return (
    <footer className="bg-slate-50 text-slate-600 border-t border-slate-200 mt-16 text-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">CampusFind</span>
              <span className="text-[11px] text-slate-400 block">
                {PROJECT_INFO.institution} • {PROJECT_INFO.course} (Project {PROJECT_INFO.id})
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigateTo('design-thinking')}
              className="text-slate-600 hover:text-blue-600 font-medium transition"
            >
              Design Thinking Case Study
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => navigateTo('help')}
              className="text-slate-600 hover:text-blue-600 font-medium transition"
            >
              Help & FAQ
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={resetToDemoData}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition"
              title="Reset records to default demo state"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>

        <div className="border-t border-slate-200/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <p>
            Team P04: Karri Rohit (Leader), Sai Kamal, S. Adithya Raman, Kalimalla Ashraf
          </p>
          <p>
            Prototype developed for INT335 Design Thinking academic evaluation.
          </p>
        </div>
      </div>
    </footer>
  );
};
