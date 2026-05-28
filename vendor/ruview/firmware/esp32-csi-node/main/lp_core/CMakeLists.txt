# LP-core motion-gate program — ADR-110 Phase 5 (full).
#
# Built only when CONFIG_C6_LP_CORE_ENABLE=y (gated in the parent CMakeLists).
# The IDF build system invokes this via `ulp_embed_binary()` from
# main/CMakeLists.txt.

# This file intentionally has no idf_component_register — the LP-core sources
# are compiled with the RISC-V LP toolchain via `ulp_embed_binary` and then
# linked into the HP image as a binary blob, not as a normal component.
