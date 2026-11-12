import React from 'react';
import { X, Printer, Download, ShieldCheck, CheckSquare, Clock, GraduationCap, Award } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';

export const DownloadSyllabusModal: React.FC = () => {
  const {
    isDownloadModalOpen,
    setIsDownloadModalOpen,
    getSelectedCompany,
    getSelectedSyllabus,
    selectedBranch,
    isTopicCompleted
  } = usePlacement();

  if (!isDownloadModalOpen) return null;

  const company = getSelectedCompany();
  const syllabus = getSelectedSyllabus();
  const branchData = syllabus?.branchSyllabuses[selectedBranch];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden print-page">
        
        {/* Modal Action Bar (Hidden when printing) */}
        <div className="bg-navy-950 text-white px-6 py-4 flex items-center justify-between no-print border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-cyanAccent-400" />
            <div>
              <h3 className="font-extrabold text-sm text-white">Verified Preparation Syllabus Document</h3>
              <p className="text-xs text-slate-400">Print or Save as PDF for offline placement preparation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyanAccent-500 hover:bg-cyanAccent-400 text-navy-950 font-bold text-xs transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={() => setIsDownloadModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 font-sans">
          
          {/* Document Header */}
          <div className="border-b-2 border-navy-900 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyanAccent-700 bg-cyanAccent-50 px-2 py-0.5 rounded border border-cyanAccent-200">
                    Beyond the Rumour Mill · LPU P08
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Circular Ref: {company?.umsCircularId}
                  </span>
                </div>
                <h1 className="text-2xl font-black text-navy-950 tracking-tight">
                  {company?.name}
                </h1>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">
                  Role: {company?.role} · Drive Date: {company?.driveDate}
                </p>
              </div>

              <div className="text-right">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{syllabus?.verifiedBy}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Verified: {syllabus?.verificationDate}
                </p>
              </div>
            </div>

            {/* Target Branch Badge */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Selected Preparation Branch:</span>
              <span className="px-2.5 py-1 rounded-lg bg-navy-900 text-white font-bold text-xs tracking-wide">
                {branchData?.branchLabel} ({selectedBranch})
              </span>
              <span className="text-xs text-slate-500 ml-2">
                Estimated duration: ~{branchData?.recommendedDurationWeeks} weeks
              </span>
            </div>
          </div>

          {/* Verification & Trust Disclaimer Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs leading-relaxed text-slate-600">
            <div className="font-bold text-navy-900 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyanAccent-600" />
              <span>Syllabus Verification & Source Attribution</span>
            </div>
            <p className="mb-2">{syllabus?.sourceOfInformation}</p>
            <p className="text-[11px] italic text-slate-500 border-t border-slate-200 pt-2">
              {syllabus?.historicalPatternDisclaimer}
            </p>
          </div>

          {/* Section 1: Aptitude & Screening Assessment */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-navy-900 border-b border-slate-200 pb-1">
              1. Aptitude & Screening Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {syllabus?.aptitudeScreening.map(category => (
                <div key={category.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <h4 className="font-bold text-xs text-navy-900">{category.title}</h4>
                  <p className="text-[11px] text-slate-500 mb-2">{category.questionCountEstimate}</p>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {category.topics.map(t => (
                      <li key={t.id} className="flex items-start gap-2">
                        <span className="text-cyanAccent-600 font-bold">•</span>
                        <span>
                          <strong>{t.title}:</strong> {t.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Dedicated Branch Technical Preparation */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-navy-900 border-b border-slate-200 pb-1">
              2. Branch Technical Core Syllabus ({selectedBranch})
            </h3>
            {branchData?.modules.map(module => (
              <div key={module.id} className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-xs text-navy-950 uppercase">{module.title}</h4>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                    {module.category}
                  </span>
                </div>
                <div className="space-y-3 mt-3">
                  {module.topics.map(topic => {
                    const done = isTopicCompleted(topic.id);
                    return (
                      <div key={topic.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${done ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-400'}`}>
                              {done && '✓'}
                            </span>
                            <span className="font-bold text-slate-900">{topic.title}</span>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            topic.difficulty === 'Hard' ? 'bg-rose-100 text-rose-800' :
                            topic.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {topic.difficulty} · ~{topic.estimatedHours}h
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1 pl-5.5 text-[11px]">{topic.description}</p>
                        {topic.keyConcepts && (
                          <div className="mt-1.5 pl-5.5 flex flex-wrap gap-1">
                            {topic.keyConcepts.map((kc, i) => (
                              <span key={i} className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-mono">
                                #{kc}
                              </span>
                            ))}
                          </div>
                        )}
                        {topic.sampleQuestion && (
                          <div className="mt-2 pl-5.5 text-[11px] bg-white p-2 rounded border border-slate-200 italic text-slate-700">
                            <strong>Sample Problem:</strong> {topic.sampleQuestion}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Section 3: Interview Guidance & Expectations */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-navy-900 border-b border-slate-200 pb-1">
              3. Interview Rounds Guidance & Dos / Don'ts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {syllabus?.interviewGuidance.map(round => (
                <div key={round.roundNumber} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs">
                  <h4 className="font-bold text-navy-950 mb-1">
                    Round {round.roundNumber}: {round.roundName} ({round.duration})
                  </h4>
                  <div className="space-y-1.5 mt-2">
                    <div>
                      <strong className="text-emerald-700 block text-[11px]">Recommended DOs:</strong>
                      <ul className="list-disc list-inside text-[11px] text-slate-700">
                        {round.dos.map((d, i) => <li key={i}>{d}</li>)}
                      </ul>
                    </div>
                    <div className="mt-2">
                      <strong className="text-rose-700 block text-[11px]">Critical DON'Ts:</strong>
                      <ul className="list-disc list-inside text-[11px] text-slate-700">
                        {round.donts.map((d, i) => <li key={i}>{d}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Document Footer */}
          <div className="border-t-2 border-navy-900 pt-4 flex items-center justify-between text-[11px] text-slate-500">
            <div>
              Generated via <strong>Beyond the Rumour Mill (P08)</strong> · Lovely Professional University
            </div>
            <div>
              Date Printed: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Modal Bottom Close */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end no-print">
          <button
            onClick={() => setIsDownloadModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-semibold text-xs text-slate-800 transition-colors"
          >
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
};
