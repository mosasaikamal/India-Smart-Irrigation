import { FieldParameters, EnvironmentalParameters, SoilParameters, IrrigationStatus, AIRecommendation } from '../types';
import { CROP_PROFILES, SOIL_PROFILES } from './presets';

/**
 * Calculates Reference Evapotranspiration (ET0) in mm/day
 * using a standardized FAO Penman-Monteith / Hargreaves hybrid empirical formulation.
 */
export function calculateET0(
  temperature: number, // °C
  humidity: number, // %
  windSpeed: number, // km/h
  solarRadiation: number = 20 // MJ/m^2/day
): number {
  // Saturation vapor pressure es (kPa)
  const es = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
  // Actual vapor pressure ea (kPa)
  const ea = es * (humidity / 100);
  // Vapor pressure deficit VPD (kPa)
  const vpd = Math.max(0, es - ea);

  // Wind speed in m/s (1 km/h = 1 / 3.6 m/s)
  const u2 = windSpeed / 3.6;

  // Radiation component (approximate net radiation Rn)
  const rn = 0.408 * (solarRadiation * 0.6); // net radiation equivalent evaporation mm/day

  // Aerodynamic component
  const aero = (900 / (temperature + 273)) * u2 * vpd;

  // Psychrometric constant gamma ~ 0.066 kPa/°C
  const delta = (4098 * es) / Math.pow(temperature + 237.3, 2);
  const gamma = 0.066;

  // Penman-Monteith equation simplified
  const et0 = (delta * rn + gamma * aero) / (delta + gamma * (1 + 0.34 * u2));

  // Cap within realistic agricultural boundaries [1.0, 12.0] mm/day
  return Math.min(12.0, Math.max(1.0, Number(et0.toFixed(2))));
}

/**
 * Calculates total available water (TAW) and readily available water (RAW) in mm.
 */
export function calculateSoilWaterCapacities(
  soil: SoilParameters,
  rootDepthMeters: number,
  depletionFraction: number
) {
  // Convert volumetric percentages to fractions (e.g. 30% -> 0.30)
  const fcFraction = soil.fieldCapacity / 100;
  const wpFraction = soil.wiltingPoint / 100;

  // TAW = 1000 * (FC - WP) * Zr (mm)
  const taw = Math.max(10, 1000 * (fcFraction - wpFraction) * rootDepthMeters);

  // RAW = p * TAW (mm) - moisture that can be extracted without water stress
  const raw = Math.max(5, taw * depletionFraction);

  return {
    taw: Number(taw.toFixed(1)),
    raw: Number(raw.toFixed(1)),
  };
}

/**
 * Calculates Soil Moisture Deficit (SMD) in mm
 * SMD is the depth of water needed to bring soil moisture back to Field Capacity.
 */
export function calculateSoilMoistureDeficit(
  soil: SoilParameters,
  rootDepthMeters: number
): number {
  const fcFraction = soil.fieldCapacity / 100;
  const currentFraction = Math.max(soil.wiltingPoint / 100, soil.currentMoisture / 100);

  // Deficit = 1000 * (FC - Current) * Zr
  const deficitMm = Math.max(0, 1000 * (fcFraction - currentFraction) * rootDepthMeters);
  return Number(deficitMm.toFixed(1));
}

/**
 * Evaluates field condition and generates comprehensive AI recommendations.
 */
