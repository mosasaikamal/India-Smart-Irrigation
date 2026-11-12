import React, { useState, useEffect } from 'react';
import { api, AssistantResponseDto, FieldDto } from '../services/api';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Layers,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Info,
  HelpCircle,
  FileText
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  responseDto?: AssistantResponseDto;
  timestamp: string;
}

export const AIAssistantPage: React.FC = () => {
  const [fields, setFields] = useState<FieldDto[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('field-01');
  const [query, setQuery] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modePreference, setModePreference] = useState<'AUTO' | 'REAL_LLM' | 'RULE_FALLBACK'>('AUTO');
  const [selectedCitationMessage, setSelectedCitationMessage] = useState<ChatMessage | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const fList = await api.getFields();
        setFields(fList);
        // Seed welcome greeting
        setMessages([
          {
            id: 'msg-welcome',
            sender: 'assistant',
            text: `Welcome to **Agro Intelligence Grounded Assistant**. 
I operate in **Dual-Mode** (Real LLM Adapter + Rule-Based Mathematical Fallback). 
Every figure I cite originates directly from your verified field telemetry, FAO-56 soil water balance equations, and the Beam Search scheduling engine. I never fabricate numbers.

**You can ask:**
- *"How much water does my field need right now?"*
- *"Explain how Reference Evapotranspiration (ET0) was calculated"*
- *"Why did the supervisor postpone irrigation?"*
- *"What water savings did the Beam Search optimizer find?"*`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      } catch (e) {
        console.warn('Failed to load fields:', e);
      }
    }
    load();
  }, []);

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const resp = await api.queryAssistant({
        field_id: selectedFieldId,
        query: q,
        mode_preference: modePreference,
      });

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: resp.answer,
        responseDto: resp,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setSelectedCitationMessage(assistantMsg);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: `### System Notice: Query Processing Error\n${err}`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'How much water does my field need right now?',
    'Explain the FAO-56 Penman-Monteith calculation',
    'Why did the supervisor postpone irrigation?',
    'What water savings did Beam Search find vs baseline?',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Grounded Generative AI Assistant</h2>
            <DataSourceBadge type="CALCULATED" label="RAG Verified Engine" />
          </div>
          <p className="text-xs text-slate-300">
            Dual-mode: Real LLM adapter with strict grounding + Rule-Based Mathematical Fallback with verifiable citations.
          </p>
        </div>

        {/* Sector & Mode Pickers */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedFieldId}
              onChange={(e) => setSelectedFieldId(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-[10px] text-slate-400 px-1 font-semibold">Mode:</span>
            <button
              onClick={() => setModePreference('AUTO')}
              className={`px-2 py-1 rounded text-[10px] font-bold ${
                modePreference === 'AUTO' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => setModePreference('REAL_LLM')}
              className={`px-2 py-1 rounded text-[10px] font-bold ${
                modePreference === 'REAL_LLM' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Real LLM
            </button>
            <button
              onClick={() => setModePreference('RULE_FALLBACK')}
              className={`px-2 py-1 rounded text-[10px] font-bold ${
                modePreference === 'RULE_FALLBACK' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Rule Fallback
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Chat on Left, Citations Drawer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat Feed (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col h-[650px] agri-card p-0 overflow-hidden">
          {/* Quick Prompts Bar */}
          <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto text-xs shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Prompts:</span>
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800/80 hover:border-emerald-500/40 text-[11px] whitespace-nowrap transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-600/20'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {/* Out of domain warning banner if flagged */}
                  {msg.responseDto?.unsupported_elements_noted && (
                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] mb-2 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Domain Boundary Notice: Agricultural and irrigation scope maintained.</span>
                    </div>
                  )}

                  {/* Markdown Answer Rendering */}
                  <div className="prose prose-invert prose-xs max-w-none whitespace-pre-line">
                    {msg.text}
                  </div>

                  {msg.responseDto && (
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                      <div className="flex items-center space-x-2">
                        <span className="text-emerald-400 font-mono font-semibold">
                          {msg.responseDto.mode_used}
                        </span>
                        {msg.responseDto.provider_status && (
                          <span className="text-slate-400 font-mono text-[9px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {msg.responseDto.provider_status}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedCitationMessage(msg)}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold underline flex items-center space-x-1"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Inspect {msg.responseDto.evidence_citations.length} Grounded Sources</span>
                      </button>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-xs text-slate-400 animate-pulse p-2">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>Retrieving verified field telemetry across 6 domains and computing equations...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2 shrink-0">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask an agronomic question (e.g. How much water does my crop need?)..."
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !query.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center space-x-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>

        {/* Evidence & Grounded Citations Drawer (4 Cols) */}
        <div className="lg:col-span-4 agri-card space-y-4 max-h-[650px] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Verified Evidence & Citations</span>
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono">Zero Hallucination</span>
          </div>

          {selectedCitationMessage?.responseDto ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-850 pb-2">
                <span>Field: <strong className="text-slate-200">{selectedCitationMessage.responseDto.field_id}</strong></span>
                <span>Retrieved: <strong className="text-slate-200">{new Date(selectedCitationMessage.responseDto.retrieval_timestamp).toLocaleTimeString()}</strong></span>
              </div>

              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Sources Bound to Answer ({selectedCitationMessage.responseDto.evidence_citations.length}):
              </span>

              <div className="space-y-2.5">
                {selectedCitationMessage.responseDto.evidence_citations.map((c, idx) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/90 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-emerald-400 font-semibold">{c.category}</span>
                      <DataSourceBadge type={c.source_type as any} />
                    </div>
                    <div className="text-white font-medium text-[11px]">{c.label}</div>
                    <div className="text-emerald-300 font-mono text-[11px] font-semibold bg-slate-900/90 p-1.5 rounded border border-slate-800">
                      {c.value}
                    </div>
                    {c.calculation_method && (
                      <div className="text-[9px] text-slate-400 flex items-center space-x-1 font-mono">
                        <span className="text-amber-400 font-bold">Method:</span>
                        <span>{c.calculation_method}</span>
                      </div>
                    )}
                    {c.timestamp && (
                      <div className="text-[9px] text-slate-500 font-mono">
                        Timestamp: {new Date(c.timestamp).toISOString().split('.')[0]}Z
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Governing Formulas Cited */}
              {selectedCitationMessage.responseDto.referenced_formulas.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Referenced Mathematical Formulas:
                  </span>
                  <div className="space-y-1 font-mono text-[10px] text-amber-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    {selectedCitationMessage.responseDto.referenced_formulas.map((f, i) => (
                      <p key={i}>• {f}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Stated Assumptions */}
              {selectedCitationMessage.responseDto.assumptions_stated.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Physical Assumptions:
                  </span>
                  <div className="space-y-1 text-[10px] text-slate-400 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    {selectedCitationMessage.responseDto.assumptions_stated.map((a, i) => (
                      <p key={i}>• {a}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <p>Ask a question or select an assistant message to inspect its grounded database citations and formulas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
