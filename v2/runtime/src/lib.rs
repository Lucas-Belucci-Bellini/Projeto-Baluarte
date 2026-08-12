//! Baluarte V2 — Core de Runtime local.
//!
//! O Runtime é a fronteira de confiança para operações que não devem ser
//! executadas diretamente pelo Core de Orquestração no navegador.

use std::fs;
use std::path::{Component, Path, PathBuf};
use std::str::FromStr;

/// Capacidades reconhecidas pelo contrato V2.
///
/// Só `ReadFiles` possui operação implementada neste corte. As demais existem
/// como vocabulário estável do contrato de autorização, não como autorização
/// implícita nem como funcionalidades já disponíveis.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Capability {
    ReadFiles,
    WriteFiles,
    Network,
    Database,
    SystemInfo,
    UserData,
    Execution,
}

impl Capability {
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::ReadFiles => "READ_FILES",
            Self::WriteFiles => "WRITE_FILES",
            Self::Network => "NETWORK",
            Self::Database => "DATABASE",
            Self::SystemInfo => "SYSTEM_INFO",
            Self::UserData => "USER_DATA",
            Self::Execution => "EXECUTION",
        }
    }

    pub const fn implemented(self) -> bool {
        matches!(self, Self::ReadFiles)
    }
}

impl FromStr for Capability {
    type Err = UnknownCapability;

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        match value {
            "READ_FILES" => Ok(Self::ReadFiles),
            "WRITE_FILES" => Ok(Self::WriteFiles),
            "NETWORK" => Ok(Self::Network),
            "DATABASE" => Ok(Self::Database),
            "SYSTEM_INFO" => Ok(Self::SystemInfo),
            "USER_DATA" => Ok(Self::UserData),
            "EXECUTION" => Ok(Self::Execution),
            _ => Err(UnknownCapability(value.to_owned())),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct UnknownCapability(pub String);

impl std::fmt::Display for UnknownCapability {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "capacidade desconhecida: {}", self.0)
    }
}

impl std::error::Error for UnknownCapability {}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RuntimeState {
    Running,
    Stopped,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RuntimeError {
    CapabilityDenied(Capability),
    CapabilityNotImplemented(Capability),
    RuntimeStopped,
    InvalidPath,
    PathOutsideRoot,
    NotAFile,
    Io(String),
}

impl std::fmt::Display for RuntimeError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::CapabilityDenied(cap) => write!(f, "capacidade negada: {}", cap.as_str()),
            Self::CapabilityNotImplemented(cap) => {
                write!(f, "capacidade ainda não implementada: {}", cap.as_str())
            }
            Self::RuntimeStopped => write!(f, "runtime está parado"),
            Self::InvalidPath => write!(f, "caminho inválido para uma operação confinada"),
            Self::PathOutsideRoot => write!(f, "caminho fora da raiz autorizada"),
            Self::NotAFile => write!(f, "o caminho autorizado não é um arquivo"),
            Self::Io(message) => write!(f, "erro de I/O: {message}"),
        }
    }
}

impl std::error::Error for RuntimeError {}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RuntimePolicyError {
    pub unknown: Vec<String>,
}

impl std::fmt::Display for RuntimePolicyError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "capacidades desconhecidas: {}", self.unknown.join(", "))
    }
}

