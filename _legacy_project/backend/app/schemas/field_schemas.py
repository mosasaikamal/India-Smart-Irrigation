from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class FieldBase(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "North Valley Maize"})
    area_ha: float = Field(..., gt=0, json_schema_extra={"example": 2.5})
    crop_type: str = Field(..., json_schema_extra={"example": "Maize"})
    growth_stage: str = Field(..., json_schema_extra={"example": "Mid-season"})
    soil_type: str = Field(..., json_schema_extra={"example": "Loamy"})
    root_depth_m: float = Field(..., gt=0, json_schema_extra={"example": 0.8})
    volumetric_moisture: float = Field(..., ge=0, le=100, json_schema_extra={"example": 24.0})
    field_capacity: float = Field(..., ge=0, le=100, json_schema_extra={"example": 32.0})
    wilting_point: float = Field(..., ge=0, le=100, json_schema_extra={"example": 14.0})
    allowable_depletion_fraction: float = Field(..., ge=0, le=1, json_schema_extra={"example": 0.55})
    application_efficiency: float = Field(..., ge=0.1, le=1.0, json_schema_extra={"example": 0.85})
    pump_capacity_m3h: float = Field(..., gt=0, json_schema_extra={"example": 25.0})
    
    # Environmental conditions
    temperature_c: float = Field(28.5)
    relative_humidity: float = Field(45.0)
    wind_speed_ms: float = Field(2.2)
    solar_radiation_mj: float = Field(21.5)
    rainfall_mm: float = Field(0.0)
    current_depletion_mm: float = Field(35.0)
    
    # Location
    latitude: float = Field(36.7783)
    longitude: float = Field(-119.4179)
    location_name: str = Field("Central Valley, CA")
    weather_source: str = Field("SIMULATED")

class FieldCreate(FieldBase):
    id: Optional[str] = None

class FieldUpdate(BaseModel):
    name: Optional[str] = None
    area_ha: Optional[float] = None
    crop_type: Optional[str] = None
    growth_stage: Optional[str] = None
    soil_type: Optional[str] = None
    root_depth_m: Optional[float] = None
    volumetric_moisture: Optional[float] = None
    field_capacity: Optional[float] = None
    wilting_point: Optional[float] = None
    allowable_depletion_fraction: Optional[float] = None
    application_efficiency: Optional[float] = None
    pump_capacity_m3h: Optional[float] = None
    temperature_c: Optional[float] = None
    relative_humidity: Optional[float] = None
    wind_speed_ms: Optional[float] = None
    solar_radiation_mj: Optional[float] = None
    rainfall_mm: Optional[float] = None
    current_depletion_mm: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    weather_source: Optional[str] = None

class FieldResponse(FieldBase):
    id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CropProfileSchema(BaseModel):
    id: int
    crop_name: str
    initial_kc: float
    mid_kc: float
    end_kc: float
    max_root_depth_m: float
    default_p: float
    description: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class SoilProfileSchema(BaseModel):
    id: int
    soil_name: str
    field_capacity_pct: float
    wilting_point_pct: float
    infiltration_rate_mmh: float
    description: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)
