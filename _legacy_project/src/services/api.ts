// API client connecting React frontend to FastAPI backend

const BASE_URL = 'http://localhost:8000/api';

export interface FieldDto {
  id: string;
  name: string;
  area_ha: number;
  crop_type: string;
  growth_stage: string;
  soil_type: string;
  root_depth_m: number;
  volumetric_moisture: number;
  field_capacity: number;
  wilting_point: number;
  allowable_depletion_fraction: number;
  application_efficiency: number;
  pump_capacity_m3h: number;
  temperature_c: number;
  relative_humidity: number;
  wind_speed_ms: number;
  solar_radiation_mj: number;
  rainfall_mm: number;
  current_depletion_mm: number;
  latitude: number;
  longitude: number;
  location_name: string;
  weather_source: string;
  created_at: string;
  updated_at: string;
}

export interface CropProfileDto {
  id: number;
  crop_name: string;
  initial_kc: number;
  mid_kc: number;
  end_kc: number;
  max_root_depth_m: number;
  default_p: number;
  description?: string;
}

export interface SoilProfileDto {
  id: number;
  soil_name: string;
  field_capacity_pct: number;
  wilting_point_pct: number;
  infiltration_rate_mmh: number;
  description?: string;
}

export interface IrrigationRequirementDto {
  field_id: string;
  area_ha: number;
  current_depletion_dr_mm: number;
  taw_mm: number;
  raw_mm: number;
  application_efficiency: number;
  pump_capacity_m3h: number;
  net_irrigation_depth_mm: number;
  gross_irrigation_depth_mm: number;
  irrigation_water_volume_m3: number;
  irrigation_water_volume_liters: number;
  pump_operating_time_hours: number;
  formula_audit: Record<string, string>;
  intermediate_values: Record<string, number>;
  recommendation_tier: 'NO_IRRIGATION' | 'WATCH' | 'RECOMMENDED' | 'CRITICAL';
}

export interface DailyForecastDto {
  date: string;
  day_name: string;
  temp_max_c: number;
  temp_min_c: number;
  temp_mean_c: number;
  relative_humidity_pct: number;
  wind_speed_ms: number;
  solar_radiation_mj: number;
  precipitation_mm: number;
  precipitation_probability_pct: number;
  calculated_et0_mm: number;
  et0_method: string;
}

export interface WeatherResponseDto {
  location_name: string;
  latitude: number;
  longitude: number;
  source: string;
  last_sync_timestamp: string;
  is_live: boolean;
  current_temp_c: number;
  current_humidity_pct: number;
  current_wind_speed_ms: number;
  current_rainfall_mm: number;
  forecast: DailyForecastDto[];
  warning_message?: string | null;
  elevation_m?: number;
}


export interface ScheduleDayPlanDto {
  day: number;
  date: string;
  action_type: string;
  irrigation_depth_gross_mm: number;
  irrigation_depth_net_mm: number;
  water_volume_m3: number;
  pump_hours: number;
  forecast_rain_mm: number;
  predicted_et0_mm: number;
  predicted_dr_mm: number;
  predicted_ks: number;
  soil_status: string;
}

export interface AlternativeScheduleDto {
  name: string;
  description: string;
  total_water_m3: number;
  total_stress_index: number;
  cost_score: number;
  daily_depths_mm: number[];
}

export interface BeamSearchResponseDto {
  field_id: string;
  algorithm: string;
  beam_width: number;
  horizon_days: number;
  nodes_explored: number;
  recommended_schedule: ScheduleDayPlanDto[];
  alternative_schedules: AlternativeScheduleDto[];
  total_water_m3: number;
  total_stress_index: number;
  objective_score: number;
  baseline_water_m3: number;
  water_savings_m3: number;
  water_savings_pct: number;
  selection_reason: string;
  hard_constraints_satisfied: string[];
}

export interface RuleDto {
  id: string;
  code: string;
  name: string;
  category: string;
  conditions: Array<{ field: string; operator: string; value: any }>;
  conclusion: string;
  action: string;
  priority: number;
  is_active: boolean;
  explanation: string;
}

