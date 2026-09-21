//! Identity-risk scoring and coherence-gate action mapping. ADR-121 §2.2–§2.4.
//!
//! The risk score is a multiplicative combination of four bounded factors:
//!
//! ```text
//! identity_risk_score = clamp(sep × stab × consist × conf, 0.0, 1.0)
//! ```
//!
//! Multiplicative combination is **conservative under uncertainty**: any single
//! near-zero factor (e.g., very low sample confidence) collapses the score
//! toward 0. This biases the system toward "report low risk when unsure",
//! which is the privacy-preferred default.
//!
//! The score maps deterministically to a [`GateAction`]:
//!
//! | Score range            | Action          | Effect                                    |
//! |------------------------|-----------------|-------------------------------------------|
//! | `score < 0.5`          | `Accept`        | Publish normally                          |
//! | `0.5 <= score < 0.7`   | `PredictOnly`   | Publish with `confidence` flag lowered    |
//! | `0.7 <= score < 0.9`   | `Reject`        | Drop the event entirely                   |
//! | `score >= 0.9`         | `Recalibrate`   | Drop AND rotate `site_salt` (per ADR-120) |
//!
//! This iter ships the **stateless** mapping. Hysteresis (±0.05) and the
//! 5-second debounce land in the `CoherenceGate` struct in a subsequent iter.

/// Lower edge of `PredictOnly` (inclusive).
pub const PREDICT_ONLY_THRESHOLD: f32 = 0.5;
/// Lower edge of `Reject` (inclusive).
pub const REJECT_THRESHOLD: f32 = 0.7;
/// Lower edge of `Recalibrate` (inclusive). Triggers `site_salt` rotation.
pub const RECALIBRATE_THRESHOLD: f32 = 0.9;

/// Compute the identity-risk score from its four factors.
///
/// Each input is clamped to `[0.0, 1.0]`; the result is always in that range
/// even if the inputs include NaN (treated as 0.0 by `clamp` per its contract).
#[must_use]
pub fn score(sep: f32, stab: f32, consist: f32, conf: f32) -> f32 {
    let s = clamp01(sep);
    let t = clamp01(stab);
    let p = clamp01(consist);
    let c = clamp01(conf);
    clamp01(s * t * p * c)
}

/// `clamp01` — handles NaN by mapping it to 0.0, matching the
/// privacy-conservative bias documented in ADR-121 §2.2.
fn clamp01(v: f32) -> f32 {
    if v.is_nan() {
        0.0
    } else {
        v.clamp(0.0, 1.0)
    }
}

/// Coherence-gate decision derived from the current risk score. ADR-121 §2.4.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum GateAction {
    /// Publish the event normally.
    Accept,
    /// Publish but mark the event as "predicted-only" — downstream consumers
    /// (HA, Matter) should display reduced confidence.
    PredictOnly,
    /// Drop the event entirely; do not publish on any sink.
    Reject,
    /// Drop the event AND rotate the site-keyed BLAKE3 salt so future
    /// `rf_signature_hash` values cannot correlate with past ones.
    Recalibrate,
}

impl GateAction {
    /// Map a risk score to the corresponding gate action.
    ///
    /// Boundary semantics: thresholds are **inclusive of the lower edge**.
    /// `score = 0.7` is `Reject`; `score = 0.9` is `Recalibrate`.
    #[must_use]
    pub fn from_score(score: f32) -> Self {
        if score.is_nan() {
            // Conservative: an undefined score should not trigger anything
            // beyond a normal publish — the gate-runner is responsible for
            // logging the NaN as an upstream data-quality issue.
            return Self::Accept;
        }
        if score < PREDICT_ONLY_THRESHOLD {
            Self::Accept
        } else if score < REJECT_THRESHOLD {
            Self::PredictOnly
        } else if score < RECALIBRATE_THRESHOLD {
            Self::Reject
        } else {
            Self::Recalibrate
        }
    }

    /// `true` for `Accept` and `PredictOnly` — both produce a published event.
    #[must_use]
    pub const fn allows_publish(self) -> bool {
        matches!(self, Self::Accept | Self::PredictOnly)
    }

    /// `true` for `Reject` and `Recalibrate` — both drop the current event.
    #[must_use]
    pub const fn drops_event(self) -> bool {
        matches!(self, Self::Reject | Self::Recalibrate)
    }

    /// `true` only for `Recalibrate` — the gate-runner must rotate `site_salt`
    /// and `drain()` the `EmbeddingRing` (per ADR-120 §2.5 + ADR-121 §2.4).
    #[must_use]
    pub const fn requires_recalibrate(self) -> bool {
        matches!(self, Self::Recalibrate)
    }
}
