"""
Irrigation Service Module.
Single source of truth for Indian State-Wise Crop Irrigation Rules and ML Predictions.
Uses:
- India_State_Crop_Irrigation_Ranges.csv (primary rule-based source of truth)
- irrigation_model.joblib (RandomForest pipeline)
- India_State_Crop_Irrigation_ML_Training_Dataset.csv (training data)
"""

import os
import json
import logging
from math import isfinite
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd

# Set up logger
logger = logging.getLogger("irrigation_service")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s"))
    logger.addHandler(handler)
logger.setLevel(logging.INFO)

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Paths to data and model
RANGES_CSV_PATHS = [
    PROJECT_ROOT / "India_State_Crop_Irrigation_Ranges.csv",
    PROJECT_ROOT / "data" / "India_State_Crop_Irrigation_Ranges.csv",
]
TRAINING_CSV_PATHS = [
    PROJECT_ROOT / "India_State_Crop_Irrigation_ML_Training_Dataset.csv",
    PROJECT_ROOT / "data" / "India_State_Crop_Irrigation_ML_Training_Dataset.csv",
]
MODEL_PATHS = [
    PROJECT_ROOT / "irrigation_model.joblib",
    PROJECT_ROOT / "models" / "irrigation_model.joblib",
]

# Feature definitions
CAT_FEATURES = ["state_or_UT", "crop"]
NUM_FEATURES = [
    "crop_age_days",
    "sensor_reading",
    "gap_to_trigger",
    "soil_temperature_c",
    "air_temperature_c",
    "relative_humidity_pct",
    "rainfall_last_7_days_mm",
    "forecast_rainfall_next_24h_mm",
]


