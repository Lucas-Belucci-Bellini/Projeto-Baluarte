//! Acceptance tests for ADR-120 §2.2 sink marker enforcement (invariant I1).

use wifi_densepose_bfld::sink::{LocalKind, MatterKind, NetworkKind};
use wifi_densepose_bfld::{check_class, BfldError, PrivacyClass};

// --- PrivacyClass::try_from ----------------------------------------------

#[test]
fn privacy_class_try_from_accepts_all_four_valid_bytes() {
    assert_eq!(PrivacyClass::try_from(0).unwrap(), PrivacyClass::Raw);
    assert_eq!(PrivacyClass::try_from(1).unwrap(), PrivacyClass::Derived);
    assert_eq!(PrivacyClass::try_from(2).unwrap(), PrivacyClass::Anonymous);
    assert_eq!(PrivacyClass::try_from(3).unwrap(), PrivacyClass::Restricted);
}

#[test]
fn privacy_class_try_from_rejects_out_of_range_bytes() {
    for b in [4u8, 5, 7, 17, 42, 100, 200, 255] {
        match PrivacyClass::try_from(b) {
            Err(BfldError::InvalidPrivacyClass(got)) => assert_eq!(got, b),
            other => panic!("expected InvalidPrivacyClass({b}), got {other:?}"),
        }
    }
}

#[test]
fn privacy_class_byte_roundtrip_is_stable() {
    for c in [
        PrivacyClass::Raw,
        PrivacyClass::Derived,
        PrivacyClass::Anonymous,
        PrivacyClass::Restricted,
    ] {
        assert_eq!(PrivacyClass::try_from(c.as_u8()).unwrap(), c);
    }
}

// --- LocalSink accepts everything ---------------------------------------

#[test]
fn local_sink_accepts_all_classes() {
    for c in [
        PrivacyClass::Raw,
        PrivacyClass::Derived,
        PrivacyClass::Anonymous,
        PrivacyClass::Restricted,
    ] {
        check_class::<LocalKind>(c).expect("LocalSink must accept every class");
    }
}

// --- NetworkSink rejects Raw, accepts the rest --------------------------

#[test]
fn network_sink_rejects_raw_frames() {
    let err = check_class::<NetworkKind>(PrivacyClass::Raw).unwrap_err();
    match err {
        BfldError::PrivacyViolation { reason } => assert_eq!(reason, "NetworkKind"),
        other => panic!("expected PrivacyViolation, got {other:?}"),
    }
}

#[test]
fn network_sink_accepts_derived_anonymous_restricted() {
    for c in [
        PrivacyClass::Derived,
        PrivacyClass::Anonymous,
        PrivacyClass::Restricted,
    ] {
        check_class::<NetworkKind>(c)
            .expect("NetworkSink must accept Derived/Anonymous/Restricted");
    }
}

// --- MatterSink rejects Raw and Derived ---------------------------------

#[test]
fn matter_sink_rejects_raw_and_derived() {
    for c in [PrivacyClass::Raw, PrivacyClass::Derived] {
        let err = check_class::<MatterKind>(c).unwrap_err();
        match err {
            BfldError::PrivacyViolation { reason } => assert_eq!(reason, "MatterKind"),
            other => panic!("expected PrivacyViolation for {c:?}, got {other:?}"),
        }
    }
}

#[test]
fn matter_sink_accepts_anonymous_and_restricted() {
    for c in [PrivacyClass::Anonymous, PrivacyClass::Restricted] {
        check_class::<MatterKind>(c).expect("MatterSink must accept anonymous + restricted");
    }
}
