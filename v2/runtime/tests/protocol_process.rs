use std::io::{BufRead, BufReader, Write};
use std::process::{Command, Stdio};

fn spawn_runtime() -> (std::process::Child, std::process::ChildStdin, BufReader<std::process::ChildStdout>) {
    let exe = std::env::var("CARGO_BIN_EXE_baluarte-runtime").expect("Cargo deve fornecer CARGO_BIN_EXE_baluarte-runtime");
    let root = tempfile::tempdir().unwrap();
    let mut child = Command::new(exe)
        .env("BALUARTE_RUNTIME_ROOT", root.path())
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .unwrap();
    let stdin = child.stdin.take().unwrap();
    let stdout = child.stdout.take().unwrap();
    (child, stdin, BufReader::new(stdout))
}

#[test]
fn process_rejects_invalid_json_and_continues() {
    let (mut child, mut stdin, mut reader) = spawn_runtime();
    writeln!(stdin, "{{não-json}}").unwrap();
    writeln!(stdin, r#"{{"op":"authorize","envelope":{{"versao":1,"modulos":[]}}}}"#).unwrap();
    stdin.flush().unwrap();

    let mut first = String::new();
    reader.read_line(&mut first).unwrap();
    assert!(first.contains("INVALID_JSON"));

    let mut second = String::new();
    reader.read_line(&mut second).unwrap();
    assert!(second.contains("authorized"));

    drop(stdin);
    assert!(child.wait().unwrap().success());
}

#[test]
fn process_ignores_blank_lines() {
    let (mut child, mut stdin, mut reader) = spawn_runtime();
    writeln!(stdin).unwrap();
    writeln!(stdin, r#"{{"op":"authorize","envelope":{{"versao":1,"modulos":[]}}}}"#).unwrap();
    stdin.flush().unwrap();

    let mut response = String::new();
    reader.read_line(&mut response).unwrap();
    assert!(response.contains("authorized"));

    drop(stdin);
    assert!(child.wait().unwrap().success());
}

#[test]
fn process_rejects_oversized_request_and_continues() {
    let (mut child, mut stdin, mut reader) = spawn_runtime();
    let oversized = "x".repeat(1024 * 1024 + 1);
    writeln!(stdin, "{oversized}").unwrap();
    writeln!(stdin, r#"{{"op":"authorize","envelope":{{"versao":1,"modulos":[]}}}}"#).unwrap();
    stdin.flush().unwrap();

    let mut first = String::new();
    reader.read_line(&mut first).unwrap();
    assert!(first.contains("REQUEST_TOO_LARGE"));

    let mut second = String::new();
    reader.read_line(&mut second).unwrap();
    assert!(second.contains("authorized"));

    drop(stdin);
    assert!(child.wait().unwrap().success());
}
