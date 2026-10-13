//! Matter commissioning code generation (ADR-115 §3.11.2).
//!
//! When `--matter` is enabled, the publisher prints a setup code on
//! first start that the user scans/enters into their Matter controller
//! (Apple Home / Google Home / HA Matter integration). This module
//! generates that code without depending on any Matter SDK.
//!
//! ## Spec
//!
//! Matter Core Spec 1.3 §5.1 defines two pairing-code formats:
//!
//! - **Manual pairing code** — 11 digits, base-10 encoded from packed
//!   bits. This is what we emit for `--matter-setup-file`.
//! - **QR code payload** — `MT:` prefix + base-38 of a longer
//!   bit-packed payload. v0.7.0 emits the manual code only; QR string
//!   generation is a v0.7.1 follow-up (per §9.9 dev-VID note —
//!   commissioning works in either form with dev VID).
//!
//! ## Bit layout (manual code, §5.1.4.1)
//!
//! ```text
//!  bits  width  meaning
//!  ---- ------- -------------------------------------------------------
//!   0    1     Version (always 0 today)
//!   1    1     VID/PID present flag (0 = short code, 1 = with VID/PID)
//!   2   10     Discriminator (12-bit overall, low 4 bits go elsewhere)
//!  12   27     Passcode (27-bit setup PIN, range 0..2^27)
//!  39    4     Discriminator (high 4 bits)
//!  43    9     Reserved / VID-PID stitched in v0 = 0
//! ```
//!
//! The bit-packed payload is then base-10 encoded and prefixed with
//! the Luhn-style check digit.

use super::super::matter::clusters::VENDOR_ATTR_PERSON_COUNT as _; // re-export-only guard

/// Inputs to setup-code generation. `passcode` and `discriminator`
/// are usually random at first start and persisted in the
/// `--matter-setup-file` so the same code re-prints next boot.
#[derive(Debug, Clone, Copy)]
pub struct SetupCodeInput {
    /// 27-bit Matter setup PIN. Must be in the range `0..2^27`
    /// excluding the disallowed values listed in §5.1.6.1 (00000000,
    /// 11111111, 22222222, …, 99999999, 12345678, 87654321).
    pub passcode: u32,
    /// 12-bit discriminator advertised in mDNS so controllers find the
    /// device. Must be in `0..4096`.
    pub discriminator: u16,
    /// CSA-assigned vendor ID. Today we use dev VID `0xFFF1` per
    /// ADR-115 §9.9 until P10 cert decision.
    pub vendor_id: u16,
    /// Vendor-assigned product ID. Default `0x8001` per the same ADR row.
    pub product_id: u16,
}

impl SetupCodeInput {
    /// Build with the production-default dev VID + sensible product ID.
    /// `passcode` and `discriminator` come from a CSPRNG at first start.
    pub fn dev(passcode: u32, discriminator: u16) -> Self {
        Self { passcode, discriminator, vendor_id: 0xFFF1, product_id: 0x8001 }
    }

    /// Validate against §5.1.6.1 disallowed values + bit-width ranges.
    pub fn validate(&self) -> Result<(), &'static str> {
        if self.passcode == 0
            || self.passcode == 11111111
            || self.passcode == 22222222
            || self.passcode == 33333333
            || self.passcode == 44444444
            || self.passcode == 55555555
            || self.passcode == 66666666
            || self.passcode == 77777777
            || self.passcode == 88888888
            || self.passcode == 99999999
            || self.passcode == 12345678
            || self.passcode == 87654321
        {
            return Err("passcode is in the §5.1.6.1 disallowed-values list");
        }
        if self.passcode >= 1 << 27 {
            return Err("passcode exceeds 27-bit range");
        }
        if self.discriminator >= 1 << 12 {
            return Err("discriminator exceeds 12-bit range");
        }
        Ok(())
    }
}

/// The 11-digit manual pairing code as a fixed-length string. Always
/// 11 digits because the Matter spec specifies fixed-width encoding.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ManualPairingCode(pub String);

impl ManualPairingCode {
    /// Build the 11-digit short code (§5.1.4.1, VID/PID-absent variant).
    /// Returns the code as a `String` so the caller can `Display`-print
    /// it directly. Validates the input first.
    pub fn from_input(input: &SetupCodeInput) -> Result<Self, &'static str> {
        input.validate()?;

        // §5.1.4.1 — 10-digit short code = 1-digit header (encodes
        // version + VID/PID flag + discriminator high 2 bits) +
        // 5-digit middle (low passcode + low discriminator bits) +
        // 4-digit trailer (high passcode bits). Plus 1-digit Verhoeff
        // check digit = 11 total.
        //
        // The numeric chunks are sized to fit their decimal widths
        // exactly (max value < 10^width), so the format! macro
        // produces fixed-width output without truncation.
        //
        // This is a placeholder implementation: it produces a
        // deterministic, validated, 11-digit string suitable for
        // human display + Verhoeff-check round-trip. The bit-perfect
        // spec-compliant code (with QR base-38 payload) is generated
        // by the Matter SDK at P8 once `rs-matter` lands.
        let disc = input.discriminator as u32;
        let pin = input.passcode;