export interface RuleTraceDto {
  field_id: string;
  timestamp: string;
  facts_evaluated: Record<string, any>;
  rules_fired: Array<{
    rule_id: string;
    code: string;
    name: string;
    category: string;
    matched: boolean;
    action: string;
    priority: number;
    matched_conditions: any[];
    explanation: string;
  }>;
  rules_unfired: any[];
  top_recommended_action: string;
  explanation: string;
}

export interface AgentStateDto {
  agent_id: string;
  name: string;
  role: string;
  status: string;
  execution_time_ms: number;
  input_summary: string;
  output_decision: string;
  confidence_score: number;
  urgency: string;
  proposed_action: string;
  proposed_depth_mm: number;
  proposed_volume_m3: number;
  reasoning: string[];
}

export interface AgentMessageDto {
  sender: string;
  recipient: string;
  timestamp: string;
  content: string;
  sentiment: string;
}

export interface BlackboardStateDto {
  run_id: string;
  field_id: string;
  timestamp: string;
  agents: AgentStateDto[];
  messages: AgentMessageDto[];
  supervisor_summary: string;
  conflict_detected: boolean;
  conflict_details?: string;
  conflict_resolution?: string;
  final_action: string;
  final_depth_mm: number;
  final_volume_m3: number;
  pump_hours: number;
  human_approval_required: boolean;
  approval_status: string;
  approved_by?: string;
}

export interface EdgeDeviceDto {
  id: string;
  name: string;
  field_id: string;
  status: string;
  battery_level_pct: number;
  firmware_version: string;
  is_simulated: boolean;
  local_threshold_moisture: number;
  last_heartbeat: string;
  queued_buffer_count: number;
}

export interface AssistantCitationDto {
  category: string;
  label: string;
  value: string;
  source_type: string;
  field_id?: string;
  timestamp?: string;
  calculation_method?: string;
}

export interface AssistantResponseDto {
  field_id: string;
  retrieval_timestamp: string;
  answer: string;
  mode_used: string;
  provider_status?: string;
  is_grounded: boolean;
  unsupported_elements_noted: boolean;
  evidence_citations: AssistantCitationDto[];
  referenced_formulas: string[];
  assumptions_stated: string[];
}

export interface ReportSummaryDto {
  generated_at: string;
  active_fields_count: number;
  total_irrigated_area_ha: number;
  total_water_consumed_m3: number;
  total_water_saved_m3: number;
  average_savings_pct: number;
  field_savings: Array<{
    field_id: string;
    field_name: string;
    crop: string;
    area_ha: number;
    total_water_used_m3: number;
    baseline_water_used_m3: number;
    water_saved_m3: number;
    savings_percentage: number;
  }>;
  soil_moisture_trends: Array<{
    date: string;
    soil_moisture_pct: number;
    depletion_dr_mm: number;
    raw_threshold_mm: number;
    irrigation_supplied_mm: number;
    rainfall_mm: number;
    et0_mm: number;
  }>;
  compliance_notes: string[];
}

