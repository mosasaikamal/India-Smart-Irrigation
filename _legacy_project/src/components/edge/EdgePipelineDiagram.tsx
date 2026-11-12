import React, { useState } from 'react';
import { runLocalTinyMLInference, simulateCloudRoundtrip, getEdgeVsCloudComparisonMetrics, EDGE_HARDWARE_SPECS } from '../../edge/edgeSimulation';
import { Cpu, Cloud, Wifi, WifiOff, Zap, Shield, ArrowRight, CheckCircle2, Play, RefreshCw, Gauge } from 'lucide-react';

export const EdgePipelineDiagram: React.FC = () => {
  const [processingMode, setProcessingMode] = useState<'EDGE' | 'CLOUD'>('EDGE');
  const [testMoisture, setTestMoisture] = useState<number>(24);
  const [testTemp, setTestTemp] = useState<number>(34);
  const [testRain, setTestRain] = useState<boolean>(false);
  const [simulatedNetworkDelay, setSimulatedNetworkDelay] = useState<number>(310);

  // Run inferences
  const edgeResult = runLocalTinyMLInference(testMoisture, testTemp, 45, testRain);
  const cloudResult = simulateCloudRoundtrip(edgeResult, simulatedNetworkDelay);

  const activeResult = processingMode === 'EDGE' ? edgeResult : cloudResult;
  const metrics = getEdgeVsCloudComparisonMetrics();

  return (
    <div className="space-y-6">
      {/* Mode Switcher Banner */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Edge AI Architecture: On-Device TinyML vs Cloud Gateway</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulate how low-power microcontrollers make real-time decisions directly at the agricultural field boundary.
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setProcessingMode('EDGE')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              processingMode === 'EDGE'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Edge Processing (TinyML)</span>
          </button>
          <button
            onClick={() => setProcessingMode('CLOUD')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              processingMode === 'CLOUD'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Cloud Processing</span>
          </button>
        </div>
      </div>

      {/* Visual Pipeline (Sensor Layer -> Microcontroller -> AI Classifier -> Solenoid Actuator) */}
      <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-5 overflow-x-auto">
        <div className="min-w-[760px] grid grid-cols-4 gap-4 items-center relative">
          {/* Step 1: Sensors */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative group hover:border-emerald-500/50 transition-colors">
            <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1 flex items-center justify-between">
              <span>Layer 1</span>
              <Gauge className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-white mb-2">Sensor Array</h4>
            <div className="space-y-1 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Capacitive Soil:</span>
                <span className="font-mono text-emerald-400">{testMoisture}%</span>
              </div>
              <div className="flex justify-between">
                <span>DHT22 Temp:</span>
                <span className="font-mono text-amber-400">{testTemp}°C</span>
              </div>
              <div className="flex justify-between">
                <span>Rain Optical:</span>
                <span className="font-mono text-sky-400">{testRain ? 'DETECTED' : 'CLEAR'}</span>
              </div>
            </div>
          </div>

          {/* Step 2: Edge Device / Gateway */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative group hover:border-teal-500/50 transition-colors">
            <div className="text-[10px] uppercase font-bold text-teal-400 mb-1 flex items-center justify-between">
              <span>Layer 2</span>
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-white mb-2">
              {processingMode === 'EDGE' ? 'Edge MCU (ESP32-S3)' : 'Cellular Gateway'}
            </h4>
            <div className="space-y-1 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Frequency:</span>
                <span className="font-mono text-slate-200">240 MHz Dual-Core</span>
              </div>
              <div className="flex justify-between">
                <span>Power Draw:</span>
                <span className="font-mono text-emerald-400">{EDGE_HARDWARE_SPECS.powerConsumptionMw} mW</span>
              </div>
              <div className="flex justify-between">
                <span>Local RAM:</span>
                <span className="font-mono text-slate-200">512 KB SRAM</span>
              </div>
            </div>
          </div>

          {/* Step 3: Decision Engine */}
          <div className={`p-4 rounded-xl border transition-colors ${
            processingMode === 'EDGE'
              ? 'bg-emerald-950/20 border-emerald-500/60 shadow-lg shadow-emerald-500/5'
              : 'bg-cyan-950/20 border-cyan-500/60 shadow-lg shadow-cyan-500/5'
          }`}>
            <div className="text-[10px] uppercase font-bold mb-1 flex items-center justify-between">
              <span className={processingMode === 'EDGE' ? 'text-emerald-400' : 'text-cyan-400'}>
                {processingMode === 'EDGE' ? 'Layer 3: TinyML Model' : 'Layer 3: Cloud Model'}
              </span>
              {processingMode === 'EDGE' ? <WifiOff className="w-3.5 h-3.5 text-emerald-400" /> : <Wifi className="w-3.5 h-3.5 text-cyan-400" />}
            </div>
            <h4 className="text-xs font-bold text-white mb-2">
              {processingMode === 'EDGE' ? 'Quantized Int8 Forest' : 'Cloud Server Cluster'}
            </h4>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Prediction:</span>
                <span className="font-mono font-bold text-white">{activeResult.prediction}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Latency:</span>
                <span className={`font-mono font-bold ${processingMode === 'EDGE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {activeResult.latencyMs} ms
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Confidence:</span>
                <span className="font-mono text-emerald-400">{activeResult.confidence}%</span>
              </div>
            </div>
          </div>

          {/* Step 4: Actuator Pump */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative group hover:border-emerald-500/50 transition-colors">
            <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1 flex items-center justify-between">
              <span>Layer 4</span>
              <Zap className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-white mb-2">Irrigation Actuator</h4>
            <div className="space-y-1 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Solenoid Relay:</span>
                <span className={`font-mono font-semibold ${
                  activeResult.prediction === 'IRRIGATE' ? 'text-emerald-400 animate-pulse' : 'text-slate-400'
                }`}>
                  {activeResult.prediction === 'IRRIGATE' ? 'PUMP ACTIVE (OPEN)' : 'PUMP CLOSED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Failsafe State:</span>
                <span className="font-mono text-slate-200">Hardware Watchdog Armed</span>
              </div>
              <div className="flex justify-between">
                <span>Network Drop Risk:</span>
                <span className="font-mono text-slate-300">
                  {processingMode === 'EDGE' ? '0% (Local Control)' : 'High (Packet drop risk)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Sensor Test Bench */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <span>Interactive Sensor Inputs (Live Feed)</span>
            <span className="text-[11px] text-slate-400">Adjust to test instant inference</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Moisture Slider */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Simulated Soil Moisture:</span>
                <span className="font-mono font-bold text-emerald-400">{testMoisture}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                value={testMoisture}
                onChange={(e) => setTestMoisture(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Temperature Slider */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Simulated Ambient Temperature:</span>
                <span className="font-mono font-bold text-amber-400">{testTemp}°C</span>
              </div>
              <input
                type="range"
                min={15}
                max={45}
                value={testTemp}
                onChange={(e) => setTestTemp(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Rain Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-slate-300">Rain Sensor (Precipitation Detected):</span>
              <button
                onClick={() => setTestRain(!testRain)}
                className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-colors ${
                  testRain ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {testRain ? 'RAIN DETECTED' : 'DRY SENSOR'}
              </button>
            </div>
          </div>
        </div>

        {/* Execution Breakdown */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-200 mb-2 flex items-center justify-between">
              <span>On-Device Decision Tree Traversal</span>
              <span className="text-xs font-mono text-emerald-400">
                Latency: {activeResult.latencyMs} ms
              </span>
            </div>

            <div className="space-y-1.5 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
              {edgeResult.decisionTreePath.map((step, i) => (
                <div key={i} className="flex items-start space-x-1.5 text-slate-300">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Current Actuation Decision:</span>
            <span className={`px-2 py-0.5 rounded font-mono font-bold ${
              activeResult.prediction === 'IRRIGATE'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : activeResult.prediction === 'DELAY'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-300'
            }`}>
              {activeResult.prediction}
            </span>
          </div>
        </div>
      </div>

      {/* Architectural Comparison Table */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
          Edge Computing vs Cloud Architecture Benchmark
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-2.5 font-semibold">Evaluation Criteria</th>
                <th className="p-2.5 font-semibold text-emerald-400">Edge AI (Microcontroller)</th>
                <th className="p-2.5 font-semibold text-cyan-400">Cloud Infrastructure</th>
                <th className="p-2.5 font-semibold text-center">Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {metrics.map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/30">
                  <td className="p-2.5 text-slate-300 font-sans font-medium">{row.feature}</td>
                  <td className="p-2.5 text-emerald-300">{row.edge}</td>
                  <td className="p-2.5 text-slate-400">{row.cloud}</td>
                  <td className="p-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.advantage === 'Edge'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {row.advantage}
                    </span>
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
