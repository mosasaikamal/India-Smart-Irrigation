import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  Bell,
  CheckCircle2,
  BookOpen,
  Compass,
  FileText,
  UserCheck,
  Menu,
  X,
  ShieldAlert,
  ChevronDown,
  Info,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  Flame
} from 'lucide-react';
import { usePlacement, AppTab } from '../../context/PlacementContext';

export const Navbar: React.FC = () => {
  const {
    currentTab,
    navigateTo,
    userProfile,
    unreadNotifCount,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setIsAuthModalOpen,
    getOverallProgress,
    drives
  } = usePlacement();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [quickSearchText, setQuickSearchText] = useState('');
  
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const overallProgress = getOverallProgress();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setQuickSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setQuickSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks: { tab: AppTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { tab: 'home', label: 'Home', icon: Compass },
    { tab: 'dashboard', label: 'Dashboard', icon: GraduationCap },
    { tab: 'drives', label: 'Drives', icon: BookOpen },
    { tab: 'syllabus', label: 'Prep Syllabus', icon: FileText, badge: 'Core' },
    { tab: 'my-prep', label: 'My Prep', icon: CheckCircle2, badge: `${overallProgress.percentage}%` },
    { tab: 'rumours', label: 'Rumour Buster', icon: ShieldAlert },
    { tab: 'about', label: 'About DT', icon: Info }
  ];

  const filteredQuickDrives = drives.filter(d =>
    d.name.toLowerCase().includes(quickSearchText.toLowerCase()) ||
    d.role.toLowerCase().includes(quickSearchText.toLowerCase()) ||
    d.logoText.toLowerCase().includes(quickSearchText.toLowerCase())
  );

  const handleNavClick = (tab: AppTab) => {
    navigateTo(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-navy-950 via-navy-900 to-cyanAccent-600 flex items-center justify-center text-white shadow-lg shadow-cyanAccent-500/15 group-hover:scale-105 group-hover:shadow-cyanAccent-500/25 transition-all">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-cyanAccent-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-navy-950">
                    Beyond the <span className="text-cyanAccent-600">Rumour Mill</span>
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-navy-100 text-navy-800 border border-navy-200/80">
                    P08
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  INT335 Design Thinking · Lovely Professional University
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/60">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = currentTab === link.tab;
              return (
                <button
                  key={link.tab}
                  onClick={() => handleNavClick(link.tab)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-navy-900 text-white shadow-md shadow-navy-900/15'
                      : 'text-slate-600 hover:text-navy-950 hover:bg-white/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyanAccent-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-cyanAccent-400 text-navy-950 font-black'
                          : 'bg-cyanAccent-100 text-cyanAccent-900'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Utilities: Search, Notifications & User Profile */}
          <div className="flex items-center gap-2">
            
            {/* Quick Search Trigger */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setQuickSearchOpen(!quickSearchOpen)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-400 hover:text-slate-700 text-xs transition-colors"
                title="Search companies (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500">Search drives...</span>
                <kbd className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-400">
                  Ctrl K
                </kbd>
              </button>

              {/* Quick Search Popover */}
              {quickSearchOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-slide-up">
                  <div className="relative mb-2">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoFocus
                      value={quickSearchText}
                      onChange={e => setQuickSearchText(e.target.value)}
                      placeholder="Type company name (e.g. Google, TCS, L&T)..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyanAccent-500"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {filteredQuickDrives.length === 0 ? (
                      <p className="p-3 text-xs text-slate-400 text-center">No matching drives</p>
                    ) : (
                      filteredQuickDrives.map(d => (
                        <div
                          key={d.id}
                          onClick={() => {
                            navigateTo('company-detail', d.id);
                            setQuickSearchOpen(false);
                            setQuickSearchText('');
                          }}
                          className="p-2 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-7 h-7 rounded-lg ${d.logoBg} text-white font-bold text-[10px] flex items-center justify-center`}>
                              {d.logoText}
                            </span>
                            <div>
                              <p className="font-bold text-navy-950">{d.name}</p>
                              <p className="text-[10px] text-slate-500">{d.role}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-cyanAccent-700 bg-cyanAccent-50 px-2 py-0.5 rounded">
                            {d.ctcLpa} LPA
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-slide-up">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-cyanAccent-600" />
                      <span className="font-bold text-xs text-navy-900">Placement Alerts</span>
                      {unreadNotifCount > 0 && (
                        <span className="bg-rose-100 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {unreadNotifCount} new
                        </span>
                      )}
                    </div>
                    {unreadNotifCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] text-cyanAccent-600 hover:text-cyanAccent-700 font-semibold"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-xs text-slate-500 text-center">No notifications right now.</p>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            if (notif.companyId) {
                              navigateTo('company-detail', notif.companyId);
                              setNotifDropdownOpen(false);
                            }
                          }}
                          className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                            notif.unread ? 'bg-cyanAccent-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-semibold text-navy-900">{notif.title}</h4>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {notif.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notif.message}</p>
                          {notif.companyId && (
                            <span className="inline-block mt-1.5 text-[10px] font-semibold text-cyanAccent-600 hover:underline">
                              View Drive Details →
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-4 pt-2 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        navigateTo('drives');
                        setNotifDropdownOpen(false);
                      }}
                      className="text-xs text-navy-700 hover:text-navy-900 font-bold"
                    >
                      Browse All Placement Drives
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Student Profile Quick Switcher Pill */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-2xl border border-slate-200 hover:border-cyanAccent-400 hover:bg-slate-50 transition-all text-left focus:outline-none group shadow-2xs"
              title="Click to switch student persona or test branches"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-navy-950 to-navy-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-cyanAccent-500/20 shadow-sm">
                {userProfile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-navy-950 group-hover:text-cyanAccent-600 transition-colors">
                    {userProfile.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyanAccent-100 text-cyanAccent-900 font-bold">
                    {userProfile.branch}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <span>CGPA {userProfile.cgpa.toFixed(2)}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-cyanAccent-700 font-semibold group-hover:underline">Switch Persona</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 hidden sm:block" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded-xl focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1.5 animate-slide-up">
          <div className="p-3 mb-2 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-200/80">
            <div>
              <p className="text-xs font-bold text-navy-950">{userProfile.name}</p>
              <p className="text-[11px] text-slate-500">{userProfile.branch} · CGPA {userProfile.cgpa}</p>
            </div>
            <button
              onClick={() => {
                setIsAuthModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="text-xs font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-cyanAccent-800 shadow-2xs"
            >
              Switch Persona
            </button>
          </div>

          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = currentTab === link.tab;
            return (
              <button
                key={link.tab}
                onClick={() => handleNavClick(link.tab)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-navy-900 text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyanAccent-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-cyanAccent-400 text-navy-950' : 'bg-cyanAccent-100 text-cyanAccent-900'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