impl std::error::Error for RuntimePolicyError {}

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

    /// Constrói a política a partir dos nomes que virão do manifesto do módulo.
    /// Nomes desconhecidos são rejeitados; o Runtime nunca ignora silenciosamente
    /// uma permissão escrita pelo consumidor.
    pub fn from_names(
        root: impl Into<PathBuf>,
        names: impl IntoIterator<Item = impl AsRef<str>>,
    ) -> Result<Self, RuntimePolicyError> {
        let mut capabilities = Vec::new();
        let mut unknown = Vec::new();
        for name in names {
            match Capability::from_str(name.as_ref()) {
                Ok(capability) if !capabilities.contains(&capability) => capabilities.push(capability),
                Ok(_) => {}
                Err(_) => unknown.push(name.as_ref().to_owned()),
            }
        }
        if !unknown.is_empty() {
            return Err(RuntimePolicyError { unknown });
        }
        Ok(Self::new(root, capabilities))
    }

    pub fn has(&self, capability: Capability) -> bool {
        self.capabilities.contains(&capability)
    }

    fn allows(&self, capability: Capability) -> bool {
        self.has(capability)
    }

    fn confined_file(&self, relative: impl AsRef<Path>) -> Result<PathBuf, RuntimeError> {
        let relative = relative.as_ref();
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
    pub fn new(policy: RuntimePolicy) -> Self {
        Self { policy, state: RuntimeState::Running }
    }

    pub fn state(&self) -> RuntimeState { self.state }
    pub fn start(&mut self) { self.state = RuntimeState::Running; }
    pub fn stop(&mut self) { self.state = RuntimeState::Stopped; }

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
    fn capability_names_are_stable_and_round_trip() {
        let all = [
            Capability::ReadFiles, Capability::WriteFiles, Capability::Network,
            Capability::Database, Capability::SystemInfo, Capability::UserData,
            Capability::Execution,
        ];
        for capability in all {
            assert_eq!(Capability::from_str(capability.as_str()).unwrap(), capability);
        }
        assert!(Capability::ReadFiles.implemented());
        assert!(!Capability::Execution.implemented());
    }

    #[test]
    fn unknown_capability_is_rejected() {
        let (_dir, root) = fixture();
        let error = RuntimePolicy::from_names(root, ["READ_FILES", "MAGIC_ROOT"]).unwrap_err();
        assert_eq!(error.unknown, vec!["MAGIC_ROOT"]);
    }

    #[test]
    fn duplicate_capabilities_are_collapsed() {
        let (_dir, root) = fixture();
        let policy = RuntimePolicy::from_names(root, ["READ_FILES", "READ_FILES"]).unwrap();
        assert!(policy.has(Capability::ReadFiles));
    }

    #[test]
    fn policy_exposes_only_explicit_capabilities() {
        let (_dir, root) = fixture();
        let policy = RuntimePolicy::new(root, [Capability::ReadFiles]);
        assert!(policy.has(Capability::ReadFiles));
        assert!(!policy.has(Capability::Network));
        assert!(!policy.has(Capability::Execution));
    }

    #[test]
    fn new_runtime_starts_running() {
        let (_dir, root) = fixture();
        assert_eq!(Runtime::new(RuntimePolicy::new(root, [Capability::ReadFiles])).state(), RuntimeState::Running);
    }

    #[test]
    fn stopped_runtime_rejects_requests() {
        let (_dir, root) = fixture();
        let mut runtime = Runtime::new(RuntimePolicy::new(root, [Capability::ReadFiles]));
        runtime.stop();
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
        assert_eq!(runtime.read_file("hello.txt"), Err(RuntimeError::CapabilityDenied(Capability::ReadFiles)));
    }

    #[test]
    fn rejects_path_escape() {
        let (_dir, root) = fixture();
        fs::write(_dir.path().join("outside.txt"), b"fora").expect("outside fixture");
        let runtime = Runtime::new(RuntimePolicy::new(root, [Capability::ReadFiles]));
        assert!(matches!(runtime.read_file("../outside.txt"), Err(RuntimeError::PathOutsideRoot)));
    }

    #[test]
    fn rejects_absolute_path() {
        let (_dir, root) = fixture();
        let runtime = Runtime::new(RuntimePolicy::new(root, [Capability::ReadFiles]));
        assert_eq!(runtime.read_file("/etc/passwd"), Err(RuntimeError::InvalidPath));
    }

    #[test]
    fn handle_maps_success_to_contract_response() {
        let (_dir, root) = fixture();
        let runtime = Runtime::new(RuntimePolicy::new(root, [Capability::ReadFiles]));
        assert_eq!(runtime.handle(RuntimeRequest::ReadFile { path: "hello.txt".into() }), RuntimeResponse::FileContents(b"baluarte".to_vec()));
    }

    #[test]
    fn handle_maps_denial_to_contract_response() {
        let (_dir, root) = fixture();
        let runtime = Runtime::new(RuntimePolicy::new(root, []));
        assert_eq!(runtime.handle(RuntimeRequest::ReadFile { path: "hello.txt".into() }), RuntimeResponse::Error(RuntimeError::CapabilityDenied(Capability::ReadFiles)));
    }

    #[test]
    fn handle_maps_stopped_state_to_contract_response() {
        let (_dir, root) = fixture();
        let mut runtime = Runtime::new(RuntimePolicy::new(root, [Capability::ReadFiles]));
        runtime.stop();
        assert_eq!(runtime.handle(RuntimeRequest::ReadFile { path: "hello.txt".into() }), RuntimeResponse::Error(RuntimeError::RuntimeStopped));
    }
}
