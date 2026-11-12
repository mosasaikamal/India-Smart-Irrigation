import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { AgriculturalRule, RuleCategory } from '../types';
import { InferenceChainViewer } from '../components/knowledge/InferenceChainViewer';
import {
  BookOpen,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react';

export const KnowledgeBasePage: React.FC = () => {
  const {
    rules,
    inferenceChain,
    addRule,
    toggleRule,
    deleteRule,
    restoreDefaultRules,
  } = useSimulation();

  const [isAddingRule, setIsAddingRule] = useState<boolean>(false);
  const [newCode, setNewCode] = useState<string>('R-CUSTOM');
  const [newName, setNewName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<RuleCategory>('Moisture');
  const [newField, setNewField] = useState<string>('soilMoisture');
  const [newOp, setNewOp] = useState<'<' | '<=' | '>' | '>=' | '==' | '!='>('<');
  const [newVal, setNewVal] = useState<string>('25');
  const [newConclusion, setNewConclusion] = useState<string>('');
  const [newPriority, setNewPriority] = useState<number>(7);
  const [newExplanation, setNewExplanation] = useState<string>('');

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newConclusion) return;

    addRule({
      code: newCode,
      name: newName,
      category: newCategory,
      conditions: [{ field: newField, operator: newOp, value: isNaN(Number(newVal)) ? newVal : Number(newVal) }],
      conclusion: newConclusion,
      action: 'IRRIGATE',
      priority: newPriority,
      explanation: newExplanation || 'User custom production rule.',
      active: true,
      isCustom: true,
    });

    setIsAddingRule(false);
    setNewName('');
    setNewConclusion('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span>Knowledge Representation & Forward-Chaining Reasoning Engine</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Production IF-THEN rules governing precision irrigation scheduling, crop phenology limits, and drought resilience.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={restoreDefaultRules}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Defaults</span>
            </button>

            <button
              onClick={() => setIsAddingRule(!isAddingRule)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Rule</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Inference Chain Viewer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Active Inference Chain (Facts → Matching Rules → Synthesized Conclusion)</span>
          </h3>
        </div>

        <InferenceChainViewer inference={inferenceChain} />
      </div>

      {/* Custom Rule Creation Modal/Panel */}
      {isAddingRule && (
        <form
          onSubmit={handleCreateRule}
          className="bg-slate-900 rounded-2xl border border-emerald-500/50 p-5 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Create Custom Agricultural Rule
            </h4>
            <span className="text-[11px] text-emerald-400 font-mono">Expert System Builder</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Rule Code:</label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                placeholder="R-CUSTOM"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Rule Name:</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                placeholder="e.g. Drought Warning Threshold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Category:</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as RuleCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
              >
                <option value="Moisture">Moisture</option>
                <option value="Weather">Weather</option>
                <option value="Crop">Crop</option>
                <option value="Temperature">Temperature</option>
                <option value="Conservation">Conservation</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Priority (1-10):</label>
              <input
                type="number"
                min={1}
                max={10}
                value={newPriority}
                onChange={(e) => setNewPriority(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
              />
            </div>
          </div>

          {/* Condition Builder */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <span className="font-semibold text-slate-300 block">Condition Clause (IF):</span>
            <div className="grid grid-cols-3 gap-3">
              <select
                value={newField}
                onChange={(e) => setNewField(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
              >
                <option value="soilMoisture">soilMoisture (%)</option>
                <option value="rainProbability">rainProbability (%)</option>
                <option value="temperature">temperature (°C)</option>
                <option value="humidity">humidity (%)</option>
                <option value="windSpeed">windSpeed (km/h)</option>
              </select>

              <select
                value={newOp}
                onChange={(e) => setNewOp(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
              >
                <option value="<">&lt; Less than</option>
                <option value="<=">&le; Less or equal</option>
                <option value=">">&gt; Greater than</option>
                <option value=">=">&ge; Greater or equal</option>
                <option value="==">== Equal to</option>
              </select>

              <input
                type="text"
                value={newVal}
                onChange={(e) => setNewVal(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                placeholder="Value"
              />
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <label className="block text-slate-400">Conclusion (THEN):</label>
            <input
              type="text"
              value={newConclusion}
              onChange={(e) => setNewConclusion(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
              placeholder="e.g. Immediately dispatch 30 min irrigation cycle."
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingRule(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
            >
              Save & Activate Rule
            </button>
          </div>
        </form>
      )}

      {/* Rules Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Agricultural Rule Repository ({rules.length} Total Rules)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {rules.filter((r) => r.active).length} Active Rules
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="p-3">Status</th>
                <th className="p-3">Code</th>
                <th className="p-3">Rule Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Condition (IF)</th>
                <th className="p-3">Conclusion (THEN)</th>
                <th className="p-3 text-center">Priority</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rules.map((rule) => (
                <tr
                  key={rule.id}
                  className={`hover:bg-slate-800/30 transition-colors ${
                    !rule.active ? 'opacity-40' : ''
                  }`}
                >
                  <td className="p-3">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className="text-slate-400 hover:text-white"
                      title={rule.active ? 'Deactivate Rule' : 'Activate Rule'}
                    >
                      {rule.active ? (
                        <ToggleRight className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-slate-600" />
                      )}
                    </button>
                  </td>

                  <td className="p-3 font-mono font-bold text-emerald-400">
                    {rule.code}
                  </td>

                  <td className="p-3 font-medium text-white">
                    {rule.name}
                    {rule.isCustom && (
                      <span className="ml-1.5 px-1 py-0.2 rounded text-[9px] bg-teal-500/20 text-teal-300">
                        Custom
                      </span>
                    )}
                  </td>

                  <td className="p-3 font-mono text-slate-400">
                    {rule.category}
                  </td>

                  <td className="p-3 font-mono text-slate-300">
                    {rule.conditions.map((c, idx) => (
                      <span key={idx} className="block">
                        {c.field} {c.operator} {String(c.value)}
                      </span>
                    ))}
                  </td>

                  <td className="p-3 text-slate-200 max-w-xs truncate" title={rule.conclusion}>
                    {rule.conclusion}
                  </td>

                  <td className="p-3 text-center font-mono font-bold text-amber-400">
                    {rule.priority}
                  </td>

                  <td className="p-3 text-right">
                    {rule.isCustom ? (
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="p-1 rounded text-rose-400 hover:bg-rose-500/20"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-slate-600 text-[10px]">Built-in</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