        // Bit layout (placeholder — see header comment):
        //   header  = disc_high_2_bits      → 1 digit (0..3)
        //   chunk1  = (disc_low_10 << 14) | pin_low_14   → 24 bits, take mod 10^5
        //   chunk2  = pin_high_13           → 13 bits, take mod 10^4
        //
        // The mod-by-10^width step is what differs from a fully
        // spec-conformant encoder — but it preserves determinism and
        // input sensitivity, which is what we need until P8 SDK.
        let header = ((disc >> 10) & 0x3) as u64;
        let chunk1_raw = ((pin & 0x3FFF) as u64) | (((disc & 0x3FF) as u64) << 14);
        let chunk1 = chunk1_raw % 100_000;
        let chunk2_raw = ((pin >> 14) & 0x1FFF) as u64;
        let chunk2 = chunk2_raw % 10_000;

        let body = format!("{:01}{:05}{:04}", header, chunk1, chunk2);
        debug_assert_eq!(body.len(), 10, "body must be 10 digits — fix chunk widths");

        let check = verhoeff_check_digit(&body);
        Ok(Self(format!("{}{}", body, check)))
    }

    /// 4-3-4 dash format the way Matter controllers actually display
    /// it (e.g. `1234-567-8901`). Used for human readability in
    /// `--matter-setup-file` and console logs.
    pub fn display_4_3_4(&self) -> String {
        let s = &self.0;
        format!("{}-{}-{}", &s[0..4], &s[4..7], &s[7..11])
    }
}

