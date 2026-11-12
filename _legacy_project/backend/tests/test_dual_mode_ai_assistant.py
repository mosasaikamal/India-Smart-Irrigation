import asyncio
from datetime import datetime, timezone
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.database import Base
from backend.app.config import settings
from backend.app.models.field import Field
from backend.app.models.weather import WeatherCache
from backend.app.models.rule import AgriculturalRuleModel, RuleExecutionLog
from backend.app.models.schedule import IrrigationScheduleRecord
from backend.app.models.agent import AgentRunLog, AgentMessageLog
from backend.app.models.edge import EdgeDeviceModel, EdgeTelemetryLog
from backend.app.schemas.assistant_schemas import AssistantQueryRequest
from backend.app.services.ai_assistant_service import AiAssistantService


@pytest.fixture(scope="module")
def assistant_db():
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    # Seed test field
    field = Field(
        id="field-ai-test",
        name="Sector Gamma North",
        crop_type="Maize",
        growth_stage="Mid-Season",
        soil_type="Sandy Loam",
        area_ha=8.0,
        field_capacity=22.0,
        wilting_point=10.0,
        root_depth_m=1.0,
        allowable_depletion_fraction=0.55,
        application_efficiency=0.85,
        pump_capacity_m3h=50.0,
        volumetric_moisture=14.0,
        current_depletion_mm=80.0,
        latitude=36.7783,
        longitude=-119.4179,
        temperature_c=29.5,
        relative_humidity=35.0,
        wind_speed_ms=2.4,
        rainfall_mm=0.0,
        weather_source="LIVE_API",
        location_name="Fresno County"
    )
    db.add(field)

    # Seed weather cache
    weather = WeatherCache(
        location_name="Fresno County",
        latitude=36.7783,
        longitude=-119.4179,
        forecast_date="2026-11-02",
        temp_max_c=32.0,
        temp_min_c=18.0,
        temp_mean_c=25.0,
        relative_humidity_pct=38.0,
        wind_speed_ms=2.2,
        solar_radiation_mj=22.5,
        precipitation_mm=0.0,
        calculated_et0_mm=5.1,
        source="LIVE_API",
        fetched_at=datetime.now(timezone.utc)
    )
    db.add(weather)

    # Seed agricultural rule
    rule = AgriculturalRuleModel(
        id="RULE-AI-01",
        code="DEPLETION_CRITICAL",
        name="Critical Depletion Refill Trigger",
        category="Triggering",
        conditions_json='[{"field": "depletion_ratio", "operator": ">=", "value": 1.0}]',
        conclusion="Irrigate immediately to prevent yield loss",
        action="TRIGGER_IRRIGATION",
        priority=1,
        is_active=True,
        explanation="Crop is undergoing moisture deficit exceeding RAW."
    )
    db.add(rule)

    rule_log = RuleExecutionLog(
        rule_id="RULE-AI-01",
        field_id="field-ai-test",
        evaluated_at=datetime.now(timezone.utc),
        inputs_json='{"dr": 80.0, "raw": 66.0}',
        condition_matched=True,
        action_taken="TRIGGER_IRRIGATION",
        execution_trace="Rule RULE-AI-01 matched: dr (80.0) >= raw (66.0)"
    )
    db.add(rule_log)

    # Seed Beam Search schedule
    schedule = IrrigationScheduleRecord(
        id="sched-ai-01",
        field_id="field-ai-test",
        algorithm_name="Beam Search",
        horizon_days=7,
        beam_width=4,
        nodes_explored=42,
        total_water_m3=3200.0,
        total_stress_index=0.02,
        baseline_water_m3=4500.0,
        water_savings_m3=1300.0,
        water_savings_pct=28.89,
        recommended_plan_json='[{"day": 1, "action": "IRRIGATE", "depth_mm": 40.0}]',
        selection_reason="Optimized water conservation while keeping Ks >= 0.98",
        created_at=datetime.now(timezone.utc)
    )
    db.add(schedule)

    # Seed agent run log
    agent_run = AgentRunLog(
        id="run-ai-01",
        field_id="field-ai-test",
        timestamp=datetime.now(timezone.utc),
        supervisor_summary="Unanimous agreement: Soil depletion critical, no rain in 72h window, pump capacity feasible.",
        consensus_reached=True,
        conflict_detected=False,
        final_action="IRRIGATE_NOW",
        recommended_depth_mm=80.0,
        recommended_volume_m3=7529.41,
        pump_hours=15.06,
        human_approval_status="APPROVED",
        approved_by="Lead Agronomist",
        approved_at=datetime.now(timezone.utc),
        blackboard_snapshot_json='{}'
    )
    db.add(agent_run)

    # Seed edge device
    device = EdgeDeviceModel(
        id="ESP32-AI-01",
        name="Field Sensor Node Alpha",
        field_id="field-ai-test",
        auth_token="secret-token-ai",
        status="ONLINE",
        battery_level_pct=92.5,
        firmware_version="v2.1.0",
        is_simulated=True,
        local_threshold_moisture=18.0,
        last_heartbeat=datetime.now(timezone.utc)
    )
    db.add(device)

    telemetry = EdgeTelemetryLog(
        device_id="ESP32-AI-01",
        field_id="field-ai-test",
        recorded_at=datetime.now(timezone.utc),
        synced_at=datetime.now(timezone.utc),
        moisture_pct=14.0,
        temp_c=29.5,
        humidity_pct=35.0,
        rain_detected=False,
        battery_pct=92.5,
        local_action_taken="NONE",
        was_offline_buffered=False
    )
    db.add(telemetry)

    db.commit()
    yield db
    db.close()


