import { FieldState, IrrigationSchedule } from '../types';

export function generateIrrigationSchedules(fieldState: FieldState): IrrigationSchedule[] {
  const { soil, environment, parameters, smd, raw, taw } = fieldState;
  const areaSqMeters = parameters.fieldSize * 4046.86;
  const rainProb = environment.rainProbability;
  const temp = environment.temperature;

  // Base full refill volume
  const fullRefillDepthMm = Math.max(5, smd * 1.1);
  const fullVolumeLiters = Math.round(fullRefillDepthMm * areaSqMeters);
  const fullDurationMin = Math.round((fullRefillDepthMm / 12) * 60);

  // Deficit volume
  const deficitDepthMm = Math.max(3, smd * 0.6);
  const deficitVolumeLiters = Math.round(deficitDepthMm * areaSqMeters);
  const deficitDurationMin = Math.round((deficitDepthMm / 12) * 60);

  // Off-peak volume (cooler temperature reduces evaporation, requires 15% less water)
  const offPeakDepthMm = Math.max(4, smd * 0.85);
  const offPeakVolumeLiters = Math.round(offPeakDepthMm * areaSqMeters);
  const offPeakDurationMin = Math.round((offPeakDepthMm / 12) * 60);

  const schedules: IrrigationSchedule[] = [];

  // 1. Immediate Full Irrigation
  const isSevereStress = soil.currentMoisture <= soil.wiltingPoint + 2;
  const immStressScore = 95;
  const immWaterScore = Math.max(30, 85 - (fullVolumeLiters / 20000) * 10);
  const immRainScore = rainProb >= 65 ? 20 : 85;
  const immOverall = Math.round(immStressScore * 0.45 + immWaterScore * 0.3 + immRainScore * 0.25);

  schedules.push({
    id: 'sched-1',
    name: 'Schedule A: Immediate Full Irrigation',
    description: 'Deliver full calculated depth immediately to completely refill root-zone reservoir to Field Capacity.',
    startInHours: 0,
    durationMinutes: fullDurationMin,
    waterVolumeLiters: fullVolumeLiters,
    waterDepthMm: Number(fullRefillDepthMm.toFixed(1)),
    timingLabel: 'Immediate (Now)',
    expectedPostMoisture: Math.min(soil.fieldCapacity, soil.currentMoisture + fullRefillDepthMm * 0.4),
    waterEfficiencyScore: Math.round(immWaterScore),
    stressMitigationScore: immStressScore,
    rainSafetyScore: immRainScore,
    overallScore: immOverall,
    recommended: false,
    tag: isSevereStress ? 'Recommended' : 'High Risk',
    rationale: `Rapidly eliminates soil moisture deficit. High reliability, but higher energy and evaporative consumption during daylight.`,
  });

  // 2. Off-Peak Evening Irrigation (in 4 hours)
  const eveStressScore = isSevereStress ? 55 : 90;
  const eveWaterScore = Math.min(95, immWaterScore + 15);
  const eveRainScore = rainProb >= 65 ? 25 : 88;
  const eveOverall = Math.round(eveStressScore * 0.4 + eveWaterScore * 0.35 + eveRainScore * 0.25);

  schedules.push({
    id: 'sched-2',
    name: 'Schedule B: Off-Peak Evening Irrigation',
    description: 'Postpone irrigation until 18:00 to capitalize on reduced solar radiation, lower wind, and minimal evaporative loss.',
    startInHours: 4,
    durationMinutes: offPeakDurationMin,
    waterVolumeLiters: offPeakVolumeLiters,
    waterDepthMm: Number(offPeakDepthMm.toFixed(1)),
    timingLabel: 'In 4 Hours (18:00 Evening)',
    expectedPostMoisture: Math.min(soil.fieldCapacity, soil.currentMoisture + offPeakDepthMm * 0.4),
    waterEfficiencyScore: Math.round(eveWaterScore),
    stressMitigationScore: eveStressScore,
    rainSafetyScore: eveRainScore,
    overallScore: eveOverall,
    recommended: false,
    tag: 'Off-Peak',
    rationale: `Saves ~${(fullVolumeLiters - offPeakVolumeLiters).toLocaleString()} Liters of water through avoided thermal evaporation while maintaining healthy soil moisture.`,
  });

  // 3. Rainfall Delay Strategy (Postpone 8-12 hours)
  const rainDelayStressScore = isSevereStress ? 30 : 80;
  const rainDelayWaterScore = 100; // 100% water saved
  const rainDelayRainScore = rainProb >= 65 ? 98 : rainProb >= 40 ? 70 : 35;
  const rainDelayOverall = Math.round(rainDelayStressScore * 0.3 + rainDelayWaterScore * 0.4 + rainDelayRainScore * 0.3);

  schedules.push({
    id: 'sched-3',
    name: 'Schedule C: Delay for Expected Rainfall',
    description: 'Hold all irrigation pumps on standby to allow forecasted natural precipitation to replenish field capacity for free.',
    startInHours: 8,
    durationMinutes: 0,
    waterVolumeLiters: 0,
    waterDepthMm: 0,
    timingLabel: 'Postponed 8 Hours (Weather Radar Watch)',
    expectedPostMoisture: Math.min(soil.fieldCapacity, soil.currentMoisture + (environment.rainfallAmount || 12) * 0.35),
    waterEfficiencyScore: 100,
    stressMitigationScore: rainDelayStressScore,
    rainSafetyScore: rainDelayRainScore,
    overallScore: rainDelayOverall,
    recommended: false,
    tag: 'Rain Delay',
    rationale: `Capitalizes on ${rainProb}% precipitation forecast. Avoids leaching, runoff, and saves up to ${fullVolumeLiters.toLocaleString()} L of pumped water.`,
  });

  // 4. Deficit Pulse Irrigation (Sustain RAW)
  const defStressScore = isSevereStress ? 65 : 88;
  const defWaterScore = 92;
  const defRainScore = rainProb >= 65 ? 55 : 85;
  const defOverall = Math.round(defStressScore * 0.4 + defWaterScore * 0.4 + defRainScore * 0.2);

  schedules.push({
    id: 'sched-4',
    name: 'Schedule D: Deficit Conservation Pulse',
    description: 'Micro-dose application targeting Readily Available Water (RAW) to satisfy crop demand without saturating lower soil horizons.',
    startInHours: 1,
    durationMinutes: deficitDurationMin,
    waterVolumeLiters: deficitVolumeLiters,
    waterDepthMm: Number(deficitDepthMm.toFixed(1)),
    timingLabel: 'In 1 Hour (Pulse Cycle)',
    expectedPostMoisture: Number((soil.currentMoisture + deficitDepthMm * 0.38).toFixed(1)),
    waterEfficiencyScore: defWaterScore,
    stressMitigationScore: defStressScore,
    rainSafetyScore: defRainScore,
    overallScore: defOverall,
    recommended: false,
    tag: 'Best Conservation',
    rationale: `Balances water austerity and agronomic safety. Conserves 40% water compared to full refill while keeping moisture safely above wilting threshold.`,
  });

  // 5. Skip Cycle (Observation Hold)
  const isMoistOptimal = soil.currentMoisture >= soil.fieldCapacity - 3;
  const skipStressScore = isMoistOptimal ? 96 : isSevereStress ? 10 : 60;
  const skipWaterScore = 100;
  const skipRainScore = 90;
  const skipOverall = Math.round(skipStressScore * 0.5 + skipWaterScore * 0.3 + skipRainScore * 0.2);

  schedules.push({
    id: 'sched-5',
    name: 'Schedule E: Skip Cycle (Observation Hold)',
    description: 'Bypass current irrigation window entirely. Field soil water reservoir has sufficient capacity to sustain crop transpiration.',
    startInHours: 24,
    durationMinutes: 0,
    waterVolumeLiters: 0,
    waterDepthMm: 0,
    timingLabel: 'Skip Next 24 Hours',
    expectedPostMoisture: Math.max(soil.wiltingPoint, soil.currentMoisture - (fieldState.etc / 24) * 24 * 0.1),
    waterEfficiencyScore: 100,
    stressMitigationScore: skipStressScore,
    rainSafetyScore: skipRainScore,
    overallScore: skipOverall,
    recommended: false,
    tag: isMoistOptimal ? 'Recommended' : 'High Risk',
    rationale: `Prevents saturation and anaerobic stress. Ideal when soil moisture is already near field capacity.`,
  });

  // Rank and select recommended schedule
  schedules.sort((a, b) => b.overallScore - a.overallScore);
  schedules[0].recommended = true;
  schedules[0].tag = 'Recommended';

  return schedules;
}
