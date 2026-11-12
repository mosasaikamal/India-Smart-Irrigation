from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from backend.app.database import Base

class IrrigationScheduleRecord(Base):
    __tablename__ = "irrigation_schedules"

    id = Column(String(50), primary_key=True, index=True)
    field_id = Column(String(50), ForeignKey("fields.id"), nullable=False)
    algorithm_name = Column(String(50), nullable=False, default="Beam Search")
    horizon_days = Column(Integer, nullable=False, default=7)
    beam_width = Column(Integer, nullable=False, default=4)
    nodes_explored = Column(Integer, nullable=False, default=0)
    
    # Quantitative comparison with baseline
    total_water_m3 = Column(Float, nullable=False)
    total_stress_index = Column(Float, nullable=False)
    baseline_water_m3 = Column(Float, nullable=False)
    water_savings_m3 = Column(Float, nullable=False)
    water_savings_pct = Column(Float, nullable=False)
    
    # Detailed daily plans in JSON
    recommended_plan_json = Column(Text, nullable=False)
    alternative_plans_json = Column(Text, nullable=True)
    selection_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