export function evaluateFieldCondition(
  fieldParams: FieldParameters,
  envParams: EnvironmentalParameters,
  soilParams: SoilParameters
): {
  et0: number;
  kc: number;
  etc: number;
  taw: number;
  raw: number;
  smd: number;
  stressLevel: 'None' | 'Mild' | 'Moderate' | 'Severe';
  irrigationStatus: IrrigationStatus;
  aiRecommendation: AIRecommendation;
} {
  const cropProfile = CROP_PROFILES[fieldParams.crop] || CROP_PROFILES.Wheat;
  const soilProfile = SOIL_PROFILES[fieldParams.soilType] || SOIL_PROFILES.Loamy;

  const et0 = calculateET0(
    envParams.temperature,
    envParams.humidity,
    envParams.windSpeed,
    envParams.solarRadiation || 20
  );

  const kc = cropProfile.kcStages[fieldParams.growthStage] || 1.0;
  const etc = Number((et0 * kc).toFixed(2));

  const { taw, raw } = calculateSoilWaterCapacities(
    soilParams,
    cropProfile.rootDepthMeters,
    cropProfile.depletionFactor
  );

  const smd = calculateSoilMoistureDeficit(soilParams, cropProfile.rootDepthMeters);

  // Critical threshold: when moisture drops below FC - (RAW / (1000 * Zr)) * 100
  const moistureRange = soilParams.fieldCapacity - soilParams.wiltingPoint;
  const readilyAvailableMoisture = soilParams.fieldCapacity - moistureRange * cropProfile.depletionFactor;

  // Stress Level determination
  let stressLevel: 'None' | 'Mild' | 'Moderate' | 'Severe' = 'None';
  if (soilParams.currentMoisture <= soilParams.wiltingPoint + 2) {
    stressLevel = 'Severe';
  } else if (soilParams.currentMoisture <= readilyAvailableMoisture - 2) {
    stressLevel = 'Moderate';
  } else if (soilParams.currentMoisture <= readilyAvailableMoisture) {
    stressLevel = 'Mild';
  }

  // Rain consideration:
  const rainWillOccur = envParams.rainProbability >= 65 && (envParams.rainfallAmount > 5 || envParams.rainProbability >= 80);
  const moderateRainForecast = envParams.rainProbability >= 45 && envParams.rainProbability < 65;

  let irrigationStatus: IrrigationStatus = 'OPTIMAL';
  let recAction: AIRecommendation['action'] = 'NO_IRRIGATION';
  let recSummary = '';
  let durationMinutes = 0;
  let waterDepthMm = 0;
  let confidence = 85;
  const reasons: string[] = [];

  // Application rate based on irrigation method
  // Drip: 10 mm/hr, Sprinkler: 15 mm/hr, Furrow: 25 mm/hr, Subsurface: 8 mm/hr
  const methodEfficiency = {
    Drip: 0.90,
    Sprinkler: 0.75,
    Furrow: 0.60,
    Subsurface: 0.95,
  }[fieldParams.irrigationMethod] || 0.85;

  const methodApplicationRateMmHr = {
    Drip: 12,
    Sprinkler: 18,
    Furrow: 25,
    Subsurface: 10,
  }[fieldParams.irrigationMethod] || 12;

  // Decision logic
  if (rainWillOccur && stressLevel !== 'Severe') {
    irrigationStatus = 'RAIN_EXPECTED';
    recAction = 'DELAY_RAIN';
    recSummary = `Delay irrigation by 6–12 hours. High precipitation probability (${envParams.rainProbability}%) expected to naturally replenish soil reservoir.`;
    waterDepthMm = 0;
    durationMinutes = 0;
    confidence = Math.min(95, 60 + envParams.rainProbability * 0.4);
    reasons.push(`Precipitation forecast shows ${envParams.rainProbability}% likelihood with estimated ${envParams.rainfallAmount || '10+'} mm.`);
    reasons.push(`Current moisture (${soilParams.currentMoisture}%) is above critical wilting point (${soilParams.wiltingPoint}%).`);
    reasons.push('Irrigating prior to heavy rainfall creates high risk of nutrient leaching, surface runoff, and root hypoxia.');
    reasons.push('Estimated water conserved by delaying: ~100% of standard irrigation cycle.');
  } else if (soilParams.currentMoisture < readilyAvailableMoisture || stressLevel === 'Severe') {
    if (stressLevel === 'Severe') {
      irrigationStatus = 'SOIL_MOISTURE_LOW';
      recAction = 'IRRIGATE_NOW';
      recSummary = `Emergency irrigation required immediately. Soil moisture (${soilParams.currentMoisture}%) is near permanent wilting point (${soilParams.wiltingPoint}%).`;
      confidence = 96;
      reasons.push(`Extreme moisture depletion below permanent wilting point threshold.`);
      reasons.push(`${fieldParams.crop} during ${fieldParams.growthStage} cannot tolerate continued cellular dehydration without irreversible yield loss.`);
    } else {
      irrigationStatus = 'IRRIGATION_REQUIRED';
      // Check temperature for off-peak / evening recommendation
      if (envParams.temperature >= 33 && !rainWillOccur) {
        recAction = 'DELAY_EVENING';
        recSummary = `Schedule irrigation for cooler evening hours (in 4 hours). High ambient temperature (${envParams.temperature}°C) induces severe midday evaporative loss.`;
        confidence = 89;
        reasons.push(`Midday peak temperature of ${envParams.temperature}°C would cause ~25–35% of applied water to evaporate before root penetration.`);
        reasons.push(`Soil moisture (${soilParams.currentMoisture}%) is depleted below readily available threshold (${readilyAvailableMoisture.toFixed(1)}%), but not yet critical.`);
        reasons.push('Evening application maximizes infiltration depth and hydraulic efficiency.');
      } else {
        recAction = 'IRRIGATE_NOW';
        recSummary = `Irrigate now to restore soil moisture to field capacity (${soilParams.fieldCapacity}%).`;
        confidence = 91;
        reasons.push(`Soil moisture (${soilParams.currentMoisture}%) has depleted below Management Allowed Depletion (MAD ${cropProfile.depletionFactor * 100}%).`);
        reasons.push(`Crop evapotranspiration demand (ETc) is currently ${etc} mm/day.`);
      }
    }

    // Calculate required water depth to refill deficit
    waterDepthMm = Number(Math.min(smd / methodEfficiency, raw * 1.2).toFixed(1));
    durationMinutes = Math.round((waterDepthMm / methodApplicationRateMmHr) * 60);
  } else if (soilParams.currentMoisture >= soilParams.fieldCapacity - 2) {
    irrigationStatus = 'OPTIMAL';
    recAction = 'NO_IRRIGATION';
    recSummary = `Soil moisture is at optimal field capacity (${soilParams.currentMoisture}%). No irrigation needed.`;
    confidence = 94;
    waterDepthMm = 0;
    durationMinutes = 0;
    reasons.push(`Current volumetric water content is near saturated field capacity (${soilParams.fieldCapacity}%).`);
    reasons.push(`Sufficient water reserves available for the next 48+ hours based on current ETc (${etc} mm/day).`);
  } else {
    // Moisture is adequate, slight deficit
    if (moderateRainForecast) {
      irrigationStatus = 'IRRIGATION_NOT_REQUIRED';
      recAction = 'NO_IRRIGATION';
      recSummary = `Moisture levels adequate (${soilParams.currentMoisture}%). Moderate rain chance (${envParams.rainProbability}%) suggests waiting.`;
      confidence = 84;
      reasons.push(`Current moisture is comfortably within readily available band.`);
      reasons.push(`Forecasted clouds and 45-65% precipitation chance reduce evaporative demand.`);
    } else {
      irrigationStatus = 'OPTIMAL';
      recAction = 'NO_IRRIGATION';
      recSummary = `Soil moisture (${soilParams.currentMoisture}%) is healthy. Next evaluation in 8 hours.`;
      confidence = 88;
      reasons.push(`Soil water is above threshold (${readilyAvailableMoisture.toFixed(1)}%).`);
      reasons.push(`Crop ${fieldParams.crop} in ${fieldParams.growthStage} stage is not showing evapotranspiration stress.`);
    }
  }

  // Calculate volume in Liters
  // 1 acre = 4046.86 m^2. 1 mm over 1 m^2 = 1 Liter.
  const areaSqMeters = fieldParams.fieldSize * 4046.86;
  const waterAmountLiters = Math.round(waterDepthMm * areaSqMeters);

  const aiRecommendation: AIRecommendation = {
    summary: recSummary,
    action: recAction,
    durationMinutes,
    waterAmountLiters,
    waterDepthMm,
    optimalTime: recAction === 'DELAY_EVENING' ? '18:00 (Evening off-peak)' : recAction === 'DELAY_RAIN' ? 'Post-rain assessment' : 'Immediate',
    confidence,
    reasoning: reasons,
    keyFactors: {
      soilStatus: `Current ${soilParams.currentMoisture}% vs FC ${soilParams.fieldCapacity}% (Deficit: ${smd} mm)`,
      weatherRisk: rainWillOccur ? `High rain chance (${envParams.rainProbability}%)` : `Dry atmospheric demand (${envParams.temperature}°C, ${envParams.humidity}% RH)`,
      cropStressRisk: `${stressLevel} stress for ${fieldParams.crop} (ETc: ${etc} mm/day)`,
      conservationImpact: recAction === 'DELAY_RAIN' || recAction === 'NO_IRRIGATION' ? `Saved ~${Math.round(smd * areaSqMeters)} L` : `Targeted application using ${fieldParams.irrigationMethod}`,
    }
  };

  return {
    et0,
    kc,
    etc,
    taw,
    raw,
    smd,
    stressLevel,
    irrigationStatus,
    aiRecommendation,
  };
}
