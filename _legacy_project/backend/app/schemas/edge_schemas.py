from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class TelemetryReadingItem(BaseModel):
    recorded_at: str # ISO timestamp
    moisture_pct: float = Field(..., ge=0, le=100)
    temp_c: float = Field(..., ge=-20, le=60)
    humidity_pct: float = Field(..., ge=0, le=100)
    rain_detected: bool = False
    battery_pct: float = Field(95.0, ge=0, le=100)
    local_action_taken: str = "NONE"
    is_anomaly: bool = False
    anomaly_description: Optional[str] = None

class IngestTelemetryPayload(BaseModel):
    device_id: str
    auth_token: str
    field_id: str
    telemetry: TelemetryReadingItem

class SyncOfflineBatchPayload(BaseModel):
    device_id: str
    auth_token: str
    field_id: str
    buffered_readings: List[TelemetryReadingItem]

class RegisterDevicePayload(BaseModel):
    device_id: str
    name: str
    field_id: str
    auth_token: str
    firmware_version: str = "v1.2.0-esp32"
    local_threshold_moisture: float = 22.0
    is_simulated: bool = False

class EdgeDeviceResponse(BaseModel):
    id: str
    name: str
    field_id: str
    status: str # ONLINE, OFFLINE, DISCONNECTED, SYNCING
    battery_level_pct: float
    firmware_version: str
    is_simulated: bool
    local_threshold_moisture: float
    last_heartbeat: datetime
    queued_buffer_count: int = 0

class SimulateTickRequest(BaseModel):
    moisture_override: Optional[float] = None
    temp_override: Optional[float] = None
    rain_override: Optional[bool] = None

class MqttPublishPayload(BaseModel):
    device_id: str
    auth_token: str
    topic: str
    field_id: str
    telemetry: TelemetryReadingItem

class MqttConfigResponse(BaseModel):
    broker_host: str = "mqtt.agrointelligence.internal"
    port: int = 8883
    protocol: str = "MQTTS / TLS v1.3"
    client_id_prefix: str = "agro-edge-"
    telemetry_topic: str = "agro/telemetry/{device_id}"
    command_topic: str = "agro/commands/{device_id}"
    keepalive_seconds: int = 60
    auth_mechanism: str = "X.509 Device Certificate + Token Header"

