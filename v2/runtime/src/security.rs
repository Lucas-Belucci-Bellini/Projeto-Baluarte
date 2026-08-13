//! Invariantes de segurança do limite de confiança do Runtime.
//!
//! IDs de módulo são identificadores lógicos, nunca caminhos fornecidos pelo
//! chamador. O Runtime valida o ID antes de transformá-lo em diretório.

pub fn valid_module_id(id: &str) -> bool {
    if id.is_empty() || id == "." || id == ".." || id.contains('\0') {
        return false;
    }
    if id.contains('/') || id.contains('\\') {
        return false;
    }
    id.bytes().all(|b| b.is_ascii_alphanumeric() || matches!(b, b'-' | b'_'))
}

#[cfg(test)]
mod tests {
    use super::valid_module_id;

    #[test]
    fn accepts_logical_identifiers() {
        assert!(valid_module_id("alpha"));
        assert!(valid_module_id("module-01"));
        assert!(valid_module_id("module_core"));
    }

    #[test]
    fn rejects_path_syntax() {
        for id in ["", ".", "..", "../alpha", "alpha/beta", r"alpha\\beta", "alpha\0beta"] {
            assert!(!valid_module_id(id), "ID deveria ser rejeitado: {id:?}");
        }
    }

    #[test]
    fn rejects_non_ascii_or_shell_like_identifiers() {
        assert!(!valid_module_id("área"));
        assert!(!valid_module_id("alpha beta"));
        assert!(!valid_module_id("alpha$beta"));
    }
}
