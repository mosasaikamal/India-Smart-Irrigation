"""
AgriSaathi Tool Integration - Irrigation Prediction Function Tool.
Defines the approved predict_irrigation tool declaration and independent backend execution.
Strictly calls the existing Logistic Regression model in src/irrigation_predictor.py.
"""

from math import isfinite
from typing import Any, Dict
from google.genai import types

from src.irrigation_predictor import predict_irrigation
from src.crop_registry import is_ml_supported, get_crop, get_supported_crops

# Approved tool name whitelist
APPROVED_TOOL_NAMES = {"predict_irrigation"}

# Supported crop types by the trained models
SUPPORTED_CROPS = {
    1: "Paddy",
    "1": "Paddy",
    "paddy": "Paddy",
    2: "Ground Nuts",
    "2": "Ground Nuts",
    "groundnuts": "Ground Nuts",
    "wheat": "Wheat",
    "maize": "Maize",
    "sugarcane": "Sugarcane",
    "tomato": "Tomato",
    "chilli": "Chilli",
}

# Formal Gemini Function Declaration
PREDICT_IRRIGATION_DECLARATION = types.FunctionDeclaration(
    name="predict_irrigation",
    description=(
        "Execute the trained agricultural Logistic Regression model to predict whether irrigation is needed. "
        "Requires all 6 verified parameters: crop_type, crop_days, soil_moisture, soil_temperature, "
        "temperature, and humidity. Only call this when all 6 parameters are known and verified. "
        "Do NOT call this tool for unsupported crops (e.g. wheat, cotton, maize, tomato, sugarcane)."
    ),
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={
            "crop_type": types.Schema(
                type=types.Type.INTEGER,
                description="Crop type identifier: 1 for Paddy, 2 for Ground Nuts. No other crops are supported.",
            ),
            "crop_days": types.Schema(
                type=types.Type.INTEGER,
                description="Age of the crop in days from sowing/transplanting (positive integer >= 1).",
            ),
            "soil_moisture": types.Schema(
                type=types.Type.NUMBER,
                description="Soil moisture sensor reading (higher values indicate wetter soil).",
            ),
            "soil_temperature": types.Schema(
                type=types.Type.NUMBER,
                description="Soil temperature in Celsius (°C). If given in Fahrenheit, convert to Celsius first.",
            ),
            "temperature": types.Schema(
                type=types.Type.NUMBER,
                description="Air temperature in Celsius (°C). If given in Fahrenheit, convert to Celsius first.",
            ),
            "humidity": types.Schema(
                type=types.Type.NUMBER,
                description="Relative humidity percentage (valid range: 0.0 to 100.0).",
            ),
        },
        required=[
            "crop_type",
            "crop_days",
            "soil_moisture",
            "soil_temperature",
            "temperature",
            "humidity",
        ],
    ),
)

AGRI_TOOLS = [types.Tool(function_declarations=[PREDICT_IRRIGATION_DECLARATION])]


def execute_tool_call(tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """
    Safely validate and execute approved tool calls.
    Enforces strict argument validation on the Flask backend.
    """
    if tool_name not in APPROVED_TOOL_NAMES:
        return {
            "error": f"Unauthorized tool '{tool_name}'. Only 'predict_irrigation' is permitted.",
            "status": "rejected"
        }

    return execute_predict_irrigation(arguments)


def execute_predict_irrigation(args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Independent backend validation and execution of the predict_irrigation tool.
    Never trusts client input; strictly validates types, crop ranges, and units.
    """
    if not isinstance(args, dict):
        return {"error": "Invalid arguments format. Expected dictionary."}

    required_fields = [
        "crop_type",
        "crop_days",
        "soil_moisture",
        "soil_temperature",
        "temperature",
        "humidity",
    ]

    # 1. Missing fields check
    missing = [f for f in required_fields if f not in args or args[f] is None]
    if missing:
        return {
            "error": f"Missing required parameters for irrigation model: {', '.join(missing)}.",
            "missing_fields": missing,
        }

    # 2. Numeric conversion check
    try:
        crop_type_raw = float(args["crop_type"])
        crop_days_raw = float(args["crop_days"])
        moisture = float(args["soil_moisture"])
        soil_temp = float(args["soil_temperature"])
        temp = float(args["temperature"])
        humidity = float(args["humidity"])
    except (TypeError, ValueError) as e:
        return {
            "error": f"All input values must be valid numbers: {str(e)}",
            "status": "validation_error",
        }

    # 3. Finite numbers check (reject NaN and Inf)
    numeric_values = [crop_type_raw, crop_days_raw, moisture, soil_temp, temp, humidity]
    if not all(isfinite(v) for v in numeric_values):
        return {
            "error": "All input values must be finite numbers (no NaN or infinity).",
            "status": "validation_error",
        }

    # 4. Crop type check
    raw_crop = args.get("crop_type")
    if not is_ml_supported(raw_crop):
        supported_names = ", ".join([c["name"] for c in get_supported_crops()])
        return {
            "error": (
                f"Unsupported crop type '{raw_crop}'. The model currently supports: {supported_names}."
            ),
            "status": "unsupported_crop",
        }

    # 5. Crop age check (positive integer >= 1)
    if not crop_days_raw.is_integer() or crop_days_raw < 1:
        return {
            "error": f"Crop age must be a positive whole number >= 1, got {crop_days_raw}.",
            "status": "validation_error",
        }

    # 6. Humidity range check (0 - 100%)
    if humidity < 0 or humidity > 100:
        return {
            "error": f"Relative humidity must be between 0 and 100%, got {humidity}%.",
            "status": "validation_error",
        }

    crop_days = int(crop_days_raw)
    crop_meta = get_crop(raw_crop)
    crop_name = crop_meta["name"] if crop_meta else str(raw_crop)

    # 7. Call the crop prediction function
    try:
        prediction_result = predict_irrigation(
            crop_type=raw_crop,
            crop_days=crop_days,
            soil_moisture=moisture,
            soil_temperature=soil_temp,
            temperature=temp,
            humidity=humidity,
        )

        return {
            "status": "success",
            "crop": SUPPORTED_CROPS.get(raw_crop, SUPPORTED_CROPS.get(str(raw_crop), crop_name)),
            "crop_days": crop_days,
            "soil_moisture": moisture,
            "soil_temperature_celsius": soil_temp,
            "temperature_celsius": temp,
            "humidity_percent": humidity,
            "prediction": prediction_result["prediction"],
            "decision": prediction_result["decision"],
            "probability_no_irrigation": prediction_result["probability_no_irrigation"],
            "probability_irrigation_needed": prediction_result["probability_irrigation_needed"],
            "experimental": True,
            "disclaimer": prediction_result["disclaimer"],
        }
    except FileNotFoundError:
        return {
            "error": "Trained irrigation model file (models/irrigation_model.joblib) not found.",
            "status": "model_missing",
        }
    except Exception as e:
        return {
            "error": f"Prediction error: {str(e)}",
            "status": "execution_error",
        }
