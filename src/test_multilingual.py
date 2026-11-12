"""
Multilingual verification script for AgriSaathi.
Tests all four supported languages:
1. English (en)
2. Hindi (hi)
3. Punjabi (pa)
4. Telugu (te)
Plus auto-detection and mixed-language queries.
"""

import sys
from pathlib import Path

# Ensure project root is on sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.agri_assistant import generate_response, detect_language


def run_tests():
    print("=" * 65)
    print("AgriSaathi Multilingual Verification Suite")
    print("=" * 65)

    test_cases = [
        {
            "id": "1. English Manual",
            "lang": "en",
            "prompt": "How can I conserve irrigation water during the seedling stage of paddy?",
            "check": lambda reply: any(w in reply.lower() for w in ["water", "paddy", "irrigation", "soil", "conserve"]),
            "expected_desc": "English response with agricultural terms (irrigation, water, paddy)"
        },
        {
            "id": "2. Hindi Manual",
            "lang": "hi",
            "prompt": "धान की फसल में मिट्टी की नमी (Soil Moisture) कैसे बनाए रखें?",
            "check": lambda reply: any(w in reply for w in ["नमी", "धान", "सिंचाई", "पानी", "खेत"]),
            "expected_desc": "Hindi response with Devanagari script and terms (नमी, धान, सिंचाई)"
        },
        {
            "id": "3. Punjabi Manual",
            "lang": "pa",
            "prompt": "ਝੋਨੇ ਦੀ ਫ਼ਸਲ ਲਈ ਪਾਣੀ ਦੀ ਬੱਚਤ ਅਤੇ ਸਿੰਚਾਈ ਦਾ ਸਹੀ ਤਰੀਕਾ ਕੀ ਹੈ?",
            "check": lambda reply: sum(1 for c in reply if "\u0a00" <= c <= "\u0a7f") > 15,
            "expected_desc": "Punjabi response with Gurmukhi script and agricultural terms"
        },
        {
            "id": "4. Telugu Manual",
            "lang": "te",
            "prompt": "వరి పంటలో సాగునీటి నిర్వహణ మరియు నేల తేమను ఎలా కాపాడుకోవాలి?",
            "check": lambda reply: sum(1 for c in reply if "\u0c00" <= c <= "\u0c7f") > 15,
            "expected_desc": "Telugu response with Telugu script and agricultural terms"
        },
        {
            "id": "5. Auto-Detect (Hindi)",
            "lang": "auto",
            "prompt": "मूंगफली के लिए सही तापमान क्या होता है?",
            "check": lambda reply: any(w in reply for w in ["मूंगफली", "तापमान", "डिग्री", "फसल"]),
            "expected_desc": "Auto-detected Hindi input and responded in Hindi"
        },
        {
            "id": "6. Auto-Detect (Telugu)",
            "lang": "auto",
            "prompt": "వేరుశనగ పంటకు నీరు ఎప్పుడు పెట్టాలి?",
            "check": lambda reply: any(w in reply for w in ["వేరుశనగ", "నీరు", "తేమ", "పంట"]),
            "expected_desc": "Auto-detected Telugu input and responded in Telugu"
        },
        {
            "id": "7. Mixed Language (Hinglish)",
            "lang": "auto",
            "prompt": "Mera paddy ka khet hai, soil moisture 140 hai, abhi paani dena chahiye ya wait karu?",
            "check": lambda reply: any(w in reply for w in ["पानी", "धान", "नमी", "water", "irrigation", "wait", "इंतजार"]),
            "expected_desc": "Understood mixed transliterated query and provided conversational advice"
        }
    ]

    all_passed = True

    for tc in test_cases:
        print(f"\n--- Testing [{tc['id']}] ---")
        print(f"Language Mode : {tc['lang']}")
        print(f"User Prompt   : {tc['prompt']}")
        
        try:
            res = generate_response(prompt=tc["prompt"], language=tc["lang"])
            reply = res.get("reply", "")
            model = res.get("model", "")
            
            passed = tc["check"](reply)
            status_text = "PASS ✓" if passed else "FAIL ✗"
            if not passed:
                all_passed = False

            print(f"Status        : {status_text}")
            print(f"Model Used    : {model}")
            print(f"Excerpt       : {reply.strip()[:180]}...")
        except Exception as e:
            print(f"Status        : FAIL ✗ (Exception: {str(e)})")
            all_passed = False

    print("\n" + "=" * 65)
    if all_passed:
        print("ALL MULTILINGUAL TEST CASES PASSED (7/7)!")
        print("=" * 65)
        return 0
    else:
        print("SOME MULTILINGUAL TEST CASES FAILED.")
        print("=" * 65)
        return 1


if __name__ == "__main__":
    sys.exit(run_tests())
