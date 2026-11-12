import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.models import * # Load all models
from backend.app.services.field_service import FieldService

# Routers
from backend.app.routers.fields import router as fields_router
from backend.app.routers.agronomy import router as agronomy_router
from backend.app.routers.weather import router as weather_router
from backend.app.routers.schedules import router as schedules_router
from backend.app.routers.rules import router as rules_router
from backend.app.routers.agents import router as agents_router
from backend.app.routers.edge import router as edge_router
from backend.app.routers.assistant import router as assistant_router
from backend.app.routers.reports import router as reports_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agro_intelligence")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    
    # Seed initial crop, soil, and field profiles
    db = SessionLocal()
    try:
        FieldService.seed_initial_data(db)
        logger.info("Database initialized and seeded successfully.")
    finally:
        db.close()
        
    yield
    logger.info("Shutting down Agro Intelligence backend.")

app = FastAPI(
    title="AGRO INTELLIGENCE API",
    description="Backend services for AI-Powered Smart Irrigation Planning Simulator",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend Vite dev server and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all module routers
app.include_router(fields_router, prefix=settings.API_V1_STR)
app.include_router(agronomy_router, prefix=settings.API_V1_STR)
app.include_router(weather_router, prefix=settings.API_V1_STR)
app.include_router(schedules_router, prefix=settings.API_V1_STR)
app.include_router(rules_router, prefix=settings.API_V1_STR)
app.include_router(agents_router, prefix=settings.API_V1_STR)
app.include_router(edge_router, prefix=settings.API_V1_STR)
app.include_router(assistant_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)

from typing import Optional
from pydantic import BaseModel

class SettingsUpdateRequest(BaseModel):
    llm_provider: Optional[str] = None
    llm_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    openai_base_url: Optional[str] = None

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "HEALTHY",
        "service": "Agro Intelligence Backend",
        "version": settings.VERSION,
        "database": "CONNECTED",
        "llm_provider": settings.LLM_PROVIDER,
        "has_gemini_key": bool(settings.LLM_API_KEY),
        "has_openai_key": bool(settings.OPENAI_API_KEY)
    }

@app.get("/api/settings", tags=["Settings"])
def get_settings():
    return {
        "project_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "llm_provider": settings.LLM_PROVIDER,
        "has_gemini_key": bool(settings.LLM_API_KEY),
        "has_openai_key": bool(settings.OPENAI_API_KEY),
        "openai_base_url": settings.OPENAI_BASE_URL,
        "edge_auth_configured": bool(settings.EDGE_AUTH_TOKEN)
    }

@app.post("/api/settings", tags=["Settings"])
def update_settings(req: SettingsUpdateRequest):
    if req.llm_provider is not None:
        settings.LLM_PROVIDER = req.llm_provider
    if req.llm_api_key is not None:
        settings.LLM_API_KEY = req.llm_api_key
    if req.openai_api_key is not None:
        settings.OPENAI_API_KEY = req.openai_api_key
    if req.openai_base_url is not None:
        settings.OPENAI_BASE_URL = req.openai_base_url
    return {
        "status": "SUCCESS",
        "message": "Configuration updated successfully",
        "settings": {
            "llm_provider": settings.LLM_PROVIDER,
            "has_gemini_key": bool(settings.LLM_API_KEY),
            "has_openai_key": bool(settings.OPENAI_API_KEY),
            "openai_base_url": settings.OPENAI_BASE_URL
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
