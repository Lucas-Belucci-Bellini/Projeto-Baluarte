//! Acceptance tests for `publish_discovery` bootstrap helper. ADR-122 §2.1.

#![cfg(feature = "std")]

use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

use wifi_densepose_bfld::{
    publish_discovery, BfldConfig, BfldPipeline, BfldPipelineHandle, CapturePublisher,
    IdentityEmbedding, PipelineInput, PrivacyClass, Publish, SensingInputs, TopicMessage,
    EMBEDDING_DIM,
};

#[test]
fn publish_discovery_returns_six_for_anonymous_class() {
    let mut p = CapturePublisher::default();
    let count = publish_discovery(&mut p, "seed-01", PrivacyClass::Anonymous).unwrap();
    assert_eq!(count, 6);
    assert_eq!(p.published.len(), 6);
}

#[test]
fn publish_discovery_returns_five_for_restricted_class() {
    let mut p = CapturePublisher::default();
    let count = publish_discovery(&mut p, "seed-01", PrivacyClass::Restricted).unwrap();
    assert_eq!(count, 5);
    assert!(
        !p.published
            .iter()
            .any(|m| m.topic.contains("identity_risk")),
        "Restricted must not publish identity_risk discovery",
    );
}

#[test]
fn publish_discovery_returns_zero_for_raw_and_derived() {
    for class in [PrivacyClass::Raw, PrivacyClass::Derived] {
        let mut p = CapturePublisher::default();
        let count = publish_discovery(&mut p, "seed-01", class).unwrap();
        assert_eq!(count, 0);
        assert!(p.published.is_empty());
    }
}

#[test]
fn publish_discovery_topics_are_homeassistant_config_format() {
    let mut p = CapturePublisher::default();
    publish_discovery(&mut p, "seed-99", PrivacyClass::Anonymous).unwrap();
    for msg in &p.published {
        assert!(msg.topic.starts_with("homeassistant/"));
        assert!(msg.topic.ends_with("/config"));
        assert!(msg.topic.contains("seed-99_bfld_"));
    }
}

// --- error propagation --------------------------------------------------

struct FailingPub {
    sent: usize,
    fails_after: usize,
}
impl Publish for FailingPub {
    type Error = &'static str;
    fn publish(&mut self, _msg: &TopicMessage) -> Result<(), Self::Error> {
        if self.sent >= self.fails_after {
            return Err("broker offline");
        }
        self.sent += 1;
        Ok(())
    }
}

#[test]
fn publish_discovery_short_circuits_on_publisher_error() {
    let mut p = FailingPub {
        sent: 0,
        fails_after: 3,
    };
    let result = publish_discovery(&mut p, "seed-01", PrivacyClass::Anonymous);
    assert_eq!(result, Err("broker offline"));
    assert_eq!(p.sent, 3, "exactly 3 messages should land before the error");
}

// --- bootstrap pattern integration with BfldPipelineHandle --------------

fn sample_input() -> PipelineInput {
    PipelineInput {
        inputs: SensingInputs {
            timestamp_ns: 0,
            presence: true,
            motion: 0.4,
            person_count: 1,
            sensing_confidence: 0.9,
            sep: 0.2,
            stab: 0.2,
            consist: 0.2,
            risk_conf: 0.2,
            rf_signature_hash: None,
        },
        embedding: Some(IdentityEmbedding::from_raw([0.05; EMBEDDING_DIM])),
    }
}

#[test]
fn bootstrap_pattern_publishes_discovery_then_state_through_shared_publisher() {
    // Single Arc<Mutex<CapturePublisher>> shared between discovery bootstrap
    // and the iter-25 worker handle. After both phases, the publisher's
    // captured log holds discovery first, state second.
    let pub_arc = Arc::new(Mutex::new(CapturePublisher::default()));

    // Phase 1: discovery (would be retained=true with a real broker).
    let count = publish_discovery(&mut pub_arc.clone(), "seed-01", PrivacyClass::Anonymous)
        .expect("discovery publish");
    assert_eq!(count, 6);

    // Phase 2: spawn the handle with the same publisher. Pipeline emit drives
    // 5 state messages (Anonymous + no zone).
    let pipeline = BfldPipeline::new(BfldConfig::new("seed-01"));
    let handle = BfldPipelineHandle::spawn(pipeline, pub_arc.clone());
    handle.send(sample_input()).expect("send");
    thread::sleep(Duration::from_millis(50));
    handle.shutdown();

    let log = pub_arc.lock().unwrap();
    assert_eq!(
        log.published.len(),
        6 + 5,
        "6 discovery + 5 state messages should be in the log",
    );

    // First 6 are discovery (homeassistant/...), next 5 are state (ruview/...).
    for msg in log.published.iter().take(6) {
        assert!(msg.topic.starts_with("homeassistant/"), "got {}", msg.topic);
    }
    for msg in log.published.iter().skip(6) {
        assert!(msg.topic.starts_with("ruview/"), "got {}", msg.topic);
    }
}
