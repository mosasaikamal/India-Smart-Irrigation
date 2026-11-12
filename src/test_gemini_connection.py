"""
Backend connection test for Google Gemini API integration in AgriSaathi.
Run this script to verify:
1. Environment variables and .env configuration.
2. Official google-genai SDK initialization.
3. Error handling paths.
4. Live connection and response generation when an API key is configured.
"""

import sys
import os
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.agri_assistant import (
    AgriAssistantError,
    get_model_name,
    verify_connection,
    generate_response,
)


def run_test():
    print("=" * 60)
    print("AgriSaathi - Google Gemini API Integration Test")
    print("=" * 60)

    model_name = get_model_name()
    print(f"[1/3] Configured Gemini Model : {model_name}")

    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    has_key = bool(api_key and api_key.strip() not in ("", "your_api_key_here", "your_gemini_api_key_here"))

    print(f"[2/3] API Key Status          : {'Configured (hidden for security)' if has_key else 'Not configured'}")

    if not has_key:
        print("\n" + "-" * 60)
        print("NOTICE: No live API key detected.")
        print("To enable live queries, create a .env file in the project root:")
        print("    GEMINI_API_KEY=your_actual_api_key_here")
        print(f"    GEMINI_MODEL={model_name}")
        print("-" * 60)

        print("\n[3/3] Testing error handling pathways...")
        try:
            generate_response("Hello")
            print("❌ Error: generate_response should have raised AgriAssistantError for missing key.")
            return 1
        except AgriAssistantError as e:
            print(f"✓ Error handling verified: [{e.code}] {e.message}")

        try:
            # Test empty prompt validation
            generate_response("")
            print("❌ Error: generate_response should have raised AgriAssistantError for empty prompt.")
            return 1
        except AgriAssistantError as e:
            print(f"✓ Empty prompt handling verified: [{e.code}] {e.message}")

        print("\nAll offline validation checks passed successfully!")
        print("Add your GEMINI_API_KEY to .env and run this script again to verify live connectivity.")
        return 0

    print("\n[3/3] Sending test request to Gemini API...")
    try:
        result = verify_connection()
        print("\n" + "=" * 60)
        print("✓ SUCCESS: Gemini API connection verified!")
        print(f"Model used    : {result['model']}")
        print(f"Sample reply  : {result['sample_reply']}")
        print("=" * 60)
        return 0
    except AgriAssistantError as e:
        print("\n" + "=" * 60)
        print(f"❌ Connection test failed: [{e.code}]")
        print(f"Details: {e.message}")
        print("=" * 60)
        return 1


if __name__ == "__main__":
    exit_code = run_test()
    sys.exit(exit_code)
