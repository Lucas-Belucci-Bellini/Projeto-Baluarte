//! BFLD payload section parser. See ADR-119 §2.2.
//!
//! The payload is a length-prefixed sequence of typed sections in this fixed
//! order:
//!
//! ```text
//! payload = compressed_angle_matrix
//!         ‖ amplitude_proxy
//!         ‖ phase_proxy
//!         ‖ snr_vector
//!         ‖ csi_delta            (present iff flags.bit0 set)
//!         ‖ vendor_extension     (length 0 allowed)
//! ```
//!
//! Each section is encoded as `[u32 len_le][bytes...]`. Vendor extension is
//! always present in the wire form (length may be zero); CSI delta is gated by
//! the header `flags::HAS_CSI_DELTA` bit and is omitted entirely when off.
//!
//! Gated on `std` because the parser hands the caller owned `Vec<u8>` sections.
//! A future zero-copy `BfldPayloadRef<'_>` variant will land alongside the
//! ESP32-S3 self-only adapter (ADR-123 §2.5).

#![cfg(feature = "std")]

use crate::BfldError;

/// Length-prefix size in bytes for each section.
pub const SECTION_PREFIX_LEN: usize = 4;

/// Parsed payload sections.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct BfldPayload {
    /// Compressed beamforming angle matrix (Φ/ψ Givens rotations).
    pub compressed_angle_matrix: Vec<u8>,
    /// Per-subcarrier amplitude proxy.
    pub amplitude_proxy: Vec<u8>,
    /// Per-subcarrier phase proxy.
    pub phase_proxy: Vec<u8>,
    /// Per-subcarrier SNR vector.
    pub snr_vector: Vec<u8>,
    /// Optional CSI delta fusion section (present iff header `flags.bit0` set).
    pub csi_delta: Option<Vec<u8>>,
    /// Vendor-extension bytes outside the witness hash. Length 0 is permitted.
    pub vendor_extension: Vec<u8>,
}

impl BfldPayload {
    /// Serialize to canonical wire form.
    ///
    /// `include_csi_delta` must match the header `flags::HAS_CSI_DELTA` bit
    /// the resulting payload will be paired with. When `true`, the `csi_delta`
    /// section is emitted (using an empty section if `self.csi_delta` is `None`).
    /// When `false`, the section is omitted entirely.
    #[must_use]
    pub fn to_bytes(&self, include_csi_delta: bool) -> Vec<u8> {
        let mut out = Vec::with_capacity(self.wire_len(include_csi_delta));
        push_section(&mut out, &self.compressed_angle_matrix);
        push_section(&mut out, &self.amplitude_proxy);
        push_section(&mut out, &self.phase_proxy);
        push_section(&mut out, &self.snr_vector);
        if include_csi_delta {
            let csi = self.csi_delta.as_deref().unwrap_or(&[]);
            push_section(&mut out, csi);
        }
        push_section(&mut out, &self.vendor_extension);
        out
    }

    /// Predict the wire size of a future `to_bytes` call without serializing.
    #[must_use]
    pub fn wire_len(&self, include_csi_delta: bool) -> usize {
        let mut n = SECTION_PREFIX_LEN * 5 // 4 mandatory + vendor
            + self.compressed_angle_matrix.len()
            + self.amplitude_proxy.len()
            + self.phase_proxy.len()
            + self.snr_vector.len()
            + self.vendor_extension.len();
        if include_csi_delta {
            n += SECTION_PREFIX_LEN + self.csi_delta.as_deref().map_or(0, <[u8]>::len);
        }
        n
    }

    /// Parse from canonical wire form.
    ///
    /// `expect_csi_delta` must reflect the paired header's `flags::HAS_CSI_DELTA`
    /// bit. Returns `MalformedSection` if a section length runs past the buffer
    /// end, or if trailing bytes remain after the vendor-extension section.
    pub fn from_bytes(bytes: &[u8], expect_csi_delta: bool) -> Result<Self, BfldError> {
        let mut cursor = 0usize;
        let compressed_angle_matrix = read_section(bytes, &mut cursor)?;
        let amplitude_proxy = read_section(bytes, &mut cursor)?;
        let phase_proxy = read_section(bytes, &mut cursor)?;
        let snr_vector = read_section(bytes, &mut cursor)?;
        let csi_delta = if expect_csi_delta {
            Some(read_section(bytes, &mut cursor)?)
        } else {
            None
        };
        let vendor_extension = read_section(bytes, &mut cursor)?;

        if cursor != bytes.len() {
            return Err(BfldError::MalformedSection {
                offset: cursor,
                reason: "trailing bytes after vendor_extension",
            });
        }
        Ok(Self {
            compressed_angle_matrix,
            amplitude_proxy,
            phase_proxy,
            snr_vector,
            csi_delta,
            vendor_extension,
        })
    }
}

fn push_section(out: &mut Vec<u8>, bytes: &[u8]) {
    let len = u32::try_from(bytes.len()).unwrap_or(u32::MAX);
    out.extend_from_slice(&len.to_le_bytes());
    out.extend_from_slice(bytes);
}

fn read_section(bytes: &[u8], cursor: &mut usize) -> Result<Vec<u8>, BfldError> {
    let start = *cursor;
    if start + SECTION_PREFIX_LEN > bytes.len() {
        return Err(BfldError::MalformedSection {
            offset: start,
            reason: "section length prefix runs past buffer end",
        });
    }
    let len_bytes: [u8; 4] = bytes[start..start + SECTION_PREFIX_LEN].try_into().unwrap();
    let len = u32::from_le_bytes(len_bytes) as usize;
    let data_start = start + SECTION_PREFIX_LEN;
    let data_end = data_start
        .checked_add(len)
        .ok_or(BfldError::MalformedSection {
            offset: start,
            reason: "section length overflows usize",
        })?;
    if data_end > bytes.len() {
        return Err(BfldError::MalformedSection {
            offset: start,
            reason: "section body runs past buffer end",
        });
    }
    *cursor = data_end;
    Ok(bytes[data_start..data_end].to_vec())
}
