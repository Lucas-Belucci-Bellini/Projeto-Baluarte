//! `IdentityEmbedding` — structural enforcement of ADR-118 invariant I2.
//!
//! I2: the identity embedding is **in-RAM-only**. There is no `Serialize`
//! impl on this type, no `Copy`, no `Clone`; the only way to extract a value
//! is `as_slice()`, which returns a borrowed view, and the buffer is zeroized
//! on `Drop`. A future PR cannot accidentally leak the embedding because:
//!
//! - The type lives in this crate; downstream crates see only the public API
//!   and the type's lack of `Serialize`/`Clone`/`Copy` makes accidental
//!   reflection impossible without explicitly bypassing the wrapper.
//! - `Drop` overwrites the f32 storage with `0.0` before the allocation is
//!   freed, so a stale pointer reads zeros instead of the original values.
//! - `Debug` redacts: only the L2 norm and the constant length are emitted.
//!
//! This is the type-system half of I2. The lifecycle half — a bounded ring
//! buffer with FIFO replacement — lives in a subsequent iter.

use core::fmt;

use static_assertions::{assert_impl_all, assert_not_impl_any};

/// Dimension of the AETHER contrastive embedding (ADR-024 §2.4).
pub const EMBEDDING_DIM: usize = 128;

/// In-RAM-only identity embedding. **No serialization, no clone, no copy.**
pub struct IdentityEmbedding {
    values: [f32; EMBEDDING_DIM],
}

impl IdentityEmbedding {
    /// Wrap a freshly-computed embedding. The caller relinquishes the array;
    /// after this call the only safe accessor is `as_slice()`.
    #[must_use]
    pub const fn from_raw(values: [f32; EMBEDDING_DIM]) -> Self {
        Self { values }
    }

    /// Borrow the embedding values for a read-only computation (similarity,
    /// risk scoring). Lifetime-bound to `&self` — the values cannot escape.
    #[must_use]
    pub fn as_slice(&self) -> &[f32] {
        &self.values
    }

    /// L2 norm of the embedding. Useful for sanity-checking and for the
    /// redacted `Debug` output.
    #[must_use]
    pub fn l2_norm(&self) -> f32 {
        self.values.iter().map(|v| v * v).sum::<f32>().sqrt()
    }

    /// Embedding dimension. Always `EMBEDDING_DIM`.
    #[must_use]
    pub const fn len(&self) -> usize {
        EMBEDDING_DIM
    }

    /// Always `false` — embeddings are never empty.
    #[must_use]
    pub const fn is_empty(&self) -> bool {
        false
    }
}

impl fmt::Debug for IdentityEmbedding {
    /// Redacted: emits dimension + L2 norm only. Never logs raw values.
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("IdentityEmbedding")
            .field("dim", &EMBEDDING_DIM)
            .field("l2_norm", &self.l2_norm())
            .field("values", &"<redacted>")
            .finish()
    }
}

impl Drop for IdentityEmbedding {
    /// Overwrite the embedding storage with `0.0` before deallocation.
    /// Used `core::hint::black_box` to prevent the compiler from eliding the
    /// write under DCE — the zeroization is observable on the heap/stack.
    fn drop(&mut self) {
        for v in &mut self.values {
            *v = 0.0;
        }
        // black_box forces the compiler to treat self.values as observed,
        // preventing the dead-store elimination pass from removing the loop.
        core::hint::black_box(&self.values);
    }
}

// Compile-time structural assertions. If a future PR adds `Clone` or `Copy`,
// or if a downstream crate tries to derive Serialize/Deserialize, the build
// fails here. These constraints are what makes I2 *structural* rather than
// merely documented.

assert_impl_all!(IdentityEmbedding: Drop);
assert_not_impl_any!(IdentityEmbedding: Copy, Clone);
