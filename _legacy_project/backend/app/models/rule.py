from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from backend.app.database import Base

class AgriculturalRuleModel(Base):
    __tablename__ = "agricultural_rules"

    id = Column(String(50), primary_key=True, index=True)
    code = Column(String(50), nullable=False, unique=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False) # Triggering, Postponement, Critical, Saturation, Sensor
    conditions_json = Column(Text, nullable=False) # JSON array of conditions
    conclusion = Column(Text, nullable=False)
    action = Column(String(50), nullable=False) # TRIGGER_IRRIGATION, POSTPONE_RAIN, EMERGENCY_WATER, BLOCK_SATURATION, SENSOR_ALERT
    priority = Column(Integer, nullable=False, default=5) # 1 (Highest) to 10
    is_active = Column(Boolean, default=True)
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class RuleExecutionLog(Base):
    __tablename__ = "rule_execution_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    rule_id = Column(String(50), ForeignKey("agricultural_rules.id"), nullable=False)
    field_id = Column(String(50), ForeignKey("fields.id"), nullable=False)
    evaluated_at = Column(DateTime, default=datetime.utcnow)
    inputs_json = Column(Text, nullable=False)
    condition_matched = Column(Boolean, nullable=False)
    action_taken = Column(String(50), nullable=False)
    execution_trace = Column(Text, nullable=False)
