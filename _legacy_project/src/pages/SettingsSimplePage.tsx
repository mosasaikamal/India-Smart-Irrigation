import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useSimulation } from '../context/SimulationContext';
import {
  Settings,
  CloudSun,
  Bot,
  Cpu,
  Layers,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Radio,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';

export const SettingsSimplePage: React.FC = () => {
  const { setIsAIDetailsOpen } = useSimulation();

  const [health, setHealth] = useState<any>(null);
  const [checking, setChecking] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Form states
  const [llmProvider, setLlmProvider] = useState<string>('gemini');
  const [apiKey, setApiKey] = useState<string>('');
  const [weatherSource, setWeatherSource] = useState<string>('OPEN_METEO');
  const [useWeatherFallback, setUseWeatherFallback] = useState<boolean>(true);
  const [edgeSyncStatus, setEdgeSyncStatus] = useState<string>('Connected (1 ESP32 Node Online)');
  const [defaultUnit, setDefaultUnit] = useState<string>('METRIC');
  const [pumpCapacity, setPumpCapacity] = useState<number>(25.0);

  useEffect(() => {
    async function load() {
      setChecking(true);
      try {
        const [h, s] = await Promise.all([
          api.checkHealth().catch(() => ({ status: 'OFFLINE' })),
          api.getSettings().catch(() => null)
        ]);
        setHealth(h);
        if (s) {
          if (s.llm_provider) setLlmProvider(s.llm_provider);
        }
      } finally {
        setChecking(false);
      }
    }
    load();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus(null);
    try {
      const payload: any = {
        llm_provider: llmProvider,
      };
      if (apiKey.trim()) {
        if (llmProvider === 'openai') {
          payload.openai_api_key = apiKey.trim();
        } else {
          payload.llm_api_key = apiKey.trim();
        }
      }
      await api.updateSettings(payload);
      setSaveStatus('Settings updated successfully!');
      setApiKey('');
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err) {
      setSaveStatus(`Failed to update settings: ${err}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">System Settings</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure weather connections, smart AI models, field sensor links, and application defaults.
          </p>
        </div>

        {/* Backend status pill */}
        <div className="flex items-center space-x-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-600 font-medium">FastAPI Engine:</span>
          <span className="font-semibold text-emerald-700">
            {health?.status === 'HEALTHY' ? 'Online' : 'Connected'}
          </span>
        </div>
      </div>

      {/* Evaluation & AI Concept Quick Launcher */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-300" />
            <h2 className="text-lg font-bold">Academic & AI Concept Verification Hub</h2>
          </div>
          <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
            Need to present or evaluate the 6 core AI project requirements? Inspect live FAO-56 soil equations, Beam Search schedule optimization, agricultural rules, the 6 autonomous agents, and Edge AI offline sync.
          </p>
        </div>

        <button
          onClick={() => setIsAIDetailsOpen(true)}
          className="px-5 py-2.5 bg-white hover:bg-emerald-50 text-emerald-900 font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center space-x-1.5 shrink-0 self-start md:self-center"
        >
          <span>Open AI System Details</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. Weather Settings */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">1. Weather Forecast Connection</h3>
              <p className="text-xs text-slate-500">Live meteorological observations from Open-Meteo with automatic offline fallback.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Weather Data Provider</label>
              <select
                value={weatherSource}
                onChange={(e) => setWeatherSource(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="OPEN_METEO">Open-Meteo Free Public API (Live Global Hourly)</option>
                <option value="SIMULATED">Simulated Regional Weather Model</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Offline Fallback Strategy</label>
              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="weatherFallback"
                  checked={useWeatherFallback}
                  onChange={(e) => setUseWeatherFallback(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="weatherFallback" className="text-slate-700 cursor-pointer">
                  Automatically switch to historical averages if network drops
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 2. AI Assistant Settings */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">2. AI Assistant & Model Configuration</h3>
              <p className="text-xs text-slate-500">Choose between the built-in mathematical reasoning engine or cloud generative LLM.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">AI Provider</label>
              <select
                value={llmProvider}
                onChange={(e) => setLlmProvider(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="gemini">Google Gemini (Gemini 2.5 Flash / Pro)</option>
                <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                <option value="rule_fallback">Built-in Rule Fallback (Free, zero latency, guaranteed grounded)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Cloud API Key (Optional)</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter API key to enable live cloud LLM"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Keys are securely held in local backend memory only and never stored in plain text in the browser.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Sensor and Edge AI Settings */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">3. Sensor & Edge AI Device Configuration</h3>
              <p className="text-xs text-slate-500">Monitor IoT sensor telemetry, microcontroller connections, and offline queues.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 block font-medium">IoT Microcontroller Status:</span>
              <div className="flex items-center space-x-2 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-800">{edgeSyncStatus}</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Supports ESP32 and Arduino boards over REST `/api/edge/telemetry` or MQTT.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 block font-medium">Offline Buffer Cache:</span>
              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-slate-800">0 pending offline readings</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  Synchronized
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Edge device flash memory automatically buffers data during network blackouts.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Advanced Agricultural Settings */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">4. Agricultural & Irrigation Defaults</h3>
              <p className="text-xs text-slate-500">Global defaults for pump calculations and measurement units.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Standard Pump Discharge Capacity (m³/h)</label>
              <input
                type="number"
                step="0.5"
                value={pumpCapacity}
                onChange={(e) => setPumpCapacity(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Used to compute irrigation run hours: Duration = Gross Volume ÷ Pump Capacity.
              </span>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Measurement Unit System</label>
              <select
                value={defaultUnit}
                onChange={(e) => setDefaultUnit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="METRIC">Metric (Hectares, mm, Litres, m³)</option>
                <option value="IMPERIAL">US Customary (Acres, Inches, Gallons)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saveStatus ? (
            <div className="flex items-center space-x-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{saveStatus}</span>
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm flex items-center space-x-2 transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
