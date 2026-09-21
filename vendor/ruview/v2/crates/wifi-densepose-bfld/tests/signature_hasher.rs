//! Acceptance tests for ADR-120 §2.3 / §2.7 — `SignatureHasher` cross-site
//! isolation and daily rotation.

use wifi_densepose_bfld::{SignatureHasher, RF_SIGNATURE_LEN, SITE_SALT_LEN};

fn salt(seed: u8) -> [u8; SITE_SALT_LEN] {
    let mut s = [0u8; SITE_SALT_LEN];
    for (i, b) in s.iter_mut().enumerate() {
        *b = seed.wrapping_add(i as u8);
    }
    s
}

fn features(seed: u8) -> Vec<u8> {
    (0..64u8).map(|i| i.wrapping_add(seed)).collect()
}

fn hamming_distance(a: &[u8; RF_SIGNATURE_LEN], b: &[u8; RF_SIGNATURE_LEN]) -> u32 {
    a.iter()
        .zip(b.iter())
        .map(|(x, y)| (x ^ y).count_ones())
        .sum()
}

#[test]
fn deterministic_under_identical_inputs() {
    let h = SignatureHasher::new(salt(7));
    let a = h.compute(42, &features(0));
    let b = h.compute(42, &features(0));
    assert_eq!(a, b, "identical inputs must produce identical hashes");
}

#[test]
fn different_site_salts_produce_different_hashes() {
    let a = SignatureHasher::new(salt(1)).compute(42, &features(0));
    let b = SignatureHasher::new(salt(2)).compute(42, &features(0));
    assert_ne!(a, b);
}

#[test]
fn different_day_epochs_rotate_the_hash() {
    let h = SignatureHasher::new(salt(7));
    let day0 = h.compute(0, &features(0));
    let day1 = h.compute(1, &features(0));
    assert_ne!(day0, day1, "day rotation must change the hash");
}

#[test]
fn different_features_produce_different_hashes() {
    let h = SignatureHasher::new(salt(7));
    let a = h.compute(42, &features(0));
    let b = h.compute(42, &features(1));
    assert_ne!(a, b);
}

#[test]
fn output_length_is_32_bytes() {
    let h = SignatureHasher::new(salt(0));
    let out = h.compute(0, b"");
    assert_eq!(out.len(), RF_SIGNATURE_LEN);
    assert_eq!(RF_SIGNATURE_LEN, 32);
}

#[test]
fn day_epoch_from_unix_secs_matches_floor_division() {
    assert_eq!(SignatureHasher::day_epoch_from_unix_secs(0), 0);
    assert_eq!(SignatureHasher::day_epoch_from_unix_secs(86_399), 0);
    assert_eq!(SignatureHasher::day_epoch_from_unix_secs(86_400), 1);
    // Unix epoch ≈ 1.7e9 sec on date in 2024-ish; just check the math:
    assert_eq!(
        SignatureHasher::day_epoch_from_unix_secs(1_700_000_000),
        (1_700_000_000u64 / 86_400) as u32,
    );
}

#[test]
fn compute_at_matches_compute_with_derived_day() {
    let h = SignatureHasher::new(salt(3));
    let unix_secs: u64 = 1_700_000_000;
    let day = SignatureHasher::day_epoch_from_unix_secs(unix_secs);
    let a = h.compute(day, &features(0));
    let b = h.compute_at(unix_secs, &features(0));
    assert_eq!(a, b);
}

/// ADR-120 §2.7 AC2 — structural cross-site isolation.
///
/// Two BFLD nodes with different `site_salt` values observing the same
/// (simulated) person produce `rf_signature_hash` values whose Hamming
/// distance is statistically high (≈ 128 bits expected for two independent
/// 256-bit outputs; ADR threshold is ≥ 120 over 100 trials).
#[test]
fn cross_site_hamming_distance_is_statistically_high() {
    let n_trials: usize = 100;
    let mut total: u32 = 0;
    let mut min_observed: u32 = u32::MAX;

    for trial in 0..n_trials {
        let site_a = SignatureHasher::new(salt(trial as u8));
        let site_b = SignatureHasher::new(salt((trial as u8).wrapping_add(0xA5)));
        let day = trial as u32;
        let feats = features(trial as u8);
        let h_a = site_a.compute(day, &feats);
        let h_b = site_b.compute(day, &feats);
        let d = hamming_distance(&h_a, &h_b);
        total += d;
        min_observed = min_observed.min(d);
    }

    let mean = total as f32 / n_trials as f32;
    // Expectation for two independent 256-bit hashes is 128 bits; require ≥ 120
    // per ADR-120 §2.7 AC2.
    assert!(
        mean >= 120.0,
        "mean Hamming distance must be >= 120, got {mean}",
    );
    // Minimum observed should also be far above 0 (no collisions).
    assert!(
        min_observed >= 80,
        "min Hamming distance suspiciously low: {min_observed}",
    );
}
