import pytest
from backend.app.services.soil_water_balance import SoilWaterBalanceService
from backend.app.schemas.agronomy_schemas import CropWaterBalanceDayInput

def test_taw_and_raw_calculation():
    # Loam: FC = 31%, PWP = 14%, Zr = 0.8 m
    # TAW = 1000 * (0.31 - 0.14) * 0.8 = 1000 * 0.17 * 0.8 = 136.0 mm
    taw = SoilWaterBalanceService.calculate_taw(31.0, 14.0, 0.8)
    assert taw == 136.0
    
    # RAW with p=0.5, ETc=5.0 -> p_adj = 0.5 + 0.04*(5-5) = 0.5
    # RAW = 0.5 * 136 = 68.0 mm
    raw, p_adj = SoilWaterBalanceService.calculate_raw(taw, 0.5, etc_mm=5.0)
    assert raw == 68.0
    assert p_adj == 0.5

def test_stress_factor_ks():
    taw = 100.0
    raw = 50.0
    
    # Below RAW -> No stress
    assert SoilWaterBalanceService.calculate_water_stress_ks(40.0, taw, raw) == 1.0
    assert SoilWaterBalanceService.calculate_water_stress_ks(50.0, taw, raw) == 1.0
    
    # Midpoint between RAW and TAW -> Ks = (100 - 75) / (100 - 50) = 25/50 = 0.5
    assert SoilWaterBalanceService.calculate_water_stress_ks(75.0, taw, raw) == 0.5
    
    # Depletion at or above TAW -> Complete wilting (Ks = 0)
    assert SoilWaterBalanceService.calculate_water_stress_ks(100.0, taw, raw) == 0.0

def test_deep_percolation_on_excess_inflow():
    # If initial Dr = 20 mm, and inflow = 50 mm (e.g. 50mm rain)
    # Root zone only has room for 20 mm -> DP should be 30 mm, intermediate Dr = 0 mm
    day_inps = [
        CropWaterBalanceDayInput(
            day=1,
            rainfall_mm=50.0,
            irrigation_supplied_mm=0.0,
            et0_mm=5.0,
            kc=1.0,
            root_depth_m=1.0
        )
    ]
    res = SoilWaterBalanceService.simulate_multiday_balance(
        field_id="test",
        initial_dr_mm=20.0,
        fc_pct=30.0,
        pwp_pct=15.0,
        root_depth_m=1.0,
        default_p=0.5,
        daily_inputs=day_inps,
        application_efficiency=0.9
    )
    step1 = res.steps[0]
    assert step1.deep_percolation_mm > 0.0
    assert step1.dr_next_mm < 20.0 # Refilled, only reduced by daily ETc
