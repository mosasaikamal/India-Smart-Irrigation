import pytest
from backend.app.services.agricultural_rule_engine import AgriculturalRuleEngineService, DEFAULT_RULES

def test_rule_triggering_and_postponement():
    # Case 1: Dr exceeds RAW -> R-TRIG-01 should fire
    facts_deficit = {
        "depletion_dr_mm": 65.0,
        "raw_mm": 50.0,
        "forecast_rain_24h_mm": 0.0,
        "volumetric_moisture_pct": 20.0,
        "field_capacity_pct": 32.0,
        "crop_stage": "Mid-season"
    }
    trace1 = AgriculturalRuleEngineService.evaluate_all("f1", facts_deficit, DEFAULT_RULES)
    fired_codes1 = [r.code for r in trace1.rules_fired]
    assert "R-TRIG-01" in fired_codes1
    assert trace1.top_recommended_action == "TRIGGER_IRRIGATION"
    
    # Case 2: Heavy rainfall forecasted -> R-RAIN-01 should fire and take priority
    facts_rain = {
        "depletion_dr_mm": 65.0,
        "raw_mm": 50.0,
        "forecast_rain_24h_mm": 18.0,
        "volumetric_moisture_pct": 20.0,
        "field_capacity_pct": 32.0,
        "crop_stage": "Mid-season"
    }
    trace2 = AgriculturalRuleEngineService.evaluate_all("f1", facts_rain, DEFAULT_RULES)
    fired_codes2 = [r.code for r in trace2.rules_fired]
    assert "R-RAIN-01" in fired_codes2
    # R-RAIN-01 has priority 1, so top recommendation should postpone
    assert trace2.top_recommended_action == "POSTPONE_RAIN"
