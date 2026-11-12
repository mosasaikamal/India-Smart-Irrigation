import React from 'react';
import { useCampusFind } from '../context/CampusFindContext';
import { ItemCard } from '../components/common/ItemCard';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  PlusCircle, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  PieChart,
  Layers,
  Building2
} from 'lucide-react';
import { CATEGORIES } from '../types/campusfind';

export const DashboardPage: React.FC = () => {
  const { items, claims, navigateTo, setCategoryFilter, setLocationFilter, setTypeFilter } = useCampusFind();

  const totalLost = items.filter(i => i.type === 'lost').length;
  const totalFound = items.filter(i => i.type === 'found').length;
  const totalReturned = items.filter(i => i.status === 'returned').length;
  const pendingClaims = claims.filter(c => c.status === 'pending').length;
  const approvedClaims = claims.filter(c => c.status === 'approved').length;

  const recoveryRate = totalFound > 0 ? Math.round((totalReturned / (totalLost + totalFound)) * 100) : 0;

  // Group items by campus location
  const locationCounts: Record<string, number> = {};
  items.forEach(item => {
    const loc = item.location;
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });

  const sortedLocations = Object.entries(locationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  // Group items by category
  const categoryCounts: Record<string, number> = {};
  items.forEach(item => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-lg">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 text-blue-200 text-xs font-semibold">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Campus Real-time Metrics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            CampusFind Analytics Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Live overview of lost belongings, found items, active verification requests, and safe handovers across Lovely Professional University's 600-acre premises.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('report-lost')}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition shadow flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Lost</span>
          </button>
          <button
            onClick={() => navigateTo('report-found')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow flex items-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Report Found</span>
          </button>
        </div>
      </div>

      {/* 4 Core Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Lost Items</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900">{totalLost}</p>
            <p className="text-xs text-rose-600 font-medium mt-0.5 flex items-center gap-1">
              <span>Active search in progress</span>
            </p>
          </div>
          <button
            onClick={() => {
              setTypeFilter('lost');
              navigateTo('browse');
            }}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 pt-1 border-t border-slate-100 w-full"
          >
            <span>View all lost items</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Found Items</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900">{totalFound}</p>
            <p className="text-xs text-blue-600 font-medium mt-0.5 flex items-center gap-1">
              <span>Secured at campus desks</span>
            </p>
          </div>
          <button
            onClick={() => {
              setTypeFilter('found');
              navigateTo('browse');
            }}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 pt-1 border-t border-slate-100 w-full"
          >
            <span>View all found items</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Successfully Returned</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900">{totalReturned}</p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{recoveryRate}% campus recovery rate</span>
            </p>
          </div>
          <button
            onClick={() => {
              setTypeFilter('returned');
              navigateTo('browse');
            }}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 pt-1 border-t border-slate-100 w-full"
          >
            <span>View returned log</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Claims</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900">{pendingClaims}</p>
            <p className="text-xs text-amber-600 font-medium mt-0.5">
              <span>{approvedClaims} approved & ready for pickup</span>
            </p>
          </div>
          <button
            onClick={() => navigateTo('admin')}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 pt-1 border-t border-slate-100 w-full"
          >
            <span>Staff review portal</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Middle Row: Campus Zones & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campus Hotspots / Location Distribution */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Campus Activity by Location</h3>
                <p className="text-xs text-slate-500">600-Acre Campus Touchpoints</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-400">Reports</span>
          </div>

          <div className="space-y-3 pt-2">
            {sortedLocations.map(([location, count], idx) => {
              const pct = Math.round((count / items.length) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setLocationFilter(location);
                        navigateTo('browse');
                      }}
                      className="font-medium text-slate-700 hover:text-blue-600 text-left truncate max-w-[80%]"
                    >
                      {location}
                    </button>
                    <span className="font-bold text-slate-900">{count} items ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Items by Category</h3>
                <p className="text-xs text-slate-500">Distribution across belongings</p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('browse')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Browse All
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {CATEGORIES.slice(0, 8).map(cat => {
              const count = categoryCounts[cat.id] || 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategoryFilter(cat.id);
                    navigateTo('browse');
                  }}
                  className="p-3 rounded-2xl bg-slate-50/70 hover:bg-blue-50/60 border border-slate-200/80 text-left transition group"
                >
                  <p className="text-xs font-semibold text-slate-700 group-hover:text-blue-700 transition">
                    {cat.label}
                  </p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {count} <span className="text-[10px] font-normal text-slate-400">items</span>
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Items Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Recent Campus Reports</h3>
            <p className="text-xs text-slate-500">Items logged recently into CampusFind</p>
          </div>
          <button
            onClick={() => navigateTo('browse')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View Full Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.slice(0, 6).map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