def test_rag_context_multi_domain_retrieval(assistant_db):
    field = assistant_db.query(Field).filter(Field.id == "field-ai-test").first()
    ctx, citations = AiAssistantService.build_rag_context(field, assistant_db)

    # Assert 6+ domains in context
    assert ctx["field_id"] == "field-ai-test"
    assert ctx["crop"] == "Maize"
    assert ctx["dr"] == 80.0
    assert ctx["weather"]["et0"] > 0
    assert ctx["rules"]["active_count"] >= 1
    assert ctx["schedule"]["water_savings_pct"] == 28.89
    assert ctx["schedule"]["nodes_explored"] == 42
    assert ctx["agents"]["final_action"] == "IRRIGATE_NOW"
    assert ctx["agents"]["human_approval"] == "APPROVED"
    assert ctx["edge"]["device_id"] == "ESP32-AI-01"

    # Assert citations have provenance metadata
    assert len(citations) >= 8
    categories = {c.category for c in citations}
    assert "Field Record" in categories
    assert "FAO-56 Calculation" in categories
    assert "Hydraulic Calculation" in categories
    assert "Weather Data" in categories
    assert "Agricultural Rules" in categories
    assert "Optimization Schedule" in categories
    assert "Multi-Agent Consensus" in categories
    assert "Edge Sensor" in categories

    for c in citations:
        assert c.field_id == "field-ai-test"
        assert c.timestamp is not None
        assert c.calculation_method is not None


def test_rule_fallback_irrigation_requirement_math(assistant_db):
    field = assistant_db.query(Field).filter(Field.id == "field-ai-test").first()
    req = AssistantQueryRequest(
        field_id="field-ai-test",
        query="How much water does my field need right now and how long will the pump run?",
        mode_preference="RULE_FALLBACK"
    )
    resp = asyncio.run(AiAssistantService.answer_query(field, req, assistant_db))

    assert resp.mode_used == "RULE_BASED_MATHEMATICAL_FALLBACK"
    assert resp.is_grounded is True
    assert resp.unsupported_elements_noted is False
    assert "IRRIGATION REQUIRED IMMEDIATELY" in resp.answer
    assert "80.0 mm" in resp.answer # Net depth
    assert "Gross Application Depth" in resp.answer
    assert "Estimated Pump Run Duration" in resp.answer
    assert any("TAW = 1000" in f for f in resp.referenced_formulas)