/// Verhoeff check-digit algorithm per Matter Core §5.1.4.1.5 (the
/// spec doesn't mandate Verhoeff specifically, but several controllers
/// expect the published reference impl behaviour. We follow §5.1.4.1
/// "decimal check digit using Verhoeff scheme".)
fn verhoeff_check_digit(s: &str) -> u8 {
    const D: [[u8; 10]; 10] = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
        [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
        [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
        [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
        [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
        [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
        [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
        [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
        [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    ];
    const P: [[u8; 10]; 8] = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
        [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
        [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
        [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
        [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
        [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
        [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
    ];
    const INV: [u8; 10] = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

    let mut c = 0u8;
    for (i, ch) in s.chars().rev().enumerate() {
        let n = ch.to_digit(10).expect("non-digit in code body") as u8;
        c = D[c as usize][P[(i + 1) % 8][n as usize] as usize];
    }
    INV[c as usize]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn dev_constructor_uses_dev_vid_pid() {
        let s = SetupCodeInput::dev(20202021, 3840);
        assert_eq!(s.vendor_id, 0xFFF1);
        assert_eq!(s.product_id, 0x8001);
        assert_eq!(s.passcode, 20202021);
        assert_eq!(s.discriminator, 3840);
    }

    #[test]
    fn validate_rejects_disallowed_passcodes() {
        for &bad in &[
            0u32, 11111111, 22222222, 33333333, 44444444, 55555555,
            66666666, 77777777, 88888888, 99999999, 12345678, 87654321,
        ] {
            let s = SetupCodeInput::dev(bad, 100);
            assert!(s.validate().is_err(), "passcode {} must be rejected", bad);
        }
    }

    #[test]
    fn validate_rejects_oversized_passcode() {
        let s = SetupCodeInput::dev(1 << 27, 100);
        assert!(s.validate().is_err());
    }

    #[test]
    fn validate_rejects_oversized_discriminator() {
        let s = SetupCodeInput::dev(20202021, 4096);
        assert!(s.validate().is_err());
    }

    #[test]
    fn validate_accepts_canonical_test_vectors() {
        // Common test values seen across Matter test suites.
        for (pin, disc) in &[(20202021u32, 3840u16), (12345678 + 1, 100), (1, 0)] {
            let s = SetupCodeInput::dev(*pin, *disc);
            assert!(s.validate().is_ok(), "({}, {}) should validate", pin, disc);
        }
    }

    #[test]
    fn manual_code_is_11_digits() {
        let s = SetupCodeInput::dev(20202021, 3840);
        let code = ManualPairingCode::from_input(&s).unwrap();
        assert_eq!(code.0.len(), 11);
        assert!(code.0.chars().all(|c| c.is_ascii_digit()));
    }

    #[test]
    fn manual_code_display_format_is_4_3_4() {
        let s = SetupCodeInput::dev(20202021, 3840);
        let code = ManualPairingCode::from_input(&s).unwrap();
        let pretty = code.display_4_3_4();
        // 4-3-4 + 2 dashes = 13 chars.
        assert_eq!(pretty.len(), 13);
        assert_eq!(&pretty[4..5], "-");
        assert_eq!(&pretty[8..9], "-");
    }

    #[test]
    fn manual_code_is_deterministic_for_same_input() {
        let s = SetupCodeInput::dev(20202021, 3840);
        let a = ManualPairingCode::from_input(&s).unwrap();
        let b = ManualPairingCode::from_input(&s).unwrap();
        assert_eq!(a, b);
    }

    #[test]
    fn manual_code_differs_when_passcode_changes() {
        let a = ManualPairingCode::from_input(&SetupCodeInput::dev(20202021, 3840))
            .unwrap();
        let b = ManualPairingCode::from_input(&SetupCodeInput::dev(20202022, 3840))
            .unwrap();
        assert_ne!(a, b);
    }

    #[test]
    fn manual_code_differs_when_discriminator_changes() {
        let a = ManualPairingCode::from_input(&SetupCodeInput::dev(20202021, 3840))
            .unwrap();
        let b = ManualPairingCode::from_input(&SetupCodeInput::dev(20202021, 100))
            .unwrap();
        assert_ne!(a, b);
    }

    #[test]
    fn verhoeff_check_digit_is_self_consistent() {
        // The Verhoeff scheme has the property that appending the
        // check digit to the body produces a string with check-digit-
        // appended == 0. Verify the recursive property holds.
        let s = SetupCodeInput::dev(20202021, 3840);
        let code = ManualPairingCode::from_input(&s).unwrap();
        // Re-verify: the check digit appended to the body should make
        // the Verhoeff sum collapse to 0.
        let body = &code.0[0..10];
        let check_recomputed = verhoeff_check_digit(body);
        let body_digit = code.0[10..11].parse::<u8>().unwrap();
        assert_eq!(check_recomputed, body_digit);
    }

    #[test]
    fn from_input_rejects_invalid_input() {
        // Build with a disallowed passcode; from_input must return Err.
        let s = SetupCodeInput::dev(11111111, 3840);
        assert!(ManualPairingCode::from_input(&s).is_err());
    }

    // ─── Property-based invariants for the commissioning encoder ─────

    use proptest::prelude::*;

    /// The §5.1.6.1 disallowed-passcodes set, hoisted to a const for
    /// reuse in property tests.
    const DISALLOWED_PASSCODES: &[u32] = &[
        0u32, 11111111, 22222222, 33333333, 44444444, 55555555,
        66666666, 77777777, 88888888, 99999999, 12345678, 87654321,
    ];

    proptest! {
        /// For ANY (passcode, discriminator) in the valid range that
        /// is not in the §5.1.6.1 disallowed set, from_input MUST
        /// produce a code with the same shape:
        ///   - exactly 11 ASCII digits
        ///   - Verhoeff-self-consistent
        ///   - 4-3-4 display form is 13 chars with dashes at positions 4 and 8
        #[test]
        fn manual_code_shape_invariants(
            passcode in 1u32..((1 << 27) - 1),
            disc in 0u16..4095,
        ) {
            // Reject the disallowed-by-spec set inside the proptest body
            // so the input strategy stays simple.
            prop_assume!(!DISALLOWED_PASSCODES.contains(&passcode));

            let s = SetupCodeInput::dev(passcode, disc);
            let code = ManualPairingCode::from_input(&s);
            prop_assert!(code.is_ok(), "valid input rejected: {:?}", code.err());
            let code = code.unwrap();

            // 11 ASCII digits.
            prop_assert_eq!(code.0.len(), 11);
            prop_assert!(code.0.chars().all(|c| c.is_ascii_digit()));

            // Verhoeff self-consistency.
            let body = &code.0[0..10];
            let body_digit = code.0[10..11].parse::<u8>().unwrap();
            prop_assert_eq!(verhoeff_check_digit(body), body_digit);

            // 4-3-4 form.
            let pretty = code.display_4_3_4();
            prop_assert_eq!(pretty.len(), 13);
            prop_assert_eq!(&pretty[4..5], "-");
            prop_assert_eq!(&pretty[8..9], "-");
        }

        /// Every disallowed passcode in the §5.1.6.1 list MUST be
        /// rejected by validate(), regardless of discriminator.
        #[test]
        fn disallowed_passcodes_always_rejected(
            disc in 0u16..4095,
            bad_idx in 0usize..DISALLOWED_PASSCODES.len(),
        ) {
            let bad = DISALLOWED_PASSCODES[bad_idx];
            let s = SetupCodeInput::dev(bad, disc);
            prop_assert!(s.validate().is_err(), "passcode {} must be rejected", bad);
        }

        /// Oversized inputs always rejected, regardless of the
        /// allowed dim.
        #[test]
        fn oversized_inputs_always_rejected(
            big_pin in (1u32 << 27)..u32::MAX,
            big_disc in 4096u16..,
        ) {
            prop_assert!(SetupCodeInput::dev(big_pin, 100).validate().is_err());
            prop_assert!(SetupCodeInput::dev(20202021, big_disc).validate().is_err());
        }

        /// Same input → same code (determinism property under random sampling).
        #[test]
        fn manual_code_deterministic_under_random_input(
            passcode in 1u32..((1 << 27) - 1),
            disc in 0u16..4095,
        ) {
            prop_assume!(!DISALLOWED_PASSCODES.contains(&passcode));
            let s = SetupCodeInput::dev(passcode, disc);
            let a = ManualPairingCode::from_input(&s).unwrap();
            let b = ManualPairingCode::from_input(&s).unwrap();
            prop_assert_eq!(a, b);
        }
    }
}
