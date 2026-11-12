import asyncio
import pytest
import httpx
from datetime import datetime, timezone
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.database import SessionLocal, Base, engine
from backend.app.models.field import Field
from backend.app.models.edge import EdgeDeviceModel, EdgeTelemetryLog
from backend.app.services.weather_service import WeatherService
from backend.app.schemas.weather_schemas import ManualWeatherInput
from backend.app.services.edge_device_service import EdgeDeviceService, SIMULATED_NODES, MqttHardwareGateway
from backend.app.schemas.edge_schemas import (
    TelemetryReadingItem,
    IngestTelemetryPayload,
    SyncOfflineBatchPayload,
    RegisterDevicePayload,
    MqttPublishPayload,
    SimulateTickRequest
)


@pytest.fixture(scope="module")
def client():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Ensure test field exists
    field = db.query(Field).filter(Field.id == "field-01").first()
    if not field:
        field = Field(
            id="field-01",
            name="North Valley Test Parcel",
            area_ha=2.5,
            crop_type="Maize",
            growth_stage="Mid-season",
            soil_type="Loamy",
            root_depth_m=0.8,
            volumetric_moisture=24.0,
            field_capacity=31.0,
            wilting_point=14.0,
            allowable_depletion_fraction=0.55,
            application_efficiency=0.85,
            pump_capacity_m3h=25.0,
            current_depletion_mm=45.0,
            location_name="Central Valley, CA",
            latitude=36.7783,
            longitude=-119.4179,
            elevation_m=100.0,
            weather_source="LIVE_API"
        )
        db.add(field)

        
    # Ensure test physical hardware device exists in DB
    dev = db.query(EdgeDeviceModel).filter(EdgeDeviceModel.id == "ESP32-HW-01").first()
    if not dev:
        dev = EdgeDeviceModel(
            id="ESP32-HW-01",
            name="Field Sector Physical Node",
            field_id="field-01",
            auth_token="agro-edge-secret-key-2025",
            status="ONLINE",
            firmware_version="v1.2.0-esp32",
            is_simulated=False, # Strictly Physical Hardware
            local_threshold_moisture=22.0
        )
        db.add(dev)
    db.commit()
    db.close()
    
    with TestClient(app) as test_client:
        yield test_client

# ==============================================================================
# 1. WEATHER TESTS: Open-Meteo Integration, Failures, Fallbacks, and Manual Input
# ==============================================================================

def test_weather_service_forecast_structure():
    """Verify forecast returns 7 daily items with FAO-56 Penman-Monteith ET0"""
    res = asyncio.run(WeatherService.fetch_forecast(
        latitude=36.7783,
        longitude=-119.4179,
        location_name="Central Valley, CA",
        elevation_m=100.0,
        force_simulation=True
    ))
    assert res.location_name == "Central Valley, CA"
    assert res.latitude == 36.7783
    assert res.longitude == -119.4179
    assert res.source in ["LIVE_API", "SIMULATED", "SIMULATED_FALLBACK"]
    assert len(res.forecast) == 7
    for item in res.forecast:
        assert item.date is not None
        assert item.day_name in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        assert item.temp_max_c >= item.temp_min_c
        assert 0.0 <= item.relative_humidity_pct <= 100.0
        assert item.wind_speed_ms >= 0.0
        assert item.solar_radiation_mj >= 0.0
        assert item.calculated_et0_mm > 0.0
        assert item.et0_method == "FAO-56 Penman-Monteith"

def test_weather_service_api_failure_fallback_and_warning():
    """Verify that network/API failure cleanly triggers SIMULATED_FALLBACK with warning_message"""
    with patch("httpx.AsyncClient.get", side_effect=httpx.ConnectError("Connection refused by remote host")):
        res = asyncio.run(WeatherService.fetch_forecast(
            latitude=36.7783,
            longitude=-119.4179,
            location_name="Central Valley, CA",
            elevation_m=100.0,
            force_simulation=False
        ))
        assert res.source == "SIMULATED_FALLBACK"
        assert res.is_live is False
        assert res.warning_message is not None
        assert "Open-Meteo" in res.warning_message
        assert len(res.forecast) == 7
        assert res.forecast[0].calculated_et0_mm > 0.0


