import pytest
from backend.app.schemas.edge_schemas import (
    TelemetryReadingItem,
    IngestTelemetryPayload,
    SyncOfflineBatchPayload,
    RegisterDevicePayload
)
from backend.app.services.edge_device_service import EdgeDeviceService, SIMULATED_NODES

def test_simulated_edge_disconnection_and_sync():
    dev_id = "ESP32-TEST-01"
    # Register test device
    reg = RegisterDevicePayload(
        device_id=dev_id,
        name="Test Sensor",
        field_id="field-01",
        auth_token="secret-123",
        is_simulated=True
    )
    EdgeDeviceService.register_device(reg)
    
    # Disconnect simulated node
    EdgeDeviceService.toggle_simulated_connection(dev_id, connected=False)
    node = SIMULATED_NODES[dev_id]
    assert node.is_connected is False
    
    # Tick simulation: node should buffer locally
    node.tick_simulation()
    node.tick_simulation()
    assert len(node.offline_buffer) == 2
    
    # Sync offline batch
    sync_payload = SyncOfflineBatchPayload(
        device_id=dev_id,
        auth_token="secret-123",
        field_id="field-01",
        buffered_readings=list(node.offline_buffer)
    )
    res = EdgeDeviceService.sync_offline_batch(sync_payload)
    assert res["status"] == "SYNCED"
    assert res["synced_records_count"] == 2
    assert len(node.offline_buffer) == 0
    assert node.is_connected is True
