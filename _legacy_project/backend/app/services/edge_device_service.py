import math
import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.models.edge import EdgeDeviceModel, EdgeTelemetryLog
from backend.app.schemas.edge_schemas import (
    TelemetryReadingItem,
    IngestTelemetryPayload,
    SyncOfflineBatchPayload,
    RegisterDevicePayload,
    EdgeDeviceResponse,
    SimulateTickRequest,
    MqttPublishPayload,
    MqttConfigResponse
)

class SimulatedEdgeNode:
    """
    In-memory state machine for Mode 1 Simulated Edge IoT Node.
    Models soil moisture depletion, diurnal thermal shifts, edge anomaly detection,
    and disconnected circular offline buffering.
    """
    def __init__(self, device_id: str, field_id: str, threshold: float = 22.0):
        self.device_id = device_id
        self.field_id = field_id
        self.threshold = threshold
        self.is_connected = True
        self.battery_pct = 96.0
        self.offline_buffer: List[TelemetryReadingItem] = []
        self.base_moisture = 24.5
        self.step = 0

    def tick_simulation(
        self,
        moisture_override: Optional[float] = None,
        temp_override: Optional[float] = None,
        rain_override: Optional[bool] = None
    ) -> TelemetryReadingItem:
        self.step += 1
        # Diurnal temperature cycle: peaks at midday
        hour = (self.step * 2) % 24
        calc_temp = 22.0 + 8.0 * math.sin((hour - 8) * math.pi / 12.0)
        calc_humidity = 65.0 - 20.0 * math.sin((hour - 8) * math.pi / 12.0)
        
        # Apply overrides if provided
        if moisture_override is not None:
            self.base_moisture = moisture_override
        else:
            # Slow natural soil drying: 0.15% per tick unless rain occurs
            self.base_moisture = max(10.0, self.base_moisture - 0.15)
            
        temp = temp_override if temp_override is not None else calc_temp
        rain = rain_override if rain_override is not None else False
        humidity = calc_humidity if not rain else min(95.0, calc_humidity + 25.0)
        
        # Edge AI & TinyML local decision logic with Failsafe Anomaly Detection
        is_anomaly = False
        anomaly_desc: Optional[str] = None
        local_action = "NONE"
        
        # 1. Physical sensor anomaly guard (broken wire, air gap, or short circuit)
        if self.base_moisture < 3.0:
            is_anomaly = True
            anomaly_desc = "Volumetric moisture < 3.0% indicates probe disconnection, air gap, or wire rupture."
            local_action = "SENSOR_ANOMALY_INVALID_READING"
        elif self.base_moisture > 65.0:
            is_anomaly = True
            anomaly_desc = "Volumetric moisture > 65.0% indicates sensor short circuit or flooded casing."
            local_action = "SENSOR_ANOMALY_INVALID_READING"
        elif temp < -15.0 or temp > 55.0:
            is_anomaly = True
            anomaly_desc = f"Ambient temperature {temp:.1f}°C exceeds sensor operational boundaries."
            local_action = "SENSOR_ANOMALY_INVALID_READING"
        # 2. Local autonomous rules when sensor is healthy
        elif rain:
            local_action = "LOCAL_RAIN_LOCKOUT"
        elif temp > 38.0:
            local_action = "HEAT_STRESS_PROTECT"
        elif self.base_moisture < 15.0:
            local_action = "LOCAL_EMERGENCY_PULSE"
        elif self.base_moisture < self.threshold:
            local_action = "LOCAL_DEFICIT_FLAGGED"
            
        reading = TelemetryReadingItem(
            recorded_at=datetime.now(timezone.utc).isoformat(),
            moisture_pct=round(self.base_moisture, 1),
            temp_c=round(temp, 1),
            humidity_pct=round(humidity, 1),
            rain_detected=rain,
            battery_pct=round(max(10.0, self.battery_pct - 0.02 * self.step), 1),
            local_action_taken=local_action,
            is_anomaly=is_anomaly,
            anomaly_description=anomaly_desc
        )
        
        if not self.is_connected:
            # Buffer reading locally in edge non-volatile queue (max 50 per spec)
            if len(self.offline_buffer) < 50:
                self.offline_buffer.append(reading)
                
        return reading

