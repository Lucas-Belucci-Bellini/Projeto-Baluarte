//! Acceptance tests for ADR-121 §2.2–§2.4: risk score formula + gate action.

use wifi_densepose_bfld::identity_risk::{
    score, GateAction, PREDICT_ONLY_THRESHOLD, RECALIBRATE_THRESHOLD, REJECT_THRESHOLD,
};

// --- score formula ---

#[test]
fn all_ones_yields_one() {
    assert!((score(1.0, 1.0, 1.0, 1.0) - 1.0).abs() < 1e-6);
}

#[test]
fn any_zero_factor_collapses_score_to_zero() {
    assert_eq!(score(0.0, 1.0, 1.0, 1.0), 0.0);
    assert_eq!(score(1.0, 0.0, 1.0, 1.0), 0.0);
    assert_eq!(score(1.0, 1.0, 0.0, 1.0), 0.0);
    assert_eq!(score(1.0, 1.0, 1.0, 0.0), 0.0);
}

#[test]
fn score_is_monotonic_non_decreasing_in_single_factor() {
    let baseline = score(0.5, 0.5, 0.5, 0.5);
    let higher = score(0.9, 0.5, 0.5, 0.5);
    assert!(higher >= baseline);
}

#[test]
fn out_of_range_inputs_are_clamped_to_unit_interval() {
    // Negative input → 0; result still 0.
    assert_eq!(score(-0.5, 1.0, 1.0, 1.0), 0.0);
    // Above-1 input → 1; result equals the product of the others.
    assert!((score(1.5, 1.0, 1.0, 1.0) - 1.0).abs() < 1e-6);
}

#[test]
fn nan_inputs_treated_as_zero() {
    assert_eq!(score(f32::NAN, 1.0, 1.0, 1.0), 0.0);
    assert_eq!(score(1.0, f32::NAN, f32::NAN, 1.0), 0.0);
}

#[test]
fn known_score_matches_hand_calculation() {
    let s = score(0.8, 0.9, 0.85, 0.95);
    let expected = 0.8 * 0.9 * 0.85 * 0.95;
    assert!((s - expected).abs() < 1e-6, "got {s}, expected {expected}");
}

// --- GateAction mapping ---

#[test]
fn from_score_classifies_each_band() {
    assert_eq!(GateAction::from_score(0.0), GateAction::Accept);
    assert_eq!(GateAction::from_score(0.49), GateAction::Accept);
    assert_eq!(GateAction::from_score(0.5), GateAction::PredictOnly);
    assert_eq!(GateAction::from_score(0.69), GateAction::PredictOnly);
    assert_eq!(GateAction::from_score(0.7), GateAction::Reject);
    assert_eq!(GateAction::from_score(0.89), GateAction::Reject);
    assert_eq!(GateAction::from_score(0.9), GateAction::Recalibrate);
    assert_eq!(GateAction::from_score(1.0), GateAction::Recalibrate);
}

#[test]
fn threshold_constants_match_documented_values() {
    assert!((PREDICT_ONLY_THRESHOLD - 0.5).abs() < 1e-6);
    assert!((REJECT_THRESHOLD - 0.7).abs() < 1e-6);
    assert!((RECALIBRATE_THRESHOLD - 0.9).abs() < 1e-6);
}

#[test]
fn nan_score_maps_to_accept_conservatively() {
    assert_eq!(GateAction::from_score(f32::NAN), GateAction::Accept);
}

#[test]
fn allows_publish_partitions_actions_correctly() {
    assert!(GateAction::Accept.allows_publish());
    assert!(GateAction::PredictOnly.allows_publish());
    assert!(!GateAction::Reject.allows_publish());
    assert!(!GateAction::Recalibrate.allows_publish());
}

#[test]
fn drops_event_inverts_allows_publish() {
    for a in [
        GateAction::Accept,
        GateAction::PredictOnly,
        GateAction::Reject,
        GateAction::Recalibrate,
    ] {
        assert_ne!(a.allows_publish(), a.drops_event());
    }
}

#[test]
fn requires_recalibrate_is_unique_to_recalibrate() {
    assert!(!GateAction::Accept.requires_recalibrate());
    assert!(!GateAction::PredictOnly.requires_recalibrate());
    assert!(!GateAction::Reject.requires_recalibrate());
    assert!(GateAction::Recalibrate.requires_recalibrate());
}
