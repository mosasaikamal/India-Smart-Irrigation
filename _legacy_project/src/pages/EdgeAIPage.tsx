import React from 'react';
import { EdgePipelineDiagram } from '../components/edge/EdgePipelineDiagram';
import { Cpu, Zap, Shield, Wifi, Database } from 'lucide-react';

export const EdgeAIPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Edge AI Pipeline Visualizer & Comparison */}
      <EdgePipelineDiagram />

      {/* Academic Background Card */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>Academic & Industry Context: Why Edge AI in Smart Agriculture?</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-emerald-400">1. Remote Field Connectivity Gaps</h4>
            <p>
              Farmland frequently suffers from intermittent cellular coverage or zero internet. Relying on remote cloud servers can cause solenoid valve delays or dangerous pump failures during sudden torrential downpours.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-cyan-400">2. Millisecond Actuation Latency</h4>
            <p>
              Quantized Int8 decision models executing on 240MHz microcontrollers (ESP32 / RP2040) infer water requirements in under 6 milliseconds, permitting immediate closed-loop pressure regulation without roundtrip latency.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-teal-400">3. Ultra-Low Power Consumption</h4>
            <p>
              Microcontroller inference draws as little as 45 milliwatts, allowing smart irrigation valve controllers to operate indefinitely on modest 5W solar panels and lithium-iron-phosphate (LiFePO4) battery packs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
