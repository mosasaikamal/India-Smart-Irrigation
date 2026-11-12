from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.rule_schemas import RuleSchema, RuleExecutionTraceResponse
from backend.app.services.agricultural_rule_engine import AgriculturalRuleEngineService, DEFAULT_RULES
from backend.app.services.field_service import FieldService
from backend.app.services.soil_water_balance import SoilWaterBalanceService

router = APIRouter(prefix="/rules", tags=["Agricultural Knowledge Engine"])

# In-memory mutable rule cache for dynamic user editing
RULE_REGISTRY: List[RuleSchema] = list(DEFAULT_RULES)

@router.get("", response_model=List[RuleSchema])
def list_rules():
    """Returns all registered IF-THEN agricultural rules"""
    return RULE_REGISTRY

@router.post("/toggle/{rule_id}")
def toggle_rule(rule_id: str):
    """Enables or disables an agricultural rule"""
    for r in RULE_REGISTRY:
        if r.id == rule_id:
            r.is_active = not r.is_active
            return {"id": r.id, "code": r.code, "is_active": r.is_active}
    raise HTTPException(status_code=404, detail="Rule not found")

@router.post("/evaluate/{field_id}", response_model=RuleExecutionTraceResponse)
def evaluate_field_rules(field_id: str, db: Session = Depends(get_db)):
    """Executes rule engine against current field state and returns full condition trace"""
    field = FieldService.get_field_by_id(db, field_id)
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
        
    taw = SoilWaterBalanceService.calculate_taw(field.field_capacity, field.wilting_point, field.root_depth_m)
    raw, _ = SoilWaterBalanceService.calculate_raw(taw, field.allowable_depletion_fraction)
    
    facts = {
        "depletion_dr_mm": field.current_depletion_mm,
        "raw_mm": raw,
        "depletion_ratio_taw": round(field.current_depletion_mm / taw, 2) if taw > 0 else 0.0,
        "depletion_ratio_raw": round(field.current_depletion_mm / raw, 2) if raw > 0 else 0.0,
        "forecast_rain_24h_mm": field.rainfall_mm,
        "volumetric_moisture_pct": field.volumetric_moisture,
        "field_capacity_pct": field.field_capacity,
        "crop_stage": field.growth_stage
    }
    
    return AgriculturalRuleEngineService.evaluate_all(field_id, facts, RULE_REGISTRY)
