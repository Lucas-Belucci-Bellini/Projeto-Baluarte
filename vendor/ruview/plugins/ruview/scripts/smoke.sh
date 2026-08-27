#!/usr/bin/env bash
# Structural smoke test for the `ruview` Claude Code plugin.
# Run from anywhere: bash plugins/ruview/scripts/smoke.sh
set -u

# Resolve plugin root (this file lives in <root>/scripts/smoke.sh).
# Plugin lives at <repo>/plugins/ruview ; marketplace manifest is at <repo>/.claude-plugin/marketplace.json
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO="$(cd "$ROOT/../.." && pwd)"
MARKET="$REPO/.claude-plugin/marketplace.json"

PASS=0
FAIL=0
ok()   { echo "  PASS  $1"; PASS=$((PASS+1)); }
bad()  { echo "  FAIL  $1"; FAIL=$((FAIL+1)); }
has()  { grep -q "$1" "$2" 2>/dev/null; }

echo "ruview plugin smoke test"
echo "root: $ROOT"
echo "repo: $REPO"
echo

# 1. repo-root marketplace.json exists, lists the ruview plugin, points source at ./plugins/ruview
if [ -f "$MARKET" ] && has '"ruview"' "$MARKET" && has '"\./plugins/ruview"' "$MARKET"; then ok "repo-root .claude-plugin/marketplace.json lists 'ruview' with source ./plugins/ruview"; else bad "marketplace.json missing / wrong location / wrong source ($MARKET)"; fi

# 2. plugin.json exists with required fields
PJ="$ROOT/.claude-plugin/plugin.json"
if [ -f "$PJ" ] && has '"name"' "$PJ" && has '"description"' "$PJ" && has '"version"' "$PJ"; then ok "plugin.json has name/description/version"; else bad "plugin.json missing or incomplete"; fi

# 3. plugin.json has keywords
if has '"keywords"' "$PJ"; then ok "plugin.json has keywords"; else bad "plugin.json missing keywords"; fi

# 4. plugin.json does NOT enumerate skills/commands/agents (auto-discovered)
if has '"skills"' "$PJ" || has '"commands"' "$PJ" || has '"agents"' "$PJ"; then bad "plugin.json must NOT contain skills/commands/agents arrays"; else ok "plugin.json does not enumerate skills/commands/agents"; fi

# 5. every skill has SKILL.md with name + description + allowed-tools, and no wildcard tools
SKILL_OK=1
for d in "$ROOT"/skills/*/; do
  [ -d "$d" ] || continue
  f="$d/SKILL.md"
  if [ ! -f "$f" ]; then bad "missing $f"; SKILL_OK=0; continue; fi
  has '^name:' "$f"          || { bad "$f missing 'name:'"; SKILL_OK=0; }
  has '^description:' "$f"    || { bad "$f missing 'description:'"; SKILL_OK=0; }
  has '^allowed-tools:' "$f"  || { bad "$f missing 'allowed-tools:'"; SKILL_OK=0; }
  if grep -E '^allowed-tools:.*(\*|\ball tools\b)' "$f" >/dev/null 2>&1; then bad "$f uses wildcard tools"; SKILL_OK=0; fi
done
[ "$SKILL_OK" = 1 ] && ok "all skills have valid frontmatter, no wildcard tools"

# 6. expected skills present
EXPECTED_SKILLS="ruview-quickstart ruview-hardware-setup ruview-configure ruview-applications ruview-model-training ruview-advanced-sensing ruview-cli-api ruview-mmwave ruview-verify"
SKILLS_PRESENT=1
for s in $EXPECTED_SKILLS; do
  [ -f "$ROOT/skills/$s/SKILL.md" ] || { bad "expected skill missing: $s"; SKILLS_PRESENT=0; }
done
[ "$SKILLS_PRESENT" = 1 ] && ok "expected skill set present ($(echo $EXPECTED_SKILLS | wc -w) skills)"

# 7. every command has a description in frontmatter
CMD_OK=1
for f in "$ROOT"/commands/*.md; do
  [ -f "$f" ] || { bad "no command files found"; CMD_OK=0; break; }
  has '^description:' "$f" || { bad "$f missing 'description:'"; CMD_OK=0; }
done
[ "$CMD_OK" = 1 ] && ok "all commands have a description"

# 8. every agent has name + description + model
AG_OK=1
for f in "$ROOT"/agents/*.md; do
  [ -f "$f" ] || { bad "no agent files found"; AG_OK=0; break; }
  has '^name:' "$f"        || { bad "$f missing 'name:'"; AG_OK=0; }
  has '^description:' "$f" || { bad "$f missing 'description:'"; AG_OK=0; }
  has '^model:' "$f"       || { bad "$f missing 'model:'"; AG_OK=0; }
done
[ "$AG_OK" = 1 ] && ok "all agents have name/description/model"

# 9. README has Compatibility + Namespace coordination
RM="$ROOT/README.md"
if has '## Compatibility' "$RM" && has 'Namespace coordination' "$RM"; then ok "README has Compatibility + Namespace coordination"; else bad "README missing Compatibility or Namespace coordination section"; fi

# 10. ADR-0001 exists with Status: Proposed
ADR="$ROOT/docs/adrs/0001-ruview-plugin-contract.md"
if [ -f "$ADR" ] && grep -qi 'Status:.*Proposed' "$ADR"; then ok "ADR-0001 present with Status: Proposed"; else bad "ADR-0001 missing or not 'Proposed'"; fi

# 11. Codex mirror present
if [ -f "$ROOT/codex/AGENTS.md" ] && ls "$ROOT"/codex/prompts/*.md >/dev/null 2>&1; then ok "Codex mirror present (AGENTS.md + prompts/)"; else bad "Codex mirror missing"; fi

# 11b. command <-> Codex prompt parity
PARITY=1
for f in "$ROOT"/commands/*.md; do
  [ -f "$f" ] || continue
  base="$(basename "$f")"
  [ -f "$ROOT/codex/prompts/$base" ] || { bad "no Codex prompt for command $base"; PARITY=0; }
done
[ "$PARITY" = 1 ] && ok "every command has a matching Codex prompt"

# 12. no skills/commands/agents accidentally placed inside .claude-plugin/
if ls "$ROOT"/.claude-plugin/skills "$ROOT"/.claude-plugin/commands "$ROOT"/.claude-plugin/agents >/dev/null 2>&1; then bad "skills/commands/agents must not live under .claude-plugin/"; else ok ".claude-plugin/ contains only plugin.json"; fi

echo
echo "----------------------------------------"
echo "PASS: $PASS   FAIL: $FAIL"
[ "$FAIL" -eq 0 ] || exit 1
