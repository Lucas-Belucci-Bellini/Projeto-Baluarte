"""ADR-110 multi-board live capture — 802.15.4 sync + TWT + HE-LTF.

Captures from up to 3 ESP32-C6 boards simultaneously, resets them
together so the leader election starts from a clean slate, then
records 35 s of serial output to per-port log files and prints
a summary of the time-sync state machine, TWT events, and CSI
metadata at the end.
"""
import serial
import threading
import time
import re
import sys
from pathlib import Path

PORTS = ['COM6', 'COM9', 'COM12']
DURATION_SECONDS = 35
OUTPUT_DIR = Path(__file__).parent / 'witness-3board'
OUTPUT_DIR.mkdir(exist_ok=True)


def capture(port: str, results: dict):
    """Reset and capture from one port for DURATION_SECONDS."""
    try:
        ser = serial.Serial(port, 115200, timeout=1)
        # Hard reset via DTR/RTS pulse.
        ser.setDTR(False); ser.setRTS(True); time.sleep(0.05)
        ser.setDTR(False); ser.setRTS(False)
        ser.reset_input_buffer()
        buf = bytearray()
        start = time.time()
        while time.time() - start < DURATION_SECONDS:
            data = ser.read(4096)
            if data:
                buf.extend(data)
        ser.close()
        log_path = OUTPUT_DIR / f'{port}.log'
        log_path.write_bytes(bytes(buf))
        text = bytes(buf).decode('utf-8', errors='replace')
        results[port] = text
        print(f'[{port}] {len(buf)} bytes captured -> {log_path}')
    except Exception as e:
        print(f'[{port}] ERROR: {e}')
        results[port] = None


# Launch 3 capture threads — actual concurrent reset + capture.
results = {}
threads = [threading.Thread(target=capture, args=(p, results)) for p in PORTS]
for t in threads:
    t.start()
for t in threads:
    t.join()


# ── Analyze ────────────────────────────────────────────────────────────

def grep_pattern(text: str, pattern: str, n: int = 8):
    rx = re.compile(pattern)
    return [L.strip() for L in (text or '').split('\n') if rx.search(L)][:n]


print('\n' + '='*78)
print('ADR-110 multi-board capture summary')
print('='*78)


for port in PORTS:
    text = results.get(port)
    if not text:
        print(f'\n--- {port}: NO DATA ---')
        continue
    print(f'\n--- {port} ---')

    # Boot banner
    for L in grep_pattern(text, r'main: ESP32-C6.*Node ID', 2):
        print(f'  banner   : {L}')

    # Time-sync init (802.15.4 path — known broken D1)
    for L in grep_pattern(text, r'c6_ts:.*(init done|promot|stepping down|tx fail)', 4):
        print(f'  c6_ts    : {L}')

    # ESP-NOW sync (D1 workaround, working path)
    for L in grep_pattern(text, r'c6_espnow:.*(init done|promot|stepping down|tx#\d)', 6):
        print(f'  c6_espnow: {L}')

    # WiFi mode + connect status
    for L in grep_pattern(text, r'(wifi:mode|wifi:state|Retrying WiFi|got ip|Connected to WiFi)', 6):
        print(f'  wifi     : {L}')

    # TWT events
    for L in grep_pattern(text, r'c6_twt|itwt|TWT', 5):
        print(f'  twt      : {L}')

    # CSI callbacks
    for L in grep_pattern(text, r'CSI cb #\d+.*len=', 5):
        print(f'  csi_cb   : {L}')

    # 11ax MAC firmware
    for L in grep_pattern(text, r'mac_version:HAL_MAC_ESP32AX', 2):
        print(f'  he-mac   : {L}')


# Cross-board leader election summary
print('\n' + '='*78)
print('Leader election analysis')
print('='*78)
eui_re = re.compile(r'EUI=([0-9a-fA-F]+)')
euis = {}
for port in PORTS:
    text = results.get(port) or ''
    m = eui_re.search(text)
    if m:
        euis[port] = int(m.group(1), 16)
        print(f'  {port}  EUI=0x{m.group(1).lower()}  -> {"LEADER" if False else "candidate"}')

if len(euis) >= 2:
    lowest_port = min(euis, key=euis.get)
    print(f'\n  lowest EUI -> expected leader: {lowest_port} (0x{euis[lowest_port]:016x})')

    # Did a "stepping down" log appear on the non-lowest boards?
    for port in PORTS:
        if port == lowest_port:
            continue
        text = results.get(port) or ''
        if 'stepping down' in text:
            print(f'  {port}: [OK] stepped down (heard leader beacon)')
        elif port in euis:
            print(f'  {port}: [FAIL] did NOT step down — investigate (own EUI=0x{euis[port]:016x}, expected leader=0x{euis[lowest_port]:016x})')
