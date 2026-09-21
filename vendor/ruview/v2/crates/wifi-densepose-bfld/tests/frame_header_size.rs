//! Acceptance test ADR-119 AC1: `BfldFrameHeader` size is platform-stable.
//!
//! The static assertion in `frame.rs` already enforces this at compile time on
//! the local target. This runtime test exists so CI surfaces the failure with
//! a useful message rather than a `const_assert_eq!` link error.

use wifi_densepose_bfld::{BfldFrameHeader, BFLD_HEADER_SIZE, BFLD_MAGIC, BFLD_VERSION};

#[test]
fn header_size_is_86_bytes() {
    assert_eq!(
        core::mem::size_of::<BfldFrameHeader>(),
        BFLD_HEADER_SIZE,
        "BfldFrameHeader must be exactly {BFLD_HEADER_SIZE} bytes (packed)",
    );
}

#[test]
fn magic_reads_as_bfld_in_hex() {
    // 0xBF1D_0001 — "BF1D" looks like "BFLD" in xxd output; final 0001 is the
    // major version that lives in the dedicated `version` field as well.
    assert_eq!(BFLD_MAGIC, 0xBF1D_0001);
}

#[test]
fn version_is_one() {
    assert_eq!(BFLD_VERSION, 1);
}
