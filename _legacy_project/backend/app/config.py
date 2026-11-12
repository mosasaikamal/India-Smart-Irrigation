import os

class Settings:
    PROJECT_NAME: str = "Agro Intelligence"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./agro_intelligence.db")
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1"
    GEOCODING_BASE_URL: str = "https://geocoding-api.open-meteo.com/v1"
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini") # "gemini", "openai", "none"
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", os.getenv("LLM_API_KEY", ""))
    OPENAI_BASE_URL: str = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    EDGE_AUTH_TOKEN: str = os.getenv("EDGE_AUTH_TOKEN", "agro-edge-secret-key-2025")

settings = Settings()
