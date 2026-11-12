import React, { useState, useEffect } from 'react';
import { api, EdgeDeviceDto } from '../services/api';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import {
  Cpu,
  Wifi,
  WifiOff,
  RefreshCw,
  Layers,
  Battery,
  ShieldAlert,
  Code,
  CheckCircle,
  FileText,
  Clock,
  Activity,
  HardDrive,
  AlertTriangle,
  Send,
  Radio,
  Plus,
  Play
} from 'lucide-react';

export const EdgeAIIoTPage: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'simulated' | 'hardware'>('simulated');
  const [devices, setDevices] = useState<EdgeDeviceDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Simulated node state
  const [selectedSimId, setSelectedSimId] = useState<string>('ESP32-SIM-01');
  const [simState, setSimState] = useState<{
    moisture_pct: number;
    temp_c: number;
    humidity_pct: number;
    rain_detected: boolean;
    battery_pct: number;
    local_action_taken: string;
    is_anomaly: boolean;
    anomaly_description?: string | null;
  }>({
    moisture_pct: 23.5,
    temp_c: 27.8,
    humidity_pct: 44.0,
    rain_detected: false,
    battery_pct: 96.0,
    local_action_taken: 'NONE',
    is_anomaly: false,
    anomaly_description: null
  });

  const [isSimConnected, setIsSimConnected] = useState<boolean>(true);
  const [offlineBufferCount, setOfflineBufferCount] = useState<number>(0);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [ticking, setTicking] = useState<boolean>(false);

  // Hardware & MQTT state
  const [activeProtocolTab, setActiveProtocolTab] = useState<'http' | 'mqtt' | 'firmware'>('http');
  const [mqttTopic, setMqttTopic] = useState<string>('agro/telemetry/ESP32-HW-01');
  const [mqttDeviceId, setMqttDeviceId] = useState<string>('ESP32-HW-01');
  const [mqttAuthToken, setMqttAuthToken] = useState<string>('agro-edge-secret-key-2025');
  const [mqttMoisture, setMqttMoisture] = useState<number>(22.4);
  const [mqttTemp, setMqttTemp] = useState<number>(26.8);
  const [mqttStatusMsg, setMqttStatusMsg] = useState<string | null>(null);
  const [mqttLoading, setMqttLoading] = useState<boolean>(false);

  // Register hardware state
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [newHwId, setNewHwId] = useState<string>('ESP32-HW-02');
  const [newHwName, setNewHwName] = useState<string>('Field Sector 2 Microcontroller');

  const loadDevices = async () => {
    setLoading(true);
    try {
      const devs = await api.getEdgeDevices();
      setDevices(devs);
      const activeSim = devs.find((d) => d.id === selectedSimId);
      if (activeSim) {
        setIsSimConnected(activeSim.status.includes('ONLINE'));
        setOfflineBufferCount(activeSim.queued_buffer_count || 0);
      }
    } catch (e) {
      console.warn('Devices fetch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, [selectedSimId]);

  const handleToggleConnection = async () => {
    const nextState = !isSimConnected;
    setIsSimConnected(nextState);
    try {
      const res = await api.toggleSimulationConnection(selectedSimId, nextState);
      if (res && res.buffered_count !== undefined) {
        setOfflineBufferCount(res.buffered_count);
      }
      loadDevices();
    } catch (e) {
      console.warn('Toggle failed:', e);
    }
  };

  const handleTickStep = async (overrides?: any) => {
    setTicking(true);
    try {
      const res = await api.tickSimulation(selectedSimId, overrides);
      if (res && res.reading) {
        setSimState(res.reading);
        setOfflineBufferCount(res.buffered_count || 0);
        setIsSimConnected(res.is_connected);
      }
    } catch (e) {
      console.warn('Tick failed:', e);
    } finally {
      setTicking(false);
    }
  };

  const handleTriggerAnomaly = () => {
    // Injects 1.2% moisture, which violates physical sensor boundary (< 3%)
    handleTickStep({ moisture_override: 1.2 });
  };

  const handleResetSimulation = async () => {
    try {
      await api.resetSimulation(selectedSimId);
      setSimState({
        moisture_pct: 24.5,
        temp_c: 24.0,
        humidity_pct: 55.0,
        rain_detected: false,
        battery_pct: 96.0,
        local_action_taken: 'NONE',
        is_anomaly: false,
        anomaly_description: null
      });
      setOfflineBufferCount(0);
      setIsSimConnected(true);
      setSyncMessage('Simulation state and offline queue reset to factory baseline.');
      loadDevices();
    } catch (e) {
      alert(`Reset failed: ${e}`);
    }
  };

  const handleSyncOffline = async () => {
    setSyncing(true);
    try {
      // Build batch with realistic timestamp series for the buffered count
      const now = Date.now();
      const batch = Array.from({ length: Math.max(1, offlineBufferCount) }, (_, i) => ({
        recorded_at: new Date(now - (offlineBufferCount - i) * 60000).toISOString(),
        moisture_pct: Number((simState.moisture_pct + i * 0.1).toFixed(1)),
        temp_c: simState.temp_c,
        humidity_pct: simState.humidity_pct,
        rain_detected: simState.rain_detected,
        battery_pct: simState.battery_pct,
        local_action_taken: simState.local_action_taken || 'LOCAL_DEFICIT_FLAGGED',
      }));

      const res = await api.syncOfflineBatch({
        device_id: selectedSimId,
        auth_token: 'agro-edge-secret-key-2025',
        field_id: 'field-01',
        buffered_readings: batch,
      });

      setSyncMessage(
        `Successfully flushed ${res.synced_records_count || offlineBufferCount} queued readings to backend database. Connection restored to ONLINE.`
      );
      setOfflineBufferCount(0);
      setIsSimConnected(true);
      loadDevices();
    } catch (err) {
      alert(`Sync failed: ${err}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleRegisterHardware = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.registerEdgeDevice({
        device_id: newHwId,
        name: newHwName,
        field_id: 'field-01',
        auth_token: 'agro-edge-secret-key-2025',
        firmware_version: 'v1.2.0-esp32',
        local_threshold_moisture: 22.0,
        is_simulated: false,
      });
      setShowRegisterModal(false);
      loadDevices();
    } catch (err) {
      alert(`Registration failed: ${err}`);
    }
  };

  const handleSendTestMqtt = async () => {
    setMqttLoading(true);
    setMqttStatusMsg(null);
    try {
      const payload = {
        device_id: mqttDeviceId,
        auth_token: mqttAuthToken,
        topic: `agro/telemetry/${mqttDeviceId}`,
        field_id: 'field-01',
        telemetry: {
          recorded_at: new Date().toISOString(),
          moisture_pct: mqttMoisture,
          temp_c: mqttTemp,
          humidity_pct: 48.0,
          rain_detected: false,
          battery_pct: 95.5,
          local_action_taken: mqttMoisture < 22.0 ? 'LOCAL_DEFICIT_FLAGGED' : 'NONE',
        },
      };

      const res = await api.publishMqtt(payload);
      setMqttStatusMsg(
        `MQTT Packet Published Successfully to '${res.topic}' (QoS: ${res.qos}) — Ingested at ${res.telemetry_ack?.ingested_at || 'server'}`
      );
      loadDevices();
    } catch (err: any) {
      setMqttStatusMsg(`MQTT Publish Error: ${err.message || err}`);
    } finally {
      setMqttLoading(false);
    }
  };

  // Filter devices strictly by provenance
  const simulatedDevices = devices.filter((d) => d.is_simulated);
  const physicalDevices = devices.filter((d) => !d.is_simulated);

  const sampleFirmwareSnippet = `#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// Cloud Ingestion Configuration
const char* SERVER_URL = "http://192.168.1.100:8000/api/edge/telemetry";
const char* AUTH_TOKEN = "agro-edge-secret-key-2025";
const char* DEVICE_ID  = "ESP32-HW-01";

// Sensor Anomaly Guard: < 3% or > 65% moisture flags hardware failure
if (moisture < 3.0 || moisture > 65.0) {
  currentReading.isAnomaly = true;
  snprintf(currentReading.localAction, sizeof(currentReading.localAction), "SENSOR_ANOMALY_INVALID_READING");
  digitalWrite(RELAY_VALVE_PIN, LOW); // Failsafe shutoff
}

void transmitTelemetry(float moisture, float temp, float humidity) {
  if (WiFi.status() != WL_CONNECTED) {
    bufferOfflineReading(moisture, temp, humidity); // Local circular SPIFFS buffer
    return;
  }
  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  String payload = "{\\"device_id\\":\\"" + String(DEVICE_ID) + "\\",\\"auth_token\\":\\"" + String(AUTH_TOKEN) + "\\",\\"telemetry\\":{\\"moisture_pct\\":" + String(moisture, 1) + "}}";
  http.POST(payload);
  http.end();
}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Edge AI & Microcontroller Integration</h2>
            <DataSourceBadge type="LIVE" label="Dual IoT Gateway" />
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Decentralized field edge intelligence: In-memory simulation state machine with offline queue sync and authenticated physical ESP32 / Arduino hardware ingestion.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveMode('simulated')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeMode === 'simulated' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mode 1: Simulated Node
          </button>
          <button
            onClick={() => setActiveMode('hardware')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeMode === 'hardware' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mode 2: Real Hardware (ESP32)
          </button>
        </div>
      </div>

      {/* Strict Provenance & Hardware Separation Alert */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start space-x-3 text-xs">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-slate-300 space-y-0.5">
          <span className="font-bold text-white">PROVENANCE NOTICE & HARDWARE BOUNDARY: </span>
          <span>
            Agro Intelligence strictly differentiates virtual simulated edge nodes from real physical microcontrollers. Virtual nodes execute in-memory state machines and are never misrepresented as physical hardware.
          </span>
        </div>
      </div>

      {activeMode === 'simulated' ? (
        /* MODE 1: SIMULATED EDGE SENSOR */
        <div className="space-y-6">
          {/* Edge Simulator Controls Card */}
          <div className="agri-card space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2.5 rounded-xl border ${
                    isSimConnected
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-400'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  }`}
                >
                  {isSimConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedSimId}
                      onChange={(e) => setSelectedSimId(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-sm font-bold text-white rounded-lg px-2 py-1 cursor-pointer focus:outline-none"
                    >
                      <option value="ESP32-SIM-01">ESP32-SIM-01 (Virtual Node)</option>
                      <option value="ESP32-SIM-02">ESP32-SIM-02 (Virtual Node)</option>
                    </select>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      SIMULATED SENSOR (Virtual Node)
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isSimConnected
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {isSimConnected ? 'ONLINE / CONNECTED' : 'OFFLINE / DISCONNECTED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Target Field: North Valley Sector (field-01)</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleTickStep()}
                  disabled={ticking}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                >
                  <Play className={`w-3.5 h-3.5 text-emerald-400 ${ticking ? 'animate-spin' : ''}`} />
                  <span>Tick Step</span>
                </button>

                <button
                  onClick={handleTriggerAnomaly}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Test Sensor Anomaly (&lt; 3%)</span>
                </button>

                <button
                  onClick={handleToggleConnection}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSimConnected
                      ? 'bg-rose-600/30 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  }`}
                >
                  {isSimConnected ? 'Disconnect Virtual Node' : 'Reconnect Cloud Gateway'}
                </button>

                <button
                  onClick={handleResetSimulation}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-all"
                  title="Reset Simulator"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sensor Anomaly Banner */}
            {simState.is_anomaly && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/60 text-xs text-rose-200 flex items-start space-x-2.5 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">FAILSAFE TRIGGERED — SENSOR_ANOMALY_INVALID_READING: </span>
                  <span>{simState.anomaly_description || 'Moisture violates physical bounds (< 3% or > 65%).'}</span>
                  <p className="text-[11px] text-rose-300/90 mt-1">
                    Safety Guard Interlock: Solenoid valve output locked DE-ENERGIZED to prevent catastrophic false irrigation actuation.
                  </p>
                </div>
              </div>
            )}

            {/* Simulated Live Telemetry Dials */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
                <span className="text-slate-400 block text-[10px]">Soil Moisture</span>
                <span className={`text-xl font-bold ${simState.moisture_pct < 3.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {simState.moisture_pct}%
                </span>
                <span className="text-[10px] text-slate-500 block">Threshold: 22.0%</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
                <span className="text-slate-400 block text-[10px]">Ambient Temperature</span>
                <span className="text-xl font-bold text-amber-400">{simState.temp_c}°C</span>
                <span className="text-[10px] text-slate-500 block">DHT22 probe</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
                <span className="text-slate-400 block text-[10px]">Relative Humidity</span>
                <span className="text-xl font-bold text-cyan-400">{simState.humidity_pct}%</span>
                <span className="text-[10px] text-slate-500 block">Atmospheric</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
                <span className="text-slate-400 block text-[10px]">Battery Voltage</span>
                <span className="text-xl font-bold text-slate-200">{simState.battery_pct}%</span>
                <span className="text-[10px] text-emerald-400 block">Trickle active</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px]">Local Edge Action</span>
                <span className={`text-xs font-bold block truncate mt-1 ${
                  simState.local_action_taken.includes('ANOMALY')
                    ? 'text-rose-400'
                    : simState.local_action_taken.includes('DEFICIT')
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}>
                  {simState.local_action_taken}
                </span>
                <span className="text-[10px] text-slate-500 block">Autonomous MCU</span>
              </div>
            </div>

            {/* Offline Flash Queue Buffer Management */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Non-Volatile Edge Flash Queue Buffer
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-purple-300">
                  {offlineBufferCount} / 50 Readings Buffered Locally
                </span>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (offlineBufferCount / 50) * 100)}%` }}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
                <p>
                  When disconnected, edge device operates autonomously, buffers time-stamped readings locally, and executes local safety rules.
                </p>
                {offlineBufferCount > 0 && (
                  <button
                    onClick={handleSyncOffline}
                    disabled={syncing}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/30 transition-all shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    <span>{syncing ? 'Synchronizing...' : 'Flush & Synchronize Queue'}</span>
                  </button>
                )}
              </div>

              {syncMessage && (
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs">
                  {syncMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2: PHYSICAL HARDWARE MICROCONTROLLER INTEGRATION */
        <div className="space-y-6">
          {/* Physical Hardware Registry Table */}
          <div className="agri-card space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>Physical Microcontroller Hardware Registry</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    PHYSICAL HARDWARE (ESP32 Node)
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Strictly displays physical hardware nodes (is_simulated = false)</p>
              </div>

              <button
                onClick={() => setShowRegisterModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Hardware Node</span>
              </button>
            </div>

            {physicalDevices.length === 0 ? (
              <div className="p-6 text-center space-y-2 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <Cpu className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-slate-300 font-semibold">No Physical Microcontrollers Registered</p>
                <p className="text-slate-400 max-w-md mx-auto">
                  Click "Register Hardware Node" above to register an ESP32 or flash the sample C++ firmware below to begin streaming field telemetry.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="pb-2">Device ID</th>
                      <th className="pb-2">Sector</th>
                      <th className="pb-2">Firmware</th>
                      <th className="pb-2">Battery</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Provenance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {physicalDevices.map((d) => (
                      <tr key={d.id} className="text-slate-300">
                        <td className="py-2.5 font-bold text-white font-sans">{d.id}</td>
                        <td className="py-2.5 text-slate-400">{d.field_id}</td>
                        <td className="py-2.5 text-emerald-400">{d.firmware_version}</td>
                        <td className="py-2.5 text-slate-300">{d.battery_level_pct}%</td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              d.status === 'ONLINE'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Physical Hardware
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Dual Protocol & Firmware Tabs */}
          <div className="agri-card space-y-4">
            <div className="flex border-b border-slate-800 text-xs">
              <button
                onClick={() => setActiveProtocolTab('http')}
                className={`pb-2.5 px-4 font-bold border-b-2 transition-all ${
                  activeProtocolTab === 'http'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                1. Authenticated HTTP REST
              </button>
              <button
                onClick={() => setActiveProtocolTab('mqtt')}
                className={`pb-2.5 px-4 font-bold border-b-2 transition-all ${
                  activeProtocolTab === 'mqtt'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                2. Industrial MQTT Broker Gateway
              </button>
              <button
                onClick={() => setActiveProtocolTab('firmware')}
                className={`pb-2.5 px-4 font-bold border-b-2 transition-all ${
                  activeProtocolTab === 'firmware'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                3. ESP32 Arduino Sketch
              </button>
            </div>

            {activeProtocolTab === 'http' && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] space-y-2">
                  <div className="text-emerald-400 font-bold">POST /api/edge/telemetry</div>
                  <div className="text-slate-400">Content-Type: application/json</div>
                  <pre className="text-slate-200 mt-2">
{`{
  "device_id": "ESP32-HW-01",
  "auth_token": "agro-edge-secret-key-2025",
  "field_id": "field-01",
  "telemetry": {
    "recorded_at": "${new Date().toISOString()}",
    "moisture_pct": 21.8,
    "temp_c": 28.4,
    "humidity_pct": 46.2,
    "rain_detected": false,
    "battery_pct": 94.5,
    "local_action_taken": "LOCAL_DEFICIT_FLAGGED"
  }
}`}
                  </pre>
                </div>
              </div>
            )}

            {activeProtocolTab === 'mqtt' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono">
                    <span className="text-[10px] text-slate-500 block">Broker Host & Port</span>
                    <span className="text-emerald-400 font-bold">mqtt.agrointelligence.internal:8883</span>
                    <span className="text-[10px] text-slate-400 block mt-1">TLS v1.3 / MQTTS</span>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono">
                    <span className="text-[10px] text-slate-500 block">Telemetry Topic</span>
                    <span className="text-cyan-400 font-bold">agro/telemetry/&#123;device_id&#125;</span>
                    <span className="text-[10px] text-slate-400 block mt-1">QoS Level 1 (At least once)</span>
                  </div>
                </div>

                {/* Interactive Test MQTT Telemetry Publisher */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-white flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span>Interactive MQTT Telemetry Test Dispatcher</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block">Device ID</label>
                      <input
                        type="text"
                        value={mqttDeviceId}
                        onChange={(e) => setMqttDeviceId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Auth Token</label>
                      <input
                        type="text"
                        value={mqttAuthToken}
                        onChange={(e) => setMqttAuthToken(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Moisture (%)</label>
                      <input
                        type="number"
                        value={mqttMoisture}
                        onChange={(e) => setMqttMoisture(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Temp (°C)</label>
                      <input
                        type="number"
                        value={mqttTemp}
                        onChange={(e) => setMqttTemp(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSendTestMqtt}
                    disabled={mqttLoading}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/20"
                  >
                    <Send className={`w-3.5 h-3.5 ${mqttLoading ? 'animate-spin' : ''}`} />
                    <span>{mqttLoading ? 'Publishing...' : 'Dispatch Test MQTT Packet'}</span>
                  </button>

                  {mqttStatusMsg && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs">
                      {mqttStatusMsg}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeProtocolTab === 'firmware' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto font-mono text-[11px] text-emerald-300 max-h-72">
                <pre>{sampleFirmwareSnippet}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Register Physical Microcontroller Node</span>
            </h3>
            <form onSubmit={handleRegisterHardware} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Microcontroller ID</label>
                <input
                  type="text"
                  value={newHwId}
                  onChange={(e) => setNewHwId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Device Label</label>
                <input
                  type="text"
                  value={newHwName}
                  onChange={(e) => setNewHwName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Register Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

