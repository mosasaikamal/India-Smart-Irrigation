import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { MetricCard } from '../components/common/MetricCard';
import {
  BarChart3,
  TrendingDown,
  Droplets,
  Layers,
  Award,
  Bot,
  Activity,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { analytics, history } = useSimulation();

  const comparisonData = [
    { name: 'Wheat Cycle', TraditionalFixed: 42000, AIOptimized: 24500, WaterSaved: 17500 },
    { name: 'Tomato Drip', TraditionalFixed: 31000, AIOptimized: 18200, WaterSaved: 12800 },
    { name: 'Rice Panicle', TraditionalFixed: 68000, AIOptimized: 41000, WaterSaved: 27000 },
    { name: 'Cotton Boll', TraditionalFixed: 36000, AIOptimized: 21000, WaterSaved: 15000 },
    { name: 'Potato Tuber', TraditionalFixed: 28000, AIOptimized: 16500, WaterSaved: 11500 },
  ];

  const algoShareData = [
    { name: 'A* Search', value: 45, color: '#10b981' },
    { name: 'Best-First', value: 20, color: '#06b6d4' },
    { name: 'BFS', value: 15, color: '#8b5cf6' },
    { name: 'Hill Climbing', value: 12, color: '#f59e0b' },
    { name: 'DFS', value: 8, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>Smart Irrigation Analytics & Resource Efficiency</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Quantifying water conservation, algorithm optimality, and autonomous decision consistency.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <MetricCard
          title="Total Simulations"
          value={analytics.totalSimulations}
          subtitle="Model iterations"
          icon={Activity}
          iconColor="text-emerald-400"
        />
        <MetricCard
          title="Water Conserved"
          value={analytics.totalWaterSavedLiters.toLocaleString()}
          unit="L"
          subtitle="vs Fixed timer"
          icon={TrendingDown}
          iconColor="text-emerald-400"
          highlight
        />
        <MetricCard
          title="Water Applied"
          value={analytics.totalWaterUsedLiters.toLocaleString()}
          unit="L"
          subtitle="Precision delivered"
          icon={Droplets}
          iconColor="text-sky-400"
        />
        <MetricCard
          title="Success Rate"
          value={analytics.optimalDecisionRate}
          unit="%"
          subtitle="Stress mitigated"
          icon={Award}
          iconColor="text-teal-400"
        />
        <MetricCard
          title="Avg Search Cost"
          value={analytics.averageSearchCost}
          subtitle="Path cost g(n)"
          icon={Layers}
          iconColor="text-purple-400"
        />
        <MetricCard
          title="Primary Algorithm"
          value={analytics.mostUsedAlgorithm}
          subtitle="Top selected"
          icon={Layers}
          iconColor="text-amber-400"
        />
        <MetricCard
          title="Agent Actions"
          value={analytics.agentDecisionCount}
          subtitle="Consensus rounds"
          icon={Bot}
          iconColor="text-cyan-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comparison Bar Chart */}
        <div className="lg:col-span-2 agri-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Water Consumption: Conventional Fixed Schedule vs AI Optimized
              </h3>
              <p className="text-[11px] text-slate-400">
                Water volume benchmarked in Liters across representative crops
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              ~38.4% Average Water Reduction
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="TraditionalFixed" name="Conventional Fixed Timer (L)" fill="#475569" radius={[4, 4, 0, 0]} />
                <Bar dataKey="AIOptimized" name="AI Precision Schedule (L)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Algorithm Share Pie */}
        <div className="agri-card space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Search Algorithm Usage Distribution
            </h3>
            <p className="text-[11px] text-slate-400">
              Percentage of decisions generated per algorithm
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={algoShareData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {algoShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-300">
            {algoShareData.map((entry, i) => (
              <div key={i} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                <span>{entry.name} ({entry.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
