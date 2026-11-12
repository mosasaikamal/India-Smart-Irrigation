import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { CropType, GrowthStage, IrrigationMethod, SoilType } from '../types';
import { SCENARIO_PRESETS, CROP_PROFILES, SOIL_PROFILES } from '../simulation/presets';
import {
  SlidersHorizontal,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  Sprout,
  Thermometer,
  CloudRain,
  Droplets,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';

const CROPS: CropType[] = ['Wheat', 'Rice', 'Maize', 'Tomato', 'Cotton', 'Potato'];
const SOILS: SoilType[] = ['Sandy', 'Sandy Loam', 'Loamy', 'Clay'];
const STAGES: GrowthStage[] = ['Initial', 'Vegetative', 'Flowering', 'Yield Formation', 'Ripening'];
const METHODS: IrrigationMethod[] = ['Drip', 'Sprinkler', 'Furrow', 'Subsurface'];

export const FieldSimulatorPage: React.FC = () => {
  const {
    fieldState,
    updateFieldParameters,
    updateEnvironmentalParameters,
    updateSoilParameters,
    loadScenarioPreset,
    runSimulation,
  } = useSimulation();

  const [lastRunSuccess, setLastRunSuccess] = useState<boolean>(false);

  const handleRunSimulation = () => {
    runSimulation();
    setLastRunSuccess(true);
    setTimeout(() => setLastRunSuccess(false), 3000);
  };

  const cropProfile = CROP_PROFILES[fieldState.parameters.crop];
  const soilProfile = SOIL_PROFILES[fieldState.parameters.soilType];

  return (
    <div className="space-y-6">
      {/* Header & Scenario Presets Bar */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
              <span>Interactive Agricultural Field Simulator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust field parameters, weather inputs, and soil physical properties to simulate agronomic decisions.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRunSimulation}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-1.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Run Simulation Calculation</span>
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium flex items-center space-x-1 mr-2">
            <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
            <span>Load Scenario Preset:</span>
          </span>
          {SCENARIO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => loadScenarioPreset(preset.id)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>

        {lastRunSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Simulation executed successfully! Agronomic models, rule engine, agent system, and schedules updated.</span>
          </div>
        )}
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Field & Crop Parameters */}
        <div className="agri-card space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
            <Sprout className="w-4 h-4 text-emerald-400" />
            <span>1. Field & Crop Parameters</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Field Size */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Field Area:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {fieldState.parameters.fieldSize} Acres
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={25}
                step={0.5}
                value={fieldState.parameters.fieldSize}
                onChange={(e) => updateFieldParameters({ fieldSize: Number(e.target.value) })}
                className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Crop Selector */}
            <div>
              <label className="block text-slate-300 mb-1">Crop Type:</label>
              <select
                value={fieldState.parameters.crop}
                onChange={(e) => updateFieldParameters({ crop: e.target.value as CropType })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-emerald-500 outline-none"
              >
                {CROPS.map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1 italic">
                {cropProfile.waterNeedsDescription}
              </p>
            </div>

            {/* Growth Stage */}
            <div>
              <label className="block text-slate-300 mb-1">Growth Phenology Stage:</label>
              <select
                value={fieldState.parameters.growthStage}
                onChange={(e) => updateFieldParameters({ growthStage: e.target.value as GrowthStage })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-emerald-500 outline-none"
              >
                {STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage} (Kc: {cropProfile.kcStages[stage]})
                  </option>
                ))}
              </select>
            </div>

            {/* Irrigation Method */}
            <div>
              <label className="block text-slate-300 mb-1">Irrigation Delivery Method:</label>
              <select
                value={fieldState.parameters.irrigationMethod}
                onChange={(e) => updateFieldParameters({ irrigationMethod: e.target.value as IrrigationMethod })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-emerald-500 outline-none"
              >
                {METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Column 2: Environmental & Weather Parameters */}
        <div className="agri-card space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
            <Thermometer className="w-4 h-4 text-amber-400" />
            <span>2. Environmental & Climate</span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Temperature */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Ambient Air Temperature:</span>
                <span className="font-mono font-bold text-amber-400">
                  {fieldState.environment.temperature}°C
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={48}
                value={fieldState.environment.temperature}
                onChange={(e) => updateEnvironmentalParameters({ temperature: Number(e.target.value) })}
                className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Relative Humidity */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Relative Humidity:</span>
                <span className="font-mono font-bold text-sky-400">
                  {fieldState.environment.humidity}%
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={95}
                value={fieldState.environment.humidity}
                onChange={(e) => updateEnvironmentalParameters({ humidity: Number(e.target.value) })}
                className="w-full accent-sky-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Rain Probability */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Rainfall Probability (Forecast):</span>
                <span className="font-mono font-bold text-cyan-400">
                  {fieldState.environment.rainProbability}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={fieldState.environment.rainProbability}
                onChange={(e) => updateEnvironmentalParameters({ rainProbability: Number(e.target.value) })}
                className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Expected Rainfall Amount */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Anticipated Precipitation Volume:</span>
                <span className="font-mono font-bold text-cyan-300">
                  {fieldState.environment.rainfallAmount} mm
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={60}
                value={fieldState.environment.rainfallAmount}
                onChange={(e) => updateEnvironmentalParameters({ rainfallAmount: Number(e.target.value) })}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Wind Speed */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Wind Speed:</span>
                <span className="font-mono font-bold text-slate-300">
                  {fieldState.environment.windSpeed} km/h
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={40}
                value={fieldState.environment.windSpeed}
                onChange={(e) => updateEnvironmentalParameters({ windSpeed: Number(e.target.value) })}
                className="w-full accent-slate-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Column 3: Soil Physical Properties */}
        <div className="agri-card space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
            <Layers className="w-4 h-4 text-teal-400" />
            <span>3. Soil Hydrology Parameters</span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Soil Type */}
            <div>
              <label className="block text-slate-300 mb-1">Soil Texture Class:</label>
              <select
                value={fieldState.parameters.soilType}
                onChange={(e) => updateFieldParameters({ soilType: e.target.value as SoilType })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-emerald-500 outline-none"
              >
                {SOILS.map((soil) => (
                  <option key={soil} value={soil}>
                    {soil}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                {soilProfile.description}
              </p>
            </div>

            {/* Current Soil Moisture */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Current Volumetric Moisture:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {fieldState.soil.currentMoisture}%
                </span>
              </div>
              <input
                type="range"
                min={soilProfile.wiltingPoint - 2}
                max={soilProfile.fieldCapacity + 5}
                step={0.5}
                value={fieldState.soil.currentMoisture}
                onChange={(e) => updateSoilParameters({ currentMoisture: Number(e.target.value) })}
                className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Field Capacity */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Field Capacity (FC):</span>
                <span className="font-mono font-bold text-teal-300">
                  {fieldState.soil.fieldCapacity}%
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={50}
                value={fieldState.soil.fieldCapacity}
                onChange={(e) => updateSoilParameters({ fieldCapacity: Number(e.target.value) })}
                className="w-full accent-teal-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Permanent Wilting Point */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Permanent Wilting Point (WP):</span>
                <span className="font-mono font-bold text-rose-300">
                  {fieldState.soil.wiltingPoint}%
                </span>
              </div>
              <input
                type="range"
                min={4}
                max={30}
                value={fieldState.soil.wiltingPoint}
                onChange={(e) => updateSoilParameters({ wiltingPoint: Number(e.target.value) })}
                className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Calculated Physical Hydrology Breakdown */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Calculated FAO-56 Agronomic Balance Outputs</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-sans">Ref ET (ET0)</span>
            <span className="text-base font-bold text-amber-400">{fieldState.et0} mm/day</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-sans">Crop ET (ETc)</span>
            <span className="text-base font-bold text-amber-300">{fieldState.etc} mm/day</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-sans">Total Avail Water (TAW)</span>
            <span className="text-base font-bold text-teal-300">{fieldState.taw} mm</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-sans">Readily Avail Water (RAW)</span>
            <span className="text-base font-bold text-emerald-400">{fieldState.raw} mm</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-sans">Soil Moisture Deficit</span>
            <span className="text-base font-bold text-rose-400">{fieldState.smd} mm</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-sans">Crop Stress State</span>
            <span className={`text-base font-bold ${
              fieldState.stressLevel === 'Severe'
                ? 'text-rose-400'
                : fieldState.stressLevel === 'Moderate'
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}>
              {fieldState.stressLevel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