# In-memory registry for fast simulation state
SIMULATED_NODES: Dict[str, SimulatedEdgeNode] = {
    "ESP32-SIM-01": SimulatedEdgeNode("ESP32-SIM-01", "field-01", threshold=22.0),
    "ESP32-SIM-02": SimulatedEdgeNode("ESP32-SIM-02", "field-02", threshold=20.0)
}

class MqttHardwareGateway:
    """
    Simulated MQTT broker gateway for industrial IoT hardware.
    Handles topics:
      - Publish: 'agro/telemetry/{device_id}'
      - Subscribe / Control: 'agro/commands/{device_id}'
    """
    @classmethod
    def publish(cls, payload: MqttPublishPayload, db: Optional[Session] = None) -> Dict[str, Any]:
        expected_topic = f"agro/telemetry/{payload.device_id}"
        if payload.topic != expected_topic:
            raise ValueError(f"Invalid MQTT topic '{payload.topic}'. Expected '{expected_topic}'")
            
        ingest_payload = IngestTelemetryPayload(
            device_id=payload.device_id,
            auth_token=payload.auth_token,
            field_id=payload.field_id,
            telemetry=payload.telemetry
        )
        res = EdgeDeviceService.ingest_telemetry(ingest_payload, db)
        return {
            "status": "MQTT_MESSAGE_PUBLISHED",
            "topic": payload.topic,
            "qos": 1,
            "broker_ack": True,
            "telemetry_ack": res
        }

    @classmethod
    def get_config(cls) -> MqttConfigResponse:
        return MqttConfigResponse()

