import React from 'react';
import { AgentMessage, AgentConsensus } from '../../types';
import { MessageSquare, ShieldCheck, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface AgentTimelineProps {
  messages: AgentMessage[];
  consensus: AgentConsensus;
}

export const AgentTimeline: React.FC<AgentTimelineProps> = ({ messages, consensus }) => {
  const getAgentColor = (from: string) => {
    switch (from) {
      case 'soil':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'weather':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'conservation':
        return 'text-teal-400 bg-teal-500/10 border-teal-500/30';
      case 'irrigation':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'coordinator':
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'urgent':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
      case 'caution':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'approval':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Dialogue Stream */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Autonomous Agent Message Bus & Negotiation Log</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {messages.length} broadcast events
          </span>
        </div>

        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800">
          {messages.map((msg) => (
            <div key={msg.id} className="relative flex items-start space-x-3 pl-2">
              <div className="relative z-10 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                {getSentimentIcon(msg.sentiment)}
              </div>

              <div className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getAgentColor(
                      msg.fromAgent
                    )}`}
                  >
                    {msg.fromAgent.toUpperCase()} AGENT
                  </span>
                  <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                <p className="text-slate-200 mt-1.5 leading-relaxed font-normal">
                  {msg.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consensus Summary Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 rounded-xl border border-emerald-500/40 p-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Coordinator Agent Consensus Output
              </h4>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                {consensus.agreementRate}% Agreement Rate
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {consensus.finalDecision}
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-[11px] text-slate-400 font-mono">
              <span>Volume: <strong className="text-white">{consensus.consensusWaterLiters.toLocaleString()} L</strong></span>
              <span>Duration: <strong className="text-white">{consensus.consensusDurationMinutes} min</strong></span>
              <span>Delay: <strong className="text-white">{consensus.consensusDelayHours} hours</strong></span>
              <span>Confidence: <strong className="text-emerald-400">{consensus.confidence}%</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
