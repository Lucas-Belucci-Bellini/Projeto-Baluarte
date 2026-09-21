//! Pin the CRC-32/ISO-HDLC polynomial used by `crc32_of_payload`. ADR-119 §2.4.
//!
//! BFLD picks **CRC-32/ISO-HDLC** specifically (same as Ethernet / zlib),
//! NOT CRC-32C (Castagnoli) or any other CRC-32 variant. The polynomial
//! choice is part of the wire-format contract — two implementations that
//! disagree on the polynomial will treat every other's frame as corrupt.
//!
//! These tests use the standard "123456789" check string (CRC reference
//! https://reveng.sourceforge.io/crc-catalogue/all.htm) plus a few targeted
//! vectors. If a future PR swaps `CRC_32_ISO_HDLC` for `CRC_32_CKSUM` or
//! similar, every test below fires.

#![cfg(feature = "std")]

use wifi_densepose_bfld::frame::crc32_of_payload;

/// CRC-32/ISO-HDLC check vector — "123456789" must produce 0xCBF43926.
const CHECK_VALUE: u32 = 0xCBF4_3926;

#[test]
fn check_string_matches_canonical_iso_hdlc_value() {
    assert_eq!(
        crc32_of_payload(b"123456789"),
        CHECK_VALUE,
        "CRC-32/ISO-HDLC of the standard \"123456789\" check string must be 0xCBF43926. \
         If this test fires, someone likely swapped the polynomial — verify the \
         crc::CRC_32_ISO_HDLC binding in src/frame.rs.",
    );
}

#[test]
fn empty_payload_yields_zero_crc() {
    // Per CRC-32/ISO-HDLC: init = 0xFFFFFFFF, xorout = 0xFFFFFFFF. Empty
    // input passes init through xorout, yielding 0x00000000.
    assert_eq!(crc32_of_payload(b""), 0);
}

#[test]
fn single_zero_byte_has_a_specific_value() {
    // Pins the algorithm — CRC-32/ISO-HDLC of a single 0x00 byte is
    // 0xD202EF8D (well-known constant).
    assert_eq!(crc32_of_payload(&[0x00]), 0xD202_EF8D);
}

#[test]
fn flipping_a_single_payload_byte_changes_the_crc() {
    // CRC is sensitive to every bit. A 256-byte payload with one bit flip
    // must produce a different CRC.
    let mut payload = vec![0xAA; 256];
    let crc_before = crc32_of_payload(&payload);
    payload[42] ^= 0x01;
    let crc_after = crc32_of_payload(&payload);
    assert_ne!(crc_before, crc_after, "single bit flip must change CRC");
}

#[test]
fn iso_hdlc_distinguishes_from_castagnoli_for_same_input() {
    // CRC-32C ("Castagnoli", poly 0x1EDC6F41) of "123456789" is 0xE3069283.
    // CRC-32/ISO-HDLC                          of "123456789" is 0xCBF43926.
    // If anyone swaps polynomials, the test above already catches it — this
    // test makes the failure mode explicit by asserting the inequality
    // between the values, so reading the test source explains WHY.
    let our_crc = crc32_of_payload(b"123456789");
    let castagnoli = 0xE306_9283u32;
    assert_ne!(
        our_crc, castagnoli,
        "if our_crc equals CRC-32C/Castagnoli, the polynomial was swapped",
    );
    assert_eq!(our_crc, CHECK_VALUE);
}

#[test]
fn known_short_inputs_have_documented_crcs() {
    // Computed via crc::Crc::<u32>::new(&crc::CRC_32_ISO_HDLC).checksum(...)
    // and captured here to lock the API surface. If a different crc crate
    // version or a different polynomial slips in, these constants fire.
    assert_eq!(crc32_of_payload(b"a"), 0xE8B7_BE43);
    assert_eq!(crc32_of_payload(b"abc"), 0x3524_41C2);
    assert_eq!(crc32_of_payload(b"hello world"), 0x0D4A_1185);
}

#[test]
fn crc_is_deterministic_across_repeated_calls() {
    let payload = b"deterministic check payload";
    let a = crc32_of_payload(payload);
    let b = crc32_of_payload(payload);
    let c = crc32_of_payload(payload);
    assert_eq!(a, b);
    assert_eq!(b, c);
}
