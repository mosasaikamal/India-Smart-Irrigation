from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.schedule_schemas import BeamSearchInput, BeamSearchResponse
from backend.app.services.schedule_optimizer import ScheduleOptimizerService
from backend.app.services.weather_service import WeatherService
from backend.app.services.field_service import FieldService
from backend.app.models.schedule import IrrigationScheduleRecord

router = APIRouter(prefix="/schedules", tags=["AI Schedule Planner"])

@router.post("/beam-search", response_model=BeamSearchResponse)
async def plan_schedule_beam_search(
    inp: BeamSearchInput,
    db: Session = Depends(get_db)
):
    """Executes genuine Beam Search optimization over a multi-day horizon"""
    field = FieldService.get_field_by_id(db, inp.field_id)
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
        
    # Get 7-day weather forecast
    wx = await WeatherService.fetch_forecast(
        latitude=field.latitude,
        longitude=field.longitude,
        location_name=field.location_name,
        db=db
    )
    
    # Crop coefficient Kc computed according to FAO-56 stage & climate
    kc = FieldService.calculate_crop_coefficient(
        crop_name=field.crop_type,
        growth_stage=field.growth_stage,
        wind_speed_ms=field.wind_speed_ms,
        rh_min_pct=field.relative_humidity
    )
    
    res = ScheduleOptimizerService.run_beam_search(
        inp=inp,
        area_ha=field.area_ha,
        current_dr_mm=field.current_depletion_mm,
        fc_pct=field.field_capacity,
        pwp_pct=field.wilting_point,
        root_depth_m=field.root_depth_m,
        default_p=field.allowable_depletion_fraction,
        kc=kc,
        application_efficiency=field.application_efficiency,
        pump_capacity_m3h=field.pump_capacity_m3h,
        forecast=wx.forecast
    )
    
    return res
