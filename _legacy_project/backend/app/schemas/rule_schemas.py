from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field

class RuleConditionSchema(BaseModel):
    field: str
    operator: str # "<", "<=", ">", ">=", "==", "!="
    value: Union[float, int, str, bool]

class RuleSchema(BaseModel):
    id: str
    code: str
    name: str
    category: str
    conditions: List[RuleConditionSchema]
    conclusion: str
    action: str
    priority: int
    is_active: bool
    explanation: str

class RuleEvaluationItem(BaseModel):
    rule_id: str
    code: str
    name: str
    category: str
    matched: bool
    action: str
    priority: int
    matched_conditions: List[Dict[str, Any]]
    explanation: str

class RuleExecutionTraceResponse(BaseModel):
    field_id: str
    timestamp: str
    facts_evaluated: Dict[str, Any]
    rules_fired: List[RuleEvaluationItem]
    rules_unfired: List[RuleEvaluationItem]
    top_recommended_action: str
    explanation: str
