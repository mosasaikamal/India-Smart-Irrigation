import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  FieldState,
  FieldParameters,
  EnvironmentalParameters,
  SoilParameters,
  IrrigationSchedule,
  AgriculturalRule,
  InferenceChain,
  SearchAlgorithmId,
  SearchResult,
  SimulationHistoryItem,
  SimulationAnalytics,
} from '../types';
import { SCENARIO_PRESETS, CROP_PROFILES, SOIL_PROFILES } from '../simulation/presets';
import { evaluateFieldCondition } from '../simulation/agronomyCalculations';
import { generateIrrigationSchedules } from '../services/irrigationPlannerService';
import { DEFAULT_AGRICULTURAL_RULES } from '../knowledge/defaultRules';
import { runForwardChainingInference } from '../knowledge/reasoningEngine';
import { MultiAgentSystemState, runMultiAgentCycle } from '../agents/agentSystem';
import { executeSearchAlgorithm, runAllAlgorithmsBenchmark, AlgorithmBenchmarkComparison } from '../algorithms/searchRunner';
import { loadSimulationHistory, saveSimulationRun, calculateAnalytics, clearSimulationHistory } from '../services/historyService';
import { generateInitial24HourTelemetry, TimeSeriesPoint } from '../simulation/timeSeriesData';

interface SimulationContextType {
  fieldState: FieldState;
  timeSeries: TimeSeriesPoint[];
  schedules: IrrigationSchedule[];
  rules: AgriculturalRule[];
  inferenceChain: InferenceChain;
  agentSystem: MultiAgentSystemState;
  currentSearchResult: SearchResult | null;
  algorithmBenchmark: AlgorithmBenchmarkComparison | null;
  history: SimulationHistoryItem[];
  analytics: SimulationAnalytics;
  
  // Simulation Clock
  isRunning: boolean;
  simSpeed: number; // 1x, 2x, 5x
  currentSimulationHour: number;
  
  // Navigation & Modes
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (val: boolean) => void;
  isAIDetailsOpen: boolean;
  setIsAIDetailsOpen: (val: boolean) => void;
  educationalMode: boolean;
  setEducationalMode: (val: boolean) => void;

  // Actions
  updateFieldParameters: (params: Partial<FieldParameters>) => void;
  updateEnvironmentalParameters: (params: Partial<EnvironmentalParameters>) => void;
  updateSoilParameters: (params: Partial<SoilParameters>) => void;
  loadScenarioPreset: (presetId: string) => void;
  runSimulation: () => void;
  stepSimulationForward: (hours: number) => void;
  toggleSimulationClock: () => void;
  setSimSpeed: (speed: number) => void;
  resetSimulation: () => void;
  runAlgorithmSearch: (algorithmId: SearchAlgorithmId) => SearchResult;
  runAllBenchmarks: () => AlgorithmBenchmarkComparison;
  addRule: (rule: Omit<AgriculturalRule, 'id'>) => void;
  toggleRule: (ruleId: string) => void;
  deleteRule: (ruleId: string) => void;
  restoreDefaultRules: () => void;
  loadHistoryRun: (item: SimulationHistoryItem) => void;
  clearHistory: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Initial State from Default Preset
  const defaultPreset = SCENARIO_PRESETS[0];

  const buildInitialFieldState = (): FieldState => {
    const agronomy = evaluateFieldCondition(
      defaultPreset.fieldParams,
      defaultPreset.envParams,
      defaultPreset.soilParams
    );

    return {
      timestamp: new Date().toLocaleTimeString(),
      simulationStep: 0,
      parameters: defaultPreset.fieldParams,
      environment: defaultPreset.envParams,
      soil: defaultPreset.soilParams,
      et0: agronomy.et0,
      kc: agronomy.kc,
      etc: agronomy.etc,
      taw: agronomy.taw,
      raw: agronomy.raw,
      smd: agronomy.smd,
      stressLevel: agronomy.stressLevel,
      irrigationStatus: agronomy.irrigationStatus,
      aiRecommendation: agronomy.aiRecommendation,
      cumulativeWaterUsedLiters: 16000,
      cumulativeWaterSavedLiters: 28400,
    };
  };

  const [fieldState, setFieldState] = useState<FieldState>(buildInitialFieldState);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>(() => generateInitial24HourTelemetry(buildInitialFieldState()));
  const [rules, setRules] = useState<AgriculturalRule[]>(() => {
    const savedRules = localStorage.getItem('smart_agri_rules_v1');
    if (savedRules) {
      try {
        return JSON.parse(savedRules);
      } catch (e) {
        return DEFAULT_AGRICULTURAL_RULES;
      }
    }
    return DEFAULT_AGRICULTURAL_RULES;
  });

