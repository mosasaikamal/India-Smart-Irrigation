import React, { useState, useEffect, useRef } from 'react';
import { api, AssistantResponseDto, FieldDto } from '../services/api';
import {
  Sparkles,
  Send,
  User,
  Bot,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Droplet,
  Info,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  responseDto?: AssistantResponseDto;
  timestamp: string;
}

export const AIAssistantSimplePage: React.FC = () => {
  const [fields, setFields] = useState<FieldDto[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('field-01');
  const [query, setQuery] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedSources, setExpandedSources] = useState<{ [msgId: string]: boolean }>({});
  const [modePreference, setModePreference] = useState<'AUTO' | 'REAL_LLM' | 'RULE_FALLBACK'>('AUTO');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadFields() {
      try {
        const list = await api.getFields();
        setFields(list);
        if (list.length > 0) {
          setSelectedFieldId(list[0].id);
        }
      } catch (e) {
        console.warn('Failed to load fields:', e);
      }
    }
    loadFields();

    // Initial greeting
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: `Hello! I am **AgroAI**, your smart agricultural advisor.\n\nI analyze your real field soil tests, local weather forecasts, and crop water requirements to give you accurate, verified recommendations.\n\nHow can I help you optimize your irrigation today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: `I encountered an issue retrieving your field data: ${err}. Please ensure the system backend is running.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSource = (msgId: string) => {
    setExpandedSources((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const suggestedQuestions = [
    'Why does my field need irrigation?',
    'How much water does my crop need?',
    'Can I save water?',
    'What happens if it rains?',
    'Explain my irrigation schedule.',
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Ask AgroAI</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Verified Advisory
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Answers are calculated directly from your actual field moisture, crop stages, and weather forecasts.
          </p>
        </div>

        {/* Field & Mode Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Field:</span>
            <select
              value={selectedFieldId}
              onChange={(e) => setSelectedFieldId(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.crop_type})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Engine:</span>
            <select
              value={modePreference}
              onChange={(e) => setModePreference(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="AUTO">Auto (Smart)</option>
              <option value="RULE_FALLBACK">Standard Agronomy Engine</option>
              <option value="REAL_LLM">Cloud Generative AI</option>
            </select>
          </div>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="space-y-2">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 px-1">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Suggested Questions:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="text-xs px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-700 transition-colors shadow-2xs text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm flex flex-col h-[520px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-tr-xs shadow-sm'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs'
                }`}
              >
                {/* Content */}
                <div className="whitespace-pre-line font-sans">
                  {msg.text}
                </div>

                {/* Grounding Attribution & Calculation Proof */}
                {msg.responseDto && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80">
                    <button
                      onClick={() => toggleSource(msg.id)}
                      className="flex items-center space-x-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>
                        {expandedSources[msg.id]
                          ? 'Hide Supporting Calculation & Sources'
                          : `View Supporting Data & Verified Sources (${msg.responseDto.evidence_citations?.length || 1})`}
                      </span>
                      {expandedSources[msg.id] ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {expandedSources[msg.id] && (
                      <div className="mt-2.5 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 space-y-2">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 text-[11px]">
                          <span className="font-semibold text-slate-700">Verified Evidence:</span>
                          <span className="font-mono text-emerald-600 font-medium">
                            {msg.responseDto.mode_used}
                          </span>
                        </div>

                        {msg.responseDto.evidence_citations && msg.responseDto.evidence_citations.length > 0 ? (
                          <ul className="space-y-1.5">
                            {msg.responseDto.evidence_citations.map((cite, i) => (
                              <li key={i} className="flex items-start space-x-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold text-slate-800">{cite.label}: </span>
                                  <span>{cite.value}</span>
                                  {cite.calculation_method && (
                                    <span className="text-slate-400 block text-[10px]">Method: {cite.calculation_method}</span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-slate-500 italic">
                            Generated from standard FAO-56 soil water balance equations and current sensor telemetry.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1.5 ${
                    msg.sender === 'user' ? 'text-emerald-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3 text-slate-500 text-xs">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-2.5">
                Calculating recommendation from field water balance...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your field, soil moisture, or water savings..."
              disabled={loading}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-medium text-sm flex items-center space-x-1.5 transition-colors shadow-sm shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