// Fetch helper with timeout
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Health
  checkHealth: () => request<{ status: string; service: string; version: string; database: string }>('/health'),

  // Fields
  getFields: () => request<FieldDto[]>('/fields'),
  getField: (id: string) => request<FieldDto>(`/fields/${id}`),
  createField: (data: Partial<FieldDto>) => request<FieldDto>('/fields', { method: 'POST', body: JSON.stringify(data) }),
  updateField: (id: string, data: Partial<FieldDto>) => request<FieldDto>(`/fields/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteField: (id: string) => request<void>(`/fields/${id}`, { method: 'DELETE' }),
  getCropProfiles: () => request<CropProfileDto[]>('/fields/meta/crops'),
  getSoilProfiles: () => request<SoilProfileDto[]>('/fields/meta/soils'),

  // Agronomy & Math
  getRequirement: (fieldId: string) => request<IrrigationRequirementDto>(`/agronomy/requirement/${fieldId}`),
  calculatePenmanMonteith: (data: any) => request<any>('/agronomy/penman-monteith', { method: 'POST', body: JSON.stringify(data) }),
  calculateHargreaves: (data: any) => request<any>('/agronomy/hargreaves', { method: 'POST', body: JSON.stringify(data) }),

  // Weather
  getForecast: (fieldId: string, forceSimulation = false) =>
    request<WeatherResponseDto>(`/weather/forecast/${fieldId}?force_simulation=${forceSimulation}`),
  geocode: (query: string) => request<any>(`/weather/geocode?q=${encodeURIComponent(query)}`),
  setManualWeather: (fieldId: string, data: any) =>
    request<WeatherResponseDto>(`/weather/manual/${fieldId}`, { method: 'POST', body: JSON.stringify(data) }),
  resetLiveWeather: (fieldId: string) =>
    request<WeatherResponseDto>(`/weather/reset-live/${fieldId}`, { method: 'POST' }),

  // Schedules (Beam Search)
  runBeamSearch: (data: {
    field_id: string;
    horizon_days?: number;
    beam_width?: number;
    weight_stress?: number;
    weight_water?: number;
    weight_pumping?: number;
    weight_switching?: number;
    allow_rain_lookahead?: boolean;
  }) => request<BeamSearchResponseDto>('/schedules/beam-search', { method: 'POST', body: JSON.stringify(data) }),

  // Rules
  getRules: () => request<RuleDto[]>('/rules'),
  toggleRule: (ruleId: string) => request<any>(`/rules/toggle/${ruleId}`, { method: 'POST' }),
  evaluateRules: (fieldId: string) => request<RuleTraceDto>(`/rules/evaluate/${fieldId}`, { method: 'POST' }),

  // Autonomous Agents
  runAgents: (fieldId: string) => request<BlackboardStateDto>(`/agents/run/${fieldId}`, { method: 'POST' }),
  approveAgentAction: (data: { run_id: string; approved: boolean; user_name?: string; notes?: string }) =>
    request<any>('/agents/approve', { method: 'POST', body: JSON.stringify(data) }),

  // Edge AI & IoT
  getEdgeDevices: () => request<EdgeDeviceDto[]>('/edge/devices'),
  registerEdgeDevice: (data: any) => request<EdgeDeviceDto>('/edge/register', { method: 'POST', body: JSON.stringify(data) }),
  ingestTelemetry: (data: any) => request<any>('/edge/telemetry', { method: 'POST', body: JSON.stringify(data) }),
  syncOfflineBatch: (data: any) => request<any>('/edge/sync-offline', { method: 'POST', body: JSON.stringify(data) }),
  toggleSimulationConnection: (deviceId: string, connected: boolean) =>
    request<any>(`/edge/toggle-simulation?device_id=${deviceId}&connected=${connected}`, { method: 'POST' }),
  tickSimulation: (deviceId: string, overrides?: any) =>
    request<any>(`/edge/tick-simulation/${deviceId}`, { method: 'POST', body: JSON.stringify(overrides || {}) }),
  resetSimulation: (deviceId: string) =>
    request<any>(`/edge/reset-simulation/${deviceId}`, { method: 'POST' }),
  publishMqtt: (data: any) =>
    request<any>('/edge/mqtt/publish', { method: 'POST', body: JSON.stringify(data) }),
  getMqttConfig: () =>
    request<any>('/edge/mqtt/config'),


  // Grounded AI Assistant
  queryAssistant: (data: { field_id: string; query: string; mode_preference?: string }) =>
    request<AssistantResponseDto>('/assistant/query', { method: 'POST', body: JSON.stringify(data) }),

  // Analytics & Reports
  getReportsSummary: () => request<ReportSummaryDto>('/reports/summary'),
  getCsvExportUrl: () => `${BASE_URL}/reports/export/csv`,

  // System Settings
  getSettings: () => request<any>('/settings'),
  updateSettings: (data: any) => request<any>('/settings', { method: 'POST', body: JSON.stringify(data) }),
};
