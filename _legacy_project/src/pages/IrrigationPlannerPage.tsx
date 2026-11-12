import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { IrrigationSchedule } from '../types';
import {
  CalendarClock,
  Sparkles,
  Droplets,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  TrendingDown,
  Info,
} from 'lucide-react';

export const IrrigationPlannerPage: React.FC = () => {
  const { schedules, fieldState } = useSimulation();
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(
    schedules.find((s) => s.recommended)?.id || schedules[0]?.id || 'sched-1'
  );

  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId) || schedules[0];

  const getTagBadge = (tag: IrrigationSchedule['tag']) => {
    switch (tag) {
      case 'Recommended':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Recommended</span>
          </span>
        );
      case 'Best Conservation':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center space-x-1">
            <TrendingDown className="w-3.5 h-3.5 text-teal-400" />
            <span>Best Conservation</span>
          </span>
        );
      case 'Off-Peak':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Off-Peak Evening</span>
          </span>
        );
      case 'Rain Delay':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
            Weather Delay
          </span>
        );
      case 'High Risk':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            High Risk
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <CalendarClock className="w-5 h-5 text-emerald-400" />
              <span>Multi-Schedule Irrigation Planner</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative multi-objective optimization evaluating water conservation, crop moisture stress, and forecasted weather risk.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Target Safe Moisture Band:</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 font-mono text-emerald-400 font-semibold border border-slate-800">
              {fieldState.soil.wiltingPoint + 4}% – {fieldState.soil.fieldCapacity}%
            </span>
          </div>
        </div>
      </div>

      {/* Candidate Schedules Comparison Table / Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Generated Candidate Schedules (Ranked by Multi-Objective Score)
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {schedules.map((schedule, rank) => {
            const isSelected = schedule.id === selectedScheduleId;

            return (
              <div
                key={schedule.id}
                onClick={() => setSelectedScheduleId(schedule.id)}
                className={`agri-card cursor-pointer transition-all duration-200 relative ${
                  schedule.recommended
                    ? 'border-emerald-500/60 bg-emerald-950/15 hover:border-emerald-400'
                    : isSelected
                    ? 'border-cyan-500/60 bg-cyan-950/15'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs font-bold flex items-center justify-center">
                        #{rank + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white">{schedule.name}</h4>
                      {getTagBadge(schedule.tag)}
                    </div>
                    <p className="text-xs text-slate-400">{schedule.description}</p>
                  </div>

                  {/* Overall Score Badge */}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase block">Score</span>
                    <span className={`text-xl font-bold font-mono ${
                      schedule.overallScore >= 80
                        ? 'text-emerald-400'
                        : schedule.overallScore >= 60
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}>
                      {schedule.overallScore} / 100
                    </span>
                  </div>
                </div>

                {/* Key Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Water Volume</span>
                    <span className="font-mono font-bold text-white">
                      {schedule.waterVolumeLiters.toLocaleString()} L
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1 font-mono">
                      ({schedule.waterDepthMm} mm)
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Duration</span>
                    <span className="font-mono font-bold text-slate-200">
                      {schedule.durationMinutes} Minutes
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Start Timing</span>
                    <span className="font-semibold text-emerald-400">
                      {schedule.timingLabel}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Expected Post Moisture</span>
                    <span className="font-mono font-bold text-cyan-300">
                      {schedule.expectedPostMoisture.toFixed(1)}%
                    </span>
                  </div>

                  <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
                    <span className="text-xs text-slate-400 italic">
                      Click to inspect details →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Schedule Detail Inspector */}
      {selectedSchedule && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Info className="w-4 h-4" />
            <span>In-Depth Evaluation Rationale: [{selectedSchedule.name}]</span>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-medium bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            {selectedSchedule.rationale}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Efficiency Score Progress */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Water Conservation Score:</span>
                <span className="font-mono font-bold text-emerald-400">{selectedSchedule.waterEfficiencyScore}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${selectedSchedule.waterEfficiencyScore}%` }} />
              </div>
            </div>

            {/* Stress Score Progress */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Crop Stress Mitigation:</span>
                <span className="font-mono font-bold text-cyan-400">{selectedSchedule.stressMitigationScore}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-cyan-500 h-full" style={{ width: `${selectedSchedule.stressMitigationScore}%` }} />
              </div>
            </div>

            {/* Weather Risk Score Progress */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Rain & Thermal Safety:</span>
                <span className="font-mono font-bold text-amber-400">{selectedSchedule.rainSafetyScore}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: `${selectedSchedule.rainSafetyScore}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
