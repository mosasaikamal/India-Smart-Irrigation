import { AgentConsensus, AgentId, AgentMessage, AgentStatus, FieldState } from '../types';

export interface MultiAgentSystemState {
  agents: Record<AgentId, AgentStatus>;
  messages: AgentMessage[];
  consensus: AgentConsensus;
}

export function runMultiAgentCycle(fieldState: FieldState): MultiAgentSystemState {
  const { soil, environment, parameters, etc, smd, raw, taw } = fieldState;
  const areaSqMeters = parameters.fieldSize * 4046.86;
  const messages: AgentMessage[] = [];
  const now = new Date().toLocaleTimeString();

  // 1. SOIL MONITORING AGENT
  const moistureThreshold = soil.fieldCapacity - (soil.fieldCapacity - soil.wiltingPoint) * 0.45;
  const isMoistureCritical = soil.currentMoisture <= soil.wiltingPoint + 2;
  const isMoistureDeficit = soil.currentMoisture < moistureThreshold;

  let soilDecision = '';
  let soilUrgency: AgentStatus['urgency'] = 'Low';
  let soilConfidence = 90;
  let soilAction = '';

  if (isMoistureCritical) {
    soilDecision = `CRITICAL: Soil moisture (${soil.currentMoisture}%) is near wilting point (${soil.wiltingPoint}%). Immediate replenishment required.`;
    soilUrgency = 'Critical';
    soilConfidence = 97;
    soilAction = 'Dispatched Urgent Moisture Alert';
  } else if (isMoistureDeficit) {
    soilDecision = `DEFICIT: Volumetric moisture (${soil.currentMoisture}%) fell below target threshold (${moistureThreshold.toFixed(1)}%). Refill deficit of ${smd} mm.`;
    soilUrgency = 'High';
    soilConfidence = 92;
    soilAction = 'Requested Standard Irrigation Cycle';
  } else {
    soilDecision = `SATISFIED: Soil moisture (${soil.currentMoisture}%) is within optimal available range (${moistureThreshold.toFixed(1)}% - ${soil.fieldCapacity}%).`;
    soilUrgency = 'Low';
    soilConfidence = 89;
    soilAction = 'Holding Routine Monitoring Loop';
  }

  const soilAgent: AgentStatus = {
    id: 'soil',
    name: 'Soil Monitoring Agent',
    role: 'Sensor Telemetry & Moisture Balance',
    iconName: 'Droplets',
    state: isMoistureCritical ? 'ALERT' : isMoistureDeficit ? 'EVALUATING' : 'MONITORING',
    lastInputSummary: `Moisture: ${soil.currentMoisture}%, FC: ${soil.fieldCapacity}%, WP: ${soil.wiltingPoint}%, SMD: ${smd}mm`,
    decision: soilDecision,
    confidence: soilConfidence,
    lastAction: soilAction,
    proposedWaterLiters: isMoistureDeficit ? Math.round(smd * areaSqMeters) : 0,
    proposedDelayHours: 0,
    urgency: soilUrgency,
    weight: 0.35,
  };

  messages.push({
    id: `msg-1`,
    timestamp: now,
    fromAgent: 'soil',
    toAgent: 'all',
    message: isMoistureDeficit
      ? `Root zone moisture deficit detected at ${smd}mm for ${parameters.crop}. Requesting irrigation replenishment.`
      : `Soil moisture stable at ${soil.currentMoisture}%. Soil reservoir adequate.`,
    sentiment: isMoistureCritical ? 'urgent' : isMoistureDeficit ? 'caution' : 'approval',
  });

  // 2. WEATHER AGENT
  const rainProb = environment.rainProbability;
  const rainfallAmount = environment.rainfallAmount;
  const temp = environment.temperature;

  let weatherDecision = '';
  let weatherUrgency: AgentStatus['urgency'] = 'Low';
  let weatherConfidence = 88;
  let weatherAction = '';
  let weatherDelayHours = 0;

  if (rainProb >= 70) {
    weatherDecision = `RAIN EXPECTED: High rain probability (${rainProb}%) with estimated ${rainfallAmount || '15+'} mm expected within 6–12 hours.`;
    weatherUrgency = 'Critical';
    weatherConfidence = 94;
    weatherAction = 'Recommended Postponing Irrigation for Natural Precipitation';
    weatherDelayHours = 8;
  } else if (rainProb >= 40) {
    weatherDecision = `MODERATE RAIN RISK: ${rainProb}% chance of rain. Recommend standby or short delay to re-evaluate cloud radar.`;
    weatherUrgency = 'Medium';
    weatherConfidence = 82;
    weatherAction = 'Requested 4-Hour Standby Window';
    weatherDelayHours = 4;
  } else if (temp >= 34) {
    weatherDecision = `HEATWAVE ALERT: Ambient temp ${temp}°C, humidity ${environment.humidity}%. Midday evaporation loss exceeds 30%.`;
    weatherUrgency = 'High';
    weatherConfidence = 91;
    weatherAction = 'Requested Off-Peak Evening Irrigation (Delay 4h)';
    weatherDelayHours = 4;
  } else {
    weatherDecision = `CLEAR CONDITIONS: Low precipitation risk (${rainProb}%). Ambient temperature ${temp}°C suitable for normal scheduling.`;
    weatherUrgency = 'Low';
    weatherConfidence = 87;
    weatherAction = 'Cleared Weather Horizon for Irrigation';
    weatherDelayHours = 0;
  }

  const weatherAgent: AgentStatus = {
    id: 'weather',
    name: 'Weather Forecasting Agent',
    role: 'Precipitation & Meteorological Analysis',
    iconName: 'CloudRain',
    state: rainProb >= 70 ? 'ALERT' : 'MONITORING',
    lastInputSummary: `Rain Prob: ${rainProb}%, Rain Vol: ${rainfallAmount}mm, Temp: ${temp}°C, RH: ${environment.humidity}%`,
    decision: weatherDecision,
    confidence: weatherConfidence,
    lastAction: weatherAction,
    proposedWaterLiters: 0,
    proposedDelayHours: weatherDelayHours,
    urgency: weatherUrgency,
    weight: 0.30,
  };

  messages.push({
    id: `msg-2`,
    timestamp: now,
    fromAgent: 'weather',
    toAgent: 'coordinator',
    message: rainProb >= 70
      ? `Incoming rain radar shows ${rainProb}% precipitation certainty. Do not irrigate to avoid runoff waste!`
      : temp >= 34
      ? `High daytime heat (${temp}°C) will vaporize surface water. Shift application to cooler evening hours.`
      : `Atmospheric conditions calm. Zero rain conflict.`,
    sentiment: rainProb >= 70 || temp >= 34 ? 'caution' : 'approval',
  });

  // 3. WATER CONSERVATION AGENT
  let conservationDecision = '';
  let conservationWater = soilAgent.proposedWaterLiters;
  let conservationConfidence = 90;

  if (rainProb >= 70) {
    conservationDecision = `MAXIMUM CONSERVATION: 100% water offset possible via forecasted rainfall. Saving ~${soilAgent.proposedWaterLiters.toLocaleString()} L.`;
    conservationWater = 0;
  } else if (soil.currentMoisture > moistureThreshold - 2 && !isMoistureCritical) {
    // Propose deficit irrigation: 70% volume
    conservationWater = Math.round(soilAgent.proposedWaterLiters * 0.75);
    conservationDecision = `DEFICIT IRRIGATION ADVOCACY: Reduce application volume to 75% (${conservationWater.toLocaleString()} L). Conserves ground water without crop yield penalty.`;
  } else {
    conservationDecision = `APPROVED FULL DOSE: Severe soil deficit detected. Full application required to safeguard crop health.`;
  }

  const waterConservationAgent: AgentStatus = {
    id: 'conservation',
    name: 'Water Conservation Agent',
    role: 'Water Audit & Deficit Optimization',
    iconName: 'ShieldAlert',
    state: 'EVALUATING',
    lastInputSummary: `Requested: ${soilAgent.proposedWaterLiters.toLocaleString()} L, Proposed Cap: ${conservationWater.toLocaleString()} L`,
    decision: conservationDecision,
    confidence: conservationConfidence,
    lastAction: rainProb >= 70 ? 'Vetoed Irrigation Cycle' : 'Applied Deficit Volume Discount',
    proposedWaterLiters: conservationWater,
    proposedDelayHours: 0,
    urgency: 'Medium',
    weight: 0.20,
  };

  messages.push({
    id: `msg-3`,
    timestamp: now,
    fromAgent: 'conservation',
    toAgent: 'coordinator',
    message: rainProb >= 70
      ? `Conservation veto: 100% water saving opportunity. Rely on rain.`
      : `Recommend capping water volume at ${conservationWater.toLocaleString()} L to prevent percolation losses.`,
    sentiment: rainProb >= 70 ? 'approval' : 'neutral',
  });

  // 4. IRRIGATION HYDRAULIC AGENT
  let irrigationDuration = 0;
  let irrigationAction = '';
  if (conservationWater > 0 && !(rainProb >= 70 && !isMoistureCritical)) {
    const rateMmHr = parameters.irrigationMethod === 'Drip' ? 12 : 18;
    const depthMm = conservationWater / areaSqMeters;
    irrigationDuration = Math.round((depthMm / rateMmHr) * 60);
    irrigationAction = `Prepared ${parameters.irrigationMethod} valve cycle for ${irrigationDuration} mins`;
  } else {
    irrigationAction = 'Valves remain closed';
  }

  const irrigationAgent: AgentStatus = {
    id: 'irrigation',
    name: 'Irrigation Actuator Agent',
    role: 'Hydraulic Control & Valve Scheduling',
    iconName: 'Cpu',
    state: irrigationDuration > 0 ? 'ALERT' : 'IDLE',
    lastInputSummary: `Method: ${parameters.irrigationMethod}, Rate: 12 mm/hr, Field: ${parameters.fieldSize} acres`,
    decision: irrigationDuration > 0
      ? `Calibrated hydraulic delivery: Run ${parameters.irrigationMethod} zone valves for ${irrigationDuration} minutes.`
      : `Hydraulic pumps on standby. All sector solenoid valves closed.`,
    confidence: 93,
    lastAction: irrigationAction,
    proposedWaterLiters: conservationWater,
    proposedDelayHours: weatherDelayHours,
    urgency: isMoistureCritical ? 'Critical' : irrigationDuration > 0 ? 'High' : 'Low',
    weight: 0.15,
  };

  messages.push({
    id: `msg-4`,
    timestamp: now,
    fromAgent: 'irrigation',
    toAgent: 'coordinator',
    message: irrigationDuration > 0
      ? `Pump station primed. Ready to dispatch ${conservationWater.toLocaleString()} L over ${irrigationDuration} min cycle.`
      : `Pump system idle. Zero pressure demand.`,
    sentiment: 'neutral',
  });

  // 5. COORDINATOR AGENT (Synthesizer & Conflict Resolver)
  let finalDecision = '';
  let consensusWater = 0;
  let consensusDuration = 0;
  let consensusDelay = 0;
  let agreementRate = 90;
  let coordinatorConfidence = 91;

  if (rainProb >= 70 && !isMoistureCritical) {
    finalDecision = `Consensus Reached: Postpone irrigation cycle by 8 hours. Weather Agent and Conservation Agent successfully aligned to conserve ${soilAgent.proposedWaterLiters.toLocaleString()} L of water ahead of incoming rainfall.`;
    consensusWater = 0;
    consensusDuration = 0;
    consensusDelay = 8;
    agreementRate = 95;
    coordinatorConfidence = 96;
  } else if (isMoistureCritical) {
    finalDecision = `Emergency Override: Soil Agent critical alert supersedes weather delay. Dispatching ${conservationWater.toLocaleString()} L immediately for ${irrigationDuration} minutes to prevent irreversible crop wilting.`;
    consensusWater = conservationWater;
    consensusDuration = irrigationDuration;
    consensusDelay = 0;
    agreementRate = 85;
    coordinatorConfidence = 98;
  } else if (isMoistureDeficit) {
    if (temp >= 34) {
      finalDecision = `Consensus Reached: Weather Agent recommendation accepted. Schedule irrigation of ${conservationWater.toLocaleString()} L for evening hours (in 4 hours) to avoid 30% thermal evaporation loss.`;
      consensusWater = conservationWater;
      consensusDuration = irrigationDuration;
      consensusDelay = 4;
      agreementRate = 90;
      coordinatorConfidence = 92;
    } else {
      finalDecision = `Consensus Reached: Authorize standard irrigation of ${conservationWater.toLocaleString()} L (${irrigationDuration} minutes) to refill root zone to field capacity.`;
      consensusWater = conservationWater;
      consensusDuration = irrigationDuration;
      consensusDelay = 0;
      agreementRate = 95;
      coordinatorConfidence = 94;
    }
  } else {
    finalDecision = `Consensus Reached: No irrigation action required. Soil moisture is within optimal agronomic limits. All agents concur.`;
    consensusWater = 0;
    consensusDuration = 0;
    consensusDelay = 0;
    agreementRate = 100;
    coordinatorConfidence = 95;
  }

  const coordinatorAgent: AgentStatus = {
    id: 'coordinator',
    name: 'Coordinator Agent',
    role: 'Multi-Agent Arbiter & Consensus Synthesizer',
    iconName: 'Network',
    state: 'CONSENSUS_REACHED',
    lastInputSummary: `Soil: ${soilAgent.urgency}, Weather: ${weatherAgent.urgency}, Conservation: ${waterConservationAgent.urgency}`,
    decision: finalDecision,
    confidence: coordinatorConfidence,
    lastAction: 'Issued Unified Actuation Command',
    proposedWaterLiters: consensusWater,
    proposedDelayHours: consensusDelay,
    urgency: 'Low',
    weight: 1.0,
  };

  messages.push({
    id: `msg-5`,
    timestamp: now,
    fromAgent: 'coordinator',
    toAgent: 'all',
    message: finalDecision,
    sentiment: 'approval',
  });

  const consensus: AgentConsensus = {
    finalDecision,
    consensusDurationMinutes: consensusDuration,
    consensusWaterLiters: consensusWater,
    consensusDelayHours: consensusDelay,
    confidence: coordinatorConfidence,
    agreementRate,
    summary: `Multi-agent negotiation finalized across 4 domain agents with ${agreementRate}% consensus.`,
    timestamp: now,
  };

  return {
    agents: {
      soil: soilAgent,
      weather: weatherAgent,
      conservation: waterConservationAgent,
      irrigation: irrigationAgent,
      coordinator: coordinatorAgent,
    },
    messages,
    consensus,
  };
}
