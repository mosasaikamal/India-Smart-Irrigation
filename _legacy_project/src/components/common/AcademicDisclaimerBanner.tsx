import React, { useState } from 'react';
import { AlertCircle, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';

export const AcademicDisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const { navigateTo } = usePlacement();

  if (dismissed) return null;

  return (
    <div className="bg-navy-900 border-b border-cyan-500/30 text-white text-xs sm:text-sm px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
          </span>
          <p className="truncate text-slate-300">
            <strong className="text-white font-medium">INT335 Design Thinking Prototype (Project P08):</strong>{' '}
            Combines official UMS notices with verified technical preparation syllabuses for LPU.
            <span className="hidden md:inline text-cyan-300 ml-1.5 font-medium">
              Tested & enhanced with CP6 usability iterations.
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => navigateTo('about')}
            className="hidden sm:inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline font-medium text-xs"
          >
            Design Thinking Process
            <ExternalLink className="w-3 h-3" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
