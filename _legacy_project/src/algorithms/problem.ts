import { SearchAction, SearchState, FieldState } from '../types';

export interface IrrigationSearchProblem {
  initialState: SearchState;
  targetMoistureMin: number;
  targetMoistureMax: number;
  horizonHours: number;
  stepHours: number;
  hourlyDepletionRate: number; // percentage moisture lost per hour due to ETc
  rainProbability: number;
  expectedRainDepthMm: number;
  fieldCapacity: number;
  wiltingPoint: number;
  fieldSizeAcres: number;
  isGoal: (state: SearchState) => boolean;
  getActions: (state: SearchState) => SearchAction[];
  transition: (state: SearchState, action: SearchAction) => SearchState;
}

export function createSearchProblem(fieldState: FieldState): IrrigationSearchProblem {
  const { soil, environment, parameters, etc } = fieldState;
  
  // Calculate hourly moisture loss from crop evapotranspiration (ETc mm/day -> % moisture/hr)
  // 1 mm water depth in root zone (say 1m) ~ 0.1% volumetric moisture
  const rootDepth = 1.0; 
  const hourlyMoistureLoss = Math.max(0.1, (etc / 24) / (rootDepth * 10));

  const targetMin = soil.fieldCapacity - (soil.fieldCapacity - soil.wiltingPoint) * 0.4;
  const targetMax = soil.fieldCapacity;

  const areaSqMeters = parameters.fieldSize * 4046.86;

  const initialState: SearchState = {
    step: 0,
    moisture: soil.currentMoisture,
    waterUsedLiters: 0,
    stressHours: soil.currentMoisture < targetMin ? 1 : 0,
    cost: 0,
  };

  const horizonHours = 16; // 16-hour planning horizon across 4-hour time slots
  const stepHours = 4;

  return {
    initialState,
    targetMoistureMin: Number(targetMin.toFixed(1)),
    targetMoistureMax: Number(targetMax.toFixed(1)),
    horizonHours,
    stepHours,
    hourlyDepletionRate: Number(hourlyMoistureLoss.toFixed(2)),
    rainProbability: environment.rainProbability,
    expectedRainDepthMm: environment.rainfallAmount,
    fieldCapacity: soil.fieldCapacity,
    wiltingPoint: soil.wiltingPoint,
    fieldSizeAcres: parameters.fieldSize,

    isGoal(state: SearchState): boolean {
      // Goal: At or past horizon hours, soil moisture is within acceptable band and stress is low
      return (
        state.step >= horizonHours &&
        state.moisture >= targetMin - 1.5 &&
        state.moisture <= targetMax + 2.0
      );
    },

    getActions(state: SearchState): SearchAction[] {
      if (state.step >= horizonHours) {
        return [];
      }

      const actions: SearchAction[] = [];

      // Action 1: Standard / Full Irrigation (Refill to Field Capacity)
      const fullRefillDepthMm = Math.max(5, (soil.fieldCapacity - state.moisture) * 2.5);
      const fullLiters = Math.round(fullRefillDepthMm * areaSqMeters);
      actions.push({
        id: 'IRRIGATE_FULL',
        name: 'Irrigate Full',
        irrigationDepthMm: Number(fullRefillDepthMm.toFixed(1)),
        delayHours: 0,
        waterLiters: fullLiters,
        description: `Apply ${fullRefillDepthMm.toFixed(0)} mm (${fullLiters.toLocaleString()} L) to restore field capacity.`,
      });

      // Action 2: Deficit / Conservation Pulse (50% water depth)
      const deficitDepthMm = Math.max(3, fullRefillDepthMm * 0.5);
      const deficitLiters = Math.round(deficitDepthMm * areaSqMeters);
      actions.push({
        id: 'IRRIGATE_DEFICIT',
        name: 'Deficit Irrigation',
        irrigationDepthMm: Number(deficitDepthMm.toFixed(1)),
        delayHours: 0,
        waterLiters: deficitLiters,
        description: `Pulse apply ${deficitDepthMm.toFixed(0)} mm (${deficitLiters.toLocaleString()} L) to sustain crop above stress.`,
      });

      // Action 3: Delay Irrigation by 4 Hours
      actions.push({
        id: 'DELAY_4H',
        name: 'Delay 4 Hours',
        irrigationDepthMm: 0,
        delayHours: 4,
        waterLiters: 0,
        description: 'Postpone irrigation by 4 hours to evaluate evaporative trends.',
      });

      // Action 4: Wait for Forecasted Rainfall (if rain prob > 30%)
      if (environment.rainProbability >= 30) {
        actions.push({
          id: 'WAIT_FOR_RAIN',
          name: 'Wait for Rain',
          irrigationDepthMm: 0,
          delayHours: 4,
          waterLiters: 0,
          description: `Wait for anticipated rainfall (${environment.rainProbability}% forecast).`,
        });
      }

      return actions;
    },

    transition(state: SearchState, action: SearchAction): SearchState {
      const nextStep = state.step + stepHours;
      
      // Natural evapotranspiration depletion over the 4-hour window
      const depletion = hourlyMoistureLoss * stepHours;

      // Infiltration from irrigation
      // 1 mm water adds ~ 0.4% moisture
      const irrigationMoistureGain = action.irrigationDepthMm * 0.4;

      // Infiltration from anticipated rain if action was WAIT_FOR_RAIN
      let rainMoistureGain = 0;
      if (action.id === 'WAIT_FOR_RAIN') {
        const effectiveRain = (environment.rainfallAmount || 10) * (environment.rainProbability / 100);
        rainMoistureGain = effectiveRain * 0.35;
      }

      let newMoisture = state.moisture - depletion + irrigationMoistureGain + rainMoistureGain;
      // Cap moisture at field capacity + small saturation margin
      newMoisture = Math.min(soil.fieldCapacity + 3, Math.max(soil.wiltingPoint, newMoisture));
      newMoisture = Number(newMoisture.toFixed(1));

      // Water stress evaluation
      const isStressed = newMoisture < targetMin;
      const addedStressHours = isStressed ? stepHours : 0;

      // Path Cost g(n) Formulation:
      // g(n) penalizes:
      // 1. Water used (scaled to normalized cost: e.g. 1000L = 1 cost unit)
      // 2. Crop stress penalty (heavy penalty for moisture dropping below target or wilting point)
      // 3. Over-irrigation penalty (leaching/runoff if moisture exceeds field capacity)
      const waterCost = action.waterLiters / 2000;
      const stressCost = isStressed ? (targetMin - newMoisture) * 8 : 0;
      const runoffCost = newMoisture > soil.fieldCapacity ? (newMoisture - soil.fieldCapacity) * 5 : 0;

      const stepCost = waterCost + stressCost + runoffCost + 1; // +1 base step cost

      return {
        step: nextStep,
        moisture: newMoisture,
        waterUsedLiters: state.waterUsedLiters + action.waterLiters,
        stressHours: state.stressHours + addedStressHours,
        cost: Number((state.cost + stepCost).toFixed(2)),
      };
    },
  };
}
