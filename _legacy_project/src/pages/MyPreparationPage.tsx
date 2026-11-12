import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Calendar,
  Bookmark,
  FileText,
  Printer,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  Square,
  ArrowRight,
  GraduationCap,
  RotateCcw,
  Search,
  Filter,
  Flame,
  Check
} from 'lucide-react';
import { usePlacement } from '../context/PlacementContext';
import { AcademicBranch } from '../types/placement';

export const MyPreparationPage: React.FC = () => {
  const {
    userProfile,
    drives,
    syllabuses,
    navigateTo,
    toggleTopicCompletion,
    isTopicCompleted,
    getCompanyTopics,
    getCompanyProgress,
    getOverallProgress,
    setIsDownloadModalOpen,
    setSelectedCompanyId,
    setSelectedBranch,
    showToast
  } = usePlacement();

  // Active company selected in the tracker
  const [activeCompanyId, setActiveCompanyId] = useState<string>(
    userProfile.savedCompanyIds[0] || 'tcs-digital'
  );
  const [activeBranch, setActiveBranch] = useState<AcademicBranch>(userProfile.branch);
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');
  const [prepSearch, setPrepSearch] = useState('');

  const currentCompany = drives.find(d => d.id === activeCompanyId) || drives[0];
  const syllabus = syllabuses[currentCompany.id];
  const topics = getCompanyTopics(currentCompany.id, activeBranch);
  const progress = getCompanyProgress(currentCompany.id, activeBranch);
  const overall = getOverallProgress();

  const completedTopicsList = topics.filter(t => isTopicCompleted(t.id));
  const pendingTopicsList = topics.filter(t => !isTopicCompleted(t.id));

  const visibleTopics = topics.filter(t => {
    const isDone = isTopicCompleted(t.id);
    let matchesStatus = true;
    if (filterMode === 'pending') matchesStatus = !isDone;
    if (filterMode === 'completed') matchesStatus = isDone;

    const matchesSearch =
      t.title.toLowerCase().includes(prepSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(prepSearch.toLowerCase()) ||
      (t.keyConcepts && t.keyConcepts.some(k => k.toLowerCase().includes(prepSearch.toLowerCase())));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyanAccent-50 text-cyanAccent-800 text-xs font-semibold border border-cyanAccent-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyanAccent-600" />
          <span>Personal Placement Tracker · {userProfile.name}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-navy-950 tracking-tight">
          My Preparation Tracker
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
          Track completed syllabus modules, monitor real-time readiness scores, and keep upcoming drive deadlines in focus.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Overall Platform Progress */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Curriculum Readiness
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-navy-950">{overall.percentage}%</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              {overall.completed} / {overall.total} Topics
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-navy-950 to-cyanAccent-600 rounded-full transition-all duration-300"
              style={{ width: `${overall.percentage}%` }}
            />
          </div>
        </div>

        {/* Card 2: Active Company Progress */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {currentCompany.name.split('(')[0]} Readiness
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-cyanAccent-600">{progress.percentage}%</span>
            <span className="text-xs font-bold text-cyanAccent-800 bg-cyanAccent-50 px-2 py-0.5 rounded">
              {progress.completed} of {progress.total} Done
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-cyanAccent-500 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* Card 3: Upcoming Drive Countdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Drive Date Alert
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-navy-950">{currentCompany.driveDate}</span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              {currentCompany.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate">
            Registration deadline: <strong>{currentCompany.deadlineDate}</strong>
          </p>
        </div>

      </div>

      {/* Tracker Controls: Company Switcher & Branch Switcher */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          
          {/* Company Picker */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Select Target Company:
            </label>
            <div className="flex flex-wrap gap-2">
              {drives.map(d => {
                const isSelected = d.id === activeCompanyId;
                const isSaved = userProfile.savedCompanyIds.includes(d.id);
                return (
                  <button
                    key={d.id}
                    onClick={() => setActiveCompanyId(d.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-navy-950 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{d.logoText}</span>
                    <span className="ml-1.5 hidden sm:inline">{d.name.split(' ')[0]}</span>
                    {isSaved && <span className="ml-1 text-cyanAccent-400">★</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Academic Branch Picker */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Academic Branch Syllabus:
            </label>
            <div className="flex items-center gap-1.5">
              {(['CSE/IT', 'ECE/EEE', 'ME/CE'] as AcademicBranch[]).map(b => (
                <button
                  key={b}
                  onClick={() => setActiveBranch(b)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeBranch === b
                      ? 'bg-cyanAccent-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Filter Toolbar: Search, Status Filter & Print */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={prepSearch}
              onChange={e => setPrepSearch(e.target.value)}
              placeholder="Search checklist topics..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-cyanAccent-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  filterMode === 'all' ? 'bg-navy-950 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({topics.length})
              </button>
              <button
                onClick={() => setFilterMode('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  filterMode === 'pending' ? 'bg-navy-950 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pending ({pendingTopicsList.length})
              </button>
              <button
                onClick={() => setFilterMode('completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  filterMode === 'completed' ? 'bg-navy-950 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Done ({completedTopicsList.length})
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedCompanyId(currentCompany.id);
                setSelectedBranch(activeBranch);
                setIsDownloadModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy-950 text-xs font-bold transition-colors ml-auto sm:ml-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

      </div>

      {/* Topics Checklist Table / Cards */}
      <div className="space-y-3">
        {visibleTopics.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-300 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-sm text-navy-950">No topics in this view</h4>
            <p className="text-xs text-slate-500">
              {filterMode === 'completed'
                ? "You haven't marked any topics as completed yet. Start checking off items!"
                : "All matching topics completed! Keep up the momentum!"}
            </p>
          </div>
        ) : (
          visibleTopics.map(topic => {
            const isDone = isTopicCompleted(topic.id);

            return (
              <div
                key={topic.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  isDone
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTopicCompletion(topic.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
                    aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <h5 className={`font-bold text-xs sm:text-sm ${isDone ? 'line-through text-slate-400' : 'text-navy-950'}`}>
                      {topic.title}
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {topic.description}
                    </p>
                    {topic.keyConcepts && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {topic.keyConcepts.map((kc, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">
                            #{kc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    topic.difficulty === 'Hard'
                      ? 'bg-rose-100 text-rose-800'
                      : topic.difficulty === 'Medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {topic.difficulty}
                  </span>
                  <span className="text-[10px] text-slate-400">~{topic.estimatedHours} hrs</span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
