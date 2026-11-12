"""
AgriSaathi - AI Agricultural Assistant powered by Google Gemini API.
Uses the official Google Gen AI SDK (google-genai) and python-dotenv.
"""

import os
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import APIError, ClientError, ServerError

from src.agri_system_instruction import AGRI_SAATHI_SYSTEM_INSTRUCTION
from src.agri_tools import AGRI_TOOLS, APPROVED_TOOL_NAMES, execute_tool_call
from src.crop_registry import get_crop

# Load environment variables from .env file at project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = PROJECT_ROOT / ".env"
load_dotenv(dotenv_path=ENV_PATH)

# Official verified Gemini Flash models
SUPPORTED_FLASH_MODELS = (
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash",
)
DEFAULT_MODEL = "gemini-3.5-flash-lite"
FALLBACK_MODELS = (
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash",
)

# Session Conversation History Configuration
DEFAULT_MAX_HISTORY = 10
MAX_MESSAGE_LENGTH = 1000


def validate_chat_history(
    raw_history: Any,
    max_messages: int = DEFAULT_MAX_HISTORY,
) -> List[Dict[str, str]]:
    """
    Validate, sanitize, and bound conversation history.
    - Ensures history is a list of dictionary items.
    - Caps history to `max_messages` entries.
    - Accepts roles 'user' or 'model' (normalizes 'assistant' to 'model').
    - Rejects client-supplied tool calls or tool responses.
    - Validates message content is a non-empty string within length bounds.
    - Strips leading model messages so history begins cleanly.
    """
    if not raw_history or not isinstance(raw_history, list):
        return []

    validated: List[Dict[str, str]] = []
    candidates = raw_history[-max_messages:]

    for item in candidates:
        if not isinstance(item, dict):
            continue

        raw_role = item.get("role")
        raw_content = item.get("content")

        if not isinstance(raw_role, str) or not isinstance(raw_content, str):
            continue

        role = raw_role.strip().lower()
        if role == "assistant":
            role = "model"
        elif role not in ("user", "model"):
            continue

        content = raw_content.strip()
        if not content:
            continue

        if len(content) > MAX_MESSAGE_LENGTH:
            content = content[:MAX_MESSAGE_LENGTH]

        validated.append({"role": role, "content": content})

    # Ensure history does not start with an orphaned model message
    while validated and validated[0]["role"] != "user":
        validated.pop(0)

    return validated

SYSTEM_INSTRUCTION = AGRI_SAATHI_SYSTEM_INSTRUCTION


def detect_language(text: str) -> str:
    """
    Detect the primary script/language of the input text:
    - 'te': Telugu (\u0c00 - \u0c7f)
    - 'pa': Punjabi / Gurmukhi (\u0a00 - \u0a7f)
    - 'hi': Hindi / Devanagari (\u0900 - \u097f)
    - 'en': English / Latin / Transliterated
    """
    if not text:
        return "en"

    te_count = sum(1 for c in text if "\u0c00" <= c <= "\u0c7f")
    pa_count = sum(1 for c in text if "\u0a00" <= c <= "\u0a7f")
    hi_count = sum(1 for c in text if "\u0900" <= c <= "\u097f")

    counts = {"te": te_count, "pa": pa_count, "hi": hi_count}
    max_lang = max(counts, key=counts.get)
    if counts[max_lang] > 0:
        return max_lang

    return "en"


