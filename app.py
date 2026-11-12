"""
AI Smart Irrigation Planner - Flask Application.
Rebuilt to use the India State-Wise Crop Irrigation Ranges and ML model.
"""

import logging
from math import isfinite
from flask import Flask, jsonify, request, render_template

from src.irrigation_service import IrrigationService
from src.agri_assistant import generate_response, AgriAssistantError, validate_chat_history

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("app")

# Initialize Flask application
app = Flask(__name__)

# Initialize Irrigation Service at startup
irrigation_service = IrrigationService.get_instance()
logger.info(f"Loaded {len(irrigation_service.get_states())} Indian states and UTs.")


# Home page: display index.html
@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")


# Health check: verify that the backend is running
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "running",
        "project": "AI Smart Irrigation Planner",
        "states_count": len(irrigation_service.get_states()),
        "model_loaded": irrigation_service.model is not None,
    })


# States API: list all 36 Indian states and UTs
@app.route("/api/states", methods=["GET"])
def get_states():
    states = irrigation_service.get_states()
    return jsonify({
        "states": states,
        "total": len(states),
    })


# Crop metadata API: list crops for a given state
@app.route("/api/crops", methods=["GET"])
def get_crops():
    state = request.args.get("state", "").strip()
    if not state:
        # Return all unique crops if no state query provided
        all_states = irrigation_service.get_states()
        return jsonify({
            "error": "Please provide a state parameter, e.g. /api/crops?state=Punjab",
            "available_states": all_states,
        }), 400

    crops = irrigation_service.get_crops_for_state(state)
    if not crops:
        return jsonify({
            "error": f"State '{state}' was not found. Please choose from available states.",
            "crops": [],
            "total": 0,
        }), 404

    return jsonify({
        "state": state,
        "crops": crops,
        "total": len(crops),
    })


# Unified Prediction API: receive data and return model prediction & rule evaluation
@app.route("/predict", methods=["POST"])
@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Please send input as a JSON object."
        }), 400

    try:
        result = irrigation_service.predict(data)
        return jsonify(result), 200
    except ValueError as e:
        logger.warning(f"Validation error in predict: {str(e)}")
        return jsonify({
            "error": str(e),
            "status": "error",
        }), 400
    except Exception as e:
        logger.exception("Unexpected error during irrigation prediction")
        return jsonify({
            "error": f"Prediction failed: {str(e)}",
            "status": "error",
        }), 500


# Chat API: receive farmer query and return AgriSaathi response from Gemini
@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Please send input as a JSON object."
        }), 400

    raw_message = data.get("message")
    if not raw_message or not isinstance(raw_message, str) or not raw_message.strip():
        return jsonify({
            "error": "Message cannot be empty."
        }), 400

    message = raw_message.strip()
    if len(message) > 1000:
        return jsonify({
            "error": "Message is too long. Please limit your question to 1000 characters."
        }), 400

    language = str(data.get("language", "auto")).strip().lower()
    if language not in ("auto", "en", "hi", "pa", "te"):
        language = "auto"

    context = data.get("context")
    if not isinstance(context, dict):
        context = None

    raw_history = data.get("history")
    validated_history = validate_chat_history(raw_history)

    try:
        result = generate_response(
            prompt=message,
            context=context,
            language=language,
            history=validated_history,
        )
        return jsonify({
            "reply": result["reply"],
            "model": result.get("model", ""),
            "status": "success",
        })
    except AgriAssistantError as e:
        status_code = 400 if e.code in ("invalid_request", "missing_api_key") else 500
        return jsonify({
            "error": e.message,
            "code": e.code,
            "status": "error",
        }), status_code
    except Exception as e:
        return jsonify({
            "error": "Unable to process your request with AgriSaathi at this time.",
            "status": "error",
        }), 500


# Start the local development server
if __name__ == "__main__":
    app.run(debug=True)
