import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { SearchAlgorithmId, SearchResult } from '../types';
import { SearchTreeGraph } from '../components/search/SearchTreeGraph';
import {
  GitFork,
  Play,
  CheckCircle2,
  Clock,
  Layers,
  Droplets,
  Cpu,
  BarChart,
  HelpCircle,
  Activity,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface AlgorithmMeta {
  id: SearchAlgorithmId;
  name: string;
  category: 'Uninformed' | 'Informed' | 'Local';
  timeComplexity: string;
  spaceComplexity: string;
  optimality: 'Guaranteed' | 'Sub-optimal' | 'No Guarantee' | 'Guaranteed (Steps)';
  description: string;
}

const ALGORITHMS: AlgorithmMeta[] = [
  {
    id: 'astar',
    name: 'A* Search (f = g + h)',
    category: 'Informed',
    timeComplexity: 'O(b^d)',
    spaceComplexity: 'O(b^d)',
    optimality: 'Guaranteed',
    description: 'Combines exact accumulated path cost g(n) with admissible heuristic estimate h(n). Mathematically guarantees finding the optimal schedule.',
  },
  {
    id: 'best-first',
    name: 'Greedy Best-First Search',
    category: 'Informed',
    timeComplexity: 'O(b^m)',
    spaceComplexity: 'O(b^m)',
    optimality: 'No Guarantee',
    description: 'Expands node with lowest estimated distance h(n) alone. Aggressively heads towards goal but ignores past water expenditure.',
  },
  {
    id: 'bfs',
    name: 'Breadth First Search (BFS)',
    category: 'Uninformed',
    timeComplexity: 'O(b^d)',
    spaceComplexity: 'O(b^d)',
    optimality: 'Guaranteed (Steps)',
    description: 'Explores states level by level using FIFO Queue. Guarantees finding shallowest action sequence without heuristic guidance.',
  },
  {
    id: 'dfs',
    name: 'Depth First Search (DFS)',
    category: 'Uninformed',
    timeComplexity: 'O(b^m)',
    spaceComplexity: 'O(b · m)',
    optimality: 'Sub-optimal',
    description: 'Explores deepest branches first using LIFO Stack. Low memory footprint, but risks selecting excessive or high-cost water actions.',
  },
  {
    id: 'hill-climbing',
    name: 'Hill Climbing (Steepest Descent)',
    category: 'Local',
    timeComplexity: 'O(∞)',
    spaceComplexity: 'O(1)',
    optimality: 'No Guarantee',
    description: 'Inspects all immediate neighbor states and commits to the steepest local improvement. Can get trapped at local optima or plateaus.',
  },
];

export const SearchAlgorithmsPage: React.FC = () => {
  const {
    currentSearchResult,
    runAlgorithmSearch,
    runAllBenchmarks,
    algorithmBenchmark,
    fieldState,
  } = useSimulation();

  const [selectedAlgoId, setSelectedAlgoId] = useState<SearchAlgorithmId>(
    currentSearchResult?.algorithmId || 'astar'
  );
  const [isRunningSearch, setIsRunningSearch] = useState<boolean>(false);

  const handleRunSearch = () => {
    setIsRunningSearch(true);
    setTimeout(() => {
      runAlgorithmSearch(selectedAlgoId);
      setIsRunningSearch(false);
    }, 250);
  };

  const handleRunAll = () => {
    setIsRunningSearch(true);
    setTimeout(() => {
      runAllBenchmarks();
      setIsRunningSearch(false);
    }, 300);
  };

  const activeMeta = ALGORITHMS.find((a) => a.id === selectedAlgoId) || ALGORITHMS[0];
  const result: SearchResult | null = currentSearchResult;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <GitFork className="w-5 h-5 text-emerald-400" />
              <span>State-Space Search Algorithm Engine</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Formulation of precision irrigation planning as an academic state-space graph search problem.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRunAll}
              disabled={isRunningSearch}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center space-x-1.5"
            >
              <BarChart className="w-3.5 h-3.5 text-cyan-400" />
              <span>Benchmark All 5 Algorithms</span>
            </button>

            <button
              onClick={handleRunSearch}
              disabled={isRunningSearch}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-1.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Run Selected Search</span>
            </button>
          </div>
        </div>

        {/* Algorithm Selector Buttons */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-2">
          {ALGORITHMS.map((algo) => (
            <button
              key={algo.id}
              onClick={() => {
                setSelectedAlgoId(algo.id);
                runAlgorithmSearch(algo.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedAlgoId === algo.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-500/10'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {algo.name}
            </button>
          ))}
        </div>
      </div>

      {/* Algorithm Characteristics & Heuristic Explainer Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="agri-card space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {activeMeta.name}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {activeMeta.category}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            {activeMeta.description}
          </p>

          <div className="space-y-1.5 pt-2 border-t border-slate-800/80 font-mono text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Time Complexity:</span>
              <span className="text-emerald-400 font-bold">{activeMeta.timeComplexity}</span>
            </div>
            <div className="flex justify-between">
              <span>Space Complexity:</span>
              <span className="text-cyan-400 font-bold">{activeMeta.spaceComplexity}</span>
            </div>
            <div className="flex justify-between">
              <span>Optimality Guarantee:</span>
              <span className={`font-bold ${
                activeMeta.optimality === 'Guaranteed' ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {activeMeta.optimality}
              </span>
            </div>
          </div>
        </div>

        {/* Heuristic Formula Breakdown */}
        <div className="lg:col-span-2 agri-card space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider pb-2 border-b border-slate-800">
            <HelpCircle className="w-4 h-4" />
            <span>State-Space Formulation & Heuristic Function h(n)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <span className="font-semibold text-slate-200 block">State Tuple:</span>
              <p className="text-slate-400 font-mono text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
                S = (t_step, moisture%, water_used_liters, stress_hours)
              </p>
              <span className="font-semibold text-slate-200 block mt-2">Available Discrete Actions:</span>
              <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-0.5">
                <li><code className="text-emerald-400">IrrigateFull()</code> — Refill root deficit to Field Capacity</li>
                <li><code className="text-teal-400">IrrigateDeficit()</code> — Apply 50% water depth</li>
                <li><code className="text-cyan-400">Delay(4h)</code> — Postpone to observe evaporative trend</li>
                <li><code className="text-sky-400">WaitForRain()</code> — Exploit forecasted natural precipitation</li>
              </ul>
            </div>

            <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <span className="font-semibold text-slate-200 block">Evaluation Formula:</span>
              <div className="text-emerald-400 font-mono text-xs font-bold bg-slate-900 p-2 rounded border border-slate-800">
                f(n) = g(n) + h(n)
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                <strong>g(n)</strong> is exact accumulated cost: water volume applied + penalty for hours below root threshold.<br />
                <strong>h(n)</strong> is admissible lower-bound heuristic: estimates remaining water needed to reach the 16-hour horizon safely, discounted by expected rainfall (1 - P_rain).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Metrics Banner */}
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="agri-card space-y-1">
            <span className="text-[11px] text-slate-400">States Explored</span>
            <div className="text-xl font-bold font-mono text-white flex items-center space-x-1">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>{result.nodesExplored}</span>
            </div>
            <span className="text-[10px] text-slate-500">Nodes expanded</span>
          </div>

          <div className="agri-card space-y-1">
            <span className="text-[11px] text-slate-400">Execution Time</span>
            <div className="text-xl font-bold font-mono text-cyan-400 flex items-center space-x-1">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{result.executionTimeMs} ms</span>
            </div>
            <span className="text-[10px] text-slate-500">Search duration</span>
          </div>

          <div className="agri-card space-y-1">
            <span className="text-[11px] text-slate-400">Total Path Cost g(n)</span>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {result.totalCost.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-500">Penalty & water cost</span>
          </div>

          <div className="agri-card space-y-1">
            <span className="text-[11px] text-slate-400">Water Consumption</span>
            <div className="text-xl font-bold font-mono text-white flex items-center space-x-1">
              <Droplets className="w-4 h-4 text-sky-400" />
              <span>{result.totalWaterUsed.toLocaleString()} L</span>
            </div>
            <span className="text-[10px] text-slate-500">Planned water volume</span>
          </div>

          <div className="agri-card space-y-1">
            <span className="text-[11px] text-slate-400">Final Est Moisture</span>
            <div className="text-xl font-bold font-mono text-teal-300">
              {result.finalMoisture}%
            </div>
            <span className="text-[10px] text-slate-500">At 16-hour horizon</span>
          </div>

          <div className="agri-card space-y-1">
            <span className="text-[11px] text-slate-400">Goal Status</span>
            <div className="flex items-center space-x-1 text-sm font-bold mt-1 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>{result.isGoalReached ? 'GOAL ACHIEVED' : 'PARTIAL HORIZON'}</span>
            </div>
            <span className="text-[10px] text-slate-500">Safe moisture band</span>
          </div>
        </div>
      )}

      {/* Search Tree Visualization */}
      {result && <SearchTreeGraph nodes={result.tree} />}

      {/* Discovered Action Path Sequence */}
      {result && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Optimal Search Path Action Sequence ({result.actionsTaken.length} Decision Steps)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {result.actionsTaken.map((action, idx) => (
              <div
                key={idx}
                className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-mono text-[10px] text-emerald-400 font-bold">
                    STEP {idx + 1} (Hour +{idx * 4}h)
                  </span>
                  <span className="font-mono font-bold text-white">
                    {action.waterLiters.toLocaleString()} L
                  </span>
                </div>
                <h4 className="font-bold text-slate-200">{action.name}</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {action.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All 5 Algorithms Benchmark Comparison Table */}
      {algorithmBenchmark && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Comprehensive 5-Algorithm Performance Benchmark
            </h3>
            <span className="text-xs text-emerald-400 font-mono font-semibold">
              Live Comparative Run
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
                <tr>
                  <th className="p-3">Algorithm</th>
                  <th className="p-3">States Explored</th>
                  <th className="p-3">Exec Time (ms)</th>
                  <th className="p-3">Total Path Cost g(n)</th>
                  <th className="p-3">Water Used</th>
                  <th className="p-3">Final Moisture</th>
                  <th className="p-3 text-center">Optimality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {Object.values(algorithmBenchmark.results).map((res) => (
                  <tr
                    key={res.algorithmId}
                    className={`hover:bg-slate-800/40 ${
                      res.algorithmId === 'astar' ? 'bg-emerald-950/20 font-bold' : ''
                    }`}
                  >
                    <td className="p-3 text-white font-sans">{res.algorithmName}</td>
                    <td className="p-3 text-slate-300">{res.nodesExplored}</td>
                    <td className="p-3 text-cyan-400">{res.executionTimeMs} ms</td>
                    <td className="p-3 text-emerald-400">{res.totalCost.toFixed(2)}</td>
                    <td className="p-3 text-white">{res.totalWaterUsed.toLocaleString()} L</td>
                    <td className="p-3 text-teal-300">{res.finalMoisture}%</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        res.isGoalReached ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {res.isGoalReached ? 'Optimal' : 'Sub-optimal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-400 italic bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            {algorithmBenchmark.comparisonSummary}
          </p>
        </div>
      )}
    </div>
  );
};
