use std::env;
use std::io::{self, BufRead, Write};
use std::path::PathBuf;

mod protocol;
use protocol::Response;

fn main() {
    eprintln!("baluarte-runtime: runtime local experimental da V2");
    let root = match env::var_os("BALUARTE_RUNTIME_ROOT") {
        Some(value) => PathBuf::from(value),
        None => {
            eprintln!("baluarte-runtime: BALUARTE_RUNTIME_ROOT não configurado");
            std::process::exit(2);
        }
    };
    let stdin = io::stdin();
    let stdout = io::stdout();
    let mut output = stdout.lock();
    for line in stdin.lock().lines() {
        let line = match line {
            Ok(line) if line.trim().is_empty() => continue,
            Ok(line) => line,
            Err(error) => {
                let response = Response::Error { message: format!("erro lendo stdin: {error}") };
                writeln!(output, "{}", serde_json::to_string(&response).unwrap()).ok();
                break;
            }
        };
        let response = match serde_json::from_str::<protocol::Request>(&line) {
            Ok(request) => protocol::handle(request, root.clone()),
            Err(error) => Response::Error { message: format!("requisição JSON inválida: {error}") },
        };
        if let Err(error) = writeln!(output, "{}", serde_json::to_string(&response).unwrap()) {
            eprintln!("baluarte-runtime: erro escrevendo resposta: {error}");
            break;
        }
        output.flush().ok();
    }
}
