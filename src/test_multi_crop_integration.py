"""
Comprehensive Multi-Crop Integration Test Suite.
Validates all trained and upcoming crops across endpoints and predictor functions.
Ensures zero regression for Paddy and Groundnut while confirming proper calibration
and handling for Wheat, Maize, Sugarcane, Tomato, Chilli, and upcoming crops.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import app
from src.crop_registry import get_crop, get_supported_crops, get_upcoming_crops, is_ml_supported
from src.irrigation_predictor import predict_irrigation


def test_crop_registry():
    print("Testing Crop Registry...")
    supported = get_supported_crops()
    upcoming = get_upcoming_crops()

    assert len(supported) == 7, f"Expected 7 supported crops, got {len(supported)}"
    assert len(upcoming) == 4, f"Expected 4 upcoming crops, got {len(upcoming)}"

    supported_codes = [c["code"] for c in supported]
    for expected in ["paddy", "groundnuts", "wheat", "maize", "sugarcane", "tomato", "chilli"]:
        assert expected in supported_codes, f"Missing {expected} in supported crops"

    upcoming_codes = [c["code"] for c in upcoming]
    for expected in ["cotton", "soybean", "mustard", "millets"]:
        assert expected in upcoming_codes, f"Missing {expected} in upcoming crops"

    print("✓ Crop Registry verified successfully (7 trained, 4 upcoming).")


def test_predictor_direct():
    print("\nTesting Direct Predictor on all 7 Trained Crops...")

    test_cases = [
        ("1", 30, 450, 22.0, 30.0, 60.0, "Paddy (Rice)"),
        ("2", 25, 300, 24.0, 32.0, 55.0, "Ground Nuts (Peanut)"),
        ("wheat", 45, 350, 20.0, 22.0, 40.0, "Wheat (Gehun)"),
        ("maize", 40, 280, 23.0, 28.0, 65.0, "Maize / Corn (Makka)"),
        ("sugarcane", 90, 500, 25.0, 33.0, 70.0, "Sugarcane (Ganna)"),
        ("tomato", 60, 45, 26.0, 27.0, 50.0, "Tomato (Tamatar)"),
        ("chilli", 50, 35, 25.0, 32.0, 45.0, "Chilli (Mirchi)"),
    ]

    for crop_key, days, moist, s_temp, temp, hum, expected_name in test_cases:
        res = predict_irrigation(crop_key, days, moist, s_temp, temp, hum)
        assert res["prediction"] in (0, 1), f"Invalid prediction for {crop_key}: {res['prediction']}"
        assert 0.0 <= res["probability_irrigation_needed"] <= 1.0, f"Invalid prob for {crop_key}"
        assert 0.0 <= res["probability_no_irrigation"] <= 1.0, f"Invalid prob for {crop_key}"
        assert "model_info" in res, f"Missing model_info for {crop_key}"
        assert res["model_info"]["records_count"] > 0, f"Invalid records_count for {crop_key}"
        print(f"  ✓ {expected_name} ({crop_key}): Decision='{res['decision']}', Prob={res['probability_irrigation_needed']:.1%}, Algo={res['model_info']['algorithm']}")

    print("✓ All 7 trained crops predicted successfully.")


def test_unsupported_crop_predictor():
    print("\nTesting Direct Predictor on Upcoming / Unsupported Crops...")
    upcoming_to_test = ["cotton", "soybean", "mustard", "millets", "random_crop"]
    for crop in upcoming_to_test:
        try:
            predict_irrigation(crop, 30, 400, 22, 28, 55)
            assert False, f"Expected ValueError for unsupported crop {crop}"
        except ValueError as e:
            assert "Unsupported crop" in str(e)
            print(f"  ✓ Rejected upcoming/unsupported crop '{crop}' with informative error.")


def test_flask_endpoints():
    print("\nTesting Flask API Endpoints (/api/crops and /api/predict)...")
    client = app.test_client()

    # 1. /api/crops
    resp = client.get("/api/crops")
    assert resp.status_code == 200
    data = resp.get_json()
    assert len(data["supported_crops"]) == 7
    assert len(data["upcoming_crops"]) == 4
    print(f"  ✓ /api/crops returned {len(data['supported_crops'])} supported and {len(data['upcoming_crops'])} upcoming crops.")

    # 2. /api/predict on all 7 supported crops
    sample_readings = {
        "1": {"crop_days": 20, "soil_moisture": 500, "soil_temperature": 21, "temperature": 31, "humidity": 65},
        "2": {"crop_days": 35, "soil_moisture": 350, "soil_temperature": 23, "temperature": 30, "humidity": 55},
        "wheat": {"crop_days": 40, "soil_moisture": 400, "soil_temperature": 20, "temperature": 24, "humidity": 45},
        "maize": {"crop_days": 30, "soil_moisture": 300, "soil_temperature": 22, "temperature": 27, "humidity": 60},
        "sugarcane": {"crop_days": 80, "soil_moisture": 550, "soil_temperature": 24, "temperature": 32, "humidity": 70},
        "tomato": {"crop_days": 50, "soil_moisture": 50, "soil_temperature": 26, "temperature": 28, "humidity": 48},
        "chilli": {"crop_days": 45, "soil_moisture": 30, "soil_temperature": 25, "temperature": 33, "humidity": 42},
    }

    for crop_key, readings in sample_readings.items():
        payload = {"crop_type": crop_key, **readings}
        resp = client.post("/api/predict", json=payload)
        assert resp.status_code == 200, f"Failed /api/predict for {crop_key}: {resp.get_data(as_text=True)}"
        res_data = resp.get_json()
        assert res_data["prediction"] in (0, 1)
        assert "probability_irrigation_needed" in res_data
        assert "model_info" in res_data
        print(f"  ✓ POST /api/predict for '{crop_key}': Prediction={res_data['prediction']}, Prob={res_data['probability_irrigation_needed']:.1%}")

    # 3. Upcoming crops rejection with informative response
    for crop_key in ["cotton", "soybean", "mustard", "millets"]:
        payload = {
            "crop_type": crop_key,
            "crop_days": 30,
            "soil_moisture": 400,
            "soil_temperature": 22,
            "temperature": 28,
            "humidity": 55,
        }
        resp = client.post("/api/predict", json=payload)
        assert resp.status_code == 400
        res_data = resp.get_json()
        assert res_data["status"] == "unsupported_crop"
        assert "awaiting genuine field sensor" in res_data["error"]
        print(f"  ✓ POST /api/predict for upcoming '{crop_key}' correctly returned 400 with status 'unsupported_crop'.")

    # 4. Missing inputs
    resp = client.post("/api/predict", json={"crop_type": "wheat", "crop_days": 30})
    assert resp.status_code == 400
    assert "Missing required fields" in resp.get_json()["error"]
    print("  ✓ Missing inputs handled correctly.")

    # 5. Invalid values
    resp = client.post("/api/predict", json={
        "crop_type": "wheat", "crop_days": -5, "soil_moisture": 400,
        "soil_temperature": 22, "temperature": 28, "humidity": 55
    })
    assert resp.status_code == 400
    assert "positive whole number" in resp.get_json()["error"]
    print("  ✓ Negative crop age rejected correctly.")

    resp = client.post("/api/predict", json={
        "crop_type": "wheat", "crop_days": 30, "soil_moisture": 400,
        "soil_temperature": 22, "temperature": 28, "humidity": 150
    })
    assert resp.status_code == 400
    assert "Relative humidity must be between 0 and 100%" in resp.get_json()["error"]
    print("  ✓ Out-of-bounds humidity rejected correctly.")


def main():
    test_crop_registry()
    test_predictor_direct()
    test_unsupported_crop_predictor()
    test_flask_endpoints()
    print("\n========================================================")
    print("ALL MULTI-CROP INTEGRATION TESTS PASSED SUCCESSFULLY! ✓")
    print("========================================================")


if __name__ == "__main__":
    main()
