from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class WaterSavingsMetric(BaseModel):
    field_id: str
    field_name: str
    crop: str
    area_ha: float
    total_water_used_m3: float
    baseline_water_used_m3: float
    water_saved_m3: float
    savings_percentage: float

class DailyTrendPoint(BaseModel):
    date: str
    soil_moisture_pct: float
    depletion_dr_mm: float
    raw_threshold_mm: float
    irrigation_supplied_mm: float
    rainfall_mm: float
    et0_mm: float

class ReportSummaryResponse(BaseModel):
    generated_at: str
    active_fields_count: int
    total_irrigated_area_ha: float
    total_water_consumed_m3: float
    total_water_saved_m3: float
    average_savings_pct: float
    field_savings: List[WaterSavingsMetric]
    soil_moisture_trends: List[DailyTrendPoint]
    compliance_notes: List[str]
