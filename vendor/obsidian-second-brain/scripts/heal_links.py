#!/usr/bin/env python3
"""
heal_links.py - a closed loop that heals broken wikilinks in an Obsidian vault.

The loop (this is the whole idea):
    start once, then ON ITS OWN it repeats:
        find a broken link
        decide the fix  (a plain name match - no AI, no API key, no cost)
        write the fix into the note
        run the broken-link check again  ->  a countable score
        repeat until nothing safe is left, the score stops dropping, or the budget runs out

This file IS the loop. vault_health's check is the score. You press start one time.
It is "closed" on purpose: bounded, safe matches only, a hard recount every pass.

No AI on purpose: this loop only repoints a link when exactly one note is a clear
name match. Ambiguous links (two or more near matches) and links with no match at
all are counted and left alone - judgment calls belong to the AI triage loop,
triage_links.py, which sorts dangling links into keep / create / delete.

Look-only (changes nothing):
    uv run scripts/heal_links.py --path "/vault" --dry-run
Run it for real, bounded to N safe fixes, recounting each pass so you can watch:
    uv run scripts/heal_links.py --path "/vault" --apply --max 15
"""
import argparse
import re
from collections import Counter
from difflib import get_close_matches
from pathlib import Path

# reuse the EXACT detection the health check uses, so our count == its count
from vault_health import load_vault, check_broken_links

DECORATION = re.compile(r"[#|].*$")          # a #heading anchor or |display alias
LINK_IN_MSG = re.compile(r"Broken link \[\[(.+?)\]\]")
PLACEHOLDER = set("*{}<>")                    # template/glob junk, never auto-fix


def base_target(link: str) -> str:
    link = DECORATION.sub("", link).strip()
    if "/" in link:
        link = Path(link).stem
    return link


def index_notes(notes):
    name_to_rel = {}
    for rel, note in notes.items():
        name_to_rel.setdefault(note["stem"].lower(), rel)
        for a in note["aliases"]:
            name_to_rel.setdefault(a.lower(), rel)
    stems = list({note["stem"].lower() for note in notes.values()})
    return name_to_rel, stems


def classify(link, name_to_rel, stems):
    base = base_target(link).lower()
    if not base:
        return "skip", None
    if base in name_to_rel:
        return "already_real", name_to_rel[base]
    near = get_close_matches(base, stems, n=2, cutoff=0.84)
    if len(near) == 1:
        return "easy_fix", name_to_rel[near[0]]
    if len(near) > 1:
        return "ask_claude", [name_to_rel[n] for n in near]
    return "no_target", None


def is_safe(link, target_rel):
    """Only auto-fix things we are sure about. Skip placeholders and templates."""
    if any(c in link for c in PLACEHOLDER):
        return False
    if any(p.lower() == "templates" for p in target_rel.split("/")):
        return False
    return True


def find_next_safe_fix(broken, name_to_rel, stems, vault):
    """Return the next (rel, link, new_stem) we can safely fix, or None."""
    for iss in broken:
        m = LINK_IN_MSG.search(iss["message"])
        if not m:
            continue
        link, rel = m.group(1), iss["files"][0]
        kind, target = classify(link, name_to_rel, stems)
        if kind != "easy_fix" or not is_safe(link, target):
            continue
        new_stem = Path(target).stem
        literal = f"[[{link}]]"
        if literal in (vault / rel).read_text(encoding="utf-8", errors="replace"):
            return rel, link, new_stem
    return None


def dry_run(vault):
    notes = load_vault(vault)
    broken = check_broken_links(notes, vault)
    name_to_rel, stems = index_notes(notes)
    buckets, safe = Counter(), 0
    for iss in broken:
        m = LINK_IN_MSG.search(iss["message"])
        if not m:
            continue
        kind, target = classify(m.group(1), name_to_rel, stems)
        buckets[kind] += 1
        if kind == "easy_fix" and is_safe(m.group(1), target):
            safe += 1
    print(f"\nBroken links: {sum(buckets.values())}")
    print(f"  safe to auto-fix right now (no AI): {safe}")
    print(f"  left for AI triage (ambiguous or no match): {buckets['ask_claude'] + buckets['no_target']}")
    print("\nDRY RUN: nothing changed.\n")


def apply_loop(vault, max_fixes):
    print(f"\nStarting the loop. Bounded to {max_fixes} safe fixes. Watch the count.\n")
    fixed = 0
    while fixed < max_fixes:
        notes = load_vault(vault)
        broken = check_broken_links(notes, vault)
        before = len(broken)
        name_to_rel, stems = index_notes(notes)

        nxt = find_next_safe_fix(broken, name_to_rel, stems, vault)
        if nxt is None:
            print("  no more safe fixes left. stopping.")
            break

        rel, link, new_stem = nxt
        path = vault / rel
        text = path.read_text(encoding="utf-8", errors="replace")
        path.write_text(text.replace(f"[[{link}]]", f"[[{new_stem}]]"), encoding="utf-8")

        after = len(check_broken_links(load_vault(vault), vault))
        fixed += 1
        print(f"  fix {fixed:>2}: [[{link}]]")
        print(f"           -> [[{new_stem}]]   in {rel}")
        print(f"           broken links: {before} -> {after}")

        if after >= before:
            print("  count did not drop - no-progress guard tripped, stopping.")
            break

    print(f"\nLoop stopped. {fixed} links healed. You pressed start once.\n")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--path", required=True)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--max", type=int, default=15)
    args = ap.parse_args()
    vault = Path(args.path).expanduser()
    if args.apply:
        apply_loop(vault, args.max)
    else:
        dry_run(vault)


if __name__ == "__main__":
    main()
