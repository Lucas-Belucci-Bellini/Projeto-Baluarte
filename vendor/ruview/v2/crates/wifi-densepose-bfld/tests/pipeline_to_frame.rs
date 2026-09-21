//! Acceptance tests for `BfldPipeline::process_to_frame`. ADR-118 §2.1 wire-bytes path.

#![cfg(feature = "std")]

use wifi_densepose_bfld::coherence_gate::DEBOUNCE_NS;
use wifi_densepose_bfld::{
    BfldConfig, BfldFrame, BfldFrameHeader, BfldPayload, BfldPipeline, IdentityEmbedding,
    PrivacyClass, SensingInputs, EMBEDDING_DIM,
};

fn inputs(timestamp_ns: u64, risk: [f32; 4]) -> SensingInputs {
    let [sep, stab, consist, risk_conf] = risk;
    SensingInputs {
        timestamp_ns,
        presence: true,
        motion: 0.4,
        person_count: 1,
        sensing_confidence: 0.9,
        sep,
        stab,
        consist,
        risk_conf,
        rf_signature_hash: None,
    }
}

fn embedding() -> IdentityEmbedding {
    IdentityEmbedding::from_raw([0.05; EMBEDDING_DIM])
}

fn header_template() -> BfldFrameHeader {
    let mut h = BfldFrameHeader::empty();
    h.ap_hash = [0xA1; 16];
    h.sta_hash = [0xA2; 16];
    h.session_id = [0xA3; 16];
    h.channel = 36;
    h.bandwidth_mhz = 80;
    h.n_subcarriers = 234;
    h.n_tx = 2;
    h.n_rx = 2;
    h
}

fn typed_payload() -> BfldPayload {
    BfldPayload {
        compressed_angle_matrix: vec![0x11; 32],
        amplitude_proxy: vec![0x22; 16],
        phase_proxy: vec![0x33; 16],
        snr_vector: vec![0x44; 8],
        csi_delta: None,
        vendor_extension: vec![],
    }
}

#[test]
fn process_to_frame_emits_frame_under_low_risk() {
    let mut p = BfldPipeline::new(BfldConfig::new("seed-01"));
    let frame = p
        .process_to_frame(
            inputs(1_700_000_000_000_000_000, [0.2, 0.2, 0.2, 0.2]),
            header_template(),
            typed_payload(),
            Some(embedding()),
        )
        .expect("low-risk frame must be emitted");
    assert_eq!({ frame.header.timestamp_ns }, 1_700_000_000_000_000_000);
    assert_eq!({ frame.header.privacy_class }, PrivacyClass::Anonymous.as_u8());
}

#[test]
fn process_to_frame_returns_none_under_sustained_high_risk() {
    let mut p = BfldPipeline::new(BfldConfig::new("seed-01"));
    // Push gate into Reject via two consecutive high-risk evaluations.
    let _ = p.process_to_frame(
        inputs(0, [1.0, 1.0, 1.0, 0.8]),
        header_template(),
        typed_payload(),
        Some(embedding()),
    );
    let after = p.process_to_frame(
        inputs(DEBOUNCE_NS, [1.0, 1.0, 1.0, 0.8]),
        header_template(),
        typed_payload(),
        Some(embedding()),
    );
    assert!(after.is_none(), "Reject gate must drop the frame");
}

#[test]
fn process_to_frame_round_trips_through_bytes() {
    let mut p = BfldPipeline::new(BfldConfig::new("seed-01"));
    let frame = p
        .process_to_frame(
            inputs(1_700_000_000_000_000_000, [0.1, 0.1, 0.1, 0.1]),
            header_template(),
            typed_payload(),
            Some(embedding()),
        )
        .unwrap();
    let bytes = frame.to_bytes();
    let parsed = BfldFrame::from_bytes(&bytes).expect("frame must round-trip");
    let parsed_payload = parsed.parse_payload().expect("payload must round-trip");
    assert_eq!(parsed_payload, typed_payload());
}

#[test]
fn process_to_frame_overrides_class_in_privacy_mode() {
    let mut p = BfldPipeline::new(
        BfldConfig::new("seed-01").with_privacy_class(PrivacyClass::Anonymous),
    );
    p.enable_privacy_mode();
    let frame = p
        .process_to_frame(
            inputs(0, [0.1, 0.1, 0.1, 0.1]),
            header_template(),
            typed_payload(),
            Some(embedding()),
        )
        .unwrap();
    assert_eq!(
        { frame.header.privacy_class },
        PrivacyClass::Restricted.as_u8(),
        "privacy_mode must override into the frame header byte too",
    );
}

#[test]
fn process_to_frame_preserves_header_template_identity_fields() {
    let mut p = BfldPipeline::new(BfldConfig::new("seed-01"));
    let frame = p
        .process_to_frame(
            inputs(0, [0.1, 0.1, 0.1, 0.1]),
            header_template(),
            typed_payload(),
            Some(embedding()),
        )
        .unwrap();
    assert_eq!(frame.header.ap_hash, [0xA1; 16]);
    assert_eq!(frame.header.sta_hash, [0xA2; 16]);
    assert_eq!(frame.header.session_id, [0xA3; 16]);
    assert_eq!({ frame.header.channel }, 36);
}

#[test]
fn process_to_frame_uses_input_timestamp_not_template_timestamp() {
    let mut p = BfldPipeline::new(BfldConfig::new("seed-01"));
    let mut tmpl = header_template();
    tmpl.timestamp_ns = 12345; // sentinel that must be overridden
    let frame = p
        .process_to_frame(
            inputs(9_999_999_999_999_999, [0.1, 0.1, 0.1, 0.1]),
            tmpl,
            typed_payload(),
            Some(embedding()),
        )
        .unwrap();
    assert_eq!({ frame.header.timestamp_ns }, 9_999_999_999_999_999);
}
