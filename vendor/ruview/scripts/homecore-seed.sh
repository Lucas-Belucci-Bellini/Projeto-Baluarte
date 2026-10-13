#!/usr/bin/env bash
#
# homecore-seed.sh — populate the empty HOMECORE state machine with a
# representative cross-section of entities so the web UI renders
# useful content right after `homecore-server` boots.
#
# When homecore-server starts with no plugins loaded and no
# integrations enabled, its state machine is empty by design — the
# web UI shows "No entities registered yet". This script POSTs ~10
# real-looking entities via the HA-compat REST surface.
#
# Where the numbers come from:
#   - sensor.living_room_presence / _motion / bedroom_breathing_rate /
#     bedroom_heart_rate are pulled live from the RuView sensing-server
#     (RUVIEW_URL/api/v1/vitals/12/latest) when reachable.
#   - Other entities use plausible literals.
#
# Usage:
#   bash scripts/homecore-seed.sh
#   HOMECORE_URL=http://localhost:8123 HOMECORE_TOKEN=dev-token bash scripts/homecore-seed.sh
#   RUVIEW_URL=http://ruv-mac-mini:3000 bash scripts/homecore-seed.sh  # live numbers
#
# Idempotent: re-running just updates the values.

set -euo pipefail

URL="${HOMECORE_URL:-http://127.0.0.1:8123}"
TOKEN="${HOMECORE_TOKEN:-dev-token}"
RUVIEW_URL="${RUVIEW_URL:-http://localhost:3000}"

post() {
    local entity_id="$1"; shift
    local body="$1"; shift
    curl -fsS -X POST "$URL/api/states/$entity_id" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$body" >/dev/null && echo "  set $entity_id"
}

# Pull a live snapshot from the RuView sensing-server (optional).
ruview_snapshot="{}"
if curl -fsS --max-time 2 "$RUVIEW_URL/api/v1/vitals/12/latest" -o /tmp/ruview-vitals.json 2>/dev/null; then
    ruview_snapshot=$(cat /tmp/ruview-vitals.json)
    echo "Pulled live RuView snapshot from $RUVIEW_URL"
else
    echo "RuView snapshot unreachable — using defaults (set RUVIEW_URL to your sensing-server to pull live values)"
fi

get_num() {
    local key="$1" default="$2"
    echo "$ruview_snapshot" | python3 -c "
import sys, json
try:
    d = json.loads(sys.stdin.read())
    v = d.get('$key')
    print(v if v is not None else '$default')
except Exception:
    print('$default')
" 2>/dev/null || echo "$default"
}

presence=$(get_num presence false)
breathing=$(get_num breathing_rate_bpm 14.5)
heart_rate=$(get_num heartrate_bpm 68.0)
motion=$(get_num motion 0.0)

echo
echo "Seeding HOMECORE at $URL ..."

post sensor.living_room_presence "{\"state\": \"$presence\", \"attributes\": {\"friendly_name\": \"Living Room Presence\", \"device_class\": \"occupancy\", \"source\": \"RuView ESP32-C6 BFLD\"}}"
post sensor.living_room_motion_score "{\"state\": \"$motion\", \"attributes\": {\"friendly_name\": \"Living Room Motion Score\", \"unit_of_measurement\": \"score\", \"icon\": \"mdi:motion-sensor\"}}"
post sensor.bedroom_breathing_rate "{\"state\": \"$breathing\", \"attributes\": {\"friendly_name\": \"Bedroom Breathing Rate\", \"unit_of_measurement\": \"BPM\", \"device_class\": \"frequency\", \"source\": \"Seeed MR60BHA2 mmWave\"}}"
post sensor.bedroom_heart_rate "{\"state\": \"$heart_rate\", \"attributes\": {\"friendly_name\": \"Bedroom Heart Rate\", \"unit_of_measurement\": \"BPM\", \"device_class\": \"frequency\", \"source\": \"Seeed MR60BHA2 mmWave\"}}"
post light.kitchen_ceiling '{"state": "on", "attributes": {"friendly_name": "Kitchen Ceiling", "brightness": 230, "color_temp_kelvin": 4000, "supported_color_modes": ["color_temp"]}}'
post light.living_room_lamp '{"state": "off", "attributes": {"friendly_name": "Living Room Lamp", "brightness": 0, "supported_color_modes": ["brightness"]}}'
post switch.coffee_maker '{"state": "off", "attributes": {"friendly_name": "Coffee Maker", "device_class": "outlet"}}'
post binary_sensor.front_door '{"state": "off", "attributes": {"friendly_name": "Front Door", "device_class": "door"}}'
post climate.thermostat '{"state": "heat", "attributes": {"friendly_name": "Thermostat", "current_temperature": 21.5, "temperature": 22.0, "hvac_modes": ["off", "heat", "cool", "auto"], "supported_features": 387}}'
post sensor.air_quality_index '{"state": "42", "attributes": {"friendly_name": "Air Quality Index", "unit_of_measurement": "AQI", "device_class": "aqi"}}'

echo
echo "Done. The HOMECORE web UI at http://localhost:5173 should now"
echo "show 10 entities. The Dashboard auto-refreshes every 5 s."
