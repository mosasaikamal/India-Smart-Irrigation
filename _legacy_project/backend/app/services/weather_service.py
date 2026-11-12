import math
import httpx
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.models.weather import WeatherCache
from backend.app.schemas.weather_schemas import WeatherResponse, DailyForecastItem, ManualWeatherInput
from backend.app.services.evapotranspiration_service import EvapotranspirationService
from backend.app.schemas.agronomy_schemas import PenmanMonteithInput

class WeatherService:
    """
    Open-Meteo REST API adapter with geocoding, current weather,
    7-day forecast, caching, manual input generation, and offline simulation fallback.
    """

    @classmethod
    async def geocode_location(cls, query: str) -> Optional[Dict[str, Any]]:
        """Geocode place name to lat/lon using Open-Meteo Geocoding API"""
        url = f"{settings.GEOCODING_BASE_URL}/search"
        params = {"name": query, "count": 1, "language": "en", "format": "json"}
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(url, params=params)
                if res.status_code == 200:
                    data = res.json()
                    if "results" in data and len(data["results"]) > 0:
                        first = data["results"][0]
                        return {
                            "name": f"{first.get('name')}, {first.get('country_code', '')}",
                            "latitude": first.get("latitude"),
                            "longitude": first.get("longitude"),
                            "elevation": first.get("elevation", 100.0)
                        }
        except Exception as e:
            print(f"Geocoding error: {e}")
        return None

    @classmethod
    async def fetch_forecast(
        cls,
        latitude: float,
        longitude: float,
        location_name: str = "Field Station",
        elevation_m: float = 100.0,
        force_simulation: bool = False,
        db: Optional[Session] = None
    ) -> WeatherResponse:
        """
        Retrieves weather forecast. Checks live Open-Meteo first unless force_simulation is True.
        Falls back to realistic offline simulation if network fails, clearly labeling source.
        """
        now = datetime.now(timezone.utc)
        api_failure_reason: Optional[str] = None
        
        if not force_simulation:
            url = f"{settings.OPEN_METEO_BASE_URL}/forecast"
            params = {
                "latitude": latitude,
                "longitude": longitude,
                "daily": [
                    "temperature_2m_max",
                    "temperature_2m_min",
                    "temperature_2m_mean",
                    "relative_humidity_2m_mean",
                    "wind_speed_10m_max",
                    "shortwave_radiation_sum",
                    "precipitation_sum",
                    "precipitation_probability_max"
                ],
                "wind_speed_unit": "ms",
                "current_weather": "true",
                "timezone": "auto"
            }
            try:
                async with httpx.AsyncClient(timeout=4.0) as client:
                    res = await client.get(url, params=params)
                    if res.status_code == 200:
                        data = res.json()
                        daily = data.get("daily", {})
                        dates = daily.get("time", [])
                        t_max = daily.get("temperature_2m_max", [])
                        t_min = daily.get("temperature_2m_min", [])
                        t_mean = daily.get("temperature_2m_mean", [])
                        rhs = daily.get("relative_humidity_2m_mean", [])
                        winds = daily.get("wind_speed_10m_max", [])
                        rads = daily.get("shortwave_radiation_sum", [])
                        precips = daily.get("precipitation_sum", [])
                        precip_probs = daily.get("precipitation_probability_max", [])
                        
                        items: List[DailyForecastItem] = []
                        for i in range(min(7, len(dates))):
                            dt = datetime.strptime(dates[i], "%Y-%m-%d")
                            # Convert 10m wind to 2m wind: u2 = u10 * (4.87 / ln(67.8*10 - 5.42)) ≈ u10 * 0.748
                            wind_2m = max(0.5, (winds[i] if i < len(winds) and winds[i] is not None else 3.0) * 0.748)
                            sol_rad = max(5.0, rads[i] if i < len(rads) and rads[i] is not None else 20.0)
                            
                            pm_inp = PenmanMonteithInput(
                                temp_mean_c=t_mean[i] if i < len(t_mean) and t_mean[i] is not None else 22.0,
                                temp_max_c=t_max[i] if i < len(t_max) and t_max[i] is not None else 28.0,
                                temp_min_c=t_min[i] if i < len(t_min) and t_min[i] is not None else 16.0,
                                relative_humidity_pct=rhs[i] if i < len(rhs) and rhs[i] is not None else 50.0,
                                wind_speed_ms=round(wind_2m, 1),
                                solar_radiation_mj=round(sol_rad, 1),
                                elevation_m=elevation_m,
                                latitude_deg=latitude,
                                day_of_year=dt.timetuple().tm_yday
                            )
                            et0_res = EvapotranspirationService.calculate_penman_monteith(pm_inp)
                            
                            items.append(DailyForecastItem(
                                date=dates[i],
                                day_name=dt.strftime("%A"),
                                temp_max_c=round(pm_inp.temp_max_c, 1),
                                temp_min_c=round(pm_inp.temp_min_c, 1),
                                temp_mean_c=round(pm_inp.temp_mean_c, 1),
                                relative_humidity_pct=round(pm_inp.relative_humidity_pct, 1),
                                wind_speed_ms=round(wind_2m, 1),
                                solar_radiation_mj=round(sol_rad, 1),
                                precipitation_mm=round(precips[i] if i < len(precips) and precips[i] is not None else 0.0, 1),
                                precipitation_probability_pct=round(precip_probs[i] if i < len(precip_probs) and precip_probs[i] is not None else 0.0, 0),
                                calculated_et0_mm=et0_res.et0_mm_day,
                                et0_method="FAO-56 Penman-Monteith"
                            ))
                        
                        curr = data.get("current_weather", {})
                        
                        resp = WeatherResponse(
                            location_name=location_name,
                            latitude=latitude,
                            longitude=longitude,
                            source="LIVE_API",
                            last_sync_timestamp=now,
                            is_live=True,
                            current_temp_c=curr.get("temperature", 24.5),
                            current_humidity_pct=rhs[0] if rhs else 50.0,
                            current_wind_speed_ms=round((curr.get("windspeed", 2.5) * 0.748), 1),
                            current_rainfall_mm=round(precips[0] if precips else 0.0, 1),
                            forecast=items,
                            warning_message=None,
                            elevation_m=elevation_m
                        )
                        
                        # Cache in DB if session available
                        if db is not None:
                            try:
                                for item in items:
                                    cache_entry = WeatherCache(
                                        location_name=location_name,
                                        latitude=latitude,
                                        longitude=longitude,
                                        forecast_date=item.date,
                                        temp_max_c=item.temp_max_c,
                                        temp_min_c=item.temp_min_c,
                                        temp_mean_c=item.temp_mean_c,
                                        relative_humidity_pct=item.relative_humidity_pct,
                                        wind_speed_ms=item.wind_speed_ms,
                                        solar_radiation_mj=item.solar_radiation_mj,
                                        precipitation_mm=item.precipitation_mm,
                                        precipitation_probability_pct=item.precipitation_probability_pct,
                                        calculated_et0_mm=item.calculated_et0_mm,
                                        source="LIVE_API",
                                        fetched_at=now.replace(tzinfo=None)
                                    )
                                    db.add(cache_entry)
                                db.commit()
                            except Exception as db_err:
                                db.rollback()
                        return resp
                    else:
                        api_failure_reason = f"Open-Meteo returned HTTP {res.status_code}"
            except Exception as e:
                api_failure_reason = f"Network or timeout error contacting Open-Meteo: {str(e) or type(e).__name__}"
                print(f"Open-Meteo live call failed, falling back to simulation: {api_failure_reason}")

        # SIMULATION FALLBACK: Deterministic, realistic weather generator
        sim_items: List[DailyForecastItem] = []
        base_date = now.date()
        # Realistic Mediterranean / Central Valley summer weather profile
        temp_pattern = [(31.0, 17.5), (32.5, 18.0), (33.0, 18.5), (29.0, 16.0), (28.0, 15.0), (30.0, 16.5), (31.5, 17.0)]
        rain_pattern = [(0.0, 5), (0.0, 10), (0.0, 15), (8.5, 75), (2.0, 40), (0.0, 5), (0.0, 5)] # Day 4 has rain
        rh_pattern = [42.0, 40.0, 38.0, 68.0, 60.0, 48.0, 44.0]
        solar_pattern = [23.5, 24.0, 24.2, 16.5, 19.0, 22.5, 23.0]
        
        for i in range(7):
            d = base_date + timedelta(days=i)
            tmax, tmin = temp_pattern[i]
            tmean = (tmax + tmin) / 2.0
            p_mm, p_prob = rain_pattern[i]
            rh = rh_pattern[i]
            sol = solar_pattern[i]
            wind = 2.2
            
            pm_inp = PenmanMonteithInput(
                temp_mean_c=tmean,
                temp_max_c=tmax,
                temp_min_c=tmin,
                relative_humidity_pct=rh,
                wind_speed_ms=wind,
                solar_radiation_mj=sol,
                elevation_m=elevation_m,
                latitude_deg=latitude,
                day_of_year=d.timetuple().tm_yday
            )
            et0_res = EvapotranspirationService.calculate_penman_monteith(pm_inp)
            
            sim_items.append(DailyForecastItem(
                date=d.strftime("%Y-%m-%d"),
                day_name=d.strftime("%A"),
                temp_max_c=tmax,
                temp_min_c=tmin,
                temp_mean_c=round(tmean, 1),
                relative_humidity_pct=rh,
                wind_speed_ms=wind,
                solar_radiation_mj=sol,
                precipitation_mm=p_mm,
                precipitation_probability_pct=float(p_prob),
                calculated_et0_mm=et0_res.et0_mm_day,
                et0_method="FAO-56 Penman-Monteith"
            ))
            
        source_label = "SIMULATED_FALLBACK" if api_failure_reason else "SIMULATED"
        warning_msg = (
            f"Live Open-Meteo API unavailable ({api_failure_reason}). Operating on realistic meteorological fallback simulation."
            if api_failure_reason else None
        )
            
        return WeatherResponse(
            location_name=location_name,
            latitude=latitude,
            longitude=longitude,
            source=source_label,
            last_sync_timestamp=now,
            is_live=False,
            current_temp_c=29.5,
            current_humidity_pct=42.0,
            current_wind_speed_ms=2.2,
            current_rainfall_mm=0.0,
            forecast=sim_items,
            warning_message=warning_msg,
            elevation_m=elevation_m
        )

    @classmethod
    def generate_manual_forecast(
        cls,
        latitude: float,
        longitude: float,
        location_name: str,
        elevation_m: float,
        inp: ManualWeatherInput
    ) -> WeatherResponse:
        """
        Synthesizes a 7-day forward weather projection based on manual user inputs,
        evaluating daily Penman-Monteith ET0 for downstream agents and scheduler.
        """
        now = datetime.now(timezone.utc)
        base_date = now.date()
        forecast_items: List[DailyForecastItem] = []
        
        t_max = round(inp.temperature_c + 4.5, 1)
        t_min = round(max(0.0, inp.temperature_c - 4.5), 1)
        
        for i in range(7):
            d = base_date + timedelta(days=i)
            # Gentle sinusoidal diurnal variance around user manual baseline
            drift = round(0.4 * math.sin(i * 1.2), 1)
            tmax_d = round(t_max + drift, 1)
            tmin_d = round(t_min + drift, 1)
            tmean_d = round((tmax_d + tmin_d) / 2.0, 1)
            
            # First day has manual rainfall; subsequent days decay or zero
            p_mm = inp.rainfall_mm if i == 0 else 0.0
            p_prob = 85.0 if p_mm > 0 else 5.0
            
            pm_inp = PenmanMonteithInput(
                temp_mean_c=tmean_d,
                temp_max_c=tmax_d,
                temp_min_c=tmin_d,
                relative_humidity_pct=inp.relative_humidity,
                wind_speed_ms=max(0.5, inp.wind_speed_ms),
                solar_radiation_mj=max(5.0, inp.solar_radiation_mj),
                elevation_m=elevation_m,
                latitude_deg=latitude,
                day_of_year=d.timetuple().tm_yday
            )
            et0_res = EvapotranspirationService.calculate_penman_monteith(pm_inp)
            
            forecast_items.append(DailyForecastItem(
                date=d.strftime("%Y-%m-%d"),
                day_name=d.strftime("%A"),
                temp_max_c=tmax_d,
                temp_min_c=tmin_d,
                temp_mean_c=tmean_d,
                relative_humidity_pct=round(inp.relative_humidity, 1),
                wind_speed_ms=round(inp.wind_speed_ms, 1),
                solar_radiation_mj=round(inp.solar_radiation_mj, 1),
                precipitation_mm=p_mm,
                precipitation_probability_pct=p_prob,
                calculated_et0_mm=et0_res.et0_mm_day,
                et0_method="FAO-56 Penman-Monteith"
            ))
            
        return WeatherResponse(
            location_name=location_name,
            latitude=latitude,
            longitude=longitude,
            source="USER_MANUAL",
            last_sync_timestamp=now,
            is_live=False,
            current_temp_c=inp.temperature_c,
            current_humidity_pct=inp.relative_humidity,
            current_wind_speed_ms=inp.wind_speed_ms,
            current_rainfall_mm=inp.rainfall_mm,
            forecast=forecast_items,
            warning_message=None,
            elevation_m=elevation_m
        )

