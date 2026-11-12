from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.assistant_schemas import AssistantQueryRequest, AssistantQueryResponse
from backend.app.services.ai_assistant_service import AiAssistantService
from backend.app.services.field_service import FieldService

router = APIRouter(prefix="/assistant", tags=["Grounded AI Assistant"])

@router.post("/query", response_model=AssistantQueryResponse)
async def query_ai_assistant(req: AssistantQueryRequest, db: Session = Depends(get_db)):
    """Grounded AI Assistant: Answers questions citing factual field records, FAO-56 math, and rules"""
    field = FieldService.get_field_by_id(db, req.field_id)
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
        
    return await AiAssistantService.answer_query(field, req, db)
