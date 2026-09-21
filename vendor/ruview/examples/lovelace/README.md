# RuView Lovelace dashboards

Drop-in Lovelace dashboard YAMLs for three common deployment shapes.
Paste the contents of any file into HA's **Lovelace raw config editor**
(Settings → Dashboards → ⋮ → Edit dashboard → ⋮ → Raw config editor)
and edit the `binary_sensor.ruview_<room>_*` entity IDs to match what
HA auto-discovered from your RuView nodes.

| # | View                              | When to use                            |
|---|-----------------------------------|----------------------------------------|
| 1 | [Single-room overview](01-single-room-overview.yaml) | One RuView node, full 21-entity surface |
| 2 | [Multi-node grid](02-multi-node-grid.yaml)            | 3+ RuView nodes (whole-house deploy)    |
| 3 | [Healthcare / AAL view](03-healthcare-aal-view.yaml)  | Care-giver dashboard; **privacy-mode-safe** (no biometrics shown) |

## Renaming entities

RuView's MQTT auto-discovery generates entity IDs from the node's MAC
address by default (`binary_sensor.ruview_aabbccddeeff_presence`).
To get friendly names like `binary_sensor.ruview_bedroom_presence`,
either:

1. **Rename in HA** — open the entity, click the settings cog, change
   the entity ID. HA stores the rename in its own DB; the MQTT
   discovery topic stays the same.
2. **Set `node_friendly_name`** in the sensing-server NVS config (per
   ADR-115 §9.6 maintainer-ACK'd decision: NVS-only, no ADR-039
   packet change). HA picks the friendly name up at next discovery
   refresh.

## Privacy-mode compatibility

The third dashboard is designed for healthcare / AAL deployments where
`--privacy-mode` is set on the sensing-server. Under privacy mode:

- HR / BR / pose entities never reach HA (discovery is suppressed).
- Semantic primitives (someone_sleeping, possible_distress, etc.)
  continue to publish because they're inferred *states* server-side,
  not biometric *values*.

The healthcare dashboard binds only to semantic-primitive entities,
so it remains useful — and HIPAA / GDPR-cleaner — under privacy mode.

## Linked

- [ADR-115](../../docs/adr/ADR-115-home-assistant-integration.md) — full design
- [`docs/integrations/home-assistant.md`](../../docs/integrations/home-assistant.md)
- [`examples/ha-blueprints/`](../ha-blueprints/) — 8 starter automations
