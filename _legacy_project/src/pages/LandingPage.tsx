import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  BookOpen,
  Layers,
  Users,
  Compass,
  Download,
  Search,
  ExternalLink,
  ChevronRight,
  Award,
  Clock,
  Flame,
  Check,
  X,
  Building2,
  SlidersHorizontal
} from 'lucide-react';
import { usePlacement } from '../context/PlacementContext';
import { AcademicBranch } from '../types/placement';

export const LandingPage: React.FC = () => {
  const { navigateTo, drives, syllabuses, getOverallProgress, setSelectedBranch, setSelectedCompanyId } = usePlacement();
  const overallProgress = getOverallProgress();

  // Interactive Live Simulator State (WhatsApp Mode vs Verified Mode)
  const [simulatorMode, setSimulatorMode] = useState<'rumour' | 'verified'>('verified');

  // Interactive Branch Matcher State
  const [interactiveBranch, setInteractiveBranch] = useState<AcademicBranch>('CSE/IT');

  const eligibleDrivesForBranch = drives.filter(d => d.eligibleBranches.includes(interactiveBranch));

  return (
    <div className="space-y-16 sm:space-y-28 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-14">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-gradient-to-tr from-cyanAccent-300/20 via-blue-200/25 to-purple-200/20 blur-3xl -z-10 pointer-events-none rounded-full" />

        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-950 text-white text-xs font-semibold shadow-lg shadow-navy-950/10 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-cyanAccent-400 animate-pulse" />
            <span>Lovely Professional University · Design Thinking Project P08</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-navy-950 tracking-tight leading-[1.12]">
            Stop Guessing. <br />
            Start Preparing with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-navy-950 via-cyanAccent-700 to-cyanAccent-500">
              Verified Information.
            </span>
          </h1>

          {/* Problem & Solution Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Pre-final and final-year students at LPU struggle with contradictory WhatsApp advice and Telegram noise.
            <strong className="text-navy-950 font-bold"> Beyond the Rumour Mill</strong> combines official UMS placement notices with verified, company-specific technical preparation syllabuses tailored to your engineering branch.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => navigateTo('drives')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-navy-950 hover:bg-navy-900 text-white font-black text-sm shadow-xl shadow-navy-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <BookOpen className="w-4 h-4 text-cyanAccent-400" />
              <span>Explore Placement Drives</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigateTo('syllabus', 'tcs-digital')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 text-navy-950 border border-slate-300/90 font-bold text-sm shadow-sm hover:border-slate-400 transition-all"
            >
              <FileText className="w-4 h-4 text-cyanAccent-600" />
              <span>View Verified Prep Syllabus</span>
            </button>
          </div>

          <div className="flex items-center justify-center flex-wrap gap-6 pt-3 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified by Alumni & T&P Mentors
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyanAccent-600" />
              Dedicated CSE, ECE, & ME/CE Tracks
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Tested Usability Iterations (CP6)
            </span>
          </div>
        </div>

        {/* INTERACTIVE FEATURE 1: LIVE RUMOUR MILL VS VERIFIED SIMULATOR */}
        <div className="mt-14 sm:mt-18 max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
            
            {/* Simulator Header & Toggle Switch */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-cyanAccent-700">
                  Interactive Concept Simulator
                </span>
                <h3 className="text-xl font-black text-navy-950">
                  See the Real Difference for LPU Students
                </h3>
                <p className="text-xs text-slate-500">Toggle between the current student experience and our solution</p>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start sm:self-auto">
                <button
                  onClick={() => setSimulatorMode('rumour')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    simulatorMode === 'rumour'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>WhatsApp Rumour Mode</span>
                </button>
                <button
                  onClick={() => setSimulatorMode('verified')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    simulatorMode === 'verified'
                      ? 'bg-navy-950 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyanAccent-400" />
                  <span>Verified Platform Mode</span>
                </button>
              </div>
            </div>

            {/* Dynamic Comparison Content */}
            {simulatorMode === 'rumour' ? (
              <div className="p-6 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-5 animate-fade-in">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    <span>The Unofficial Rumour Mill: High Anxiety, Zero Verification</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900">
                    Average Preparation Confidence: 24%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-rose-100 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Average Time Wasted</span>
                    <p className="text-xl font-black text-rose-600">18 - 25 Hours</p>
                    <p className="text-[11px] text-slate-500">Studying irrelevant frameworks and unverified topics</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-rose-100 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Information Noise</span>
                    <p className="text-xl font-black text-rose-600">450+ Messages</p>
                    <p className="text-[11px] text-slate-500">Contradictory opinions on WhatsApp & Telegram</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-rose-100 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Student Anxiety Index</span>
                    <p className="text-xl font-black text-rose-600">88% (Severe)</p>
                    <p className="text-[11px] text-slate-500">Panic during 48 hours prior to drive assessment</p>
                  </div>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-rose-200 text-xs text-rose-950 italic">
                  💬 Typical forward: "Guys someone from 2024 batch told me TCS Digital cancelled all coding for ECE and is only asking GK! Don't study DSA!"
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-cyanAccent-50/70 border border-cyanAccent-300 space-y-5 animate-fade-in">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-navy-950 font-extrabold text-sm">
                    <ShieldCheck className="w-5 h-5 text-cyanAccent-700" />
                    <span>Beyond the Rumour Mill: Verified Technical Syllabus Intelligence</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Average Preparation Confidence: 94%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-cyanAccent-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Time Wasted on Noise</span>
                    <p className="text-xl font-black text-emerald-600">0 Hours</p>
                    <p className="text-[11px] text-slate-500">100% focused on company-verified topics</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-cyanAccent-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Source Attribution</span>
                    <p className="text-xl font-black text-navy-950">1 Verified Roadmap</p>
                    <p className="text-[11px] text-slate-500">Backed by placed alumni debriefs & T&P guidelines</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-cyanAccent-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Preparation Confidence</span>
                    <p className="text-xl font-black text-emerald-600">94% Index</p>
                    <p className="text-[11px] text-slate-500">Structured checklists with dynamic progress calculation</p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white/90 p-3.5 rounded-xl border border-cyanAccent-200 text-xs">
                  <div className="text-navy-950 font-medium">
                    ✨ Verified clarity: Official UMS criteria + dedicated branch syllabus + interview guidance in one click.
                  </div>
                  <button
                    onClick={() => navigateTo('syllabus', 'tcs-digital')}
                    className="text-xs font-bold text-cyanAccent-800 hover:underline flex items-center gap-1 flex-shrink-0"
                  >
                    View Interactive Syllabus →
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* INTERACTIVE FEATURE 2: 1-CLICK BRANCH MATCHER WIDGET */}
        <div className="mt-12 max-w-5xl mx-auto">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 bg-cyanAccent-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyanAccent-400 block mb-1">
                  Instant Branch Matcher
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Pick Your Branch to See Matching Companies & Tailored Syllabuses
                </h3>
              </div>

              {/* Branch Selector Buttons */}
              <div className="flex items-center gap-2">
                {(['CSE/IT', 'ECE/EEE', 'ME/CE'] as AcademicBranch[]).map(b => (
                  <button
                    key={b}
                    onClick={() => setInteractiveBranch(b)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      interactiveBranch === b
                        ? 'bg-cyanAccent-500 text-navy-950 font-black shadow-md'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Matching Companies Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {eligibleDrivesForBranch.slice(0, 3).map(drive => (
                <div
                  key={drive.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`w-8 h-8 rounded-xl ${drive.logoBg} text-white font-bold text-xs flex items-center justify-center`}>
                        {drive.logoText}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-cyanAccent-300">
                        {drive.ctcLpa} LPA
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white line-clamp-1">{drive.name}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{drive.role}</p>
                    <p className="text-[11px] text-slate-400">Min CGPA: <strong className="text-white">{drive.minCgpa}</strong></p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => navigateTo('company-detail', drive.id)}
                      className="text-xs text-slate-300 hover:text-white"
                    >
                      UMS Criteria
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBranch(interactiveBranch);
                        navigateTo('syllabus', drive.id, interactiveBranch);
                      }}
                      className="text-xs font-bold text-cyanAccent-400 hover:underline flex items-center gap-1"
                    >
                      <span>{interactiveBranch} Syllabus →</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </section>

      {/* Statistics Section (Clearly labeled sample/demo data) */}
      <section className="bg-gradient-to-br from-navy-950 to-navy-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden border border-slate-800 shadow-2xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-cyanAccent-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyanAccent-400">
            Prototype Data & Research Metrics
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Demonstrated Impact in Numbers
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Synthesized from 18 student interviews and CP6 usability evaluations conducted at Lovely Professional University.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyanAccent-500/40 transition-colors">
            <div className="text-3xl sm:text-4xl font-black text-cyanAccent-400">42+</div>
            <div className="text-xs font-bold text-slate-200 mt-1">Campus Drives Mapped</div>
            <div className="text-[10px] text-slate-400 mt-0.5">(Sample campus recruiters)</div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyanAccent-500/40 transition-colors">
            <div className="text-3xl sm:text-4xl font-black text-white">150+</div>
            <div className="text-xs font-bold text-slate-200 mt-1">Verified Technical Topics</div>
            <div className="text-[10px] text-slate-400 mt-0.5">(Aptitude, DSA & Core Domains)</div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyanAccent-500/40 transition-colors">
            <div className="text-3xl sm:text-4xl font-black text-cyanAccent-400">3</div>
            <div className="text-xs font-bold text-slate-200 mt-1">Dedicated Branch Tracks</div>
            <div className="text-[10px] text-slate-400 mt-0.5">CSE/IT, ECE/EEE, ME/CE</div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyanAccent-500/40 transition-colors">
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">94%</div>
            <div className="text-xs font-bold text-slate-200 mt-1">Student Confidence Index</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Measured in CP6 user testing</div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyanAccent-700">
            Core Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-navy-950">
            Engineered to Solve Campus Usability Challenges
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Every feature directly targets feedback received during Checkpoints CP1 through CP6.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Feature 1 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-card-hover transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyanAccent-50 text-cyanAccent-700 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-navy-950">
              Official Notice + Verified Prep
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No more searching 3 different WhatsApp groups. Administrative eligibility (CGPA, dress code, venue) is paired directly with verified technical preparation syllabuses.
            </p>
            <div className="pt-2 text-xs font-bold text-cyanAccent-700 flex items-center gap-1.5">
              <span>Usability Fix CP6</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-card-hover transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-navy-50 text-navy-950 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-navy-950">
              Dedicated Branch Selection
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Eliminated split-screen confusion! Dedicated tracks for CSE/IT, ECE/EEE, and Mechanical/Civil ensure students only see topics relevant to their discipline.
            </p>
            <div className="pt-2 text-xs font-bold text-cyanAccent-700 flex items-center gap-1.5">
              <span>Usability Fix CP6</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-card-hover transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-navy-950">
              Transparent Trust Metadata
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparent verification details: who verified the syllabus, contributor alumni names, verification date, and explicit historical pattern disclaimers.
            </p>
            <div className="pt-2 text-xs font-bold text-cyanAccent-700 flex items-center gap-1.5">
              <span>Usability Fix CP6</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-100/80 rounded-3xl p-8 sm:p-12 border border-slate-200 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyanAccent-700">
            Simple 4-Step Flow
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-navy-950">
            How Students Use Beyond the Rumour Mill
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Engineered for rapid clarity in the crucial 24 to 72 hours before a campus recruitment drive.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-2 shadow-2xs">
            <span className="w-8 h-8 rounded-full bg-navy-950 text-white font-extrabold text-xs flex items-center justify-center">
              1
            </span>
            <h4 className="font-bold text-sm text-navy-950">Explore Drives</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Check incoming company notifications, eligibility CGPA, backlogs, and deadlines.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-2 shadow-2xs">
            <span className="w-8 h-8 rounded-full bg-cyanAccent-600 text-white font-extrabold text-xs flex items-center justify-center">
              2
            </span>
            <h4 className="font-bold text-sm text-navy-950">Select Academic Branch</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Switch between CSE/IT, ECE/EEE, and Mechanical/Civil for a dedicated syllabus.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-2 shadow-2xs">
            <span className="w-8 h-8 rounded-full bg-navy-950 text-white font-extrabold text-xs flex items-center justify-center">
              3
            </span>
            <h4 className="font-bold text-sm text-navy-950">Access Verified Syllabus</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Review aptitude breakdown, technical modules, sample interview questions, and DOs/DON'Ts.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-2 shadow-2xs">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
              4
            </span>
            <h4 className="font-bold text-sm text-navy-950">Track & Crack Drive</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Check off completed topics, view your completion score, or download the printable PDF.
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => navigateTo('drives')}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-navy-950 text-white font-bold text-xs hover:bg-navy-900 transition-all shadow-md"
          >
            <span>Start Exploring Active Drives</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyanAccent-400" />
          </button>
        </div>
      </section>

      {/* Featured Companies Ready for Preparation */}
      <section className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyanAccent-700">
              Ready for Prep
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-navy-950">
              Upcoming Campus Drives at LPU (Sample Data)
            </h2>
          </div>
          <button
            onClick={() => navigateTo('drives')}
            className="text-xs font-bold text-cyanAccent-700 hover:text-cyanAccent-800 flex items-center gap-1"
          >
            <span>View All {drives.length} Drives</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {drives.slice(0, 3).map(drive => (
            <div
              key={drive.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${drive.logoBg} text-white font-black text-sm flex items-center justify-center shadow-md`}>
                    {drive.logoText}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyanAccent-50 text-cyanAccent-800 border border-cyanAccent-200">
                    {drive.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-navy-950 line-clamp-1">
                    {drive.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-1 font-medium">{drive.role}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">PACKAGE</span>
                    <strong className="text-navy-950 font-bold">{drive.ctcLpa} LPA</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">MIN CGPA</span>
                    <strong className="text-navy-950 font-bold">{drive.minCgpa}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {drive.eligibleBranches.map(b => (
                    <span key={b} className="text-[10px] px-2 py-0.5 rounded-lg font-bold bg-slate-100 text-slate-700">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => navigateTo('company-detail', drive.id)}
                  className="flex-1 py-2.5 text-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => navigateTo('syllabus', drive.id)}
                  className="flex-1 py-2.5 text-center rounded-xl bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-cyanAccent-400" />
                  <span>Prep Syllabus</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CP6 User Testing Testimonials */}
      <section className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 text-white rounded-3xl p-8 sm:p-10 space-y-6 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyanAccent-400">
              User Testing Evaluation (CP6)
            </span>
            <h3 className="text-xl font-bold text-white">Student Feedback During Prototype Trials</h3>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-cyanAccent-500/20 text-cyanAccent-300 border border-cyanAccent-500/30 font-semibold">
            5/5 Students Strongly Preferred Single Platform
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2.5">
            <p className="text-slate-300 italic leading-relaxed">
              "Previously, I spent 2 days learning React because someone on WhatsApp said TCS Digital requires it. This platform cleared the confusion immediately—focusing on Arrays, DBMS, and Quantitative speed math saved my preparation."
            </p>
            <div className="font-bold text-cyanAccent-400">
              — B.Tech CSE Student (7th Semester) · Tested in CP6
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2.5">
            <p className="text-slate-300 italic leading-relaxed">
              "As an ECE student, seeing CSE topics mixed with ECE confused me in the earlier prototype. The dedicated branch selection screen makes it 100% clear what I need to study for Texas Instruments."
            </p>
            <div className="font-bold text-cyanAccent-400">
              — B.Tech ECE Student (7th Semester) · Tested in CP6
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
