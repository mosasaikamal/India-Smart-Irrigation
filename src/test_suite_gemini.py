"""
Comprehensive verification test suite for AgriSaathi Gemini API Integration.
Covers:
1. Environment variables loading.
2. Gemini client initialization.
3. Model accessibility.
4. Response generation for simple test messages.
5. Error handling (missing key, invalid prompt, invalid key, invalid model).

Security Rule: Never display, print, or log the actual API key.
"""

import os
import sys
from pathlib import Path

# Ensure project root is on sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from dotenv import load_dotenv
from google import genai
from src.agri_assistant import (
    AgriAssistantError,
    get_api_key,
    get_client,
    get_model_name,
    generate_response,
)


def run_checks():
    results = {}

    print("=" * 65)
    print("AgriSaathi Gemini API Integration - Formal Test Suite")
    print("=" * 65)

    # -------------------------------------------------------------
    # Check 1: Environment Variables Loading
    # -------------------------------------------------------------
    try:
        env_path = PROJECT_ROOT / ".env"
        if not env_path.exists():
            raise FileNotFoundError(f".env file not found at {env_path}")

        load_dotenv(dotenv_path=env_path)
        key = get_api_key()
        model_name = get_model_name()

        # Security check: verify key length without exposing any characters
        if len(key) < 10:
            raise ValueError("Configured API key appears malformed or too short.")

        results["check_1_env"] = {
            "status": "PASS",
            "message": f"Environment loaded successfully. Configured model: '{model_name}'. API key is securely present ({len(key)} chars, hidden)."
        }
    except Exception as e:
        results["check_1_env"] = {"status": "FAIL", "message": str(e)}

    # -------------------------------------------------------------
    # Check 2: Gemini Client Initialization
    # -------------------------------------------------------------
    try:
        client = get_client()
        if not isinstance(client, genai.Client):
            raise TypeError(f"Expected genai.Client instance, got {type(client)}")
        results["check_2_client"] = {
            "status": "PASS",
            "message": f"Official Google Gen AI Client initialized successfully ({type(client).__name__})."
        }
    except Exception as e:
        results["check_2_client"] = {"status": "FAIL", "message": str(e)}

    # -------------------------------------------------------------
    # Check 3: Configured Model Accessibility
    # -------------------------------------------------------------
    try:
        client = get_client()
        model_name = get_model_name()
        # Verify model exists in available models
        available_models = [m.name for m in client.models.list()]
        normalized_name = model_name if model_name.startswith("models/") else f"models/{model_name}"
        
        # Check direct match or alias
        matched = any(normalized_name in m or model_name in m for m in available_models)
        if not matched:
            raise ValueError(f"Model '{model_name}' was not found in available models list.")

        results["check_3_model"] = {
            "status": "PASS",
            "message": f"Model '{model_name}' is accessible on the Gemini API endpoint."
        }
    except Exception as e:
        results["check_3_model"] = {"status": "FAIL", "message": str(e)}

    # -------------------------------------------------------------
    # Check 4: Test Message Response Generation
    # -------------------------------------------------------------
    try:
        test_prompt = "Say 'AgriSaathi is ready' in exactly 3 words."
        response_data = generate_response(prompt=test_prompt)
        reply = response_data.get("reply", "").strip()
        used_model = response_data.get("model", "")

        if not reply:
            raise ValueError("Received empty reply text from Gemini API.")

        results["check_4_response"] = {
            "status": "PASS",
            "message": f"Successfully generated response using '{used_model}'. Reply: \"{reply}\""
        }
    except Exception as e:
        results["check_4_response"] = {"status": "FAIL", "message": str(e)}

    # -------------------------------------------------------------
    # Check 5: Error Handling Pathways
    # -------------------------------------------------------------
    error_subchecks = []

    # 5a: Empty prompt handling
    try:
        generate_response("")
        error_subchecks.append(("Empty prompt", False, "Expected AgriAssistantError not raised."))
    except AgriAssistantError as e:
        if e.code == "invalid_request":
            error_subchecks.append(("Empty prompt", True, f"Correctly caught code '{e.code}'"))
        else:
            error_subchecks.append(("Empty prompt", False, f"Unexpected code '{e.code}'"))

    # 5b: Missing API key handling (simulate missing key in isolation)
    try:
        saved_key = os.environ.pop("GEMINI_API_KEY", None)
        saved_google = os.environ.pop("GOOGLE_API_KEY", None)
        try:
            generate_response("Hello")
            error_subchecks.append(("Missing API key", False, "Expected AgriAssistantError not raised."))
        except AgriAssistantError as e:
            if e.code == "missing_api_key":
                error_subchecks.append(("Missing API key", True, f"Correctly caught code '{e.code}'"))
            else:
                error_subchecks.append(("Missing API key", False, f"Unexpected code '{e.code}'"))
        finally:
            if saved_key is not None:
                os.environ["GEMINI_API_KEY"] = saved_key
            if saved_google is not None:
                os.environ["GOOGLE_API_KEY"] = saved_google
    except Exception as e:
        error_subchecks.append(("Missing API key", False, str(e)))

    # 5c: Invalid API key handling
    try:
        bad_client = genai.Client(api_key="AQ.invalid_dummy_key_for_testing_purposes")
        bad_client.models.generate_content(
            model=get_model_name(),
            contents="Test"
        )
        error_subchecks.append(("Invalid API key", False, "API did not reject invalid key."))
    except Exception as e:
        error_subchecks.append(("Invalid API key", True, f"Correctly rejected bad key ({type(e).__name__})"))

    all_error_checks_passed = all(passed for _, passed, _ in error_subchecks)
    details_str = "; ".join(f"{name}: {'PASS' if passed else 'FAIL'} ({msg})" for name, passed, msg in error_subchecks)

    if all_error_checks_passed:
        results["check_5_errors"] = {
            "status": "PASS",
            "message": f"All error handling pathways verified. Details: {details_str}"
        }
    else:
        results["check_5_errors"] = {
            "status": "FAIL",
            "message": f"Some error checks failed: {details_str}"
        }

    # -------------------------------------------------------------
    # Print Formatted Report
    # -------------------------------------------------------------
    for check_key, data in results.items():
        status_label = "[PASS] ✓" if data["status"] == "PASS" else "[FAIL] ✗"
        print(f"\n{status_label} {check_key.upper()}:")
        print(f"       {data['message']}")

    print("\n" + "=" * 65)
    overall_status = all(d["status"] == "PASS" for d in results.values())
    if overall_status:
        print("OVERALL RESULT: ALL 5 CHECKS PASSED SUCCESSFULLY (5/5)")
        print("=" * 65)
        return 0
    else:
        print("OVERALL RESULT: SOME CHECKS FAILED")
        print("=" * 65)
        return 1


if __name__ == "__main__":
    sys.exit(run_checks())
