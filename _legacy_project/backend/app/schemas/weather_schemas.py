from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class DailyForecastItem(BaseModel):
    date: str # YYYY-MM-DD
    day_name: str
    temp_max_c: float
    temp_min_c: float
    temp_mean_c: float
    relative_humidity_pct: float
    wind_speed_ms: float
    solar_radiation_mj: float
    precipitation_mm: float
    precipitation_probability_pct: float
    calculated_et0_mm: float
    et0_method: str = "FAO-56 Penman-Monteith"

class WeatherResponse(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    source: str # "LIVE_API", "SIMULATED", "USER_MANUAL", "SIMULATED_FALLBACK"
    last_sync_timestamp: datetime
    is_live: bool
    current_temp_c: float
    current_humidity_pct: float
    current_wind_speed_ms: float
    current_rainfall_mm: float
    forecast: List[DailyForecastItem]
    warning_message: Optional[str] = None
    elevation_m: float = 100.0

class ManualWeatherInput(BaseModel):
    temperature_c: float
    relative_humidity: float
    wind_speed_ms: float = 2.0
    solar_radiation_mj: float = 22.0
    rainfall_mm: float = 0.0

