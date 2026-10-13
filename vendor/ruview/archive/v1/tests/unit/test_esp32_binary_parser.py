"""Tests for ESP32BinaryParser (ADR-018 binary frame format)."""

import asyncio
import math
import socket
import struct
import threading
import time

import numpy as np
import pytest

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from hardware.csi_extractor import (
    ESP32BinaryParser,
    CSIExtractor,
    CSIParseError,
    CSIExtractionError,
    SyncPacket,
    SyncPacketParser,
)

# ADR-018 constants
MAGIC = 0xC5110001
# ADR-110: bytes 18-19 are now PPDU type + flags (used to be `2x` reserved).
# Pre-ADR-110 firmware sends zeros for both, which round-trip as
# ('ht_legacy', flags=all-false) — fully backwards compatible.
HEADER_FMT = '<IBBHIIBBBB'
HEADER_SIZE = 20


def build_binary_frame(
    node_id: int = 1,
    n_antennas: int = 1,
    n_subcarriers: int = 4,
    freq_mhz: int = 2437,
    sequence: int = 0,
    rssi: int = -50,
    noise_floor: int = -90,
    iq_pairs: list = None,
    ppdu_byte: int = 0,   # ADR-110: default 0 = HT/legacy (pre-ADR-110 behavior)
    flags_byte: int = 0,  # ADR-110: default 0 = no flags set
) -> bytes:
    """Build an ADR-018 binary frame for testing."""
    if iq_pairs is None:
        iq_pairs = [(i % 50, (i * 2) % 50) for i in range(n_antennas * n_subcarriers)]

    rssi_u8 = rssi & 0xFF
    noise_u8 = noise_floor & 0xFF

    header = struct.pack(
        HEADER_FMT,
        MAGIC,
        node_id,
        n_antennas,
        n_subcarriers,
        freq_mhz,
        sequence,
        rssi_u8,
        noise_u8,
        ppdu_byte,
        flags_byte,
    )

    iq_data = b''
    for i_val, q_val in iq_pairs:
        iq_data += struct.pack('<bb', i_val, q_val)

    return header + iq_data


class TestAdr110ByteEncoding:
    """ADR-110: byte 18 = PPDU type, byte 19 = flags."""

    def setup_method(self):
        self.parser = ESP32BinaryParser()

    def test_pre_adr110_zeros_decode_as_ht_legacy(self):
        """Pre-ADR-110 firmware sends zeros → must surface as HT/legacy + no flags."""
        frame = build_binary_frame()  # ppdu_byte=0, flags_byte=0 default
        csi = self.parser.parse(frame)
        assert csi.metadata['ppdu_type'] == 'ht_legacy'
        assert csi.metadata['ppdu_type_raw'] == 0
        assert csi.metadata['he_capable'] is False
        assert csi.metadata['bw40'] is False
        assert csi.metadata['stbc'] is False
        assert csi.metadata['ldpc'] is False
        assert csi.metadata['ieee802154_sync_valid'] is False

    def test_he_su_decodes(self):
        frame = build_binary_frame(ppdu_byte=1)
        csi = self.parser.parse(frame)
        assert csi.metadata['ppdu_type'] == 'he_su'
        assert csi.metadata['he_capable'] is True

    def test_he_mu_and_he_tb_decode(self):
        for byte, expected in [(2, 'he_mu'), (3, 'he_tb')]:
            csi = self.parser.parse(build_binary_frame(ppdu_byte=byte))
            assert csi.metadata['ppdu_type'] == expected
            assert csi.metadata['he_capable'] is True

    def test_unknown_ppdu_byte(self):
        csi = self.parser.parse(build_binary_frame(ppdu_byte=0xFF))
        assert csi.metadata['ppdu_type'] == 'unknown'
        assert csi.metadata['ppdu_type_raw'] == 0xFF
        assert csi.metadata['he_capable'] is False

    def test_all_flags_set_round_trip(self):
        # bw40 (0x01) + STBC (0x04) + LDPC (0x08) + 15.4-sync (0x10) = 0x1D
        csi = self.parser.parse(build_binary_frame(ppdu_byte=1, flags_byte=0x1D))
        assert csi.metadata['bw40'] is True
        assert csi.metadata['stbc'] is True
        assert csi.metadata['ldpc'] is True
        assert csi.metadata['ieee802154_sync_valid'] is True
        assert csi.metadata['adr018_flags_raw'] == 0x1D


