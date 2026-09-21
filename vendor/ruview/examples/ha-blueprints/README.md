# RuView starter Home Assistant Blueprints

8 ready-to-import HA Blueprints covering the highest-leverage automations
RuView's HA-MIND semantic primitives unlock. Drop the YAML files into
`<HA config>/blueprints/automation/ruvnet/` and import from the HA UI
(**Settings → Automations & Scenes → Blueprints → Import Blueprint**).

| # | Blueprint                                                           | Primary primitive            | Use case                              |
|---|---------------------------------------------------------------------|------------------------------|---------------------------------------|
| 1 | [Notify on possible distress](01-notify-on-possible-distress.yaml)   | `possible_distress`          | Healthcare / AAL / single-occupant    |
| 2 | [Dim hallway when sleeping](02-dim-hallway-when-sleeping.yaml)       | `someone_sleeping`           | Convenience / sleep hygiene           |
| 3 | [Wake routine on bed exit](03-wake-routine-on-bed-exit.yaml)         | `bed_exit`                   | Morning routine / smart home          |
| 4 | [Alert on elderly inactivity anomaly](04-alert-elderly-inactivity-anomaly.yaml) | `elderly_inactivity_anomaly` | AAL / aging-in-place           |
| 5 | [Meeting lights + presence mode](05-meeting-lights-presence-mode.yaml) | `meeting_in_progress`      | Conference room / WFH                 |
| 6 | [Bathroom fan while occupied](06-bathroom-fan-while-occupied.yaml)   | `bathroom_occupied`          | Humidity / privacy-mode-safe          |
| 7 | [Escalate on fall-risk crossing](07-fall-risk-escalation.yaml)       | `fall_risk_elevated`         | AAL / preventive intervention         |
| 8 | [Auto-arm security when room not active](08-auto-arm-security-when-not-active.yaml) | `room_active` + `no_movement` | Self-arming security |

## Verifying the YAML

Each blueprint validates against the HA blueprint schema
(https://www.home-assistant.io/docs/blueprint/schema/). To check locally
without an HA install:

```bash
# Requires python3 + PyYAML
for f in examples/ha-blueprints/*.yaml; do
  python -c "import yaml,sys; yaml.safe_load(open('$f'))" && echo "✓ $f" || echo "✗ $f"
done
```

## Privacy-mode compatibility

Five of the eight blueprints work under `--privacy-mode` (no biometrics
exposed). The other three depend on inferred states that themselves
derive from biometrics, so they still publish, but the operator should
audit before deploying in regulated contexts.

| Blueprint                                | Privacy-mode safe? |
|------------------------------------------|--------------------|
| 01 Notify on possible distress           | ⚠️ derives from HR/motion — state still publishes |
| 02 Dim hallway when sleeping             | ⚠️ derives from BR — state still publishes |
| 03 Wake routine on bed exit              | ✅                  |
| 04 Alert on elderly inactivity anomaly   | ✅                  |
| 05 Meeting lights                        | ✅                  |
| 06 Bathroom fan while occupied           | ✅ zone-derived only |
| 07 Escalate on fall-risk crossing        | ⚠️ derives from motion-variance — state still publishes |
| 08 Auto-arm security                     | ✅                  |

The "⚠️" markers are the inferred-state-vs-raw-value distinction from
[ADR-115 §3.12.3](../../docs/adr/ADR-115-home-assistant-integration.md#3123-why-these-specific-primitives):
the *state* (e.g. `binary_sensor.someone_sleeping`) crosses the wire
even in privacy mode because it's derived server-side, but it's no
longer accompanied by the raw biometric values.

## See also

- [ADR-115](../../docs/adr/ADR-115-home-assistant-integration.md) — full design
- [`docs/integrations/home-assistant.md`](../../docs/integrations/home-assistant.md) — operator guide
- [`docs/integrations/semantic-primitives-metrics.md`](../../docs/integrations/semantic-primitives-metrics.md) — per-primitive F1
