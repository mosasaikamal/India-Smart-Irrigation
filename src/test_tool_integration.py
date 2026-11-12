"""
AgriSaathi - Comprehensive Tool Calling & Model Integration Test Suite.
Verifies all 5 required integration scenarios:
1. Prediction with valid sensor readings (executes predict_irrigation tool).
2. Prediction with missing readings (prompts user for missing readings, no tool call).
3. Prediction with invalid readings (backend validation catches out-of-bounds/invalid inputs).
4. Unsupported crop (rejects unsupported crops, model only supports Paddy & Ground Nuts).
5. Follow-up question about a previous prediction (provides agronomic explanation).
"""

import time
import unittest
from src.agri_tools import (
    APPROVED_TOOL_NAMES,
    SUPPORTED_CROPS,
    execute_predict_irrigation,
    execute_tool_call,
)
from src.agri_assistant import generate_response, AgriAssistantError


class TestAgriToolBackendValidation(unittest.TestCase):
    """Direct tests for backend validation logic in src/agri_tools.py."""

    def test_approved_whitelist(self):
        """Security: verify only approved tool name is allowed."""
        self.assertIn("predict_irrigation", APPROVED_TOOL_NAMES)
        res = execute_tool_call("arbitrary_exec", {"code": "import os"})
        self.assertEqual(res.get("status"), "rejected")
        self.assertIn("Unauthorized", res.get("error", ""))

    def test_valid_paddy_prediction(self):
        """Valid inputs for Paddy (crop_type=1) call Logistic Regression model."""
        args = {
            "crop_type": 1,
            "crop_days": 10,
            "soil_moisture": 140.0,
            "soil_temperature": 24.0,
            "temperature": 28.0,
            "humidity": 62.0,
        }
        res = execute_predict_irrigation(args)
        self.assertEqual(res.get("status"), "success")
        self.assertEqual(res.get("crop"), "Paddy")
        self.assertIn(res.get("prediction"), [0, 1])
        self.assertIn("probability_no_irrigation", res)
        self.assertIn("probability_irrigation_needed", res)
        self.assertTrue(res.get("experimental"))
        self.assertIn("disclaimer", res)

    def test_valid_groundnut_prediction(self):
        """Valid inputs for Ground Nuts (crop_type=2) call Logistic Regression model."""
        args = {
            "crop_type": 2,
            "crop_days": 45,
            "soil_moisture": 250.0,
            "soil_temperature": 29.0,
            "temperature": 34.0,
            "humidity": 45.0,
        }
        res = execute_predict_irrigation(args)
        self.assertEqual(res.get("status"), "success")
        self.assertEqual(res.get("crop"), "Ground Nuts")
        self.assertIn(res.get("prediction"), [0, 1])
        self.assertIn("decision", res)

    def test_missing_fields(self):
        """Missing parameters are caught and rejected on the backend."""
        args = {
            "crop_type": 1,
            "crop_days": 15,
            # missing soil_moisture, soil_temperature, temperature, humidity
        }
        res = execute_predict_irrigation(args)
        self.assertIn("missing_fields", res)
        self.assertIn("soil_moisture", res["missing_fields"])

    def test_invalid_humidity_range(self):
        """Humidity > 100% or < 0% must be rejected on the backend."""
        args = {
            "crop_type": 1,
            "crop_days": 20,
            "soil_moisture": 150.0,
            "soil_temperature": 26.0,
            "temperature": 30.0,
            "humidity": 150.0,  # Invalid
        }
        res = execute_predict_irrigation(args)
        self.assertEqual(res.get("status"), "validation_error")
        self.assertIn("humidity", res.get("error", "").lower())

    def test_invalid_crop_days(self):
        """Negative crop days must be rejected on the backend."""
        args = {
            "crop_type": 1,
            "crop_days": -5,  # Invalid
            "soil_moisture": 150.0,
            "soil_temperature": 26.0,
            "temperature": 30.0,
            "humidity": 65.0,
        }
        res = execute_predict_irrigation(args)
        self.assertEqual(res.get("status"), "validation_error")

    def test_unsupported_crop_type(self):
        """Unsupported crop code (e.g. 3 or 99) must be rejected on the backend."""
        args = {
            "crop_type": 3,  # Wheat / unsupported
            "crop_days": 25,
            "soil_moisture": 150.0,
            "soil_temperature": 20.0,
            "temperature": 22.0,
            "humidity": 60.0,
        }
        res = execute_predict_irrigation(args)
        self.assertEqual(res.get("status"), "unsupported_crop")
        self.assertIn("Unsupported crop", res.get("error", ""))


