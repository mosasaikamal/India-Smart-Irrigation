import { FieldState } from '../types';

export interface TimeSeriesPoint {
  hourLabel: string;
  hour: number;
  soilMoisture: number;
  temperature: number;
  humidity: number;
  rainProbability: number;
  irrigationAppliedMm: number;
  waterConsumedLiters: number;
}

export function generateInitial24HourTelemetry(fieldState: FieldState): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  const currentHour = 14; // Start at 14:00 (midday/afternoon)
  const baseMoist = fieldState.soil.currentMoisture;
  const baseTemp = fieldState.environment.temperature;
  const baseHumid = fieldState.environment.humidity;
  const baseRain = fieldState.environment.rainProbability;

  for (let i = 0; i < 24; i++) {
    const h = (currentHour + i) % 24;
    const hourFormatted = `${h.toString().padStart(2, '0')}:00`;

    // Diurnal temperature cycle: peak around 14:00-15:00, coolest at 05:00
    const tempDelta = Math.sin(((h - 8) / 24) * 2 * Math.PI) * 5;
    const hourTemp = Math.round(baseTemp + tempDelta);

    // Diurnal humidity inverse to temp
    const hourHumid = Math.min(95, Math.max(25, Math.round(baseHumid - tempDelta * 2.5)));

    // Soil moisture depletion over time without irrigation
    const hourlyDepletion = (fieldState.etc / 24) * 0.1 || 0.35;
    const naturalDepletion = i * hourlyDepletion;
    const hourMoist = Number(Math.max(fieldState.soil.wiltingPoint, baseMoist - naturalDepletion * 0.4).toFixed(1));

    // Slight rain prob fluctuation
    const hourRain = Math.min(100, Math.max(0, Math.round(baseRain + (Math.sin(i * 0.8) * 10))));

    points.push({
      hourLabel: hourFormatted,
      hour: h,
      soilMoisture: hourMoist,
      temperature: hourTemp,
      humidity: hourHumid,
      rainProbability: hourRain,
      irrigationAppliedMm: 0,
      waterConsumedLiters: 0,
    });
  }

  return points;
}