class TestESP32BinaryParser:
    """Tests for ESP32BinaryParser."""

    def setup_method(self):
        self.parser = ESP32BinaryParser()

    def test_parse_valid_binary_frame(self):
        """Parse a well-formed ADR-018 binary frame."""
        iq = [(3, 4), (0, 10), (5, 12), (7, 0)]
        frame_bytes = build_binary_frame(
            node_id=1, n_antennas=1, n_subcarriers=4,
            freq_mhz=2437, sequence=42, rssi=-50, noise_floor=-90,
            iq_pairs=iq,
        )

        result = self.parser.parse(frame_bytes)

        assert result.num_antennas == 1
        assert result.num_subcarriers == 4
        assert result.amplitude.shape == (1, 4)
        assert result.phase.shape == (1, 4)
        assert result.metadata['node_id'] == 1
        assert result.metadata['sequence'] == 42
        assert result.metadata['rssi_dbm'] == -50
        assert result.metadata['noise_floor_dbm'] == -90
        assert result.metadata['channel_freq_mhz'] == 2437

        # Check amplitude for I=3, Q=4 -> sqrt(9+16) = 5.0
        assert abs(result.amplitude[0, 0] - 5.0) < 0.001
        # I=0, Q=10 -> 10.0
        assert abs(result.amplitude[0, 1] - 10.0) < 0.001

    def test_parse_frame_too_short(self):
        """Reject frames shorter than the 20-byte header."""
        with pytest.raises(CSIParseError, match="too short"):
            self.parser.parse(b'\x00' * 10)

    def test_parse_invalid_magic(self):
        """Reject frames with wrong magic number."""
        bad_frame = build_binary_frame()
        # Corrupt magic
        bad_frame = b'\xFF\xFF\xFF\xFF' + bad_frame[4:]
        with pytest.raises(CSIParseError, match="Invalid magic"):
            self.parser.parse(bad_frame)

    def test_parse_multi_antenna_frame(self):
        """Parse a frame with 3 antennas and 4 subcarriers."""
        n_ant = 3
        n_sc = 4
        iq = [(i + 1, i + 2) for i in range(n_ant * n_sc)]

        frame_bytes = build_binary_frame(
            node_id=5, n_antennas=n_ant, n_subcarriers=n_sc,
            iq_pairs=iq,
        )

        result = self.parser.parse(frame_bytes)

        assert result.num_antennas == 3
        assert result.num_subcarriers == 4
        assert result.amplitude.shape == (3, 4)
        assert result.phase.shape == (3, 4)

    def test_udp_read_with_mock_server(self):
        """Send a frame via UDP and verify CSIExtractor receives it."""
        # Find a free port
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.bind(('127.0.0.1', 0))
        port = sock.getsockname()[1]
        sock.close()

        frame_bytes = build_binary_frame(
            node_id=3, n_antennas=1, n_subcarriers=4,
            freq_mhz=2412, sequence=99,
        )

        config = {
            'hardware_type': 'esp32',
            'parser_format': 'binary',
            'sampling_rate': 100,
            'buffer_size': 2048,
            'timeout': 2,
            'aggregator_host': '127.0.0.1',
            'aggregator_port': port,
        }

        extractor = CSIExtractor(config)

        async def run_test():
            # Connect
            await extractor.connect()

            # Send frame after a short delay from a background thread
            def send():
                time.sleep(0.2)
                s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                s.sendto(frame_bytes, ('127.0.0.1', port))
                s.close()

            sender = threading.Thread(target=send, daemon=True)
            sender.start()

            result = await extractor.extract_csi()
            sender.join(timeout=2)

            assert result.metadata['node_id'] == 3
            assert result.metadata['sequence'] == 99
            assert result.num_subcarriers == 4

            await extractor.disconnect()

        asyncio.run(run_test())

    def test_udp_timeout(self):
        """Verify timeout when no UDP server is sending data."""
        # Find a free port (nothing will send to it)
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.bind(('127.0.0.1', 0))
        port = sock.getsockname()[1]
        sock.close()

        config = {
            'hardware_type': 'esp32',
            'parser_format': 'binary',
            'sampling_rate': 100,
            'buffer_size': 2048,
            'timeout': 0.5,
            'retry_attempts': 1,
            'aggregator_host': '127.0.0.1',
            'aggregator_port': port,
        }

        extractor = CSIExtractor(config)

        async def run_test():
            await extractor.connect()
            with pytest.raises(CSIExtractionError, match="timed out"):
                await extractor.extract_csi()
            await extractor.disconnect()

        asyncio.run(run_test())


