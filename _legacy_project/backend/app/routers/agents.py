from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.agent_schemas import BlackboardStateResponse, HumanApprovalPayload
from backend.app.services.multi_agent_orchestrator import MultiAgentOrchestratorService
from backend.app.services.weather_service import WeatherService
from backend.app.services.field_service import FieldService

router = APIRouter(prefix="/agents", tags=["Autonomous Agents"])

# Store last run in memory for approval workflow
LAST_RUN_BLACKBOARD: dict = {}

@router.post("/run/{field_id}", response_model=BlackboardStateResponse)
async def run_agent_workflow(field_id: str, db: Session = Depends(get_db)):
    """Executes full 6-agent autonomous workflow with supervisor conflict arbitration"""
    field = FieldService.get_field_by_id(db, field_id)
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
        
    wx = await WeatherService.fetch_forecast(
        latitude=field.latitude,
        longitude=field.longitude,
        location_name=field.location_name,
        db=db
    )
    
    kc = FieldService.calculate_crop_coefficient(
        crop_name=field.crop_type,
        growth_stage=field.growth_stage,
        wind_speed_ms=field.wind_speed_ms,
        rh_min_pct=field.relative_humidity
    )
    
    res = MultiAgentOrchestratorService.execute_workflow(
        field_id=field.id,
        field_name=field.name,
        area_ha=field.area_ha,
        crop_type=field.crop_type,
        growth_stage=field.growth_stage,
        soil_type=field.soil_type,
        root_depth_m=field.root_depth_m,
        volumetric_moisture=field.volumetric_moisture,
        fc_pct=field.field_capacity,
        pwp_pct=field.wilting_point,
        default_p=field.allowable_depletion_fraction,
        kc=kc,
        application_efficiency=field.application_efficiency,
        pump_capacity_m3h=field.pump_capacity_m3h,
        current_dr_mm=field.current_depletion_mm,
        forecast=wx.forecast
    )
    
    LAST_RUN_BLACKBOARD[res.run_id] = res
    return res

@router.post("/approve")
def submit_human_approval(payload: HumanApprovalPayload):
    """Safety Checkpoint: Records human operator approval or rejection for physical pump activation"""
    if payload.run_id in LAST_RUN_BLACKBOARD:
        run = LAST_RUN_BLACKBOARD[payload.run_id]
        run.approval_status = "APPROVED" if payload.approved else "REJECTED"
        run.approved_by = payload.user_name
        return {
            "run_id": payload.run_id,
            "status": run.approval_status,
            "approved_by": payload.user_name,
            "message": "Physical execution authorized by operator" if payload.approved else "Operation cancelled by operator"
        }
    return {
        "run_id": payload.run_id,
        "status": "APPROVED" if payload.approved else "REJECTED",
        "approved_by": payload.user_name,
        "message": "Recorded successfully"
    }
