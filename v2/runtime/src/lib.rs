//! Baluarte V2 — Core de Runtime local.
//!
//! Esta crate é deliberadamente pequena no primeiro corte. Ela estabelece a
//! fronteira que o Core de Orquestração (TypeScript/browser) poderá consumir:
//! capacidades são dados explícitos, e acesso a filesystem é confinado a uma
//! raiz autorizada. Não há execução de processos, rede ou secrets nesta etapa.

use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Capability {
    ReadFiles,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RuntimeError {
    CapabilityDenied(Capability),
    PathOutsideRoot,
    NotAFile,
    Io(String),
}

impl std::fmt::Display for RuntimeError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::CapabilityDenied(cap) => write!(f, "capacidade negada: {cap:?}"),
            Self::PathOutsideRoot => write!(f, "caminho fora da raiz autorizada"),
            Self::NotAFile => write!(f, "o caminho autorizado não é um arquivo"),
            Self::Io(message) => write!(f, "erro de I/O: {message}"),
        }
    }
}

impl std::error::Error for RuntimeError {}

#[derive(Debug, Clone)]
pub struct RuntimePolicy {
    root: PathBuf,
    capabilities: Vec<Capability>,
}

impl RuntimePolicy {
    pub fn new(root: impl Into<PathBuf>, capabilities: impl IntoIterator<Item = Capability>) -> Self {
        Self {
            root: root.into(),
            capabilities: capabilities.into_iter().collect(),
        }
    }

    fn allows(&self, capability: Capability) -> bool {
        self.capabilities.contains(&capability)
    }

    fn confined_file(&self, relative: impl AsRef<Path>) -> Result<PathBuf, RuntimeError> {
        let root = fs::canonicalize(&self.root).map_err(|e| RuntimeError::Io(e.to_string()))?;
        let candidate = root.join(relative.as_ref());
        let resolved = fs::canonicalize(&candidate).map_err(|e| RuntimeError::Io(e.to_string()))?;

        if !resolved.starts_with(&root) {
            return Err(RuntimeError::PathOutsideRoot);
        }
        if !resolved.is_file() {
            return Err(RuntimeError::NotAFile);
        }
        Ok(resolved)
    }
}

#[derive(Debug, Clone)]
pub struct Runtime {
    policy: RuntimePolicy,
}

impl Runtime {
    pub fn new(policy: RuntimePolicy) -> Self {
        Self { policy }
    }

    pub fn read_file(&self, relative: impl AsRef<Path>) -> Result<Vec<u8>, RuntimeError> {
        if !self.policy.allows(Capability::ReadFiles) {
            return Err(RuntimeError::CapabilityDenied(Capability::ReadFiles));
        }
        let path = self.policy.confined_file(relative)?;
        fs::read(path).map_err(|e| RuntimeError::Io(e.to_string()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    fn fixture() -> (tempfile::TempDir, PathBuf) {
        let dir = tempfile::tempdir().expect("tempdir");
        let root = dir.path().join("allowed");
        fs::create_dir(&root).expect("allowed dir");
        fs::write(root.join("hello.txt"), b"baluarte").expect("fixture file");
        (dir, root)
    }

    #[test]
    fn reads_file_inside_authorized_root() {
        let (_dir, root) = fixture();
        let runtime = Runtime::new(RuntimePolicy::new(root, [Capability::ReadFiles]));
        assert_eq!(runtime.read_file("hello.txt").unwrap(), b"baluarte");
    }

    #[test]
    fn denies_read_without_capability() {
        let (_dir, root) = fixture();
        let runtime = Runtime::new(RuntimePolicy::new(root, []));
        assert_eq!(
            runtime.read_file("hello.txt"),
            Err(RuntimeError::CapabilityDenied(Capability::ReadFiles))
        );
    }

    #[test]
    fn rejects_path_escape() {
        let (_dir, root) = fixture();
        fs::write(_dir.path().join("outside.txt"), b"fora").expect("outside fixture");
        let runtime = Runtime::new(RuntimePolicy::new(root, [Capability::ReadFiles]));
        assert!(matches!(runtime.read_file("../outside.txt"), Err(RuntimeError::PathOutsideRoot)));
    }
}
