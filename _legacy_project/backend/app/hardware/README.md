# Agro Intelligence — Hardware Integration Architecture & Guide

This directory provides the specification, wiring schematic, communication protocols, and sample firmware for integrating physical microcontroller nodes (**ESP32 / Arduino / RP2040**) with the **Agro Intelligence Smart Irrigation Simulator**.

> **PROVENANCE & HARDWARE SEPARATION NOTICE**  
> Agro Intelligence strictly differentiates virtual simulated edge nodes from physical microcontrollers.  
> Simulated nodes run an in-memory state machine in software (`is_simulated: true`) and are **never misrepresented as real physical hardware**. Physical field nodes must register with `is_simulated: false` and communicate via cryptographically authenticated HTTP or MQTT.

---

## 1. Hardware Pinout & Wiring Diagram

The reference firmware (`esp32_agro_node.ino`) is configured for the **ESP32 Dev Module (38-pin or 30-pin)**:

| Sensor / Actuator | Microcontroller Pin | Signal Type | Operating Voltage | Notes |
|---|---|---|---|---|
| **Capacitive Soil Moisture v1.2** | `GPIO 34 (ADC1_CH6)` | Analog (0 - 3.3V) | 3.3V VCC | Corrosion-resistant capacitive probe |
| **DHT22 Temperature & Humidity** | `GPIO 4` | Digital 1-Wire | 3.3V VCC | 10kΩ pull-up resistor between VCC & DATA |
| **Tipping Bucket / Optical Rain Gauge** | `GPIO 14` | Digital Interrupt / Pullup | 3.3V VCC | Pulse output per 0.2mm precipitation |
| **Relay Module (Pump / Solenoid Valve)** | `GPIO 26` | Active-HIGH Digital Output | 5V VCC / 3.3V Logic | **Safety Interlock**: De-energized by default |
| **Status Indicator LED** | `GPIO 2` | Onboard LED | Built-in | Blinks on successful telemetry dispatch |

---

## 2. Ingestion Protocols

Agro Intelligence supports dual authenticated transport protocols: **HTTP REST** and **MQTT Gateway**.

### A. Authenticated HTTP REST Protocol
The edge node dispatches JSON telemetry packets to:
```http
POST http://<SERVER_IP>:8000/api/edge/telemetry
Content-Type: application/json
```

#### JSON Request Payload Schema:
```json
{
  "device_id": "ESP32-NODE-01",
  "auth_token": "agro-edge-secret-key-2025",
  "field_id": "field-01",
  "telemetry": {
    "recorded_at": "2026-11-02T14:30:00Z",
    "moisture_pct": 21.8,
    "temp_c": 28.4,
    "humidity_pct": 46.2,
    "rain_detected": false,
    "battery_pct": 94.5,
    "local_action_taken": "LOCAL_DEFICIT_FLAGGED",
    "is_anomaly": false
  }
}
```

#### Response Schema:
```json
{
  "status": "SUCCESS",
  "device_id": "ESP32-NODE-01",
  "ingested_at": "2026-11-02T14:30:01.120Z",
  "telemetry_recorded_at": "2026-11-02T14:30:00Z",
  "is_anomaly": false,
  "local_action_taken": "LOCAL_DEFICIT_FLAGGED",
  "ack": true
}
```

---

### B. Industrial MQTT Topic Hierarchy
For low-bandwidth satellite/cellular links, devices publish to an industrial MQTT broker:
- **Broker Host**: `mqtt.agrointelligence.internal` (Port 8883 / TLS v1.3)
- **Telemetry Ingestion Topic**: `agro/telemetry/{device_id}`
- **Supervisory Command Topic**: `agro/commands/{device_id}`
- **Device Status & LWT (Last Will)**: `agro/status/{device_id}` (publishes `OFFLINE` on ungraceful disconnect)

Example MQTT Telemetry Packet:
```json
{
  "device_id": "ESP32-NODE-01",
  "auth_token": "agro-edge-secret-key-2025",
  "topic": "agro/telemetry/ESP32-NODE-01",
  "field_id": "field-01",
  "telemetry": {
    "recorded_at": "2026-11-02T14:30:00Z",
    "moisture_pct": 22.4,
    "temp_c": 27.5,
    "humidity_pct": 50.0,
    "rain_detected": false,
    "battery_pct": 97.0,
    "local_action_taken": "NONE"
  }
}
```

---

## 3. Disconnection & Offline Resynchronization

When WiFi or cellular connectivity drops:
1. The firmware caches up to 50 readings in a local circular FIFO buffer (SPIFFS flash / SRAM).
2. The local rule engine continues monitoring:
   - Soil moisture < threshold -> `LOCAL_DEFICIT_FLAGGED`
   - Soil moisture < 15% -> `LOCAL_EMERGENCY_PULSE`
   - Rain detected -> `LOCAL_RAIN_LOCKOUT`
   - Ambient temp > 38°C -> `HEAT_STRESS_PROTECT`
3. Upon network reconnection, the node invokes the batch synchronization endpoint:
```http
POST http://<SERVER_IP>:8000/api/edge/sync-offline
Content-Type: application/json

{
  "device_id": "ESP32-NODE-01",
  "auth_token": "agro-edge-secret-key-2025",
  "field_id": "field-01",
  "buffered_readings": [ ... ]
}
```
All buffered readings are inserted into the database with their **original recorded timestamps preserved** for exact historical continuity, while duplicate records are automatically filtered out.

---

## 4. Sensor Anomaly Guard & Failsafe Rules

To prevent false irrigation actuation caused by faulty hardware:
- **Moisture < 3.0%**: Indicates disconnected probe, broken wiring, or air gap. Flags `SENSOR_ANOMALY_INVALID_READING` and locks valve closed.
- **Moisture > 65.0%**: Indicates probe short circuit or submerged sensor housing. Flags `SENSOR_ANOMALY_INVALID_READING`.
- **Temperature < -15°C or > 55°C**: Indicates thermistor failure or direct sun thermal runaway.
- **Physical Safety Interlock**: High-voltage irrigation pumps remain normally-open (relay de-energized) unless explicit operator authorization is received.

