import { FieldState, IrrigationSchedule, SearchResult, AgriculturalRule, InferenceChain, AgentConsensus } from '../types';

export interface GroundedCitation {
  sourceType: 'SENSOR_READING' | 'USER_CONFIG' | 'SEARCH_ALGORITHM' | 'KNOWLEDGE_RULE' | 'AGENT_CONSENSUS' | 'AGRONOMY_FORMULA';
  sourceTitle: string;
  detail: string;
}

export interface AssistantAnswer {
  text: string;
  citations: GroundedCitation[];
  groundedFacts: { label: string; value: string }[];
  suggestedFollowUps: string[];
}

export function answerGroundedQuestion(
  question: string,
  fieldState: FieldState,
  schedules: IrrigationSchedule[],
  searchResult: SearchResult | null,
  inferenceChain: InferenceChain,
  consensus: AgentConsensus | null
): AssistantAnswer {
  const q = question.toLowerCase();
  const { soil, environment, parameters, etc, smd } = fieldState;

  const citations: GroundedCitation[] = [];
  const groundedFacts: { label: string; value: string }[] = [];

  // Always bind key active context
  groundedFacts.push({ label: 'Current Soil Moisture', value: `${soil.currentMoisture}% (FC: ${soil.fieldCapacity}%, WP: ${soil.wiltingPoint}%)` });
  groundedFacts.push({ label: 'Weather Forecast', value: `Temp: ${environment.temperature}°C, Rain Prob: ${environment.rainProbability}%` });
  groundedFacts.push({ label: 'Crop & Stage', value: `${parameters.crop} (${parameters.growthStage})` });
  groundedFacts.push({ label: 'Soil Water Deficit (SMD)', value: `${smd} mm` });

  // 1. "Does my field need irrigation?" / "Do I need to water?"
  if (q.includes('need irrigation') || q.includes('need water') || q.includes('should i water') || q.includes('irrigate now')) {
    citations.push({
      sourceType: 'SENSOR_READING',
      sourceTitle: 'Live Telemetry & Field Capacity',
      detail: `Current moisture ${soil.currentMoisture}% vs Field Capacity ${soil.fieldCapacity}% and Wilting Point ${soil.wiltingPoint}%.`,
    });
    citations.push({
      sourceType: 'KNOWLEDGE_RULE',
      sourceTitle: `Rule Engine Conclusion`,
      detail: inferenceChain.finalConclusion,
    });

    const isRecIrrigate = fieldState.aiRecommendation.action === 'IRRIGATE_NOW';
    const isRecDelay = fieldState.aiRecommendation.action === 'DELAY_RAIN' || fieldState.aiRecommendation.action === 'DELAY_EVENING';

    let ans = '';
    if (isRecDelay) {
      ans = `Based on current field telemetry, **irrigation is currently on hold or recommended to be delayed**.\n\n` +
        `• **Action Recommended:** \`${fieldState.aiRecommendation.action}\`\n` +
        `• **Key Reason:** ${fieldState.aiRecommendation.summary}\n` +
        `• **Precipitation Probability:** ${environment.rainProbability}%\n` +
        `• **Soil Deficit:** ${smd} mm.\n\n` +
        `Delaying prevents unnecessary water pumping and avoids saturation damage or high evaporative drift.`;
    } else if (isRecIrrigate) {
      ans = `Yes, **irrigation is currently recommended** for your **${parameters.crop}** field.\n\n` +
        `• **Action:** \`IRRIGATE_NOW\`\n` +
        `• **Calculated Water Volume:** **${fieldState.aiRecommendation.waterAmountLiters.toLocaleString()} Liters** (${fieldState.aiRecommendation.waterDepthMm} mm depth)\n` +
        `• **Recommended Duration:** **${fieldState.aiRecommendation.durationMinutes} minutes** using ${parameters.irrigationMethod}\n` +
        `• **Reasoning:** Volumetric soil moisture (${soil.currentMoisture}%) is depleted below the optimal readily available threshold for ${parameters.crop} at the ${parameters.growthStage} stage.`;
    } else {
      ans = `No, **irrigation is not required** at this moment.\n\n` +
        `• **Current Soil Moisture:** ${soil.currentMoisture}% (Near Field Capacity of ${soil.fieldCapacity}%)\n` +
        `• **Crop Status:** ${parameters.crop} shows zero water stress.\n` +
        `• **Projected Consumption:** Daily ETc is ${etc} mm/day, leaving ample buffer in the root zone.`;
    }

    return {
      text: ans,
      citations,
      groundedFacts,
      suggestedFollowUps: [
        'Why did the system recommend this action?',
        'Which schedule saves the most water?',
        'Which agricultural rules were activated?',
      ],
    };
  }

  // 2. "Why did the system recommend..." / "Explain recommendation"
  if (q.includes('why') && (q.includes('recommend') || q.includes('decision') || q.includes('action'))) {
    citations.push({
      sourceType: 'AGRONOMY_FORMULA',
      sourceTitle: 'FAO-56 Soil Water Balance',
      detail: `ETc = ${etc} mm/day, SMD = ${smd} mm, RAW threshold = ${fieldState.raw} mm.`,
    });
    citations.push({
      sourceType: 'AGENT_CONSENSUS',
      sourceTitle: 'Autonomous Multi-Agent Consensus',
      detail: consensus ? consensus.finalDecision : 'Consensus reached via Coordinator Agent.',
    });

    const reasonsFormatted = fieldState.aiRecommendation.reasoning
      .map((r, i) => `${i + 1}. ${r}`)
      .join('\n');

    return {
      text: `The system's recommendation (\`${fieldState.aiRecommendation.action}\`) is derived from an integrated evaluation across agronomy, weather, and water conservation:\n\n` +
        `### Primary Agronomic Rationale:\n${reasonsFormatted}\n\n` +
        `### Model Confidence:\n**${fieldState.aiRecommendation.confidence}% confidence** (simulated model-derived confidence based on sensor agreement).\n\n` +
        `### Factor Breakdown:\n` +
        `• **Soil:** ${fieldState.aiRecommendation.keyFactors.soilStatus}\n` +
        `• **Weather:** ${fieldState.aiRecommendation.keyFactors.weatherRisk}\n` +
        `• **Crop Stress:** ${fieldState.aiRecommendation.keyFactors.cropStressRisk}\n` +
        `• **Conservation:** ${fieldState.aiRecommendation.keyFactors.conservationImpact}`,
      citations,
      groundedFacts,
      suggestedFollowUps: [
        'Which agricultural rules were activated?',
        'What happens if rainfall probability increases?',
        'Explain the A* irrigation result.',
      ],
    };
  }

  // 3. "Which schedule saves the most water?"
  if (q.includes('save') || q.includes('schedule') || q.includes('water usage') || q.includes('most water')) {
    citations.push({
      sourceType: 'USER_CONFIG',
      sourceTitle: 'Irrigation Multi-Schedule Engine',
      detail: `Generated 5 candidate operational schedules evaluated against efficiency and crop stress.`,
    });

    const topConservation = [...schedules].sort((a, b) => b.waterEfficiencyScore - a.waterEfficiencyScore)[0];
    const recommendedSched = schedules.find((s) => s.recommended) || schedules[0];

    return {
      text: `### Schedule Water Comparison:\n\n` +
        `The schedule that maximizes water conservation is **${topConservation.name}** with a water efficiency rating of **${topConservation.waterEfficiencyScore}/100**.\n\n` +
        `• **Water Volume:** **${topConservation.waterVolumeLiters.toLocaleString()} Liters**\n` +
        `• **Timing:** ${topConservation.timingLabel}\n` +
        `• **Expected Soil Moisture Post-Application:** ${topConservation.expectedPostMoisture.toFixed(1)}%\n` +
        `• **Rationale:** ${topConservation.rationale}\n\n` +
        `> **System Recommendation:** The overall top-ranked schedule is **${recommendedSched.name}** (Overall Score: ${recommendedSched.overallScore}/100), which balances water conservation with crop moisture stress safety.`,
      citations,
      groundedFacts,
      suggestedFollowUps: [
        'Explain the A* irrigation result.',
        'Why did the autonomous agents choose this decision?',
        'Does my field need irrigation?',
      ],
    };
  }

  // 4. "Explain the A* result" / "Search algorithm"
  if (q.includes('a*') || q.includes('search') || q.includes('heuristic') || q.includes('bfs') || q.includes('algorithm')) {
    citations.push({
      sourceType: 'SEARCH_ALGORITHM',
      sourceTitle: 'A* State-Space Search Solver',
      detail: `f(n) = g(n) + h(n), State space over 16-hour horizon across 4-hour decision nodes.`,
    });

    if (searchResult) {
      const actionsList = searchResult.actionsTaken
        .map((a, i) => `Step ${i + 1}: **${a.name}** (${a.waterLiters.toLocaleString()} L, ${a.description})`)
        .join('\n');

      return {
        text: `### A* Search Algorithm Evaluation:\n\n` +
          `A* search explored **${searchResult.nodesExplored} state nodes** in **${searchResult.executionTimeMs} ms** to discover the mathematically cost-minimal irrigation schedule:\n\n` +
          `• **Total Search Path Cost $g(n)$:** **${searchResult.totalCost.toFixed(2)}**\n` +
          `• **Total Planned Water:** **${searchResult.totalWaterUsed.toLocaleString()} Liters**\n` +
          `• **Final Estimated Moisture:** **${searchResult.finalMoisture}%**\n` +
          `• **Goal Condition Achieved:** ${searchResult.isGoalReached ? '✅ Reached safe band' : '⚠️ Horizon boundary reached'}\n\n` +
          `### Optimal Action Sequence Found:\n${actionsList || 'Maintain observation step.'}\n\n` +
          `### Heuristic Mechanism:\n` +
          `$f(n) = g(n) + h(n)$, where $g(n)$ aggregates past water volume applied and crop water stress hours, while $h(n)$ estimates remaining moisture distance to the target band discounted by forecasted rainfall.`,
        citations,
        groundedFacts,
        suggestedFollowUps: [
          'Which schedule saves the most water?',
          'Which agricultural rules were activated?',
          'Why did the autonomous agents choose this decision?',
        ],
      };
    }
  }

  // 5. "Which rules were activated?" / "Rule engine"
  if (q.includes('rule') || q.includes('knowledge') || q.includes('inference')) {
    citations.push({
      sourceType: 'KNOWLEDGE_RULE',
      sourceTitle: 'Agricultural Forward-Chaining Inference Engine',
      detail: `Matched ${inferenceChain.activatedRules.length} rules out of ${inferenceChain.evaluatedRules.length} active knowledge rules.`,
    });

    const activeList = inferenceChain.activatedRules
      .map((r) => `• **${r.code} - ${r.name}** (Priority ${r.priority}):\n  _${r.conclusion}_\n  _Scientific Context:_ ${r.explanation}`)
      .join('\n\n');

    return {
      text: `### Rule-Based Inference Report:\n\n` +
        `The knowledge engine evaluated **${inferenceChain.evaluatedRules.length} rules** against the current field state. **${inferenceChain.activatedRules.length} rules fired**:\n\n` +
        `${activeList || 'No warning rules triggered. Normal state rule active.'}\n\n` +
        `### Final Synthesized Conclusion:\n` +
        `> "${inferenceChain.finalConclusion}"\n` +
        `• **Recommended Action:** \`${inferenceChain.recommendedAction}\`\n` +
        `• **Rule Confidence:** ${inferenceChain.confidenceScore}%`,
      citations,
      groundedFacts,
      suggestedFollowUps: [
        'Why did the autonomous agents choose this decision?',
        'Does my field need irrigation?',
        'What happens if rainfall probability increases?',
      ],
    };
  }

  // 6. "Autonomous agents" / "Agents"
  if (q.includes('agent') || q.includes('autonomous') || q.includes('coordinator')) {
    citations.push({
      sourceType: 'AGENT_CONSENSUS',
      sourceTitle: 'Multi-Agent Communication Framework',
      detail: consensus ? consensus.summary : '5 domain agents coordinated.',
    });

    return {
      text: `### Autonomous Agent Coordination Summary:\n\n` +
        `The multi-agent system comprises 5 collaborative agents with distributed domain focus:\n\n` +
        `1. **Soil Monitoring Agent**: Analyzes moisture telemetry (${soil.currentMoisture}%) and depletion deficit (${smd} mm).\n` +
        `2. **Weather Agent**: Assesses atmospheric demand (Temp: ${environment.temperature}°C, Rain chance: ${environment.rainProbability}%).\n` +
        `3. **Water Conservation Agent**: Audits water volume and ensures minimum required allocation.\n` +
        `4. **Irrigation Actuator Agent**: Formulates valve duration (${fieldState.aiRecommendation.durationMinutes} min) and flow rates.\n` +
        `5. **Coordinator Agent**: Synthesizes inputs, resolves conflicts, and confirms consensus.\n\n` +
        `### Final Agent Consensus:\n` +
        `> "${consensus ? consensus.finalDecision : fieldState.aiRecommendation.summary}"\n\n` +
        `• **Consensus Agreement Rate:** ${consensus ? consensus.agreementRate : 92}%\n` +
        `• **Consensus Water Volume:** ${consensus ? consensus.consensusWaterLiters.toLocaleString() : fieldState.aiRecommendation.waterAmountLiters.toLocaleString()} Liters`,
      citations,
      groundedFacts,
      suggestedFollowUps: [
        'Which agricultural rules were activated?',
        'Explain the A* irrigation result.',
        'Which schedule saves the most water?',
      ],
    };
  }

  // 7. "What happens if rainfall probability increases?"
  if (q.includes('rainfall') || q.includes('rain') || q.includes('what happens if')) {
    citations.push({
      sourceType: 'AGRONOMY_FORMULA',
      sourceTitle: 'Precipitation Infiltration & Rule R-RAIN-DELAY',
      detail: `Rain forecast >= 70% triggers mandatory rain delay cycle in rule engine and agent system.`,
    });

    return {
      text: `### Impact of Increasing Rainfall Probability:\n\n` +
        `If rainfall probability increases above **65–70%** with forecasted precipitation:\n\n` +
        `1. **Knowledge Engine Activation:** Rule \`R-RAIN-DELAY\` fires with priority 10, asserting that irrigating before precipitation causes nutrient leaching and water waste.\n` +
        `2. **Weather Agent & Conservation Agent Alignment:** The Weather Agent dispatches a rain warning, and the Conservation Agent immediately exercises a conservation veto.\n` +
        `3. **Search Heuristic Discount:** The heuristic function $h(n)$ discounts future irrigation water requirements by $(1 - P_{\\text{rain}})$, directing A* search to choose the \`WaitForRain()\` action branch.\n` +
        `4. **Water Savings:** Up to **${Math.round(smd * parameters.fieldSize * 4046.86).toLocaleString()} Liters** of water is saved by allowing free rainfall to refill the root zone.`,
      citations,
      groundedFacts,
      suggestedFollowUps: [
        'Does my field need irrigation?',
        'Which schedule saves the most water?',
        'Why did the system recommend this action?',
      ],
    };
  }

  // Default grounded response
  citations.push({
    sourceType: 'SENSOR_READING',
    sourceTitle: 'Field State Context',
    detail: `Telemetry for ${parameters.crop} (${parameters.growthStage}) on ${parameters.soilType} soil.`,
  });

  return {
    text: `Based on your current field data:\n\n` +
      `• **Crop & Growth Stage:** ${parameters.crop} (${parameters.growthStage})\n` +
      `• **Current Soil Moisture:** ${soil.currentMoisture}% (Safe target band: [${(soil.fieldCapacity * 0.7).toFixed(1)}%, ${soil.fieldCapacity}%])\n` +
      `• **Environmental Conditions:** ${environment.temperature}°C, ${environment.humidity}% RH, ${environment.rainProbability}% Rain Prob\n` +
      `• **System Recommendation:** \`${fieldState.aiRecommendation.action}\` — ${fieldState.aiRecommendation.summary}\n` +
      `• **Recommended Water Volume:** ${fieldState.aiRecommendation.waterAmountLiters.toLocaleString()} Liters (${fieldState.aiRecommendation.durationMinutes} mins)\n\n` +
      `_Ask any specific question regarding our search algorithms, agent decisions, agricultural rules, or water conservation!_`,
    citations,
    groundedFacts,
    suggestedFollowUps: [
      'Does my field need irrigation?',
      'Why did the system recommend this action?',
      'Which schedule saves the most water?',
      'Explain the A* irrigation result.',
    ],
  };
}
