import pytest
import math
from backend.app.schemas.agronomy_schemas import PenmanMonteithInput, HargreavesInput
from backend.app.services.evapotranspiration_service import EvapotranspirationService

def test_fao56_table17_benchmark():
    """
    Validates FAO-56 Penman-Monteith calculation against published reference example
    from FAO Irrigation and Drainage Paper 56 (Allen et al., 1998, Chapter 4, Table 17).
    Standard conditions:
    Latitude: 50.8° N (Brussels, Belgium)
    Elevation: 100 m
    Day of year: 187 (6 July)
    Tmax = 21.5 °C, Tmin = 12.3 °C, Tmean = 16.9 °C
    RHmean = 78.0 %
    Wind speed u2 = 2.07 m/s
    Solar radiation Rs = 22.07 MJ/m2/day
    Published benchmark ET0 ≈ 3.9 mm/day (tolerance ± 0.2 mm/day)
    """
    inp = PenmanMonteithInput(
        temp_mean_c=16.9,
        temp_max_c=21.5,
        temp_min_c=12.3,
        relative_humidity_pct=78.0,
        wind_speed_ms=2.07,
        solar_radiation_mj=22.07,
        elevation_m=100.0,
        latitude_deg=50.8,
        day_of_year=187
    )
    
    result = EvapotranspirationService.calculate_penman_monteith(inp)
    
    assert result.et0_mm_day == pytest.approx(3.9, abs=0.25)
    assert result.method_used == "FAO-56 Penman-Monteith"
    assert result.intermediate_variables.atmospheric_pressure_kpa == pytest.approx(100.1, abs=1.0)
    assert result.intermediate_variables.saturation_vapour_pressure_es_kpa == pytest.approx(1.99, abs=0.2)
    assert result.intermediate_variables.net_radiation_rn_mj > 0.0

def test_hargreaves_fallback():
    """Validates Hargreaves-Samani equation fallback"""
    inp = HargreavesInput(
        temp_mean_c=24.0,
        temp_max_c=32.0,
        temp_min_c=16.0,
        latitude_deg=36.7,
        day_of_year=180
    )
    res = EvapotranspirationService.calculate_hargreaves(inp)
    assert res.et0_mm_day > 2.0
    assert res.et0_mm_day < 8.0
    assert "Hargreaves-Samani" in res.method_used
    assert res.delta_temperature_c == 16.0
