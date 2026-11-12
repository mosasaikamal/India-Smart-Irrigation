import React, { useState, useEffect } from 'react';
import { CampusFindApp } from './CampusFindApp';
import { PlacementApp } from './PlacementApp';
import { Compass, GraduationCap } from 'lucide-react';

export function App() {
  const [activeProject, setActiveProject] = useState<'campusfind' | 'placement'>(() => {
    try {
      const saved = localStorage.getItem('active_lpu_project');
      if (saved === 'placement' || saved === 'campusfind') return saved;
    } catch {
      // ignore
    }
    return 'campusfind'; // Default to CampusFind as requested
  });

  useEffect(() => {
    try {
      localStorage.setItem('active_lpu_project', activeProject);
    } catch {
      // ignore
    }
  }, [activeProject]);

  return (
    <div className="relative">
      {/* Discreet Multi-Project Evaluator Switcher */}
      <aside aria-label="Project Switcher" className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 border-b border-slate-800 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">Lovely Professional University</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">INT335 Design Thinking</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-800/90 p-0.5 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveProject('campusfind')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition ${
              activeProject === 'campusfind'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>P04: CampusFind</span>
          </button>

          <button
            onClick={() => setActiveProject('placement')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition ${
              activeProject === 'placement'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>P08: Rumour Mill</span>
          </button>
        </div>
      </aside>

      {/* Render Active Project */}
      {activeProject === 'campusfind' ? <CampusFindApp /> : <PlacementApp />}
    </div>
  );
}

export default App;
