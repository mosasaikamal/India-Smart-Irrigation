from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.agronomy_schemas import (
    PenmanMonteithInput,
    PenmanMonteithResult,
    HargreavesInput,
    HargreavesResult,
    WaterBalanceResult,
    IrrigationRequirementCalculation
)
from backend.app.services.evapotranspiration_service import EvapotranspirationService
from backend.app.services.soil_water_balance import SoilWaterBalanceService
from backend.app.services.irrigation_calculator import IrrigationCalculatorService
from backend.app.services.field_service import FieldService

router = APIRouter(prefix="/agronomy", tags=["Agronomy & Mathematical Engine"])

@router.post("/penman-monteith", response_model=PenmanMonteithResult)
def calculate_penman_monteith(inp: PenmanMonteithInput):
    """Executes full FAO-56 Penman-Monteith reference ET0 calculation"""
    return EvapotranspirationService.calculate_penman_monteith(inp)

@router.post("/hargreaves", response_model=HargreavesResult)
def calculate_hargreaves(inp: HargreavesInput):
    """Executes Hargreaves-Samani fallback reference ET0 calculation"""
    return EvapotranspirationService.calculate_hargreaves(inp)

@router.get("/requirement/{field_id}", response_model=IrrigationRequirementCalculation)
def get_irrigation_requirement(field_id: str, db: Session = Depends(get_db)):
    """Computes exact current TAW, RAW, Net/Gross irrigation depth, volume, and pump operating hours"""
    field = FieldService.get_field_by_id(db, field_id)
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
        
    return IrrigationCalculatorService.calculate_requirement(
        field_id=field.id,
        area_ha=field.area_ha,
        current_dr_mm=field.current_depletion_mm,
        fc_pct=field.field_capacity,
        pwp_pct=field.wilting_point,
        root_depth_m=field.root_depth_m,
        default_p=field.allowable_depletion_fraction,
        application_efficiency=field.application_efficiency,
        pump_capacity_m3h=field.pump_capacity_m3h
    )
