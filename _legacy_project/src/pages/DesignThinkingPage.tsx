import React, { useState } from 'react';
import { useCampusFind } from '../context/CampusFindContext';
import { 
  Lightbulb, 
  Users, 
  Target, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  Compass, 
  FileText, 
  Award, 
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Building,
  HelpCircle
} from 'lucide-react';
import { PROJECT_INFO } from '../data/sampleData';

export const DesignThinkingPage: React.FC = () => {
  const { navigateTo } = useCampusFind();
  const [activeStage, setActiveStage] = useState<'empathize' | 'define' | 'ideate' | 'prototype' | 'test'>('empathize');

  return (
    <div className="space-y-12 pb-16">
      {/* Academic Header Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white shadow-xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
            {PROJECT_INFO.course} Case Study
          </span>
          <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-semibold">
            Project ID: {PROJECT_INFO.id}
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            Session {PROJECT_INFO.session}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
          {PROJECT_INFO.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          A comprehensive Design Thinking case study and functional prototype engineered for{' '}
          <strong>{PROJECT_INFO.institution}</strong> by {PROJECT_INFO.program} Team P04.
        </p>

        {/* Team Members Grid */}
        <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROJECT_INFO.teamMembers.map((member, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-400 block tracking-wider">
                {member.role}
              </span>
              <p className="font-bold text-white text-sm">{member.name}</p>
              <p className="text-slate-300 text-[11px] leading-snug">{member.responsibility}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Core Design Challenge Callout */}
      <div className="p-6 sm:p-8 rounded-3xl bg-blue-50 border border-blue-200 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
          Main Design Challenge (HMW)
        </span>
        <blockquote className="text-xl sm:text-2xl font-bold text-slate-900 italic leading-snug">
          "{PROJECT_INFO.mainChallenge}"
        </blockquote>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          <strong>Problem Statement:</strong> {PROJECT_INFO.problemStatement}
        </p>
      </div>

      {/* 5 Stages Navigation */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          <button
            onClick={() => setActiveStage('empathize')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 ${
              activeStage === 'empathize'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            1. Empathize (Field Research)
          </button>
          <button
            onClick={() => setActiveStage('define')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 ${
              activeStage === 'define'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            2. Define (POV & Challenges)
          </button>
          <button
            onClick={() => setActiveStage('ideate')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 ${
              activeStage === 'ideate'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            3. Ideate (Solutions Matrix)
          </button>
          <button
            onClick={() => setActiveStage('prototype')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 ${
              activeStage === 'prototype'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            4. Prototype (CampusFind App)
          </button>
          <button
            onClick={() => setActiveStage('test')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 ${
              activeStage === 'test'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            5. Test & Iterations
          </button>
        </div>

        {/* STAGE 1: EMPATHIZE */}
        {activeStage === 'empathize' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Phase 01</span>
              <h2 className="text-2xl font-bold text-slate-900">Empathize: Understanding Campus Realities</h2>
              <p className="text-xs text-slate-500">
                Conducted by Sai Kamal & Team across Lovely Professional University's 600-acre premises.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase text-slate-500">Persona 1: The Frustrated Student</span>
                <h3 className="font-bold text-slate-900">Aarav (2nd Year B.Tech)</h3>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "I left my laptop charger in Block 34 lab before exams. Walking across campus to check 4 different blocks and hostel gates took 3 hours and I still couldn't find who had it."
                </p>
                <div className="text-[11px] font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100">
                  Pain Point: Enormous 600-acre physical expanse makes searching in-person exhausting.
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase text-slate-500">Persona 2: The Hesitant Finder</span>
                <h3 className="font-bold text-slate-900">Priya (3rd Year MBA)</h3>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "I found an expensive wireless earphone case in the mess. I didn't want to post it on WhatsApp because 10 random people would claim it was theirs, and I had no way to verify."
                </p>
                <div className="text-[11px] font-semibold text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                  Pain Point: Fear of fraudulent claims causes finders to keep items or delay handover.
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase text-slate-500">Persona 3: Overburdened Staff</span>
                <h3 className="font-bold text-slate-900">Guard Ram Singh (Security Desk Gate 1)</h3>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "We have paper registers filled with unclaimed ID cards, keys, and bottles. Students rarely check the gate booth because they assume it's lost forever."
                </p>
                <div className="text-[11px] font-semibold text-blue-600 bg-blue-50 p-2 rounded-lg border border-blue-100">
                  Pain Point: Isolated paper records lack digital searchability across campus departments.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: DEFINE */}
        {activeStage === 'define' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Phase 02</span>
              <h2 className="text-2xl font-bold text-slate-900">Define: Point of View (POV) & Insights</h2>
              <p className="text-xs text-slate-500">
                Formulated by S. Adithya Raman through Touchpoint Observation and User Journey Mapping.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-2">
                <span className="text-xs font-bold uppercase text-blue-400">Point of View (POV) Formula</span>
                <p className="text-sm sm:text-base leading-relaxed">
                  <strong>User:</strong> A busy university student or faculty member navigating a 600-acre multi-facility campus.<br />
                  <strong>Need:</strong> A rapid, transparent, and trustworthy mechanism to report and recover missing items without wandering through dozens of buildings.<br />
                  <strong>Insight:</strong> Current manual methods fail not because people don't care, but because lack of privacy protection and location fragmentation create high cognitive friction.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase">Key User Frustrations Identified</h4>
                  <ul className="space-y-1.5 text-slate-600">
                    <li>• WhatsApp broadcast groups get buried under spam within 10 minutes.</li>
                    <li>• Personal phone numbers get exposed publicly to thousands of strangers.</li>
                    <li>• No unified database connecting Library, Hostels, and Security Desks.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase">Design Criteria for CampusFind</h4>
                  <ul className="space-y-1.5 text-slate-600">
                    <li>• <strong>60-Second Reporting:</strong> Quick form with preset campus buildings.</li>
                    <li>• <strong>Anti-Fraud Shield:</strong> Verification challenges with withheld answers.</li>
                    <li>• <strong>Transparent Matching:</strong> Rule-based engine with explainable criteria.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 3: IDEATE */}
        {activeStage === 'ideate' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Phase 03</span>
              <h2 className="text-2xl font-bold text-slate-900">Ideate: Solution Brainstorming & Trade-Offs</h2>
              <p className="text-xs text-slate-500">
                Synthesized by Karri Rohit & Team members during ideation sprints.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Solution Concept</th>
                    <th className="p-3">Pros</th>
                    <th className="p-3">Cons / Blockers</th>
                    <th className="p-3">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">WhatsApp / Telegram Community Groups</td>
                    <td className="p-3 text-slate-600">Already used by students, low setup time</td>
                    <td className="p-3 text-rose-700">Chaotic, no search, spam, severe privacy issues</td>
                    <td className="p-3 font-bold text-rose-600">Rejected</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Physical Notice Boards & Posters</td>
                    <td className="p-3 text-slate-600">Visible near entrances</td>
                    <td className="p-3 text-rose-700">Static, high paper waste, 600-acre range impossible</td>
                    <td className="p-3 font-bold text-rose-600">Rejected</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Decentralized Security Gate Registers</td>
                    <td className="p-3 text-slate-600">Physical guards already present</td>
                    <td className="p-3 text-rose-700">Data locked in paper notebooks, no cross-gate visibility</td>
                    <td className="p-3 font-bold text-rose-600">Rejected</td>
                  </tr>
                  <tr className="bg-blue-50/50">
                    <td className="p-3 font-bold text-blue-900">CampusFind: Centralized Web Prototype</td>
                    <td className="p-3 text-slate-800">Instant search, private verification, match suggestions, gate pass</td>
                    <td className="p-3 text-slate-600">Requires student adoption & clean UI</td>
                    <td className="p-3 font-bold text-emerald-600">Selected & Built!</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STAGE 4: PROTOTYPE */}
        {activeStage === 'prototype' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Phase 04</span>
              <h2 className="text-2xl font-bold text-slate-900">Prototype: Technical Architecture & Features</h2>
              <p className="text-xs text-slate-500">
                Implemented by Karri Rohit (Leader) & Kalimalla Ashraf using React, TypeScript, and Tailwind CSS.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  1. Transparent Possible-Match Engine
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Instead of black-box AI claims, CampusFind implements an explainable multi-factor scoring formula:
                </p>
                <ul className="space-y-1 text-slate-700 font-mono text-[11px]">
                  <li>• Category Match: +40%</li>
                  <li>• Campus Location Match: +25% (or +15% for adjacent academic/hostel zones)</li>
                  <li>• Keyword / Title Similarity: +25%</li>
                  <li>• Date Proximity (within 3 days): +10%</li>
                </ul>
                <p className="text-slate-500 text-[11px]">
                  Each match explicitly outlines the transparent reasons for its match confidence.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  2. Anti-Fraud Verification Shield
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Solves the primary trust bottleneck identified during campus empathy interviews:
                </p>
                <ul className="space-y-1 text-slate-700">
                  <li>• When a found item is logged, the finder sets a private verification question.</li>
                  <li>• The true answer is <strong>never displayed publicly</strong> on cards or directory.</li>
                  <li>• Claimants submit their response alongside their Student Registration ID.</li>
                  <li>• Only authorized staff/security can compare and approve the release pass.</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => navigateTo('browse')}
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
              >
                Test Browse Directory →
              </button>
              <button
                onClick={() => navigateTo('admin')}
                className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
              >
                Test Staff Approval Portal →
              </button>
            </div>
          </div>
        )}

        {/* STAGE 5: TEST */}
        {activeStage === 'test' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Phase 05</span>
              <h2 className="text-2xl font-bold text-slate-900">Test & Iterations: User Feedback & Improvements</h2>
              <p className="text-xs text-slate-500">
                Conducted by Kalimalla Ashraf with 15 LPU student and staff testers.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-blue-600 uppercase text-[10px]">Iteration 1</span>
                <h4 className="font-bold text-slate-900 text-sm">Pre-populated LPU Campus Hotspots</h4>
                <p className="text-slate-600 leading-relaxed">
                  <strong>User Feedback:</strong> Students found typing long location names tedious on mobile phones.
                  <br />
                  <strong>Enhancement:</strong> Added single-click dropdowns for 15 primary LPU locations (Block 34, Central Library, Uni-Mall, BH/GH Receptions, Unipolis) with custom sub-location input.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-blue-600 uppercase text-[10px]">Iteration 2</span>
                <h4 className="font-bold text-slate-900 text-sm">Instant Match Highlighting</h4>
                <p className="text-slate-600 leading-relaxed">
                  <strong>User Feedback:</strong> When viewing an item, users didn't want to manually search the other tab to see if a match existed.
                  <br />
                  <strong>Enhancement:</strong> Embedded automatic match suggestions directly into the Item Details page with percentage scores and transparent reasons.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-blue-600 uppercase text-[10px]">Iteration 3</span>
                <h4 className="font-bold text-slate-900 text-sm">Gate Pass Printing & Safe Handover Hubs</h4>
                <p className="text-slate-600 leading-relaxed">
                  <strong>User Feedback:</strong> Security guards requested a verifiable slip with Student UID to prevent disputes at the gate.
                  <br />
                  <strong>Enhancement:</strong> Built a printable gate pass summary directly into the Claim Status tracker with designated campus collection booths.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Presentation / Viva Talking Points */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 space-y-4">
        <div className="flex items-center gap-2 text-amber-900">
          <Award className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold uppercase tracking-wider">
            Quick Viva Presentation Talking Points (For Team P04)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="bg-white/80 p-4 rounded-2xl border border-amber-200/80 space-y-1.5">
            <p className="font-bold text-slate-900">1. Why a web prototype instead of a native app?</p>
            <p className="text-slate-600 leading-relaxed">
              No student wants to download a 60MB mobile app just to check for a lost bottle once a semester. A responsive web app loads in 1 second via QR codes at library and security desks.
            </p>
          </div>

          <div className="bg-white/80 p-4 rounded-2xl border border-amber-200/80 space-y-1.5">
            <p className="font-bold text-slate-900">2. How does CampusFind prevent false claims?</p>
            <p className="text-slate-600 leading-relaxed">
              Via our two-layer verification shield: private characteristics are withheld from public view, and claimants must answer a secret verification challenge that staff cross-checks before issuing a gate pass.
            </p>
          </div>

          <div className="bg-white/80 p-4 rounded-2xl border border-amber-200/80 space-y-1.5">
            <p className="font-bold text-slate-900">3. How does the matching algorithm work?</p>
            <p className="text-slate-600 leading-relaxed">
              It is an explainable rule-based engine weighting Category (40%), Location (25%), Keyword similarity (25%), and Date (10%), giving users transparent reasons for each potential match.
            </p>
          </div>

          <div className="bg-white/80 p-4 rounded-2xl border border-amber-200/80 space-y-1.5">
            <p className="font-bold text-slate-900">4. How is data persisted?</p>
            <p className="text-slate-600 leading-relaxed">
              Utilizes browser LocalStorage with automatic fallback to rich demonstration records, allowing full CRUD operations, claim reviews, and resets without server setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
