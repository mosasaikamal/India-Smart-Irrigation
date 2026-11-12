import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import {
  Settings,
  Server,
  Key,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Globe,
  Radio,
  FileCheck,
  Cpu,
  RefreshCw
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [checking, setChecking] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [provider, setProvider] = useState<string>('gemini');
  const [settingsData, setSettingsData] = useState<any>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const checkBackend = async () => {
    setChecking(true);
    try {
      const [hRes, sRes] = await Promise.all([
        api.checkHealth(),
        api.getSettings().catch(() => null)
      ]);
      setHealth(hRes);
      if (sRes) {
        setSettingsData(sRes);
        if (sRes.llm_provider) {
          setProvider(sRes.llm_provider);
        }
      }
    } catch (e) {
      setHealth({ status: 'OFFLINE', error: String(e) });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const payload: any = { llm_provider: provider };
      if (apiKey.trim()) {
        if (provider === 'openai') {
          payload.openai_api_key = apiKey.trim();
        } else {
          payload.llm_api_key = apiKey.trim();
        }
      }
      const res = await api.updateSettings(payload);
      setSettingsData(res.settings);
      setSaveMsg({ type: 'success', text: 'Credentials updated and stored securely in server memory.' });
      setApiKey('');
      setTimeout(() => setSaveMsg(null), 5000);
    } catch (err) {
      setSaveMsg({ type: 'error', text: `Failed to update credentials: ${err}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30">
        <h2 className="text-xl font-extrabold text-white tracking-tight">System & Model Configuration</h2>
        <p className="text-xs text-slate-300">
          Backend service health, Open-Meteo weather adapter, Grounded LLM provider credentials, and data provenance standards.
        </p>
      </div>

      {/* Backend Health Status Card */}
      <div className="agri-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <Server className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Python FastAPI Engine Health</h3>
              <p className="text-xs text-slate-400">Microservices architecture with SQLAlchemy SQLite persistence</p>
            </div>
          </div>

          <button
            onClick={checkBackend}
            disabled={checking}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>Check Health</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Service Status</span>
            <span className={`text-base font-bold ${health?.status === 'HEALTHY' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {health?.status || 'INITIALIZING'}
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Database Engine</span>
            <span className="text-base font-bold text-white">{health?.database || 'SQLite v3'}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block">API Framework</span>
            <span className="text-base font-bold text-emerald-300">FastAPI / Uvicorn</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Version</span>
            <span className="text-base font-bold text-slate-300">v1.0.0-fao56</span>
          </div>
        </div>
      </div>

      {/* Grounded LLM Configuration Card */}
      <div className="agri-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <Key className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Grounded AI Provider Configuration</h3>
              <p className="text-xs text-slate-400">Mode 1 Real LLM API adapter (Key never exposed to client)</p>
            </div>
          </div>
          <DataSourceBadge type="CALCULATED" label="Dual-Mode AI" />
        </div>

        <form onSubmit={handleSaveApiKey} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">LLM Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium"
              >
                <option value="gemini">Google Gemini (Recommended)</option>
                <option value="openai">OpenAI GPT-4o / Mini</option>
                <option value="none">Rule-Based Mathematical Fallback Only</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">API Secret Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy... or sk-..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-slate-400">
              When no API key is set, the system automatically uses **Mode 2: Rule-Based Mathematical Fallback**.
            </p>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold shadow-md shadow-emerald-600/30 transition-all shrink-0 flex items-center space-x-1.5"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Credentials</span>
              )}
            </button>
          </div>

          {saveMsg && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
                saveMsg.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{saveMsg.text}</span>
            </div>
          )}
        </form>
      </div>

      {/* Data Provenance & Authenticity Standard Card */}
      <div className="agri-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Data Provenance & Authenticity Standard</h3>
              <p className="text-xs text-slate-400">Visual indicators deployed across all 11 application views</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Live Telemetry</span>
              <DataSourceBadge type="LIVE" />
            </div>
            <p className="text-slate-400 text-[11px]">
              Direct authenticated readings from physical edge IoT sensors or Open-Meteo meteorological feed.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">User-Entered Data</span>
              <DataSourceBadge type="USER_ENTERED" />
            </div>
            <p className="text-slate-400 text-[11px]">
              User-specified agricultural parcel configurations, custom crop Kc coefficients, and soil textures.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Simulated Data</span>
              <DataSourceBadge type="SIMULATED" />
            </div>
            <p className="text-slate-400 text-[11px]">
              Deterministic physical and atmospheric simulation models used when offline or testing.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Calculated Values</span>
              <DataSourceBadge type="CALCULATED" />
            </div>
            <p className="text-slate-400 text-[11px]">
              Values derived strictly via published scientific formulas (FAO-56 Penman-Monteith, TAW, RAW, Ks).
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Predicted Projections</span>
              <DataSourceBadge type="PREDICTED" />
            </div>
            <p className="text-slate-400 text-[11px]">
              Multi-day Beam Search schedule recommendations and forward daily soil water balance forecasts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
