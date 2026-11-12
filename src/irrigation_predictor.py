"""
Irrigation Predictor Module.
Bridges to the unified IrrigationService which uses India_State_Crop_Irrigation_Ranges.csv
and irrigation_model.joblib for all Indian states and crops.
"""

from typing import Any, Dict, Optional
from src.irrigation_service import IrrigationService

def predict_irrigation(
    crop_type: Any,
    crop_days: float,
    soil_moisture: float,
    soil_temperature: float,
    temperature: float,
    humidity: float,
    state: str = "Punjab",
    rainfall_7d: float = 0.0,
    forecast_24h: float = 0.0,
) -> Dict[str, Any]:
    """
    Generate an irrigation recommendation using the unified State-Wise Irrigation Service.
    """
    service = IrrigationService.get_instance()
    
    # Map legacy numeric crop types
    crop_str = str(crop_type)
    if crop_str == "1":
        crop_name = "Rice"
    elif crop_str == "2":
        crop_name = "Groundnut"
        state = "Andhra Pradesh"  # Groundnut is in AP, TN, Gujarat etc.
    else:
        crop_name = crop_str

    payload = {
        "state": state,
        "crop": crop_name,
        "crop_age_days": crop_days,
        "sensor_reading": soil_moisture,
        "soil_temp": soil_temperature,
        "soil_temp_unit": "C",
        "air_temp": temperature,
        "air_temp_unit": "C",
        "humidity": humidity,
        "rainfall_7d": rainfall_7d,
        "forecast_24h": forecast_24h,
    }
    return service.predict(payload)
