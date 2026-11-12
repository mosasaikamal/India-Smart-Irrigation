import React, { useState } from 'react';
import { GraduationCap, BookOpen, GitFork, Cpu, Droplets, Bot, Calculator } from 'lucide-react';

export const EducationalPage: React.FC = () => {
  // Interactive RAW Calculator state
  const [calcFC, setCalcFC] = useState<number>(32);
  const [calcWP, setCalcWP] = useState<number>(14);
  const [calcRootDepth, setCalcRootDepth] = useState<number>(1.0);
  const [calcMAD, setCalcMAD] = useState<number>(0.5);

  const calculatedTAW = Math.max(0, 1000 * ((calcFC - calcWP) / 100) * calcRootDepth);
  const calculatedRAW = calculatedTAW * calcMAD;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-purple-400" />
              <span>Academic Curriculum Guide & Agronomic AI Theory</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive conceptual foundation covering State-Space Search, Production Rule Systems, Distributed Agents, and Soil Physics.
            </p>
          </div>

          <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            College AI Coursework Edition
          </span>
        </div>
      </div>

      {/* Interactive Agronomy Hydrology Calculator */}
      <div className="bg-gradient-to-br from-slate-900 to-emerald-950/30 rounded-2xl border border-emerald-500/30 p-5 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
          <Calculator className="w-4 h-4" />
          <span>Interactive Formula Calculator: Soil Water Reservoirs (TAW & RAW)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Field Capacity (FC %):</label>
            <input
              type="number"
              value={calcFC}
              onChange={(e) => setCalcFC(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Wilting Point (WP %):</label>
            <input
              type="number"
              value={calcWP}
              onChange={(e) => setCalcWP(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Root Depth Zr (meters):</label>
            <input
              type="number"
              step={0.1}
              value={calcRootDepth}
              onChange={(e) => setCalcRootDepth(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Depletion Fraction p (MAD):</label>
            <input
              type="number"
              step={0.05}
              min={0.1}
              max={0.9}
              value={calcMAD}
              onChange={(e) => setCalcMAD(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 font-mono text-xs">
            <span className="text-slate-400 block font-sans">Total Available Water (TAW = 1000 × (FC - WP) × Zr)</span>
            <span className="text-lg font-bold text-teal-300">{calculatedTAW.toFixed(1)} mm</span>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              Maximum water stored between field capacity and permanent wilting point.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 font-mono text-xs">
            <span className="text-slate-400 block font-sans">Readily Available Water (RAW = p × TAW)</span>
            <span className="text-lg font-bold text-emerald-400">{calculatedRAW.toFixed(1)} mm</span>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              Moisture that crops can extract without experiencing transpiration stress.
            </p>
          </div>
        </div>
      </div>

      {/* Academic Topics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Topic 1: Search Algorithms */}
        <div className="agri-card space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider pb-2 border-b border-slate-800">
            <GitFork className="w-4 h-4" />
            <span>1. State-Space Search in Irrigation Scheduling</span>
          </div>
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <p>
              In artificial intelligence, planning can be framed as discovering a path through a state space from an initial state $S_0$ to a goal state $S_g$. In irrigation:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li><strong>State:</strong> Tuple containing elapsed hours, root-zone volumetric moisture, cumulative water used, and stress hours.</li>
              <li><strong>Actions:</strong> Discrete irrigation depths (Full, Deficit), delays (4h, 8h), and waiting for rain.</li>
              <li><strong>Cost Function $g(n)$::</strong> Penalizes water volume consumed and vegetative water stress duration.</li>
              <li><strong>Heuristic h(n):</strong> Admissible lower-bound estimate of the deficit to be refilled, discounted by precipitation forecast (1 - P_rain).</li>
              <li><strong>A* Search:</strong> Expands nodes minimizing f(n) = g(n) + h(n), ensuring mathematical optimality.</li>
            </ul>
          </div>
        </div>

        {/* Topic 2: Rule-Based Systems */}
        <div className="agri-card space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider pb-2 border-b border-slate-800">
            <BookOpen className="w-4 h-4" />
            <span>2. Knowledge Representation & Production Rules</span>
          </div>
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <p>
              Expert systems encapsulate domain heuristics formulated by agronomists into IF-THEN rules:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li><strong>Working Memory:</strong> Contains live environmental facts extracted from field telemetry.</li>
              <li><strong>Pattern Matching:</strong> The inference engine evaluates conditions (&lt;, &gt;, ==) against memory facts.</li>
              <li><strong>Conflict Resolution:</strong> When multiple rules trigger concurrently (e.g. moisture is low BUT rain forecast is 80%), priority rankings resolve the dominant action.</li>
              <li><strong>Forward Chaining:</strong> Data-driven reasoning starts with sensor observations to infer optimal actuation.</li>
            </ul>
          </div>
        </div>

        {/* Topic 3: Autonomous Multi-Agent Systems */}
        <div className="agri-card space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-teal-400 uppercase tracking-wider pb-2 border-b border-slate-800">
            <Bot className="w-4 h-4" />
            <span>3. Autonomous Multi-Agent Coordination (MAS)</span>
          </div>
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <p>
              Rather than a monolithic controller, agricultural precision benefits from specialized, decentralized software agents:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li><strong>Soil Agent:</strong> Protects crop physiology from wilting and hydraulic failure.</li>
              <li><strong>Weather Agent:</strong> Incorporates meteorological radar and thermal evapotranspiration.</li>
              <li><strong>Water Conservation Agent:</strong> Challenges over-allocation and minimizes aquifer depletion.</li>
              <li><strong>Coordinator Agent:</strong> Acts as the arbiter, resolving conflicting agent proposals through consensus voting.</li>
            </ul>
          </div>
        </div>

        {/* Topic 4: Edge AI and TinyML */}
        <div className="agri-card space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider pb-2 border-b border-slate-800">
            <Cpu className="w-4 h-4" />
            <span>4. Edge AI & TinyML in Rural Agriculture</span>
          </div>
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <p>
              Edge computing executes machine learning inference directly on low-power microcontrollers (e.g., ARM Cortex-M or ESP32) located at the valve box:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li><strong>Offline Resilience:</strong> Irrigates reliably without active 4G/cellular internet connection.</li>
              <li><strong>Microsecond Latency:</strong> Immediate reaction times prevent pump dry-runs and water hammer.</li>
              <li><strong>Data Privacy:</strong> Farm moisture and yield data remain securely on-premise.</li>
              <li><strong>Quantization:</strong> Floating-point models are compressed to Int8 (8-bit integer) to fit within 512KB SRAM.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
