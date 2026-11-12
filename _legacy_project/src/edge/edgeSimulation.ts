import { EdgeDeviceMetrics, EdgeInferenceResult, FieldState } from '../types';

export const EDGE_HARDWARE_SPECS = {
  mcu: 'Simulated ESP32-S3 (Xtensa Dual-Core 240MHz, 512KB SRAM)',
  tinyMLFramework: 'TensorFlow Lite for Microcontrollers (TFLite Micro) / CMSIS-NN',
  modelArchitecture: 'Quantized 8-Bit Int8 Decision Forest (2.4 KB Flash, 840 Bytes RAM)',
  powerConsumptionMw: 45, // Milliwatts
  cloudServerSpec: 'Cloud Hyperscaler Cluster (Virtual VPC, AWS/GCP, us-east-1)',
};

/**
 * Lightweight deterministic TinyML decision tree inference running on the simulated MCU.
 * Evaluates sensor inputs locally in under 10ms with zero network transmission.
 */
export function runLocalTinyMLInference(
  soilMoisture: number,
  temperature: number,
  humidity: number,
  rainDetected: boolean,
  fieldCapacity: number = 32,
  wiltingPoint: number = 14
): {
  prediction: 'IRRIGATE' | 'DO_NOT_IRRIGATE' | 'DELAY';
  confidence: number;
  latencyMs: number;
  decisionTreePath: string[];
} {
  const t0 = performance.now();
  const path: string[] = [];

  // TinyML Decision Tree Node 1: Rain Sensor
  if (rainDetected) {
    path.push('Node 1: Rain Sensor == TRUE -> Branch to DELAY');
    const latency = Number((performance.now() - t0 + 4.2).toFixed(2)); // simulated MCU cycles ~4.2ms
    return {
      prediction: 'DELAY',
      confidence: 96,
      latencyMs: latency,
      decisionTreePath: path,
    };
  }
  path.push('Node 1: Rain Sensor == FALSE -> Evaluate Soil Moisture');

  // TinyML Node 2: Soil Moisture Threshold
  const criticalThreshold = wiltingPoint + 4;
  const targetThreshold = fieldCapacity - 6;

  if (soilMoisture <= criticalThreshold) {
    path.push(`Node 2: Moisture (${soilMoisture}%) <= Wilting Critical (${criticalThreshold}%) -> Urgent IRRIGATE`);
    const latency = Number((performance.now() - t0 + 5.1).toFixed(2));
    return {
      prediction: 'IRRIGATE',
      confidence: 98,
      latencyMs: latency,
      decisionTreePath: path,
    };
  }

  if (soilMoisture < targetThreshold) {
    path.push(`Node 2: Moisture (${soilMoisture}%) < Target Band (${targetThreshold}%) -> Check Thermal Evaporation`);
    
    // TinyML Node 3: Thermal / VPD Check
    if (temperature >= 35 && humidity < 35) {
      path.push(`Node 3: Temp (${temperature}°C) >= 35°C & RH (${humidity}%) < 35% -> High Evaporation Loss -> DELAY to Evening`);
      const latency = Number((performance.now() - t0 + 6.4).toFixed(2));
      return {
        prediction: 'DELAY',
        confidence: 88,
        latencyMs: latency,
        decisionTreePath: path,
      };
    } else {
      path.push(`Node 3: Thermal conditions acceptable -> IRRIGATE`);
      const latency = Number((performance.now() - t0 + 5.8).toFixed(2));
      return {
        prediction: 'IRRIGATE',
        confidence: 91,
        latencyMs: latency,
        decisionTreePath: path,
      };
    }
  }

  path.push(`Node 2: Moisture (${soilMoisture}%) >= Target Band (${targetThreshold}%) -> DO_NOT_IRRIGATE`);
  const latency = Number((performance.now() - t0 + 4.5).toFixed(2));
  return {
    prediction: 'DO_NOT_IRRIGATE',
    confidence: 94,
    latencyMs: latency,
    decisionTreePath: path,
  };
}

export function simulateCloudRoundtrip(
  edgeResult: ReturnType<typeof runLocalTinyMLInference>,
  networkJitterMs: number = 280
): {
  prediction: 'IRRIGATE' | 'DO_NOT_IRRIGATE' | 'DELAY';
  confidence: number;
  latencyMs: number;
  dataSentBytes: number;
  networkHops: number;
} {
  // Cloud roundtrip incorporates TLS handshake, cellular/satellite uplink, ingress API gateway, server model inference, and downlink command
  const cloudLatency = Math.round(networkJitterMs + Math.random() * 80 + 35);
  return {
    prediction: edgeResult.prediction,
    confidence: edgeResult.confidence,
    latencyMs: cloudLatency,
    dataSentBytes: 1240, // JSON payload with JWT, timestamps, multi-channel telemetry
    networkHops: 9,
  };
}

export function getEdgeVsCloudComparisonMetrics(): {
  feature: string;
  edge: string;
  cloud: string;
  advantage: 'Edge' | 'Cloud' | 'Tie';
}[] {
  return [
    {
      feature: 'Inference Latency',
      edge: '4 – 8 ms (Sub-second instant reaction)',
      cloud: '250 – 450 ms (Subject to cellular/satellite latency)',
      advantage: 'Edge',
    },
    {
      feature: 'Internet & Connectivity Dependency',
      edge: 'Zero (Operates 100% offline during outages)',
      cloud: 'Mandatory continuous 4G/5G/Starlink connection',
      advantage: 'Edge',
    },
    {
      feature: 'Data Privacy & Farm Sovereignty',
      edge: '100% Local on-chip (No telemetry leaves the farm)',
      cloud: 'Sensors streamed to 3rd-party remote cloud database',
      advantage: 'Edge',
    },
    {
      feature: 'Bandwidth & Data Plan Cost',
      edge: '0 Bytes/month (No recurring SIM data fees)',
      cloud: '150 – 500 MB/month per remote gateway station',
      advantage: 'Edge',
    },
    {
      feature: 'Power Consumption',
      edge: '~45 mW (Can run on 5W solar micro-panel)',
      cloud: 'Continuous cellular modem transmission (~1.8 W)',
      advantage: 'Edge',
    },
    {
      feature: 'Heavy Model Retraining & Historical Big Data',
      edge: 'Limited to lightweight Int8 quantized models',
      cloud: 'Massive compute (LLMs, multi-year satellite analytics)',
      advantage: 'Cloud',
    },
    {
      feature: 'Failsafe Actuation Reliability',
      edge: 'Direct GPIO pin to relay (Pump stops immediately)',
      cloud: 'Packet drops or cloud disconnect can leave valves open',
      advantage: 'Edge',
    },
  ];
}
