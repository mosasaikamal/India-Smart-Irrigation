import React from 'react';
import { X, BookOpen, CheckCircle, Info } from 'lucide-react';

export interface FormulaAuditData {
  title: string;
  formula: string;
  methodUsed?: string;
  result: string | number;
  units: string;
  inputs: Record<string, any>;
  intermediates: Record<string, any>;
  assumptions: string[];
}

interface FormulaAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: FormulaAuditData | null;
}

export const FormulaAuditModal: React.FC<FormulaAuditModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-emerald-950/50 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{data.title}</h3>
              <p className="text-xs text-slate-400">
                Method: <span className="text-emerald-400 font-semibold">{data.methodUsed || 'FAO-56 Standard'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formula Display Box */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs space-y-2">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Governing Scientific Equation</span>
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-emerald-300 font-semibold text-sm overflow-x-auto">
            {data.formula}
          </div>
          <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800/80">
            <span className="text-slate-400">Calculated Output:</span>
            <span className="text-base font-bold text-white">
              {data.result} <span className="text-xs text-emerald-400 font-normal">{data.units}</span>
            </span>
          </div>
        </div>

        {/* Input Parameters Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>Input Variables Bound to Application State</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(data.inputs).map(([key, val]) => (
              <div key={key} className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 text-xs">
                <span className="text-slate-400 block text-[10px] truncate">{key}</span>
                <span className="text-slate-200 font-mono font-semibold">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Intermediates */}
        {Object.keys(data.intermediates).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Intermediate Physical Values</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(data.intermediates).map(([key, val]) => (
                <div key={key} className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 text-xs">
                  <span className="text-slate-400 block text-[10px] truncate">{key}</span>
                  <span className="text-amber-300 font-mono font-semibold">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scientific Assumptions */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Methodological Assumptions</h4>
          <ul className="space-y-1 text-xs text-slate-400">
            {data.assumptions.map((assump, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-emerald-400">•</span>
                <span>{assump}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
          >
            Close Scientific Audit
          </button>
        </div>
      </div>
    </div>
  );
};
