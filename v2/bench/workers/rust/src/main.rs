//! O mesmo trabalho dos outros dois: ler, desserializar, percorrer.
//!
//! Sem truque: `serde_json::Value`, que é o modelo genérico — o equivalente
//! honesto de `json.load` e `JSON.parse`. Usar `#[derive(Deserialize)]` num
//! struct tipado seria mais rápido e mediria outra coisa: um worker que já
//! conhece o esquema. Os workers do Baluarte lidam com dado de fora, cujo
//! formato muda sem avisar, então o caso genérico é o caso real.
use std::time::Instant;

fn contar(v: &serde_json::Value) -> usize {
    match v {
        serde_json::Value::Object(m) => m.len() + m.values().map(contar).sum::<usize>(),
        serde_json::Value::Array(a) => a.iter().map(contar).sum(),
        _ => 0,
    }
}

fn main() {
    let alvo = std::env::args().nth(1).expect("uso: bench-workers <arquivo.json>");

    /* Modo byte: a mesma varredura que Python e Node fazem, para a comparação
     * ser da LINGUAGEM e não do parser de JSON de cada uma. É a forma do
     * parser de .p3d/.pbo — CPU pura, sem estrutura, sem alocação. */
    if std::env::args().any(|a| a == "--bytes") {
        let b = std::fs::read(&alvo).expect("leitura");
        let t0 = Instant::now();
        let mut h: u32 = 0;
        let mut achados: u64 = 0;
        for &c in &b {
            h = h.wrapping_mul(31).wrapping_add(c as u32);
            if c == 0x7B { achados += 1; }
        }
        println!("  {:8.0} ms   (hash {:08x}, {} chaves-abre)", t0.elapsed().as_secs_f64()*1000.0, h, achados);
        return;
    }

    let t0 = Instant::now();
    let bytes = std::fs::read(&alvo).expect("leitura");
    let dados: serde_json::Value = serde_json::from_slice(&bytes).expect("json");
    let t_parse = t0.elapsed();

    let t1 = Instant::now();
    let n = contar(&dados);
    let t_passeio = t1.elapsed();

    // Pico de memória via /proc — sem dependência extra só para medir.
    let rss = std::fs::read_to_string("/proc/self/status")
        .ok()
        .and_then(|s| {
            s.lines()
                .find(|l| l.starts_with("VmHWM:"))
                .and_then(|l| l.split_whitespace().nth(1).map(|k| k.parse::<f64>().unwrap_or(0.0) / 1024.0))
        })
        .unwrap_or(0.0);

    println!("  parse    {:8.0} ms", t_parse.as_secs_f64() * 1000.0);
    println!("  passeio  {:8.0} ms   ({} chaves)", t_passeio.as_secs_f64() * 1000.0, n);
    println!("  memória  {:8.0} MB (pico)", rss);
}
