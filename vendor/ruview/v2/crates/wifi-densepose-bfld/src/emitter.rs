//! `BfldEmitter` — end-to-end pipeline. ADR-118 §2.1.
//!
//! Wires the per-frame sensing inputs through:
//!
//! ```text
//!  risk = identity_risk::score(sep, stab, consist, conf_factor)
//!    -> gate.evaluate_with_oracle(risk, ts, &oracle) -> GateAction
//!       -> if Recalibrate: ring.drain()
//!       -> if action.drops_event(): return None
//!       -> else: BfldEvent::with_privacy_gating(...)
//! ```
//!
//! The emitter owns the `CoherenceGate` and `EmbeddingRing` state so the
//! caller only supplies per-frame inputs. Identity embeddings are pushed to
//! the ring before the gate is consulted; on `Recalibrate` the ring is
//! drained synchronously inside this function.

#![cfg(feature = "std")]

use crate::coherence_gate::{CoherenceGate, NullOracle, SoulMatchOracle};
use crate::embedding_ring::EmbeddingRing;
use crate::identity_features::IdentityFeatures;
use crate::identity_risk::{score, GateAction};
use crate::signature_hasher::SignatureHasher;
use crate::{BfldEvent, IdentityEmbedding, PrivacyClass};

/// Nanoseconds-per-second conversion factor for deriving unix_secs from
/// `timestamp_ns`. The caller is responsible for using unix-epoch nanoseconds
/// if it wants stable daily rotation; monotonic-only clocks won't anchor to
/// UTC midnight.
const NS_PER_SEC: u64 = 1_000_000_000;

/// Per-frame sensing inputs to [`BfldEmitter::emit`].
#[derive(Debug, Clone)]
pub struct SensingInputs {
    /// Monotonic capture-clock timestamp in nanoseconds.
    pub timestamp_ns: u64,
    /// Whether an occupant is present in the zone.
    pub presence: bool,
    /// Normalized motion magnitude `[0,1]`.
    pub motion: f32,
    /// Estimated occupant count.
    pub person_count: u8,
    /// Sensing confidence (NOT the risk-score `conf` factor) — `[0,1]`.
    pub sensing_confidence: f32,

    // --- Risk-score factors (ADR-121 §2.2) -------------------------------
    /// `identity_separability_score` — `[0,1]`.
    pub sep: f32,
    /// `temporal_stability` — `[0,1]`.
    pub stab: f32,
    /// `cross_perspective_consistency` — `[0,1]`.
    pub consist: f32,
    /// Risk-score sample confidence factor — `[0,1]`.
    pub risk_conf: f32,

    // --- Optional identity-derived fields --------------------------------
    /// Per-day BLAKE3-keyed `rf_signature_hash`. Stripped at class 3 by the
    /// privacy-gated event constructor.
    pub rf_signature_hash: Option<[u8; 32]>,
}

/// End-to-end pipeline. Owns the gate state, the embedding ring, and the
/// configured node identity. Defaults to `PrivacyClass::Anonymous`.
pub struct BfldEmitter {
    node_id: String,
    default_zone_id: Option<String>,
    privacy_class: PrivacyClass,
    gate: CoherenceGate,
    ring: EmbeddingRing,
    signature_hasher: Option<SignatureHasher>,
}

impl BfldEmitter {
    /// Build a new emitter in the production-default state: class Anonymous,
    /// empty gate/ring, no default zone.
    #[must_use]
    pub fn new(node_id: impl Into<String>) -> Self {
        Self {
            node_id: node_id.into(),
            default_zone_id: None,
            privacy_class: PrivacyClass::Anonymous,
            gate: CoherenceGate::new(),
            ring: EmbeddingRing::new(),
            signature_hasher: None,
        }
    }

    /// Install a [`SignatureHasher`] so the emitter computes `rf_signature_hash`
    /// per ADR-120 §2.3 from the supplied embedding (preferred) or the risk
    /// factors (fallback when no embedding is supplied). When set, the derived
    /// hash overrides `SensingInputs::rf_signature_hash`.
    #[must_use]
    pub fn with_signature_hasher(mut self, hasher: SignatureHasher) -> Self {
        self.signature_hasher = Some(hasher);
        self
    }