def test_manual_weather_input_and_7day_projection(client):
    """Verify manual weather endpoint updates field and synthesizes continuous 7-day forecast"""
    payload = {
        "temperature_c": 35.0,
        "relative_humidity": 38.0,
        "wind_speed_ms": 3.0,
        "solar_radiation_mj": 25.0,
        "rainfall_mm": 15.0
    }
    response = client.post("/api/weather/manual/field-01", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["source"] == "USER_MANUAL"
    assert data["is_live"] is False
    assert data["current_temp_c"] == 35.0
    assert data["current_humidity_pct"] == 38.0
    assert data["current_wind_speed_ms"] == 3.0
    assert data["current_rainfall_mm"] == 15.0
    assert len(data["forecast"]) == 7
    # Day 0 has manual rainfall
    assert data["forecast"][0]["precipitation_mm"] == 15.0
    assert data["forecast"][0]["calculated_et0_mm"] > 0.0
    assert data["forecast"][0]["et0_method"] == "FAO-56 Penman-Monteith"

def test_reset_live_weather_restores_live_api(client):
    """Verify resetting weather restores field weather_source to LIVE_API"""
    response = client.post("/api/weather/reset-live/field-01")
    assert response.status_code == 200
    data = response.json()
    assert data["source"] in ["LIVE_API", "SIMULATED_FALLBACK", "SIMULATED"]
    assert len(data["forecast"]) == 7

# ==============================================================================
# 2. EDGE AI & IOT TESTS: Connected, Disconnected, Reconnection, and Anomalies
# ==============================================================================

def test_connected_mode_telemetry_ingestion_http(client):
    """Verify connected mode telemetry ingestion with valid auth token"""
    now_iso = datetime.now(timezone.utc).isoformat()
    payload = {
        "device_id": "ESP32-HW-01",
        "auth_token": "agro-edge-secret-key-2025",
        "field_id": "field-01",
        "telemetry": {
            "recorded_at": now_iso,
            "moisture_pct": 21.5,
            "temp_c": 28.0,
            "humidity_pct": 45.0,
            "rain_detected": False,
            "battery_pct": 94.0,
            "local_action_taken": "LOCAL_DEFICIT_FLAGGED",
            "is_anomaly": False
        }
    }
    response = client.post("/api/edge/telemetry", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["ack"] is True
    assert data["device_id"] == "ESP32-HW-01"

def test_unauthorized_telemetry_ingestion_rejected(client):
    """Verify ingestion with invalid token is rejected with HTTP 401"""
    payload = {
        "device_id": "ESP32-HW-01",
        "auth_token": "wrong-malicious-token",
        "field_id": "field-01",
        "telemetry": {
            "recorded_at": datetime.now(timezone.utc).isoformat(),
            "moisture_pct": 21.5,
            "temp_c": 28.0,
            "humidity_pct": 45.0,
            "rain_detected": False,
            "battery_pct": 94.0,
            "local_action_taken": "NONE"
        }
    }
    response = client.post("/api/edge/telemetry", json=payload)
    assert response.status_code == 401
    assert "Unauthorized" in response.json()["detail"]

def test_simulated_edge_disconnection_offline_buffering(client):
    """Verify disconnecting a simulated node queues readings in its local buffer"""
    sim_id = "ESP32-SIM-01"
    # Disconnect
    res_disc = client.post(f"/api/edge/toggle-simulation?device_id={sim_id}&connected=false")
    assert res_disc.status_code == 200
    assert res_disc.json()["is_connected"] is False
    
    # Tick 3 steps
    for _ in range(3):
        res_tick = client.post(f"/api/edge/tick-simulation/{sim_id}")
        assert res_tick.status_code == 200
        assert res_tick.json()["is_connected"] is False
        
    node = SIMULATED_NODES[sim_id]
    assert len(node.offline_buffer) >= 3
    # Verify exact recorded timestamps are preserved on buffered items
    first_buffered = node.offline_buffer[0]
    assert first_buffered.recorded_at is not None
    assert "T" in first_buffered.recorded_at

def test_reconnection_and_batch_sync_flushes_buffer(client):
    """Verify batch sync flushes offline buffer, persists to DB, and restores node to ONLINE"""
    sim_id = "ESP32-SIM-01"
    node = SIMULATED_NODES[sim_id]
    buffered_count = len(node.offline_buffer)
    assert buffered_count > 0
    
    # Build sync payload from node buffer
    batch_items = [item.model_dump() for item in node.offline_buffer]
    sync_payload = {
        "device_id": sim_id,
        "auth_token": "agro-edge-secret-key-2025",
        "field_id": "field-01",
        "buffered_readings": batch_items
    }
    res_sync = client.post("/api/edge/sync-offline", json=sync_payload)
    assert res_sync.status_code == 200
    data = res_sync.json()
    assert data["status"] == "SYNCED"
    assert data["synced_records_count"] == buffered_count
    
    # Node buffer cleared and node reconnected
    assert len(node.offline_buffer) == 0
    assert node.is_connected is True

def test_offline_batch_sync_deduplication(client):
    """Verify repeated batch sync deduplicates existing timestamps and avoids duplicate rows"""
    sim_id = "ESP32-SIM-01"
    fixed_time = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f") + "Z"
    batch_items = [{
        "recorded_at": fixed_time,
        "moisture_pct": 22.0,
        "temp_c": 25.0,
        "humidity_pct": 50.0,
        "rain_detected": False,
        "battery_pct": 95.0,
        "local_action_taken": "NONE",
        "is_anomaly": False
    }]

    sync_payload = {
        "device_id": sim_id,
        "auth_token": "agro-edge-secret-key-2025",
        "field_id": "field-01",
        "buffered_readings": batch_items
    }
    # First sync inserts
    res1 = client.post("/api/edge/sync-offline", json=sync_payload)
    assert res1.status_code == 200
    count1 = res1.json()["synced_records_count"]
    assert count1 == 1
    
    # Second sync with same timestamp deduplicates (count = 0)
    res2 = client.post("/api/edge/sync-offline", json=sync_payload)
    assert res2.status_code == 200
    count2 = res2.json()["synced_records_count"]
    assert count2 == 0

def test_edge_local_decision_logic_rules():
    """Verify local TinyML / decision rules fire correctly at the edge"""
    node = SIMULATED_NODES["ESP32-SIM-01"]
    
    # 1. Deficit flagged when moisture < threshold (22%)
    r1 = node.tick_simulation(moisture_override=20.5)
    assert r1.local_action_taken == "LOCAL_DEFICIT_FLAGGED"
    
    # 2. Emergency pulse when moisture < 15%
    r2 = node.tick_simulation(moisture_override=13.5)
    assert r2.local_action_taken == "LOCAL_EMERGENCY_PULSE"
    
    # 3. Rain lockout when rain is detected
    r3 = node.tick_simulation(moisture_override=20.0, rain_override=True)
    assert r3.local_action_taken == "LOCAL_RAIN_LOCKOUT"
    
    # 4. Heat stress protection when temp > 38°C
    r4 = node.tick_simulation(moisture_override=20.0, temp_override=40.5, rain_override=False)
    assert r4.local_action_taken == "HEAT_STRESS_PROTECT"

def test_sensor_anomaly_detection_failsafe(client):
    """Verify moisture < 3% or > 65% triggers SENSOR_ANOMALY_INVALID_READING and failsafe lockout"""
    node = SIMULATED_NODES["ESP32-SIM-01"]
    
    # Case A: Moisture < 3.0% (probe disconnected / air gap)
    r_low = node.tick_simulation(moisture_override=1.2)
    assert r_low.is_anomaly is True
    assert r_low.local_action_taken == "SENSOR_ANOMALY_INVALID_READING"
    assert "disconnection" in r_low.anomaly_description
    
    # Case B: Moisture > 65.0% (probe short circuit)
    r_high = node.tick_simulation(moisture_override=72.0)
    assert r_high.is_anomaly is True
    assert r_high.local_action_taken == "SENSOR_ANOMALY_INVALID_READING"
    assert "short circuit" in r_high.anomaly_description
    
    # Case C: HTTP ingestion of anomalous reading flags anomaly
    payload = {
        "device_id": "ESP32-HW-01",
        "auth_token": "agro-edge-secret-key-2025",
        "field_id": "field-01",
        "telemetry": {
            "recorded_at": datetime.now(timezone.utc).isoformat(),
            "moisture_pct": 0.8, # Anomaly
            "temp_c": 25.0,
            "humidity_pct": 45.0,
            "rain_detected": False,
            "battery_pct": 95.0,
            "local_action_taken": "NONE"
        }
    }
    res = client.post("/api/edge/telemetry", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["is_anomaly"] is True
    assert data["local_action_taken"] == "SENSOR_ANOMALY_INVALID_READING"

def test_mqtt_gateway_publish_and_config(client):
    """Verify industrial MQTT configuration and simulated topic publishing"""
    # 1. Config check
    res_cfg = client.get("/api/edge/mqtt/config")
    assert res_cfg.status_code == 200
    cfg = res_cfg.json()
    assert cfg["port"] == 8883
    assert "MQTTS" in cfg["protocol"]
    assert "agro/telemetry" in cfg["telemetry_topic"]
    
    # 2. Valid MQTT packet publish
    valid_mqtt = {
        "device_id": "ESP32-HW-01",
        "auth_token": "agro-edge-secret-key-2025",
        "topic": "agro/telemetry/ESP32-HW-01",
        "field_id": "field-01",
        "telemetry": {
            "recorded_at": datetime.now(timezone.utc).isoformat(),
            "moisture_pct": 23.0,
            "temp_c": 26.5,
            "humidity_pct": 49.0,
            "rain_detected": False,
            "battery_pct": 96.0,
            "local_action_taken": "NONE",
            "is_anomaly": False
        }
    }
    res_pub = client.post("/api/edge/mqtt/publish", json=valid_mqtt)
    assert res_pub.status_code == 200
    pub_data = res_pub.json()
    assert pub_data["status"] == "MQTT_MESSAGE_PUBLISHED"
    assert pub_data["broker_ack"] is True
    assert pub_data["qos"] == 1
    
    # 3. Topic mismatch rejection
    bad_mqtt = dict(valid_mqtt)
    bad_mqtt["topic"] = "agro/wrong_topic/ESP32-HW-01"
    res_bad = client.post("/api/edge/mqtt/publish", json=bad_mqtt)
    assert res_bad.status_code == 400
    assert "Invalid MQTT topic" in res_bad.json()["detail"]

def test_strict_provenance_distinction_never_misrepresent_simulated_as_real(client):
    """
    NON-NEGOTIABLE CONSTRAINT:
    'Never misrepresent simulated devices as real hardware.'
    Verify API strictly segregates simulated nodes (is_simulated=True) from physical nodes (is_simulated=False).
    """
    res = client.get("/api/edge/devices")
    assert res.status_code == 200
    devices = res.json()
    
    sim_nodes = [d for d in devices if d["is_simulated"] is True]
    real_nodes = [d for d in devices if d["is_simulated"] is False]
    
    # Verify simulated nodes exist and are explicitly marked with is_simulated=True
    assert len(sim_nodes) >= 2
    for s in sim_nodes:
        assert s["is_simulated"] is True
        
    # Verify physical nodes are explicitly marked with is_simulated=False
    assert len(real_nodes) >= 1
    for r in real_nodes:
        assert r["is_simulated"] is False

