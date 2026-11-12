from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class AssistantCitation(BaseModel):
    category: str # "Field State", "Weather Data", "FAO-56 Calculation", "Agricultural Rules", "Optimization Schedule", "Edge Sensor", "Multi-Agent Consensus"
    label: str
    value: str
    source_type: str # "LIVE", "USER_ENTERED", "SIMULATED", "CALCULATED", "PREDICTED"
    field_id: Optional[str] = None
    timestamp: Optional[str] = None
    calculation_method: Optional[str] = None

class AssistantQueryRequest(BaseModel):
    field_id: str
    query: str
    mode_preference: Optional[str] = "AUTO" # "AUTO", "REAL_LLM", "RULE_FALLBACK"

class AssistantQueryResponse(BaseModel):
    field_id: str
    retrieval_timestamp: str
    answer: str
    mode_used: str # "REAL_LLM_GEMINI", "REAL_LLM_OPENAI", "RULE_BASED_MATHEMATICAL_FALLBACK"
    provider_status: Optional[str] = None
    is_grounded: bool = True
    unsupported_elements_noted: bool = False
    evidence_citations: List[AssistantCitation]
    referenced_formulas: List[str]
    assumptions_stated: List[str]
