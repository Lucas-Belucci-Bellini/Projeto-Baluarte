//! End-to-end wire integration: `BfldPayload` ↔ `BfldFrame` (ADR-119 §2.2).
//!
//! Validates that the frame CRC32 covers the section-prefixed payload bytes
//! and that `from_payload` ↔ `parse_payload` are exact inverses.

#![cfg(feature = "std")]

use wifi_densepose_bfld::frame::flags;
use wifi_densepose_bfld::{BfldError, BfldFrame, BfldFrameHeader, BfldPayload, BFLD_HEADER_SIZE};

fn typed_payload(with_csi: bool) -> BfldPayload {
    BfldPayload {
        compressed_angle_matrix: vec![0x10; 64],
        amplitude_proxy: vec![0x20; 32],
        phase_proxy: vec![0x30; 32],
        snr_vector: vec![0x40; 16],
        csi_delta: if with_csi { Some(vec![0x50; 48]) } else { None },
        vendor_extension: vec![0xAA, 0xBB],
    }
}

#[test]
fn from_payload_then_parse_payload_is_identity() {
    let p_in = typed_payload(true);
    let frame = BfldFrame::from_payload(BfldFrameHeader::empty(), &p_in);
    let p_out = frame.parse_payload().expect("parse_payload must succeed");
    assert_eq!(p_out, p_in);
}

#[test]
fn from_payload_autosets_has_csi_delta_flag() {
    let with_csi = BfldFrame::from_payload(BfldFrameHeader::empty(), &typed_payload(true));
    assert!(({ with_csi.header.flags } & flags::HAS_CSI_DELTA) != 0);

    let without_csi = BfldFrame::from_payload(BfldFrameHeader::empty(), &typed_payload(false));
    assert!(({ without_csi.header.flags } & flags::HAS_CSI_DELTA) == 0);
}

#[test]
fn from_payload_clears_has_csi_delta_flag_when_csi_absent() {
    let mut header = BfldFrameHeader::empty();
    header.flags = flags::HAS_CSI_DELTA | flags::PRIVACY_MODE; // CSI bit forced on
    let frame = BfldFrame::from_payload(header, &typed_payload(false));
    // CSI bit cleared because payload had None, PRIVACY_MODE bit preserved.
    assert_eq!({ frame.header.flags } & flags::HAS_CSI_DELTA, 0);
    assert_ne!({ frame.header.flags } & flags::PRIVACY_MODE, 0);
}

#[test]
fn frame_crc_covers_section_prefixed_bytes() {
    // Flip a byte inside the second section's BODY — section length prefixes
    // are still intact, magic/version/header are intact, but the CRC must fail.
    let frame = BfldFrame::from_payload(BfldFrameHeader::empty(), &typed_payload(true));
    let mut bytes = frame.to_bytes();
    // First section: prefix at [86..90] (length 64), body at [90..154].
    // Second section: prefix at [154..158] (length 32), body at [158..190].
    bytes[170] ^= 0xFF; // inside second section body
    match BfldFrame::from_bytes(&bytes) {
        Err(BfldError::Crc { expected, actual }) => assert_ne!(expected, actual),
        other => panic!("expected Crc error, got {other:?}"),
    }
}

#[test]
fn frame_crc_covers_section_length_prefixes() {
    let frame = BfldFrame::from_payload(BfldFrameHeader::empty(), &typed_payload(true));
    let mut bytes = frame.to_bytes();
    // Mutate the first section's length prefix high byte from 0 to 0xFF; the
    // length is now nonsense (would also break the section parser), but at
    // CRC-check time, the CRC mismatch must fire FIRST before section parsing.
    bytes[BFLD_HEADER_SIZE + 3] = 0xFF;
    match BfldFrame::from_bytes(&bytes) {
        Err(BfldError::Crc { .. }) => {} // expected
        other => panic!("expected Crc error from prefix tamper, got {other:?}"),
    }
}

#[test]
fn empty_typed_payload_roundtrips() {
    let p_in = BfldPayload::default();
    let frame = BfldFrame::from_payload(BfldFrameHeader::empty(), &p_in);
    let bytes = frame.to_bytes();
    let parsed = BfldFrame::from_bytes(&bytes).expect("frame parse");
    let p_out = parsed.parse_payload().expect("payload parse");
    assert_eq!(p_out, p_in);
}

#[test]
fn end_to_end_wire_roundtrip_via_bytes() {
    let p_in = typed_payload(true);
    let bytes = BfldFrame::from_payload(BfldFrameHeader::empty(), &p_in).to_bytes();
    let frame = BfldFrame::from_bytes(&bytes).expect("frame parse");
    let p_out = frame.parse_payload().expect("payload parse");
    assert_eq!(p_out, p_in);
}
