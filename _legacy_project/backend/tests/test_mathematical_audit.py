import math
import pytest
from backend.app.schemas.agronomy_schemas import (
    PenmanMonteithInput,
    HargreavesInput,
    CropWaterBalanceDayInput
)
from backend.app.services.evapotranspiration_service import EvapotranspirationService
from backend.app.services.soil_water_balance import SoilWaterBalanceService
from backend.app.services.irrigation_calculator import IrrigationCalculatorService
from backend.app.services.field_service import FieldService

# =====================================================================
# AUDIT TEST 1: FAO-56 Penman-Monteith Table 17 Benchmark & Equation Auditing
# =====================================================================
def test_audit_fao56_penman_monteith_table17_independent():
    """
    FAO-56 Chapter 4 Table 17 Benchmark (Brussels, 6 July):
    Latitude = 50.8° N, Elevation = 100 m, Day = 187
    Tmax = 21.5 °C, Tmin = 12.3 °C, Tmean = 16.9 °C
    RHmean = 78.0 %, u2 = 2.07 m/s, Rs = 22.07 MJ/m2/day
    Reference ET0 ≈ 3.9 mm/day
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
    res = EvapotranspirationService.calculate_penman_monteith(inp)
    
    # 1. Atmospheric pressure: P = 101.3 * ((293 - 0.0065*100)/293)^5.26 = 100.1 kPa
    assert res.intermediate_variables.atmospheric_pressure_kpa == pytest.approx(100.1, abs=0.1)
    
    # 2. Psychrometric constant: gamma = 0.000665 * 100.1 = 0.0666 kPa/°C
    assert res.intermediate_variables.psychrometric_constant_kpa_c == pytest.approx(0.0666, abs=0.001)
    
    # 3. Saturation vapour pressure es:
    # e0(21.5) = 2.562 kPa, e0(12.3) = 1.430 kPa -> es = 1.996 kPa
    assert res.intermediate_variables.saturation_vapour_pressure_es_kpa == pytest.approx(1.996, abs=0.02)
    
    # 4. Actual vapour pressure: ea = es * 0.78 = 1.557 kPa
    assert res.intermediate_variables.actual_vapour_pressure_ea_kpa == pytest.approx(1.557, abs=0.02)
    
    # 5. Vapour pressure deficit: VPD = es - ea = 0.439 kPa
    assert res.intermediate_variables.vapour_pressure_deficit_vpd_kpa == pytest.approx(0.439, abs=0.02)
    
    # 6. Extraterrestrial radiation Ra: approx 41.1 MJ/m2/day
    assert res.intermediate_variables.extraterrestrial_radiation_ra_mj == pytest.approx(41.1, abs=0.5)
    
    # 7. Net radiation Rn > 0 and ET0 approx 3.9 mm/day
    assert res.intermediate_variables.net_radiation_rn_mj > 12.0
    assert res.et0_mm_day == pytest.approx(3.9, abs=0.25)

def test_audit_penman_monteith_percentage_vs_decimal_rh_parity():
    """
    Checks for percentage vs decimal RH errors:
    RH = 78.0 (%) vs RH = 0.78 (decimal fraction).
    Both MUST yield the exact same calculated ET0.
    """
    inp_pct = PenmanMonteithInput(
        temp_mean_c=22.0, temp_max_c=28.0, temp_min_c=16.0,
        relative_humidity_pct=78.0, wind_speed_ms=2.0, solar_radiation_mj=22.0,
        elevation_m=100.0, latitude_deg=36.7, day_of_year=180
    )
    inp_dec = PenmanMonteithInput(
        temp_mean_c=22.0, temp_max_c=28.0, temp_min_c=16.0,
        relative_humidity_pct=0.78, wind_speed_ms=2.0, solar_radiation_mj=22.0,
        elevation_m=100.0, latitude_deg=36.7, day_of_year=180
    )
    res_pct = EvapotranspirationService.calculate_penman_monteith(inp_pct)
    res_dec = EvapotranspirationService.calculate_penman_monteith(inp_dec)
    
    assert res_pct.et0_mm_day == res_dec.et0_mm_day
    assert res_pct.intermediate_variables.actual_vapour_pressure_ea_kpa == res_dec.intermediate_variables.actual_vapour_pressure_ea_kpa

def test_audit_penman_monteith_physical_edge_cases():
    """Validates temperature inversions, freezing temperatures, and non-negativity."""
    # Inverted temperatures: Tmin > Tmax
    inp_inv = PenmanMonteithInput(
        temp_mean_c=20.0, temp_max_c=15.0, temp_min_c=25.0, # Inverted!
        relative_humidity_pct=50.0, wind_speed_ms=2.0, solar_radiation_mj=20.0,
        elevation_m=100.0, latitude_deg=36.7, day_of_year=180
    )
    res_inv = EvapotranspirationService.calculate_penman_monteith(inp_inv)
    assert res_inv.et0_mm_day >= 0.0
    
    # Sub-freezing conditions: ET0 must not become negative
    inp_cold = PenmanMonteithInput(
        temp_mean_c=-8.0, temp_max_c=-3.0, temp_min_c=-13.0,
        relative_humidity_pct=85.0, wind_speed_ms=5.0, solar_radiation_mj=2.0,
        elevation_m=1500.0, latitude_deg=45.0, day_of_year=15
    )
    res_cold = EvapotranspirationService.calculate_penman_monteith(inp_cold)
    assert res_cold.et0_mm_day >= 0.0

# =====================================================================
# AUDIT TEST 2: Hargreaves-Samani Benchmark and Boundary Validation
# =====================================================================
def test_audit_hargreaves_samani_reference():
    """
    Hargreaves-Samani FAO-56 eq. 52:
    ET0 = 0.0023 * (Tmean + 17.8) * (Tmax - Tmin)^0.5 * Ra_mm
    For Tmean=24, Tmax=32, Tmin=16 -> delta_T = 16.0 -> sqrt(16) = 4.0
    T_factor = 24 + 17.8 = 41.8
    """
    inp = HargreavesInput(
        temp_mean_c=24.0,
        temp_max_c=32.0,
        temp_min_c=16.0,
        latitude_deg=36.7,
        day_of_year=180
    )
    res = EvapotranspirationService.calculate_hargreaves(inp)
    
    ra = res.ra_extraterrestrial_radiation_mj
    expected_et0 = round(0.0023 * (24.0 + 17.8) * math.sqrt(16.0) * (0.408 * ra), 2)
    assert res.et0_mm_day == pytest.approx(expected_et0, abs=0.01)
    assert res.delta_temperature_c == 16.0

def test_audit_hargreaves_sub_freezing_and_inversion():
    """Hargreaves equation with delta_T <= 0 or extreme cold."""
    # Flatline / inverted temp
    inp_flat = HargreavesInput(temp_mean_c=10.0, temp_max_c=10.0, temp_min_c=12.0, latitude_deg=30.0, day_of_year=100)
    res_flat = EvapotranspirationService.calculate_hargreaves(inp_flat)
    assert res_flat.et0_mm_day == 0.0
    
    # Severe cold: Tmean < -17.8°C
    inp_arctic = HargreavesInput(temp_mean_c=-25.0, temp_max_c=-20.0, temp_min_c=-30.0, latitude_deg=65.0, day_of_year=1)
    res_arctic = EvapotranspirationService.calculate_hargreaves(inp_arctic)
    assert res_arctic.et0_mm_day == 0.0

# =====================================================================
# AUDIT TEST 3: TAW and RAW Equations & Input Unit Robustness
# =====================================================================
def test_audit_taw_raw_percentage_vs_decimal_parity():
    """
    TAW = 1000 * (FC - PWP) * Zr
    Test that FC=31.0% / PWP=14.0% gives EXACT same TAW as FC=0.31 / PWP=0.14.
    """
    taw_pct = SoilWaterBalanceService.calculate_taw(31.0, 14.0, 0.9)
    taw_dec = SoilWaterBalanceService.calculate_taw(0.31, 0.14, 0.9)
    
    # 1000 * (0.31 - 0.14) * 0.9 = 1000 * 0.17 * 0.9 = 153.0 mm
    assert taw_pct == 153.0
    assert taw_dec == 153.0
    assert taw_pct == taw_dec

def test_audit_taw_root_depth_unit_guard():
    """
    Detects if root depth Zr is entered in mm (e.g. 900 mm) vs meters (0.9 m).
    Both must yield TAW = 153.0 mm.
    """
    taw_m = SoilWaterBalanceService.calculate_taw(31.0, 14.0, 0.9)
    taw_mm = SoilWaterBalanceService.calculate_taw(31.0, 14.0, 900.0)
    assert taw_m == taw_mm == 153.0

def test_audit_taw_physical_constraint_fc_greater_than_pwp():
    """Soil physics strictly requires FC > PWP. Invalid inputs must raise ValueError."""
    with pytest.raises(ValueError):
        SoilWaterBalanceService.calculate_taw(12.0, 15.0, 1.0) # PWP > FC
        
    with pytest.raises(ValueError):
        SoilWaterBalanceService.calculate_taw(20.0, 20.0, 1.0) # PWP == FC

def test_audit_raw_depletion_fraction_parity_and_adaptation():
    """
    RAW = p_adj * TAW
    FAO-56 eq. 89: p_adj = p + 0.04 * (5.0 - ETc)
    Test percentage (55%) vs decimal (0.55) parity for p.
    """
    taw = 150.0
    raw_dec, p_adj_dec = SoilWaterBalanceService.calculate_raw(taw, 0.55, etc_mm=5.0)
    raw_pct, p_adj_pct = SoilWaterBalanceService.calculate_raw(taw, 55.0, etc_mm=5.0)
    
    assert raw_dec == raw_pct == round(0.55 * 150.0, 2) == 82.5
    assert p_adj_dec == p_adj_pct == 0.55
    
    # When ETc = 7.5 mm/day (high evaporative demand), p decreases (stress starts sooner)
    raw_high_et, p_high_et = SoilWaterBalanceService.calculate_raw(taw, 0.55, etc_mm=7.5)
    # p_adj = 0.55 + 0.04*(5.0 - 7.5) = 0.55 - 0.10 = 0.45
    assert p_high_et == 0.45
    assert raw_high_et == round(0.45 * 150.0, 2) == 67.5

# =====================================================================
# AUDIT TEST 4: Water Stress Coefficient Ks Spectrum & Zero-Division Safeguard
# =====================================================================
def test_audit_water_stress_ks_full_spectrum():
    """
    FAO-56 eq. 84:
    If Dr <= RAW: Ks = 1.0
    If Dr > RAW: Ks = (TAW - Dr) / (TAW - RAW)
    If Dr >= TAW: Ks = 0.0
    """
    taw = 120.0
    raw = 60.0
    
    # Dr in [0, RAW] -> Ks = 1.0
    assert SoilWaterBalanceService.calculate_water_stress_ks(0.0, taw, raw) == 1.0
    assert SoilWaterBalanceService.calculate_water_stress_ks(30.0, taw, raw) == 1.0
    assert SoilWaterBalanceService.calculate_water_stress_ks(60.0, taw, raw) == 1.0
    
    # Linear reduction
    # Dr = 90 mm: Ks = (120 - 90)/(120 - 60) = 30/60 = 0.50
    assert SoilWaterBalanceService.calculate_water_stress_ks(90.0, taw, raw) == 0.50
    # Dr = 75 mm: Ks = (120 - 75)/60 = 45/60 = 0.75
    assert SoilWaterBalanceService.calculate_water_stress_ks(75.0, taw, raw) == 0.75
    
    # Wilting point reached and exceeded
    assert SoilWaterBalanceService.calculate_water_stress_ks(120.0, taw, raw) == 0.0
    assert SoilWaterBalanceService.calculate_water_stress_ks(150.0, taw, raw) == 0.0

def test_audit_water_stress_ks_zero_division_guard():
    """If TAW == RAW, denominator (TAW - RAW) is zero. Must not raise ZeroDivisionError."""
    assert SoilWaterBalanceService.calculate_water_stress_ks(40.0, 50.0, 50.0) == 1.0
    assert SoilWaterBalanceService.calculate_water_stress_ks(55.0, 50.0, 50.0) == 0.0

# =====================================================================
# AUDIT TEST 5: Crop Coefficients (Kc) Stage & FAO-56 Climate Adjustment
# =====================================================================
def test_audit_crop_coefficients_stage_and_climate():
    """Verifies crop coefficients across growth stages and FAO-56 climate adaptation."""
    # Maize standard stages
    kc_ini = FieldService.calculate_crop_coefficient("Maize", "Initial")
    kc_veg = FieldService.calculate_crop_coefficient("Maize", "Vegetative")
    kc_mid = FieldService.calculate_crop_coefficient("Maize", "Mid-season")
    kc_end = FieldService.calculate_crop_coefficient("Maize", "Late")
    
    assert kc_ini == 0.30
    assert kc_veg == pytest.approx((0.30 + 1.20) / 2.0, abs=0.01) # 0.75
    assert kc_mid == 1.20
    assert kc_end == 0.60
    
    # Climate adjustment for Maize mid-season (FAO-56 eqs. 62 & 65)
    # Arid & windy: u2 = 4.0 m/s, RHmin = 25%, height = 2.0m
    # adj = (0.04*(4 - 2) - 0.004*(25 - 45)) * (2.0/3.0)^0.3 = (0.08 + 0.08) * 0.885 = 0.142
    # Kc_mid_adj = 1.20 + 0.142 = 1.342
    kc_arid = FieldService.calculate_crop_coefficient(
        crop_name="Maize",
        growth_stage="Mid-season",
        wind_speed_ms=4.0,
        rh_min_pct=25.0,
        crop_height_m=2.0
    )
    assert kc_arid > 1.20
    assert kc_arid == pytest.approx(1.342, abs=0.02)

# =====================================================================
# AUDIT TEST 6: Effective Rainfall & USDA-SCS Curve Number Runoff
# =====================================================================
def test_audit_effective_rainfall_usda_scs():
    """
    USDA-SCS Curve Number Runoff Model:
    CN = 75 -> S = (25400/75) - 254 = 84.67 mm
    Ia = 0.2 * S = 16.93 mm
    """
    # 1. P <= Ia: Rain completely abstracted, RO = 0
    ro_light = SoilWaterBalanceService.calculate_runoff_usda_scs(10.0, curve_number=75.0)
    assert ro_light == 0.0
    
    # 2. P > Ia: P = 50.0 mm
    # RO = (50 - 16.93)^2 / (50 - 16.93 + 84.67) = 33.07^2 / 117.74 = 1093.62 / 117.74 = 9.29 mm
    ro_heavy = SoilWaterBalanceService.calculate_runoff_usda_scs(50.0, curve_number=75.0)
    assert ro_heavy == pytest.approx(9.29, abs=0.05)
    
    # Runoff must never exceed rainfall
    assert ro_heavy < 50.0
    assert ro_heavy >= 0.0

# =====================================================================
# AUDIT TEST 7: Root-Zone Depletion Continuity & Deep Percolation Conservation
# =====================================================================
def test_audit_soil_water_balance_continuity_and_percolation():
    """
    Continuity: Dr(t) = Dr(t-1) - (P - RO) - I_net - CR + ETc_adj + DP
    Mass conservation check:
    Storage change Delta_S = Dr(t-1) - Dr(t) = Inflows - ETc_adj - DP
    """
    # 3-day scenario
    inputs = [
        # Day 1: Moderate ET, no rain -> Dr increases
        CropWaterBalanceDayInput(day=1, rainfall_mm=0.0, irrigation_supplied_mm=0.0, et0_mm=5.0, kc=1.0, root_depth_m=1.0),
        # Day 2: Heavy irrigation (40 mm supplied at 85% Ea = 34 mm net)
        CropWaterBalanceDayInput(day=2, rainfall_mm=0.0, irrigation_supplied_mm=40.0, et0_mm=5.0, kc=1.0, root_depth_m=1.0),
        # Day 3: Heavy rain (60 mm) that exceeds root-zone capacity -> triggers deep percolation
        CropWaterBalanceDayInput(day=3, rainfall_mm=60.0, irrigation_supplied_mm=0.0, et0_mm=4.0, kc=1.0, root_depth_m=1.0)
    ]
    
    res = SoilWaterBalanceService.simulate_multiday_balance(
        field_id="audit-field",
        initial_dr_mm=30.0,
        fc_pct=30.0,
        pwp_pct=15.0,
        root_depth_m=1.0,
        default_p=0.5,
        daily_inputs=inputs,
        application_efficiency=0.85
    )
    
    s1 = res.steps[0]
    assert s1.dr_previous_mm == 30.0
    # Next Dr = 30.0 + 5.0 = 35.0 mm
    assert s1.dr_next_mm == 35.0
    
    s2 = res.steps[1]
    assert s2.dr_previous_mm == 35.0
    # Net irrigation = 40 * 0.85 = 34.0 mm
    assert s2.irrigation_net_mm == 34.0
    # Dr before ETc = 35.0 - 34.0 = 1.0 mm. Next Dr = 1.0 + 5.0 = 6.0 mm
    assert s2.dr_next_mm == 6.0
    
    s3 = res.steps[2]
    assert s3.dr_previous_mm == 6.0
    # Rainfall = 60.0 mm. Since Dr was only 6.0 mm, soil can only absorb 6.0 mm before reaching FC
    # Surplus must be partitioned to deep percolation DP
    assert s3.deep_percolation_mm > 0.0
    assert s3.effective_rainfall_mm <= 6.0
    # Depletion cannot be negative
    assert s3.dr_next_mm >= 0.0
    
    # Cumulative Mass Balance Verification
    total_inflow = res.total_effective_rainfall_mm + res.total_irrigation_net_mm
    total_outflow = res.total_crop_et_mm
    # Net depletion change from start (30.0) to finish (res.steps[-1].dr_next_mm)
    expected_dr = 30.0 - total_inflow + total_outflow
    assert res.steps[-1].dr_next_mm == pytest.approx(expected_dr, abs=0.05)

# =====================================================================
# AUDIT TEST 8: Net & Gross Irrigation Depths and Application Efficiency
# =====================================================================
def test_audit_net_and_gross_irrigation_depths():
    """
    Net Depth: Inet = max(0, Dr)
    Gross Depth: Igross = Inet / Ea
    Checks:
    - Ea percentage (85%) vs decimal (0.85) produces identical gross depth.
    - Saturated soil (Dr <= 0) produces zero net and gross requirement (no negative watering).
    - Igross >= Inet always holds.
    """
    # 1. Decimal vs percentage efficiency parity
    net_depth = 42.5 # mm
    gross_dec = IrrigationCalculatorService.calculate_gross_depth(net_depth, 0.85)
    gross_pct = IrrigationCalculatorService.calculate_gross_depth(net_depth, 85.0)
    
    # 42.5 / 0.85 = 50.0 mm
    assert gross_dec == 50.0
    assert gross_pct == 50.0
    assert gross_dec == gross_pct
    
    # 2. Saturated / negative depletion check
    assert IrrigationCalculatorService.calculate_net_depth(-10.0) == 0.0
    assert IrrigationCalculatorService.calculate_gross_depth(-10.0, 0.85) == 0.0
    
    # 3. Igross >= Inet across all efficiency levels
    for ea in [0.50, 0.70, 0.85, 0.95, 1.0]:
        gross = IrrigationCalculatorService.calculate_gross_depth(30.0, ea)
        assert gross >= 30.0

# =====================================================================
# AUDIT TEST 9: Water Volume Scaling and Pump Operating Time
# =====================================================================
def test_audit_water_volume_and_pump_duration_dimensional():
    """
    Dimensional Verification:
    1 mm over 1 ha (10,000 m2) = 0.001 m * 10,000 m2 = 10 m3
    Volume (m3) = Depth (mm) * Area (ha) * 10
    Volume (Liters) = Volume (m3) * 1000
    Pump Operating Time (h) = Volume (m3) / Pump Capacity (m3/h)
    """
    gross_depth_mm = 25.0
    area_ha = 4.2
    pump_capacity_m3h = 35.0
    
    # Volume m3: 25.0 * 4.2 * 10.0 = 1050.0 m3
    v_m3, v_liters = IrrigationCalculatorService.calculate_water_volume(gross_depth_mm, area_ha)
    assert v_m3 == 1050.0
    
    # Volume Liters: 1050.0 * 1000 = 1,050,000 Liters
    assert v_liters == 1050000.0
    
    # Pump hours: 1050.0 / 35.0 = 30.0 hours
    hours = IrrigationCalculatorService.calculate_pump_operating_time(v_m3, pump_capacity_m3h)
    assert hours == 30.0
    
    # Zero or negative pump capacity safeguard
    assert IrrigationCalculatorService.calculate_pump_operating_time(v_m3, 0.0) == 0.0
    assert IrrigationCalculatorService.calculate_pump_operating_time(v_m3, -10.0) == 0.0
    assert IrrigationCalculatorService.calculate_pump_operating_time(0.0, 35.0) == 0.0

def test_audit_full_irrigation_calculator_requirement_service():
    """Validates complete end-to-end service output, volume, pump hours, and recommendation tiers."""
    # Scenario A: Dr = 45.0 mm < 0.7 * RAW (74.8 mm) -> NO_IRRIGATION
    calc_ok = IrrigationCalculatorService.calculate_requirement(
        field_id="field-audit",
        area_ha=2.5,
        current_dr_mm=45.0,
        fc_pct=31.0,
        pwp_pct=14.0,
        root_depth_m=0.8,
        default_p=0.55,
        application_efficiency=0.90, # 90% drip efficiency
        pump_capacity_m3h=25.0
    )
    
    assert calc_ok.current_depletion_dr_mm == 45.0
    assert calc_ok.net_irrigation_depth_mm == 45.0
    # Gross depth = 45.0 / 0.90 = 50.0 mm
    assert calc_ok.gross_irrigation_depth_mm == 50.0
    # Volume = 50.0 * 2.5 * 10.0 = 1250.0 m3
    assert calc_ok.irrigation_water_volume_m3 == 1250.0
    assert calc_ok.irrigation_water_volume_liters == 1250000.0
    # Pump hours = 1250.0 / 25.0 = 50.0 hours
    assert calc_ok.pump_operating_time_hours == 50.0
    assert calc_ok.recommendation_tier == "NO_IRRIGATION"
    assert "TAW" in calc_ok.formula_audit
    assert "Volume (m³)" in calc_ok.formula_audit

    # Scenario B: Dr = 80.0 mm > RAW (74.8 mm) -> RECOMMENDED
    calc_rec = IrrigationCalculatorService.calculate_requirement(
        field_id="field-audit",
        area_ha=2.5,
        current_dr_mm=80.0,
        fc_pct=31.0,
        pwp_pct=14.0,
        root_depth_m=0.8,
        default_p=0.55,
        application_efficiency=0.90,
        pump_capacity_m3h=25.0
    )
    assert calc_rec.recommendation_tier == "RECOMMENDED"

    # Scenario C: Dr = 120.0 mm >= 0.85 * TAW (115.6 mm) -> CRITICAL
    calc_crit = IrrigationCalculatorService.calculate_requirement(
        field_id="field-audit",
        area_ha=2.5,
        current_dr_mm=120.0,
        fc_pct=31.0,
        pwp_pct=14.0,
        root_depth_m=0.8,
        default_p=0.55,
        application_efficiency=0.90,
        pump_capacity_m3h=25.0
    )
    assert calc_crit.recommendation_tier == "CRITICAL"
