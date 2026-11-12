import asyncio
import pytest
from backend.app.models.field import Field
from backend.app.schemas.assistant_schemas import AssistantQueryRequest
from backend.app.services.ai_assistant_service import AiAssistantService

def test_grounded_ai_assistant_rule_fallback_and_citations():
    test_field = Field(
        id="field-01",
        name="North Valley Maize",
        area_ha=2.5,
        crop_type="Maize",
        growth_stage="Mid-season",
        soil_type="Loamy",
        root_depth_m=0.8,
        volumetric_moisture=21.0,
        field_capacity=31.0,
        wilting_point=14.0,
        allowable_depletion_fraction=0.55,
        application_efficiency=0.85,
        pump_capacity_m3h=25.0,
        temperature_c=29.0,
        relative_humidity=42.0,
        wind_speed_ms=2.1,
        solar_radiation_mj=22.0,
        rainfall_mm=0.0,
        current_depletion_mm=80.0,
        latitude=36.7783,
        longitude=-119.4179,
        location_name="Fresno, CA",
        weather_source="SIMULATED"
    )
    
    req = AssistantQueryRequest(
        field_id="field-01",
        query="How much water does my field need right now, and what is the pump operating time?",
        mode_preference="RULE_FALLBACK"
    )
    
    resp = asyncio.run(AiAssistantService.answer_query(test_field, req))
    
    assert resp.is_grounded is True
    assert resp.mode_used == "RULE_BASED_MATHEMATICAL_FALLBACK"
    # Citations must be present and link back to factual field records
    assert len(resp.evidence_citations) > 0
    citation_labels = [c.label for c in resp.evidence_citations]
    assert "Total Available Water (TAW)" in citation_labels
    assert "Gross Irrigation Requirement" in citation_labels
    assert "Pump Operating Duration" in citation_labels
    
    # Text must include the calculated gross volume and pump time
    assert "m³" in resp.answer
    assert "hours" in resp.answer
