"""
Specialized Agricultural Knowledge Test Suite for AgriSaathi.
Tests at least 10 distinct agricultural questions covering the 12 core knowledge areas,
practical explanations, non-guarantee disclaimers, and multilingual versatility.
"""

import sys
import time
from pathlib import Path

# Ensure project root is on sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.agri_assistant import generate_response


QUESTIONS = [
    {
        "num": 1,
        "domain": "1. Irrigation Management (AWD)",
        "lang": "en",
        "question": "What is Alternate Wetting and Drying (AWD) in paddy cultivation, and how does it save water without harming yields?",
        "validate": lambda r: ("alternate" in r.lower() or "awd" in r.lower()) and "water" in r.lower()
    },
    {
        "num": 2,
        "domain": "2. Soil Moisture & Soil Temperature",
        "lang": "hi",
        "question": "मिट्टी का तापमान (Soil Temperature) पौधों की जड़ों द्वारा पोषक तत्व सोखने को कैसे प्रभावित करता है?",
        "validate": lambda r: ("तापमान" in r or "जड़" in r or "पोषक" in r) and len(r) > 100
    },
    {
        "num": 3,
        "domain": "3. Air Temperature & Relative Humidity",
        "lang": "en",
        "question": "Why does a combination of high air temperature and high relative humidity increase fungal disease risks in crops?",
        "validate": lambda r: ("fungal" in r.lower() or "disease" in r.lower() or "humidity" in r.lower()) and len(r) > 80
    },
    {
        "num": 4,
        "domain": "4. Paddy Cultivation Stages",
        "lang": "pa",
        "question": "ਝੋਨੇ ਦੀ ਫ਼ਸਲ ਵਿੱਚ ਪਨੀਰੀ ਲਗਾਉਣ ਤੋਂ ਬਾਅਦ ਪਾਣੀ ਦਾ ਪੱਧਰ ਕਿੰਨਾ ਰੱਖਣਾ ਚਾਹੀਦਾ ਹੈ?",
        "validate": lambda r: sum(1 for c in r if "\u0a00" <= c <= "\u0a7f") > 20
    },
    {
        "num": 5,
        "domain": "5. Groundnut Cultivation & Pegging",
        "lang": "te",
        "question": "వేరుశనగ పంటలో ఊడలు దిగే దశ (Pegging Stage) లో తేమ ఎందుకు అత్యంత కీలకం?",
        "validate": lambda r: sum(1 for c in r if "\u0c00" <= c <= "\u0c7f") > 20
    },
    {
        "num": 6,
        "domain": "6. Water Conservation Practices",
        "lang": "en",
        "question": "How does organic mulching reduce evaporation and protect soil structure in dryland farming?",
        "validate": lambda r: ("mulch" in r.lower() or "evaporation" in r.lower()) and ("soil" in r.lower() or "moisture" in r.lower())
    },
    {
        "num": 7,
        "domain": "7. Soil Health & Organic Carbon",
        "lang": "hi",
        "question": "खेत में जैविक कार्बन (Soil Organic Carbon) बढ़ाने के लिए ढैंचा या हरी खाद का क्या महत्व है?",
        "validate": lambda r: ("कार्बन" in r or "जैविक" in r or "खाद" in r) and len(r) > 80
    },
    {
        "num": 8,
        "domain": "8. Fertilizer & Nutrient Stewardship",
        "lang": "en",
        "question": "What is the 4R principle of nutrient stewardship, and why should farmers do soil testing before applying chemical fertilizers?",
        "validate": lambda r: ("4r" in r.lower() or "right" in r.lower()) and ("soil test" in r.lower() or "nutrient" in r.lower())
    },
    {
        "num": 9,
        "domain": "9. Common Crop Problems (Waterlogging vs Deficiency)",
        "lang": "en",
        "question": "My paddy leaves are turning yellowish-pale. How can I tell if it is due to nitrogen deficiency or waterlogging suffocating the roots?",
        "validate": lambda r: ("nitrogen" in r.lower() or "waterlog" in r.lower() or "root" in r.lower() or "yellow" in r.lower())
    },
    {
        "num": 10,
        "domain": "10. Irrigation Scheduling & Ambiguous Query (Clarifying Question)",
        "lang": "en",
        "question": "Should I irrigate my field right now?",
        "validate": lambda r: ("?" in r or "crop" in r.lower() or "moisture" in r.lower() or "soil" in r.lower())
    },
    {
        "num": 11,
        "domain": "11. Sustainable Agriculture & IPM",
        "lang": "te",
        "question": "సమగ్ర సస్యరక్షణ (Integrated Pest Management - IPM) విధానం ద్వారా పురుగుమందుల ఖర్చును ఎలా తగ్గించవచ్చు?",
        "validate": lambda r: sum(1 for c in r if "\u0c00" <= c <= "\u0c7f") > 20
    },
    {
        "num": 12,
        "domain": "12. Non-Guarantee & Local KVK Verification",
        "lang": "en",
        "question": "Can you guarantee that following your irrigation advice will give me a 100% bumper harvest?",
        "validate": lambda r: ("guarantee" in r.lower() or "cannot" in r.lower() or "kvk" in r.lower() or "local" in r.lower() or "advice" in r.lower())
    }
]


def run_all_tests():
    print("=" * 70)
    print("AgriSaathi Specialized Agricultural Knowledge Test Suite")
    print(f"Total Questions to Test: {len(QUESTIONS)}")
    print("=" * 70)

    passed_count = 0

    for item in QUESTIONS:
        q_num = item["num"]
        domain = item["domain"]
        lang = item["lang"]
        q_text = item["question"]

        print(f"\n[{q_num}/{len(QUESTIONS)}] Testing Domain: {domain}")
        print(f"Language : {lang}")
        print(f"Question : {q_text}")

        try:
            start_t = time.time()
            res = generate_response(prompt=q_text, language=lang)
            elapsed = time.time() - start_t

            reply = res.get("reply", "").strip()
            model = res.get("model", "")

            valid = item["validate"](reply)
            status = "PASS ✓" if valid else "FAIL ✗"

            if valid:
                passed_count += 1

            print(f"Status   : {status} (in {elapsed:.2f}s, model: {model})")
            print("Response Excerpt:")
            preview = reply.replace("\n", " ")[:200]
            print(f"  \"{preview}...\"")

        except Exception as e:
            print(f"Status   : FAIL ✗ (Exception: {str(e)})")

        time.sleep(1.0)  # gentle pacing between API calls

    print("\n" + "=" * 70)
    print(f"FINAL RESULT: {passed_count}/{len(QUESTIONS)} TESTS PASSED")
    print("=" * 70)

    return 0 if passed_count == len(QUESTIONS) else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
