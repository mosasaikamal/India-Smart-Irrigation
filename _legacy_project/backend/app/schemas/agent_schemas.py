from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class AgentStateSchema(BaseModel):
    agent_id: str
    name: str
    role: str
    status: str # IDLE, PROCESSING, EVALUATING, ALERT, CONSENSUS_REACHED
    execution_time_ms: float
    input_summary: str
    output_decision: str
    confidence_score: float # 0 to 100
    urgency: str # LOW, MEDIUM, HIGH, CRITICAL
    proposed_action: str
    proposed_depth_mm: float
    proposed_volume_m3: float
    reasoning: List[str]

class AgentMessageSchema(BaseModel):
    sender: str
    recipient: str
    timestamp: str
    content: str
    sentiment: str # neutral, caution, urgent, approval

class HumanApprovalPayload(BaseModel):
    run_id: str
    approved: bool
    user_name: str = "Operator"
    notes: Optional[str] = None

class BlackboardStateResponse(BaseModel):
    run_id: str
    field_id: str
    timestamp: str
    agents: List[AgentStateSchema]
    messages: List[AgentMessageSchema]
    supervisor_summary: str
    conflict_detected: bool
    conflict_details: Optional[str] = None
    conflict_resolution: Optional[str] = None
    final_action: str
    final_depth_mm: float
    final_volume_m3: float
    pump_hours: float
    human_approval_required: bool = True
    approval_status: str # PENDING, APPROVED, REJECTED
    approved_by: Optional[str] = None
