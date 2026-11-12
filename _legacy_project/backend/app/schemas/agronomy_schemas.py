from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class PenmanMonteithInput(BaseModel):
    temp_mean_c: float = Field(..., json_schema_extra={"example": 21.5}, description="Mean daily air temperature (°C)")
    temp_max_c: float = Field(..., json_schema_extra={"example": 28.0}, description="Maximum daily air temperature (°C)")
    temp_min_c: float = Field(..., json_schema_extra={"example": 15.0}, description="Minimum daily air temperature (°C)")
    relative_humidity_pct: float = Field(..., json_schema_extra={"example": 60.0}, description="Mean relative humidity (%)")
    wind_speed_ms: float = Field(..., json_schema_extra={"example": 2.0}, description="Wind speed at 2m (m/s)")
    solar_radiation_mj: float = Field(..., json_schema_extra={"example": 22.0}, description="Solar radiation Rs (MJ/m2/day)")
    elevation_m: float = Field(100.0, description="Station elevation above sea level (m)")
    latitude_deg: float = Field(36.7, description="Latitude in decimal degrees")
    day_of_year: int = Field(180, ge=1, le=366, description="Day of year (1-366)")
    albedo: float = Field(0.23, description="Canopy reflection coefficient (default 0.23)")

class IntermediateVariables(BaseModel):
    atmospheric_pressure_kpa: float
    psychrometric_constant_kpa_c: float
    delta_slope_vapour_pressure_kpa_c: float
    saturation_vapour_pressure_es_kpa: float
    actual_vapour_pressure_ea_kpa: float
    vapour_pressure_deficit_vpd_kpa: float
    extraterrestrial_radiation_ra_mj: float
    clear_sky_radiation_rso_mj: float
    net_solar_radiation_rns_mj: float
    net_longwave_radiation_rnl_mj: float
    net_radiation_rn_mj: float
    soil_heat_flux_g_mj: float

class PenmanMonteithResult(BaseModel):
    et0_mm_day: float
    method_used: str = "FAO-56 Penman-Monteith"
    formula: str
    intermediate_variables: IntermediateVariables
    input_values: Dict[str, Any]
    units: Dict[str, str]
    assumptions: List[str]

class HargreavesInput(BaseModel):
    temp_mean_c: float
    temp_max_c: float
    temp_min_c: float
    latitude_deg: float
    day_of_year: int

class HargreavesResult(BaseModel):
    et0_mm_day: float
    method_used: str = "Hargreaves-Samani (Fallback)"
    formula: str
    ra_extraterrestrial_radiation_mj: float
    delta_temperature_c: float
    input_values: Dict[str, Any]
    units: Dict[str, str]
    assumptions: List[str]

class CropWaterBalanceDayInput(BaseModel):
    day: int
    rainfall_mm: float
    irrigation_supplied_mm: float
    et0_mm: float
    kc: float
    root_depth_m: float
    water_table_depth_m: Optional[float] = None # For capillary rise

class WaterBalanceStep(BaseModel):
    day: int
    dr_previous_mm: float
    etc_mm: float
    ks_stress_factor: float
    etc_adjusted_mm: float
    rainfall_mm: float
    runoff_mm: float
    effective_rainfall_mm: float
    irrigation_net_mm: float
    capillary_rise_mm: float
    deep_percolation_mm: float
    dr_next_mm: float
    volumetric_moisture_pct: float
    is_stressed: bool

class WaterBalanceResult(BaseModel):
    field_id: str
    taw_mm: float
    raw_mm: float
    p_adjusted: float
    steps: List[WaterBalanceStep]
    total_rainfall_mm: float
    total_effective_rainfall_mm: float
    total_irrigation_net_mm: float
    total_deep_percolation_mm: float
    total_crop_et_mm: float
    stress_days_count: int
    formula: str
    assumptions: List[str]

class IrrigationRequirementCalculation(BaseModel):
    field_id: str
    area_ha: float
    current_depletion_dr_mm: float
    taw_mm: float
    raw_mm: float
    application_efficiency: float
    pump_capacity_m3h: float
    net_irrigation_depth_mm: float
    gross_irrigation_depth_mm: float
    irrigation_water_volume_m3: float
    irrigation_water_volume_liters: float
    pump_operating_time_hours: float
    formula_audit: Dict[str, str]
    intermediate_values: Dict[str, float]
    recommendation_tier: str # NO_IRRIGATION, WATCH, RECOMMENDED, CRITICAL
