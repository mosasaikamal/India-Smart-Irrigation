import React, { useState, useEffect } from 'react';
import { api, BlackboardStateDto, FieldDto } from '../services/api';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import { HumanApprovalModal } from '../components/common/HumanApprovalModal';
import {
  Bot,
  Layers,
  Activity,
  Play,
  CheckCircle,
  AlertTriangle,
  Clock,
  Send,
  ShieldCheck,
  UserCheck,
  XCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const AutonomousAgentsPage: React.FC = () => {
  const [fields, setFields] = useState<FieldDto[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('field-01');
  const [blackboard, setBlackboard] = useState<BlackboardStateDto | null>(null);
  const [running, setRunning] = useState<boolean>(false);
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);

  const runWorkflow = async (fieldId: string) => {
    setRunning(true);
    try {
      const res = await api.runAgents(fieldId);
      setBlackboard(res);
    } catch (e) {
      console.warn('Agent execution error:', e);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const fList = await api.getFields();
        setFields(fList);
        if (fList.length > 0) {
          runWorkflow(selectedFieldId);
        }
      } catch (e) {
        console.warn('Failed to load fields:', e);
      }
    }
    load();
  }, []);

  const handleConfirmApproval = async (approved: boolean, operatorName: string, notes: string) => {
    if (!blackboard) return;
    try {
      await api.approveAgentAction({
        run_id: blackboard.run_id,
        approved,
        user_name: operatorName,
        notes,
      });
      setBlackboard({
        ...blackboard,
        approval_status: approved ? 'APPROVED' : 'REJECTED',
        approved_by: operatorName,
      });
      setShowApprovalModal(false);
    } catch (err) {
      alert(`Approval error: ${err}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Autonomous Multi-Agent Architecture</h2>
            <DataSourceBadge type="CALCULATED" label="6 Logical Agents & Supervisor" />
          </div>
          <p className="text-xs text-slate-300">
            Dedicated domain agents communicating via structured blackboard context with conflict detection and human safety sign-off.
          </p>
        </div>

        {/* Sector Switcher & Run Button */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <Layers className="w-4 h-4 text-emerald-400" />
            <select
              value={selectedFieldId}
              onChange={(e) => {
                setSelectedFieldId(e.target.value);
                runWorkflow(e.target.value);
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

          <button
            onClick={() => runWorkflow(selectedFieldId)}
            disabled={running}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{running ? 'Running Pipeline...' : 'Execute Agents Cycle'}</span>
          </button>
        </div>
      </div>

      {/* Supervisor Conflict Detection Banner */}
      {blackboard && blackboard.conflict_detected && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-amber-300 font-bold">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Cross-Agent Conflict Detected & Arbitrated by Supervisor</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-mono">{blackboard.conflict_details}</p>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-emerald-300 font-medium">
            {blackboard.conflict_resolution}
          </div>
        </div>
      )}

      {/* Supervisor Final Determination & Human Approval Bar */}
      {blackboard && (
        <div className="agri-card bg-emerald-950/20 border-emerald-500/40 p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Supervisor Final Determination</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                  Run ID: {blackboard.run_id}
                </span>
              </div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Action: {blackboard.final_action} ({blackboard.final_depth_mm} mm)</span>
              </h3>
              <p className="text-xs text-slate-300">{blackboard.supervisor_summary}</p>
            </div>

            {/* Approval Status Badge & Trigger */}
            <div className="flex items-center space-x-3">
              {blackboard.approval_status === 'APPROVED' ? (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  <CheckCircle className="w-4 h-4" />
                  <span>Approved by {blackboard.approved_by || 'Operator'}</span>
                </div>
              ) : blackboard.approval_status === 'REJECTED' ? (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
                  <XCircle className="w-4 h-4" />
                  <span>Operation Withheld by Operator</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowApprovalModal(true)}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/30 transition-all animate-pulse"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Pending Operator Sign-Off</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6 Logical Agents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {blackboard?.agents.map((agent) => (
          <div key={agent.agent_id} className="agri-card space-y-3.5 relative">
            <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/60 text-emerald-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{agent.name}</h4>
                  <p className="text-[10px] text-slate-400">{agent.role}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{agent.execution_time_ms} ms</span>
            </div>

            {/* Input Summary */}
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[10px] space-y-0.5">
              <span className="text-slate-400 block uppercase font-semibold">Inputs Processed:</span>
              <p className="text-slate-300">{agent.input_summary}</p>
            </div>

            {/* Output Decision */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Agent Assessment:</span>
              <p className="text-xs text-white font-medium">{agent.output_decision}</p>
            </div>

            {/* Proposed Action Pill */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
              <span className="text-slate-400">Proposal:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-emerald-400">
                {agent.proposed_action} {agent.proposed_depth_mm > 0 ? `(${agent.proposed_depth_mm}mm)` : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Shared Blackboard Message Log */}
      {blackboard && blackboard.messages.length > 0 && (
        <div className="agri-card space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Shared Structured Blackboard Message Log</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Real-Time Event Bus</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto font-mono text-xs">
            {blackboard.messages.map((msg, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start space-x-3 text-slate-300"
              >
                <span className="text-slate-500 text-[10px] shrink-0 mt-0.5">[{msg.timestamp}]</span>
                <span className="text-emerald-400 font-bold shrink-0">{msg.sender} &gt; {msg.recipient}:</span>
                <span className="leading-relaxed">{msg.content}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Human Safety Sign-Off Modal */}
      {blackboard && (
        <HumanApprovalModal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          onConfirm={handleConfirmApproval}
          runId={blackboard.run_id}
          actionName={blackboard.final_action}
          depthMm={blackboard.final_depth_mm}
          volumeM3={blackboard.final_volume_m3}
          pumpHours={blackboard.pump_hours}
          fieldName={fields.find((f) => f.id === selectedFieldId)?.name || 'Active Field'}
        />
      )}
    </div>
  );
};
