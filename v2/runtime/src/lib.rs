use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::{Component, Path, PathBuf};

pub mod protocol;

pub const ENVELOPE_VERSION: u32 = 1;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
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
    pub fn from_name(name: &str) -> Result<Self, RuntimeError> {
        match name {
            "READ_FILES" => Ok(Self::ReadFiles),
            "WRITE_FILES" => Ok(Self::WriteFiles),
            "NETWORK" => Ok(Self::Network),
            "DATABASE" => Ok(Self::Database),
            "SYSTEM_INFO" => Ok(Self::SystemInfo),
            "USER_DATA" => Ok(Self::UserData),
            "EXECUTION" => Ok(Self::Execution),
            _ => Err(RuntimeError::UnknownCapability(name.to_owned())),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RuntimePolicy {
    module: String,
    root: PathBuf,
    capabilities: HashSet<Capability>,
}

impl RuntimePolicy {
    pub fn from_names(
        module: impl Into<String>,
        root: impl Into<PathBuf>,
        names: &[String],
    ) -> Result<Self, RuntimeError> {
        let module = module.into();
        if module.trim().is_empty() {
            return Err(RuntimeError::InvalidModule);
        }
        let mut capabilities = HashSet::new();
        for name in names {
            capabilities.insert(Capability::from_name(name)?);
        }
        Ok(Self {
            module,
            root: root.into(),
            capabilities,
        })
    }
    pub fn allows(&self, capability: Capability) -> bool {
        self.capabilities.contains(&capability)
    }
    pub fn module(&self) -> &str {
        &self.module
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct RuntimeEnvelope {
    pub versao: u32,
    pub modulos: Vec<RuntimeGrant>,
}
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct RuntimeGrant {
    pub modulo: String,
    pub permissoes: Vec<String>,
}

impl RuntimeEnvelope {
    pub fn validate(&self) -> Result<(), RuntimeError> {
        if self.versao != ENVELOPE_VERSION {
            return Err(RuntimeError::UnsupportedVersion(self.versao));
        }
        let mut modules = HashSet::new();
        for grant in &self.modulos {
            if grant.modulo.trim().is_empty() {
                return Err(RuntimeError::InvalidModule);
            }
            if !modules.insert(grant.modulo.clone()) {
                return Err(RuntimeError::DuplicateModule(grant.modulo.clone()));
            }
            let mut permissions = HashSet::new();
            for permission in &grant.permissoes {
                Capability::from_name(permission)?;
                if !permissions.insert(permission.clone()) {
                    return Err(RuntimeError::DuplicateCapability {
                        module: grant.modulo.clone(),
                        capability: permission.clone(),
                    });
                }
            }
        }
        Ok(())
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RuntimeState {
    Running,
    Stopped,
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
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RuntimeError {
    UnsupportedVersion(u32),
    InvalidModule,
    DuplicateModule(String),
    UnknownCapability(String),
    DuplicateCapability { module: String, capability: String },
    CapabilityDenied,
    CapabilityNotImplemented,
    RuntimeStopped,
    InvalidPath,
    PathOutsideRoot,
    NotAFile,
    Io(String),
    MissingPolicy(String),
}

pub struct RuntimeHost {
    state: RuntimeState,
    policies: HashMap<String, RuntimePolicy>,
}
impl RuntimeHost {
    pub fn from_envelope(
        envelope: &RuntimeEnvelope,
        roots: &HashMap<String, PathBuf>,
    ) -> Result<Self, RuntimeError> {
        envelope.validate()?;
        let mut policies = HashMap::new();
        for grant in &envelope.modulos {
            let root = roots
                .get(&grant.modulo)
                .ok_or_else(|| RuntimeError::MissingPolicy(grant.modulo.clone()))?;
            let policy =
                RuntimePolicy::from_names(grant.modulo.clone(), root.clone(), &grant.permissoes)?;
            policies.insert(grant.modulo.clone(), policy);
        }
        Ok(Self {
            state: RuntimeState::Stopped,
            policies,
        })
    }
    pub fn modules(&self) -> impl Iterator<Item = &str> {
        self.policies.keys().map(String::as_str)
    }
    pub fn start(&mut self) {
        self.state = RuntimeState::Running
    }
    pub fn stop(&mut self) {
        self.state = RuntimeState::Stopped
    }
    pub fn state(&self) -> &RuntimeState {
        &self.state
    }
    pub fn handle(&self, module: &str, request: RuntimeRequest) -> RuntimeResponse {
        if self.state != RuntimeState::Running {
            return RuntimeResponse::Error(RuntimeError::RuntimeStopped);
        }
        let Some(policy) = self.policies.get(module) else {
            return RuntimeResponse::Error(RuntimeError::MissingPolicy(module.to_owned()));
        };
        match request {
            RuntimeRequest::ReadFile { path } => {
                if !policy.allows(Capability::ReadFiles) {
                    RuntimeResponse::Error(RuntimeError::CapabilityDenied)
                } else {
                    read_file(policy, &path)
                }
            }
        }
    }
}

fn read_file(policy: &RuntimePolicy, relative: &str) -> RuntimeResponse {
    let path = Path::new(relative);
    if relative.trim().is_empty() || path.is_absolute() {
        return RuntimeResponse::Error(RuntimeError::InvalidPath);
    }
    if path.components().any(|c| matches!(c, Component::ParentDir)) {
        return RuntimeResponse::Error(RuntimeError::PathOutsideRoot);
    }
    let candidate = policy.root.join(path);
    let root = match fs::canonicalize(&policy.root) {
        Ok(v) => v,
        Err(e) => return RuntimeResponse::Error(RuntimeError::Io(e.to_string())),
    };
    let resolved = match fs::canonicalize(&candidate) {
        Ok(v) => v,
        Err(e) => return RuntimeResponse::Error(RuntimeError::Io(e.to_string())),
    };
    if !resolved.starts_with(&root) {
        return RuntimeResponse::Error(RuntimeError::PathOutsideRoot);
    }
    if !resolved.is_file() {
        return RuntimeResponse::Error(RuntimeError::NotAFile);
    }
    match fs::read(resolved) {
        Ok(v) => RuntimeResponse::FileContents(v),
        Err(e) => RuntimeResponse::Error(RuntimeError::Io(e.to_string())),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;
    fn grant(module: &str, permissions: &[&str]) -> RuntimeGrant {
        RuntimeGrant {
            modulo: module.into(),
            permissoes: permissions.iter().map(|p| (*p).into()).collect(),
        }
    }
    fn host(module: &str, permissions: &[&str]) -> (RuntimeHost, tempfile::TempDir) {
        let dir = tempdir().unwrap();
        let envelope = RuntimeEnvelope {
            versao: 1,
            modulos: vec![grant(module, permissions)],
        };
        let roots = HashMap::from([(module.into(), dir.path().to_path_buf())]);
        (RuntimeHost::from_envelope(&envelope, &roots).unwrap(), dir)
    }
    #[test]
    fn rejects_unknown_capability() {
        let e = RuntimeEnvelope {
            versao: 1,
            modulos: vec![grant("wiki", &["NOPE"])],
        };
        assert!(matches!(
            e.validate(),
            Err(RuntimeError::UnknownCapability(_))
        ))
    }
    #[test]
    fn rejects_duplicate_modules() {
        let e = RuntimeEnvelope {
            versao: 1,
            modulos: vec![grant("wiki", &[]), grant("wiki", &[])],
        };
        assert!(matches!(
            e.validate(),
            Err(RuntimeError::DuplicateModule(_))
        ))
    }
    #[test]
    fn requires_running_state() {
        let (h, _) = host("wiki", &["READ_FILES"]);
        assert_eq!(
            h.handle(
                "wiki",
                RuntimeRequest::ReadFile {
                    path: "a.txt".into()
                }
            ),
            RuntimeResponse::Error(RuntimeError::RuntimeStopped)
        )
    }
    #[test]
    fn reads_inside_authorized_root() {
        let (mut h, d) = host("wiki", &["READ_FILES"]);
        fs::write(d.path().join("ok.txt"), b"hello").unwrap();
        h.start();
        assert_eq!(
            h.handle(
                "wiki",
                RuntimeRequest::ReadFile {
                    path: "ok.txt".into()
                }
            ),
            RuntimeResponse::FileContents(b"hello".to_vec())
        )
    }
    #[test]
    fn denies_without_capability() {
        let (mut h, _) = host("wiki", &[]);
        h.start();
        assert_eq!(
            h.handle(
                "wiki",
                RuntimeRequest::ReadFile {
                    path: "ok.txt".into()
                }
            ),
            RuntimeResponse::Error(RuntimeError::CapabilityDenied)
        )
    }
    #[test]
    fn rejects_parent_path() {
        let (mut h, _) = host("wiki", &["READ_FILES"]);
        h.start();
        assert_eq!(
            h.handle(
                "wiki",
                RuntimeRequest::ReadFile {
                    path: "../secret".into()
                }
            ),
            RuntimeResponse::Error(RuntimeError::PathOutsideRoot)
        )
    }
    #[test]
    fn stop_is_barrier() {
        let (mut h, _) = host("wiki", &["READ_FILES"]);
        h.start();
        h.stop();
        assert_eq!(
            h.handle(
                "wiki",
                RuntimeRequest::ReadFile {
                    path: "ok.txt".into()
                }
            ),
            RuntimeResponse::Error(RuntimeError::RuntimeStopped)
        )
    }
}
