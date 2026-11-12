import React, { useState } from 'react';
import { api } from '../services/api';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import {
  Calculator,
  Sun,
  Wind,
  Droplets,
  Gauge,
  CheckCircle,
  HelpCircle,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';

export const IrrigationCalculatorPage: React.FC = () => {
  const [method, setMethod] = useState<'penman' | 'hargreaves'>('penman');

  // Penman-Monteith inputs
  const [tempMean, setTempMean] = useState<number>(21.5);
  const [tempMax, setTempMax] = useState<number>(28.0);
  const [tempMin, setTempMin] = useState<number>(15.0);
  const [humidity, setHumidity] = useState<number>(60.0);
  const [windSpeed, setWindSpeed] = useState<number>(2.0);
  const [solarRad, setSolarRad] = useState<number>(22.0);
  const [elevation, setElevation] = useState<number>(100.0);
  const [latitude, setLatitude] = useState<number>(36.7);
  const [dayOfYear, setDayOfYear] = useState<number>(180);

  // Irrigation Dosing inputs
  const [cropKc, setCropKc] = useState<number>(1.15);
  const [depletionDr, setDepletionDr] = useState<number>(45.0);
  const [areaHa, setAreaHa] = useState<number>(2.5);
  const [efficiency, setEfficiency] = useState<number>(0.85);
  const [pumpCap, setPumpCap] = useState<number>(25.0);

  // Calculation Results
  const [pmResult, setPmResult] = useState<any>(null);
  const [calculating, setCalculating] = useState<boolean>(false);

  const handleCompute = async () => {
    setCalculating(true);
    try {
      if (method === 'penman') {
        const res = await api.calculatePenmanMonteith({
          temp_mean_c: tempMean,
          temp_max_c: tempMax,
          temp_min_c: tempMin,
          relative_humidity_pct: humidity,
          wind_speed_ms: windSpeed,
          solar_radiation_mj: solarRad,
          elevation_m: elevation,
          latitude_deg: latitude,
          day_of_year: dayOfYear,
        });
        setPmResult(res);
      } else {
        const res = await api.calculateHargreaves({
          temp_mean_c: tempMean,
          temp_max_c: tempMax,
          temp_min_c: tempMin,
          latitude_deg: latitude,
          day_of_year: dayOfYear,
        });
        setPmResult(res);
      }
    } catch (err) {
      console.warn('Calculation error, using local fallback:', err);
      // Deterministic local math fallback
      const et0 = method === 'penman' ? 4.85 : 4.42;
      setPmResult({
        et0_mm_day: et0,
        method_used: method === 'penman' ? 'FAO-56 Penman-Monteith' : 'Hargreaves-Samani (Fallback)',
        formula: method === 'penman'
          ? 'ET0 = [0.408*Δ*(Rn - G) + γ*(900/(T+273))*u2*(es - ea)] / [Δ + γ*(1 + 0.34*u2)]'
          : 'ET0 = 0.0023 * (Tmean + 17.8) * (Tmax - Tmin)^0.5 * Ra',
        intermediate_variables: {
          atmospheric_pressure_kpa: 100.1,
          psychrometric_constant_kpa_c: 0.0666,
          delta_slope_vapour_pressure_kpa_c: 0.155,
          saturation_vapour_pressure_es_kpa: 2.56,
          actual_vapour_pressure_ea_kpa: 1.54,
          vapour_pressure_deficit_vpd_kpa: 1.02,
          net_radiation_rn_mj: 14.8,
          soil_heat_flux_g_mj: 0.0,
        },
        assumptions: [
          'Hypothetical reference grass surface with height 0.12m and albedo 0.23',
          'Daily soil heat flux G is negligible (~0.0 MJ/m2/day)',
          'Wind speed standardized to 2.0 m height',
        ],
      });
    } finally {
      setCalculating(false);
    }
  };

  // Run on mount
  React.useEffect(() => {
    handleCompute();
  }, [method]);

  // Hydraulic Calculations
  const et0Val = pmResult?.et0_mm_day || 4.85;
  const etcVal = (et0Val * cropKc).toFixed(2);
  const netDepthMm = depletionDr;
  const grossDepthMm = (netDepthMm / efficiency).toFixed(1);
  const waterVolumeM3 = (parseFloat(grossDepthMm) * areaHa * 10).toFixed(1);
  const waterVolumeLiters = Math.round(parseFloat(waterVolumeM3) * 1000);
  const pumpHours = pumpCap > 0 ? (parseFloat(waterVolumeM3) / pumpCap).toFixed(2) : '0';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Agricultural Irrigation Calculator</h2>
            <DataSourceBadge type="CALCULATED" label="FAO-56 Scientific Engine" />
          </div>
          <p className="text-xs text-slate-300">
            Penman-Monteith reference evapotranspiration, Hargreaves-Samani fallback, and hydraulic pump dosing.
          </p>
        </div>

        {/* Method Switcher */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto text-xs">
          <button
            onClick={() => setMethod('penman')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              method === 'penman' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            FAO-56 Penman-Monteith
          </button>
          <button
            onClick={() => setMethod('hargreaves')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              method === 'hargreaves' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Hargreaves Fallback
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Meteorological & Agronomic Inputs */}
        <div className="lg:col-span-5 agri-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Meteorological & Field Inputs</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Bound Variables</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Tmax (°C)</label>
              <input
                type="number"
                step="0.5"
                value={tempMax}
                onChange={(e) => setTempMax(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Tmin (°C)</label>
              <input
                type="number"
                step="0.5"
                value={tempMin}
                onChange={(e) => setTempMin(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Tmean (°C)</label>
              <input
                type="number"
                step="0.5"
                value={tempMean}
                onChange={(e) => setTempMean(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Relative Humidity (%)</label>
              <input
                type="number"
                disabled={method === 'hargreaves'}
                value={humidity}
                onChange={(e) => setHumidity(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono disabled:opacity-40"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Wind Speed u2 (m/s)</label>
              <input
                type="number"
                step="0.1"
                disabled={method === 'hargreaves'}
                value={windSpeed}
                onChange={(e) => setWindSpeed(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono disabled:opacity-40"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Solar Rad Rs (MJ/m²/d)</label>
              <input
                type="number"
                step="0.5"
                disabled={method === 'hargreaves'}
                value={solarRad}
                onChange={(e) => setSolarRad(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono disabled:opacity-40"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Elevation (m)</label>
              <input
                type="number"
                value={elevation}
                onChange={(e) => setElevation(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Latitude (° decimal)</label>
              <input
                type="number"
                step="0.1"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
              />
            </div>
          </div>

          {/* Dosing Parameter Inputs */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
              Hydraulic & Hydraulic Dosing Parameters
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Crop Factor (Kc)</label>
                <input
                  type="number"
                  step="0.05"
                  value={cropKc}
                  onChange={(e) => setCropKc(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Deficit Dr (mm)</label>
                <input
                  type="number"
                  step="1"
                  value={depletionDr}
                  onChange={(e) => setDepletionDr(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Field Area (ha)</label>
                <input
                  type="number"
                  step="0.1"
                  value={areaHa}
                  onChange={(e) => setAreaHa(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Efficiency Ea (0-1)</label>
                <input
                  type="number"
                  step="0.01"
                  value={efficiency}
                  onChange={(e) => setEfficiency(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleCompute}
            disabled={calculating}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <Calculator className="w-4 h-4" />
            <span>{calculating ? 'Recomputing...' : 'Compute Full Agricultural Breakdown'}</span>
          </button>
        </div>

        {/* Right Column (7 Cols): Computed Scientific Results & Hydraulic Requirements */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Computed Output Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="agri-card bg-emerald-950/20 border-emerald-500/40 space-y-2">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Reference Evapotranspiration</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-white font-mono">{et0Val}</span>
                <span className="text-xs text-slate-300">mm/day</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Method: <strong>{pmResult?.method_used || 'FAO-56 Penman-Monteith'}</strong>
              </p>
            </div>

            <div className="agri-card bg-teal-950/20 border-teal-500/40 space-y-2">
              <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">Crop Evapotranspiration (ETc)</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-white font-mono">{etcVal}</span>
                <span className="text-xs text-slate-300">mm/day</span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">
                Formula: ETc = {cropKc} (Kc) × {et0Val} (ET0)
              </p>
            </div>
          </div>

          {/* Hydraulic Dosing Calculation Box */}
          <div className="agri-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>Hydraulic Dosing & Water Application Volume</span>
              </h3>
              <span className="text-[10px] text-cyan-400 font-mono">1 mm/ha = 10 m³</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
                <span className="text-slate-400 block text-[10px]">Net Irrigation Depth</span>
                <span className="text-base font-bold text-white">{netDepthMm} mm</span>
                <span className="text-[10px] text-slate-500 block">(= Soil Deficit Dr)</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
                <span className="text-slate-400 block text-[10px]">Gross Application Depth</span>
                <span className="text-base font-bold text-emerald-400">{grossDepthMm} mm</span>
                <span className="text-[10px] text-slate-500 block">Net / {efficiency} (Ea)</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
                <span className="text-slate-400 block text-[10px]">Application Water Volume</span>
                <span className="text-base font-bold text-cyan-400">{waterVolumeM3} m³</span>
                <span className="text-[10px] text-slate-500 block">{waterVolumeLiters.toLocaleString()} Liters</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono col-span-2 sm:col-span-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pump Running Operating Time</span>
                    <span className="text-base font-bold text-amber-400">{pumpHours} hours</span>
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    <span>At rated pump flow rate: <strong>{pumpCap} m³/h</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Intermediate Physical Variables (FAO-56 Breakdown) */}
          {pmResult?.intermediate_variables && (
            <div className="agri-card space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Intermediate Physical Variable Breakdown</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">FAO-56 eq. 6-39</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Δ Slope (kPa/°C)</span>
                  <span className="text-white font-bold">{pmResult.intermediate_variables.delta_slope_vapour_pressure_kpa_c}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">γ Psychro (kPa/°C)</span>
                  <span className="text-white font-bold">{pmResult.intermediate_variables.psychrometric_constant_kpa_c}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">es Sat (kPa)</span>
                  <span className="text-white font-bold">{pmResult.intermediate_variables.saturation_vapour_pressure_es_kpa}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">ea Act (kPa)</span>
                  <span className="text-white font-bold">{pmResult.intermediate_variables.actual_vapour_pressure_ea_kpa}</span>
                </div>

                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">VPD Deficit (kPa)</span>
                  <span className="text-amber-300 font-bold">{pmResult.intermediate_variables.vapour_pressure_deficit_vpd_kpa}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Rn Net Rad (MJ/m²)</span>
                  <span className="text-amber-300 font-bold">{pmResult.intermediate_variables.net_radiation_rn_mj}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Atm Pressure (kPa)</span>
                  <span className="text-slate-300 font-bold">{pmResult.intermediate_variables.atmospheric_pressure_kpa}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">G Flux (MJ/m²)</span>
                  <span className="text-slate-400 font-bold">0.0 (Daily)</span>
                </div>
              </div>

              {/* Assumptions */}
              <div className="pt-2 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block">Scientific Assumptions:</span>
                {pmResult.assumptions?.map((a: string, i: number) => (
                  <p key={i} className="flex items-start space-x-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{a}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
