import React, { useState } from 'react';
import { ShieldAlert, Check, X, Droplets, Clock, UserCheck } from 'lucide-react';

interface HumanApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (approved: boolean, operatorName: string, notes: string) => void;
  runId: string;
  actionName: string;
  depthMm: number;
  volumeM3: number;
  pumpHours: number;
  fieldName: string;
}

export const HumanApprovalModal: React.FC<HumanApprovalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  runId,
  actionName,
  depthMm,
  volumeM3,
  pumpHours,
  fieldName,
}) => {
  const [operatorName, setOperatorName] = useState('Senior Irrigation Manager');
  const [notes, setNotes] = useState('Field conditions verified against soil probe telemetry.');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full shadow-2xl shadow-amber-950/40 p-6 space-y-5">
        {/* Header with Warning Shield */}
        <div className="flex items-start space-x-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Physical Actuation Safety Checkpoint</h3>
            <p className="text-xs text-amber-300/90 font-medium">
              Human Operator Sign-Off Required for Physical Hardware
            </p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-slate-300 leading-relaxed">
          Autonomous agents have synthesized the operational proposal below. In accordance with physical fail-safe standards, valves and high-voltage pumps remain de-energized until explicit human confirmation.
        </div>

        {/* Proposed Parameters Summary */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400">Target Field:</span>
            <span className="text-white font-semibold">{fieldName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400">Action:</span>
            <span className="text-emerald-400 font-bold">{actionName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400">Gross Application Depth:</span>
            <span className="text-white font-mono">{depthMm} mm</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400">Irrigation Water Volume:</span>
            <span className="text-cyan-400 font-mono font-semibold">{volumeM3} m³ ({Math.round(volumeM3 * 1000).toLocaleString()} Liters)</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Pump Running Duration:</span>
            <span className="text-amber-400 font-mono font-semibold">{pumpHours} hours</span>
          </div>
        </div>

        {/* Operator Input */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">Operator Signature</label>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">Verification Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => onConfirm(false, operatorName, notes)}
            className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Reject & Hold</span>
          </button>
          <button
            onClick={() => onConfirm(true, operatorName, notes)}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
          >
            <UserCheck className="w-4 h-4" />
            <span>Authorize & Execute</span>
          </button>
        </div>
      </div>
    </div>
  );
};
