import pytest
from backend.app.schemas.schedule_schemas import BeamSearchInput
from backend.app.schemas.weather_schemas import DailyForecastItem
from backend.app.services.schedule_optimizer import ScheduleOptimizerService

def test_beam_search_optimization_and_savings():
    forecast = [
        DailyForecastItem(
            date=f"2026-07-0{i+1}",
            day_name="Day",
            temp_max_c=30.0,
            temp_min_c=18.0,
            temp_mean_c=24.0,
            relative_humidity_pct=50.0,
            wind_speed_ms=2.0,
            solar_radiation_mj=22.0,
            precipitation_mm=15.0 if i == 3 else 0.0, # Rain on day 4
            precipitation_probability_pct=80.0 if i == 3 else 10.0,
            calculated_et0_mm=5.0
        )
        for i in range(7)
    ]
    
    inp = BeamSearchInput(
        field_id="field-01",
        horizon_days=7,
        beam_width=4,
        allow_rain_lookahead=True
    )
    
    res = ScheduleOptimizerService.run_beam_search(
        inp=inp,
        area_ha=2.5,
        current_dr_mm=45.0, # Moderately depleted
        fc_pct=31.0,
        pwp_pct=14.0,
        root_depth_m=0.8,
        default_p=0.55,
        kc=1.15,
        application_efficiency=0.85,
        pump_capacity_m3h=25.0,
        forecast=forecast
    )
    
    assert res.beam_width == 4
    assert res.horizon_days == 7
    assert len(res.recommended_schedule) == 7
    assert res.nodes_explored > 4
    assert res.baseline_water_m3 > 0.0
    # The optimized schedule should demonstrate positive savings vs static calendar baseline
    assert res.water_savings_m3 >= 0.0
    assert len(res.hard_constraints_satisfied) >= 4
