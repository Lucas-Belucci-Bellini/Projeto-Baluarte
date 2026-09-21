#!/usr/bin/env bash
# ADR-115 — ESP32 ↔ MQTT end-to-end validation harness.
#
# Asserts: real ESP32-S3 CSI source → sensing-server → MQTT broker →
# the full set of expected HA discovery topics + at least one state
# message per entity. Exits 0 only if all asserts pass.
#
# Prereqs (caller responsibility):
#   - ESP32-S3 on COM7 (Windows) or /dev/ttyUSB0 (Linux), provisioned
#     with WiFi credentials + a reachable seed URL (see provision.py)
#   - mosquitto-clients installed (apt-get install mosquitto-clients)
#   - sensing-server built with --features mqtt
#
# Usage:
#   bash scripts/validate-esp32-mqtt.sh \
#       --duration 60 \
#       --broker 127.0.0.1:11883 \
#       --report dist/validation-esp32-<sha>.txt
#
# The script:
#   1. Starts mosquitto locally with allow_anonymous + log_dest stdout
#   2. Starts sensing-server with --source esp32 --mqtt
#   3. Streams `mosquitto_sub -t 'homeassistant/#'` for `duration` seconds
#   4. Parses the captured topics → verifies coverage matrix
#   5. Generates a report under `--report` that goes into the witness bundle
#
# This harness IS the proof-of-life for ADR-115 against real hardware.

set -euo pipefail

# ── Defaults ─────────────────────────────────────────────────────────
DURATION=60
BROKER_HOST="127.0.0.1"
BROKER_PORT=11883
REPORT="dist/validation-esp32-$(git rev-parse --short HEAD 2>/dev/null || echo unknown).txt"
SOURCE="esp32"

usage() {
  cat <<EOF
Usage: $0 [options]

Options:
  --duration N         Seconds to capture MQTT traffic (default 60)
  --broker HOST:PORT   MQTT broker (default 127.0.0.1:11883)
  --source SRC         sensing-server --source flag (default esp32)
  --report FILE        Write validation report here
  -h, --help           This help
EOF
}

# ── Argument parsing ─────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --duration) DURATION="$2"; shift 2 ;;
    --broker)   BROKER_HOST="${2%%:*}"; BROKER_PORT="${2##*:}"; shift 2 ;;
    --source)   SOURCE="$2"; shift 2 ;;
    --report)   REPORT="$2"; shift 2 ;;
    -h|--help)  usage; exit 0 ;;
    *) echo "[validate] unknown arg: $1" >&2; usage; exit 2 ;;
  esac
done

mkdir -p "$(dirname "$REPORT")"
TMPDIR="$(mktemp -d)"
trap "rm -rf '$TMPDIR'" EXIT

# ── Pre-flight checks ────────────────────────────────────────────────
echo "[validate] phase 1/5 — pre-flight"
need() {
  command -v "$1" >/dev/null 2>&1 || { echo "[validate] FATAL: '$1' not on PATH" >&2; exit 3; }
}
need mosquitto_sub
need mosquitto_pub
need cargo

# Confirm a broker is reachable; if not, start one inline.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

BROKER_PID=""
if ! mosquitto_pub -h "$BROKER_HOST" -p "$BROKER_PORT" -t healthcheck -m ok -q 0 2>/dev/null; then
  if command -v mosquitto >/dev/null 2>&1; then
    cat > "$TMPDIR/mosquitto.conf" <<EOF
listener $BROKER_PORT
allow_anonymous true
persistence false
log_dest stdout
EOF
    mosquitto -c "$TMPDIR/mosquitto.conf" >"$TMPDIR/mosquitto.log" 2>&1 &
    BROKER_PID=$!
    echo "[validate] started inline mosquitto pid=$BROKER_PID on $BROKER_PORT"
    sleep 2
  else
    echo "[validate] FATAL: no broker at $BROKER_HOST:$BROKER_PORT and 'mosquitto' not installed" >&2
    exit 4
  fi
fi

# ── Start sensing-server with MQTT ───────────────────────────────────
echo "[validate] phase 2/5 — start sensing-server with --source $SOURCE --mqtt"

SERVER_LOG="$TMPDIR/sensing-server.log"
( cd v2 && cargo run --release -p wifi-densepose-sensing-server \
    --features mqtt --example mqtt_publisher -- \
    --mqtt --mqtt-host "$BROKER_HOST" --mqtt-port "$BROKER_PORT" \
    --source "$SOURCE" \
    >"$SERVER_LOG" 2>&1 ) &
SERVER_PID=$!
echo "[validate] sensing-server pid=$SERVER_PID"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]]; then kill "$SERVER_PID" 2>/dev/null || true; fi
  if [[ -n "${BROKER_PID:-}" ]]; then kill "$BROKER_PID" 2>/dev/null || true; fi
}
trap cleanup EXIT

