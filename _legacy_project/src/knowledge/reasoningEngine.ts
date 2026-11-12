import { AgriculturalRule, FieldState, InferenceChain, RuleCondition, RuleEvaluationResult } from '../types';

export function extractFactsFromFieldState(fieldState: FieldState): Record<string, any> {
  return {
    soilMoisture: fieldState.soil.currentMoisture,
    temperature: fieldState.environment.temperature,
    humidity: fieldState.environment.humidity,
    rainProbability: fieldState.environment.rainProbability,
    rainfallAmount: fieldState.environment.rainfallAmount,
    windSpeed: fieldState.environment.windSpeed,
    crop: fieldState.parameters.crop,
    growthStage: fieldState.parameters.growthStage,
    soilType: fieldState.parameters.soilType,
    fieldCapacity: fieldState.soil.fieldCapacity,
    wiltingPoint: fieldState.soil.wiltingPoint,
    et0: fieldState.et0,
    etc: fieldState.etc,
    stressLevel: fieldState.stressLevel,
  };
}

export function evaluateCondition(condition: RuleCondition, actualValue: any): boolean {
  if (actualValue === undefined || actualValue === null) {
    return false;
  }

  const { operator, value } = condition;

  switch (operator) {
    case '<':
      return Number(actualValue) < Number(value);
    case '<=':
      return Number(actualValue) <= Number(value);
    case '>':
      return Number(actualValue) > Number(value);
    case '>=':
      return Number(actualValue) >= Number(value);
    case '==':
      return String(actualValue).toLowerCase() === String(value).toLowerCase();
    case '!=':
      return String(actualValue).toLowerCase() !== String(value).toLowerCase();
    default:
      return false;
  }
}

export function runForwardChainingInference(
  fieldState: FieldState,
  rules: AgriculturalRule[]
): InferenceChain {
  const factsMap = extractFactsFromFieldState(fieldState);
  
  const factsList = Object.entries(factsMap).map(([k, v]) => ({
    name: k,
    value: typeof v === 'number' ? Number(v.toFixed ? v.toFixed(1) : v) : String(v),
  }));

  const activeRules = rules.filter((r) => r.active);
  const evaluatedRules: RuleEvaluationResult[] = [];
  const activatedRules: AgriculturalRule[] = [];

  for (const rule of activeRules) {
    const conditionResults = rule.conditions.map((cond) => {
      const actualVal = factsMap[cond.field];
      const satisfied = evaluateCondition(cond, actualVal);
      return {
        condition: cond,
        actualValue: actualVal,
        satisfied,
      };
    });

    const allSatisfied = conditionResults.every((c) => c.satisfied);
    evaluatedRules.push({
      rule,
      triggered: allSatisfied,
      matchedConditions: conditionResults,
    });

    if (allSatisfied) {
      activatedRules.push(rule);
    }
  }

  // Conflict Resolution: Sort activated rules by priority (highest first)
  activatedRules.sort((a, b) => b.priority - a.priority);

  let finalConclusion = 'Field state is within normal agronomic bounds. Standard routine monitoring maintained.';
  let recommendedAction = 'DO_NOT_IRRIGATE';
  let confidenceScore = 80;

  if (activatedRules.length > 0) {
    const dominantRule = activatedRules[0];
    finalConclusion = `${dominantRule.conclusion} [Fired dominant rule ${dominantRule.code} (Priority ${dominantRule.priority})]`;
    recommendedAction = dominantRule.action;
    confidenceScore = Math.min(98, 75 + activatedRules.length * 5);
  }

  return {
    timestamp: new Date().toLocaleTimeString(),
    facts: factsList,
    evaluatedRules,
    activatedRules,
    finalConclusion,
    recommendedAction,
    confidenceScore,
  };
}