class EdgeDeviceService:
    """
    Manages IoT edge devices for both Mode 1 (Simulation) and Mode 2 (Real Hardware).
    Enforces strict distinction: Simulated nodes are explicitly flagged with is_simulated=True.
    """

    @classmethod
    def register_device(cls, payload: RegisterDevicePayload, db: Optional[Session] = None) -> EdgeDeviceResponse:
        now = datetime.now(timezone.utc)
        if payload.is_simulated and payload.device_id not in SIMULATED_NODES:
            SIMULATED_NODES[payload.device_id] = SimulatedEdgeNode(
                payload.device_id, payload.field_id, payload.local_threshold_moisture
            )
            
        if db is not None:
            existing = db.query(EdgeDeviceModel).filter(EdgeDeviceModel.id == payload.device_id).first()
            if not existing:
                dev = EdgeDeviceModel(
                    id=payload.device_id,
                    name=payload.name,
                    field_id=payload.field_id,
                    auth_token=payload.auth_token,
                    status="ONLINE",
                    firmware_version=payload.firmware_version,
                    local_threshold_moisture=payload.local_threshold_moisture,
                    is_simulated=payload.is_simulated,
                    last_heartbeat=now.replace(tzinfo=None)
                )
                db.add(dev)
                db.commit()
                
        return EdgeDeviceResponse(
            id=payload.device_id,
            name=payload.name,
            field_id=payload.field_id,
            status="ONLINE",
            battery_level_pct=96.0,
            firmware_version=payload.firmware_version,
            is_simulated=payload.is_simulated,
            local_threshold_moisture=payload.local_threshold_moisture,
            last_heartbeat=now,
            queued_buffer_count=0
        )

    @classmethod
    def ingest_telemetry(cls, payload: IngestTelemetryPayload, db: Optional[Session] = None) -> Dict[str, Any]:
        """Ingests live telemetry from hardware ESP32/Arduino or simulated node with token validation & anomaly check"""
        now = datetime.now(timezone.utc)
        try:
            rec_time = datetime.fromisoformat(payload.telemetry.recorded_at.replace("Z", "+00:00")).replace(tzinfo=None)
        except Exception:
            rec_time = now.replace(tzinfo=None)
        
        # Sensor Anomaly Guard: Validate physical plausibility at ingestion
        moist = payload.telemetry.moisture_pct
        temp = payload.telemetry.temp_c
        if moist < 3.0 or moist > 65.0 or temp < -15.0 or temp > 55.0:
            payload.telemetry.is_anomaly = True
            payload.telemetry.local_action_taken = "SENSOR_ANOMALY_INVALID_READING"
            if payload.telemetry.anomaly_description is None:
                payload.telemetry.anomaly_description = "Sensor reading violates physical agricultural boundaries."

        if db is not None:
            # Check device auth
            dev = db.query(EdgeDeviceModel).filter(EdgeDeviceModel.id == payload.device_id).first()
            if dev and dev.auth_token != payload.auth_token:
                raise ValueError("Unauthorized: Invalid device authentication token")
                
            if dev:
                dev.last_heartbeat = now.replace(tzinfo=None)
                dev.battery_level_pct = payload.telemetry.battery_pct
                dev.status = "ONLINE"
                
            log_entry = EdgeTelemetryLog(
                device_id=payload.device_id,
                field_id=payload.field_id,
                recorded_at=rec_time,
                synced_at=now.replace(tzinfo=None),
                moisture_pct=payload.telemetry.moisture_pct,
                temp_c=payload.telemetry.temp_c,
                humidity_pct=payload.telemetry.humidity_pct,
                rain_detected=payload.telemetry.rain_detected,
                battery_pct=payload.telemetry.battery_pct,
                local_action_taken=payload.telemetry.local_action_taken,
                was_offline_buffered=False
            )
            db.add(log_entry)
            db.commit()
            
        return {
            "status": "SUCCESS",
            "device_id": payload.device_id,
            "ingested_at": now.isoformat(),
            "telemetry_recorded_at": payload.telemetry.recorded_at,
            "is_anomaly": payload.telemetry.is_anomaly,
            "local_action_taken": payload.telemetry.local_action_taken,
            "ack": True
        }

    @classmethod
    def sync_offline_batch(cls, payload: SyncOfflineBatchPayload, db: Optional[Session] = None) -> Dict[str, Any]:
        """Flushes offline queued buffer upon reconnection, deduplicating records"""
        now = datetime.now(timezone.utc)
        synced_count = 0
        
        if db is not None:
            dev = db.query(EdgeDeviceModel).filter(EdgeDeviceModel.id == payload.device_id).first()
            if dev and dev.auth_token != payload.auth_token:
                raise ValueError("Unauthorized: Invalid device authentication token")
            if dev:
                dev.status = "ONLINE"
                dev.last_heartbeat = now.replace(tzinfo=None)
                
            for item in payload.buffered_readings:
                try:
                    r_time = datetime.fromisoformat(item.recorded_at.replace("Z", "+00:00")).replace(tzinfo=None)
                except Exception:
                    r_time = now.replace(tzinfo=None)
                    
                # Deduplication check: Do not insert duplicate device_id + recorded_at
                existing_log = db.query(EdgeTelemetryLog).filter(
                    EdgeTelemetryLog.device_id == payload.device_id,
                    EdgeTelemetryLog.recorded_at == r_time
                ).first()
                if existing_log:
                    continue
                    
                log_entry = EdgeTelemetryLog(
                    device_id=payload.device_id,
                    field_id=payload.field_id,
                    recorded_at=r_time,
                    synced_at=now.replace(tzinfo=None),
                    moisture_pct=item.moisture_pct,
                    temp_c=item.temp_c,
                    humidity_pct=item.humidity_pct,
                    rain_detected=item.rain_detected,
                    battery_pct=item.battery_pct,
                    local_action_taken=item.local_action_taken,
                    was_offline_buffered=True
                )
                db.add(log_entry)
                synced_count += 1
            db.commit()
        else:
            synced_count = len(payload.buffered_readings)
            
        # Clear simulated node buffer if applicable
        if payload.device_id in SIMULATED_NODES:
            SIMULATED_NODES[payload.device_id].offline_buffer.clear()
            SIMULATED_NODES[payload.device_id].is_connected = True
            
        return {
            "status": "SYNCED",
            "device_id": payload.device_id,
            "synced_records_count": synced_count,
            "synced_at": now.isoformat()
        }

    @classmethod
    def toggle_simulated_connection(cls, device_id: str, connected: bool) -> Dict[str, Any]:
        if device_id in SIMULATED_NODES:
            node = SIMULATED_NODES[device_id]
            node.is_connected = connected
            return {
                "device_id": device_id,
                "is_connected": connected,
                "buffered_count": len(node.offline_buffer)
            }
        return {"device_id": device_id, "error": "Simulated node not found"}

    @classmethod
    def tick_simulated_node(cls, device_id: str, req: Optional[SimulateTickRequest] = None) -> Dict[str, Any]:
        if device_id not in SIMULATED_NODES:
            raise ValueError(f"Simulated node {device_id} not found")
        node = SIMULATED_NODES[device_id]
        reading = node.tick_simulation(
            moisture_override=req.moisture_override if req else None,
            temp_override=req.temp_override if req else None,
            rain_override=req.rain_override if req else None
        )
        return {
            "device_id": device_id,
            "is_connected": node.is_connected,
            "reading": reading.model_dump(),
            "buffered_count": len(node.offline_buffer)
        }

    @classmethod
    def reset_simulated_node(cls, device_id: str) -> Dict[str, Any]:
        if device_id not in SIMULATED_NODES:
            raise ValueError(f"Simulated node {device_id} not found")
        node = SIMULATED_NODES[device_id]
        node.base_moisture = 24.5
        node.is_connected = True
        node.offline_buffer.clear()
        node.step = 0
        return {
            "device_id": device_id,
            "status": "RESET",
            "is_connected": True,
            "buffered_count": 0
        }

    @classmethod
    def get_devices(cls, db: Optional[Session] = None) -> List[EdgeDeviceResponse]:
        now = datetime.now(timezone.utc)
        results: List[EdgeDeviceResponse] = []
        
        # Include simulated nodes (explicitly marked is_simulated=True)
        for dev_id, sim in SIMULATED_NODES.items():
            results.append(EdgeDeviceResponse(
                id=dev_id,
                name=f"Simulated Node ({dev_id})",
                field_id=sim.field_id,
                status="ONLINE" if sim.is_connected else "DISCONNECTED (OFFLINE)",
                battery_level_pct=sim.battery_pct,
                firmware_version="v1.2.0-sim",
                is_simulated=True,
                local_threshold_moisture=sim.threshold,
                last_heartbeat=now if sim.is_connected else now - timedelta(minutes=15),
                queued_buffer_count=len(sim.offline_buffer)
            ))
            
        # Include DB devices
        if db is not None:
            db_devices = db.query(EdgeDeviceModel).all()
            for d in db_devices:
                if d.id not in SIMULATED_NODES:
                    last_hb = d.last_heartbeat
                    if last_hb.tzinfo is None:
                        last_hb = last_hb.replace(tzinfo=timezone.utc)
                    # Check watchdog timeout: if last heartbeat > 5 minutes ago, mark OFFLINE
                    is_online = (now - last_hb).total_seconds() < 300
                    results.append(EdgeDeviceResponse(
                        id=d.id,
                        name=d.name,
                        field_id=d.field_id,
                        status="ONLINE" if is_online else "OFFLINE",
                        battery_level_pct=d.battery_level_pct,
                        firmware_version=d.firmware_version,
                        is_simulated=d.is_simulated,
                        local_threshold_moisture=d.local_threshold_moisture,
                        last_heartbeat=last_hb,
                        queued_buffer_count=0
                    ))
        return results

