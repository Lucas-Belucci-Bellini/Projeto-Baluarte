//! Acceptance tests for ADR-119 §2.2 payload section layout.

#![cfg(feature = "std")]

use wifi_densepose_bfld::payload::SECTION_PREFIX_LEN;
use wifi_densepose_bfld::{BfldError, BfldPayload};

fn full_payload() -> BfldPayload {
    BfldPayload {
        compressed_angle_matrix: vec![0x11; 64],
        amplitude_proxy: vec![0x22; 32],
        phase_proxy: vec![0x33; 32],
        snr_vector: vec![0x44; 16],
        csi_delta: Some(vec![0x55; 48]),
        vendor_extension: vec![0xAA, 0xBB, 0xCC],
    }
}

#[test]
fn payload_roundtrip_with_csi_delta() {
    let p = full_payload();
    let bytes = p.to_bytes(true);
    let parsed = BfldPayload::from_bytes(&bytes, true).expect("parse must succeed");
    assert_eq!(parsed, p);
}

#[test]
fn payload_roundtrip_without_csi_delta() {
    let mut p = full_payload();
    p.csi_delta = None;
    let bytes = p.to_bytes(false);
    let parsed = BfldPayload::from_bytes(&bytes, false).expect("parse must succeed");
    assert_eq!(parsed, p);
}

#[test]
fn wire_len_matches_to_bytes_length() {
    let p = full_payload();
    assert_eq!(p.wire_len(true), p.to_bytes(true).len());
    assert_eq!(p.wire_len(false), p.to_bytes(false).len());
}

#[test]
fn empty_payload_has_five_zero_length_sections() {
    let p = BfldPayload::default();
    let bytes = p.to_bytes(false);
    // 5 mandatory sections (compressed_angle_matrix, amplitude_proxy, phase_proxy,
    // snr_vector, vendor_extension), each just the 4-byte length prefix.
    assert_eq!(bytes.len(), SECTION_PREFIX_LEN * 5);
    assert!(bytes.iter().all(|&b| b == 0));
    let parsed = BfldPayload::from_bytes(&bytes, false).expect("empty parse must succeed");
    assert_eq!(parsed, p);
}

#[test]
fn parser_rejects_buffer_shorter_than_first_length_prefix() {
    let too_short = [0u8; 3];
    match BfldPayload::from_bytes(&too_short, false) {
        Err(BfldError::MalformedSection { offset, .. }) => assert_eq!(offset, 0),
        other => panic!("expected MalformedSection at offset 0, got {other:?}"),
    }
}

#[test]
fn parser_rejects_section_body_running_past_buffer_end() {
    // Section claims 1000 bytes, buffer only has 4 + 10.
    let mut bytes = Vec::new();
    bytes.extend_from_slice(&1000u32.to_le_bytes());
    bytes.extend_from_slice(&[0xCC; 10]);
    match BfldPayload::from_bytes(&bytes, false) {
        Err(BfldError::MalformedSection { offset, reason }) => {
            assert_eq!(offset, 0);
            assert!(reason.contains("body"));
        }
        other => panic!("expected MalformedSection (body), got {other:?}"),
    }
}

#[test]
fn parser_rejects_trailing_bytes_after_vendor_extension() {
    let mut bytes = BfldPayload::default().to_bytes(false);
    bytes.push(0xFF); // unexpected trailing byte
    match BfldPayload::from_bytes(&bytes, false) {
        Err(BfldError::MalformedSection { reason, .. }) => {
            assert!(reason.contains("trailing"));
        }
        other => panic!("expected trailing-bytes MalformedSection, got {other:?}"),
    }
}

#[test]
fn csi_delta_flag_mismatch_with_payload_is_detectable_via_trailing_bytes() {
    // Serialize WITH csi_delta but parse WITHOUT — the parser will hit the
    // csi_delta section's bytes after reading vendor_extension, triggering the
    // trailing-bytes guard. (Real flag/payload consistency is the caller's job;
    // this test just confirms the parser doesn't silently accept misalignment.)
    let p = full_payload();
    let bytes = p.to_bytes(true);
    match BfldPayload::from_bytes(&bytes, false) {
        Err(BfldError::MalformedSection { reason, .. }) => {
            assert!(reason.contains("trailing"));
        }
        other => panic!("expected MalformedSection from flag/payload skew, got {other:?}"),
    }
}
