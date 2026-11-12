import React, { useState, useEffect } from 'react';
import { api, FieldDto, CropProfileDto, SoilProfileDto } from '../services/api';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Droplet,
  Compass,
  Gauge,
  Calculator,
  ArrowRightLeft,
  Info
} from 'lucide-react';

export const FieldManagementPage: React.FC = () => {
  const [fields, setFields] = useState<FieldDto[]>([]);
  const [crops, setCrops] = useState<CropProfileDto[]>([]);
  const [soils, setSoils] = useState<SoilProfileDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingField, setEditingField] = useState<Partial<FieldDto> | null>(null);

  // Unit Converter State
  const [convertHa, setConvertHa] = useState<number>(2.5);
  const [convertDepthMm, setConvertDepthMm] = useState<number>(30);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fList, cList, sList] = await Promise.all([
        api.getFields(),
        api.getCropProfiles(),
        api.getSoilProfiles(),
      ]);
      setFields(fList);
      setCrops(cList);
      setSoils(sList);
    } catch (err) {
      console.warn('Failed to load fields from API, using fallback data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingField({
      name: '',
      area_ha: 2.5,
      crop_type: 'Maize',
      growth_stage: 'Mid-season',
      soil_type: 'Loamy',
      root_depth_m: 0.8,
      volumetric_moisture: 24.0,
      field_capacity: 31.0,
      wilting_point: 14.0,
      allowable_depletion_fraction: 0.55,
      application_efficiency: 0.85,
      pump_capacity_m3h: 25.0,
      current_depletion_mm: 35.0,
      location_name: 'Central Valley, CA',
      latitude: 36.7783,
      longitude: -119.4179,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (field: FieldDto) => {
    setEditingField({ ...field });
    setShowModal(true);
  };

  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingField || !editingField.name) return;

    try {
      if (editingField.id) {
        await api.updateField(editingField.id, editingField);
      } else {
        await api.createField(editingField);
      }
      setShowModal(false);
      setEditingField(null);
      loadData();
    } catch (err) {
      alert(`Error saving field: ${err}`);
    }
  };

  const handleDeleteField = async (id: string) => {
    if (confirm('Are you sure you want to delete this field sector?')) {
      try {
        await api.deleteField(id);
        loadData();
      } catch (err) {
        alert(`Error deleting field: ${err}`);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Field Sector Management</h2>
            <DataSourceBadge type="USER_ENTERED" />
          </div>
          <p className="text-xs text-slate-300">
            Register and manage agricultural field parcels with precise agronomic, soil, and hydraulic parameters.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Field</span>
        </button>
      </div>

      {/* Field Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {fields.map((field) => (
          <div key={field.id} className="agri-card space-y-4 relative group">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">{field.id}</span>
                <h3 className="text-sm font-bold text-white leading-tight">{field.name}</h3>
                <p className="text-xs text-slate-400">{field.location_name}</p>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleOpenEdit(field)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                  title="Edit Field"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteField(field.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Delete Field"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">Crop / Stage</span>
                <span className="text-white font-semibold">{field.crop_type} ({field.growth_stage})</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">Area</span>
                <span className="text-white font-semibold">{field.area_ha} ha ({(field.area_ha * 2.471).toFixed(1)} ac)</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">Soil / Root Depth</span>
                <span className="text-white font-semibold">{field.soil_type} / {field.root_depth_m}m</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">FC / Wilting Point</span>
                <span className="text-white font-semibold">{field.field_capacity}% / {field.wilting_point}%</span>
              </div>
            </div>

            {/* Moisture Meter */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Current Volumetric Moisture:</span>
                <span className="text-emerald-400 font-bold">{field.volumetric_moisture}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  style={{ width: `${Math.min(100, (field.volumetric_moisture / field.field_capacity) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>WP: {field.wilting_point}%</span>
                <span>Depletion Dr: {field.current_depletion_mm} mm</span>
                <span>FC: {field.field_capacity}%</span>
              </div>
            </div>

            {/* Footer Dosing Specs */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Pump: <strong className="text-white">{field.pump_capacity_m3h} m³/h</strong></span>
              <span>Efficiency Ea: <strong className="text-emerald-400">{field.application_efficiency * 100}%</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Editable Crop & Soil Profiles Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop Profiles Table */}
        <div className="agri-card space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Standard Crop Parameter Profiles</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">FAO-56 Annex</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2 font-semibold">Crop</th>
                  <th className="pb-2 font-semibold">Kc (Init/Mid/End)</th>
                  <th className="pb-2 font-semibold">Max Root (m)</th>
                  <th className="pb-2 font-semibold">Depletion p</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {crops.map((c) => (
                  <tr key={c.id} className="text-slate-300">
                    <td className="py-2 font-sans font-semibold text-white">{c.crop_name}</td>
                    <td className="py-2 text-emerald-400">{c.initial_kc} / {c.mid_kc} / {c.end_kc}</td>
                    <td className="py-2">{c.max_root_depth_m} m</td>
                    <td className="py-2 text-amber-300">{c.default_p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Soil Profiles Table */}
        <div className="agri-card space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Droplet className="w-4 h-4 text-sky-400" />
              <span>Soil Moisture Characteristics</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Volumetric %</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2 font-semibold">Soil Texture</th>
                  <th className="pb-2 font-semibold">Field Capacity</th>
                  <th className="pb-2 font-semibold">Wilting Point</th>
                  <th className="pb-2 font-semibold">Infiltration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {soils.map((s) => (
                  <tr key={s.id} className="text-slate-300">
                    <td className="py-2 font-sans font-semibold text-white">{s.soil_name}</td>
                    <td className="py-2 text-emerald-400">{s.field_capacity_pct}%</td>
                    <td className="py-2 text-rose-400">{s.wilting_point_pct}%</td>
                    <td className="py-2 text-sky-300">{s.infiltration_rate_mmh} mm/h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Unit Conversion Utility Section */}
      <div className="agri-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
            <span>Agricultural Engineering Unit Conversion Utility</span>
          </h3>
          <span className="text-[10px] text-slate-400">Strictly unit-consistent conversion</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <label className="text-slate-400 block font-semibold">Area: Hectares to Acres</label>
            <input
              type="number"
              step="0.1"
              value={convertHa}
              onChange={(e) => setConvertHa(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
            />
            <p className="text-emerald-400 font-bold font-mono">
              = {(convertHa * 2.47105).toFixed(2)} Acres
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <label className="text-slate-400 block font-semibold">Volume: Depth over Area</label>
            <input
              type="number"
              value={convertDepthMm}
              onChange={(e) => setConvertDepthMm(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
            />
            <p className="text-cyan-400 font-bold font-mono">
              = {(convertDepthMm * convertHa * 10).toFixed(1)} m³ ({Math.round(convertDepthMm * convertHa * 10000).toLocaleString()} L)
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <label className="text-slate-400 block font-semibold">Pump Operating Time</label>
            <p className="text-slate-400 text-[11px]">
              At 25 m³/h pump capacity:
            </p>
            <p className="text-amber-400 font-bold font-mono">
              = {((convertDepthMm * convertHa * 10) / 25).toFixed(2)} hours
            </p>
          </div>
        </div>
      </div>

      {/* Create / Edit Field Modal */}
      {showModal && editingField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingField.id ? 'Edit Field Parameters' : 'Register New Field Sector'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveField} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-slate-400 block mb-1">Field Sector Name</label>
                  <input
                    type="text"
                    required
                    value={editingField.name || ''}
                    onChange={(e) => setEditingField({ ...editingField, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                    placeholder="e.g. West Basin Tomato Plot"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Area (Hectares)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editingField.area_ha || 2.5}
                    onChange={(e) => setEditingField({ ...editingField, area_ha: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Crop Type</label>
                  <select
                    value={editingField.crop_type || 'Maize'}
                    onChange={(e) => setEditingField({ ...editingField, crop_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    {crops.map((c) => (
                      <option key={c.id} value={c.crop_name}>{c.crop_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Growth Stage</label>
                  <select
                    value={editingField.growth_stage || 'Mid-season'}
                    onChange={(e) => setEditingField({ ...editingField, growth_stage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="Initial">Initial</option>
                    <option value="Vegetative">Vegetative</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Mid-season">Mid-season</option>
                    <option value="Late">Late / Ripening</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Soil Texture</label>
                  <select
                    value={editingField.soil_type || 'Loamy'}
                    onChange={(e) => setEditingField({ ...editingField, soil_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    {soils.map((s) => (
                      <option key={s.id} value={s.soil_name}>{s.soil_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Root Depth Zr (m)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={editingField.root_depth_m || 0.8}
                    onChange={(e) => setEditingField({ ...editingField, root_depth_m: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Current Depletion Dr (mm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingField.current_depletion_mm || 35.0}
                    onChange={(e) => setEditingField({ ...editingField, current_depletion_mm: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Application Efficiency Ea (0-1)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.4"
                    max="1.0"
                    value={editingField.application_efficiency || 0.85}
                    onChange={(e) => setEditingField({ ...editingField, application_efficiency: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Pump Capacity (m³/h)</label>
                  <input
                    type="number"
                    step="1"
                    value={editingField.pump_capacity_m3h || 25.0}
                    onChange={(e) => setEditingField({ ...editingField, pump_capacity_m3h: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30"
                >
                  Save Field Sector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
