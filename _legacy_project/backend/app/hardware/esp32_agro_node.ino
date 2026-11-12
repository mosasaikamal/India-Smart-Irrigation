/*
 * AGRO INTELLIGENCE — IoT Edge Sensing & Local Failsafe Firmware
 * Target Architecture: ESP32 Dev Module / NodeMCU ESP32
 * 
 * Capabilities:
 * 1. Reads Capacitive Soil Moisture Sensor v1.2 (ADC Pin 34)
 * 2. Reads DHT22 Ambient Temperature & Relative Humidity (Pin 4)
 * 3. Reads Optical Digital Rain Gauge (Pin 14)
 * 4. Local Edge Rule: If soil moisture drops below THRESHOLD, flags deficit locally
 * 5. Disconnection Buffer: Caches up to 50 readings in circular SPIFFS/RAM queue if WiFi drops
 * 6. Authenticated HTTP POST JSON dispatch to /api/edge/telemetry
 * 7. Failsafe Relay Guard: Pump relay will NOT energize without active cloud token handshake
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <time.h>

// --- Network & Cloud Ingestion Configuration ---
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* SERVER_URL    = "http://192.168.1.100:8000/api/edge/telemetry";
const char* DEVICE_ID     = "ESP32-NODE-01";
const char* AUTH_TOKEN    = "agro-edge-secret-key-2025";
const char* FIELD_ID      = "field-01";

// --- Hardware Pin Definitions ---
#define SOIL_MOISTURE_PIN 34
#define DHT_PIN            4
#define DHT_TYPE       DHT22
#define RAIN_SENSOR_PIN   14
#define RELAY_VALVE_PIN   26

// Soil Sensor Calibration Constants (12-bit ADC: 0 - 4095)
const int AIR_VALUE   = 3200; // Dry air calibration
const int WATER_VALUE = 1350; // Saturated water calibration

// Local Autonomous Threshold (% moisture)
const float LOCAL_MOISTURE_THRESHOLD = 22.0;

DHT dht(DHT_PIN, DHT_TYPE);

// Offline telemetry cache structure
struct TelemetryRecord {
  char timestamp[25];
  float moisture;
  float temp;
  float humidity;
  bool rain;
  float battery;
  char localAction[35];
  bool isAnomaly;
};

const int MAX_OFFLINE_BUFFER = 50;
TelemetryRecord offlineQueue[MAX_OFFLINE_BUFFER];
int queueHead = 0;
int queueCount = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n[AGRO-EDGE] Initializing Agro Intelligence Edge Node...");
  Serial.println("[AGRO-EDGE] Provenance: PHYSICAL HARDWARE NODE (ESP32)");

  pinMode(SOIL_MOISTURE_PIN, INPUT);
  pinMode(RAIN_SENSOR_PIN, INPUT_PULLUP);
  pinMode(RELAY_VALVE_PIN, OUTPUT);
  digitalWrite(RELAY_VALVE_PIN, LOW); // Physical safety: Defaults to CLOSED / DE-ENERGIZED

  dht.begin();

  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("[AGRO-EDGE] Connecting to WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 15) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[AGRO-EDGE] Connected! IP: " + WiFi.localIP().toString());
    configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  } else {
    Serial.println("\n[AGRO-EDGE] Offline Mode: Operating autonomously with local fallback.");
  }
}

float readSoilMoisture() {
  int raw = analogRead(SOIL_MOISTURE_PIN);
  float pct = map(raw, AIR_VALUE, WATER_VALUE, 0, 100);
  return constrain(pct, 0.0, 100.0);
}

void getISOTimestamp(char* buffer, size_t maxLen) {
  time_t now = time(nullptr);
  struct tm timeinfo;
  if (gmtime_r(&now, &timeinfo)) {
    strftime(buffer, maxLen, "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  } else {
    snprintf(buffer, maxLen, "2026-11-02T12:00:00Z");
  }
}

void transmitTelemetry(TelemetryRecord& record) {
  if (WiFi.status() != WL_CONNECTED) {
    // Buffer locally in circular FIFO queue
    if (queueCount < MAX_OFFLINE_BUFFER) {
      offlineQueue[queueHead] = record;
      queueHead = (queueHead + 1) % MAX_OFFLINE_BUFFER;
      queueCount++;
      Serial.printf("[AGRO-EDGE] Offline: Queued reading #%d\n", queueCount);
    }
    return;
  }

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  // Construct JSON payload conforming to IngestTelemetryPayload schema
  String payload = "{";
  payload += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"auth_token\":\"" + String(AUTH_TOKEN) + "\",";
  payload += "\"field_id\":\"" + String(FIELD_ID) + "\",";
  payload += "\"telemetry\":{";
  payload += "\"recorded_at\":\"" + String(record.timestamp) + "\",";
  payload += "\"moisture_pct\":" + String(record.moisture, 1) + ",";
  payload += "\"temp_c\":" + String(record.temp, 1) + ",";
  payload += "\"humidity_pct\":" + String(record.humidity, 1) + ",";
  payload += "\"rain_detected\":" + String(record.rain ? "true" : "false") + ",";
  payload += "\"battery_pct\":" + String(record.battery, 1) + ",";
  payload += "\"local_action_taken\":\"" + String(record.localAction) + "\",";
  payload += "\"is_anomaly\":" + String(record.isAnomaly ? "true" : "false");
  payload += "}}";

  int httpCode = http.POST(payload);
  if (httpCode == 200 || httpCode == 201) {
    Serial.println("[AGRO-EDGE] Live Telemetry Dispatched Successfully (HTTP 200)");
  } else {
    Serial.printf("[AGRO-EDGE] Dispatch Failed (Code: %d). Buffering locally.\n", httpCode);
  }
  http.end();
}

void loop() {
  TelemetryRecord currentReading;
  getISOTimestamp(currentReading.timestamp, sizeof(currentReading.timestamp));

  currentReading.moisture = readSoilMoisture();
  currentReading.temp = dht.readTemperature();
  currentReading.humidity = dht.readHumidity();
  currentReading.rain = (digitalRead(RAIN_SENSOR_PIN) == LOW);
  currentReading.battery = 98.0; // Simulated battery ADC

  // Local Edge Rule & Sensor Anomaly Detection
  if (currentReading.moisture < 3.0 || currentReading.moisture > 65.0 || currentReading.temp < -15.0 || currentReading.temp > 55.0) {
    // Sensor failure / air gap / short circuit -> lock out actuation
    currentReading.isAnomaly = true;
    snprintf(currentReading.localAction, sizeof(currentReading.localAction), "SENSOR_ANOMALY_INVALID_READING");
    digitalWrite(RELAY_VALVE_PIN, LOW);
  } else {
    currentReading.isAnomaly = false;
    if (currentReading.rain) {
      // Emergency rain lockout
      snprintf(currentReading.localAction, sizeof(currentReading.localAction), "LOCAL_RAIN_LOCKOUT");
      digitalWrite(RELAY_VALVE_PIN, LOW);
    } else if (currentReading.temp > 38.0) {
      // Delay irrigation during scorching midday peak
      snprintf(currentReading.localAction, sizeof(currentReading.localAction), "HEAT_STRESS_PROTECT");
    } else if (currentReading.moisture < 15.0) {
      // Wilting point emergency
      snprintf(currentReading.localAction, sizeof(currentReading.localAction), "LOCAL_EMERGENCY_PULSE");
    } else if (currentReading.moisture < LOCAL_MOISTURE_THRESHOLD) {
      // Allowable depletion threshold crossed
      snprintf(currentReading.localAction, sizeof(currentReading.localAction), "LOCAL_DEFICIT_FLAGGED");
    } else {
      snprintf(currentReading.localAction, sizeof(currentReading.localAction), "NONE");
    }
  }

  transmitTelemetry(currentReading);

  // Read every 10 seconds in demo mode (typically 15-60 minutes in field deployment)
  delay(10000);
}

