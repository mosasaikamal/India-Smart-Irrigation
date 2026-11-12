from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from backend.app.database import Base

class EdgeDeviceModel(Base):
    __tablename__ = "edge_devices"

    id = Column(String(50), primary_key=True, index=True) # e.g. "ESP32-NODE-01"
    name = Column(String(100), nullable=False)
    field_id = Column(String(50), ForeignKey("fields.id"), nullable=False)
    auth_token = Column(String(100), nullable=False)
    status = Column(String(20), default="ONLINE") # ONLINE, OFFLINE, DISCONNECTED, ERROR
    battery_level_pct = Column(Float, default=95.0)
    firmware_version = Column(String(20), default="v1.2.0-esp32")
    is_simulated = Column(Boolean, default=True)
    local_threshold_moisture = Column(Float, default=22.0)
    last_heartbeat = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class EdgeTelemetryLog(Base):
    __tablename__ = "edge_telemetry_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(String(50), ForeignKey("edge_devices.id"), nullable=False)
    field_id = Column(String(50), nullable=False)
    recorded_at = Column(DateTime, nullable=False)
    synced_at = Column(DateTime, default=datetime.utcnow)
    moisture_pct = Column(Float, nullable=False)
    temp_c = Column(Float, nullable=False)
    humidity_pct = Column(Float, nullable=False)
    rain_detected = Column(Boolean, default=False)
    battery_pct = Column(Float, default=95.0)
    local_action_taken = Column(String(50), default="NONE") # NONE, LOCAL_VALVE_CLOSE, EMERGENCY_SHUTOFF
    was_offline_buffered = Column(Boolean, default=False)