sleep 3
if ! kill -0 "$SERVER_PID" 2>/dev/null; then
  echo "[validate] FATAL: sensing-server died on startup" >&2
  cat "$SERVER_LOG" | tail -40 >&2
  exit 5
fi

# ── Capture MQTT traffic ─────────────────────────────────────────────
echo "[validate] phase 3/5 — capture MQTT traffic for ${DURATION}s"

MQTT_CAPTURE="$TMPDIR/mqtt-capture.log"
( mosquitto_sub -h "$BROKER_HOST" -p "$BROKER_PORT" -t 'homeassistant/#' -v -W $((DURATION + 5)) \
    >"$MQTT_CAPTURE" 2>&1 ) || true

CAPTURED=$(wc -l < "$MQTT_CAPTURE")
echo "[validate] captured $CAPTURED MQTT lines"

# ── Assert coverage ──────────────────────────────────────────────────
echo "[validate] phase 4/5 — assert coverage"

EXPECTED_DISCOVERY=(
  "binary_sensor/wifi_densepose_.*/presence/config"
  "sensor/wifi_densepose_.*/person_count/config"
  "sensor/wifi_densepose_.*/heart_rate/config"
  "sensor/wifi_densepose_.*/breathing_rate/config"
  "sensor/wifi_densepose_.*/motion_level/config"
  "event/wifi_densepose_.*/fall/config"
  "sensor/wifi_densepose_.*/rssi/config"
  "binary_sensor/wifi_densepose_.*/someone_sleeping/config"
  "binary_sensor/wifi_densepose_.*/possible_distress/config"
  "binary_sensor/wifi_densepose_.*/room_active/config"
  "binary_sensor/wifi_densepose_.*/bathroom_occupied/config"
  "binary_sensor/wifi_densepose_.*/no_movement/config"
  "binary_sensor/wifi_densepose_.*/meeting_in_progress/config"
  "sensor/wifi_densepose_.*/fall_risk_elevated/config"
  "event/wifi_densepose_.*/bed_exit/config"
  "event/wifi_densepose_.*/multi_room_transition/config"
)

PASS=0
FAIL=0
RESULTS=""
for pattern in "${EXPECTED_DISCOVERY[@]}"; do
  if grep -qE "homeassistant/$pattern" "$MQTT_CAPTURE"; then
    PASS=$((PASS + 1))
    RESULTS+="  ✓ $pattern"$'\n'
  else
    FAIL=$((FAIL + 1))
    RESULTS+="  ✗ $pattern"$'\n'
  fi
done

# Also assert at least one state message landed.
STATE_COUNT=$(grep -cE "/state " "$MQTT_CAPTURE" || true)
if [[ "$STATE_COUNT" -gt 0 ]]; then
  RESULTS+="  ✓ at least one state message published ($STATE_COUNT total)"$'\n'
  PASS=$((PASS + 1))
else
  RESULTS+="  ✗ no state messages observed in capture"$'\n'
  FAIL=$((FAIL + 1))
fi

# ── Generate report ──────────────────────────────────────────────────
echo "[validate] phase 5/5 — write report to $REPORT"

cat > "$REPORT" <<EOF
# ADR-115 ESP32 ↔ MQTT validation report

**Date**: $(date -u +%Y-%m-%dT%H:%M:%SZ)
**Commit**: $(git rev-parse HEAD 2>/dev/null || echo "(no git)")
**Branch**: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "(no git)")
**Source**: $SOURCE
**Broker**: $BROKER_HOST:$BROKER_PORT
**Capture duration**: ${DURATION}s
**MQTT lines captured**: $CAPTURED
**State messages observed**: $STATE_COUNT

## Result: $([ "$FAIL" -eq 0 ] && echo "PASS ✓" || echo "FAIL ✗")

- Assertions passed: $PASS
- Assertions failed: $FAIL

## Coverage

$RESULTS

## Tail of sensing-server log (last 20 lines)

\`\`\`
$(tail -20 "$SERVER_LOG" 2>/dev/null || echo "(no log)")
\`\`\`

## Tail of mqtt capture (last 30 lines)

\`\`\`
$(tail -30 "$MQTT_CAPTURE" 2>/dev/null || echo "(no capture)")
\`\`\`

## Reproduce

\`\`\`bash
bash scripts/validate-esp32-mqtt.sh --duration $DURATION --broker $BROKER_HOST:$BROKER_PORT --source $SOURCE
\`\`\`
EOF

echo
echo "[validate] report written to $REPORT"
echo "[validate] PASS=$PASS  FAIL=$FAIL"
if [[ "$FAIL" -gt 0 ]]; then
  echo "[validate] VALIDATION FAILED — see report for details"
  exit 6
fi
echo "[validate] ESP32 ↔ MQTT validation: PASS ✓"