class IrrigationService:
    _instance: Optional["IrrigationService"] = None

    def __init__(self):
        self.ranges_df: Optional[pd.DataFrame] = None
        self.model: Optional[Any] = None
        self._load_data_and_model()

    @classmethod
    def get_instance(cls) -> "IrrigationService":
        if cls._instance is None:
            cls._instance = IrrigationService()
        return cls._instance

    def _resolve_path(self, paths: List[Path]) -> Path:
        for p in paths:
            if p.exists():
                return p
        return paths[0]

    def _load_data_and_model(self):
        # 1. Load Ranges CSV
        ranges_path = self._resolve_path(RANGES_CSV_PATHS)
        if not ranges_path.exists():
            raise FileNotFoundError(f"Ranges CSV not found at any expected path: {RANGES_CSV_PATHS}")
        logger.info(f"Loading irrigation ranges from {ranges_path}")
        self.ranges_df = pd.read_csv(ranges_path)

        # 2. Load or train model
        model_path = self._resolve_path(MODEL_PATHS)
        if model_path.exists():
            logger.info(f"Loading trained irrigation model from {model_path}")
            self.model = joblib.load(model_path)
        else:
            logger.warning(f"Model file not found at {model_path}. Training now...")
            self._train_and_save_model(model_path)

    def _train_and_save_model(self, save_path: Path):
        training_path = self._resolve_path(TRAINING_CSV_PATHS)
        if not training_path.exists():
            raise FileNotFoundError(
                f"Cannot train model: training dataset not found at {training_path}"
            )
        
        logger.info(f"Training RandomForest pipeline from {training_path}")
        from sklearn.compose import ColumnTransformer
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.pipeline import Pipeline
        from sklearn.preprocessing import OneHotEncoder

        df = pd.read_csv(training_path)
        df["gap_to_trigger"] = df["sensor_reading"] - df["irrigation_trigger"]
        X = df[CAT_FEATURES + NUM_FEATURES]
        y = df["irrigation_required"]

        model = Pipeline([
            ("prep", ColumnTransformer([("cat", OneHotEncoder(handle_unknown="ignore"), CAT_FEATURES)], remainder="passthrough")),
            ("clf", RandomForestClassifier(n_estimators=200, min_samples_leaf=2, random_state=42, n_jobs=-1)),
        ])
        model.fit(X, y)

        save_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(model, save_path)
        self.model = model
        logger.info(f"Model trained and saved to {save_path}")

    def get_states(self) -> List[str]:
        if self.ranges_df is None:
            return []
        return sorted(self.ranges_df["state_or_UT"].dropna().unique().tolist())

    def _find_matching_state(self, state_input: str) -> Optional[str]:
        if not state_input or self.ranges_df is None:
            return None
        target = state_input.strip().lower()
        for state in self.get_states():
            if state.lower() == target:
                return state
        return None

    def _normalize_crop_name(self, crop_input: Any) -> str:
        """Map aliases and UI labels to official CSV crop name."""
        if crop_input is None:
            return ""
        c = str(crop_input).strip()
        c_lower = c.lower()

        # Handle Rice / Paddy aliases
        if c_lower in ("1", "rice", "paddy", "paddy (rice)", "paddy(rice)"):
            return "Rice"
        if c_lower in ("2", "groundnut", "groundnuts", "ground nuts", "peanut", "ground nuts (peanut)"):
            return "Groundnut"
        
        # Check against unique crop names in Ranges CSV
        if self.ranges_df is not None:
            unique_crops = self.ranges_df["crop"].unique()
            for uc in unique_crops:
                if uc.lower() == c_lower:
                    return uc
                # Support "Wheat (Gehun)" -> "Wheat", etc.
                if uc.lower() in c_lower or c_lower in uc.lower():
                    return uc
        return c

    def get_crops_for_state(self, state_name: str) -> List[Dict[str, Any]]:
        matched_state = self._find_matching_state(state_name)
        if not matched_state or self.ranges_df is None:
            return []

        state_rows = self.ranges_df[self.ranges_df["state_or_UT"] == matched_state]
        crops = []

        for crop_name, group in state_rows.groupby("crop"):
            unit = str(group["reading_unit"].iloc[0])
            reading_type = str(group["reading_type"].iloc[0])
            is_rice = (crop_name == "Rice")

            irr_row = group[group["decision_zone"] == "IRRIGATE"]
            no_irr_row = group[group["decision_zone"] == "DO NOT IRRIGATE"]
            mon_row = group[group["decision_zone"].str.startswith("MONITOR")]

            trigger = float(irr_row["range_to"].iloc[0]) if not irr_row.empty else (-15.0 if is_rice else 40.0)
            wet_limit = float(no_irr_row["range_from"].iloc[0]) if not no_irr_row.empty else (-15.0 if is_rice else 60.0)

            zones = []
            if is_rice:
                zones = [
                    {
                        "zone": "IRRIGATE",
                        "range_from": -25.0,
                        "range_to": -15.0,
                        "meaning": "Paddy water level at or below -15 cm (water stress)",
                    },
                    {
                        "zone": "DO NOT IRRIGATE",
                        "range_from": -15.0,
                        "range_to": 5.0,
                        "meaning": "Adequate standing water (-15 cm to +5 cm)",
                    },
                ]
            else:
                zones = [
                    {
                        "zone": "IRRIGATE",
                        "range_from": float(irr_row["range_from"].iloc[0]) if not irr_row.empty else 0.0,
                        "range_to": trigger,
                        "meaning": "Moisture at or below irrigation trigger",
                    },
                    {
                        "zone": "MONITOR",
                        "range_from": trigger,
                        "range_to": wet_limit,
                        "meaning": "Moisture above trigger but below wet limit (monitor)",
                    },
                    {
                        "zone": "DO NOT IRRIGATE",
                        "range_from": wet_limit,
                        "range_to": float(no_irr_row["range_to"].iloc[0]) if not no_irr_row.empty else 100.0,
                        "meaning": "Soil moisture is sufficient (wet enough)",
                    },
                ]

            ui_label = "Paddy (Rice)" if is_rice else crop_name
            crops.append({
                "crop": crop_name,
                "label": ui_label,
                "reading_type": reading_type,
                "reading_unit": unit,
                "irrigation_trigger": trigger,
                "no_irrigation_from": wet_limit,
                "zones": zones,
                "rain_override": "If rainfall in last 7 days >= 10 mm then DO NOT IRRIGATE regardless of zone",
                "source": str(group["source"].iloc[0]),
            })

        return sorted(crops, key=lambda x: (0 if x["crop"] == "Rice" else 1, x["label"]))

    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate input, execute ML prediction, evaluate CSV rule, and apply override if needed.
        """
        if not isinstance(data, dict):
            raise ValueError("Input data must be a JSON object.")

        # 1. State validation
        raw_state = data.get("state") or data.get("state_or_UT")
        if not raw_state or not isinstance(raw_state, str) or not raw_state.strip():
            raise ValueError("Please select a state or Union Territory.")
        
        state = self._find_matching_state(raw_state)
        if not state:
            raise ValueError(f"State '{raw_state}' is not recognized. Please choose from available Indian states and Union Territories.")

        # 2. Crop validation
        raw_crop = data.get("crop") or data.get("crop_type")
        if not raw_crop:
            raise ValueError("Please select a crop.")
        
        crop = self._normalize_crop_name(raw_crop)
        state_crops = self.get_crops_for_state(state)
        crop_names = [c["crop"] for c in state_crops]

        if crop not in crop_names:
            available = ", ".join(sorted([c["label"] for c in state_crops]))
            raise ValueError(
                f"Crop '{raw_crop}' is not cultivated or supported for state '{state}'. "
                f"Available crops for {state}: {available}."
            )

        crop_info = next(c for c in state_crops if c["crop"] == crop)
        is_rice = (crop == "Rice")
        trigger = crop_info["irrigation_trigger"]
        wet_limit = crop_info["no_irrigation_from"]
        reading_unit = crop_info["reading_unit"]
        reading_type = crop_info["reading_type"]

        # 3. Numeric inputs validation
        try:
            raw_age = data.get("crop_age_days") if data.get("crop_age_days") is not None else data.get("crop_days")
            if raw_age is None:
                raise ValueError("Crop age in days is required.")
            crop_age = float(raw_age)

            raw_reading = data.get("sensor_reading") if data.get("sensor_reading") is not None else data.get("soil_moisture")
            if raw_reading is None:
                raise ValueError("Sensor reading is required.")
            sensor_reading = float(raw_reading)

            raw_soil_temp = data.get("soil_temp") if data.get("soil_temp") is not None else data.get("soil_temperature")
            if raw_soil_temp is None:
                raise ValueError("Soil temperature is required.")
            soil_temp = float(raw_soil_temp)

            raw_air_temp = data.get("air_temp") if data.get("air_temp") is not None else data.get("temperature")
            if raw_air_temp is None:
                raise ValueError("Air temperature is required.")
            air_temp = float(raw_air_temp)

            raw_hum = data.get("humidity") if data.get("humidity") is not None else data.get("relative_humidity_pct")
            if raw_hum is None:
                raise ValueError("Relative humidity is required.")
            humidity = float(raw_hum)

            raw_rain_7d = data.get("rainfall_7d") if data.get("rainfall_7d") is not None else data.get("rainfall_last_7_days_mm")
            if raw_rain_7d is None:
                raise ValueError("Rainfall in the last 7 days (mm) is required.")
            rainfall_7d = float(raw_rain_7d)

            raw_fc_24h = data.get("forecast_24h") if data.get("forecast_24h") is not None else data.get("forecast_rainfall_next_24h_mm")
            forecast_24h = float(raw_fc_24h) if raw_fc_24h is not None else 0.0

        except (TypeError, ValueError) as e:
            if str(e).endswith("is required."):
                raise ValueError(str(e))
            raise ValueError(f"All sensor and weather inputs must be numeric numbers: {str(e)}")

        # Check finiteness
        for val, name in [
            (crop_age, "Crop age"),
            (sensor_reading, "Sensor reading"),
            (soil_temp, "Soil temperature"),
            (air_temp, "Air temperature"),
            (humidity, "Humidity"),
            (rainfall_7d, "Rainfall in last 7 days"),
            (forecast_24h, "Forecast rainfall"),
        ]:
            if not isfinite(val):
                raise ValueError(f"{name} must be a valid finite number.")

        # Validate bounds
        if crop_age < 1:
            raise ValueError("Crop age must be at least 1 day.")
        if humidity < 0 or humidity > 100:
            raise ValueError("Relative humidity must be between 0% and 100%.")
        if rainfall_7d < 0:
            raise ValueError("Rainfall in the last 7 days cannot be negative.")
        if forecast_24h < 0:
            raise ValueError("Forecast rainfall cannot be negative.")

        # Unit conversions for temperatures
        soil_unit = str(data.get("soil_temp_unit", "C")).strip().upper()
        air_unit = str(data.get("air_temp_unit", "C")).strip().upper()

        if soil_unit == "F":
            soil_temp_c = (soil_temp - 32.0) * 5.0 / 9.0
        elif soil_unit == "K":
            soil_temp_c = soil_temp - 273.15
        else:
            soil_temp_c = soil_temp

        if air_unit == "F":
            air_temp_c = (air_temp - 32.0) * 5.0 / 9.0
        elif air_unit == "K":
            air_temp_c = air_temp - 273.15
        else:
            air_temp_c = air_temp

        # Sensor reading range check
        if is_rice:
            if sensor_reading < -25.0 or sensor_reading > 5.0:
                raise ValueError(
                    f"For Rice, water level must be between -25.0 cm and +5.0 cm relative to the soil surface. "
                    f"Got {sensor_reading} cm."
                )
        else:
            if sensor_reading < 0.0 or sensor_reading > 100.0:
                raise ValueError(
                    f"Soil moisture reading must be between 0% and 100% of field capacity. "
                    f"Got {sensor_reading}%."
                )

        # 4. ML Prediction
        gap_to_trigger = sensor_reading - trigger
        X_df = pd.DataFrame([{
            "state_or_UT": state,
            "crop": crop,
            "crop_age_days": crop_age,
            "sensor_reading": sensor_reading,
            "gap_to_trigger": gap_to_trigger,
            "soil_temperature_c": round(soil_temp_c, 2),
            "air_temperature_c": round(air_temp_c, 2),
            "relative_humidity_pct": round(humidity, 2),
            "rainfall_last_7_days_mm": round(rainfall_7d, 2),
            "forecast_rainfall_next_24h_mm": round(forecast_24h, 2),
        }])

        ml_pred_raw = int(self.model.predict(X_df)[0])
        ml_proba = self.model.predict_proba(X_df)[0]
        # In sklearn clf, classes_ is [0, 1]
        prob_irrigate = float(ml_proba[1]) if len(ml_proba) > 1 else float(ml_pred_raw)

        # 5. Rule Evaluation (Single Source of Truth)
        crop_display = crop_info["label"]
        rain_override_triggered = False

        if rainfall_7d >= 10.0:
            final_status = "DO NOT IRRIGATE"
            rule_binary = 0
            rain_override_triggered = True
            reason = (
                f"{rainfall_7d:.1f} mm rain received in the last 7 days (>= 10.0 mm threshold), "
                f"so no irrigation is needed regardless of moisture reading."
            )
        elif is_rice:
            if sensor_reading <= -15.0:
                final_status = "IRRIGATE"
                rule_binary = 1
                reason = (
                    f"Paddy water level {sensor_reading:.1f} cm is at or below the -15.0 cm trigger. "
                    f"Standing water has depleted, field requires irrigation."
                )
            else:
                final_status = "DO NOT IRRIGATE"
                rule_binary = 0
                reason = (
                    f"Paddy water level {sensor_reading:.1f} cm is above the -15.0 cm trigger. "
                    f"Adequate standing water is present."
                )
        else:
            if sensor_reading <= trigger:
                final_status = "IRRIGATE"
                rule_binary = 1
                reason = (
                    f"Soil moisture {sensor_reading:.1f}% is at or below the {trigger:.1f}% trigger "
                    f"for {crop_display} in {state}."
                )
            elif sensor_reading < wet_limit:
                final_status = "MONITOR"
                rule_binary = 0
                reason = (
                    f"Soil moisture {sensor_reading:.1f}% is in the monitor zone ({trigger:.1f}% to {wet_limit:.1f}%) "
                    f"for {crop_display} in {state}. Do not irrigate yet, keep monitoring."
                )
            else:
                final_status = "DO NOT IRRIGATE"
                rule_binary = 0
                reason = (
                    f"Soil moisture {sensor_reading:.1f}% is at or above the {wet_limit:.1f}% wet limit "
                    f"for {crop_display} in {state}. Soil has sufficient moisture."
                )

        # 6. Override Check: If ML prediction and CSV rule disagree, CSV rule wins
        rule_override = (ml_pred_raw != rule_binary)
        if rule_override:
            logger.warning(
                f"Rule override applied for {crop} in {state}: ML predicted {ml_pred_raw} "
                f"but Ranges CSV rule dictates {final_status} (binary={rule_binary})."
            )

        return {
            "status": final_status,
            "irrigation_required": (final_status == "IRRIGATE"),
            "prediction": 1 if final_status == "IRRIGATE" else 0,
            "reason": reason,
            "rule_override": rule_override,
            "rain_override_triggered": rain_override_triggered,
            "probability_irrigation_needed": round(prob_irrigate, 4),
            "confidence_pct": round(prob_irrigate * 100, 1),
            "ml_prediction": "IRRIGATE" if ml_pred_raw == 1 else "DO NOT IRRIGATE",
            "state": state,
            "crop": crop,
            "crop_label": crop_display,
            "reading_type": reading_type,
            "reading_unit": reading_unit,
            "sensor_reading": sensor_reading,
            "gap_to_trigger": round(gap_to_trigger, 2),
            "irrigation_trigger": trigger,
            "no_irrigation_from": wet_limit,
            "zones": crop_info["zones"],
            "inputs": {
                "crop_age_days": int(crop_age),
                "soil_temperature_c": round(soil_temp_c, 1),
                "air_temperature_c": round(air_temp_c, 1),
                "relative_humidity_pct": round(humidity, 1),
                "rainfall_last_7_days_mm": round(rainfall_7d, 1),
                "forecast_rainfall_next_24h_mm": round(forecast_24h, 1),
            },
            "model_info": {
                "algorithm": "Random Forest Classifier (ColumnTransformer + OneHotEncoder)",
                "dataset_source": "India State-Wise Crop Irrigation Dataset",
                "badge_text": "Trained on state-wise crop irrigation dataset (synthetic rule-based)",
                "records_count": 16240,
            },
            "disclaimer": "Experimental prediction based on state-wise crop rules. Always verify field conditions before irrigating."
        }
