//! Host do Runtime: transforma um envelope de autorização em políticas isoladas
//! por módulo. O host é o ponto onde o identificador lógico do módulo encontra
//! a raiz física que o processo confiável decidiu conceder.

use std::collections::HashMap;
use std::path::PathBuf;

use crate::envelope::{EnvelopeError, RuntimeEnvelope};
use crate::{Runtime, RuntimePolicy, RuntimeRequest, RuntimeResponse};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum HostError {
    InvalidEnvelope(EnvelopeError),
    MissingRoot(String),
}

impl std::fmt::Display for HostError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InvalidEnvelope(error) => error.fmt(f),
            Self::MissingRoot(module) => write!(f, "raiz não configurada para o módulo: {module}"),
        }
    }
}
impl std::error::Error for HostError {}

#[derive(Debug)]
pub struct RuntimeHost {
    runtimes: HashMap<String, Runtime>,
}

impl RuntimeHost {
    pub fn from_envelope(
        envelope: &RuntimeEnvelope,
        roots: &HashMap<String, PathBuf>,
    ) -> Result<Self, HostError> {
        envelope.validate().map_err(HostError::InvalidEnvelope)?;

        let mut runtimes = HashMap::new();
        for grant in &envelope.modulos {
            let root = roots
                .get(&grant.modulo)
                .cloned()
                .ok_or_else(|| HostError::MissingRoot(grant.modulo.clone()))?;
            let policy = RuntimePolicy::from_names(root, grant.permissoes.iter())
                .map_err(|error| HostError::InvalidEnvelope(EnvelopeError::UnknownCapability(error)))?;
            runtimes.insert(grant.modulo.clone(), Runtime::new(policy));
        }

        Ok(Self { runtimes })
    }

    pub fn modules(&self) -> impl Iterator<Item = &str> {
        self.runtimes.keys().map(String::as_str)
    }

    pub fn handle(&self, module: &str, request: RuntimeRequest) -> RuntimeResponse {
        match self.runtimes.get(module) {
            Some(runtime) => runtime.handle(request),
            None => RuntimeResponse::Error(crate::RuntimeError::CapabilityDenied(
                crate::Capability::ReadFiles,
            )),
        }
    }

    pub fn stop_module(&mut self, module: &str) -> bool {
        match self.runtimes.get_mut(module) {
            Some(runtime) => { runtime.stop(); true }
            None => false,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::envelope::{RuntimeGrant, ENVELOPE_VERSION};
    use std::fs;

    #[test]
    fn creates_one_runtime_policy_per_authorized_module() {
        let dir = tempfile::tempdir().unwrap();
        let alpha = dir.path().join("alpha");
        let beta = dir.path().join("beta");
        fs::create_dir_all(&alpha).unwrap();
        fs::create_dir_all(&beta).unwrap();
        fs::write(alpha.join("a.txt"), b"alpha").unwrap();
        fs::write(beta.join("b.txt"), b"beta").unwrap();

        let envelope = RuntimeEnvelope {
            versao: ENVELOPE_VERSION,
            modulos: vec![
                RuntimeGrant { modulo: "alpha".into(), permissoes: vec!["READ_FILES".into()] },
                RuntimeGrant { modulo: "beta".into(), permissoes: vec!["READ_FILES".into()] },
            ],
        };
        let roots = HashMap::from([
            ("alpha".into(), alpha),
            ("beta".into(), beta),
        ]);
        let host = RuntimeHost::from_envelope(&envelope, &roots).unwrap();

        assert_eq!(host.handle("alpha", RuntimeRequest::ReadFile { path: "a.txt".into() }), RuntimeResponse::FileContents(b"alpha".to_vec()));
        assert_eq!(host.handle("beta", RuntimeRequest::ReadFile { path: "b.txt".into() }), RuntimeResponse::FileContents(b"beta".to_vec()));
    }

    #[test]
    fn module_cannot_use_another_module_root() {
        let dir = tempfile::tempdir().unwrap();
        let alpha = dir.path().join("alpha");
        let beta = dir.path().join("beta");
        fs::create_dir_all(&alpha).unwrap();
        fs::create_dir_all(&beta).unwrap();
        fs::write(beta.join("secret.txt"), b"beta-only").unwrap();

        let envelope = RuntimeEnvelope {
            versao: 1,
            modulos: vec![RuntimeGrant { modulo: "alpha".into(), permissoes: vec!["READ_FILES".into()] }],
        };
        let roots = HashMap::from([("alpha".into(), alpha)]);
        let host = RuntimeHost::from_envelope(&envelope, &roots).unwrap();
        assert!(matches!(
            host.handle("alpha", RuntimeRequest::ReadFile { path: "../beta/secret.txt".into() }),
            RuntimeResponse::Error(crate::RuntimeError::PathOutsideRoot)
        ));
    }

    #[test]
    fn missing_root_is_fail_closed() {
        let envelope = RuntimeEnvelope {
            versao: 1,
            modulos: vec![RuntimeGrant { modulo: "alpha".into(), permissoes: vec![] }],
        };
        let error = RuntimeHost::from_envelope(&envelope, &HashMap::new()).unwrap_err();
        assert_eq!(error, HostError::MissingRoot("alpha".into()));
    }
}
