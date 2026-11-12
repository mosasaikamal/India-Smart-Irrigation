from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from backend.app.database import Base

class AgentRunLog(Base):
    __tablename__ = "agent_run_logs"

    id = Column(String(50), primary_key=True, index=True)
    field_id = Column(String(50), ForeignKey("fields.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Coordinator synthesis
    supervisor_summary = Column(Text, nullable=False)
    consensus_reached = Column(Boolean, default=True)
    conflict_detected = Column(Boolean, default=False)
    conflict_resolution = Column(Text, nullable=True)
    
    # Recommended action & parameters
    final_action = Column(String(50), nullable=False) # IRRIGATE_NOW, DELAY_RAIN, HOLD_OPTIMAL, EMERGENCY_PULSE
    recommended_depth_mm = Column(Float, default=0.0)
    recommended_volume_m3 = Column(Float, default=0.0)
    pump_hours = Column(Float, default=0.0)
    
    # Safety: Human approval required before real operation
    human_approval_status = Column(String(50), default="PENDING") # PENDING, APPROVED, REJECTED, EXECUTED
    approved_by = Column(String(100), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    # Full blackboard snapshot in JSON
    blackboard_snapshot_json = Column(Text, nullable=False)

class AgentMessageLog(Base):
    __tablename__ = "agent_message_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(String(50), ForeignKey("agent_run_logs.id"), nullable=False)
    sender_agent = Column(String(50), nullable=False)
    target_agent = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    sentiment = Column(String(20), default="neutral") # neutral, caution, urgent, approval
    timestamp = Column(DateTime, default=datetime.utcnow)
