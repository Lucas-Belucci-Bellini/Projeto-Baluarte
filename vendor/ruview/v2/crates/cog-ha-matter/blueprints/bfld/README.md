# BFLD HA Blueprints

Operator-ready Home Assistant automation blueprints for the BFLD entities
published by `wifi-densepose-bfld`. Sourced from **ADR-122 §2.6**.

## Installing

Copy each `.yaml` file into your HA `blueprints/automation/` directory (or
import via the HA UI: Settings → Automations & Scenes → Blueprints → Import).

## Available blueprints

| File | Purpose | BFLD entity consumed |
|---|---|---|
| `presence-lighting.yaml` | Turn a light on/off with BFLD occupancy | `binary_sensor.<node>_bfld_presence` |
| `motion-hvac.yaml` | Adjust HVAC setpoint when motion crosses a threshold | `sensor.<node>_bfld_motion` |
| `identity-risk-anomaly.yaml` | Notify operator on identity-risk z-score spike | `sensor.<node>_bfld_identity_risk` |

## Privacy notes

- `identity-risk-anomaly.yaml` requires `sensor.<node>_bfld_identity_risk` which is **only present at `privacy_class = Anonymous`** (per ADR-122 §2.1). At `privacy_class = Restricted` (e.g., care-home deployments) the entity is not advertised to HA at all, and this blueprint will fail validation — by design.
- The `statistics_entity` input for `identity-risk-anomaly.yaml` requires the operator to first create an HA Statistics helper for the BFLD identity-risk sensor with a 7-day window. The blueprint reads `mean` + `standard_deviation` attributes.

## Source-of-truth blueprint structure tests

`v2/crates/wifi-densepose-bfld/tests/ha_blueprints.rs` validates each YAML at build time via `include_str!` and asserts the presence of the required HA-blueprint fields (`blueprint.name`, `blueprint.domain`, `input` block, `trigger`, `action`, `mode`).
