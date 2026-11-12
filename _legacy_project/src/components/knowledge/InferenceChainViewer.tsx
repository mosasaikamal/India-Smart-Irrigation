import React from 'react';
import { InferenceChain } from '../../types';
import { ArrowRight, CheckCircle, Database, Sparkles, Check, X } from 'lucide-react';

interface InferenceChainViewerProps {
  inference: InferenceChain;
}

export const InferenceChainViewer: React.FC<InferenceChainViewerProps> = ({ inference }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* Step 1: Extracted Facts */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 flex flex-col">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 mb-3">
            <Database className="w-4 h-4" />
            <span>1. Working Memory (Facts)</span>
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-72 pr-1 text-xs">
            {inference.facts.map((fact) => (
              <div
                key={fact.name}
                className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80"
              >
                <span className="font-mono text-slate-400">{fact.name}</span>
                <span className="font-mono font-semibold text-emerald-300">{fact.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Activated Rules (Conflict Set) */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 flex flex-col">
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 mb-3">
            <Sparkles className="w-4 h-4" />
            <span>2. Pattern Matching & Fired Rules</span>
            <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {inference.activatedRules.length} Fired
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-72 pr-1 text-xs">
            {inference.activatedRules.length === 0 ? (
              <div className="p-4 text-center text-slate-500 bg-slate-950/60 rounded-lg border border-dashed border-slate-800">
                No active threshold rules triggered. Default baseline applied.
              </div>
            ) : (
              inference.activatedRules.map((rule, idx) => (
                <div
                  key={rule.id}
                  className={`p-2.5 rounded-lg border text-xs ${
                    idx === 0
                      ? 'bg-amber-950/20 border-amber-500/50 shadow-sm shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200">{rule.name}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-amber-300">
                      Pri: {rule.priority}
                    </span>
                  </div>

                  <div className="space-y-1 my-1.5 text-[11px] font-mono text-slate-400 bg-slate-900/80 p-1.5 rounded">
                    {rule.conditions.map((c, i) => (
                      <div key={i} className="flex items-center space-x-1">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>IF {c.field} {c.operator} {String(c.value)}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-300 italic mt-1">
                    THEN: {rule.conclusion}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Step 3: Inference Conclusion & Action */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-3">
              <CheckCircle className="w-4 h-4" />
              <span>3. Synthesized Deduction</span>
            </div>

            <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Synthesized Conclusion
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {inference.finalConclusion}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">Action Output:</span>
                <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {inference.recommendedAction}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Rule Engine Confidence:</span>
                <span className="font-semibold text-cyan-400">{inference.confidenceScore}%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Forward-chaining inference evaluated at {inference.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
