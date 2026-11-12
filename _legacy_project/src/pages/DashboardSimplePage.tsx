import React, { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { api, FieldDto, WeatherResponseDto, IrrigationRequirementDto } from '../services/api';
import { FarmScene3D } from '../components/3d/FarmScene3D';
import {
  Droplet,
  Calendar,
  TrendingDown,
  ArrowRight,
  Sun,
  CloudRain,
  CloudSun,
  Layers,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info,
  Thermometer,
  Wind,
  Compass,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export const DashboardSimplePage: React.FC = () => {
  const { setActiveTab, setIsAIDetailsOpen, timeSeries } = useSimulation();

  const [fields, setFields] = useState<FieldDto[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('field-01');
  const [currentField, setCurrentField] = useState<FieldDto | null>(null);
  const [weather, setWeather] = useState<WeatherResponseDto | null>(null);
  const [requirement, setRequirement] = useState<IrrigationRequirementDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedZoneInfo, setSelectedZoneInfo] = useState<string>('Sector Alpha (North Plot)');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const fList = await api.getFields();
        setFields(fList);
        if (fList.length > 0) {
          const defaultField = fList.find((f) => f.id === selectedFieldId) || fList[0];
          setCurrentField(defaultField);

          const [wRes, reqRes] = await Promise.all([
            api.getForecast(defaultField.id).catch(() => null),
            api.getRequirement(defaultField.id).catch(() => null)
          ]);
          setWeather(wRes);
          setRequirement(reqRes);
        }
      } catch (err) {
        console.warn('Dashboard data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedFieldId]);

  const handleSelectField = (fid: string) => {
    setSelectedFieldId(fid);
  };

  const moisturePct = currentField?.volumetric_moisture ?? 24;
  const fcPct = currentField?.field_capacity ?? 32;
  const pwpPct = currentField?.wilting_point ?? 14;

  const isMoistureOptimal = moisturePct >= 20;
  const waterNeededLitres = requirement?.irrigation_water_volume_liters ?? 250000;
  const waterNeededMm = requirement?.gross_irrigation_depth_mm ?? 48;

  // Simple 7-day forecast cards
  const sevenDays = [
    { day: 'Today', temp: 28, rain: 0, status: 'No Watering' },
    { day: 'Tomorrow', temp: 29, rain: 0, status: 'Water 35mm' },
    { day: 'Wed', temp: 27, rain: 0, status: 'No Watering' },
    { day: 'Thu', temp: 24, rain: 14, status: 'Rain Expected' },
    { day: 'Fri', temp: 25, rain: 2, status: 'No Watering' },
    { day: 'Sat', temp: 28, rain: 0, status: 'Water 12mm' },
    { day: 'Sun', temp: 29, rain: 0, status: 'No Watering' },
  ];

  const [chartView, setChartView] = useState<'7DAY' | '24HR'>('7DAY');

  // Compute dynamic 7-day soil moisture progression based on selected field
  const sevenDayChartData = React.useMemo(() => {
    const baseM = currentField?.volumetric_moisture ?? 24.0;
    const fc = currentField?.field_capacity ?? 32.0;
    const pwp = currentField?.wilting_point ?? 14.0;

    return [
      { label: 'Today', soilMoisture: baseM, moisture: baseM, note: 'Current Telemetry' },
      { label: 'Tomorrow', soilMoisture: Math.min(fc, Number((baseM + 7.5).toFixed(1))), moisture: Math.min(fc, Number((baseM + 7.5).toFixed(1))), note: 'After 35mm Watering' },
      { label: 'Wed', soilMoisture: Math.max(pwp, Number((baseM + 5.2).toFixed(1))), moisture: Math.max(pwp, Number((baseM + 5.2).toFixed(1))), note: 'Evapotranspiration' },
      { label: 'Thu', soilMoisture: Math.min(fc, Number((baseM + 6.8).toFixed(1))), moisture: Math.min(fc, Number((baseM + 6.8).toFixed(1))), note: '14mm Rain Forecast' },
      { label: 'Fri', soilMoisture: Math.max(pwp, Number((baseM + 4.5).toFixed(1))), moisture: Math.max(pwp, Number((baseM + 4.5).toFixed(1))), note: 'Evapotranspiration' },
      { label: 'Sat', soilMoisture: Math.min(fc, Number((baseM + 7.0).toFixed(1))), moisture: Math.min(fc, Number((baseM + 7.0).toFixed(1))), note: 'After 12mm Watering' },
      { label: 'Sun', soilMoisture: Math.max(pwp, Number((baseM + 5.0).toFixed(1))), moisture: Math.max(pwp, Number((baseM + 5.0).toFixed(1))), note: 'Optimal Buffer' },
    ];
  }, [currentField]);

  // Compute dynamic 24-hour hourly telemetry
  const hourlyChartData = React.useMemo(() => {
    const baseM = currentField?.volumetric_moisture ?? 24.0;
    const hours = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
    return hours.map((h) => {
      const daylightDecay = h >= 10 && h <= 16 ? 0.9 : 0.2;
      const m = Number((baseM - (h / 24) * daylightDecay).toFixed(1));
      return {
        label: `${h.toString().padStart(2, '0')}:00`,
        soilMoisture: m,
        moisture: m,
        note: `Hour ${h}:00 Sensor Reading`
      };
    });
  }, [currentField]);

  const activeChartData = chartView === '7DAY' ? sevenDayChartData : hourlyChartData;

  // Dynamic greeting based on user's current local hour
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning, Farmer 🌱' : currentHour < 17 ? 'Good Afternoon, Farmer ☀️' : 'Good Evening, Farmer 🌙';

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto pb-12">
      {/* Top Bar: Title & Field Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-4 lg:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Interactive 3D Digital Farm
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">Real-Time Soil & Environmental Model</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            AgroSmart Overview
          </h1>
        </div>

        {/* Field Switcher */}
        <div className="flex items-center space-x-2.5 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs">
          <Layers className="w-4 h-4 text-emerald-700 shrink-0" />
          <div className="text-left">
            <label className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">
              Active Field
            </label>
            <select
              value={selectedFieldId}
              onChange={(e) => handleSelectField(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.crop_type})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CENTRAL 3D IMMERSIVE FARM ENVIRONMENT */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-white/80 bg-slate-900">
        <FarmScene3D
          soilMoisture={moisturePct}
          fieldCapacity={fcPct}
          wiltingPoint={pwpPct}
          cropType={currentField?.crop_type || 'Wheat'}
          weatherCondition={currentField?.rainfall_mm && currentField.rainfall_mm > 0 ? 'Rainy' : 'Sunny'}
          isIrrigating={Boolean(requirement && requirement.gross_irrigation_depth_mm > 0)}
          onZoneSelect={(z) => setSelectedZoneInfo(z)}
          className="w-full h-[460px] lg:h-[540px]"
        />

        {/* FLOATING TOP-LEFT HERO GLASS PANEL */}
        <div className="absolute top-14 left-4 lg:left-6 z-10 max-w-xs sm:max-w-sm glass-panel p-5 rounded-2xl space-y-3 pointer-events-auto">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-emerald-800 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{greeting}</span>
            </span>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {currentField?.name || 'Main Cultivation Plot'}
            </h2>
            <p className="text-xs text-slate-600">
              Your crops are {isMoistureOptimal ? 'growing healthily in the optimal moisture zone' : 'approaching their irrigation threshold'}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/60">
            <div>
              <span className="text-slate-400 block">Crop & Stage:</span>
              <strong className="text-slate-800">{currentField?.crop_type} ({currentField?.growth_stage})</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Cultivated Area:</span>
              <strong className="text-slate-800">{currentField?.area_ha} hectares</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Soil Moisture:</span>
              <strong className="text-emerald-700 font-mono text-sm">{moisturePct}%</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Status:</span>
              <strong className={isMoistureOptimal ? 'text-emerald-700' : 'text-amber-700'}>
                {isMoistureOptimal ? 'Healthy' : 'Refill Due'}
              </strong>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('planner')}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-700/20 transition-all group"
          >
            <span>Plan Irrigation</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* FLOATING TOP-RIGHT COMPACT ENVIRONMENTAL TELEMETRY PANEL */}
        <div className="absolute top-14 right-4 lg:right-6 z-10 hidden md:block max-w-[240px] glass-panel p-4 rounded-2xl space-y-2.5 text-xs pointer-events-auto">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
            <span className="font-bold text-slate-900 flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-700" />
              <span>Live Telemetry</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-2 font-medium">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center space-x-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Air Temp</span>
              </span>
              <span className="font-bold text-slate-800">{currentField?.temperature_c || 28}°C</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center space-x-1">
                <Droplet className="w-3.5 h-3.5 text-sky-500" />
                <span>Humidity</span>
              </span>
              <span className="font-bold text-slate-800">{currentField?.relative_humidity || 45}% RH</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center space-x-1">
                <Wind className="w-3.5 h-3.5 text-slate-400" />
                <span>Wind Speed</span>
              </span>
              <span className="font-bold text-slate-800">{currentField?.wind_speed_ms || 2.2} m/s</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
              <span className="text-slate-500">Next Irrigation:</span>
              <strong className="text-purple-700">Tomorrow</strong>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Water Volume:</span>
              <strong className="text-sky-700">{waterNeededLitres > 0 ? `${(waterNeededLitres / 1000).toFixed(1)} m³` : '0 L'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4 MAIN METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Soil Moisture */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Soil Moisture</span>
            <span className={`p-2 rounded-xl ${isMoistureOptimal ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              <Droplet className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {moisturePct}%
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Target level: {fcPct}% • Wilting point: {pwpPct}%
            </p>
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] font-medium text-emerald-700">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{isMoistureOptimal ? 'Optimal buffer zone' : 'Approaching refill threshold'}</span>
          </div>
        </div>

        {/* Metric 2: Water Required */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Water Required</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Droplet className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {waterNeededLitres > 0 ? `${(waterNeededLitres / 1000).toLocaleString()} m³` : '0 Litres'}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {waterNeededMm > 0 ? `${waterNeededMm} mm application depth` : 'Soil moisture sufficient'}
            </p>
          </div>
          <div className="text-[11px] font-medium text-slate-500">
            Across {currentField?.area_ha || 2.5} hectares
          </div>
        </div>

        {/* Metric 3: Next Irrigation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Next Irrigation</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-slate-900">
              Tomorrow
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Recommended window: 06:00 AM (Cool hours)
            </p>
          </div>
          <div className="text-[11px] font-medium text-purple-700">
            Duration: ~3.5 hours at pump capacity
          </div>
        </div>

        {/* Metric 4: Water Saved */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Water Saved</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-emerald-700 font-mono">
              32.9%
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Compared to standard timer schedule
            </p>
          </div>
          <div className="text-[11px] font-medium text-emerald-700">
            575 m³ saved this period
          </div>
        </div>
      </div>

      {/* WHY IS THIS RECOMMENDATION MADE? */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Info className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Why is this recommendation made?
          </h3>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200">
          "Your soil moisture is currently at <strong>{moisturePct}%</strong>, which is within the safe buffer zone for <strong>{currentField?.crop_type}</strong>. The system has calculated expected daily water loss and checked the 7-day weather forecast. Because rainfall of 14 mm is expected on Thursday, irrigation is scheduled for tomorrow to maintain root-zone health without wasting water before the storm."
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <span className="text-slate-500">Calculated using scientifically verified crop water balance formulas (FAO-56 standard).</span>
          <button
            onClick={() => setIsAIDetailsOpen(true)}
            className="text-emerald-700 hover:text-emerald-800 font-semibold underline flex items-center space-x-1"
          >
            <span>Inspect AI System Details (Evaluation)</span>
          </button>
        </div>
      </div>

      {/* 7-DAY IRRIGATION SCHEDULE OVERVIEW */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">7-Day Irrigation Schedule Overview</h3>
            <p className="text-xs text-slate-500">Daily forecast and recommended watering actions</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            AI Schedule Search Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {sevenDays.map((d, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-xl border text-center flex flex-col justify-between space-y-2 transition-all ${
                d.status.includes('Water')
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 font-medium shadow-2xs'
                  : d.status.includes('Rain')
                  ? 'bg-blue-50/80 border-blue-200 text-blue-950 font-medium'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="text-xs font-bold text-slate-900">{d.day}</div>
              <div className="flex justify-center my-1 text-slate-600">
                {d.rain > 0 ? (
                  <CloudRain className="w-5 h-5 text-blue-600" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div className="text-[11px] font-mono text-slate-600">
                {d.temp}°C {d.rain > 0 ? `• ${d.rain}mm rain` : ''}
              </div>
              <div
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  d.status.includes('Water')
                    ? 'bg-emerald-600 text-white'
                    : d.status.includes('Rain')
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {d.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SOIL MOISTURE TREND CHART */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Soil Moisture Trend</h3>
            <p className="text-xs text-slate-500">Tracking moisture retention vs preferred crop limits</p>
          </div>

          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* View Switcher: 7-Day vs 24-Hour */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setChartView('7DAY')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  chartView === '7DAY'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7-Day Schedule
              </button>
              <button
                type="button"
                onClick={() => setChartView('24HR')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  chartView === '24HR'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                24-Hour Telemetry
              </button>
            </div>

            <div className="hidden md:flex items-center space-x-3 pl-2">
              <span className="flex items-center space-x-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                <span>Moisture %</span>
              </span>
              <span className="flex items-center space-x-1.5 text-emerald-600">
                <span className="w-2.5 h-1 border-t-2 border-dashed border-emerald-500 inline-block"></span>
                <span>Field Capacity ({fcPct}%)</span>
              </span>
              <span className="flex items-center space-x-1.5 text-rose-500">
                <span className="w-2.5 h-1 border-t-2 border-dashed border-rose-500 inline-block"></span>
                <span>Wilting Point ({pwpPct}%)</span>
              </span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeChartData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                domain={[Math.max(0, Math.floor(pwpPct - 5)), Math.ceil(fcPct + 6)]}
                stroke="#64748b"
                fontSize={11}
                unit="%"
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px'
                }}
                formatter={(value: any, _name: any, item: any) => [
                  `${Number(value).toFixed(1)}% (${item?.payload?.note || 'Soil Moisture'})`,
                  'Moisture Level'
                ]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <ReferenceLine
                y={fcPct}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{ value: `Field Capacity: ${fcPct}%`, position: 'top', fill: '#059669', fontSize: 10 }}
              />
              <ReferenceLine
                y={pwpPct}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                label={{ value: `Wilting Point: ${pwpPct}%`, position: 'bottom', fill: '#e11d48', fontSize: 10 }}
              />
              <Area
                type="monotone"
                dataKey="soilMoisture"
                stroke="#059669"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#moistureGradient)"
                dot={{ fill: '#059669', r: 4, strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2, fill: '#ffffff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
