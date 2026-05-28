# RuView prompts for Codex (OpenAI CLI)

This directory mirrors the Claude Code `ruview` plugin's operator commands as Codex prompts, plus an `AGENTS.md` carrying the RuView project rules.

## Contents

| File | Purpose |
|------|---------|
| `AGENTS.md` | Project rules — repo layout, hard rules, build/test, ESP32 firmware on Windows, witness verification |
| `prompts/ruview-start.md` | Onboarding — Docker demo / repo build / live ESP32 |
| `prompts/ruview-flash.md` | Build + flash ESP32 firmware (8MB / 4MB) |
| `prompts/ruview-provision.md` | Provision WiFi creds + sink IP + channel/MAC overrides |
| `prompts/ruview-app.md` | Run a sensing application (presence / vitals / pose / sleep / MAT / point cloud) |
| `prompts/ruview-train.md` | Train / evaluate / publish a model (incl. GPU on GCloud) |
| `prompts/ruview-advanced.md` | Multistatic / tomography / cross-viewpoint / field-model / mesh-security |
| `prompts/ruview-verify.md` | Run the trust pipeline + pre-merge checklist |

Prompt parity with the Claude Code plugin is enforced by `plugins/ruview/scripts/smoke.sh` (every `commands/<name>.md` must have a matching `codex/prompts/<name>.md`).

## Install

**Per-user prompts** — copy the prompt files into Codex's prompt directory:

```bash
mkdir -p ~/.codex/prompts
cp plugins/ruview/codex/prompts/*.md ~/.codex/prompts/
# now in the codex TUI:  /ruview-start   /ruview-flash   /ruview-app   /ruview-train   /ruview-verify   /ruview-advanced
```

**Project rules** — point Codex at the `AGENTS.md`. Codex auto-discovers an `AGENTS.md` at the repo root and in the working directory; either symlink it or copy it:

```bash
ln -s plugins/ruview/codex/AGENTS.md AGENTS.md          # repo root (if you don't already have one)
# — or, if a root AGENTS.md exists, append the relevant sections from plugins/ruview/codex/AGENTS.md
```

**Config (optional)** — to keep prompts in-repo instead of `~/.codex/prompts`, add to `~/.codex/config.toml`:

```toml
# Codex reads prompts from ~/.codex/prompts by default; symlinking keeps them versioned with the repo:
#   ln -s "$PWD/plugins/ruview/codex/prompts" ~/.codex/prompts/ruview   (then prompts appear as /ruview/ruview-start, etc.)
```

## Notes

- The Codex mirror is the **operator-facing subset** — the seven `/ruview-*` commands. The Claude Code plugin additionally ships skills (`ruview-quickstart`, `ruview-hardware-setup`, `ruview-configure`, `ruview-applications`, `ruview-model-training`, `ruview-advanced-sensing`, `ruview-cli-api`, `ruview-mmwave`, `ruview-verify`) and agents (`ruview-onboarding-guide`, `ruview-config-engineer`, `ruview-training-engineer`) that have no Codex equivalent — their content is folded into `AGENTS.md` and the prompt files.
- On Windows, ESP-IDF firmware builds go through the Python-subprocess pattern documented in `CLAUDE.local.md` (Git Bash / MSYS2 is not supported by ESP-IDF v5.4). Default ESP32 serial port: **COM8**.
