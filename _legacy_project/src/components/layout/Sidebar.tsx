import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import {
  LayoutDashboard,
  Layers,
  Calendar,
  Sparkles,
  Settings,
  Leaf,
  Cpu,
  ChevronRight
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Field metrics & irrigation status' },
  { id: 'my-field', label: 'My Field', icon: Layers, description: 'Field profiles & soil parameters' },
  { id: 'planner', label: 'Irrigation Planner', icon: Calendar, description: '7-day schedules & water savings' },
  { id: 'assistant', label: 'AI Assistant', icon: Sparkles, description: 'Ask AgroAI grounded advisor' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'Weather, IoT & model settings' },
];

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    fieldState,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    setIsAIDetailsOpen
  } = useSimulation();

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-[65px] bottom-0 left-0 z-50 lg:z-auto w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0'
        } min-h-[calc(100vh-65px)] overflow-y-auto`}
      >
        {/* Navigation Items (Exactly 5) */}
        <div className="p-4 space-y-2">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Menu
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || 
                (item.id === 'dashboard' && activeTab === 'overview') ||
                (item.id === 'my-field' && activeTab === 'field-management') ||
                (item.id === 'planner' && activeTab === 'schedule-planner');

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs transition-colors text-left ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold border-l-4 border-emerald-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer: Active Field Status & AI System Details Hub */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/60">
          {/* Quick Active Field pill */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium flex items-center space-x-1">
                <Leaf className="w-3.5 h-3.5 text-emerald-600 inline" />
                <span>Active Crop</span>
              </span>
              <span className="font-semibold text-slate-800">{fieldState.parameters.crop}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Soil Moisture</span>
              <span className="font-semibold text-emerald-700">{fieldState.soil.currentMoisture}%</span>
            </div>
          </div>

          {/* AI Concept Presentation Card */}
          <button
            onClick={() => setIsAIDetailsOpen(true)}
            className="w-full text-left p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 transition-colors group"
          >
            <div className="flex items-center space-x-2 text-emerald-800 font-semibold text-xs mb-1">
              <Cpu className="w-3.5 h-3.5 text-emerald-700" />
              <span>AI System Details</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-tight">
              Inspect all 6 AI concepts: FAO-56 math, Beam Search, rules, 6 agents, Edge AI & grounded assistant.
            </p>
          </button>
        </div>
      </aside>
    </>
  );
};
