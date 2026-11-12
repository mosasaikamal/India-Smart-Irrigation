import React, { useState } from 'react';
import {
  GraduationCap,
  Layers,
  Users,
  Compass,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Award,
  ChevronRight,
  Sparkles,
  Search,
  Target,
  ArrowRight
} from 'lucide-react';
import { DESIGN_THINKING_DATA } from '../data/placementData';
import { usePlacement } from '../context/PlacementContext';

export const AboutProjectPage: React.FC = () => {
  const { navigateTo } = usePlacement();
  const [selectedStageNumber, setSelectedStageNumber] = useState<number | 'all'>('all');

  const visibleStages = selectedStageNumber === 'all'
    ? DESIGN_THINKING_DATA.stages
    : DESIGN_THINKING_DATA.stages.filter(s => s.number === selectedStageNumber);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero / Project Overview */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden space-y-6 border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyanAccent-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyanAccent-500/20 text-cyanAccent-300 text-xs font-semibold border border-cyanAccent-500/30">
            <Award className="w-3.5 h-3.5" />
            <span>Design Thinking Project Documentation · INT335 (Project P08)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Beyond the Rumour Mill
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            An official placement preparation information platform that combines university placement notifications with verified, company-specific technical preparation syllabuses for Lovely Professional University.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Course</span>
              <strong className="text-white">INT335 – Design Thinking</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Project ID</span>
              <strong className="text-cyanAccent-400">P08</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Institution</span>
              <strong className="text-white">Lovely Professional University</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Current State</span>
              <strong className="text-emerald-400">CP6 Tested Prototype</strong>
            </div>
          </div>
        </div>
      </div>

      {/* The Real-World Problem at LPU */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-navy-950">
              The Real-World Problem Identified at LPU
            </h2>
            <p className="text-xs text-slate-500">
              Why thousands of engineering students experience acute placement anxiety
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
          <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <h3 className="font-bold text-sm text-navy-950">The Administrative vs Technical Disconnect</h3>
            <p>
              Lovely Professional University hosts hundreds of multinational companies every placement season. The university’s official portal (UMS) efficiently broadcasts administrative announcements—such as eligible CGPA cutoffs, allowed backlogs, reporting times, dress codes, and hall tickets.
            </p>
            <p>
              However, <strong>UMS notices contain zero technical preparation guidance</strong>. They do not inform students whether a company will focus on Dynamic Programming, Bitwise manipulation, Digital Logic, or Strength of Materials.
            </p>
          </div>

          <div className="space-y-3 p-5 rounded-2xl bg-rose-50/60 border border-rose-200/80">
            <h3 className="font-bold text-sm text-rose-950">The "Rumour Mill" Vacuum</h3>
            <p>
              Lacking verified technical guidance, students flood unofficial WhatsApp batches, Telegram channels, and Reddit forums. In these unmoderated groups, unverified advice spreads rapidly:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 italic">
              <li>"Google rejects you if you code in Python." (Busted)</li>
              <li>"ECE students don't need to do coding for TCS Digital." (Busted)</li>
              <li>"HR round has 0% rejection rate." (Busted)</li>
            </ul>
            <p className="font-semibold text-rose-900 pt-1">
              Result: Students waste 15–20 hours studying irrelevant topics or enter interviews with preventable misconceptions.
            </p>
          </div>
        </div>
      </div>

      {/* Target Users & Empathy Persona */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-cyanAccent-50 text-cyanAccent-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-navy-950">
              Target Users & User Persona
            </h2>
            <p className="text-xs text-slate-500">
              Grounded in 18 semi-structured student empathy interviews across LPU engineering disciplines
            </p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Primary Persona</span>
              <h3 className="font-black text-base text-navy-950">Amanpreet Singh</h3>
              <p className="text-xs text-slate-600">B.Tech ECE (7th Semester), CGPA 7.42 · Hosteler</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-cyanAccent-100 text-cyanAccent-800 font-bold self-start sm:self-auto">
              Pre-Final & Final Year Cohort
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <strong className="text-navy-950 block">Primary Goals:</strong>
              <p className="text-slate-600 leading-relaxed">
                Crack a high-package placement drive (7+ LPA) in tech or core electronics. Needs to know exactly what technical concepts are tested in Round 1 and Round 2 without wasting time.
              </p>
            </div>
            <div className="space-y-1">
              <strong className="text-rose-900 block">Core Frustrations:</strong>
              <p className="text-slate-600 leading-relaxed">
                UMS sends an email 4 days before the drive. WhatsApp group is full of 400 conflicting messages. Unsure whether to study Microprocessors or LeetCode Dynamic Programming.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The 5 Stages of Design Thinking (Interactive Stage Explorer) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-navy-100 text-navy-900 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-navy-950">
                The 5 Stages of Design Thinking
              </h2>
              <p className="text-xs text-slate-500">
                Interactive curriculum documentation for course INT335
              </p>
            </div>
          </div>

          {/* Stage Filter Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedStageNumber('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedStageNumber === 'all'
                  ? 'bg-navy-950 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Stages
            </button>
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                onClick={() => setSelectedStageNumber(num)}
                className={`w-7 h-7 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                  selectedStageNumber === num
                    ? 'bg-navy-950 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={`Stage ${num}`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {visibleStages.map(stage => (
            <div
              key={stage.number}
              className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-navy-950 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                    {stage.number}
                  </span>
                  <h3 className="font-black text-base text-navy-950">{stage.name}</h3>
                </div>
                <span className="text-xs font-bold text-cyanAccent-700 bg-cyanAccent-50 px-2.5 py-0.5 rounded">
                  Stage {stage.number} of 5
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium">{stage.objective}</p>

              {stage.findings && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-1.5 shadow-2xs">
                  <strong className="text-navy-950 block mb-1">Key Research Findings:</strong>
                  {stage.findings.map((f, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-slate-700">
                      <span className="text-cyanAccent-600 font-bold">•</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              )}

              {stage.problemStatement && (
                <div className="bg-cyanAccent-50/70 p-4 rounded-xl border border-cyanAccent-200 text-xs text-navy-950 leading-relaxed">
                  <strong className="block mb-1 text-cyanAccent-900 font-bold">Point of View (POV) Problem Statement:</strong>
                  "{stage.problemStatement}"
                </div>
              )}

              {stage.iterations && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  {stage.iterations.map((iter, i) => (
                    <div key={i} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <strong className="text-navy-950 block">{iter.checkpoint}</strong>
                      <span className="text-slate-600 text-[11px]">{iter.focus}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* USER TESTING & CP6 USABILITY IMPROVEMENTS (CRITICAL ACADEMIC SECTION) */}
      <div className="bg-gradient-to-br from-navy-950 to-navy-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyanAccent-500/20 text-cyanAccent-400 border border-cyanAccent-500/30 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-white">
                Usability Testing & CP6 Improvements
              </h2>
              <p className="text-xs text-slate-400">
                Key usability problems identified with 5 LPU students and how we resolved them
              </p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
            CP6 Tested & Validated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Improvement 1 */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyanAccent-400">Improvement 1: Prominent Syllabus Access</span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">UX Flow</span>
            </div>
            <p className="text-slate-300">
              <strong className="text-rose-400">Problem:</strong> In initial trials, students ignored syllabus attachments at the bottom of placement notifications.
            </p>
            <p className="text-slate-300">
              <strong className="text-emerald-400">Solution:</strong> Added a large, high-visibility "Download / Open Verified Prep Syllabus" action button near the top of every placement drive notice.
            </p>
          </div>

          {/* Improvement 2 */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyanAccent-400">Improvement 2: Dedicated Branch Selection</span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">Architecture</span>
            </div>
            <p className="text-slate-300">
              <strong className="text-rose-400">Problem:</strong> Students were confused by split-screen syllabuses showing CSE, ECE, and Mechanical topics simultaneously.
            </p>
            <p className="text-slate-300">
              <strong className="text-emerald-400">Solution:</strong> Designed a dedicated branch selection tab with clear CSE/IT, ECE/EEE, and Mechanical/Civil buttons that display only relevant domain topics.
            </p>
          </div>

          {/* Improvement 3 */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyanAccent-400">Improvement 3: Trust & Verification Transparency</span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">Credibility</span>
            </div>
            <p className="text-slate-300">
              <strong className="text-rose-400">Problem:</strong> Students questioned whether the syllabus was genuinely reliable or just another unverified student opinion.
            </p>
            <p className="text-slate-300">
              <strong className="text-emerald-400">Solution:</strong> Embedded structured verification metadata: verifier identity, date, source debrief count, contributor alumni details, and explicit historical pattern disclaimers.
            </p>
          </div>

          {/* Improvement 4 */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyanAccent-400">Improvement 4: Reducing Information Overload</span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">Cognitive Load</span>
            </div>
            <p className="text-slate-300">
              <strong className="text-rose-400">Problem:</strong> Long paragraphs of text overwhelmed students preparing with limited time (24–48 hours).
            </p>
            <p className="text-slate-300">
              <strong className="text-emerald-400">Solution:</strong> Replaced walls of text with bite-sized checklists, difficulty tags, estimated hours, and expandable concept cards.
            </p>
          </div>

        </div>
      </div>

      {/* Academic Prototype Declaration */}
      <div className="p-6 rounded-3xl bg-slate-100 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2">
        <h4 className="font-bold text-sm text-navy-950 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Academic Prototype Declaration & Faculty Evaluation Note</span>
        </h4>
        <p>
          This website was developed by students for <strong>INT335 – Design Thinking</strong> at <strong>Lovely Professional University (LPU)</strong>, Phagwara, Punjab.
        </p>
        <p>
          It serves as an interactive proof-of-concept demonstrating how pairing official university administrative notifications with alumni-verified technical preparation syllabuses solves the persistent problem of campus placement anxiety and WhatsApp misinformation.
        </p>
        <p className="text-slate-500 italic">
          Disclaimer: Company brand marks and illustrative eligibility criteria are used solely for educational and evaluative demonstration.
        </p>
      </div>

    </div>
  );
};