# ============================================================================
# ADR-110 §A0.12 — SyncPacket / SyncPacketParser tests (firmware v0.6.9+)
# ============================================================================

SYNC_MAGIC = 0xC511A110
SYNC_SIZE = 32
SYNC_FMT = '<IBBBBQQI4x'


def build_sync_packet(
    node_id: int = 9,
    proto_ver: int = 1,
    is_leader: bool = False,
    is_valid: bool = True,
    smoothed_used: bool = True,
    local_us: int = 28798450,
    epoch_us: int = 27634885,
    sequence: int = 20,
) -> bytes:
    flags = 0
    if is_leader:     flags |= 0x01
    if is_valid:      flags |= 0x02
    if smoothed_used: flags |= 0x04
    return struct.pack(
        SYNC_FMT,
        SYNC_MAGIC,
        node_id, proto_ver, flags, 0,
        local_us, epoch_us, sequence,
    )


class TestSyncPacketParser:
    """ADR-110 §A0.12: 32-byte UDP sync packet (magic 0xC511A110)."""

    def test_follower_typical_packet_roundtrips(self):
        """Match the COM9-witnessed sync-pkt #1 byte-for-byte."""
        raw = build_sync_packet(
            node_id=9, is_leader=False, is_valid=True, smoothed_used=True,
            local_us=28798450, epoch_us=27634885, sequence=20,
        )
        assert len(raw) == SYNC_SIZE
        pkt = SyncPacketParser.parse(raw)
        assert isinstance(pkt, SyncPacket)
        assert pkt.node_id == 9
        assert pkt.proto_ver == 1
        assert pkt.is_leader is False
        assert pkt.is_valid is True
        assert pkt.smoothed_used is True
        assert pkt.local_us == 28798450
        assert pkt.epoch_us == 27634885
        assert pkt.sequence == 20
        # The 1.16-second boot delta from §A0.10 should be recoverable
        assert pkt.local_us - pkt.epoch_us == 1163565

    def test_leader_packet_has_local_close_to_epoch(self):
        """COM12 (leader) had flags=0x03 and epoch ≈ local."""
        raw = build_sync_packet(
            node_id=12, is_leader=True, is_valid=True, smoothed_used=False,
            local_us=28864932, epoch_us=28864939, sequence=20,
        )
        pkt = SyncPacketParser.parse(raw)
        assert pkt.node_id == 12
        assert pkt.is_leader is True
        assert pkt.is_valid is True
        assert pkt.smoothed_used is False
        assert pkt.flags_raw == 0x03
        assert pkt.local_us - pkt.epoch_us == -7  # leader has zero offset

    def test_magic_mismatch_raises(self):
        """A non-sync datagram must not silently decode."""
        raw = bytearray(build_sync_packet())
        raw[0] = 0x01  # corrupt magic low byte
        with pytest.raises(CSIParseError, match="magic mismatch"):
            SyncPacketParser.parse(bytes(raw))

    def test_short_packet_raises(self):
        """Below 32 bytes must error early, not silently truncate."""
        raw = build_sync_packet()[:16]
        with pytest.raises(CSIParseError, match="too short"):
            SyncPacketParser.parse(raw)

    def test_all_flag_combinations(self):
        """Each flag bit decodes independently."""
        for is_leader in (False, True):
            for is_valid in (False, True):
                for smoothed_used in (False, True):
                    raw = build_sync_packet(
                        is_leader=is_leader,
                        is_valid=is_valid,
                        smoothed_used=smoothed_used,
                    )
                    pkt = SyncPacketParser.parse(raw)
                    assert pkt.is_leader == is_leader
                    assert pkt.is_valid == is_valid
                    assert pkt.smoothed_used == smoothed_used

    def test_dispatch_distinguishes_csi_from_sync(self):
        """A host can pick CSI vs sync by leading magic."""
        csi_magic = struct.unpack_from('<I', build_binary_frame(), 0)[0]
        sync_magic = struct.unpack_from('<I', build_sync_packet(), 0)[0]
        assert csi_magic == ESP32BinaryParser.MAGIC
        assert sync_magic == SyncPacketParser.MAGIC
        assert csi_magic != sync_magic

    def test_apply_to_local_recovers_epoch_at_sync_point(self):
        """ADR-110 iter 26 — Python parity with Rust's `apply_to_local`.
        At local_at_frame == sync.local_us, the recovered mesh time must
        equal sync.epoch_us exactly."""
        pkt = SyncPacketParser.parse(build_sync_packet(
            local_us=28_798_450, epoch_us=27_634_885, sequence=20,
        ))
        assert pkt.apply_to_local(pkt.local_us) == pkt.epoch_us
        assert pkt.local_minus_epoch_us() == 1_163_565  # §A0.10's bench number

    def test_apply_to_local_preserves_inter_frame_delta(self):
        """A frame arriving 5 s after the sync packet on the follower's
        local clock must produce a mesh time exactly 5 s after sync.epoch_us."""
        pkt = SyncPacketParser.parse(build_sync_packet(
            local_us=28_798_450, epoch_us=27_634_885, sequence=20,
        ))
        local_at_frame = pkt.local_us + 5_000_000
        assert pkt.apply_to_local(local_at_frame) == pkt.epoch_us + 5_000_000

    def test_mesh_aligned_us_for_sequence_matches_rust(self):
        """Cross-language parity with Rust's
        `end_to_end_sync_decode_then_frame_mesh_recovery` test —
        100 frames after sync.sequence at 20 fps = sync.epoch_us + 5 s."""
        pkt = SyncPacketParser.parse(build_sync_packet(
            local_us=28_798_450, epoch_us=27_634_885, sequence=20,
        ))
        mesh = pkt.mesh_aligned_us_for_sequence(120, 20.0)
        assert mesh == pkt.epoch_us + 5_000_000
        # Both paths (apply_to_local + interpolation) must agree
        local_at = pkt.local_us + 5_000_000
        assert pkt.apply_to_local(local_at) == mesh

    def test_canonical_wire_bytes_match_rust_decoder(self):
        """ADR-110 iter 21 — cross-language wire-format conformance gate.

        These exact bytes also appear pinned in the Rust hardware crate's
        `canonical_wire_bytes_match_python_decoder` test (same field
        values, encoded by Rust's `SyncPacket::to_bytes`). If Python's
        hardcoded hex stops matching what Rust produces from the equivalent
        SyncPacket struct, ONE of the decoders has drifted from the wire.

        Canonical packet: COM9 sync-pkt #1 from §A0.12 live capture.
        """
        canonical = bytes.fromhex(
            "10a111c509010600"   # magic LE + node=9 + ver=1 + flags=0x06 + reserved
            "f26db70100000000"   # local_us = 28_798_450 (LE u64)
            "c5aca50100000000"   # epoch_us = 27_634_885 (LE u64)
            "1400000000000000"   # sequence = 20 (LE u32) + 4 reserved bytes
        )
        assert len(canonical) == SyncPacketParser.SIZE == 32

        pkt = SyncPacketParser.parse(canonical)
        assert pkt.node_id == 9
        assert pkt.proto_ver == 1
        assert pkt.flags_raw == 0x06
        assert pkt.is_leader is False
        assert pkt.is_valid is True
        assert pkt.smoothed_used is True
        assert pkt.local_us == 28_798_450
        assert pkt.epoch_us == 27_634_885
        assert pkt.sequence == 20
        # Recovered offset matches §A0.10's measured 1.16-second boot delta.
        assert pkt.local_us - pkt.epoch_us == 1_163_565
