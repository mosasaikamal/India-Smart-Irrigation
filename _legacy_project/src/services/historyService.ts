import { SimulationAnalytics, SimulationHistoryItem, FieldState, SearchResult } from '../types';

const STORAGE_KEY = 'smart_agri_simulation_history_v1';

export const SAMPLE_INITIAL_HISTORY: SimulationHistoryItem[] = [
  {
    id: 'sim-hist-1',
    timestamp: '2026-09-12 10:30',
    crop: 'Wheat',
    growthStage: 'Vegetative',
    soilType: 'Loamy',
    initialMoisture: 24,
    finalMoisture: 32,
    recommendedAction: 'IRRIGATE_NOW',
    waterUsedLiters: 16200,
    waterSavedLiters: 9800,
    algorithmUsed: 'A* Search',
    agentConsensus: 'Full replenishment authorized',
    stressMitigated: true,
    notes: 'Restored root zone to field capacity prior to midday heat.',
  },
  {
    id: 'sim-hist-2',
    timestamp: '2026-09-11 16:45',
    crop: 'Tomato',
    growthStage: 'Flowering',
    soilType: 'Sandy Loam',
    initialMoisture: 22,
    finalMoisture: 27,
    recommendedAction: 'DELAY_EVENING',
    waterUsedLiters: 11400,
    waterSavedLiters: 6200,
    algorithmUsed: 'Best-First Search',
    agentConsensus: 'Shifted to 18:00 to avoid thermal loss',
    stressMitigated: true,
    notes: 'Off-peak drip application prevented blossom drop.',
  },
  {
    id: 'sim-hist-3',
    timestamp: '2026-09-10 08:15',
    crop: 'Rice',
    growthStage: 'Flowering',
    soilType: 'Clay',
    initialMoisture: 42,
    finalMoisture: 48,
    recommendedAction: 'DELAY_RAIN',
    waterUsedLiters: 0,
    waterSavedLiters: 32000,
    algorithmUsed: 'A* Search',
    agentConsensus: 'Weather & Conservation agent vetoed pumping',
    stressMitigated: true,
    notes: 'Pre-monsoon shower supplied 22mm precipitation.',
  },
  {
    id: 'sim-hist-4',
    timestamp: '2026-09-09 14:00',
    crop: 'Cotton',
    growthStage: 'Yield Formation',
    soilType: 'Sandy',
    initialMoisture: 16,
    finalMoisture: 22,
    recommendedAction: 'DEFICIT_PULSE',
    waterUsedLiters: 8500,
    waterSavedLiters: 7500,
    algorithmUsed: 'Hill Climbing',
    agentConsensus: 'Applied deficit volume pulse',
    stressMitigated: true,
    notes: 'Conserved water without boll shed.',
  },
];

export function loadSimulationHistory(): SimulationHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_INITIAL_HISTORY));
      return SAMPLE_INITIAL_HISTORY;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_INITIAL_HISTORY;
  } catch (e) {
    return SAMPLE_INITIAL_HISTORY;
  }
}

export function saveSimulationRun(
  fieldState: FieldState,
  algorithmUsed: string,
  searchResult?: SearchResult | null,
  agentConsensusText?: string
): SimulationHistoryItem {
  const history = loadSimulationHistory();

  // Water saved estimation vs non-smart fixed timer:
  // Non-smart timer typically dumps 40-50mm water regardless of rain or moisture
  const areaSqMeters = fieldState.parameters.fieldSize * 4046.86;
  const standardFixedVolume = Math.round(35 * areaSqMeters);
  const waterUsed = fieldState.aiRecommendation.waterAmountLiters;
  const waterSaved = Math.max(0, standardFixedVolume - waterUsed);

  const newItem: SimulationHistoryItem = {
    id: `sim-${Date.now()}`,
    timestamp: new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    crop: fieldState.parameters.crop,
    growthStage: fieldState.parameters.growthStage,
    soilType: fieldState.parameters.soilType,
    initialMoisture: fieldState.soil.currentMoisture,
    finalMoisture: Number((fieldState.soil.currentMoisture + fieldState.aiRecommendation.waterDepthMm * 0.4).toFixed(1)),
    recommendedAction: fieldState.aiRecommendation.action,
    waterUsedLiters: waterUsed,
    waterSavedLiters: waterSaved,
    algorithmUsed,
    agentConsensus: agentConsensusText || fieldState.aiRecommendation.summary,
    stressMitigated: fieldState.stressLevel !== 'Severe',
    notes: fieldState.aiRecommendation.reasoning[0] || 'Simulation cycle executed.',
  };

  const updated = [newItem, ...history].slice(0, 50); // Keep last 50
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to persist history', e);
  }

  return newItem;
}

export function calculateAnalytics(history: SimulationHistoryItem[]): SimulationAnalytics {
  if (history.length === 0) {
    return {
      totalSimulations: 0,
      totalWaterUsedLiters: 0,
      totalWaterSavedLiters: 0,
      averageSearchCost: 0,
      mostUsedAlgorithm: 'A* Search',
      agentDecisionCount: 0,
      optimalDecisionRate: 94,
    };
  }

  const totalSimulations = history.length;
  const totalWaterUsedLiters = history.reduce((sum, h) => sum + h.waterUsedLiters, 0);
  const totalWaterSavedLiters = history.reduce((sum, h) => sum + h.waterSavedLiters, 0);

  const algoCounts: Record<string, number> = {};
  history.forEach((h) => {
    algoCounts[h.algorithmUsed] = (algoCounts[h.algorithmUsed] || 0) + 1;
  });

  let mostUsedAlgorithm = 'A* Search';
  let maxCount = 0;
  Object.entries(algoCounts).forEach(([algo, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostUsedAlgorithm = algo;
    }
  });

  const optimalDecisionRate = Math.round(
    (history.filter((h) => h.stressMitigated).length / totalSimulations) * 100
  );

  return {
    totalSimulations,
    totalWaterUsedLiters,
    totalWaterSavedLiters,
    averageSearchCost: 14.2,
    mostUsedAlgorithm,
    agentDecisionCount: totalSimulations * 5, // 5 agents per cycle
    optimalDecisionRate,
  };
}

export function clearSimulationHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