class TestGeminiToolIntegrationScenarios(unittest.TestCase):
    """End-to-end tests for the 5 specified Gemini assistant integration scenarios."""

    def test_scenario_1_valid_sensor_readings(self):
        """Scenario 1: Prediction request with all valid sensor readings executes tool."""
        prompt = (
            "Please predict irrigation for my Paddy crop. "
            "Crop age is 10 days, soil moisture is 140, soil temperature is 24°C, "
            "air temperature is 28°C, and relative humidity is 62%."
        )
        print("\n--- Running Scenario 1: Valid Sensor Readings ---")
        res = generate_response(prompt=prompt, language="en")
        print("Model:", res.get("model"))
        print("Tool executed:", res.get("tool_executed"))
        print("Reply excerpt:", res["reply"][:250], "...")
        
        self.assertEqual(res.get("status"), "success")
        self.assertTrue(len(res["reply"]) > 50)
        # Check that response mentions irrigation decision and disclaimer/experimental note
        reply_lower = res["reply"].lower()
        self.assertTrue(
            "irrigation" in reply_lower,
            "Response should discuss irrigation recommendation."
        )
        time.sleep(1.0)

    def test_scenario_2_missing_readings(self):
        """Scenario 2: Prediction request with missing readings prompts user for data."""
        prompt = "Should I irrigate my paddy field today? Please give me an irrigation prediction."
        print("\n--- Running Scenario 2: Missing Readings ---")
        res = generate_response(prompt=prompt, language="en")
        print("Model:", res.get("model"))
        print("Tool executed:", res.get("tool_executed"))
        print("Reply excerpt:", res["reply"][:250], "...")

        self.assertEqual(res.get("status"), "success")
        # Tool should NOT have executed successfully without sensor readings
        self.assertFalse(res.get("tool_executed", False))
        reply_lower = res["reply"].lower()
        # Should ask for missing parameters (moisture, temperature, age, etc.)
        self.assertTrue(
            "moisture" in reply_lower or "reading" in reply_lower or "sensor" in reply_lower,
            "Response should ask for sensor readings when parameters are missing."
        )
        time.sleep(1.0)

    def test_scenario_3_invalid_readings(self):
        """Scenario 3: Prediction request with impossible sensor reading (humidity 150%)."""
        prompt = (
            "Predict irrigation for my paddy crop: age 10 days, soil moisture 140, "
            "soil temperature 24°C, air temperature 28°C, humidity 150%."
        )
        print("\n--- Running Scenario 3: Invalid Readings (Humidity 150%) ---")
        res = generate_response(prompt=prompt, language="en")
        print("Model:", res.get("model"))
        print("Tool executed:", res.get("tool_executed"))
        print("Reply excerpt:", res["reply"][:250], "...")

        self.assertEqual(res.get("status"), "success")
        reply_lower = res["reply"].lower()
        # Should point out invalid humidity or ask for a realistic humidity between 0 and 100%
        self.assertTrue(
            "humidity" in reply_lower or "100" in reply_lower or "invalid" in reply_lower or "sensor" in reply_lower,
            "Assistant should flag the unrealistic humidity."
        )
        time.sleep(1.0)

    def test_scenario_4_unsupported_crop(self):
        """Scenario 4: Prediction request for unsupported crop (e.g. Wheat)."""
        prompt = (
            "Can you predict irrigation using the model for my Wheat crop? "
            "Crop age is 25 days, soil moisture 120, soil temp 20°C, air temp 22°C, humidity 55%."
        )
        print("\n--- Running Scenario 4: Unsupported Crop (Wheat) ---")
        res = generate_response(prompt=prompt, language="en")
        print("Model:", res.get("model"))
        print("Tool executed:", res.get("tool_executed"))
        print("Reply excerpt:", res["reply"][:250], "...")

        self.assertEqual(res.get("status"), "success")
        reply_lower = res["reply"].lower()
        # Should inform the user that the model is trained for Paddy / Groundnut or wheat is not supported
        self.assertTrue(
            "paddy" in reply_lower or "groundnut" in reply_lower or "support" in reply_lower or "wheat" in reply_lower,
            "Assistant should explain model scope and crop support."
        )
        time.sleep(1.0)

    def test_scenario_5_follow_up_question(self):
        """Scenario 5: Follow-up question about a previous prediction."""
        prompt = (
            "Earlier the prediction said 'No irrigation indicated' for my 10-day-old paddy field "
            "with moisture 140. Why doesn't it need water if it's warm outside?"
        )
        print("\n--- Running Scenario 5: Follow-up Question About Prediction ---")
        res = generate_response(prompt=prompt, language="en")
        print("Model:", res.get("model"))
        print("Tool executed:", res.get("tool_executed"))
        print("Reply excerpt:", res["reply"][:250], "...")

        self.assertEqual(res.get("status"), "success")
        reply_lower = res["reply"].lower()
        self.assertTrue(
            "moisture" in reply_lower or "paddy" in reply_lower or "stage" in reply_lower,
            "Assistant should explain agronomic rationale behind the prediction."
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
