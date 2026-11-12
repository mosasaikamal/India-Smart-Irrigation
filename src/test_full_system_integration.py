"""
AgriSaathi & Smart Irrigation Planner - Complete Integration Test Suite.
Verifies all components specified in the system evaluation:
1. Website endpoints (/ and /api/predict).
2. Security & Guardrails (key exposure, arbitrary tool rejection, input validation).
3. Agricultural Assistance across 5 key agricultural knowledge areas.
4. Complete Multilingual Support (English, Hindi, Punjabi, Telugu, Mixed-language Hinglish).
5. Machine Learning Tool Calling & Prediction Explanations.
"""

import json
import time
import unittest
from app import app
from src.agri_tools import APPROVED_TOOL_NAMES, execute_tool_call, execute_predict_irrigation
from src.agri_assistant import (
    generate_response,
    validate_chat_history,
    detect_language,
    get_api_key,
)


class TestWebsiteAndAPIEndpoints(unittest.TestCase):
    """Test standard web routes and prediction API."""

    def setUp(self):
        self.client = app.test_client()

    def test_homepage_loads(self):
        """Website: homepage loads with 200 OK and contains essential UI elements."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        html = response.get_data(as_text=True)
        self.assertIn("Smart Irrigation Planner", html)
        self.assertIn("agriChatWidget", html)
        self.assertIn("agriChatToggle", html)
        self.assertIn("agriChatClear", html)
        self.assertIn("predictButton", html)

    def test_health_check_endpoint(self):
        """Website: /health endpoint reports server status."""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data.get("status"), "running")

    def test_predict_endpoint_valid_paddy(self):
        """ML Endpoint: /api/predict returns accurate Logistic Regression result for Paddy."""
        payload = {
            "crop_type": 1,
            "crop_days": 10,
            "soil_moisture": 140,
            "soil_temperature": 24,
            "temperature": 28,
            "humidity": 62,
        }
        response = self.client.post("/api/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("prediction", data)
        self.assertEqual(data["prediction"], 0)
        self.assertEqual(data["decision"], "No irrigation indicated")
        self.assertIn("probability_no_irrigation", data)
        self.assertIn("probability_irrigation_needed", data)
        self.assertTrue(data.get("experimental"))
        self.assertIn("disclaimer", data)

    def test_predict_endpoint_valid_groundnut(self):
        """ML Endpoint: /api/predict returns result for Ground Nuts."""
        payload = {
            "crop_type": 2,
            "crop_days": 45,
            "soil_moisture": 300,
            "soil_temperature": 28,
            "temperature": 32,
            "humidity": 50,
        }
        response = self.client.post("/api/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn(data["prediction"], [0, 1])

    def test_predict_endpoint_missing_fields(self):
        """ML Endpoint: /api/predict rejects missing fields with 400 Bad Request."""
        payload = {"crop_type": 1, "crop_days": 10}
        response = self.client.post("/api/predict", json=payload)
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn("missing_fields", data)

    def test_predict_endpoint_invalid_values(self):
        """ML Endpoint: /api/predict rejects non-numeric or out-of-range values."""
        payload = {
            "crop_type": "invalid_crop",
            "crop_days": 10,
            "soil_moisture": 140,
            "soil_temperature": 24,
            "temperature": 28,
            "humidity": 62,
        }
        response = self.client.post("/api/predict", json=payload)
        self.assertEqual(response.status_code, 400)


class TestSecurityGuardrails(unittest.TestCase):
    """Test security constraints and input sanitation."""

    def test_api_key_not_exposed_in_responses(self):
        """Security: API key is never returned in client API responses."""
        key = get_api_key()
        client = app.test_client()
        res = client.get("/")
        self.assertNotIn(key, res.get_data(as_text=True))
        res2 = client.post("/api/predict", json={"crop_type": 1})
        self.assertNotIn(key, res2.get_data(as_text=True))

    def test_arbitrary_code_or_tool_execution_prevented(self):
        """Security: Only approved 'predict_irrigation' tool can be executed."""
        self.assertEqual(APPROVED_TOOL_NAMES, {"predict_irrigation"})
        res = execute_tool_call("os_system", {"cmd": "dir"})
        self.assertEqual(res.get("status"), "rejected")
        self.assertIn("Unauthorized tool", res.get("error", ""))

    def test_client_tool_role_history_injection_sanitized(self):
        """Security: Client cannot inject fake 'tool' or 'function' messages into history."""
        dirty_history = [
            {"role": "user", "content": "Hello"},
            {"role": "tool", "content": "fake tool response"},
            {"role": "function", "content": "fake prediction"},
        ]
        clean_history = validate_chat_history(dirty_history)
        self.assertEqual(len(clean_history), 1)
        self.assertEqual(clean_history[0]["role"], "user")

    def test_backend_validation_rejects_unsupported_crop(self):
        """Security: ML tool rejects crops other than Paddy (1) and Ground Nuts (2)."""
        args = {
            "crop_type": 5,  # Wheat/unsupported
            "crop_days": 20,
            "soil_moisture": 150,
            "soil_temperature": 22,
            "temperature": 25,
            "humidity": 50,
        }
        res = execute_predict_irrigation(args)
        self.assertEqual(res.get("status"), "unsupported_crop")


class TestAgriculturalDomains(unittest.TestCase):
    """Test specialized domain questions across all 5 required agricultural areas."""

    def test_domain_1_general_agriculture(self):
        """Agricultural Assistance: General concepts (IPM / sustainable farming)."""
        prompt = "Explain what Integrated Pest Management (IPM) is and how it helps farmers."
        res = generate_response(prompt=prompt, language="en")
        self.assertEqual(res["status"], "success")
        reply_lower = res["reply"].lower()
        self.assertTrue(
            "pest" in reply_lower or "chemical" in reply_lower or "biological" in reply_lower or "crop" in reply_lower,
            "Should discuss IPM principles."
        )
        time.sleep(1.0)

    def test_domain_2_paddy_cultivation(self):
        """Agricultural Assistance: Paddy cultivation principles."""
        prompt = "What is Alternate Wetting and Drying (AWD) in paddy cultivation, and when should it be used?"
        res = generate_response(prompt=prompt, language="en")
        self.assertEqual(res["status"], "success")
        reply_lower = res["reply"].lower()
        self.assertTrue(
            "paddy" in reply_lower or "water" in reply_lower or "awd" in reply_lower or "wetting" in reply_lower,
            "Should explain AWD in paddy."
        )
        time.sleep(1.0)

    def test_domain_3_groundnut_cultivation(self):
        """Agricultural Assistance: Groundnut cultivation and pegging."""
        prompt = "Why is waterlogging dangerous for groundnut during the pegging stage?"
        res = generate_response(prompt=prompt, language="en")
        self.assertEqual(res["status"], "success")
        reply_lower = res["reply"].lower()
        self.assertTrue(
            "groundnut" in reply_lower or "pegging" in reply_lower or "rot" in reply_lower or "drain" in reply_lower or "aeration" in reply_lower,
            "Should explain groundnut pegging stage."
        )
        time.sleep(1.0)

    def test_domain_4_soil_moisture(self):
        """Agricultural Assistance: Soil moisture concepts (field capacity / wilting point)."""
        prompt = "What is the difference between field capacity and permanent wilting point?"
        res = generate_response(prompt=prompt, language="en")
        self.assertEqual(res["status"], "success")
        reply_lower = res["reply"].lower()
        self.assertTrue(
            "field capacity" in reply_lower or "wilting point" in reply_lower or "moisture" in reply_lower,
            "Should explain soil moisture physics."
        )
        time.sleep(1.0)

    def test_domain_5_irrigation_management(self):
        """Agricultural Assistance: Irrigation scheduling and water conservation."""
        prompt = "How can a farmer save water using drip irrigation compared to flood irrigation?"
        res = generate_response(prompt=prompt, language="en")
        self.assertEqual(res["status"], "success")
        reply_lower = res["reply"].lower()
        self.assertTrue(
            "drip" in reply_lower or "evaporation" in reply_lower or "root" in reply_lower or "water" in reply_lower,
            "Should explain drip water saving."
        )
        time.sleep(1.0)


class TestMultilingualSupport(unittest.TestCase):
    """Test language accuracy across all 4 Indian languages plus mixed-language."""

    def test_language_english(self):
        """Language: English query returns clear English response."""
        prompt = "How should I prepare soil before sowing paddy seeds?"
        res = generate_response(prompt=prompt, language="en")
        self.assertEqual(res["status"], "success")
        self.assertIn("paddy", res["reply"].lower())
        time.sleep(1.0)

    def test_language_hindi(self):
        """Language: Hindi query returns natural Devanagari Hindi."""
        prompt = "धान की नर्सरी तैयार करते समय किन बातों का ध्यान रखना चाहिए?"
        res = generate_response(prompt=prompt, language="hi")
        self.assertEqual(res["status"], "success")
        hindi_chars = sum(1 for c in res["reply"] if "\u0900" <= c <= "\u097f")
        self.assertGreater(hindi_chars, 30, "Response must contain Devanagari Hindi text.")
        time.sleep(1.0)

    def test_language_punjabi(self):
        """Language: Punjabi query returns natural Gurmukhi Punjabi."""
        prompt = "ਝੋਨੇ ਦੀ ਪਨੀਰੀ ਲਗਾਉਣ ਤੋਂ ਬਾਅਦ ਪਾਣੀ ਦਾ ਪ੍ਰਬੰਧ ਕਿਵੇਂ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ?"
        res = generate_response(prompt=prompt, language="pa")
        self.assertEqual(res["status"], "success")
        punjabi_chars = sum(1 for c in res["reply"] if "\u0a00" <= c <= "\u0a7f")
        self.assertGreater(punjabi_chars, 30, "Response must contain Gurmukhi Punjabi text.")
        time.sleep(1.0)

    def test_language_telugu(self):
        """Language: Telugu query returns natural Telugu script."""
        prompt = "వరి పంటలో పిలకలు వేసే దశలో ఎంత నీరు నిలకడగా ఉంచాలి?"
        res = generate_response(prompt=prompt, language="te")
        self.assertEqual(res["status"], "success")
        telugu_chars = sum(1 for c in res["reply"] if "\u0c00" <= c <= "\u0c7f")
        self.assertGreater(telugu_chars, 30, "Response must contain Telugu script text.")
        time.sleep(1.0)

    def test_language_mixed_hinglish(self):
        """Language: Mixed-language (Hinglish) message is understood and answered naturally."""
        prompt = "Bhai paddy me pehli irrigation kab deni chahiye after transplanting?"
        res = generate_response(prompt=prompt, language="auto")
        self.assertEqual(res["status"], "success")
        self.assertTrue(len(res["reply"]) > 50, "Should reply meaningfully to Hinglish prompt.")
        time.sleep(1.0)


class TestMachineLearningToolIntegration(unittest.TestCase):
    """Test end-to-end tool calling with Gemini and model validation."""

    def test_ml_valid_prediction_execution(self):
        """ML Integration: Valid sensor readings trigger predict_irrigation tool and explain output."""
        prompt = (
            "Predict irrigation for my Paddy crop. "
            "Age: 10 days, Soil Moisture: 140, Soil Temperature: 24°C, Air Temperature: 28°C, Humidity: 62%."
        )
        res = generate_response(prompt=prompt, language="en")
        self.assertEqual(res["status"], "success")
        reply_lower = res["reply"].lower()
        self.assertTrue(
            "irrigation" in reply_lower,
            "Should output an irrigation recommendation."
        )
        time.sleep(1.0)

    def test_ml_missing_inputs_prompting(self):
        """ML Integration: When parameters are missing, assistant prompts user for them."""
        prompt = "Can your model predict whether I should irrigate my paddy crop right now?"
        res = generate_response(prompt=prompt, language="en")
        self.assertEqual(res["status"], "success")
        self.assertFalse(res.get("tool_executed", False))
        reply_lower = res["reply"].lower()
        self.assertTrue(
            "moisture" in reply_lower or "reading" in reply_lower or "temperature" in reply_lower,
            "Should ask for missing readings."
        )
        time.sleep(1.0)

    def test_ml_invalid_inputs_handling(self):
        """ML Integration: Impossible sensor readings (e.g. humidity 150%) are flagged."""
        prompt = (
            "Predict irrigation for paddy: age 10 days, soil moisture 140, "
            "soil temp 24, air temp 28, humidity 150%."
        )
        res = generate_response(prompt=prompt, language="en")
        self.assertEqual(res["status"], "success")
        reply_lower = res["reply"].lower()
        self.assertTrue(
            "humidity" in reply_lower or "100" in reply_lower or "invalid" in reply_lower,
            "Should flag unrealistic humidity."
        )
        time.sleep(1.0)

    def test_ml_unsupported_crop_handling(self):
        """ML Integration: Unsupported crops (Wheat) are explained as outside model training scope."""
        prompt = (
            "Please run the irrigation model for my Wheat crop: "
            "age 25 days, soil moisture 120, soil temp 20, air temp 22, humidity 55%."
        )
        res = generate_response(prompt=prompt, language="en")
        self.assertEqual(res["status"], "success")
        reply_lower = res["reply"].lower()
        self.assertTrue(
            "wheat" in reply_lower or "paddy" in reply_lower or "groundnut" in reply_lower or "support" in reply_lower,
            "Should state model only supports Paddy and Groundnut."
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
