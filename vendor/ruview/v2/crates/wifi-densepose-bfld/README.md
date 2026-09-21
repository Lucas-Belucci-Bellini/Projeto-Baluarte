# wifi-densepose-bfld

**BFLD — Beamforming Feedback Layer for Detection.** Privacy-gated WiFi sensing primitives derived from 802.11ac/ax Beamforming Feedback Information (BFI). See [ADR-118](../../../docs/adr/ADR-118-bfld-beamforming-feedback-layer-for-detection.md) for the umbrella architecture decision and [`docs/research/BFLD/`](../../../docs/research/BFLD/) for the full design dossier.

## Three structural invariants

The crate enforces three privacy invariants **structurally** (via the type system + memory hygiene), not by policy text:

| ID | Invariant | Enforced by |
|----|-----------|-------------|
| **I1** | Raw BFI never exits the node | [`Sink`] marker-trait hierarchy + [`PrivacyClass::Raw.allows_network() == false`] |
| **I2** | Identity embedding is in-RAM-only | [`IdentityEmbedding`] has no `Serialize` / `Clone` / `Copy` + `Drop` zeroizes storage |
| **I3** | Cross-site identity correlation is cryptographically impossible | [`SignatureHasher`] per-site BLAKE3-keyed hash with daily epoch rotation |

## Quickstart

Minimal in-process consumer (see `examples/bfld_minimal.rs`):

```rust
use wifi_densepose_bfld::{
    BfldConfig, BfldPipeline, IdentityEmbedding, SensingInputs,
    SignatureHasher, EMBEDDING_DIM, SITE_SALT_LEN,
};

let mut pipeline = BfldPipeline::new(
    BfldConfig::new("seed-01")
        .with_signature_hasher(SignatureHasher::new([0xAB; SITE_SALT_LEN])),
);

let event = pipeline
    .process(
        SensingInputs { /* timestamp, presence, motion, ... */
            timestamp_ns: 1_700_000_000_000_000_000, presence: true,
            motion: 0.42, person_count: 1, sensing_confidence: 0.91,
            sep: 0.2, stab: 0.2, consist: 0.2, risk_conf: 0.2,
            rf_signature_hash: None,
        },
        Some(IdentityEmbedding::from_raw([0.05; EMBEDDING_DIM])),
    )
    .expect("low-risk emit");

println!("{}", event.to_json().unwrap());
```

Production worker-thread + HA-DISCO publishing (see `examples/bfld_handle.rs`):

```rust
use wifi_densepose_bfld::{
    publish_availability_online, publish_discovery, BfldConfig, BfldPipeline,
    BfldPipelineHandle, PipelineInput, PrivacyClass, SignatureHasher,
};

// Bootstrap: retained "online" + 6 retained HA-DISCO config payloads.
publish_availability_online(&mut publisher, "seed-01")?;
publish_discovery(&mut publisher, "seed-01", PrivacyClass::Anonymous)?;

// Spawn worker. Per-frame: handle.send(PipelineInput { inputs, embedding }).
let handle = BfldPipelineHandle::spawn(
    BfldPipeline::new(BfldConfig::new("seed-01")
        .with_signature_hasher(SignatureHasher::new(salt))),
    publisher,
);
handle.send(PipelineInput { inputs, embedding })?;
```

## Feature flags

| Feature | Default | Pulls in | Enables |
|---------|---------|----------|---------|
| `std`           | ✅ | (no extra deps) | `BfldFrame`, `BfldPayload`, `BfldPipeline`, `BfldPipelineHandle`, `BfldEvent`, `BfldEmitter`, `PrivacyGate`, MQTT topic router, HA discovery |
| `serde-json`    | ✅ | `serde` + `serde_json` | `BfldEvent::to_json()`, custom `rf_signature_hash: "blake3:<hex>"` serializer, `privacy_class` string encoding |
| `mqtt`          | — | `rumqttc 0.24` (`use-rustls`) | `RumqttPublisher`, `connect_with_lwt`, live broker integration |
| `soul-signature`| — | — | `--features` gate signaling Soul Signature deployment (ADR-118 §1.4, ADR-120 §2.7, ADR-121 §2.6) |

Stripping to `--no-default-features` keeps the no_std-compatible core (`BfldFrameHeader`, `PrivacyClass`, `Sink` traits, `CoherenceGate`, `SignatureHasher`, `IdentityEmbedding`, `EmbeddingRing`, risk-score function + `GateAction`).

## Examples

```sh
cargo run -p wifi-densepose-bfld --example bfld_minimal    # in-process consumer
cargo run -p wifi-densepose-bfld --example bfld_handle     # worker-thread + HA-DISCO
```

## Companion artifacts

| Path | Purpose |
|------|---------|
| `docs/adr/ADR-118` through `ADR-123` | Architecture decisions |
| `docs/research/BFLD/` | 13,544-word design bundle (11 files) |
| `v2/crates/cog-ha-matter/blueprints/bfld/` | Three HA operator blueprints (presence-lighting, motion-HVAC, identity-risk-anomaly) |
| `.github/workflows/bfld-mqtt-integration.yml` | CI matrix incl. live mosquitto Docker service |

## ADR cross-reference

| ADR | Scope |
|-----|-------|
| [118](../../../docs/adr/ADR-118-bfld-beamforming-feedback-layer-for-detection.md) | Umbrella + invariants I1/I2/I3 |
| [119](../../../docs/adr/ADR-119-bfld-frame-format-and-wire-protocol.md) | Wire format (86-byte header + payload sections + CRC-32/ISO-HDLC) |
| [120](../../../docs/adr/ADR-120-bfld-privacy-class-and-hash-rotation.md) | 4 privacy classes + per-site keyed hash with daily rotation |
| [121](../../../docs/adr/ADR-121-bfld-identity-risk-scoring.md) | Multiplicative risk score + coherence-gate hysteresis + Soul Signature exemption |
| [122](../../../docs/adr/ADR-122-bfld-ruview-ha-matter-exposure.md) | HA-DISCO + Matter cluster boundary + MQTT topic routing |
| [123](../../../docs/adr/ADR-123-bfld-capture-path-nexmon-and-esp32.md) | Pi 5 / Nexmon capture adapter + ESP32 self-only mode |

## Testing

```sh
cargo test -p wifi-densepose-bfld --no-default-features  # no_std-compatible core
cargo test -p wifi-densepose-bfld                        # default std + serde-json
cargo test -p wifi-densepose-bfld --features mqtt        # incl. rumqttc smoke
```

A `BFLD_MQTT_BROKER=tcp://localhost:1883` env var unlocks the live-broker `mosquitto_integration` test suite (see `tests/mosquitto_integration.rs`).

## License

MIT — same as the wifi-densepose workspace.
