import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import {
  Sparkles,
  ArrowRight,
  GitFork,
  Cpu,
  GraduationCap,
  Play,
  Layers,
  Activity,
  Droplet,
  CheckCircle2,
  X,
} from 'lucide-react';

interface WelcomeHeroProps {
  onDismiss?: () => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({ onDismiss }) => {
  const { setActiveTab, runSimulation } = useSimulation();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 p-6 lg:p-8 shadow-2xl space-y-6">
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Dismiss Welcome Banner"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Main Branding & Subtitle */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Final-Year / College Academic AI Demonstration Platform</span>
        </div>

        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          AI-Based Smart Agriculture Irrigation Planner
        </h1>

        <p className="text-xs lg:text-sm text-slate-300 leading-relaxed font-normal">
          An intelligent simulation platform for water-efficient irrigation planning using AI, state-space search algorithms (BFS, DFS, Best-First, Hill Climbing, A*), knowledge representation & reasoning, autonomous multi-agent consensus, Edge-AI TinyML simulation, and a grounded generative AI assistant.
        </p>
      </div>

      {/* Visual Pipeline Flow: Field -> Sensors -> AI -> Decision -> Irrigation */}
      <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 overflow-x-auto">
        <div className="min-w-[650px] flex items-center justify-between text-xs">
          {/* Node 1: Virtual Field */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 font-bold">
              1
            </div>
            <div>
              <span className="font-bold text-white block">Agricultural Field</span>
              <span className="text-[10px] text-slate-400">Crop, Soil & Climate</span>
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-600" />

          {/* Node 2: Sensor Telemetry */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/40 font-bold">
              2
            </div>
            <div>
              <span className="font-bold text-white block">Sensor Layer</span>
              <span className="text-[10px] text-slate-400">Moisture, Temp, Rain</span>
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-600" />

          {/* Node 3: AI Inference & Search */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 font-bold">
              3
            </div>
            <div>
              <span className="font-bold text-emerald-300 block">AI & Search</span>
              <span className="text-[10px] text-slate-400">A*, Rules, 5 Agents</span>
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-600" />

          {/* Node 4: Decision & Schedule */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/40 font-bold">
              4
            </div>
            <div>
              <span className="font-bold text-white block">Optimal Decision</span>
              <span className="text-[10px] text-slate-400">Multi-Objective Score</span>
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-600" />

          {/* Node 5: Actuator */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/40 font-bold">
              5
            </div>
            <div>
              <span className="font-bold text-white block">Precision Irrigation</span>
              <span className="text-[10px] text-slate-400">Drip / Sprinkler Valve</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          onClick={() => {
            runSimulation();
            setActiveTab('simulator');
          }}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Start Simulation</span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center space-x-1.5"
        >
          <GitFork className="w-4 h-4 text-cyan-400" />
          <span>Learn Algorithms (A*, BFS, DFS)</span>
        </button>

        <button
          onClick={() => setActiveTab('agents')}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center space-x-1.5"
        >
          <Cpu className="w-4 h-4 text-teal-400" />
          <span>Explore Autonomous Agents</span>
        </button>

        <button
          onClick={() => setActiveTab('assistant')}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center space-x-1.5"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Ask Grounded AI Assistant</span>
        </button>
      </div>
    </div>
  );
};