class AgriAssistantError(Exception):
    """Base exception for AgriAssistant failures."""

    def __init__(self, message: str, code: str = "general_error", details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.details = details or {}


def get_api_key() -> str:
    """
    Retrieve and validate the Gemini API key from environment variables.
    Never hardcode or expose keys in source code.
    """
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key or api_key.strip() in ("", "your_api_key_here", "your_gemini_api_key_here"):
        raise AgriAssistantError(
            message="Gemini API key is missing. Please set GEMINI_API_KEY in your local .env file.",
            code="missing_api_key",
        )
    return api_key.strip()


def get_model_name() -> str:
    """
    Retrieve configured Gemini model name from GEMINI_MODEL.
    Defaults to the official supported model: gemini-2.5-flash.
    """
    model_name = os.getenv("GEMINI_MODEL", DEFAULT_MODEL).strip()
    return model_name or DEFAULT_MODEL


def get_client() -> genai.Client:
    """
    Create and return an authenticated Google Gen AI Client.
    """
    api_key = get_api_key()
    return genai.Client(api_key=api_key)


def generate_response(
    prompt: str,
    context: Optional[Dict[str, Any]] = None,
    language: str = "en",
    history: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Generate an agricultural recommendation from AgriSaathi via Gemini API.

    :param prompt: User's question or message.
    :param context: Optional sensor readings or prediction results from the dashboard.
    :param language: Language code ('en', 'hi', 'pa', 'te', 'auto').
    :param history: Optional prior conversation turns within current session.
    :return: Dictionary containing 'reply', 'model', and 'status'.
    """
    if not prompt or not prompt.strip():
        raise AgriAssistantError(
            message="Prompt cannot be empty.",
            code="invalid_request",
        )

    client = get_client()
    model_name = get_model_name()

    # Validate and cap conversation history for session context
    validated_history = validate_chat_history(history)

    # Build contextual grounding prompt
    user_content_parts = []

    # Security: never trust prediction outcomes/probabilities supplied by client context.
    # Only ground on raw sensor readings if provided.
    if context and isinstance(context, dict):
        context_items = []
        if "crop_type" in context and context["crop_type"] is not None:
            crop_meta = get_crop(context["crop_type"])
            if crop_meta:
                c_name = crop_meta.get("name", f"Crop ID {context['crop_type']}")
                status_note = "ML Calibrated" if crop_meta.get("ml_supported") else "Awaiting ML calibration"
                context_items.append(f"- Crop: {c_name} ({status_note})")
            else:
                context_items.append(f"- Crop ID: {context['crop_type']}")
        elif "crop_name" in context and context["crop_name"]:
            crop_meta = get_crop(context["crop_name"])
            if crop_meta:
                c_name = crop_meta.get("name", str(context["crop_name"]).title())
                context_items.append(f"- Selected Crop: {c_name} (Upcoming crop; awaiting ML sensor training dataset)")
            else:
                context_items.append(f"- Selected Crop: {str(context['crop_name']).title()} (Upcoming crop; awaiting ML sensor training dataset)")
        if "crop_days" in context and context["crop_days"] is not None:
            context_items.append(f"- Crop Age: {context['crop_days']} days")
        if "soil_moisture" in context and context["soil_moisture"] is not None:
            context_items.append(f"- Soil Moisture Reading: {context['soil_moisture']}")
        if "soil_temperature" in context and context["soil_temperature"] is not None:
            context_items.append(f"- Soil Temperature: {context['soil_temperature']} °C")
        if "temperature" in context and context["temperature"] is not None:
            context_items.append(f"- Air Temperature: {context['temperature']} °C")
        if "humidity" in context and context["humidity"] is not None:
            context_items.append(f"- Relative Humidity: {context['humidity']}%")

        if context_items:
            user_content_parts.append(
                "Active Farm Dashboard Readings (reference only if relevant to user's question; do not push prediction unless requested):\n"
                + "\n".join(context_items)
            )

    detected_lang = detect_language(prompt.strip())

    # Formulate language instructions enforcing conciseness and zero filler
    if language == "hi":
        lang_instruction = "Language Directive: Respond in direct, concise Hindi (हिन्दी) using Devanagari script. Answer directly without filler greetings, repeated explanations, or unprompted disclaimers."
    elif language == "pa":
        lang_instruction = "Language Directive: Respond in direct, concise Punjabi (ਪੰਜਾਬੀ) using Gurmukhi script. Answer directly without filler greetings, repeated explanations, or unprompted disclaimers."
    elif language == "te":
        lang_instruction = "Language Directive: Respond in direct, concise Telugu (తెలుగు) using Telugu script. Answer directly without filler greetings, repeated explanations, or unprompted disclaimers."
    elif language == "en":
        lang_instruction = "Language Directive: Respond in direct, concise, farmer-friendly English. Answer directly without filler greetings, repeated explanations, or unprompted disclaimers."
    else:  # 'auto' or unselected
        if detected_lang == "hi":
            lang_instruction = "Language Directive: AUTO-DETECT. The user message is in HINDI (हिन्दी). Respond directly and concisely in Hindi using Devanagari script without greetings or filler."
        elif detected_lang == "pa":
            lang_instruction = "Language Directive: AUTO-DETECT. The user message is in PUNJABI (ਪੰਜਾਬੀ). Respond directly and concisely in Punjabi using Gurmukhi script without greetings or filler."
        elif detected_lang == "te":
            lang_instruction = "Language Directive: AUTO-DETECT. The user message is in TELUGU (తెలుగు). Respond directly and concisely in Telugu using Telugu script without greetings or filler."
        else:
            lang_instruction = "Language Directive: AUTO-DETECT. Respond in the user's language directly and concisely (1-3 sentences for simple questions; concise bullets only if steps) without filler greetings or unprompted disclaimers."

    user_content_parts.append(lang_instruction)
    user_content_parts.append(f"User Question: {prompt.strip()}")
    final_content = "\n\n".join(user_content_parts)

    # Build multi-turn contents with session history
    contents_list: List[types.Content] = []
    for msg in validated_history:
        contents_list.append(
            types.Content(
                role=msg["role"],
                parts=[types.Part.from_text(text=msg["content"])],
            )
        )

    # Append current turn
    contents_list.append(
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=final_content)],
        )
    )

    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_INSTRUCTION,
        temperature=0.35,
        max_output_tokens=400,
        tools=AGRI_TOOLS,
        automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
    )

    models_to_try = [model_name] + [m for m in FALLBACK_MODELS if m != model_name]
    last_exception = None

    for candidate_model in models_to_try:
        try:
            response = client.models.generate_content(
                model=candidate_model,
                contents=contents_list,
                config=config,
            )

            # Security: handle approved tool calling with strict validation and max 1 execution per turn
            if response.function_calls:
                executed_calls = []
                for call in response.function_calls[:1]:
                    if call.name not in APPROVED_TOOL_NAMES:
                        tool_result = {
                            "error": f"Tool '{call.name}' is unauthorized. Only 'predict_irrigation' is permitted.",
                            "status": "rejected",
                        }
                    else:
                        tool_result = execute_tool_call(call.name, call.args)

                    executed_calls.append({
                        "name": call.name,
                        "args": call.args,
                        "result": tool_result,
                    })

                    continuation_contents = list(contents_list)
                    continuation_contents.append(response.candidates[0].content)
                    continuation_contents.append(
                        types.Content(
                            role="user",
                            parts=[
                                types.Part.from_function_response(
                                    name=call.name,
                                    response={"result": tool_result},
                                )
                            ],
                        ),
                    )

                    followup_response = client.models.generate_content(
                        model=candidate_model,
                        contents=continuation_contents,
                        config=config,
                    )

                    reply_text = followup_response.text or ""
                    return {
                        "reply": reply_text,
                        "model": candidate_model,
                        "status": "success",
                        "tool_executed": True,
                        "tool_calls": executed_calls,
                    }

            reply_text = response.text or ""
            return {
                "reply": reply_text,
                "model": candidate_model,
                "status": "success",
                "tool_executed": False,
            }
        except ClientError as e:
            error_msg = str(e)
            last_exception = e
            # If 429 quota exhausted on this candidate, try the next fallback model
            if "RESOURCE_EXHAUSTED" in error_msg or "429" in error_msg:
                continue
            elif "API_KEY_INVALID" in error_msg or "403" in error_msg:
                raise AgriAssistantError(
                    message="Invalid Gemini API key. Please check the GEMINI_API_KEY in your .env file.",
                    code="invalid_api_key",
                    details={"original_error": error_msg},
                )
            elif "INVALID_ARGUMENT" in error_msg or "400" in error_msg:
                raise AgriAssistantError(
                    message=f"Invalid request sent to Gemini API: {error_msg}",
                    code="invalid_request",
                    details={"original_error": error_msg},
                )
            else:
                continue
        except ServerError as e:
            last_exception = e
            # Try next fallback model on 503/500
            continue
        except Exception as e:
            last_exception = e
            continue

    # If all models failed
    if last_exception:
        err_str = str(last_exception)
        if "RESOURCE_EXHAUSTED" in err_str or "429" in err_str:
            raise AgriAssistantError(
                message="Gemini API rate limit or quota exceeded. Please wait a moment and try again.",
                code="quota_exceeded",
                details={"original_error": err_str},
            )
        elif "503" in err_str or isinstance(last_exception, ServerError):
            raise AgriAssistantError(
                message="Gemini API server is temporarily unavailable. Please try again later.",
                code="server_error",
                details={"original_error": err_str},
            )
        elif isinstance(last_exception, (ConnectionError, TimeoutError, OSError)):
            raise AgriAssistantError(
                message="Network failure: Unable to reach Gemini API. Please check your internet connection.",
                code="network_failure",
                details={"original_error": err_str},
            )
        else:
            raise AgriAssistantError(
                message=f"Unable to process request: {err_str}",
                code="client_error",
                details={"original_error": err_str},
            )

    raise AgriAssistantError(
        message="Unable to generate response from Gemini API.",
        code="unknown_failure"
    )


def verify_connection() -> Dict[str, Any]:
    """
    Lightweight health-check verifying that Gemini can generate a response.
    """
    test_prompt = "Say 'AgriSaathi connection verified successfully' in one brief sentence."
    result = generate_response(prompt=test_prompt)
    return {
        "status": "connected",
        "model": result["model"],
        "sample_reply": result["reply"].strip(),
    }
