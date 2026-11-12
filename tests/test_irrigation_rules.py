"""
Integration and Unit Tests for Irrigation Rules and Predictions.
Verifies all 7 specified test scenarios from the specification:
1. Wheat in Punjab at 35% with 0 mm rain -> IRRIGATE
2. Wheat in Punjab at 50% -> MONITOR (not irrigate)
3. Wheat at 65% -> DO NOT IRRIGATE
4. Wheat at 35% with 15 mm rain -> DO NOT IRRIGATE (rain override)
5. Rice at -20 cm -> IRRIGATE
6. Rice at -5 cm -> DO NOT IRRIGATE
7. Crop not in state -> Error (400)
"""

import pytest
from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_scenario_1_wheat_punjab_35pct_0mm_rain_irrigates(client):
    """Scenario 1: Wheat in Punjab at 35% moisture with 0 mm rain -> IRRIGATE."""
    payload = {
        "state": "Punjab",
        "crop": "Wheat",
        "crop_age_days": 30,
        "sensor_reading": 35.0,
        "soil_temp": 22.0,
        "air_temp": 26.0,
        "humidity": 60.0,
        "rainfall_7d": 0.0,
        "forecast_24h": 0.0,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "IRRIGATE"
    assert data["irrigation_required"] is True
    assert data["prediction"] == 1
    assert "at or below the 40.0% trigger" in data["reason"]


def test_scenario_2_wheat_punjab_50pct_monitors(client):
    """Scenario 2: Wheat in Punjab at 50% moisture -> MONITOR (not irrigate)."""
    payload = {
        "state": "Punjab",
        "crop": "Wheat",
        "crop_age_days": 30,
        "sensor_reading": 50.0,
        "soil_temp": 22.0,
        "air_temp": 26.0,
        "humidity": 60.0,
        "rainfall_7d": 0.0,
        "forecast_24h": 0.0,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "MONITOR"
    assert data["irrigation_required"] is False
    assert data["prediction"] == 0
    assert "monitor" in data["reason"].lower()


def test_scenario_3_wheat_punjab_65pct_do_not_irrigate(client):
    """Scenario 3: Wheat at 65% moisture -> DO NOT IRRIGATE."""
    payload = {
        "state": "Punjab",
        "crop": "Wheat",
        "crop_age_days": 30,
        "sensor_reading": 65.0,
        "soil_temp": 22.0,
        "air_temp": 26.0,
        "humidity": 60.0,
        "rainfall_7d": 0.0,
        "forecast_24h": 0.0,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "DO NOT IRRIGATE"
    assert data["irrigation_required"] is False
    assert data["prediction"] == 0
    assert "wet limit" in data["reason"] or "sufficient" in data["reason"].lower()


def test_scenario_4_wheat_punjab_35pct_15mm_rain_override(client):
    """Scenario 4: Wheat at 35% moisture with 15 mm rain -> DO NOT IRRIGATE (rain override)."""
    payload = {
        "state": "Punjab",
        "crop": "Wheat",
        "crop_age_days": 30,
        "sensor_reading": 35.0,
        "soil_temp": 22.0,
        "air_temp": 26.0,
        "humidity": 60.0,
        "rainfall_7d": 15.0,
        "forecast_24h": 0.0,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "DO NOT IRRIGATE"
    assert data["irrigation_required"] is False
    assert data["prediction"] == 0
    assert data["rain_override_triggered"] is True
    assert "15.0 mm rain" in data["reason"] or "rain" in data["reason"].lower()


def test_scenario_5_rice_minus_20cm_irrigates(client):
    """Scenario 5: Rice at -20 cm -> IRRIGATE."""
    payload = {
        "state": "Punjab",
        "crop": "Rice",
        "crop_age_days": 25,
        "sensor_reading": -20.0,
        "soil_temp": 24.0,
        "air_temp": 28.0,
        "humidity": 70.0,
        "rainfall_7d": 0.0,
        "forecast_24h": 0.0,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "IRRIGATE"
    assert data["irrigation_required"] is True
    assert data["prediction"] == 1
    assert "water level" in data["reason"].lower()
    assert "-15.0 cm trigger" in data["reason"]


def test_scenario_6_rice_minus_5cm_do_not_irrigate(client):
    """Scenario 6: Rice at -5 cm -> DO NOT IRRIGATE."""
    payload = {
        "state": "Punjab",
        "crop": "Rice",
        "crop_age_days": 25,
        "sensor_reading": -5.0,
        "soil_temp": 24.0,
        "air_temp": 28.0,
        "humidity": 70.0,
        "rainfall_7d": 0.0,
        "forecast_24h": 0.0,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "DO NOT IRRIGATE"
    assert data["irrigation_required"] is False
    assert data["prediction"] == 0
    assert "adequate standing water" in data["reason"].lower() or "above the -15.0 cm trigger" in data["reason"].lower()


def test_scenario_7_crop_not_in_state_returns_400(client):
    """Scenario 7: Crop that isn't in the state -> Error (400)."""
    payload = {
        "state": "Punjab",
        "crop": "Coconut",  # Coconut is grown in tropical coastal states, not in Punjab
        "crop_age_days": 40,
        "sensor_reading": 30.0,
        "soil_temp": 25.0,
        "air_temp": 30.0,
        "humidity": 55.0,
        "rainfall_7d": 0.0,
        "forecast_24h": 0.0,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 400
    data = response.get_json()
    assert "error" in data
    assert "not cultivated or supported" in data["error"] or "not found" in data["error"].lower()


def test_api_states_endpoint(client):
    """Verify /api/states returns all 36 Indian states and UTs."""
    response = client.get("/api/states")
    assert response.status_code == 200
    data = response.get_json()
    assert "states" in data
    assert len(data["states"]) == 36
    assert "Punjab" in data["states"]
    assert "Andhra Pradesh" in data["states"]


def test_api_crops_endpoint(client):
    """Verify /api/crops?state=Punjab returns Punjab crops."""
    response = client.get("/api/crops?state=Punjab")
    assert response.status_code == 200
    data = response.get_json()
    assert data["state"] == "Punjab"
    crop_names = [c["crop"] for c in data["crops"]]
    assert "Wheat" in crop_names
    assert "Rice" in crop_names


def test_temperature_unit_conversion_fahrenheit_and_kelvin(client):
    """Verify that temperature units (Fahrenheit and Kelvin) are converted to Celsius."""
    # 77 °F is 25 °C; 298.15 K is 25 °C
    payload = {
        "state": "Punjab",
        "crop": "Wheat",
        "crop_age_days": 30,
        "sensor_reading": 35.0,
        "soil_temp": 77.0,
        "soil_temp_unit": "F",
        "air_temp": 298.15,
        "air_temp_unit": "K",
        "humidity": 60.0,
        "rainfall_7d": 0.0,
        "forecast_24h": 0.0,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["inputs"]["soil_temperature_c"] == 25.0
    assert data["inputs"]["air_temperature_c"] == 25.0
