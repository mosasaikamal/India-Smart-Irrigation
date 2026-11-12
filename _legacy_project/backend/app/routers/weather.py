from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.weather_schemas import WeatherResponse, ManualWeatherInput
from backend.app.services.weather_service import WeatherService
from backend.app.services.field_service import FieldService

router = APIRouter(prefix="/weather", tags=["Weather Integration"])

@router.get("/geocode")
async def geocode_query(q: str = Query(..., min_length=2)):
    """Geocode a place name into latitude/longitude coordinates via Open-Meteo"""
    res = await WeatherService.geocode_location(q)
    if not res:
        raise HTTPException(status_code=404, detail="Location not found")
    return res

@router.get("/forecast/{field_id}", response_model=WeatherResponse)
async def get_field_forecast(
    field_id: str,
    force_simulation: bool = False,
    db: Session = Depends(get_db)
):
    """Retrieves 7-day weather forecast with Penman-Monteith ET0 for active field location"""
    field = FieldService.get_field_by_id(db, field_id)
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
        
    return await WeatherService.fetch_forecast(
        latitude=field.latitude,
        longitude=field.longitude,
        location_name=field.location_name,
        force_simulation=force_simulation,
        db=db
    )

@router.post("/manual/{field_id}", response_model=WeatherResponse)
def set_manual_weather(
    field_id: str,
    inp: ManualWeatherInput,
    db: Session = Depends(get_db)
):
    """Allows manual entry of weather information, updating field state and 7-day forecast projection"""
    field = FieldService.get_field_by_id(db, field_id)
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
        
    field.temperature_c = inp.temperature_c
    field.relative_humidity = inp.relative_humidity
    field.wind_speed_ms = inp.wind_speed_ms
    field.solar_radiation_mj = inp.solar_radiation_mj
    field.rainfall_mm = inp.rainfall_mm
    field.weather_source = "USER_MANUAL"
    db.commit()
    
    return WeatherService.generate_manual_forecast(
        latitude=field.latitude,
        longitude=field.longitude,
        location_name=field.location_name,
        elevation_m=100.0,
        inp=inp
    )

@router.post("/reset-live/{field_id}", response_model=WeatherResponse)
async def reset_live_weather(
    field_id: str,
    db: Session = Depends(get_db)
):
    """Resets field weather source back to live Open-Meteo API and refreshes 7-day forecast"""
    field = FieldService.get_field_by_id(db, field_id)
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
        
    field.weather_source = "LIVE_API"
    db.commit()
    
    return await WeatherService.fetch_forecast(
        latitude=field.latitude,
        longitude=field.longitude,
        location_name=field.location_name,
        force_simulation=False,
        db=db
    )

