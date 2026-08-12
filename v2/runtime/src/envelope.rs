//! Protocolo serializável da autorização Core → Runtime.
//!
//! O formato é pequeno de propósito: versão + grants. O Runtime não recebe
//! objetos internos do Core, funções ou contexto de módulo.

use serde::{Deserialize, Serialize};

use crate::{Capability, RuntimePolicy, RuntimePolicyError};

pub const ENVELOPE_VERSION: u32 = 1;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct RuntimeGrant {
    pub modulo: String,
    pub permissoes: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct RuntimeEnvelope {
    pub versao: u32,
    pub modulos: Vec<RuntimeGrant>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum EnvelopeError {
    InvalidVersion(u32),
    EmptyModuleId,
    DuplicateModule(String),
    InvalidPermission { modulo: String, permission: String },
    DuplicatePermission { modulo: String, permission: String },
    UnknownCapability(RuntimePolicyError),
    Serialization(String),
}

impl std::fmt::Display for EnvelopeError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InvalidVersion(v) => write!(f, "versão de envelope não suportada: {v}"),
            Self::EmptyModuleId => write!(f, "grant sem identificador de módulo"),
            Self::DuplicateModule(id) => write!(f, "módulo duplicado: {id}"),
            Self::InvalidPermission { modulo, permission } => {
                write!(f, "permissão inválida em {modulo}: {permission}")
            }
            Self::DuplicatePermission { modulo, permission } => {
                write!(f, "permissão duplicada em {modulo}: {permission}")
            }
            Self::UnknownCapability(error) => error.fmt(f),
            Self::Serialization(error) => write!(f, "erro de serialização: {error}"),
        }
    }
}

impl std::error::Error for EnvelopeError {}

impl RuntimeEnvelope {
    pub fn validate(&self) -> Result<(), EnvelopeError> {
        if self.versao != ENVELOPE_VERSION {
            return Err(EnvelopeError::InvalidVersion(self.versao));
        }

        let mut modules = std::collections::HashSet::new();
        for grant in &self.modulos {
            if grant.modulo.is_empty() {
                return Err(EnvelopeError::EmptyModuleId);
            }
            if !modules.insert(&grant.modulo) {
                return Err(EnvelopeError::DuplicateModule(grant.modulo.clone()));
            }

            let mut permissions = std::collections::HashSet::new();
            for permission in &grant.permissoes {
                if permission.parse::<Capability>().is_err() {
                    return Err(EnvelopeError::InvalidPermission {
                        modulo: grant.modulo.clone(),
                        permission: permission.clone(),
                    });
                }
                if !permissions.insert(permission) {
                    return Err(EnvelopeError::DuplicatePermission {
                        modulo: grant.modulo.clone(),
                        permission: permission.clone(),
                    });
                }
            }
        }
        Ok(())
    }

    pub fn from_json(input: &str) -> Result<Self, EnvelopeError> {
        let envelope: Self = serde_json::from_str(input)
            .map_err(|error| EnvelopeError::Serialization(error.to_string()))?;
        envelope.validate()?;
        Ok(envelope)
    }

    pub fn to_json(&self) -> Result<String, EnvelopeError> {
        self.validate()?;
        serde_json::to_string(self)
            .map_err(|error| EnvelopeError::Serialization(error.to_string()))
    }

    /// Converte o grant de um módulo em uma RuntimePolicy.
    /// A raiz continua sendo uma decisão do Runtime/host, nunca do manifesto.
    pub fn policy_for_module(
        &self,
        module: &str,
        root: impl Into<std::path::PathBuf>,
    ) -> Result<RuntimePolicy, EnvelopeError> {
        self.validate()?;
        let grant = self
            .modulos
            .iter()
            .find(|grant| grant.modulo == module)
            .ok_or_else(|| EnvelopeError::DuplicateModule(format!("módulo não autorizado: {module}")))?;

        RuntimePolicy::from_names(root, grant.permissoes.iter())
            .map_err(EnvelopeError::UnknownCapability)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn json_round_trip_preserves_contract() {
        let envelope = RuntimeEnvelope {
            versao: ENVELOPE_VERSION,
            modulos: vec![RuntimeGrant {
                modulo: "wiki".into(),
                permissoes: vec!["READ_FILES".into()],
            }],
        };
        let json = envelope.to_json().unwrap();
        assert_eq!(RuntimeEnvelope::from_json(&json).unwrap(), envelope);
    }

    #[test]
    fn rejects_wrong_version() {
        let envelope = RuntimeEnvelope { versao: 2, modulos: vec![] };
        assert_eq!(envelope.validate(), Err(EnvelopeError::InvalidVersion(2)));
    }

    #[test]
    fn rejects_duplicate_modules() {
        let envelope = RuntimeEnvelope {
            versao: 1,
            modulos: vec![
                RuntimeGrant { modulo: "a".into(), permissoes: vec![] },
                RuntimeGrant { modulo: "a".into(), permissoes: vec![] },
            ],
        };
        assert_eq!(envelope.validate(), Err(EnvelopeError::DuplicateModule("a".into())));
    }

    #[test]
    fn rejects_unknown_permission_before_policy_creation() {
        let envelope = RuntimeEnvelope {
            versao: 1,
            modulos: vec![RuntimeGrant {
                modulo: "a".into(),
                permissoes: vec!["MAGIC_ROOT".into()],
            }],
        };
        assert!(matches!(
            envelope.validate(),
            Err(EnvelopeError::InvalidPermission { .. })
        ));
    }

    #[test]
    fn module_policy_uses_only_granted_capabilities() {
        let envelope = RuntimeEnvelope {
            versao: 1,
            modulos: vec![RuntimeGrant {
                modulo: "a".into(),
                permissoes: vec!["READ_FILES".into()],
            }],
        };
        let policy = envelope.policy_for_module("a", PathBuf::from("." )).unwrap();
        assert!(policy.has(Capability::ReadFiles));
        assert!(!policy.has(Capability::Execution));
    }
}
