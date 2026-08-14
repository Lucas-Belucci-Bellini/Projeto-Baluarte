use baluarte_runtime::protocol::{handle, Request, Response};
use std::env;
use std::io::{self, BufRead, Write};
use std::path::PathBuf;

const MAX_REQUEST_BYTES: usize = 1024 * 1024;

fn response_error(code: &str, message: impl Into<String>) -> Response {
    Response::Error {
        code: code.to_owned(),
        message: message.into(),
    }
}

fn write_response(stdout: &mut impl Write, response: &Response) -> io::Result<()> {
    serde_json::to_writer(&mut *stdout, response)
        .map_err(|error| io::Error::other(error.to_string()))?;
    stdout.write_all(b"\n")?;
    stdout.flush()
}

fn runtime_root() -> PathBuf {
    env::var_os("BALUARTE_RUNTIME_ROOT")
        .map(PathBuf::from)
        .or_else(|| env::current_dir().ok())
        .unwrap_or_else(|| PathBuf::from("."))
}

fn main() -> io::Result<()> {
    let root = runtime_root();
    let stdin = io::stdin();
    let mut stdout = io::BufWriter::new(io::stdout().lock());

    for line in stdin.lock().lines() {
        let line = line?;
        if line.trim().is_empty() {
            continue;
        }

        let response = if line.len() > MAX_REQUEST_BYTES {
            response_error(
                "REQUEST_TOO_LARGE",
                format!("request exceeds {MAX_REQUEST_BYTES} bytes"),
            )
        } else {
            match serde_json::from_str::<Request>(&line) {
                Ok(request) => handle(request, root.clone()),
                Err(error) => response_error("INVALID_JSON", error.to_string()),
            }
        };

        write_response(&mut stdout, &response)?;
    }

    Ok(())
}