    /// Set the default zone ID emitted with each event (None = single-zone).
    #[must_use]
    pub fn with_zone(mut self, zone_id: impl Into<String>) -> Self {
        self.default_zone_id = Some(zone_id.into());
        self
    }

    /// Override the privacy class (default `Anonymous`).
    #[must_use]
    pub const fn with_privacy_class(mut self, class: PrivacyClass) -> Self {
        self.privacy_class = class;
        self
    }

    /// Read-only access to the current gate action — useful for diagnostics.
    #[must_use]
    pub const fn current_action(&self) -> GateAction {
        self.gate.current()
    }

    /// Read-only access to the ring length (post any in-flight drain).
    #[must_use]
    pub const fn ring_len(&self) -> usize {
        self.ring.len()
    }

    /// Run one pipeline step with the default [`NullOracle`]. Returns
    /// `Some(BfldEvent)` if the gate permitted publishing, `None` if the
    /// action was `Reject` or `Recalibrate`.
    pub fn emit(
        &mut self,
        inputs: SensingInputs,
        embedding: Option<IdentityEmbedding>,
    ) -> Option<BfldEvent> {
        self.emit_with_oracle(inputs, embedding, &NullOracle)
    }

    /// Same as [`Self::emit`] but consults a [`SoulMatchOracle`] before the
    /// gate fires `Recalibrate`. See ADR-121 §2.6.
    pub fn emit_with_oracle<O: SoulMatchOracle>(
        &mut self,
        inputs: SensingInputs,
        embedding: Option<IdentityEmbedding>,
        oracle: &O,
    ) -> Option<BfldEvent> {
        let risk = score(inputs.sep, inputs.stab, inputs.consist, inputs.risk_conf);

        // Compute the derived rf_signature_hash BEFORE moving `embedding`
        // into the ring. The IdentityFeatures encoder (iter 18) consolidates
        // the embedding vs risk-factor selection behind a single canonical-
        // bytes path; same wire bytes as the iter-16 inline encoding.
        let derived_hash: Option<[u8; 32]> = self.signature_hasher.as_ref().map(|h| {
            let unix_secs = inputs.timestamp_ns / NS_PER_SEC;
            let day_epoch = SignatureHasher::day_epoch_from_unix_secs(unix_secs);
            let features = match &embedding {
                Some(emb) => IdentityFeatures::from_embedding(emb),
                None => IdentityFeatures::from_risk_factors(
                    inputs.sep,
                    inputs.stab,
                    inputs.consist,
                    inputs.risk_conf,
                ),
            };
            features.compute_hash(h, day_epoch)
        });

        if let Some(emb) = embedding {
            // Always push, regardless of action — the ring is the rolling
            // memory of recent identity embeddings, used for separability.
            self.ring.push(emb);
        }

        let action = self
            .gate
            .evaluate_with_oracle(risk, inputs.timestamp_ns, oracle);

        if action == GateAction::Recalibrate {
            self.ring.drain();
        }

        if action.drops_event() {
            return None;
        }

        let identity_risk_score = match self.privacy_class {
            PrivacyClass::Anonymous => Some(risk),
            // Class 3 strips identity_risk; class 0/1 keep it (research modes).
            // The BfldEvent constructor enforces the class-3 strip again as a
            // defense-in-depth measure.
            _ => Some(risk),
        };

        // Derived hash (when hasher installed) takes precedence over caller-
        // supplied; otherwise pass through whatever the caller provided.
        let rf_signature_hash = derived_hash.or(inputs.rf_signature_hash);

        Some(BfldEvent::with_privacy_gating(
            self.node_id.clone(),
            inputs.timestamp_ns,
            inputs.presence,
            inputs.motion,
            inputs.person_count,
            inputs.sensing_confidence,
            self.default_zone_id.clone(),
            self.privacy_class,
            identity_risk_score,
            rf_signature_hash,
        ))
    }
}

// canonical_risk_bytes removed in iter 18 — superseded by
// IdentityFeatures::from_risk_factors().canonical_bytes() which uses the
// same little-endian f32 layout.
