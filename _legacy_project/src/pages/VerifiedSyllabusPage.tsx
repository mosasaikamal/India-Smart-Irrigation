import React, { useState, useMemo } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Sparkles,
  Award,
  Layers,
  HelpCircle,
  Lightbulb,
  Clock,
  ArrowRight,
  GraduationCap,
  AlertCircle,
  ExternalLink,
  CheckSquare,
  Square,
  Search,
  Check,
  Filter,
  Flame,
  Code2
} from 'lucide-react';
import { usePlacement } from '../context/PlacementContext';
import { AcademicBranch, SyllabusTopic } from '../types/placement';

export const VerifiedSyllabusPage: React.FC = () => {
  const {
    selectedCompanyId,
    setSelectedCompanyId,
    selectedBranch,
    setSelectedBranch,
    drives,
    syllabuses,
    userProfile,
    toggleTopicCompletion,
    isTopicCompleted,
    toggleSaveCompany,
    isCompanySaved,
    setIsDownloadModalOpen,
    getCompanyProgress,
    showToast
  } = usePlacement();

  // Expanded topics state for detail views
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [activeFilterStatus, setActiveFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
  const [syllabusSearch, setSyllabusSearch] = useState('');

  const currentCompany = drives.find(d => d.id === selectedCompanyId) || drives[0];
  const syllabus = syllabuses[selectedCompanyId] || syllabuses['tcs-digital'];
  const branchData = syllabus.branchSyllabuses[selectedBranch];
  const progress = getCompanyProgress(currentCompany.id, selectedBranch);
  const isSaved = isCompanySaved(currentCompany.id);

  const toggleExpand = (topicId: string) => {
    setExpandedTopicId(expandedTopicId === topicId ? null : topicId);
  };

  const branchTabs: { key: AcademicBranch; label: string; desc: string; icon: string }[] = [
    { key: 'CSE/IT', label: 'CSE / IT Track', desc: 'DSA, DBMS, OOP & Code', icon: '💻' },
    { key: 'ECE/EEE', label: 'ECE / EEE Track', desc: 'Digital, Circuits & Micro', icon: '⚡' },
    { key: 'ME/CE', label: 'Mechanical / Civil', desc: 'SOM, Thermo & Mechanics', icon: '⚙️' }
  ];

  // Helper to mark entire module complete
  const markModuleComplete = (topics: SyllabusTopic[]) => {
    topics.forEach(t => {
      if (!isTopicCompleted(t.id)) {
        toggleTopicCompletion(t.id);
      }
    });
    showToast('All topics in module marked as complete!', 'success');
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner & Company Switcher */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        
        {/* Header row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyanAccent-50 text-cyanAccent-800 text-xs font-semibold border border-cyanAccent-200">
              <ShieldCheck className="w-3.5 h-3.5 text-cyanAccent-600" />
              <span>Core Feature: Verified Technical Syllabus Intelligence</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-navy-950 tracking-tight">
              Company-Specific Preparation Syllabus
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Alumni-verified curriculum for campus recruitment. Structured into Aptitude screening, branch-specific technical tracks, and interview round strategies.
            </p>
          </div>

          {/* Quick Actions & Company Select Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            
            {/* Company Switcher */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Select Company
              </label>
              <select
                value={selectedCompanyId}
                onChange={e => setSelectedCompanyId(e.target.value)}
                className="w-full sm:w-64 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-navy-950 focus:outline-none focus:ring-2 focus:ring-cyanAccent-500 shadow-2xs"
              >
                {drives.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.ctcLpa} LPA)
                  </option>
                ))}
              </select>
            </div>

            {/* Print / Download Button */}
            <div className="sm:pt-4 flex items-center gap-2">
              <button
                onClick={() => setIsDownloadModalOpen(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4 text-cyanAccent-400" />
                <span>Export / Print PDF</span>
              </button>

              <button
                onClick={() => toggleSaveCompany(currentCompany.id)}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isSaved
                    ? 'bg-cyanAccent-50 border-cyanAccent-300 text-cyanAccent-700'
                    : 'border-slate-200 text-slate-500 hover:text-navy-950'
                }`}
                title="Bookmark for quick preparation"
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </button>
            </div>

          </div>

        </div>

        {/* Dynamic Progress Overview for Selected Company */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Target Role</span>
            <p className="font-extrabold text-sm text-navy-950 truncate">{currentCompany.role}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Min CGPA Cutoff</span>
            <p className="font-extrabold text-sm text-navy-950">
              {currentCompany.minCgpa} (UMS Gate)
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Estimated Duration</span>
            <p className="font-extrabold text-sm text-navy-950">
              ~{branchData?.recommendedDurationWeeks || 4} Weeks Prep
            </p>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
              <span>Branch Progress</span>
              <span className="font-bold text-navy-950">{progress.percentage}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyanAccent-600 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* SECTION A: SYLLABUS VERIFICATION & TRUST METADATA (CP6 Usability Improvement 3) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-navy-950">
                  Section A: Verification & Source Attribution
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {syllabus.confidenceScore}% Evidence Match
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Transparent verification metadata ensuring reliable preparation guidance
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            Last Updated: <strong>{syllabus.lastUpdated}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Verifying Authority</span>
            <p className="font-bold text-navy-950">{syllabus.verifiedBy}</p>
            <p className="text-[11px] text-slate-500">{syllabus.verificationDate}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Source of Information</span>
            <p className="text-slate-700 leading-relaxed text-[11px]">
              {syllabus.sourceOfInformation}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Contributor Alumni</span>
            <div className="space-y-1">
              {syllabus.contributors.map((c, i) => (
                <p key={i} className="text-[11px] text-slate-700">
                  <strong className="text-navy-950">{c.name}</strong> · {c.role} ({c.batch})
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Clear Disclaimer Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Historical Pattern Guidance Disclaimer:</strong> {syllabus.historicalPatternDisclaimer}
          </p>
        </div>
      </div>

      {/* SECTION B: APTITUDE AND SCREENING ASSESSMENT */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-cyanAccent-50 text-cyanAccent-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-navy-950">
              Section B: Aptitude & Online Screening Assessment
            </h3>
            <p className="text-xs text-slate-500">
              Quantitative Aptitude, Logical Reasoning, and Problem-Solving screening patterns
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {syllabus.aptitudeScreening.map(category => (
            <div
              key={category.id}
              className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50/50"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <h4 className="font-bold text-sm text-navy-950">{category.title}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-navy-100 text-navy-950">
                  {category.questionCountEstimate}
                </span>
              </div>

              <p className="text-xs text-slate-600">{category.description}</p>

              <div className="space-y-2 pt-1">
                {category.topics.map(topic => {
                  const done = isTopicCompleted(topic.id);
                  const isExpanded = expandedTopicId === topic.id;

                  return (
                    <div
                      key={topic.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        done
                          ? 'bg-emerald-50/70 border-emerald-200'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() => toggleTopicCompletion(topic.id)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
                            aria-label={done ? 'Mark as incomplete' : 'Mark as completed'}
                          >
                            {done ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                            )}
                          </button>
                          <div>
                            <h5 className={`font-bold text-xs ${done ? 'line-through text-slate-400' : 'text-navy-950'}`}>
                              {topic.title}
                            </h5>
                            <p className="text-[11px] text-slate-500 mt-0.5">{topic.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            topic.difficulty === 'Hard'
                              ? 'bg-rose-100 text-rose-800'
                              : topic.difficulty === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {topic.difficulty}
                          </span>
                          <button
                            onClick={() => toggleExpand(topic.id)}
                            className="p-1 text-slate-400 hover:text-navy-950 rounded"
                            aria-label="Expand topic details"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Topic Details */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-2 animate-fade-in">
                          {topic.keyConcepts && (
                            <div className="flex flex-wrap gap-1">
                              {topic.keyConcepts.map((kc, i) => (
                                <span key={i} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono">
                                  #{kc}
                                </span>
                              ))}
                            </div>
                          )}
                          {topic.sampleQuestion && (
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                              <strong className="text-navy-950">Sample Question:</strong> {topic.sampleQuestion}
                            </div>
                          )}
                          {topic.preparationTip && (
                            <div className="flex items-start gap-1.5 text-[11px] text-cyanAccent-800 bg-cyanAccent-50/70 p-2 rounded-lg">
                              <Lightbulb className="w-3.5 h-3.5 text-cyanAccent-600 flex-shrink-0 mt-0.5" />
                              <span>{topic.preparationTip}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION C: BRANCH-SPECIFIC TECHNICAL PREPARATION (CP6 Usability Improvement 2) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
        
        {/* Branch Selection Header */}
        <div className="space-y-3 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-navy-100 text-navy-900 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-navy-950">
                  Section C: Branch-Specific Technical Preparation
                </h3>
                <p className="text-xs text-slate-500">
                  Select your academic branch for a 100% dedicated syllabus with zero cross-branch noise
                </p>
              </div>
            </div>

            <span className="text-[11px] font-semibold text-cyanAccent-800 bg-cyanAccent-50 px-2.5 py-1 rounded-full border border-cyanAccent-200">
              Current Profile: {userProfile.branch}
            </span>
          </div>

          {/* DEDICATED BRANCH SELECTION BUTTONS (CP6 Improvement 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {branchTabs.map(tab => {
              const isActive = selectedBranch === tab.key;
              const isUserProfileBranch = userProfile.branch === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedBranch(tab.key)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isActive
                      ? 'bg-navy-950 border-navy-950 text-white shadow-lg ring-2 ring-cyanAccent-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{tab.icon}</span>
                    {isUserProfileBranch && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isActive ? 'bg-cyanAccent-400 text-navy-950 font-black' : 'bg-navy-100 text-navy-900'
                      }`}>
                        Your Branch
                      </span>
                    )}
                  </div>
                  <div className={`font-black text-sm mt-2 ${isActive ? 'text-white' : 'text-navy-950'}`}>
                    {tab.label}
                  </div>
                  <p className={`text-[11px] mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                    {tab.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar: In-Syllabus Search, Difficulty Filter, Status Filter */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={syllabusSearch}
                onChange={e => setSyllabusSearch(e.target.value)}
                placeholder="Search topics (e.g. Arrays, SQL, Microcontroller, SOM)..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-cyanAccent-500"
              />
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-1.5 self-start md:self-auto">
              <span className="text-[11px] font-bold uppercase text-slate-400 mr-1">Difficulty:</span>
              {(['all', 'Easy', 'Medium', 'Hard'] as const).map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedDifficulty === diff
                      ? 'bg-navy-950 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {diff === 'all' ? 'All' : diff}
                </button>
              ))}
            </div>

            {/* Status Filter Toggle for Checklist */}
            <div className="flex items-center gap-1.5 self-start md:self-auto">
              <span className="text-[11px] font-bold uppercase text-slate-400 mr-1">Status:</span>
              <button
                onClick={() => setActiveFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  activeFilterStatus === 'all'
                    ? 'bg-navy-950 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilterStatus('pending')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  activeFilterStatus === 'pending'
                    ? 'bg-navy-950 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveFilterStatus('completed')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  activeFilterStatus === 'completed'
                    ? 'bg-navy-950 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                Done (✓)
              </button>
            </div>

          </div>
        </div>

        {/* Technical Modules and Topic Checklists (CP6 Improvement 4: reduced overload) */}
        <div className="space-y-6">
          {branchData?.modules.map(module => {
            const visibleTopics = module.topics.filter(topic => {
              // Search match
              const matchesSearch =
                topic.title.toLowerCase().includes(syllabusSearch.toLowerCase()) ||
                topic.description.toLowerCase().includes(syllabusSearch.toLowerCase()) ||
                (topic.keyConcepts && topic.keyConcepts.some(k => k.toLowerCase().includes(syllabusSearch.toLowerCase())));

              // Difficulty match
              const matchesDiff =
                selectedDifficulty === 'all' || topic.difficulty === selectedDifficulty;

              // Status match
              const isDone = isTopicCompleted(topic.id);
              let matchesStatus = true;
              if (activeFilterStatus === 'pending') matchesStatus = !isDone;
              if (activeFilterStatus === 'completed') matchesStatus = isDone;

              return matchesSearch && matchesDiff && matchesStatus;
            });

            if (visibleTopics.length === 0) return null;

            return (
              <div key={module.id} className="border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                  <div>
                    <h5 className="font-extrabold text-sm sm:text-base text-navy-950">{module.title}</h5>
                    <p className="text-xs text-slate-500">{module.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {module.category}
                    </span>
                    <button
                      onClick={() => markModuleComplete(visibleTopics)}
                      className="text-[11px] text-cyanAccent-700 hover:text-cyanAccent-800 font-bold underline"
                    >
                      Mark All Done
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  {visibleTopics.map(topic => {
                    const done = isTopicCompleted(topic.id);
                    const isExpanded = expandedTopicId === topic.id;

                    return (
                      <div
                        key={topic.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          done
                            ? 'bg-emerald-50/60 border-emerald-200'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleTopicCompletion(topic.id)}
                              className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
                              aria-label={done ? 'Mark as pending' : 'Mark as done'}
                            >
                              {done ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                              ) : (
                                <Square className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                              )}
                            </button>

                            <div className="space-y-1">
                              <h6 className={`font-bold text-xs sm:text-sm ${done ? 'line-through text-slate-400' : 'text-navy-950'}`}>
                                {topic.title}
                              </h6>
                              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                {topic.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              topic.difficulty === 'Hard'
                                ? 'bg-rose-100 text-rose-800'
                                : topic.difficulty === 'Medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {topic.difficulty} · ~{topic.estimatedHours}h
                            </span>

                            <button
                              onClick={() => toggleExpand(topic.id)}
                              className="p-1 text-slate-400 hover:text-navy-950 rounded"
                              aria-label="Toggle details"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Expandable card for detailed study guidance */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-2.5 animate-fade-in pl-8">
                            {topic.keyConcepts && (
                              <div>
                                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                                  Core Concepts to Review:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {topic.keyConcepts.map((kc, i) => (
                                    <span key={i} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono">
                                      #{kc}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {topic.sampleQuestion && (
                              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                                <strong className="text-navy-950 block mb-1">Frequently Asked Problem:</strong>
                                {topic.sampleQuestion}
                              </div>
                            )}

                            {topic.preparationTip && (
                              <div className="flex items-start gap-2 text-xs text-cyanAccent-900 bg-cyanAccent-50/80 p-3 rounded-xl border border-cyanAccent-200/60">
                                <Lightbulb className="w-4 h-4 text-cyanAccent-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <strong>Preparation Tip:</strong> {topic.preparationTip}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* SECTION D: INTERVIEW PREPARATION GUIDANCE */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-navy-950">
              Section D: Technical & HR Interview Strategy
            </h3>
            <p className="text-xs text-slate-500">
              Proven interview answers, STAR framework examples, and communication best practices
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {syllabus.interviewGuidance.map(round => (
            <div
              key={round.roundNumber}
              className="border border-slate-200 rounded-3xl p-5 space-y-4 bg-slate-50/40"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-navy-950 text-white font-extrabold text-xs flex items-center justify-center">
                    R{round.roundNumber}
                  </span>
                  <h4 className="font-bold text-sm text-navy-950">{round.roundName}</h4>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {round.duration}
                </span>
              </div>

              {/* Focus Areas */}
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Primary Focus Areas:
                </span>
                <ul className="space-y-1 text-xs text-slate-700">
                  {round.focusAreas.map((fa, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-cyanAccent-600 font-bold">•</span>
                      <span>{fa}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sample Questions & Approach */}
              {round.sampleQuestions.map((sq, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-2xs">
                  <p className="font-bold text-navy-950">
                    Q: "{sq.question}"
                  </p>
                  <p className="text-[11px] text-slate-500 italic">
                    Why they ask: {sq.context}
                  </p>
                  <div className="p-2.5 rounded-lg bg-cyanAccent-50/70 text-cyanAccent-900 text-[11px]">
                    <strong>Recommended Approach:</strong> {sq.recommendedApproach}
                  </div>
                </div>
              ))}

              {/* DOs & DON'Ts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                  <strong className="text-emerald-800 text-[11px] block">RECOMMENDED DOs:</strong>
                  <ul className="space-y-1 text-[11px] text-emerald-900">
                    {round.dos.map((d, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span>✓</span> <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-1">
                  <strong className="text-rose-800 text-[11px] block">CRITICAL DON'Ts:</strong>
                  <ul className="space-y-1 text-[11px] text-rose-900">
                    {round.donts.map((d, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span>✕</span> <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION E: PREPARATION CHECKLIST SUMMARY & ACTION BAR */}
      <div className="bg-gradient-to-r from-navy-950 to-navy-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs text-cyanAccent-400 font-bold uppercase tracking-wider">
            <CheckSquare className="w-4 h-4" />
            <span>Section E: Preparation Checklist & Progress</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Ready to track your progress or study offline?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            You've marked <strong className="text-cyanAccent-400">{progress.completed}</strong> of{' '}
            <strong className="text-white">{progress.total}</strong> topics complete for{' '}
            {currentCompany.name} ({selectedBranch}).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => setIsDownloadModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-cyanAccent-500 hover:bg-cyanAccent-400 text-navy-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print or Export PDF</span>
          </button>

          <button
            onClick={() => toggleSaveCompany(currentCompany.id)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/20 flex items-center justify-center gap-2"
          >
            <Bookmark className="w-4 h-4 text-cyanAccent-400" />
            <span>{isSaved ? 'Saved in My Preparation' : 'Save to My Prep'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
