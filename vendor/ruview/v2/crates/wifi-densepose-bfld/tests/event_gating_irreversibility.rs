//! `BfldEvent::apply_privacy_gating` one-way property. ADR-120 §2.4 "There is
//! no `promote` operation — once a field is stripped, it cannot be restored."
//!
//! `apply_privacy_gating` is the soft in-place re-classifier used by
//! [`BfldPipeline::process`] when `enable_privacy_mode()` is engaged. It
//! checks the *current* `privacy_class` byte and, if Restricted or higher,
//! nulls `identity_risk_score` and `rf_signature_hash`. Critically: it does
//! NOT carry "this event was originally class 2 with score 0.34"; once
//! stripped, a subsequent class drop back to Anonymous + another call to
//! `apply_privacy_gating` leaves the fields `None`.
//!
//! This is a structural defense-in-depth property: an attacker who flips
//! `privacy_class` back to Anonymous cannot resurrect the identity fields
//! through the soft API alone — they'd have to fabricate them via
//! `BfldEvent::with_privacy_gating` (or one of the documented constructors),
//! which is a much harder ask than a single byte mutation.

#![cfg(feature = "std")]

use wifi_densepose_bfld::{BfldEvent, PrivacyClass};

fn class_2_event_with_identity_fields() -> BfldEvent {
    BfldEvent::with_privacy_gating(
        "seed-01".into(),
        1_700_000_000_000_000_000,
        true,
        0.5,
        1,
        0.9,
        Some("kitchen".into()),
        PrivacyClass::Anonymous,
        Some(0.34),
        Some([0xAB; 32]),
    )
}

#[test]
fn apply_at_anonymous_preserves_identity_fields() {
    let mut e = class_2_event_with_identity_fields();
    assert!(e.identity_risk_score.is_some());
    assert!(e.rf_signature_hash.is_some());
    e.apply_privacy_gating();
    // Class is still Anonymous → no strip.
    assert!(e.identity_risk_score.is_some());
    assert!(e.rf_signature_hash.is_some());
}

#[test]
fn manual_class_flip_to_restricted_then_apply_strips_both_fields() {
    let mut e = class_2_event_with_identity_fields();
    e.privacy_class = PrivacyClass::Restricted;
    e.apply_privacy_gating();
    assert!(e.identity_risk_score.is_none());
    assert!(e.rf_signature_hash.is_none());
}

#[test]
fn one_way_strip_survives_class_flip_back_to_anonymous() {
    // The headline test. Sequence:
    //   1. Anonymous event with identity fields
    //   2. Mutate to Restricted → apply_privacy_gating → fields None
    //   3. Mutate back to Anonymous → apply_privacy_gating
    //   4. Fields STILL None (apply doesn't resurrect)
    let mut e = class_2_event_with_identity_fields();
    e.privacy_class = PrivacyClass::Restricted;
    e.apply_privacy_gating();
    assert!(e.identity_risk_score.is_none());

    e.privacy_class = PrivacyClass::Anonymous;
    e.apply_privacy_gating();
    assert!(
        e.identity_risk_score.is_none(),
        "apply_privacy_gating must NOT resurrect identity_risk_score on class downgrade",
    );
    assert!(
        e.rf_signature_hash.is_none(),
        "apply_privacy_gating must NOT resurrect rf_signature_hash on class downgrade",
    );
}

#[test]
fn manual_field_restoration_after_strip_only_works_via_explicit_assignment() {
    // Operators who really want a class-2 event after a strip must rebuild
    // via with_privacy_gating (the documented path). Direct field assignment
    // also works — but THAT mutation is visible in code review as an
    // explicit "I am circumventing the soft gate" action, not a subtle
    // class-byte flip.
    let mut e = class_2_event_with_identity_fields();
    e.privacy_class = PrivacyClass::Restricted;
    e.apply_privacy_gating();
    assert!(e.identity_risk_score.is_none());

    // Explicit restoration:
    e.privacy_class = PrivacyClass::Anonymous;
    e.identity_risk_score = Some(0.42);
    e.rf_signature_hash = Some([0xCD; 32]);
    e.apply_privacy_gating();
    // apply at class Anonymous does NOT strip the just-restored values.
    assert_eq!(e.identity_risk_score, Some(0.42));
    assert_eq!(e.rf_signature_hash, Some([0xCD; 32]));
}

#[test]
fn apply_at_already_restricted_with_already_none_fields_is_a_noop() {
    let mut e = class_2_event_with_identity_fields();
    e.privacy_class = PrivacyClass::Restricted;
    e.apply_privacy_gating(); // first strip
    e.apply_privacy_gating(); // second call — must remain idempotent
    assert!(e.identity_risk_score.is_none());
    assert!(e.rf_signature_hash.is_none());
}

#[test]
fn one_way_property_holds_through_multiple_class_round_trips() {
    let mut e = class_2_event_with_identity_fields();
    for _ in 0..5 {
        e.privacy_class = PrivacyClass::Restricted;
        e.apply_privacy_gating();
        e.privacy_class = PrivacyClass::Anonymous;
        e.apply_privacy_gating();
    }
    assert!(
        e.identity_risk_score.is_none(),
        "10 round-trips must not resurrect identity_risk_score",
    );
    assert!(
        e.rf_signature_hash.is_none(),
        "10 round-trips must not resurrect rf_signature_hash",
    );
}

#[test]
fn rebuilding_via_with_privacy_gating_is_the_documented_restoration_path() {
    // After a strip, building a fresh event via with_privacy_gating is the
    // sanctioned way to publish identity fields again. This test pins the
    // contract for operators reading the docs: "to restore identity fields,
    // build a fresh BfldEvent."
    let mut stripped = class_2_event_with_identity_fields();
    stripped.privacy_class = PrivacyClass::Restricted;
    stripped.apply_privacy_gating();
    assert!(stripped.identity_risk_score.is_none());

    let restored = BfldEvent::with_privacy_gating(
        stripped.node_id.clone(),
        stripped.timestamp_ns,
        stripped.presence,
        stripped.motion,
        stripped.person_count,
        stripped.confidence,
        stripped.zone_id.clone(),
        PrivacyClass::Anonymous,
        Some(0.55),
        Some([0xEF; 32]),
    );
    assert_eq!(restored.identity_risk_score, Some(0.55));
    assert_eq!(restored.rf_signature_hash, Some([0xEF; 32]));
}
