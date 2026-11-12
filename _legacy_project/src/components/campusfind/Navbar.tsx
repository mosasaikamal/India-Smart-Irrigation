import React, { useState } from 'react';
import { useCampusFind } from '../../context/CampusFindContext';
import { 
  Compass, 
  Menu, 
  X,
  ShieldCheck,
  User,
  ChevronDown
} from 'lucide-react';

export const CampusFindNavbar: React.FC = () => {
  const { currentTab, navigateTo, role, toggleRole } = useCampusFind();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reportDropdownOpen, setReportDropdownOpen] = useState(false);

  const handleNav = (tab: any) => {
    navigateTo(tab);
    setMobileMenuOpen(false);
    setReportDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* CampusFind Logo */}
          <button 
            onClick={() => handleNav('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-slate-900">CampusFind</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">LPU P04</span>
              </div>
            </div>
          </button>

          {/* Minimal Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleNav('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                currentTab === 'home'
                  ? 'text-blue-600 font-semibold bg-blue-50/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNav('browse')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                currentTab === 'browse'
                  ? 'text-blue-600 font-semibold bg-blue-50/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Find an Item
            </button>

            {/* Report an Item Dropdown */}
            <div className="relative">
              <button
                onClick={() => setReportDropdownOpen(!reportDropdownOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  currentTab === 'report-lost' || currentTab === 'report-found'
                    ? 'text-blue-600 font-semibold bg-blue-50/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>Report an Item</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {reportDropdownOpen && (
                <div 
                  className="absolute left-0 mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-50 text-xs animate-in fade-in"
                  onMouseLeave={() => setReportDropdownOpen(false)}
                >
                  <button
                    onClick={() => handleNav('report-lost')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex flex-col"
                  >
                    <span className="font-semibold text-rose-600">Report a Lost Item</span>
                    <span className="text-[11px] text-slate-400">If you lost your belonging</span>
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={() => handleNav('report-found')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex flex-col"
                  >
                    <span className="font-semibold text-blue-600">Report a Found Item</span>
                    <span className="text-[11px] text-slate-400">If you found someone's item</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNav('my-reports')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                currentTab === 'my-reports' || currentTab === 'claim-status'
                  ? 'text-blue-600 font-semibold bg-blue-50/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              My Reports
            </button>

            <button
              onClick={() => handleNav('help')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                currentTab === 'help' || currentTab === 'design-thinking'
                  ? 'text-blue-600 font-semibold bg-blue-50/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Help
            </button>
          </nav>

          {/* Right Action: Clean Demo Role Switcher & Staff Access */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={toggleRole}
              title="Click to toggle between Student view and Staff/Security view (for Project Demonstration)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                role === 'staff'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {role === 'staff' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Staff Mode</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Student View</span>
                </>
              )}
            </button>

            {role === 'staff' && (
              <button
                onClick={() => handleNav('admin')}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                Staff Portal
              </button>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg">
          <button
            onClick={() => handleNav('home')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'home' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('browse')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'browse' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700'
            }`}
          >
            Find an Item
          </button>
          <button
            onClick={() => handleNav('report-lost')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'report-lost' ? 'bg-rose-50 text-rose-600 font-semibold' : 'text-slate-700'
            }`}
          >
            Report a Lost Item
          </button>
          <button
            onClick={() => handleNav('report-found')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'report-found' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700'
            }`}
          >
            Report a Found Item
          </button>
          <button
            onClick={() => handleNav('my-reports')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'my-reports' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700'
            }`}
          >
            My Reports & Claims
          </button>
          <button
            onClick={() => handleNav('help')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'help' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700'
            }`}
          >
            Help & FAQs
          </button>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={toggleRole}
              className="text-xs text-slate-600 font-medium py-1"
            >
              Mode: {role === 'staff' ? 'Staff' : 'Student'} (Tap to switch)
            </button>
            {role === 'staff' && (
              <button
                onClick={() => handleNav('admin')}
                className="text-xs font-bold text-blue-600"
              >
                Open Staff Portal →
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
