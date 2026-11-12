"""
Crop Registry Configuration.
Maintains the metadata of all agricultural crops in the system, distinguishing
between crops with trained machine learning models and upcoming crops awaiting
genuine field sensor calibration data.

Scientific and Data Integrity Mandate:
Only crops with verified, genuine datasets and real irrigation labels are marked as
ml_supported=True. Crops without genuine sensor telemetry remain transparently marked
as upcoming, awaiting calibration data.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional
import json

PROJECT_DIR = Path(__file__).resolve().parent.parent
METRICS_FILE = PROJECT_DIR / "models" / "model_metrics.json"

# Load saved validation metrics if available
_SAVED_METRICS: Dict[str, Any] = {}
if METRICS_FILE.exists():
    try:
        with open(METRICS_FILE, "r", encoding="utf-8") as f:
            _SAVED_METRICS = json.load(f)
    except Exception:
        _SAVED_METRICS = {}


CROP_REGISTRY: Dict[str, Dict[str, Any]] = {
    # -------------------------------------------------------------------------
    # 1. Trained ML Prediction Models (Calibrated on genuine research datasets)
    # -------------------------------------------------------------------------
    "1": {
        "id": 1,
        "key": "1",
        "code": "paddy",
        "name": "Paddy (Rice)",
        "hindi_name": "धान",
        "punjabi_name": "ਝੋਨਾ",
        "telugu_name": "వరి",
        "icon": "🌾",
        "status": "trained",
        "ml_supported": True,
        "model_file": "models/paddy_model.joblib",
        "dataset_source": "GCEK Kalahandi / PeerJ CS IoT-IIRS Dataset",
        "source_url": "https://github.com/GCEKIoTCommunity/Irrigation-Dataset",
        "dataset_records": 100,
        "features": ["CropDays", "Soil Moisture", "Soil Temperature", "Temperature", "Humidity"],
        "algorithm": "Logistic Regression with StandardScaler",
        "accuracy": _SAVED_METRICS.get("1", {}).get("accuracy", 0.85),
        "precision": _SAVED_METRICS.get("1", {}).get("precision", 0.50),
        "recall": _SAVED_METRICS.get("1", {}).get("recall", 0.3333),
        "f1_score": _SAVED_METRICS.get("1", {}).get("f1_score", 0.40),
        "training_date": _SAVED_METRICS.get("1", {}).get("training_date", "2026-11-11"),
        "description": "Trained with 100 field sensor instances from GCEK IoT-IIRS research.",
    },
    "2": {
        "id": 2,
        "key": "2",
        "code": "groundnuts",
        "name": "Ground Nuts (Peanut)",
        "hindi_name": "मूंगफली",
        "punjabi_name": "ਮੂੰਗਫਲੀ",
        "telugu_name": "వేరుశనగ",
        "icon": "🥜",
        "status": "trained",
        "ml_supported": True,
        "model_file": "models/groundnuts_model.joblib",
        "dataset_source": "GCEK Kalahandi / PeerJ CS IoT-IIRS Dataset",
        "source_url": "https://github.com/GCEKIoTCommunity/Irrigation-Dataset",
        "dataset_records": 50,
        "features": ["CropDays", "Soil Moisture", "Soil Temperature", "Temperature", "Humidity"],
        "algorithm": "Logistic Regression with StandardScaler",
        "accuracy": _SAVED_METRICS.get("2", {}).get("accuracy", 0.80),
        "precision": _SAVED_METRICS.get("2", {}).get("precision", 0.50),
        "recall": _SAVED_METRICS.get("2", {}).get("recall", 0.50),
        "f1_score": _SAVED_METRICS.get("2", {}).get("f1_score", 0.50),
        "training_date": _SAVED_METRICS.get("2", {}).get("training_date", "2026-11-11"),
        "description": "Trained with 50 field sensor instances from GCEK IoT-IIRS research.",
    },
    "wheat": {
        "id": 3,
        "key": "wheat",
        "code": "wheat",
        "name": "Wheat (Gehun)",
        "hindi_name": "गेहूँ",
        "punjabi_name": "ਕਣਕ",
        "telugu_name": "గోధుమ",
        "icon": "🌾",
        "status": "trained",
        "ml_supported": True,
        "model_file": "models/wheat_model.joblib",
        "dataset_source": "NIT Raipur Dept of Computer Applications Agricultural Automation",
        "source_url": "https://github.com/NitrrMCACommunity/Agriculture-Automation-",
        "dataset_records": 78,
        "features": ["CropDays", "SoilMoisture", "Temperature", "Humidity"],
        "algorithm": "Random Forest Classifier (Balanced)",
        "accuracy": _SAVED_METRICS.get("wheat", {}).get("accuracy", 0.85),
        "precision": _SAVED_METRICS.get("wheat", {}).get("precision", 0.8333),
        "recall": _SAVED_METRICS.get("wheat", {}).get("recall", 0.7143),
        "f1_score": _SAVED_METRICS.get("wheat", {}).get("f1_score", 0.7692),
        "training_date": _SAVED_METRICS.get("wheat", {}).get("training_date", "2026-11-11"),
        "description": "Trained with 78 genuine field sensor records from NIT Raipur dataset.",
    },
    "maize": {
        "id": 4,
        "key": "maize",
        "code": "maize",
        "name": "Maize / Corn (Makka)",
        "hindi_name": "मक्का",
        "punjabi_name": "ਮੱਕੀ",
        "telugu_name": "మొక్కజొన్న",
        "icon": "🌽",
        "status": "trained",
        "ml_supported": True,
        "model_file": "models/maize_model.joblib",
        "dataset_source": "NIT Raipur Dept of Computer Applications Agricultural Automation",
        "source_url": "https://github.com/NitrrMCACommunity/Agriculture-Automation-",
        "dataset_records": 44,
        "features": ["CropDays", "SoilMoisture", "Temperature", "Humidity"],
        "algorithm": "Random Forest Classifier (Balanced)",
        "accuracy": _SAVED_METRICS.get("maize", {}).get("accuracy", 1.0),
        "precision": _SAVED_METRICS.get("maize", {}).get("precision", 1.0),
        "recall": _SAVED_METRICS.get("maize", {}).get("recall", 1.0),
        "f1_score": _SAVED_METRICS.get("maize", {}).get("f1_score", 1.0),
        "training_date": _SAVED_METRICS.get("maize", {}).get("training_date", "2026-11-11"),
        "description": "Trained with 44 genuine field sensor records from NIT Raipur dataset.",
    },
    "sugarcane": {
        "id": 5,
        "key": "sugarcane",
        "code": "sugarcane",
        "name": "Sugarcane (Ganna)",
        "hindi_name": "गन्ना",
        "punjabi_name": "ਗੰਨਾ",
        "telugu_name": "చెరకు",
        "icon": "🎋",
        "status": "trained",
        "ml_supported": True,
        "model_file": "models/sugarcane_model.joblib",
        "dataset_source": "NIT Raipur Dept of Computer Applications Agricultural Automation",
        "source_url": "https://github.com/NitrrMCACommunity/Agriculture-Automation-",
        "dataset_records": 102,
        "features": ["CropDays", "SoilMoisture", "Temperature", "Humidity"],
        "algorithm": "Logistic Regression with StandardScaler",
        "accuracy": _SAVED_METRICS.get("sugarcane", {}).get("accuracy", 1.0),
        "precision": _SAVED_METRICS.get("sugarcane", {}).get("precision", 1.0),
        "recall": _SAVED_METRICS.get("sugarcane", {}).get("recall", 1.0),
        "f1_score": _SAVED_METRICS.get("sugarcane", {}).get("f1_score", 1.0),
        "training_date": _SAVED_METRICS.get("sugarcane", {}).get("training_date", "2026-11-11"),
        "description": "Trained with 102 genuine field sensor records from NIT Raipur dataset.",
    },
    "tomato": {
        "id": 6,
        "key": "tomato",
        "code": "tomato",
        "name": "Tomato (Tamatar)",
        "hindi_name": "टमाटर",
        "punjabi_name": "ਟਮਾਟਰ",
        "telugu_name": "టమోటా",
        "icon": "🍅",
        "status": "trained",
        "ml_supported": True,
        "model_file": "models/tomato_model.joblib",
        "dataset_source": "Mendeley Data DOI 10.17632/c837v6p8ph.2 (Univ of Salento/Bari)",
        "source_url": "https://data.mendeley.com/datasets/c837v6p8ph/2",
        "dataset_records": 3398,
        "features": ["soil_moisture", "soil_temp", "air_temp", "humidity"],
        "algorithm": "Random Forest Classifier (Balanced)",
        "accuracy": _SAVED_METRICS.get("tomato", {}).get("accuracy", 0.80),
        "precision": _SAVED_METRICS.get("tomato", {}).get("precision", 0.2147),
        "recall": _SAVED_METRICS.get("tomato", {}).get("recall", 0.8140),
        "f1_score": _SAVED_METRICS.get("tomato", {}).get("f1_score", 0.3398),
        "training_date": _SAVED_METRICS.get("tomato", {}).get("training_date", "2026-11-11"),
        "description": "Trained with 3,398 open-field sensor records from Mendeley Precision Irrigation dataset.",
    },
    "chilli": {
        "id": 7,
        "key": "chilli",
        "code": "chilli",
        "name": "Chilli (Mirchi)",
        "hindi_name": "हरी मिर्च",
        "punjabi_name": "ਹਰੀ ਮਿਰਚ",
        "telugu_name": "మిరప",
        "icon": "🌶️",
        "status": "trained",
        "ml_supported": True,
        "model_file": "models/chilli_model.joblib",
        "dataset_source": "Smart Agriculture Dataset (Kaggle / Chaitanya Gopidesi)",
        "source_url": "https://www.kaggle.com/datasets/chaitanyagopidesi/smart-agriculture-dataset",
        "dataset_records": 2764,
        "features": ["MOI", "temp", "humidity"],
        "algorithm": "Random Forest Classifier",
        "accuracy": _SAVED_METRICS.get("chilli", {}).get("accuracy", 0.9747),
        "precision": _SAVED_METRICS.get("chilli", {}).get("precision", 0.9661),
        "recall": _SAVED_METRICS.get("chilli", {}).get("recall", 0.9744),
        "f1_score": _SAVED_METRICS.get("chilli", {}).get("f1_score", 0.9702),
        "training_date": _SAVED_METRICS.get("chilli", {}).get("training_date", "2026-11-11"),
        "description": "Trained with 2,764 sensor records from Smart Agriculture Dataset.",
    },

    # -------------------------------------------------------------------------
    # 2. Upcoming Crops (Awaiting genuine field sensor calibration datasets)
    # -------------------------------------------------------------------------
    "cotton": {
        "id": None,
        "key": "cotton",
        "code": "cotton",
        "name": "Cotton (Kapas)",
        "hindi_name": "कपास",
        "punjabi_name": "ਕਪਾਹ",
        "telugu_name": "పత్తి",
        "icon": "⚪",
        "status": "upcoming",
        "ml_supported": False,
        "dataset_records": 0,
        "description": "Awaiting genuine field sensor calibration dataset. Available public datasets lack binary irrigation decision labels.",
    },
    "soybean": {
        "id": None,
        "key": "soybean",
        "code": "soybean",
        "name": "Soybean",
        "hindi_name": "सोयाबीन",
        "punjabi_name": "ਸੋਇਆਬੀਨ",
        "telugu_name": "సోయాబీన్",
        "icon": "🌱",
        "status": "upcoming",
        "ml_supported": False,
        "dataset_records": 0,
        "description": "Awaiting genuine field sensor calibration dataset. Available public datasets lack binary irrigation decision labels.",
    },
    "mustard": {
        "id": None,
        "key": "mustard",
        "code": "mustard",
        "name": "Mustard (Sarson)",
        "hindi_name": "सरसों",
        "punjabi_name": "ਸਰ੍ਹੋਂ",
        "telugu_name": "ఆవాలు",
        "icon": "🌼",
        "status": "upcoming",
        "ml_supported": False,
        "dataset_records": 0,
        "description": "Awaiting genuine field sensor calibration dataset. Available public datasets lack binary irrigation decision labels.",
    },
    "millets": {
        "id": None,
        "key": "millets",
        "code": "millets",
        "name": "Millets (Bajra / Jowar / Ragi)",
        "hindi_name": "बाजरा / ज्वार (कदन्न)",
        "punjabi_name": "ਬਾਜਰਾ / ਜਵਾਰ",
        "telugu_name": "చిరుధాన్యాలు (జొన్నలు / సజ్జలు)",
        "icon": "🌾",
        "status": "upcoming",
        "ml_supported": False,
        "dataset_records": 0,
        "description": "Awaiting genuine field sensor calibration dataset. Pearl millet and sorghum are primarily rainfed crops without public IoT irrigation ground truth.",
    },
}

# Alias mapping to ensure flexible key resolution
_KEY_ALIASES = {
    "paddy": "1",
    "rice": "1",
    "groundnut": "2",
    "groundnuts": "2",
    "peanut": "2",
}


def get_crop(crop_key: Any) -> Optional[Dict[str, Any]]:
    """Retrieve crop metadata by numeric ID (1, 2) or string key ('wheat', '1', 'paddy')."""
    if crop_key is None:
        return None
    key_str = str(crop_key).strip().lower()
    canonical_key = _KEY_ALIASES.get(key_str, key_str)
    return CROP_REGISTRY.get(canonical_key)


def is_ml_supported(crop_key: Any) -> bool:
    """Check if the given crop has a trained machine learning model."""
    crop = get_crop(crop_key)
    return bool(crop and crop.get("ml_supported", False))


def get_supported_crops() -> List[Dict[str, Any]]:
    """Return list of crops with trained ML models."""
    return [c for c in CROP_REGISTRY.values() if c.get("ml_supported")]


def get_upcoming_crops() -> List[Dict[str, Any]]:
    """Return list of upcoming crops awaiting sensor calibration data."""
    return [c for c in CROP_REGISTRY.values() if not c.get("ml_supported")]
