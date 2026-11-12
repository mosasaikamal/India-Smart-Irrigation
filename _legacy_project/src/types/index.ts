// Domain types for AI-Based Smart Agriculture Irrigation Planner

export type SoilType = 'Sandy' | 'Loamy' | 'Clay' | 'Sandy Loam';

export type CropType = 'Wheat' | 'Rice' | 'Maize' | 'Tomato' | 'Cotton' | 'Potato';

export type GrowthStage = 'Initial' | 'Vegetative' | 'Flowering' | 'Yield Formation' | 'Ripening';

export type IrrigationMethod = 'Drip' | 'Sprinkler' | 'Furrow' | 'Subsurface';

export type IrrigationStatus =
  | 'OPTIMAL'
  | 'IRRIGATION_REQUIRED'
  | 'IRRIGATION_NOT_REQUIRED'
  | 'SOIL_MOISTURE_LOW'
  | 'RAIN_EXPECTED';

export interface FieldParameters {
  fieldSize: number; // in acres
  soilType: SoilType;
  crop: CropType;
  growthStage: GrowthStage;
  irrigationMethod: IrrigationMethod;
}

export interface EnvironmentalParameters {
  temperature: number; // °C
  humidity: number; // %
  soilMoisture: number; // %
  rainProbability: number; // %
  rainfallAmount: number; // mm expected
  windSpeed: number; // km/h
  solarRadiation?: number; // MJ/m^2/day
}

export interface SoilParameters {
  fieldCapacity: number; // % volumetric (e.g. 30%)
  wiltingPoint: number; // % volumetric (e.g. 12%)
  currentMoisture: number; // %
  waterHoldingCapacity: number; // mm/m
  infiltrationRate: number; // mm/hr
}

export interface AIRecommendation {
  summary: string;
  action: 'IRRIGATE_NOW' | 'DELAY_EVENING' | 'DELAY_RAIN' | 'DEFICIT_PULSE' | 'NO_IRRIGATION';
  durationMinutes: number;
  waterAmountLiters: number;
  waterDepthMm: number;
  optimalTime: string;
  confidence: number; // 0 - 100%
  reasoning: string[];
  keyFactors: {
    soilStatus: string;
    weatherRisk: string;
    cropStressRisk: string;
    conservationImpact: string;
  };
}

export interface FieldState {
  timestamp: string;
  simulationStep: number; // hour count
  parameters: FieldParameters;
  environment: EnvironmentalParameters;
  soil: SoilParameters;
  
  // Agronomic calculated metrics
  et0: number; // Reference evapotranspiration mm/day
  kc: number; // Crop coefficient
  etc: number; // Crop evapotranspiration mm/day (et0 * kc)
  taw: number; // Total Available Water (mm)
  raw: number; // Readily Available Water (mm)
  smd: number; // Soil Moisture Deficit (mm)
  stressLevel: 'None' | 'Mild' | 'Moderate' | 'Severe';

  // Overall status
  irrigationStatus: IrrigationStatus;
  aiRecommendation: AIRecommendation;

  // Water accounting
  cumulativeWaterUsedLiters: number;
  cumulativeWaterSavedLiters: number;
  lastIrrigationTime?: string;
}

export interface IrrigationSchedule {
  id: string;
  name: string;
  description: string;
  startInHours: number;
  durationMinutes: number;
  waterVolumeLiters: number;
  waterDepthMm: number;
  timingLabel: string;
  expectedPostMoisture: number;
  waterEfficiencyScore: number; // 0 - 100
  stressMitigationScore: number; // 0 - 100
  rainSafetyScore: number; // 0 - 100
  overallScore: number; // 0 - 100
  recommended: boolean;
  tag: 'Recommended' | 'Best Conservation' | 'Off-Peak' | 'High Risk' | 'Rain Delay';
  rationale: string;
}

// Search Algorithm Types
export type SearchAlgorithmId = 'bfs' | 'dfs' | 'best-first' | 'hill-climbing' | 'astar';

export interface SearchAction {
  id: string;
  name: string;
  irrigationDepthMm: number;
  delayHours: number;
  waterLiters: number;
  description: string;
}

export interface SearchState {
  step: number; // current hour (0 to 24)
  moisture: number; // percentage
  waterUsedLiters: number;
  stressHours: number;
  cost: number; // accumulated cost g(n)
}

export interface SearchNode {
  id: string;
  parentId: string | null;
  actionTaken: SearchAction | null;
  state: SearchState;
  depth: number;
  gCost: number; // path cost
  hCost: number; // heuristic estimate
  fCost: number; // total evaluation g + h
  expanded: boolean;
  isOptimalPath?: boolean;
}

