//! Acceptance tests for `BfldFrame` round-trip (ADR-119 AC4/AC5/AC6).
//!
//! Requires the `std` feature; under `--no-default-features` the entire file
//! is compiled out (BfldFrame depends on `Vec<u8>`).

#![cfg(feature = "std")]

use wifi_densepose_bfld::frame::{crc32_of_payload, flags};
use wifi_densepose_bfld::{BfldError, BfldFrame, BfldFrameHeader, BFLD_HEADER_SIZE};

fn sample_header() -> BfldFrameHeader {
    let mut h = BfldFrameHeader::empty();
    h.flags = flags::HAS_CSI_DELTA;
    h.timestamp_ns = 1_700_000_000_000_000_000;
    h.channel = 36;
    h.bandwidth_mhz = 80;
    h.n_subcarriers = 234;
    h.n_tx = 2;
    h.n_rx = 2;
    h.quantization = 1;
    h.privacy_class = 2;
    h
}

fn sample_payload() -> Vec<u8> {
    // Pseudo-CBFR section: small but non-trivial.
    (0u8..200).cycle().take(512).collect()
}

#[test]
fn frame_roundtrip_preserves_header_and_payload() {
    let frame = BfldFrame::new(sample_header(), sample_payload());
    let bytes = frame.to_bytes();
    assert_eq!(bytes.len(), BFLD_HEADER_SIZE + 512);

    let parsed = BfldFrame::from_bytes(&bytes).expect("parse must succeed");
    assert_eq!(parsed.payload, sample_payload());
    assert_eq!({ parsed.header.payload_len }, 512);
    assert_eq!({ parsed.header.channel }, 36);
    assert_eq!({ parsed.header.privacy_class }, 2);
}

#[test]
fn frame_new_syncs_payload_len_and_crc() {
    let payload = sample_payload();
    let frame = BfldFrame::new(BfldFrameHeader::empty(), payload.clone());
    assert_eq!({ frame.header.payload_len }, payload.len() as u32);
    assert_eq!({ frame.header.payload_crc32 }, crc32_of_payload(&payload));
}

#[test]
fn frame_serialization_is_deterministic() {
    let frame = BfldFrame::new(sample_header(), sample_payload());
    let a = frame.to_bytes();
    let b = frame.to_bytes();
    assert_eq!(a, b);
}

#[test]
fn frame_rejects_payload_crc_mismatch() {
    let frame = BfldFrame::new(sample_header(), sample_payload());
    let mut bytes = frame.to_bytes();
    // Flip a payload byte; CRC over payload must now disagree with the header.
    bytes[BFLD_HEADER_SIZE + 7] ^= 0xFF;
    match BfldFrame::from_bytes(&bytes) {
        Err(BfldError::Crc { expected, actual }) => assert_ne!(expected, actual),
        other => panic!("expected Crc error, got {other:?}"),
    }
}

#[test]
fn frame_rejects_truncated_buffer_smaller_than_header() {
    let too_short = vec![0u8; 50];
    match BfldFrame::from_bytes(&too_short) {
        Err(BfldError::TruncatedFrame { got, need }) => {
            assert_eq!(got, 50);
            assert_eq!(need, BFLD_HEADER_SIZE);
        }
        other => panic!("expected TruncatedFrame, got {other:?}"),
    }
}

#[test]
fn frame_rejects_truncated_buffer_smaller_than_payload() {
    let frame = BfldFrame::new(sample_header(), sample_payload());
    let bytes = frame.to_bytes();
    let truncated = &bytes[..bytes.len() - 100];
    match BfldFrame::from_bytes(truncated) {
        Err(BfldError::TruncatedFrame { got, need }) => {
            assert_eq!(got, BFLD_HEADER_SIZE + 412);
            assert_eq!(need, BFLD_HEADER_SIZE + 512);
        }
        other => panic!("expected TruncatedFrame, got {other:?}"),
    }
}

#[test]
fn empty_payload_is_valid() {
    let frame = BfldFrame::new(sample_header(), Vec::new());
    let bytes = frame.to_bytes();
    let parsed = BfldFrame::from_bytes(&bytes).expect("empty payload must roundtrip");
    assert_eq!(parsed.payload.len(), 0);
    assert_eq!({ parsed.header.payload_len }, 0);
    // CRC of empty buffer is the CRC-32/ISO-HDLC identity 0x00000000.
    assert_eq!({ parsed.header.payload_crc32 }, 0);
}
