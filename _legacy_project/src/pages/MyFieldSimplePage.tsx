import React, { useState, useEffect } from 'react';
import { api, FieldDto } from '../services/api';
import {
  Layers,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Info,
  Droplet,
  Sparkles
} from 'lucide-react';

export const MyFieldSimplePage: React.FC = () => {
  const [fields, setFields] = useState<FieldDto[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('field-01');
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const defaultEmptyForm = {
    name: 'New Custom Plot',
    crop_type: 'Wheat',
    growth_stage: 'Mid-season',
    area_ha: 1.5,
    soil_type: 'Loamy',
    volumetric_moisture: 22.0,
    field_capacity: 32.0,
    wilting_point: 14.0,
    root_depth_m: 0.8,
    rainfall_mm: 0.0,
    temperature_c: 26.0,
    relative_humidity: 48.0,
    wind_speed_ms: 2.0,
    // Advanced
    crop_kc: 1.15,
    allowable_depletion: 0.55,
    efficiency: 0.85,
    pump_capacity_m3h: 25.0,
  };

  const [form, setForm] = useState(defaultEmptyForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const fList = await api.getFields();
      setFields(fList);
      if (fList.length > 0 && !isCreatingNew) {
        const f = fList.find((item) => item.id === selectedFieldId) || fList[0];
        setSelectedFieldId(f.id);
        populateFormFromField(f);
      }
    } catch (err) {
      console.warn('Field load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const populateFormFromField = (f: FieldDto) => {
    setForm({
      name: f.name,
      crop_type: f.crop_type,
      growth_stage: f.growth_stage,
      area_ha: f.area_ha,
      soil_type: f.soil_type,
      volumetric_moisture: f.volumetric_moisture,
      field_capacity: f.field_capacity,
      wilting_point: f.wilting_point,
      root_depth_m: f.root_depth_m,
      rainfall_mm: f.rainfall_mm,
      temperature_c: f.temperature_c,
      relative_humidity: f.relative_humidity,
      wind_speed_ms: f.wind_speed_ms,
      crop_kc: 1.15,
      allowable_depletion: f.allowable_depletion_fraction,
      efficiency: f.application_efficiency,
      pump_capacity_m3h: f.pump_capacity_m3h,
    });
  };

  const handleSelectField = (fid: string) => {
    setIsCreatingNew(false);
    setSelectedFieldId(fid);
    const f = fields.find((item) => item.id === fid);
    if (f) {
      populateFormFromField(f);
      setMessage(null);
    }
  };

  const handleStartCreateNew = () => {
    setIsCreatingNew(true);
    setForm({
      ...defaultEmptyForm,
      name: `Custom Field ${fields.length + 1}`,
    });
    setMessage({
      type: 'success',
      text: 'Enter your field details below and click "Save New Field".'
    });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCancelCreate = () => {
    setIsCreatingNew(false);
    if (fields.length > 0) {
      handleSelectField(fields[0].id);
    }
  };

  const handleReset = () => {
    if (isCreatingNew) {
      setForm(defaultEmptyForm);
    } else {
      handleSelectField(selectedFieldId);
    }
    setMessage({ type: 'success', text: 'Form reset to original values.' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(form.field_capacity) <= Number(form.wilting_point)) {
      setMessage({ type: 'error', text: 'Validation Error: Field Capacity (%) must be greater than Wilting Point (%).' });
      return;
    }
    if (Number(form.area_ha) <= 0) {
      setMessage({ type: 'error', text: 'Validation Error: Field Area must be greater than 0 hectares.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      if (isCreatingNew) {
        // Create brand new field
        const newId = `field-${Date.now().toString().slice(-4)}`;
        await api.createField({
          id: newId,
          name: form.name,
          crop_type: form.crop_type,
          growth_stage: form.growth_stage,
          area_ha: Number(form.area_ha),
          soil_type: form.soil_type,
          volumetric_moisture: Number(form.volumetric_moisture),
          field_capacity: Number(form.field_capacity),
          wilting_point: Number(form.wilting_point),
          root_depth_m: Number(form.root_depth_m),
          rainfall_mm: Number(form.rainfall_mm),
          temperature_c: Number(form.temperature_c),
          relative_humidity: Number(form.relative_humidity),
          wind_speed_ms: Number(form.wind_speed_ms),
          allowable_depletion_fraction: Number(form.allowable_depletion),
          application_efficiency: Number(form.efficiency),
          pump_capacity_m3h: Number(form.pump_capacity_m3h),
          latitude: 18.5204,
          longitude: 73.8567,
          location_name: form.name,
          weather_source: 'LIVE_API'
        });

        setMessage({ type: 'success', text: `Field "${form.name}" registered successfully!` });
        const updatedList = await api.getFields();
        setFields(updatedList);
        setSelectedFieldId(newId);
        setIsCreatingNew(false);
      } else {
        // Update existing field
        await api.updateField(selectedFieldId, {
          name: form.name,
          crop_type: form.crop_type,
          growth_stage: form.growth_stage,
          area_ha: Number(form.area_ha),
          soil_type: form.soil_type,
          volumetric_moisture: Number(form.volumetric_moisture),
          field_capacity: Number(form.field_capacity),
          wilting_point: Number(form.wilting_point),
          root_depth_m: Number(form.root_depth_m),
          rainfall_mm: Number(form.rainfall_mm),
          temperature_c: Number(form.temperature_c),
          relative_humidity: Number(form.relative_humidity),
          wind_speed_ms: Number(form.wind_speed_ms),
          allowable_depletion_fraction: Number(form.allowable_depletion),
          application_efficiency: Number(form.efficiency),
          pump_capacity_m3h: Number(form.pump_capacity_m3h),
        });

        setMessage({ type: 'success', text: `Field "${form.name}" updated successfully!` });
        const updatedList = await api.getFields();
        setFields(updatedList);
      }
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: `Error saving field: ${err}` });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (fields.length <= 1) {
      setMessage({ type: 'error', text: 'You must have at least one field registered.' });
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${form.name}"?`)) return;

    setSaving(true);
    try {
      await api.deleteField(selectedFieldId);
      const updatedList = await api.getFields();
      setFields(updatedList);
      if (updatedList.length > 0) {
        setSelectedFieldId(updatedList[0].id);
        populateFormFromField(updatedList[0]);
      }
      setMessage({ type: 'success', text: 'Field removed successfully.' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: `Failed to delete field: ${err}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200 pb-12">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">My Field Configuration</h1>
            {isCreatingNew && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                New Field Mode
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isCreatingNew
              ? 'Input your custom field measurements, crop type, and soil properties below.'
              : 'View or modify your current field measurements, or add a brand new field.'}
          </p>
        </div>

        {/* Action Controls: Switch Field or Add New Field */}
        <div className="flex items-center flex-wrap gap-2.5">
          {!isCreatingNew ? (
            <>
              {/* Field Switcher */}
              <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
                <Layers className="w-4 h-4 text-emerald-700 shrink-0" />
                <select
                  value={selectedFieldId}
                  onChange={(e) => handleSelectField(e.target.value)}
                  className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.crop_type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Add New Field Button */}
              <button
                type="button"
                onClick={handleStartCreateNew}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Field</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleCancelCreate}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              Cancel & Select Existing
            </button>
          )}
        </div>
      </div>

      {/* Main Field Input Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {isCreatingNew ? '1. Enter New Field Parameters' : '1. Primary Field Information'}
            </h2>
            <p className="text-xs text-slate-500">Core parameters used by the FAO-56 soil water balance and irrigation planner</p>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
            Customizable Input
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Field Name */}
          <div className="col-span-1 sm:col-span-2">
            <label className="text-slate-700 font-semibold block mb-1.5">Field Name / Label</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Plot 3 - Riverside Orchard"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
              required
            />
          </div>

          {/* Crop Type */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1.5">Crop Type</label>
            <select
              value={form.crop_type}
              onChange={(e) => setForm({ ...form, crop_type: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
            >
              <option value="Wheat">Wheat</option>
              <option value="Maize">Maize (Corn)</option>
              <option value="Tomato">Tomato</option>
              <option value="Soybean">Soybean</option>
              <option value="Cotton">Cotton</option>
              <option value="Potato">Potato</option>
              <option value="Citrus">Citrus Orchard</option>
              <option value="Sugarcane">Sugarcane</option>
            </select>
          </div>

          {/* Field Area */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1.5">Field Area (Hectares)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={form.area_ha}
              onChange={(e) => setForm({ ...form, area_ha: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
              required
            />
          </div>

          {/* Soil Type */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1.5">Soil Type</label>
            <select
              value={form.soil_type}
              onChange={(e) => setForm({ ...form, soil_type: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
            >
              <option value="Loamy">Loam (Balanced)</option>
              <option value="Sandy Loam">Sandy Loam</option>
              <option value="Clay Loam">Clay Loam</option>
              <option value="Silt Loam">Silt Loam</option>
              <option value="Clay">Heavy Clay</option>
              <option value="Sand">Coarse Sand</option>
            </select>
          </div>

          {/* Current Soil Moisture */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1.5">Current Soil Moisture (%)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="100"
              value={form.volumetric_moisture}
              onChange={(e) => setForm({ ...form, volumetric_moisture: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 font-mono font-bold text-emerald-800"
              required
            />
          </div>

          {/* Field Capacity */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1.5">Field Capacity (%)</label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="100"
              value={form.field_capacity}
              onChange={(e) => setForm({ ...form, field_capacity: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
              required
            />
          </div>

          {/* Permanent Wilting Point */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1.5">Wilting Point (%)</label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="100"
              value={form.wilting_point}
              onChange={(e) => setForm({ ...form, wilting_point: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
              required
            />
          </div>

          {/* Root Depth */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1.5">Root Depth (meters)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="3.0"
              value={form.root_depth_m}
              onChange={(e) => setForm({ ...form, root_depth_m: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
              required
            />
          </div>

          {/* Recent Rainfall */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1.5">Recent Rainfall (mm)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={form.rainfall_mm}
              onChange={(e) => setForm({ ...form, rainfall_mm: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Temperature */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1.5">Air Temperature (°C)</label>
            <input
              type="number"
              step="0.5"
              value={form.temperature_c}
              onChange={(e) => setForm({ ...form, temperature_c: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Relative Humidity */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1.5">Relative Humidity (%)</label>
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              value={form.relative_humidity}
              onChange={(e) => setForm({ ...form, relative_humidity: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Wind Speed */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1.5">Wind Speed (m/s)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={form.wind_speed_ms}
              onChange={(e) => setForm({ ...form, wind_speed_ms: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* COLLAPSIBLE ADVANCED SETTINGS */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <span className="flex items-center space-x-2">
              <span>Advanced Field Settings</span>
              <span className="text-[10px] text-slate-400 font-normal">(Crop coefficient, efficiency, pump limits)</span>
            </span>
            {showAdvanced ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
          </button>

          {showAdvanced && (
            <div className="p-4 pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs bg-white">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Crop Coefficient (Kc)</label>
                <input
                  type="number"
                  step="0.05"
                  value={form.crop_kc}
                  onChange={(e) => setForm({ ...form, crop_kc: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
                <span className="text-[10px] text-slate-400">FAO-56 mid-season stage</span>
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Allowable Depletion (p)</label>
                <input
                  type="number"
                  step="0.05"
                  value={form.allowable_depletion}
                  onChange={(e) => setForm({ ...form, allowable_depletion: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
                <span className="text-[10px] text-slate-400">Fraction of TAW before stress</span>
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Irrigation Efficiency (Ea)</label>
                <input
                  type="number"
                  step="0.05"
                  max="1.0"
                  value={form.efficiency}
                  onChange={(e) => setForm({ ...form, efficiency: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
                <span className="text-[10px] text-slate-400">0.85 = 85% drip efficiency</span>
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Pump Capacity (m³/h)</label>
                <input
                  type="number"
                  step="5"
                  value={form.pump_capacity_m3h}
                  onChange={(e) => setForm({ ...form, pump_capacity_m3h: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
                <span className="text-[10px] text-slate-400">Pump discharge rate</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {!isCreatingNew && fields.length > 1 && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="px-3.5 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                title="Delete this field"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 flex items-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>
                {saving
                  ? 'Saving...'
                  : isCreatingNew
                  ? 'Save New Field'
                  : 'Save Field Changes'}
              </span>
            </button>
          </div>
        </div>

        {/* Status / Success Message */}
        {message && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2 animate-in fade-in ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                : 'bg-rose-50 border-rose-200 text-rose-800 font-medium'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}
      </form>
    </div>
  );
};
