import pytest
from backend.app.schemas.weather_schemas import DailyForecastItem
from backend.app.services.multi_agent_orchestrator import MultiAgentOrchestratorService

def test_six_agents_coordination_and_conflict_arbitration():
    # Scenario: Soil is in deficit (Dr = 80mm > RAW = ~74.8mm),
    # but weather agent sees incoming rain (15mm within 24h).
    # Supervisor must detect conflict and arbitrate.
    forecast_rainy = [
        DailyForecastItem(
            date="2026-07-01",
            day_name="Wednesday",
            temp_max_c=28.0,
            temp_min_c=16.0,
            temp_mean_c=22.0,
            relative_humidity_pct=65.0,
            wind_speed_ms=2.5,
            solar_radiation_mj=18.0,
            precipitation_mm=15.0, # Rain storm incoming
            precipitation_probability_pct=85.0,
            calculated_et0_mm=4.2
        )
    ]
    
    res = MultiAgentOrchestratorService.execute_workflow(
        field_id="field-01",
        field_name="North Valley Maize",
        area_ha=4.2,
        crop_type="Maize",
        growth_stage="Mid-season",
        soil_type="Loamy",
        root_depth_m=0.8,
        volumetric_moisture=21.0,
        fc_pct=31.0,
        pwp_pct=14.0,
        default_p=0.55,
        kc=1.20,
        application_efficiency=0.88,
        pump_capacity_m3h=35.0,
        current_dr_mm=80.0, # Exceeds RAW (74.8mm)
        forecast=forecast_rainy
    )
    
    # Check that exactly 6 agents participated
    agent_ids = [a.agent_id for a in res.agents]
    assert len(agent_ids) == 6
    assert "soil_monitor" in agent_ids
    assert "weather_analyst" in agent_ids
    assert "rule_evaluator" in agent_ids
    assert "irrigation_planner" in agent_ids
    assert "water_optimizer" in agent_ids
    assert "supervisor" in agent_ids
    
    # Conflict should be detected between soil deficit and incoming rain
    assert res.conflict_detected is True
    assert "CONFLICT DETECTED" in res.conflict_details
    assert res.conflict_resolution is not None
    # Mandatory human approval required
    assert res.human_approval_required is True