export interface SearchResult {
  algorithmId: SearchAlgorithmId;
  algorithmName: string;
  nodesExplored: number;
  maxQueueSize: number;
  executionTimeMs: number;
  pathFound: SearchNode[];
  actionsTaken: SearchAction[];
  totalCost: number;
  totalWaterUsed: number;
  finalMoisture: number;
  isGoalReached: boolean;
  heuristicExplanation: string;
  tree: SearchNode[];
}

// Knowledge Base & Inference Types
export type RuleCategory = 'Moisture' | 'Weather' | 'Crop' | 'Temperature' | 'Conservation';

export interface RuleCondition {
  field: string;
  operator: '<' | '<=' | '>' | '>=' | '==' | '!=';
  value: string | number | boolean;
}

export interface AgriculturalRule {
  id: string;
  code: string;
  name: string;
  category: RuleCategory;
  conditions: RuleCondition[];
  conclusion: string;
  action: 'IRRIGATE' | 'DO_NOT_IRRIGATE' | 'DELAY' | 'INCREASE_PRIORITY' | 'DECREASE_WATER';
  priority: number; // 1 (Highest) to 10
  explanation: string;
  active: boolean;
  isCustom?: boolean;
}

export interface RuleEvaluationResult {
  rule: AgriculturalRule;
  triggered: boolean;
  matchedConditions: { condition: RuleCondition; actualValue: any; satisfied: boolean }[];
}

export interface InferenceChain {
  timestamp: string;
  facts: { name: string; value: string | number }[];
  evaluatedRules: RuleEvaluationResult[];
  activatedRules: AgriculturalRule[];
  finalConclusion: string;
  recommendedAction: string;
  confidenceScore: number;
}

// Autonomous Agent Types
export type AgentId = 'soil' | 'weather' | 'irrigation' | 'conservation' | 'coordinator';

export interface AgentStatus {
  id: AgentId;
  name: string;
  role: string;
  iconName: string;
  state: 'MONITORING' | 'EVALUATING' | 'ALERT' | 'CONSENSUS_REACHED' | 'IDLE';
  lastInputSummary: string;
  decision: string;
  confidence: number; // %
  lastAction: string;
  proposedWaterLiters: number;
  proposedDelayHours: number;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  weight: number; // importance weight
}

export interface AgentMessage {
  id: string;
  timestamp: string;
  fromAgent: AgentId;
  toAgent: AgentId | 'all';
  message: string;
  sentiment: 'neutral' | 'caution' | 'urgent' | 'approval';
}

export interface AgentConsensus {
  finalDecision: string;
  consensusDurationMinutes: number;
  consensusWaterLiters: number;
  consensusDelayHours: number;
  confidence: number;
  agreementRate: number; // e.g. 85%
  summary: string;
  timestamp: string;
}

// Edge AI Types
export interface EdgeDeviceMetrics {
  inferenceLatencyMs: number;
  networkBandwidthKbps: number;
  cloudRoundtripLatencyMs: number;
  powerDrawWatts: number;
  memoryFootprintKb: number;
  offlineCapability: boolean;
  privacyRating: 'High (Local Only)' | 'Medium' | 'Low (Cloud Stored)';
  modelSizeKb: number;
}

export interface EdgeInferenceResult {
  mode: 'EDGE' | 'CLOUD';
  prediction: 'IRRIGATE' | 'DO_NOT_IRRIGATE' | 'DELAY';
  confidence: number;
  executionTimeMs: number;
  packetLossRate: number;
  decisionRounds: number;
  sensorReadings: {
    soilMoisture: number;
    temperature: number;
    humidity: number;
    rainDetected: boolean;
  };
}

// Simulation History & Analytics
export interface SimulationHistoryItem {
  id: string;
  timestamp: string;
  crop: CropType;
  growthStage: GrowthStage;
  soilType: SoilType;
  initialMoisture: number;
  finalMoisture: number;
  recommendedAction: string;
  waterUsedLiters: number;
  waterSavedLiters: number;
  algorithmUsed: string;
  agentConsensus: string;
  stressMitigated: boolean;
  notes: string;
}

export interface SimulationAnalytics {
  totalSimulations: number;
  totalWaterUsedLiters: number;
  totalWaterSavedLiters: number;
  averageSearchCost: number;
  mostUsedAlgorithm: string;
  agentDecisionCount: number;
  optimalDecisionRate: number;
}
