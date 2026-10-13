//! Acceptance tests for `BfldPipelineHandle::spawn_with_oracle`. ADR-121 §2.6
//! end-to-end: the operator-supplied Soul Signature oracle reaches the worker
//! thread and downgrades Recalibrate-grade scores to PredictOnly.

#![cfg(feature = "std")]

use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

use wifi_densepose_bfld::coherence_gate::DEBOUNCE_NS;
use wifi_densepose_bfld::{
    BfldConfig, BfldPipeline, BfldPipelineHandle, CapturePublisher, IdentityEmbedding,
    MatchOutcome, NullOracle, PipelineInput, SensingInputs, SoulMatchOracle, EMBEDDING_DIM,
};

const NS_PER_SEC: u64 = 1_000_000_000;

fn input_at(ts_secs: f64, risk: [f32; 4]) -> PipelineInput {
    let [sep, stab, consist, risk_conf] = risk;
    let ts_ns = (ts_secs * NS_PER_SEC as f64) as u64;
    PipelineInput {
        inputs: SensingInputs {
            timestamp_ns: ts_ns,
            presence: true,
            motion: 0.5,
            person_count: 1,
            sensing_confidence: 0.9,
            sep,
            stab,
            consist,
            risk_conf,
            rf_signature_hash: None,
        },
        embedding: Some(IdentityEmbedding::from_raw([0.05; EMBEDDING_DIM])),
    }
}

struct AlwaysMatch;
impl SoulMatchOracle for AlwaysMatch {
    fn matches_enrolled(&self) -> MatchOutcome {
        MatchOutcome::Match {
            person_id: 0xDEAD_BEEF,
        }
    }
}

fn topic_count(log: &CapturePublisher, contains: &str) -> usize {
    log.published
        .iter()
        .filter(|m| m.topic.contains(contains))
        .count()
}

#[test]
fn spawn_with_oracle_null_is_equivalent_to_spawn() {
    let pub_a = Arc::new(Mutex::new(CapturePublisher::default()));
    let pub_b = Arc::new(Mutex::new(CapturePublisher::default()));

    let handle_a = BfldPipelineHandle::spawn(
        BfldPipeline::new(BfldConfig::new("seed-null-1")),
        pub_a.clone(),
    );
    let handle_b = BfldPipelineHandle::spawn_with_oracle(
        BfldPipeline::new(BfldConfig::new("seed-null-1")),
        pub_b.clone(),
        NullOracle,
    );

    for i in 0..3 {
        handle_a
            .send(input_at(i as f64 * 0.1, [0.2, 0.2, 0.2, 0.2]))
            .unwrap();
        handle_b
            .send(input_at(i as f64 * 0.1, [0.2, 0.2, 0.2, 0.2]))
            .unwrap();
    }
    thread::sleep(Duration::from_millis(120));
    handle_a.shutdown();
    handle_b.shutdown();

    let log_a = pub_a.lock().unwrap();
    let log_b = pub_b.lock().unwrap();
    assert_eq!(log_a.published.len(), log_b.published.len());
    assert_eq!(
        topic_count(&log_a, "/motion/state"),
        topic_count(&log_b, "/motion/state"),
    );
}

#[test]
fn spawn_with_always_match_oracle_lets_events_publish_under_high_risk() {
    // Without the oracle (or with NullOracle), a sustained Recalibrate-grade
    // score (all factors ≈ 1.0) promotes to Recalibrate after DEBOUNCE_NS
    // and `process_with_oracle` returns None for those frames. With
    // AlwaysMatch, the gate downgrades to PredictOnly, so events keep
    // publishing.
    let pub_arc = Arc::new(Mutex::new(CapturePublisher::default()));
    let handle = BfldPipelineHandle::spawn_with_oracle(
        BfldPipeline::new(BfldConfig::new("seed-match")),
        pub_arc.clone(),
        AlwaysMatch,
    );

    // Send 3 high-risk inputs separated by > DEBOUNCE_NS so the gate would
    // have promoted to Recalibrate were it not for the oracle exemption.
    handle.send(input_at(0.0, [1.0, 1.0, 1.0, 1.0])).unwrap();
    let ts_after_debounce = (DEBOUNCE_NS as f64) / (NS_PER_SEC as f64);
    handle
        .send(input_at(ts_after_debounce, [1.0, 1.0, 1.0, 1.0]))
        .unwrap();
    handle
        .send(input_at(ts_after_debounce * 2.0, [1.0, 1.0, 1.0, 1.0]))
        .unwrap();
    thread::sleep(Duration::from_millis(120));
    handle.shutdown();

    let log = pub_arc.lock().unwrap();
    let motions = topic_count(&log, "/motion/state");
    // All 3 inputs should yield motion topics — none dropped to Recalibrate.
    assert_eq!(
        motions, 3,
        "AlwaysMatch oracle must prevent Recalibrate-drop, got {motions} motion topics",
    );
}

#[test]
fn spawn_with_null_oracle_drops_events_under_sustained_recalibrate_score() {
    // Negative control for the test above: same high-risk input sequence
    // through NullOracle should DROP the second + later events (the gate
    // promotes to Recalibrate after the first one passes through at Accept
    // baseline and the debounce elapses).
    let pub_arc = Arc::new(Mutex::new(CapturePublisher::default()));
    let handle = BfldPipelineHandle::spawn_with_oracle(
        BfldPipeline::new(BfldConfig::new("seed-null-drop")),
        pub_arc.clone(),
        NullOracle,
    );

    handle.send(input_at(0.0, [1.0, 1.0, 1.0, 1.0])).unwrap();
    let ts_after_debounce = (DEBOUNCE_NS as f64) / (NS_PER_SEC as f64);
    handle
        .send(input_at(ts_after_debounce, [1.0, 1.0, 1.0, 1.0]))
        .unwrap();
    handle
        .send(input_at(ts_after_debounce * 2.0, [1.0, 1.0, 1.0, 1.0]))
        .unwrap();
    thread::sleep(Duration::from_millis(120));
    handle.shutdown();

    let log = pub_arc.lock().unwrap();
    let motions = topic_count(&log, "/motion/state");
    // The first input passes (gate still in Accept). The second + third
    // hit Recalibrate after debounce → dropped. Expect exactly 1.
    assert_eq!(
        motions, 1,
        "NullOracle must let the gate Recalibrate-drop after debounce, got {motions} motion topics",
    );
}
