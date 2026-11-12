from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.edge_schemas import (
    EdgeDeviceResponse,
    RegisterDevicePayload,
    IngestTelemetryPayload,
    SyncOfflineBatchPayload,
    SimulateTickRequest,
    MqttPublishPayload,
    MqttConfigResponse
)
from backend.app.services.edge_device_service import EdgeDeviceService, MqttHardwareGateway

router = APIRouter(prefix="/edge", tags=["Edge AI & IoT"])

@router.get("/devices", response_model=List[EdgeDeviceResponse])
def get_all_devices(db: Session = Depends(get_db)):
    """Lists all simulated and real hardware edge nodes with status, battery, and buffer count"""
    return EdgeDeviceService.get_devices(db)

@router.post("/register", response_model=EdgeDeviceResponse, status_code=status.HTTP_201_CREATED)
def register_device(payload: RegisterDevicePayload, db: Session = Depends(get_db)):
    """Registers a new edge node (ESP32/Arduino or Simulated) with auth credentials"""
    return EdgeDeviceService.register_device(payload, db)

@router.post("/telemetry")
def ingest_live_telemetry(payload: IngestTelemetryPayload, db: Session = Depends(get_db)):
    """Mode 2 / Mode 1 Ingestion: Ingests authenticated sensor readings from ESP32 or simulator"""
    try:
        return EdgeDeviceService.ingest_telemetry(payload, db)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/sync-offline")
def sync_offline_buffer(payload: SyncOfflineBatchPayload, db: Session = Depends(get_db)):
    """Flushes queued readings stored locally on the edge device during disconnection"""
    try:
        return EdgeDeviceService.sync_offline_batch(payload, db)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/toggle-simulation")
def toggle_simulator_connection(device_id: str, connected: bool):
    """Simulates disconnecting or reconnecting an edge sensor to test offline buffer and sync"""
    return EdgeDeviceService.toggle_simulated_connection(device_id, connected)

@router.post("/tick-simulation/{device_id}")
def tick_simulation_node(device_id: str, req: Optional[SimulateTickRequest] = None):
    """Advances simulated edge node step, applying optional anomaly or environmental overrides"""
    try:
        return EdgeDeviceService.tick_simulated_node(device_id, req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/reset-simulation/{device_id}")
def reset_simulation_node(device_id: str):
    """Resets simulated edge node state and clears local offline queue"""
    try:
        return EdgeDeviceService.reset_simulated_node(device_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/mqtt/publish")
def publish_mqtt_telemetry(payload: MqttPublishPayload, db: Session = Depends(get_db)):
    """Mode 2 MQTT Ingestion Gateway: Simulates authenticated MQTT broker message publish"""
    try:
        return MqttHardwareGateway.publish(payload, db)
    except ValueError as e:
        raise HTTPException(status_code=401 if "Unauthorized" in str(e) else 400, detail=str(e))

@router.get("/mqtt/config", response_model=MqttConfigResponse)
def get_mqtt_broker_config():
    """Returns MQTT connection and topic topology configuration for physical edge microcontrollers"""
    return MqttHardwareGateway.get_config()

