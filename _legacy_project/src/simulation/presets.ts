import { CropType, SoilType, GrowthStage, FieldParameters, EnvironmentalParameters, SoilParameters } from '../types';

export interface CropProfile {
  name: CropType;
  rootDepthMeters: number; // Zr
  depletionFactor: number; // p (MAD - Management Allowed Depletion fraction, typically 0.4 - 0.6)
  kcStages: Record<GrowthStage, number>;
  optimalMoistureMin: number; // %
  optimalMoistureMax: number; // %
  stressSensitivity: 'Low' | 'Medium' | 'High';
  growthStageDays: Record<GrowthStage, number>;
  waterNeedsDescription: string;
}

export const CROP_PROFILES: Record<CropType, CropProfile> = {
  Wheat: {
    name: 'Wheat',
    rootDepthMeters: 1.0,
    depletionFactor: 0.55,
    kcStages: {
      'Initial': 0.35,
      'Vegetative': 0.75,
      'Flowering': 1.15,
      'Yield Formation': 1.05,
      'Ripening': 0.45,
    },
    optimalMoistureMin: 26,
    optimalMoistureMax: 36,
    stressSensitivity: 'Medium',
    growthStageDays: {
      'Initial': 20,
      'Vegetative': 35,
      'Flowering': 25,
      'Yield Formation': 30,
      'Ripening': 20,
    },
    waterNeedsDescription: 'Critical water requirement during crown root initiation and flowering/heading stage.'
  },
  Rice: {
    name: 'Rice',
    rootDepthMeters: 0.6,
    depletionFactor: 0.20, // Rice requires very low depletion (near saturation or shallow standing water)
    kcStages: {
      'Initial': 1.05,
      'Vegetative': 1.15,
      'Flowering': 1.30,
      'Yield Formation': 1.10,
      'Ripening': 0.75,
    },
    optimalMoistureMin: 45,
    optimalMoistureMax: 65,
    stressSensitivity: 'High',
    growthStageDays: {
      'Initial': 25,
      'Vegetative': 40,
      'Flowering': 30,
      'Yield Formation': 35,
      'Ripening': 25,
    },
    waterNeedsDescription: 'High water requirement; vulnerable to moisture stress at panicle initiation and flowering.'
  },
  Maize: {
    name: 'Maize',
    rootDepthMeters: 1.2,
    depletionFactor: 0.55,
    kcStages: {
      'Initial': 0.40,
      'Vegetative': 0.80,
      'Flowering': 1.20,
      'Yield Formation': 1.15,
      'Ripening': 0.60,
    },
    optimalMoistureMin: 28,
    optimalMoistureMax: 38,
    stressSensitivity: 'High',
    growthStageDays: {
      'Initial': 20,
      'Vegetative': 35,
      'Flowering': 25,
      'Yield Formation': 40,
      'Ripening': 15,
    },
    waterNeedsDescription: 'Extremely sensitive to moisture stress during tasseling, silking, and grain filling.'
  },
  Tomato: {
    name: 'Tomato',
    rootDepthMeters: 0.8,
    depletionFactor: 0.40,
    kcStages: {
      'Initial': 0.45,
      'Vegetative': 0.85,
      'Flowering': 1.15,
      'Yield Formation': 1.10,
      'Ripening': 0.70,
    },
    optimalMoistureMin: 25,
    optimalMoistureMax: 35,
    stressSensitivity: 'High',
    growthStageDays: {
      'Initial': 25,
      'Vegetative': 35,
      'Flowering': 30,
      'Yield Formation': 40,
      'Ripening': 20,
    },
    waterNeedsDescription: 'Requires steady moisture; fluctuating water causes blossom end rot and fruit splitting.'
  },
  Cotton: {
    name: 'Cotton',
    rootDepthMeters: 1.4,
    depletionFactor: 0.65,
    kcStages: {
      'Initial': 0.35,
      'Vegetative': 0.70,
      'Flowering': 1.20,
      'Yield Formation': 1.00,
      'Ripening': 0.50,
    },
    optimalMoistureMin: 22,
    optimalMoistureMax: 34,
    stressSensitivity: 'Medium',
    growthStageDays: {
      'Initial': 30,
      'Vegetative': 50,
      'Flowering': 45,
      'Yield Formation': 50,
      'Ripening': 25,
    },
    waterNeedsDescription: 'Deep taproot allows moderate drought tolerance; critical demand during flowering and boll formation.'
  },
  Potato: {
    name: 'Potato',
    rootDepthMeters: 0.6,
    depletionFactor: 0.35,
    kcStages: {
      'Initial': 0.50,
      'Vegetative': 0.80,
      'Flowering': 1.15,
      'Yield Formation': 1.05,
      'Ripening': 0.65,
    },
    optimalMoistureMin: 27,
    optimalMoistureMax: 37,
    stressSensitivity: 'High',
    growthStageDays: {
      'Initial': 25,
      'Vegetative': 30,
      'Flowering': 35,
      'Yield Formation': 40,
      'Ripening': 15,
    },
    waterNeedsDescription: 'Shallow root system; sensitive to soil moisture deficits during tuber initiation and bulking.'
  },
};

