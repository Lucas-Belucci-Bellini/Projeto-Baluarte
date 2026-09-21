//! `BfldPipeline::current_gate_action()` diagnostic surface. Operators
//! reading the pipeline state for monitoring need a stable, documented way
//! to observe gate transitions without touching the lower-level
//! `CoherenceGate` directly. ADR-121 §2.4 + ADR-118 §2.1.
//!
//! Iter 11 covered the gate state machine in isolation; this iter pins the
//! same transitions through the public `BfldPipeline` facade so the
//! operator-facing diagnostic surface stays correct as the pipeline evolves.

#![cfg(feature = "std")]

use wifi_densepose_bfld::coherence_gate::DEBOUNCE_NS;
use wifi_densepose_bfld::{
    BfldConfig, BfldPipeline, GateAction, IdentityEmbedding, SensingInputs, EMBEDDING_DIM,
};

const NS_PER_SEC: u64 = 1_000_000_000;

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

#[test]
fn fresh_pipeline_starts_in_accept() {
    let p = BfldPipeline::new(BfldConfig::new("seed-obs"));
    assert_eq!(p.current_gate_action(), GateAction::Accept);
}

#[test]
fn low_risk_processing_stays_in_accept() {
    let mut p = BfldPipeline::new(BfldConfig::new("seed-obs"));
    for i in 0..3 {
        let _ = p.process(
            inputs(i * NS_PER_SEC, [0.1, 0.1, 0.1, 0.1]),
            Some(embedding()),
        );
    }
    assert_eq!(p.current_gate_action(), GateAction::Accept);
}

#[test]
fn first_high_risk_input_does_not_immediately_promote_gate() {
    // High-risk score causes the gate to register a PENDING transition but
    // not yet promote `current()` away from Accept — debounce hasn't elapsed.
    let mut p = BfldPipeline::new(BfldConfig::new("seed-obs"));
    let _ = p.process(inputs(0, [1.0, 1.0, 1.0, 0.8]), Some(embedding()));
    assert_eq!(
        p.current_gate_action(),
        GateAction::Accept,
        "single high-risk input must not promote past debounce",
    );
}

#[test]
fn sustained_high_risk_promotes_gate_to_reject_after_debounce() {
    let mut p = BfldPipeline::new(BfldConfig::new("seed-obs"));
    let _ = p.process(inputs(0, [1.0, 1.0, 1.0, 0.8]), Some(embedding()));
    // Second high-risk input at debounce + 1 ns — gate must promote to Reject.
    let _ = p.process(
        inputs(DEBOUNCE_NS + 1, [1.0, 1.0, 1.0, 0.8]),
        Some(embedding()),
    );
    assert_eq!(p.current_gate_action(), GateAction::Reject);
}

#[test]
fn sustained_recalibrate_grade_score_reaches_recalibrate() {
    let mut p = BfldPipeline::new(BfldConfig::new("seed-obs"));
    let _ = p.process(inputs(0, [1.0, 1.0, 1.0, 1.0]), Some(embedding()));
    let _ = p.process(
        inputs(DEBOUNCE_NS + 1, [1.0, 1.0, 1.0, 1.0]),
        Some(embedding()),
    );
    assert_eq!(p.current_gate_action(), GateAction::Recalibrate);
}

#[test]
fn returning_to_low_risk_restores_accept_via_hysteresis() {
    // First push into PredictOnly state via 0.55-grade score (Accept→PredictOnly
    // boundary at 0.5 + hysteresis 0.05 = 0.55).
    let mut p = BfldPipeline::new(BfldConfig::new("seed-obs"));
    // Score = 0.6^4 = 0.13 → still Accept. Need a different factor mix.
    // For PredictOnly we need score in [0.5, 0.7). Using (0.9, 0.9, 0.9, 0.85)
    // → 0.62 → PredictOnly band.
    let _ = p.process(inputs(0, [0.9, 0.9, 0.9, 0.85]), Some(embedding()));
    let _ = p.process(
        inputs(DEBOUNCE_NS + 1, [0.9, 0.9, 0.9, 0.85]),
        Some(embedding()),
    );
    assert_eq!(p.current_gate_action(), GateAction::PredictOnly);

    // Drop to low risk — gate should fall back to Accept after debounce.
    let _ = p.process(
        inputs(2 * DEBOUNCE_NS, [0.1, 0.1, 0.1, 0.1]),
        Some(embedding()),
    );
    let _ = p.process(
        inputs(3 * DEBOUNCE_NS + 1, [0.1, 0.1, 0.1, 0.1]),
        Some(embedding()),
    );
    assert_eq!(p.current_gate_action(), GateAction::Accept);
}

#[test]
fn current_gate_action_is_read_only_does_not_advance_state() {
    // Operators should be able to poll current_gate_action() as often as
    // they like without affecting pipeline state. Multiple reads between
    // processes must return the same value AND the next process must see
    // the same gate state.
    let mut p = BfldPipeline::new(BfldConfig::new("seed-obs"));
    let _ = p.process(inputs(0, [1.0, 1.0, 1.0, 0.8]), Some(embedding()));
    let a = p.current_gate_action();
    let b = p.current_gate_action();
    let c = p.current_gate_action();
    assert_eq!(a, b);
    assert_eq!(b, c);
    assert_eq!(a, GateAction::Accept, "still pending at t=0, not promoted");
}