  const [inferenceChain, setInferenceChain] = useState<InferenceChain>(() =>
    runForwardChainingInference(buildInitialFieldState(), DEFAULT_AGRICULTURAL_RULES)
  );

  const [schedules, setSchedules] = useState<IrrigationSchedule[]>(() =>
    generateIrrigationSchedules(buildInitialFieldState())
  );

  const [agentSystem, setAgentSystem] = useState<MultiAgentSystemState>(() =>
    runMultiAgentCycle(buildInitialFieldState())
  );

  const [currentSearchResult, setCurrentSearchResult] = useState<SearchResult | null>(() =>
    executeSearchAlgorithm('astar', buildInitialFieldState())
  );

  const [algorithmBenchmark, setAlgorithmBenchmark] = useState<AlgorithmBenchmarkComparison | null>(null);

  const [history, setHistory] = useState<SimulationHistoryItem[]>(() => loadSimulationHistory());
  const [analytics, setAnalytics] = useState<SimulationAnalytics>(() => calculateAnalytics(loadSimulationHistory()));

  // Clock & Navigation
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simSpeed, setSimSpeedState] = useState<number>(1);
  const [currentSimulationHour, setCurrentSimulationHour] = useState<number>(14);
  const [activeTab, setActiveTabState] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [isAIDetailsOpen, setIsAIDetailsOpen] = useState<boolean>(false);
  const [educationalMode, setEducationalMode] = useState<boolean>(false);

  const setActiveTab = useCallback((tab: string) => {
    setActiveTabState(tab);
    setMobileSidebarOpen(false);
  }, []);

  // Helper to recompute entire system pipeline given new field parameters
  const recomputeSystem = useCallback((
    newFieldParams: FieldParameters,
    newEnvParams: EnvironmentalParameters,
    newSoilParams: SoilParameters,
    prevCumulativeUsed: number = 0,
    prevCumulativeSaved: number = 0,
    simHour: number = 14
  ) => {
    const agronomy = evaluateFieldCondition(newFieldParams, newEnvParams, newSoilParams);

    const updatedState: FieldState = {
      timestamp: new Date().toLocaleTimeString(),
      simulationStep: simHour,
      parameters: newFieldParams,
      environment: newEnvParams,
      soil: newSoilParams,
      et0: agronomy.et0,
      kc: agronomy.kc,
      etc: agronomy.etc,
      taw: agronomy.taw,
      raw: agronomy.raw,
      smd: agronomy.smd,
      stressLevel: agronomy.stressLevel,
      irrigationStatus: agronomy.irrigationStatus,
      aiRecommendation: agronomy.aiRecommendation,
      cumulativeWaterUsedLiters: prevCumulativeUsed,
      cumulativeWaterSavedLiters: prevCumulativeSaved,
    };

    setFieldState(updatedState);

    const newSchedules = generateIrrigationSchedules(updatedState);
    setSchedules(newSchedules);

    const newInference = runForwardChainingInference(updatedState, rules);
    setInferenceChain(newInference);

    const newAgents = runMultiAgentCycle(updatedState);
    setAgentSystem(newAgents);

    const newSearch = executeSearchAlgorithm('astar', updatedState);
    setCurrentSearchResult(newSearch);

    return updatedState;
  }, [rules]);

  // Update Field Parameters
  const updateFieldParameters = useCallback((params: Partial<FieldParameters>) => {
    setFieldState((prev) => {
      const newParams = { ...prev.parameters, ...params };
      // Update soil profile defaults if soilType changed
      let newSoil = { ...prev.soil };
      if (params.soilType && params.soilType !== prev.parameters.soilType) {
        const p = SOIL_PROFILES[params.soilType];
        newSoil = {
          fieldCapacity: p.fieldCapacity,
          wiltingPoint: p.wiltingPoint,
          currentMoisture: Math.min(p.fieldCapacity, Math.max(p.wiltingPoint, prev.soil.currentMoisture)),
          waterHoldingCapacity: p.waterHoldingCapacity,
          infiltrationRate: p.infiltrationRateMmHr,
        };
      }
      return recomputeSystem(newParams, prev.environment, newSoil, prev.cumulativeWaterUsedLiters, prev.cumulativeWaterSavedLiters, currentSimulationHour);
    });
  }, [recomputeSystem, currentSimulationHour]);

  // Update Environmental Parameters
  const updateEnvironmentalParameters = useCallback((params: Partial<EnvironmentalParameters>) => {
    setFieldState((prev) => {
      const newEnv = { ...prev.environment, ...params };
      // Also sync current moisture if updated
      let newSoil = { ...prev.soil };
      if (params.soilMoisture !== undefined) {
        newSoil.currentMoisture = params.soilMoisture;
      }
      return recomputeSystem(prev.parameters, newEnv, newSoil, prev.cumulativeWaterUsedLiters, prev.cumulativeWaterSavedLiters, currentSimulationHour);
    });
  }, [recomputeSystem, currentSimulationHour]);

  // Update Soil Parameters
  const updateSoilParameters = useCallback((params: Partial<SoilParameters>) => {
    setFieldState((prev) => {
      const newSoil = { ...prev.soil, ...params };
      let newEnv = { ...prev.environment };
      if (params.currentMoisture !== undefined) {
        newEnv.soilMoisture = params.currentMoisture;
      }
      return recomputeSystem(prev.parameters, newEnv, newSoil, prev.cumulativeWaterUsedLiters, prev.cumulativeWaterSavedLiters, currentSimulationHour);
    });
  }, [recomputeSystem, currentSimulationHour]);

  // Load Preset
  const loadScenarioPreset = useCallback((presetId: string) => {
    const preset = SCENARIO_PRESETS.find((p) => p.id === presetId) || SCENARIO_PRESETS[0];
    recomputeSystem(preset.fieldParams, preset.envParams, preset.soilParams, 16000, 28400, 14);
    setTimeSeries(generateInitial24HourTelemetry(buildInitialFieldState()));
  }, [recomputeSystem]);

  // Run Manual Simulation
  const runSimulation = useCallback(() => {
    const updated = recomputeSystem(
      fieldState.parameters,
      fieldState.environment,
      fieldState.soil,
      fieldState.cumulativeWaterUsedLiters,
      fieldState.cumulativeWaterSavedLiters,
      currentSimulationHour
    );

    // Save to history
    const historyItem = saveSimulationRun(
      updated,
      'A* Search',
      currentSearchResult,
      agentSystem.consensus.finalDecision
    );

    const updatedHistory = [historyItem, ...history].slice(0, 50);
    setHistory(updatedHistory);
    setAnalytics(calculateAnalytics(updatedHistory));
  }, [fieldState, recomputeSystem, currentSimulationHour, currentSearchResult, agentSystem, history]);

  // Step Simulation Forward (Time progression)
  const stepSimulationForward = useCallback((hours: number) => {
    setCurrentSimulationHour((prevHour) => {
      const nextHour = (prevHour + hours) % 24;

      setFieldState((prev) => {
        // Temperature diurnal adjustment: peaks at 14:00, trough at 05:00
        const tempBase = 28;
        const tempVariation = Math.sin(((nextHour - 8) / 24) * 2 * Math.PI) * 6;
        const newTemp = Math.round(tempBase + tempVariation);
        const newHumidity = Math.min(95, Math.max(25, Math.round(60 - tempVariation * 3)));

        // Hourly depletion
        const hourlyLoss = (prev.etc / 24) * 0.15;
        let newMoisture = prev.soil.currentMoisture - (hourlyLoss * hours);

        // Water accounting if irrigation active or rain occurs
        let waterUsedStep = 0;
        let waterSavedStep = 0;

        if (prev.environment.rainProbability >= 75 && Math.random() > 0.3) {
          // Rain occurs
          const rainMm = prev.environment.rainfallAmount || 15;
          newMoisture += rainMm * 0.3;
          waterSavedStep = Math.round(rainMm * prev.parameters.fieldSize * 4046.86);
        } else if (prev.aiRecommendation.action === 'IRRIGATE_NOW') {
          // Virtual irrigation application
          newMoisture += prev.aiRecommendation.waterDepthMm * 0.4;
          waterUsedStep = prev.aiRecommendation.waterAmountLiters;
        }

        // Clamp moisture between WP and FC + 2
        newMoisture = Math.min(prev.soil.fieldCapacity + 2, Math.max(prev.soil.wiltingPoint, Number(newMoisture.toFixed(1))));

        const newEnv: EnvironmentalParameters = {
          ...prev.environment,
          temperature: newTemp,
          humidity: newHumidity,
          soilMoisture: newMoisture,
        };

        const newSoil: SoilParameters = {
          ...prev.soil,
          currentMoisture: newMoisture,
        };

        const updated = recomputeSystem(
          prev.parameters,
          newEnv,
          newSoil,
          prev.cumulativeWaterUsedLiters + waterUsedStep,
          prev.cumulativeWaterSavedLiters + waterSavedStep,
          nextHour
        );

        // Append to timeSeries
        setTimeSeries((prevSeries) => {
          const newPoint: TimeSeriesPoint = {
            hourLabel: `${nextHour.toString().padStart(2, '0')}:00`,
            hour: nextHour,
            soilMoisture: newMoisture,
            temperature: newTemp,
            humidity: newHumidity,
            rainProbability: prev.environment.rainProbability,
            irrigationAppliedMm: waterUsedStep > 0 ? prev.aiRecommendation.waterDepthMm : 0,
            waterConsumedLiters: waterUsedStep,
          };
          return [...prevSeries.slice(1), newPoint];
        });

        return updated;
      });

      return nextHour;
    });
  }, [recomputeSystem]);

  // Toggle Clock
  const toggleSimulationClock = () => {
    setIsRunning((prev) => !prev);
  };

  const setSimSpeed = (speed: number) => {
    setSimSpeedState(speed);
  };

  // Clock tick interval
  useEffect(() => {
    if (!isRunning) return;
    const intervalMs = Math.max(500, 2500 / simSpeed);
    const interval = setInterval(() => {
      stepSimulationForward(1);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [isRunning, simSpeed, stepSimulationForward]);

  // Reset Simulation
  const resetSimulation = () => {
    setIsRunning(false);
    loadScenarioPreset('default-wheat');
  };

  // Run Search Algorithm
  const runAlgorithmSearch = useCallback((algorithmId: SearchAlgorithmId): SearchResult => {
    const res = executeSearchAlgorithm(algorithmId, fieldState);
    setCurrentSearchResult(res);
    return res;
  }, [fieldState]);

  // Run All Benchmarks
  const runAllBenchmarks = useCallback((): AlgorithmBenchmarkComparison => {
    const comparison = runAllAlgorithmsBenchmark(fieldState);
    setAlgorithmBenchmark(comparison);
    return comparison;
  }, [fieldState]);

  // Rule management
  const addRule = (newRuleData: Omit<AgriculturalRule, 'id'>) => {
    const newRule: AgriculturalRule = {
      ...newRuleData,
      id: `rule-custom-${Date.now()}`,
      isCustom: true,
    };
    const updated = [...rules, newRule];
    setRules(updated);
    localStorage.setItem('smart_agri_rules_v1', JSON.stringify(updated));
    setInferenceChain(runForwardChainingInference(fieldState, updated));
  };

  const toggleRule = (ruleId: string) => {
    const updated = rules.map((r) => (r.id === ruleId ? { ...r, active: !r.active } : r));
    setRules(updated);
    localStorage.setItem('smart_agri_rules_v1', JSON.stringify(updated));
    setInferenceChain(runForwardChainingInference(fieldState, updated));
  };

  const deleteRule = (ruleId: string) => {
    const updated = rules.filter((r) => r.id !== ruleId);
    setRules(updated);
    localStorage.setItem('smart_agri_rules_v1', JSON.stringify(updated));
    setInferenceChain(runForwardChainingInference(fieldState, updated));
  };

  const restoreDefaultRules = () => {
    setRules(DEFAULT_AGRICULTURAL_RULES);
    localStorage.setItem('smart_agri_rules_v1', JSON.stringify(DEFAULT_AGRICULTURAL_RULES));
    setInferenceChain(runForwardChainingInference(fieldState, DEFAULT_AGRICULTURAL_RULES));
  };

  const loadHistoryRun = (item: SimulationHistoryItem) => {
    // Find matching preset crop or update current
    updateFieldParameters({ crop: item.crop, soilType: item.soilType });
    updateEnvironmentalParameters({ soilMoisture: item.initialMoisture });
    setActiveTab('dashboard');
  };

  const clearHistory = () => {
    clearSimulationHistory();
    setHistory([]);
    setAnalytics(calculateAnalytics([]));
  };

  return (
    <SimulationContext.Provider
      value={{
        fieldState,
        timeSeries,
        schedules,
        rules,
        inferenceChain,
        agentSystem,
        currentSearchResult,
        algorithmBenchmark,
        history,
        analytics,
        isRunning,
        simSpeed,
        currentSimulationHour,
        activeTab,
        setActiveTab,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        isAIDetailsOpen,
        setIsAIDetailsOpen,
        educationalMode,
        setEducationalMode,
        updateFieldParameters,
        updateEnvironmentalParameters,
        updateSoilParameters,
        loadScenarioPreset,
        runSimulation,
        stepSimulationForward,
        toggleSimulationClock,
        setSimSpeed,
        resetSimulation,
        runAlgorithmSearch,
        runAllBenchmarks,
        addRule,
        toggleRule,
        deleteRule,
        restoreDefaultRules,
        loadHistoryRun,
        clearHistory,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = (): SimulationContextType => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
