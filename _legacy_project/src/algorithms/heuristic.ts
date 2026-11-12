import { SearchState } from '../types';
import { IrrigationSearchProblem } from './problem';

/**
 * Heuristic Function h(n):
 * Estimates the remaining cost to achieve an acceptable soil moisture band
 * through the end of the planning horizon while minimizing water waste.
 *
 * Factors:
 * 1. Moisture deficit distance: How far current moisture is below the safe threshold.
 * 2. Rain discounting: If rain probability is high, expected external moisture decreases the estimated irrigation cost needed.
 * 3. Remaining horizon steps: Steps remaining that will experience evapotranspiration depletion.
 *
 * For A* search:
 * f(n) = g(n) + h(n)
 * where g(n) = accumulated path cost so far (water applied + past stress penalties)
 *       h(n) = heuristic lower-bound estimate of remaining cost to reach safe horizon goal
 */
export function calculateHeuristic(
  state: SearchState,
  problem: IrrigationSearchProblem
): number {
  const remainingHours = Math.max(0, problem.horizonHours - state.step);
  if (remainingHours <= 0) {
    // At horizon: cost is solely remaining deficit penalty if any
    const finalDeficit = Math.max(0, problem.targetMoistureMin - state.moisture);
    return Number((finalDeficit * 6).toFixed(2));
  }

  // 1. Current Deficit component
  const currentDeficit = Math.max(0, problem.targetMoistureMin - state.moisture);

  // 2. Future natural depletion anticipated:
  const futureDepletion = remainingHours * problem.hourlyDepletionRate;
  
  // 3. Rain offset factor: (1 - P_rain)
  const rainDiscount = 1 - (problem.rainProbability / 100) * 0.7;

  // 4. Net projected deficit needed to refill
  const projectedDeficit = Math.max(0, (currentDeficit + futureDepletion * 0.5) * rainDiscount);

  // Scaled heuristic cost
  // Admissible lower bound estimation
  const hValue = projectedDeficit * 2.5 + (remainingHours / problem.stepHours) * 0.5;

  return Number(Math.max(0, hValue).toFixed(2));
}

export function getHeuristicExplanation(
  state: SearchState,
  problem: IrrigationSearchProblem,
  gCost: number,
  hCost: number
): {
  formula: string;
  gExplanation: string;
  hExplanation: string;
  fExplanation: string;
  breakdown: string[];
} {
  const fCost = Number((gCost + hCost).toFixed(2));
  const remainingHours = Math.max(0, problem.horizonHours - state.step);

  return {
    formula: `f(n) = g(n) + h(n) = ${gCost.toFixed(2)} + ${hCost.toFixed(2)} = ${fCost.toFixed(2)}`,
    gExplanation: `g(n) = ${gCost.toFixed(2)}: Actual cost incurred so far (Water consumed: ${state.waterUsedLiters.toLocaleString()} L, Stress hours: ${state.stressHours}h).`,
    hExplanation: `h(n) = ${hCost.toFixed(2)}: Estimated remaining cost to sustain root-zone moisture safely through the remaining ${remainingHours} hours.`,
    fExplanation: `f(n) = ${fCost.toFixed(2)}: Total evaluation function used to guide search order.`,
    breakdown: [
      `Current Moisture: ${state.moisture}% (Target Safe Band: [${problem.targetMoistureMin}%, ${problem.targetMoistureMax}%])`,
      `Anticipated 4-hour ETc Depletion: -${(problem.hourlyDepletionRate * problem.stepHours).toFixed(1)}%`,
      `Forecasted Rain Discount: ${problem.rainProbability}% probability attenuates estimated water demand by ${((problem.rainProbability * 0.7)).toFixed(0)}%`,
      `Remaining Horizon: ${remainingHours} hours (${Math.ceil(remainingHours / problem.stepHours)} decision intervals remaining)`,
    ],
  };
}