export interface SoilProfile {
  name: SoilType;
  fieldCapacity: number; // % volumetric moisture
  wiltingPoint: number; // % volumetric moisture
  waterHoldingCapacity: number; // mm of water per meter of soil depth (TAW capacity)
  infiltrationRateMmHr: number;
  percolationRate: 'Fast' | 'Moderate' | 'Slow';
  description: string;
}

export const SOIL_PROFILES: Record<SoilType, SoilProfile> = {
  Sandy: {
    name: 'Sandy',
    fieldCapacity: 16,
    wiltingPoint: 6,
    waterHoldingCapacity: 100, // 100 mm/m
    infiltrationRateMmHr: 30,
    percolationRate: 'Fast',
    description: 'Coarse texture, high drainage, low water retention. Requires frequent, short-duration irrigations.'
  },
  'Sandy Loam': {
    name: 'Sandy Loam',
    fieldCapacity: 24,
    wiltingPoint: 10,
    waterHoldingCapacity: 140, // 140 mm/m
    infiltrationRateMmHr: 20,
    percolationRate: 'Moderate',
    description: 'Good balance of permeability and aeration with fair water retention. Great for vegetables.'
  },
  Loamy: {
    name: 'Loamy',
    fieldCapacity: 32,
    wiltingPoint: 14,
    waterHoldingCapacity: 180, // 180 mm/m
    infiltrationRateMmHr: 13,
    percolationRate: 'Moderate',
    description: 'Ideal agricultural soil. High plant-available moisture capacity with balanced drainage.'
  },
  Clay: {
    name: 'Clay',
    fieldCapacity: 40,
    wiltingPoint: 22,
    waterHoldingCapacity: 180, // 180 mm/m
    infiltrationRateMmHr: 5,
    percolationRate: 'Slow',
    description: 'Dense particles with very high water retention but low infiltration. Risk of waterlogging.'
  },
};

export interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  fieldParams: FieldParameters;
  envParams: EnvironmentalParameters;
  soilParams: SoilParameters;
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'default-wheat',
    name: 'Standard Wheat Field (Loamy)',
    description: 'Wheat at vegetative stage under mild dry weather with moderate moisture deficit.',
    fieldParams: {
      fieldSize: 2.0,
      crop: 'Wheat',
      soilType: 'Loamy',
      growthStage: 'Vegetative',
      irrigationMethod: 'Drip',
    },
    envParams: {
      temperature: 32,
      humidity: 48,
      soilMoisture: 28,
      rainProbability: 20,
      rainfallAmount: 0,
      windSpeed: 12,
      solarRadiation: 22,
    },
    soilParams: {
      fieldCapacity: 32,
      wiltingPoint: 14,
      currentMoisture: 28,
      waterHoldingCapacity: 180,
      infiltrationRate: 13,
    },
  },
  {
    id: 'heatwave-tomato',
    name: 'Heatwave Stress (Tomato / Sandy Loam)',
    description: 'Extreme heat (38°C) with low moisture (22%) pushing tomatoes towards critical wilting point.',
    fieldParams: {
      fieldSize: 1.5,
      crop: 'Tomato',
      soilType: 'Sandy Loam',
      growthStage: 'Flowering',
      irrigationMethod: 'Drip',
    },
    envParams: {
      temperature: 38,
      humidity: 28,
      soilMoisture: 21,
      rainProbability: 5,
      rainfallAmount: 0,
      windSpeed: 18,
      solarRadiation: 27,
    },
    soilParams: {
      fieldCapacity: 24,
      wiltingPoint: 10,
      currentMoisture: 21,
      waterHoldingCapacity: 140,
      infiltrationRate: 20,
    },
  },
  {
    id: 'pre-monsoon-rice',
    name: 'Pre-Monsoon Rain Approaching (Rice / Clay)',
    description: 'High rain probability (85%) with 25mm forecasted in 6 hours. Irrigation should be delayed to save water.',
    fieldParams: {
      fieldSize: 3.0,
      crop: 'Rice',
      soilType: 'Clay',
      growthStage: 'Vegetative',
      irrigationMethod: 'Sprinkler',
    },
    envParams: {
      temperature: 29,
      humidity: 78,
      soilMoisture: 42,
      rainProbability: 85,
      rainfallAmount: 25,
      windSpeed: 16,
      solarRadiation: 14,
    },
    soilParams: {
      fieldCapacity: 40,
      wiltingPoint: 22,
      currentMoisture: 42,
      waterHoldingCapacity: 180,
      infiltrationRate: 5,
    },
  },
  {
    id: 'arid-cotton',
    name: 'Arid Drought Scenario (Cotton / Sandy)',
    description: 'Sandy soil with fast drainage, low moisture (14%), and no rain in sight. Immediate deficit irrigation required.',
    fieldParams: {
      fieldSize: 4.0,
      crop: 'Cotton',
      soilType: 'Sandy',
      growthStage: 'Flowering',
      irrigationMethod: 'Subsurface',
    },
    envParams: {
      temperature: 36,
      humidity: 32,
      soilMoisture: 14,
      rainProbability: 0,
      rainfallAmount: 0,
      windSpeed: 14,
      solarRadiation: 25,
    },
    soilParams: {
      fieldCapacity: 16,
      wiltingPoint: 6,
      currentMoisture: 14,
      waterHoldingCapacity: 100,
      infiltrationRate: 30,
    },
  },
];
