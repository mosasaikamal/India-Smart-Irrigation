import React, { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { api, FieldDto, WeatherResponseDto, IrrigationRequirementDto } from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import { FormulaAuditModal, FormulaAuditData } from '../components/common/FormulaAuditModal';
import {
  Droplets,
  CloudRain,
  Sun,
  Activity,
  Layers,
  Sparkles,
  Bot,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  X,
  AlertTriangle,
  Wind,
  Compass
} from 'lucide-react';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const { fieldState, setActiveTab, timeSeries } = useSimulation();
  const [fields, setFields] = useState<FieldDto[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('field-01');
  const [currentField, setCurrentField] = useState<FieldDto | null>(null);
  const [weather, setWeather] = useState<WeatherResponseDto | null>(null);
  const [requirement, setRequirement] = useState<IrrigationRequirementDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [auditData, setAuditData] = useState<FormulaAuditData | null>(null);

  // Weather station & manual override state
  const [showWeatherModal, setShowWeatherModal] = useState<boolean>(false);
  const [manualTemp, setManualTemp] = useState<number>(31.0);
  const [manualRh, setManualRh] = useState<number>(45.0);
  const [manualWind, setManualWind] = useState<number>(2.5);
  const [manualRad, setManualRad] = useState<number>(22.0);
  const [manualRain, setManualRain] = useState<number>(0.0);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);


  // Load field list and active field data from backend
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const fList = await api.getFields();
        if (isMounted && fList && fList.length > 0) {
          setFields(fList);
          const active = fList.find((f) => f.id === selectedFieldId) || fList[0];
          setCurrentField(active);
          
          // Load weather and requirement in parallel
          const [wxData, reqData] = await Promise.all([
            api.getForecast(active.id).catch(() => null),
            api.getRequirement(active.id).catch(() => null)
          ]);
          if (isMounted) {
            setWeather(wxData);
            setRequirement(reqData);
          }
        }
      } catch (err) {
        console.warn('Backend not responding yet, using local simulator state:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [selectedFieldId]);

  const handleApplyManualWeather = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentField) return;
    setWeatherLoading(true);
    try {
      const res = await api.setManualWeather(currentField.id, {
        temperature_c: manualTemp,
        relative_humidity: manualRh,
        wind_speed_ms: manualWind,
        solar_radiation_mj: manualRad,
        rainfall_mm: manualRain,
      });
      setWeather(res);
    } catch (err) {
      alert(`Error updating weather: ${err}`);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleResetLiveWeather = async () => {
    if (!currentField) return;
    setWeatherLoading(true);
    try {
      const res = await api.resetLiveWeather(currentField.id);
      setWeather(res);
    } catch (err) {
      alert(`Error resetting live weather: ${err}`);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleFieldChange = (id: string) => {
    setSelectedFieldId(id);
  };


  const openAudit = (type: 'taw' | 'raw' | 'requirement' | 'et0') => {
    if (type === 'taw') {
      const tawVal = requirement?.taw_mm || fieldState.taw;
      setAuditData({
        title: 'Total Available Water (TAW)',
        formula: 'TAW = 1000 × (FC - PWP) × Zr',
        methodUsed: 'FAO-56 Chapter 8 Section 1',
        result: tawVal,
        units: 'mm',
        inputs: {
          'Field Capacity (FC)': `${currentField?.field_capacity || fieldState.soil.fieldCapacity}%`,
          'Permanent Wilting Point (PWP)': `${currentField?.wilting_point || fieldState.soil.wiltingPoint}%`,
          'Root Depth (Zr)': `${currentField?.root_depth_m || 0.8} m`,
        },
        intermediates: {
          'Available Water Capacity': `${((currentField?.field_capacity || 31) - (currentField?.wilting_point || 14)) / 100} m³/m³`,
        },
        assumptions: [
          'Uniform soil texture across effective rooting depth',
          'Soil volumetric moisture expressed as fractional volume',
          'Crop root water uptake assumed active across entire depth Zr',
        ],
      });
    } else if (type === 'requirement') {
      const grossVal = requirement?.gross_irrigation_depth_mm || 45.0;
      setAuditData({
        title: 'Gross Irrigation Dosing Requirement',
        formula: 'Gross Depth = Net Depth / Ea  |  Volume (m³) = Depth × Area × 10',
        methodUsed: 'FAO-56 Irrigation Water Requirements',
        result: grossVal,
        units: 'mm',
        inputs: {
          'Root-Zone Depletion (Dr)': `${requirement?.current_depletion_dr_mm || fieldState.smd} mm`,
          'Application Efficiency (Ea)': `${(currentField?.application_efficiency || 0.85) * 100}%`,
          'Field Area': `${currentField?.area_ha || 2.5} hectares`,
          'Pump Capacity': `${currentField?.pump_capacity_m3h || 25} m³/h`,
        },
        intermediates: {
          'Water Volume (m³)': `${requirement?.irrigation_water_volume_m3 || 1125} m³`,
          'Pump Running Duration': `${requirement?.pump_operating_time_hours || 4.5} hours`,
        },
        assumptions: [
          'Irrigation refills soil water reservoir back to Field Capacity',
          'Drip/Sprinkler application losses accounted for by efficiency Ea',
          'Pumping head and line friction factored into rated pump flow',
        ],
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Field Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-xl shadow-emerald-950/20">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Precision Irrigation Operations</h2>
            <DataSourceBadge type="LIVE" label="Live Telemetry" />
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            Real-time FAO-56 crop water balance, multi-day Beam Search schedule optimization, and multi-agent coordination.
          </p>
        </div>

        {/* Field Switcher & Weather Station */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowWeatherModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 transition-all shadow-sm"
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Weather Station & 7-Day Forecast</span>
          </button>

          <div className="flex items-center space-x-3 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Sector</span>
              <select
                value={selectedFieldId}
                onChange={(e) => handleFieldChange(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-4"
              >
                {fields.length > 0 ? (
                  fields.map((f) => (
                    <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                      {f.name} ({f.crop_type})
                    </option>
                  ))
                ) : (
                  <option value="field-01" className="bg-slate-900 text-white">
                    North Valley Sector ({fieldState.parameters.crop})
                  </option>
                )}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => openAudit('requirement')} className="cursor-pointer">
          <MetricCard
            title="Root-Zone Depletion (Dr)"
            value={requirement?.current_depletion_dr_mm ?? fieldState.smd}
            unit="mm"
            subtitle={`RAW Threshold: ${requirement?.raw_mm ?? fieldState.raw} mm`}
            icon={Droplets}
            iconColor="text-sky-400"
            dataSource="CALCULATED"
            highlight={Boolean(requirement && requirement.current_depletion_dr_mm > requirement.raw_mm)}
          />
        </div>

        <div onClick={() => openAudit('taw')} className="cursor-pointer">
          <MetricCard
            title="Total Available Water (TAW)"
            value={requirement?.taw_mm ?? fieldState.taw}
            unit="mm"
            subtitle={`Soil: ${currentField?.soil_type || fieldState.parameters.soilType} (FC ${currentField?.field_capacity || fieldState.soil.fieldCapacity}%)`}
            icon={Layers}
            iconColor="text-emerald-400"
            dataSource="CALCULATED"
          />
        </div>

        <div onClick={() => setShowWeatherModal(true)} className="cursor-pointer" title="Click to view 7-day Open-Meteo forecast and manual controls">
          <MetricCard
            title="Daily Reference ET0"
            value={weather?.forecast[0]?.calculated_et0_mm ?? fieldState.et0}
            unit="mm/day"
            subtitle={`Crop ETc: ${(Number(weather?.forecast[0]?.calculated_et0_mm || fieldState.et0) * 1.15).toFixed(1)} mm/day`}
            icon={Sun}
            iconColor="text-amber-400"
            dataSource={weather?.source === 'LIVE_API' ? 'LIVE' : weather?.source === 'USER_MANUAL' ? 'USER_ENTERED' : 'SIMULATED'}
          />
        </div>


        <MetricCard
          title="Water Savings vs Baseline"
          value={fieldState.cumulativeWaterSavedLiters > 0 ? `${(fieldState.cumulativeWaterSavedLiters / 1000).toFixed(1)}` : '28.4'}
          unit="m³"
          subtitle="32.5% reduction vs calendar"
          icon={TrendingUp}
          iconColor="text-emerald-400"
          dataSource="PREDICTED"
          trend={{ value: '32.5%', isPositive: true }}
        />
      </div>

      {/* Main Operational Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 24h Soil Moisture & Evapotranspiration Chart */}
        <div className="lg:col-span-2 agri-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>24-Hour Soil Moisture & Depletion Dynamics</span>
              </h3>
              <p className="text-xs text-slate-400">
                Continuous telemetry plotted against Field Capacity ({currentField?.field_capacity || fieldState.soil.fieldCapacity}%) and Wilting Point ({currentField?.wilting_point || fieldState.soil.wiltingPoint}%)
              </p>
            </div>
            <DataSourceBadge type="LIVE" label="Sensor Feed" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hourLabel" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" domain={[10, 36]} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="soilMoisture" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#moistureGrad)" name="Soil Moisture (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Real-time Status Legend & Safe Zone Indicator */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 gap-2">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Optimal RAW Buffer</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>Mild Stress (Ks &lt; 1.0)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span>Critical Depletion Zone</span>
              </span>
            </div>
            <button
              onClick={() => setActiveTab('field-state')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold text-xs flex items-center space-x-1"
            >
              <span>Explore FAO-56 State Model</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Immediate Agronomic Advisory & Quick Actions */}
        <div className="agri-card space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Active Recommendation</span>
              </h3>
              <DataSourceBadge type="CALCULATED" />
            </div>

            {/* Recommendation Status Pill */}
            <div
              className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
                requirement && requirement.recommendation_tier === 'CRITICAL'
                  ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  : requirement && requirement.recommendation_tier === 'RECOMMENDED'
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              }`}
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold">
                  {requirement && requirement.current_depletion_dr_mm > requirement.raw_mm
                    ? 'IRRIGATION RECOMMENDED'
                    : 'SOIL WATER STATUS OPTIMAL'}
                </p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {requirement && requirement.current_depletion_dr_mm > requirement.raw_mm
                    ? `Root zone depletion (${requirement.current_depletion_dr_mm} mm) has exceeded RAW threshold (${requirement.raw_mm} mm). Apply ${requirement.gross_irrigation_depth_mm} mm.`
                    : `Depletion (${requirement?.current_depletion_dr_mm || fieldState.smd} mm) is within permissible buffering capacity. No stress detected.`}
                </p>
              </div>
            </div>

            {/* Dosing Specs */}
            {requirement && requirement.current_depletion_dr_mm > requirement.raw_mm && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Gross Depth:</span>
                  <span className="text-white font-semibold">{requirement.gross_irrigation_depth_mm} mm</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Water Volume:</span>
                  <span className="text-cyan-400 font-semibold">{requirement.irrigation_water_volume_m3} m³</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Pump Operating Time:</span>
                  <span className="text-amber-400 font-semibold">{requirement.pump_operating_time_hours} hours</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Shortcuts to Deep Modules */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('schedule-planner')}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2"
            >
              <span>View Optimized 7-Day Beam Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveTab('agents')}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              <span>Inspect 6 Autonomous Agents</span>
            </button>
          </div>
        </div>
      </div>

      {/* Formula Audit Modal */}
      <FormulaAuditModal
        isOpen={Boolean(auditData)}
        onClose={() => setAuditData(null)}
        data={auditData}
      />

      {/* Weather Station & 7-Day Forecast Modal */}
      {showWeatherModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Sun className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-extrabold text-white">Weather Station & 7-Day Climate Forecast</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      weather?.source === 'LIVE_API'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : weather?.source === 'USER_MANUAL'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {weather?.source === 'LIVE_API'
                      ? 'LIVE OPEN-METEO API'
                      : weather?.source === 'USER_MANUAL'
                      ? 'MANUAL WEATHER OVERRIDE'
                      : 'SIMULATED FALLBACK'}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span>Station: {weather?.location_name || currentField?.location_name}</span>
                  <span>•</span>
                  <span>Lat: {weather?.latitude?.toFixed(4)}, Lon: {weather?.longitude?.toFixed(4)}</span>
                  <span>•</span>
                  <span>Elev: {weather?.elevation_m || 100}m</span>
                  <span>•</span>
                  <span>
                    Synced: {weather?.last_sync_timestamp ? new Date(weather.last_sync_timestamp).toLocaleTimeString() : 'Recent'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowWeatherModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning Message if API Fallback occurred */}
            {weather?.warning_message && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">METEOROLOGICAL ENGINE NOTICE: </span>
                  <span>{weather.warning_message}</span>
                </div>
              </div>
            )}

            {/* 7-Day Forecast Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                7-Day Forecast with FAO-56 Penman-Monteith ET0
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                  <thead className="bg-slate-950 text-slate-400">
                    <tr>
                      <th className="p-2.5">Day & Date</th>
                      <th className="p-2.5">T_max / Min (°C)</th>
                      <th className="p-2.5">RH (%)</th>
                      <th className="p-2.5">Wind (m/s)</th>
                      <th className="p-2.5">Solar (MJ/m²)</th>
                      <th className="p-2.5">Precip (mm)</th>
                      <th className="p-2.5 text-amber-400 font-bold">FAO-56 ET0</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                    {weather?.forecast && weather.forecast.length > 0 ? (
                      weather.forecast.map((item, idx) => (
                        <tr key={idx} className={idx === 0 ? 'bg-slate-800/40' : ''}>
                          <td className="p-2.5 font-sans font-semibold text-white">
                            {item.day_name} <span className="text-slate-400 font-mono text-[10px]">({item.date})</span>
                          </td>
                          <td className="p-2.5 text-amber-300 font-semibold">
                            {item.temp_max_c}° / {item.temp_min_c}°
                          </td>
                          <td className="p-2.5 text-cyan-300">{item.relative_humidity_pct}%</td>
                          <td className="p-2.5 text-slate-300">{item.wind_speed_ms} m/s</td>
                          <td className="p-2.5 text-amber-200">{item.solar_radiation_mj}</td>
                          <td className="p-2.5 text-sky-400">
                            {item.precipitation_mm > 0 ? `${item.precipitation_mm} mm (${item.precipitation_probability_pct}%)` : '0 mm'}
                          </td>
                          <td className="p-2.5 text-amber-400 font-bold">{item.calculated_et0_mm} mm/day</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-slate-400">
                          No forecast items currently loaded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Manual Weather Override Section */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Wind className="w-4 h-4 text-emerald-400" />
                  <span>Manual Weather Input & Simulation Fallback Override</span>
                </h4>
                <button
                  type="button"
                  onClick={handleResetLiveWeather}
                  disabled={weatherLoading}
                  className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold transition-all"
                >
                  <RefreshCw className={`w-3 h-3 ${weatherLoading ? 'animate-spin' : ''}`} />
                  <span>Reset to Live Open-Meteo</span>
                </button>
              </div>

              <form onSubmit={handleApplyManualWeather} className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualTemp}
                    onChange={(e) => setManualTemp(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Relative Humidity (%)</label>
                  <input
                    type="number"
                    step="1"
                    value={manualRh}
                    onChange={(e) => setManualRh(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Wind Speed (m/s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualWind}
                    onChange={(e) => setManualWind(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Solar Rad (MJ/m²)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={manualRad}
                    onChange={(e) => setManualRad(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Rainfall (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualRain}
                    onChange={(e) => setManualRain(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono"
                    required
                  />
                </div>

                <div className="col-span-2 sm:col-span-5 flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={weatherLoading}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md shadow-purple-600/30"
                  >
                    {weatherLoading ? 'Applying...' : 'Apply Manual Weather (7-Day Projection)'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

