import React from 'react';
import { GraduationCap, ShieldCheck, Heart, Sparkles, BookOpen, Layers } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';

export const Footer: React.FC = () => {
  const { navigateTo } = usePlacement();

  return (
    <footer className="bg-navy-950 text-slate-400 text-sm border-t border-slate-800 pt-12 pb-8 mt-16 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Col 1: Project Identity */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyanAccent-500/20 text-cyanAccent-400 border border-cyanAccent-500/30 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-white font-extrabold text-base tracking-tight">
                Beyond the <span className="text-cyanAccent-400">Rumour Mill</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official Placement Notification + Verified Technical Preparation Syllabus platform for Lovely Professional University students.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-navy-900 border border-slate-800 text-xs text-cyanAccent-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-cyanAccent-400" />
              <span>Project ID: P08 · INT335</span>
            </div>
          </div>

          {/* Col 2: Platform Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Explore Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('home')} className="hover:text-cyanAccent-400 transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('dashboard')} className="hover:text-cyanAccent-400 transition-colors">
                  Student Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('drives')} className="hover:text-cyanAccent-400 transition-colors">
                  Active Placement Drives
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('syllabus')} className="hover:text-cyanAccent-400 transition-colors">
                  Verified Prep Syllabuses
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('my-prep')} className="hover:text-cyanAccent-400 transition-colors">
                  My Preparation Tracker
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('rumours')} className="hover:text-cyanAccent-400 transition-colors">
                  Campus Rumour Buster
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Design Thinking Methodology */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyanAccent-400" />
              <span>5 Stages of DT</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button onClick={() => navigateTo('about')} className="hover:text-cyanAccent-400 transition-colors text-left">
                  <span className="text-cyanAccent-400 font-semibold">1. Empathize:</span> 18 Student Interviews
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('about')} className="hover:text-cyanAccent-400 transition-colors text-left">
                  <span className="text-cyanAccent-400 font-semibold">2. Define:</span> Placement Anxiety & POV
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('about')} className="hover:text-cyanAccent-400 transition-colors text-left">
                  <span className="text-cyanAccent-400 font-semibold">3. Ideate:</span> 4 Divergent Concepts
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('about')} className="hover:text-cyanAccent-400 transition-colors text-left">
                  <span className="text-cyanAccent-400 font-semibold">4. Prototype:</span> CP1 to CP6 Iterations
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('about')} className="hover:text-cyanAccent-400 transition-colors text-left">
                  <span className="text-cyanAccent-400 font-semibold">5. Test:</span> 5 User Usability Trials
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Academic Compliance & Disclaimers */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Academic Prototype</span>
            </h4>
            <div className="p-3 rounded-xl bg-navy-900 border border-slate-800 text-[11px] leading-relaxed text-slate-400">
              <p className="font-medium text-slate-300 mb-1">Lovely Professional University (LPU)</p>
              Course: <span className="text-white">INT335 – Design Thinking</span>.
              <p className="mt-1.5 text-slate-400">
                This is a student-developed research prototype for academic evaluation. Not an official LPU UMS placement portal. Company data and verification statuses are illustrative samples.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 Beyond the Rumour Mill · Project P08 · INT335 Design Thinking</p>
          <div className="flex items-center gap-1.5">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for LPU Pre-Final & Final Year B.Tech Students</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
