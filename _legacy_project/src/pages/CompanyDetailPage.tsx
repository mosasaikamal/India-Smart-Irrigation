import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Clock,
  MapPin,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Bookmark,
  Share2,
  ChevronLeft,
  Sparkles,
  Printer,
  ChevronRight,
  FileCheck2
} from 'lucide-react';
import { usePlacement } from '../context/PlacementContext';
import { AcademicBranch } from '../types/placement';

export const CompanyDetailPage: React.FC = () => {
  const {
    selectedCompanyId,
    drives,
    syllabuses,
    navigateTo,
    userProfile,
    isCompanySaved,
    toggleSaveCompany,
    setIsDownloadModalOpen,
    getCompanyProgress,
    setSelectedBranch
  } = usePlacement();

  const [activeTab, setActiveTab] = useState<'ums-notice' | 'selection-rounds' | 'branch-tracks' | 'verification'>('ums-notice');

  const company = drives.find(d => d.id === selectedCompanyId) || drives[0];
  const syllabus = syllabuses[company.id];

  const isEligibleCgpa = userProfile.cgpa >= company.minCgpa;
  const isEligibleBranch = company.eligibleBranches.includes(userProfile.branch);
  const isSaved = isCompanySaved(company.id);
  const progress = getCompanyProgress(company.id, userProfile.branch);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Back to Drives Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('drives')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-navy-950 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Placement Drives</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSaveCompany(company.id)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
              isSaved
                ? 'bg-cyanAccent-50 border-cyanAccent-300 text-cyanAccent-700'
                : 'border-slate-200 text-slate-600 hover:text-navy-950'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>{isSaved ? 'Bookmarked' : 'Save Drive'}</span>
          </button>
        </div>
      </div>

      {/* Hero Banner: Company Header & Prominent Syllabus CTA */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-80 h-80 bg-cyanAccent-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${company.logoBg} text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-xl flex-shrink-0 ring-4 ring-white/10`}>
              {company.logoText}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-cyanAccent-300 border border-white/10">
                  {company.umsCircularId}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyanAccent-500 text-navy-950 font-black">
                  {company.status}
                </span>
                {company.tier && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/10 text-white">
                    {company.tier}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                {company.name}
              </h1>

              <p className="text-xs sm:text-sm text-cyanAccent-200 font-medium">
                {company.role} · {company.jobType} · <strong className="text-white">{company.ctcLpa} LPA</strong>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyanAccent-400" />
                  {company.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyanAccent-400" />
                  Drive: <strong className="text-white">{company.driveDate}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  Deadline: <strong className="text-white">{company.deadlineDate}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* CP6 Improvement 1: PROMINENT SYLLABUS ACCESS BUTTON */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0 bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="text-left lg:text-right">
              <span className="text-[10px] uppercase font-bold text-cyanAccent-400 block tracking-wider">
                Tested Usability Improvement (CP6)
              </span>
              <p className="text-xs text-slate-200">
                Verified syllabus placed at the very top of notice
              </p>
            </div>

            <button
              onClick={() => navigateTo('syllabus', company.id)}
              className="px-6 py-3.5 rounded-2xl bg-cyanAccent-500 hover:bg-cyanAccent-400 text-navy-950 font-black text-sm transition-all shadow-lg shadow-cyanAccent-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileText className="w-4 h-4 text-navy-950" />
              <span>Open Verified Prep Syllabus</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyanAccent-300" />
              <span>Download Syllabus PDF</span>
            </button>
          </div>

        </div>

        {/* Personalized Student Eligibility Alert Box */}
        <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Eligibility Status for {userProfile.name}:</span>
            <span className={`px-3 py-0.5 rounded-full font-bold text-xs ${
              isEligibleCgpa && isEligibleBranch
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {isEligibleCgpa && isEligibleBranch
                ? '✓ Eligible on UMS Portal'
                : !isEligibleCgpa
                ? `✕ CGPA (${userProfile.cgpa}) below cutoff (${company.minCgpa})`
                : `✕ Branch (${userProfile.branch}) not in eligible list`}
            </span>
          </div>

          <div className="text-slate-300 text-xs">
            Your branch preparation: <strong className="text-cyanAccent-400">{progress.percentage}% completed</strong>
          </div>
        </div>

      </div>

      {/* INTERACTIVE NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('ums-notice')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ums-notice'
              ? 'bg-navy-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Official UMS Administrative Notice</span>
        </button>

        <button
          onClick={() => setActiveTab('selection-rounds')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'selection-rounds'
              ? 'bg-navy-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Selection Process & Rounds ({company.selectionProcess.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('branch-tracks')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'branch-tracks'
              ? 'bg-navy-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Branch Preparation Tracks</span>
        </button>

        <button
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'verification'
              ? 'bg-navy-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Syllabus Verification & Trust</span>
        </button>
      </div>

      {/* TAB 1: OFFICIAL UMS ADMINISTRATIVE NOTICE */}
      {activeTab === 'ums-notice' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-navy-100 text-navy-900 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-navy-950">
                  Official Placement Compliance Notice
                </h3>
                <span className="text-[11px] text-slate-500">
                  Administrative rules published by Training & Placement Cell
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-navy-800 bg-slate-100 px-2 py-1 rounded">
              Ref: {company.umsCircularDate}
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <strong>Official Eligibility Summary:</strong> {company.officialEligibilitySummary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400">Academic Cutoffs</span>
              <p className="font-semibold text-slate-800">
                Min CGPA: <strong className="text-navy-950 font-bold">{company.officialNotice.cgpaCutoff}</strong> (Strict filter on portal)
              </p>
              <p className="text-slate-600">
                10th & 12th: <strong>{company.officialNotice.tenthTwelfthMinPercent}%</strong> aggregate
              </p>
              <p className="text-slate-600">
                Backlogs: <strong>{company.officialNotice.backlogsAllowed}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400">Reporting & Logistics</span>
              <p className="font-semibold text-slate-800">
                Reporting Time: <strong className="text-navy-950 font-bold">{company.officialNotice.reportingTime}</strong>
              </p>
              <p className="text-slate-600">
                Venue: <strong>{company.officialNotice.reportingVenue}</strong>
              </p>
              <p className="text-slate-600">
                Dress Code: <strong>{company.officialNotice.dressCode}</strong>
              </p>
            </div>
          </div>

          {/* Mandatory Documents Checklist */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Mandatory Documents to Carry / Upload:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              {company.officialNotice.mandatoryDocuments.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {company.officialNotice.serviceAgreementDetails && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <strong>Service Agreement / Bond:</strong> {company.officialNotice.serviceAgreementDetails}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SELECTION PROCESS & INTERVIEW ROUNDS */}
      {activeTab === 'selection-rounds' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fade-in">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-cyanAccent-100 text-cyanAccent-800 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-navy-950">
                Recruitment & Selection Process
              </h3>
              <span className="text-[11px] text-slate-500">
                Step-by-step interview rounds breakdown
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {company.selectionProcess.map((round, idx) => (
              <div
                key={round.roundNumber}
                className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-cyanAccent-300 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-navy-950 text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                  R{round.roundNumber}
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <h4 className="font-bold text-sm text-navy-950">{round.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyanAccent-100 text-cyanAccent-800">
                        {round.mode}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {round.duration}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{round.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => navigateTo('syllabus', company.id)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-navy-950 text-white text-xs font-bold hover:bg-navy-900 transition-colors shadow-md"
            >
              <span>View Technical Preparation Topics for These Rounds</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyanAccent-400" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: BRANCH PREPARATION TRACKS PREVIEW */}
      {activeTab === 'branch-tracks' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-navy-950">
                Branch-Specific Preparation Tracks
              </h3>
              <p className="text-xs text-slate-500">
                Dedicated curriculum customized for your academic domain
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['CSE/IT', 'ECE/EEE', 'ME/CE'] as AcademicBranch[]).map(b => {
              const branchData = syllabus ? syllabus.branchSyllabuses[b] : undefined;
              const isSelected = b === userProfile.branch;

              return (
                <div
                  key={b}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyanAccent-50/70 border-cyanAccent-300 ring-2 ring-cyanAccent-500/20'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-navy-950">{b} Track</span>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyanAccent-600 text-white">
                          Your Branch
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {branchData?.summary || 'Tailored branch syllabus'}
                    </p>
                    <div className="text-[11px] text-slate-500">
                      Duration: ~{branchData?.recommendedDurationWeeks || 4} Weeks
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedBranch(b);
                      navigateTo('syllabus', company.id, b);
                    }}
                    className="mt-4 w-full py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>Open {b} Syllabus</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyanAccent-400" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: VERIFICATION & CREDIBILITY */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-base text-navy-950">
                Syllabus Verification & Trust Metadata
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
              {syllabus?.confidenceScore}% Match
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Verifying Authority</span>
              <p className="font-bold text-navy-950">{syllabus?.verifiedBy}</p>
              <p className="text-[11px] text-slate-500">{syllabus?.verificationDate}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Source Evidence</span>
              <p className="text-slate-700 leading-relaxed text-[11px]">{syllabus?.sourceOfInformation}</p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Contributor Alumni & Placed Mentors:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {syllabus?.contributors.map((c, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-0.5">
                  <p className="font-bold text-navy-950">{c.name}</p>
                  <p className="text-[11px] text-slate-500">{c.batch} ({c.branch})</p>
                  <span className="text-[10px] font-bold text-cyanAccent-700 block mt-1">
                    Placed at: {c.companyPlaced}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Historical Pattern Disclaimer:</strong> {syllabus?.historicalPatternDisclaimer}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
