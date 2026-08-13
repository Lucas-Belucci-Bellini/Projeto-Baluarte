//! Protocolo de linha do Runtime local.
//! Cada linha de stdin é uma mensagem JSON e cada resposta é uma linha JSON.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use crate::envelope::RuntimeEnvelope;
use crate::host::RuntimeHost;
use crate::{RuntimeRequest, RuntimeResponse};

#[derive(Debug, Deserialize)]
#[serde(tag = "op", rename_all = "snake_case")]
pub enum Request {
    Authorize { envelope: RuntimeEnvelope },
    ReadFile { envelope: RuntimeEnvelope, modulo: String, path: String },
}

#[derive(Debug, Serialize)]
#[serde(tag = "status", rename_all = "snake_case")]
pub enum Response {
    Authorized { modulos: Vec<String> },
    File { modulo: String, bytes: Vec<u8> },
    Error { code: String, message: String },
}

fn roots_for(envelope: &RuntimeEnvelope, root: &PathBuf) -> HashMap<String, PathBuf> {
    envelope.modulos.iter().map(|grant| (grant.modulo.clone(), root.join(&grant.modulo))).collect()
}

pub fn handle(request: Request, root: PathBuf) -> Response {
    let envelope = match &request {
        Request::Authorize { envelope } | Request::ReadFile { envelope, .. } => envelope,
    };
    let roots = roots_for(envelope, &root);
    let host = match RuntimeHost::from_envelope(envelope, &roots) {
        Ok(host) => host,
        Err(error) => return Response::Error { code: "RUNTIME_REJECTED".into(), message: error.to_string() },
    };
    match request {
        Request::Authorize { .. } => Response::Authorized { modulos: host.modules().map(str::to_owned).collect() },
        Request::ReadFile { modulo, path, .. } => match host.handle(&modulo, RuntimeRequest::ReadFile { path }) {
            RuntimeResponse::FileContents(bytes) => Response::File { modulo, bytes },
            RuntimeResponse::Error(error) => Response::Error { code: "RUNTIME_ERROR".into(), message: error.to_string() },
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::envelope::{RuntimeGrant, ENVELOPE_VERSION};
    use std::fs;

    fn envelope() -> RuntimeEnvelope { RuntimeEnvelope { versao: ENVELOPE_VERSION, modulos: vec![RuntimeGrant { modulo: "alpha".into(), permissoes: vec!["READ_FILES".into()] }] } }

    #[test]
    fn authorize_builds_host_from_trusted_root() {
        let dir = tempfile::tempdir().unwrap();
        fs::create_dir_all(dir.path().join("alpha")).unwrap();
        let response = handle(Request::Authorize { envelope: envelope() }, dir.path().to_path_buf());
        assert!(matches!(response, Response::Authorized { modulos } if modulos == vec!["alpha"]));
    }

    #[test]
    fn read_file_uses_module_specific_root() {
        let dir = tempfile::tempdir().unwrap();
        let alpha = dir.path().join("alpha");
        fs::create_dir_all(&alpha).unwrap();
        fs::write(alpha.join("hello.txt"), b"baluarte").unwrap();
        let response = handle(Request::ReadFile { envelope: envelope(), modulo: "alpha".into(), path: "hello.txt".into() }, dir.path().to_path_buf());
        assert!(matches!(response, Response::File { modulo, bytes } if modulo == "alpha" && bytes == b"baluarte"));
    }

    #[test]
    fn path_escape_is_rejected_by_runtime() {
        let dir = tempfile::tempdir().unwrap();
        fs::create_dir_all(dir.path().join("alpha")).unwrap();
        fs::write(dir.path().join("secret.txt"), b"secret").unwrap();
        let response = handle(Request::ReadFile { envelope: envelope(), modulo: "alpha".into(), path: "../secret.txt".into() }, dir.path().to_path_buf());
        assert!(matches!(response, Response::Error { code, message } if code == "RUNTIME_ERROR" && message.contains("fora da raiz")));
    }

    #[test]
    fn unknown_module_is_rejected_without_creating_a_root() {
        let dir = tempfile::tempdir().unwrap();
        let response = handle(Request::ReadFile { envelope: envelope(), modulo: "missing".into(), path: "hello.txt".into() }, dir.path().to_path_buf());
        assert!(matches!(response, Response::Error { code, .. } if code == "RUNTIME_ERROR"));
        assert!(!dir.path().join("missing").exists());
    }

    #[test]
    fn malformed_json_is_not_a_valid_request() {
        let result = serde_json::from_str::<Request>(r#"{"op":"read_file","modulo":"alpha"}"#);
        assert!(result.is_err());
    }
}