def test_rule_fallback_weather_and_et0(assistant_db):
    field = assistant_db.query(Field).filter(Field.id == "field-ai-test").first()
    req = AssistantQueryRequest(
        field_id="field-ai-test",
        query="Explain the FAO-56 Penman-Monteith calculation and current weather",
        mode_preference="RULE_FALLBACK"
    )
    resp = asyncio.run(AiAssistantService.answer_query(field, req, assistant_db))

    assert resp.mode_used == "RULE_BASED_MATHEMATICAL_FALLBACK"
    assert "Penman-Monteith" in resp.answer
    assert "Reference Evapotranspiration" in resp.answer
    assert any("ET0 =" in f for f in resp.referenced_formulas)
    assert any("ETc = Kc" in f for f in resp.referenced_formulas)


def test_rule_fallback_multi_agent_consensus(assistant_db):
    field = assistant_db.query(Field).filter(Field.id == "field-ai-test").first()
    req = AssistantQueryRequest(
        field_id="field-ai-test",
        query="Why did the supervisor decide on this action and were there conflicts?",
        mode_preference="RULE_FALLBACK"
    )
    resp = asyncio.run(AiAssistantService.answer_query(field, req, assistant_db))

    assert resp.mode_used == "RULE_BASED_MATHEMATICAL_FALLBACK"
    assert "Autonomous Multi-Agent Consensus Summary" in resp.answer
    assert "IRRIGATE_NOW" in resp.answer
    assert "Supervisor Agent" in resp.answer


def test_rule_fallback_beam_search_schedules(assistant_db):
    field = assistant_db.query(Field).filter(Field.id == "field-ai-test").first()
    req = AssistantQueryRequest(
        field_id="field-ai-test",
        query="What water savings did the Beam Search optimizer find vs baseline?",
        mode_preference="RULE_FALLBACK"
    )
    resp = asyncio.run(AiAssistantService.answer_query(field, req, assistant_db))

    assert resp.mode_used == "RULE_BASED_MATHEMATICAL_FALLBACK"
    assert "Beam Search Scheduling Optimization" in resp.answer
    assert "28.89%" in resp.answer
    assert "42" in resp.answer # Explored nodes


def test_rule_fallback_edge_iot_sensors(assistant_db):
    field = assistant_db.query(Field).filter(Field.id == "field-ai-test").first()
    req = AssistantQueryRequest(
        field_id="field-ai-test",
        query="What is the edge IoT sensor status and battery level?",
        mode_preference="RULE_FALLBACK"
    )
    resp = asyncio.run(AiAssistantService.answer_query(field, req, assistant_db))

    assert resp.mode_used == "RULE_BASED_MATHEMATICAL_FALLBACK"
    assert "Edge AI & IoT Hardware Status" in resp.answer
    assert "ESP32-AI-01" in resp.answer
    assert "92.5%" in resp.answer


def test_out_of_domain_unsupported_queries(assistant_db):
    field = assistant_db.query(Field).filter(Field.id == "field-ai-test").first()
    req = AssistantQueryRequest(
        field_id="field-ai-test",
        query="Who was Julius Caesar and how do I bake an apple pie?",
        mode_preference="RULE_FALLBACK"
    )
    resp = asyncio.run(AiAssistantService.answer_query(field, req, assistant_db))

    assert resp.mode_used == "RULE_BASED_MATHEMATICAL_FALLBACK"
    assert resp.unsupported_elements_noted is True
    assert "Domain Boundary Notice" in resp.answer
    assert "Maize" in resp.answer
    assert "pie" not in resp.answer.lower()
    assert "caesar" not in resp.answer.lower()


def test_real_llm_mode_gemini_adapter_mocked(assistant_db, monkeypatch):
    field = assistant_db.query(Field).filter(Field.id == "field-ai-test").first()

    async def mock_gemini(query, context):
        return f"Grounded Gemini Answer: For Maize, root depletion is {context['dr']} mm. Gross irrigation is {context['gross_mm']} mm."

    monkeypatch.setattr(AiAssistantService, "_query_gemini_api", mock_gemini)
    monkeypatch.setattr(settings, "LLM_API_KEY", "mock-gemini-key")
    monkeypatch.setattr(settings, "LLM_PROVIDER", "gemini")

    req = AssistantQueryRequest(
        field_id="field-ai-test",
        query="How much water is needed?",
        mode_preference="REAL_LLM"
    )
    resp = asyncio.run(AiAssistantService.answer_query(field, req, assistant_db))

    assert resp.mode_used == "REAL_LLM_GEMINI"
    assert resp.provider_status is not None
    assert "Google Gemini" in resp.provider_status
    assert "Grounded Gemini Answer" in resp.answer
    assert len(resp.evidence_citations) >= 8


