import React, { useState, useEffect } from 'react';
import { api, RuleDto, RuleTraceDto, FieldDto } from '../services/api';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Play,
  Layers,
  Sliders,
  AlertTriangle,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export const AgriculturalKnowledgeEnginePage: React.FC = () => {
  const [fields, setFields] = useState<FieldDto[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('field-01');
  const [rules, setRules] = useState<RuleDto[]>([]);
  const [trace, setTrace] = useState<RuleTraceDto | null>(null);
  const [evaluating, setEvaluating] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      try {
        const [fList, rList] = await Promise.all([api.getFields(), api.getRules()]);
        setFields(fList);
        setRules(rList);
        if (fList.length > 0) {
          runEvaluation(selectedFieldId);
        }
      } catch (e) {
        console.warn('Rules API load failed, using local rules:', e);
      }
    }
    load();
  }, []);

  const runEvaluation = async (fieldId: string) => {
    setEvaluating(true);
    try {
      const res = await api.evaluateRules(fieldId);
      setTrace(res);
    } catch (e) {
      console.warn('Rule evaluation error:', e);
    } finally {
      setEvaluating(false);
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    try {
      await api.toggleRule(ruleId);
      const updatedRules = await api.getRules();
      setRules(updatedRules);
      runEvaluation(selectedFieldId);
    } catch (e) {
      alert(`Error toggling rule: ${e}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Agricultural Knowledge Engine</h2>
            <DataSourceBadge type="CALCULATED" label="IF-THEN Inference System" />
          </div>
          <p className="text-xs text-slate-300">
            Executable agronomic rule system governing irrigation triggering, rain postponement, saturation blocks, and sensor validation.
          </p>
        </div>

        {/* Sector Switcher */}
        <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <Layers className="w-4 h-4 text-emerald-400" />
          <select
            value={selectedFieldId}
            onChange={(e) => {
              setSelectedFieldId(e.target.value);
              runEvaluation(e.target.value);
            }}
            className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
          >
            {fields.map((f) => (
              <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Inference Diagnostic Alert */}
      {trace && (
        <div className="agri-card bg-emerald-950/20 border-emerald-500/40 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/30 pb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Active Rule Inference Conclusion</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Timestamp: {trace.timestamp}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-400">Top Recommended Action:</span>
              <div className="text-lg font-bold text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{trace.top_recommended_action}</span>
              </div>
              <p className="text-xs text-slate-300">{trace.explanation}</p>
            </div>

            <div className="flex items-center space-x-4 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Fired Rules:</span>
                <span className="text-emerald-400 font-bold">{trace.rules_fired.length}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Unfired Rules:</span>
                <span className="text-slate-500 font-bold">{trace.rules_unfired.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registered Rule Management Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Executable IF-THEN Agricultural Rule Registry</span>
          </h3>
          <span className="text-[10px] text-slate-400">Click toggle to activate / deactivate rule</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => {
            const isFired = trace?.rules_fired.some((r) => r.rule_id === rule.id);

            return (
              <div
                key={rule.id}
                className={`agri-card space-y-3 transition-all ${
                  isFired ? 'border-emerald-500/50 bg-emerald-950/15 shadow-md shadow-emerald-950/30' : ''
                }`}
              >
                <div className="flex items-start justify-between border-b border-slate-800 pb-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">{rule.code}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-800 text-slate-300">
                        Priority {rule.priority}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{rule.name}</h4>
                  </div>

                  <button
                    onClick={() => handleToggleRule(rule.id)}
                    className={`p-1 rounded transition-colors ${
                      rule.is_active ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-600 hover:text-slate-400'
                    }`}
                    title={rule.is_active ? 'Active' : 'Inactive'}
                  >
                    {rule.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                </div>

                {/* Condition Box */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px] space-y-1">
                  <span className="text-[9px] uppercase font-semibold text-slate-400 block">Condition Clause:</span>
                  <div className="text-amber-300">
                    IF {rule.conditions.map((c) => `${c.field} ${c.operator} ${c.value}`).join(' AND ')}
                  </div>
                  <div className="text-emerald-400 font-semibold pt-1 border-t border-slate-800/80">
                    THEN ACTION: {rule.action}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">{rule.explanation}</p>

                {/* Live Match Badge */}
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">Current Field Match:</span>
                  {isFired ? (
                    <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>RULE TRIGGERED</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-slate-500">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Condition Not Met</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
