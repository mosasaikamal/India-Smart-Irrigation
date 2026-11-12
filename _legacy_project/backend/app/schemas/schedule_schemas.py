from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class BeamSearchInput(BaseModel):
    field_id: str
    horizon_days: int = Field(7, ge=3, le=14, description="Planning horizon in days")
    beam_width: int = Field(4, ge=1, le=10, description="Beam width B")
    weight_stress: float = Field(10.0, ge=0.0, description="Weight on crop water stress penalty")
    weight_water: float = Field(1.0, ge=0.0, description="Weight on total water volume consumed")
    weight_pumping: float = Field(0.5, ge=0.0, description="Weight on pump operating energy cost")
    weight_switching: float = Field(2.0, ge=0.0, description="Penalty for frequent pump on/off cycling")
    allow_rain_lookahead: bool = Field(True, description="Consider forecasted rainfall to delay irrigation")

class ScheduleDayPlan(BaseModel):
    day: int
    date: str
    action_type: str # NO_IRRIGATION, REFILL_RAW, REFILL_FC, DEFICIT_PULSE
    irrigation_depth_gross_mm: float
    irrigation_depth_net_mm: float
    water_volume_m3: float
    pump_hours: float
    forecast_rain_mm: float
    predicted_et0_mm: float
    predicted_dr_mm: float
    predicted_ks: float
    soil_status: str # OPTIMAL, REFILLED, STRESSED, RAIN_POSTPONED

class AlternativeSchedule(BaseModel):
    name: str
    description: str
    total_water_m3: float
    total_stress_index: float
    cost_score: float
    daily_depths_mm: List[float]

class BeamSearchResponse(BaseModel):
    field_id: str
    algorithm: str = "Genuine Beam Search (Daily Horizon)"
    beam_width: int
    horizon_days: int
    nodes_explored: number if False else int
    recommended_schedule: List[ScheduleDayPlan]
    alternative_schedules: List[AlternativeSchedule]
    total_water_m3: float
    total_stress_index: float
    objective_score: float
    
    # Baseline comparison metrics
    baseline_water_m3: float
    water_savings_m3: float
    water_savings_pct: float
    selection_reason: str
    hard_constraints_satisfied: List[str]
