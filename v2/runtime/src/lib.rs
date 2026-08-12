//! Baluarte V2 — Core de Runtime local.
//!
//! O Runtime é a fronteira de confiança para operações que não devem ser
//! executadas diretamente pelo Core de Orquestração no navegador.

use std::fs;
use std::path::{Component, Path, PathBuf};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Capability {
    ReadFiles,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RuntimeState {
    Running,
    Stopped,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RuntimeError {
    CapabilityDenied(Capability),
    RuntimeStopped,
    InvalidPath,
    PathOutsideRoot,
    NotAFile,
    Io(String),
}

impl std::fmt::Display for RuntimeError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::CapabilityDenied(cap) => write!(f, "capacidade negada: {cap:?}"),
            Self::RuntimeStopped => write!(f, "runtime está parado"),
            Self::InvalidPath => write!(f, "caminho inválido para uma operação confinada"),
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
        let relative = relative.as_ref();

        // O contrato aceita apenas caminhos relativos. Isto evita que uma
        // string absoluta substitua a raiz autorizada antes do confinamento.
        if relative.is_absolute()
            || relative.components().any(|component| {
                matches!(component, Component::RootDir | Component::Prefix(_))
            })
        {
            return Err(RuntimeError::InvalidPath);
        }

        let root = fs::canonicalize(&self.root)
            .map_err(|e| RuntimeError::Io(e.to_string()))?;
        let candidate = root.join(relative);
        let resolved = fs::canonicalize(&candidate)
            .map_err(|e| RuntimeError::Io(e.to_string()))?;

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
    state: RuntimeState,
}

impl Runtime {
    /// Um Runtime recém-criado está pronto para receber operações.
    pub fn new(policy: RuntimePolicy) -> Self {
        Self {
            policy,
            state: RuntimeState::Running,
        }
    }

    pub fn state(&self) -> RuntimeState {
        self.state
    }

    pub fn start(&mut self) {
        self.state = RuntimeState::Running;
    }

    pub fn stop(&mut self) {
        self.state = RuntimeState::Stopped;
    }

    pub fn read_file(&self, relative: impl AsRef<Path>) -> Result<Vec<u8>, RuntimeError> {
        if self.state != RuntimeState::Running {
            return Err(RuntimeError::RuntimeStopped);
        }
        if !self.policy.allows(Capability::ReadFiles) {
            return Err(RuntimeError::CapabilityDenied(Capability::ReadFiles));
        }
        let path = self.policy.confined_file(relative)?;
        fs::read(path).map_err(|e| RuntimeError::Io(e.to_string()))
    }
}

/// Primeiro contrato lógico da fronteira Runtime ↔ Orquestração.
///
/// O transporte permanece deliberadamente indefinido nesta fase. Tauri/IPC
/// só deve ser escolhido quando o contrato estiver estável.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RuntimeRequest {
    ReadFile { path: String },
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RuntimeResponse {
    FileContents(Vec<u8>),
    Error(RuntimeError),
}

impl Runtime {
    pub fn handle(&self, request: RuntimeRequest) -> RuntimeResponse {
        match request {
            RuntimeRequest::ReadFile { path } => match self.read_file(path) {
                Ok(contents) => RuntimeResponse::FileContents(contents),
                Err(error) => RuntimeResponse::Error(error),
            },
        }
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
    fn new_runtime_starts_running() {
        let (_dir, root) = fixture();
        let runtime = Runtime::new(RuntimePolicy::new(root, [Capability::ReadFiles]));
        assert_eq!(runtime.state(), RuntimeState::Running);
    }

    #[test]
    fn stopped_runtime_rejects_requests() {
        let (_dir, root) = fixture();
        let mut runtime = Runtime::new(RuntimePolicy::new(root, [Capability::ReadFiles]));
        runtime.stop();
        assert_eq!(runtime.state(), RuntimeState::Stopped);
        assert_eq!(runtime.read_file("hello.txt"), Err(RuntimeError::RuntimeStopped));
    }

    #[test]
    fn runtime_can_start_again_after_stop() {
        let (_dir, root) = fixture();
        let mut runtime = Runtime::new(RuntimePolicy::new(root, [Capability::ReadFiles]));
        runtime.stop();
        runtime.start();
        assert_eq!(runtime.read_file("hello.txt").unwrap(), b"baluarte");
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
        assert!(matches!(
            runtime.read_file("../outside.txt"),
            Err(RuntimeError::PathOutsideRoot)
        ));
    }

    #[test]
    fn rejects_absolute_path() {
        let (_dir, root) = fixture();
        let runtime = Runtime::new(RuntimePolicy::new(root, [Capability::ReadFiles]));
        assert_eq!(
            runtime.read_file("/etc/passwd"),
            Err(RuntimeError::InvalidPath)
        );
    }

    #[test]
    fn handle_maps_success_to_contract_response() {
        let (_dir, root) = fixture();
        let runtime = Runtime::new(RuntimePolicy::new(root, [Capability::ReadFiles]));
        assert_eq!(
            runtime.handle(RuntimeRequest::ReadFile { path: "hello.txt".into() }),
            RuntimeResponse::FileContents(b"baluarte".to_vec())
        );
    }

    #[test]
    fn handle_maps_denial_to_contract_response() {
        let (_dir, root) = fixture();
        let runtime = Runtime::new(RuntimePolicy::new(root, []));
        assert_eq!(
            runtime.handle(RuntimeRequest::ReadFile { path: "hello.txt".into() }),
            RuntimeResponse::Error(RuntimeError::CapabilityDenied(Capability::ReadFiles))
        );
    }

    #[test]
    fn handle_maps_stopped_state_to_contract_response() {
        let (_dir, root) = fixture();
        let mut runtime = Runtime::new(RuntimePolicy::new(root, [Capability::ReadFiles]));
        runtime.stop();
        assert_eq!(
            runtime.handle(RuntimeRequest::ReadFile { path: "hello.txt".into() }),
            RuntimeResponse::Error(RuntimeError::RuntimeStopped)
        );
    }
}
