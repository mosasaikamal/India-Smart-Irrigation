import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Bookmark,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowUpDown,
  GraduationCap,
  Sparkles,
  ExternalLink,
  LayoutGrid,
  List,
  Flame,
  Check,
  X
} from 'lucide-react';
import { usePlacement } from '../context/PlacementContext';
import { AcademicBranch, CompanyDrive, DriveStatus } from '../types/placement';

export const PlacementDrivesPage: React.FC = () => {
  const {
    drives,
    navigateTo,
    userProfile,
    isCompanySaved,
    toggleSaveCompany,
    getCompanyProgress,
    drivesViewMode,
    setDrivesViewMode,
    filterOnlyEligible,
    setFilterOnlyEligible
  } = usePlacement();

  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [maxCgpaFilter, setMaxCgpaFilter] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'package' | 'cgpa'>('date');

  // Filtered & Sorted Drives
  const filteredDrives = useMemo(() => {
    return drives
      .filter(drive => {
        // Search filter
        const matchesSearch =
          drive.name.toLowerCase().includes(search.toLowerCase()) ||
          drive.role.toLowerCase().includes(search.toLowerCase()) ||
          drive.location.toLowerCase().includes(search.toLowerCase());

        // Branch filter
        const matchesBranch =
          selectedBranch === 'ALL' ||
          drive.eligibleBranches.includes(selectedBranch as AcademicBranch);

        // CGPA filter
        let matchesCgpa = true;
        if (maxCgpaFilter !== 'ALL') {
          const threshold = parseFloat(maxCgpaFilter);
          matchesCgpa = drive.minCgpa <= threshold;
        }

        // Status filter
        const matchesStatus =
          selectedStatus === 'ALL' || drive.status === selectedStatus;

        // Tier filter
        const matchesTier =
          selectedTier === 'ALL' || drive.tier === selectedTier;

        // "Only Eligible for Me" Toggle
        let matchesMyEligibility = true;
        if (filterOnlyEligible) {
          const eligibleBranch = drive.eligibleBranches.includes(userProfile.branch);
          const eligibleCgpa = userProfile.cgpa >= drive.minCgpa;
          matchesMyEligibility = eligibleBranch && eligibleCgpa;
        }

        return matchesSearch && matchesBranch && matchesCgpa && matchesStatus && matchesTier && matchesMyEligibility;
      })
      .sort((a, b) => {
        if (sortBy === 'package') {
          const getNum = (val: string | number) =>
            typeof val === 'number' ? val : parseFloat(val.toString().split('-')[0]) || 0;
          return getNum(b.ctcLpa) - getNum(a.ctcLpa);
        }
        if (sortBy === 'cgpa') {
          return a.minCgpa - b.minCgpa;
        }
        // Default: date order
        return a.driveDate.localeCompare(b.driveDate);
      });
  }, [drives, search, selectedBranch, maxCgpaFilter, selectedStatus, selectedTier, sortBy, filterOnlyEligible, userProfile]);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyanAccent-50 text-cyanAccent-800 text-xs font-semibold border border-cyanAccent-200">
            <Building2 className="w-3.5 h-3.5" />
            <span>Active Placement Season · Lovely Professional University</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-navy-950 tracking-tight">
            Upcoming Placement Drives
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Browse verified company recruitment drives. Check official UMS eligibility criteria and access alumni-verified technical preparation syllabuses.
          </p>
        </div>

        {/* View Mode Toggle: Grid vs List */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setDrivesViewMode('grid')}
            className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              drivesViewMode === 'grid'
                ? 'bg-white text-navy-950 shadow-sm'
                : 'text-slate-500 hover:text-navy-950'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => setDrivesViewMode('list')}
            className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              drivesViewMode === 'list'
                ? 'bg-white text-navy-950 shadow-sm'
                : 'text-slate-500 hover:text-navy-950'
            }`}
            title="Compact List View"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        
        {/* Search Input & Quick Eligibility Switch */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by company name, job role, or location (e.g., Google, Software Engineer, TCS)..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyanAccent-500 text-xs sm:text-sm placeholder:text-slate-400 bg-slate-50/50"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* "Only Eligible for Me" Smart Toggle */}
          <button
            onClick={() => setFilterOnlyEligible(!filterOnlyEligible)}
            className={`px-4 py-3 rounded-2xl border text-xs font-extrabold transition-all flex items-center justify-center gap-2 flex-shrink-0 ${
              filterOnlyEligible
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${filterOnlyEligible ? 'text-white' : 'text-slate-400'}`} />
            <span>Only Eligible for Me ({userProfile.branch}, {userProfile.cgpa} CGPA)</span>
          </button>
        </div>

        {/* Tier Pills Filter */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Package Tier:</span>
          {['ALL', 'Super Dream', 'Dream', 'Standard'].map(tier => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedTier === tier
                  ? 'bg-navy-950 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tier === 'ALL' ? 'All Tiers' : tier}
            </button>
          ))}
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          
          {/* Branch Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Eligible Branch
            </label>
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-navy-950 focus:outline-none focus:ring-2 focus:ring-cyanAccent-500"
            >
              <option value="ALL">All Branches</option>
              <option value="CSE/IT">CSE / IT Only</option>
              <option value="ECE/EEE">ECE / EEE Only</option>
              <option value="ME/CE">Mechanical / Civil Only</option>
            </select>
          </div>

          {/* Min CGPA Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Minimum CGPA Cutoff
            </label>
            <select
              value={maxCgpaFilter}
              onChange={e => setMaxCgpaFilter(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-navy-950 focus:outline-none focus:ring-2 focus:ring-cyanAccent-500"
            >
              <option value="ALL">All Cutoffs</option>
              <option value="6.5">CGPA ≤ 6.5</option>
              <option value="7.0">CGPA ≤ 7.0</option>
              <option value="7.5">CGPA ≤ 7.5</option>
              <option value="8.0">CGPA ≤ 8.0</option>
            </select>
          </div>

          {/* Drive Status Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Drive Status
            </label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-navy-950 focus:outline-none focus:ring-2 focus:ring-cyanAccent-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open for Registration</option>
              <option value="Closing Soon">Closing Soon</option>
              <option value="Upcoming">Upcoming</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-navy-950 focus:outline-none focus:ring-2 focus:ring-cyanAccent-500"
            >
              <option value="date">Drive Date (Earliest First)</option>
              <option value="package">Highest Package (LPA)</option>
              <option value="cgpa">Lowest CGPA Cutoff</option>
            </select>
          </div>

        </div>

        {/* Filter Summary Tags */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-2">
          <span>
            Showing <strong>{filteredDrives.length}</strong> of {drives.length} placement drives
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px]">Logged in as:</span>
            <span className="font-extrabold text-navy-950 bg-cyanAccent-100 px-2 py-0.5 rounded text-xs">
              {userProfile.name.split(' ')[0]} ({userProfile.branch}, CGPA {userProfile.cgpa})
            </span>
          </div>
        </div>
      </div>

      {/* Drives Display (Grid View vs List View) */}
      {filteredDrives.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3">
          <Search className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-navy-950">No placement drives found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, branch filter, or disabling the "Only Eligible" switch.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedBranch('ALL');
              setMaxCgpaFilter('ALL');
              setSelectedStatus('ALL');
              setSelectedTier('ALL');
              setFilterOnlyEligible(false);
            }}
            className="text-xs font-bold text-cyanAccent-700 hover:underline pt-2"
          >
            Reset all filters
          </button>
        </div>
      ) : drivesViewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrives.map(drive => {
            const isEligibleBranch = drive.eligibleBranches.includes(userProfile.branch);
            const isEligibleCgpa = userProfile.cgpa >= drive.minCgpa;
            const progress = getCompanyProgress(drive.id, userProfile.branch);
            const isSaved = isCompanySaved(drive.id);
            const daysLeft = drive.urgencyDaysLeft || 5;

            return (
              <div
                key={drive.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-card-hover transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  
                  {/* Top Bar: Logo, Badge, Bookmark */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${drive.logoBg} text-white font-black text-sm flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition-transform`}>
                        {drive.logoText}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            drive.status === 'Closing Soon'
                              ? 'bg-rose-100 text-rose-800'
                              : drive.status === 'Open'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {drive.status}
                          </span>
                          {drive.tier && (
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {drive.tier}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {drive.umsCircularId}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSaveCompany(drive.id)}
                      className={`p-2 rounded-xl border transition-colors ${
                        isSaved
                          ? 'bg-cyanAccent-50 border-cyanAccent-300 text-cyanAccent-700'
                          : 'border-slate-200 text-slate-400 hover:text-navy-950 hover:border-slate-300'
                      }`}
                      title={isSaved ? 'Bookmarked' : 'Bookmark Drive'}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Company & Role Name */}
                  <div>
                    <h3 className="font-extrabold text-base text-navy-950 line-clamp-1 group-hover:text-cyanAccent-700 transition-colors">
                      {drive.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1 font-medium">
                      {drive.role}
                    </p>
                  </div>

                  {/* Key Metrics Pill Grid */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Package</span>
                      <p className="font-black text-navy-950">{drive.ctcLpa} LPA</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Min CGPA</span>
                      <p className={`font-black ${isEligibleCgpa ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {drive.minCgpa} {isEligibleCgpa ? '✓' : '(Cutoff)'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Drive Date</span>
                      <p className="font-semibold text-slate-800">{drive.driveDate}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Urgency</span>
                      <p className={`font-bold ${daysLeft <= 3 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {daysLeft} days left
                      </p>
                    </div>
                  </div>

                  {/* Branch Eligibility Tags */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Eligible Branches:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {drive.eligibleBranches.map(b => {
                        const isCurrent = b === userProfile.branch;
                        return (
                          <span
                            key={b}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              isCurrent
                                ? 'bg-cyanAccent-600 text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {b} {isCurrent && '★'}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preparation Progress Indicator */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-medium text-slate-500">
                      <span>Your Branch Prep Progress</span>
                      <span className="font-bold text-navy-950">{progress.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyanAccent-600 rounded-full transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>

                </div>

                {/* CP6 Usability Fix: Prominent Prep Syllabus Button */}
                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => navigateTo('company-detail', drive.id)}
                    className="flex-1 py-2.5 text-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    UMS Notice Details
                  </button>

                  <button
                    onClick={() => navigateTo('syllabus', drive.id)}
                    className="flex-1 py-2.5 text-center rounded-xl bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 group-hover:bg-cyanAccent-700"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyanAccent-300" />
                    <span>Prep Syllabus</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* COMPACT LIST VIEW */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {filteredDrives.map(drive => {
            const isEligibleBranch = drive.eligibleBranches.includes(userProfile.branch);
            const isEligibleCgpa = userProfile.cgpa >= drive.minCgpa;
            const progress = getCompanyProgress(drive.id, userProfile.branch);
            const isSaved = isCompanySaved(drive.id);

            return (
              <div
                key={drive.id}
                className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-2xl ${drive.logoBg} text-white font-black text-sm flex items-center justify-center shadow-md flex-shrink-0`}>
                    {drive.logoText}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-navy-950">{drive.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyanAccent-50 text-cyanAccent-800">
                        {drive.role}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isEligibleCgpa && isEligibleBranch ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isEligibleCgpa && isEligibleBranch ? 'Eligible' : 'Check Criteria'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
                      <span>Package: <strong className="text-navy-950 font-bold">{drive.ctcLpa} LPA</strong></span>
                      <span>Min CGPA: <strong className="text-navy-950 font-bold">{drive.minCgpa}</strong></span>
                      <span>Drive Date: <strong className="text-slate-800">{drive.driveDate}</strong></span>
                      <span>Branches: {drive.eligibleBranches.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
                  <button
                    onClick={() => toggleSaveCompany(drive.id)}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      isSaved
                        ? 'bg-cyanAccent-50 border-cyanAccent-300 text-cyanAccent-700'
                        : 'border-slate-200 text-slate-400 hover:text-navy-950'
                    }`}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    onClick={() => navigateTo('company-detail', drive.id)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800"
                  >
                    UMS Notice
                  </button>
                  <button
                    onClick={() => navigateTo('syllabus', drive.id)}
                    className="px-4 py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyanAccent-400" />
                    <span>Prep Syllabus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