def test_real_llm_mode_openai_adapter_mocked(assistant_db, monkeypatch):
    field = assistant_db.query(Field).filter(Field.id == "field-ai-test").first()

    async def mock_openai(query, context):
        return f"Grounded OpenAI Answer: For Maize, root depletion is {context['dr']} mm. Water volume is {context['vol_m3']} m³."

    monkeypatch.setattr(AiAssistantService, "_query_openai_api", mock_openai)
    monkeypatch.setattr(settings, "OPENAI_API_KEY", "mock-openai-key")
    monkeypatch.setattr(settings, "LLM_PROVIDER", "openai")

    req = AssistantQueryRequest(
        field_id="field-ai-test",
        query="What is the water volume requirement?",
        mode_preference="REAL_LLM"
    )
    resp = asyncio.run(AiAssistantService.answer_query(field, req, assistant_db))

    assert resp.mode_used == "REAL_LLM_OPENAI"
    assert resp.provider_status is not None
    assert "OpenAI" in resp.provider_status
    assert "Grounded OpenAI Answer" in resp.answer


def test_missing_credentials_graceful_fallback(assistant_db, monkeypatch):
    field = assistant_db.query(Field).filter(Field.id == "field-ai-test").first()
    monkeypatch.setattr(settings, "LLM_API_KEY", "")
    monkeypatch.setattr(settings, "OPENAI_API_KEY", "")

    req = AssistantQueryRequest(
        field_id="field-ai-test",
        query="How much water is needed?",
        mode_preference="REAL_LLM"
    )
    resp = asyncio.run(AiAssistantService.answer_query(field, req, assistant_db))

    assert resp.mode_used == "RULE_BASED_MATHEMATICAL_FALLBACK"
    assert "LLM API Key not configured" in resp.provider_status
    assert "IRRIGATION REQUIRED" in resp.answer


def test_api_error_graceful_fallback(assistant_db, monkeypatch):
    field = assistant_db.query(Field).filter(Field.id == "field-ai-test").first()

    async def mock_error(query, context):
        raise ConnectionError("Connection refused by provider host")

    monkeypatch.setattr(AiAssistantService, "_query_gemini_api", mock_error)
    monkeypatch.setattr(settings, "LLM_API_KEY", "mock-failing-key")
    monkeypatch.setattr(settings, "LLM_PROVIDER", "gemini")

    req = AssistantQueryRequest(
        field_id="field-ai-test",
        query="How much water is needed?",
        mode_preference="REAL_LLM"
    )
    resp = asyncio.run(AiAssistantService.answer_query(field, req, assistant_db))

    assert resp.mode_used == "RULE_BASED_MATHEMATICAL_FALLBACK"
    assert "ConnectionError" in resp.provider_status
    assert "smoothly fell back" in resp.provider_status
    assert "IRRIGATION REQUIRED" in resp.answer


def test_never_claim_fallback_is_generative_llm(assistant_db):
    field = assistant_db.query(Field).filter(Field.id == "field-ai-test").first()
    queries = [
        "How much water does my field need right now?",
        "Explain the Penman Monteith formula",
        "What did the supervisor decide?",
        "What water savings did Beam Search find?",
        "What is the status of the edge ESP32 sensor?",
        "Random out of domain question"
    ]
    for q in queries:
        req = AssistantQueryRequest(field_id="field-ai-test", query=q, mode_preference="RULE_FALLBACK")
        resp = asyncio.run(AiAssistantService.answer_query(field, req, assistant_db))

        assert resp.mode_used == "RULE_BASED_MATHEMATICAL_FALLBACK"
        lower_ans = resp.answer.lower()
        forbidden_phrases = [
            "as an ai language model",
            "as a generative model",
            "as an llm",
            "i am a large language model",
            "my neural network",
            "transformer weights"
        ]
        for phrase in forbidden_phrases:
            assert phrase not in lower_ans, f"Forbidden phrase '{phrase}' found in deterministic fallback answer!"
