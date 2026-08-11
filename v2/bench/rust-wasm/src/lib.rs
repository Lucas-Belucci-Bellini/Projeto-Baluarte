//! Núcleo mínimo em Rust, para medir a fronteira — não para ser um Core.
//!
//! Três funções, escolhidas porque isolam três custos diferentes:
//!
//!   soma          chamada trivial: mede só o overhead de atravessar
//!   despachar     o trabalho que o Event Bus faz por evento (casar nome + contar)
//!   despachar_str o mesmo, mas recebendo o nome do evento como TEXTO — que é a
//!                 forma real, e é onde aparece o custo de copiar para a
//!                 memória linear
//!
//! A diferença entre a segunda e a terceira é a pergunta que decide se um Core
//! em WASM faz sentido para este trabalho.

use std::collections::HashMap;

static mut CONTAGEM: u64 = 0;
static mut TABELA: Option<HashMap<String, u32>> = None;
/// Buffer de entrada: JS escreve o nome do evento aqui antes de chamar.
static mut BUF: [u8; 256] = [0; 256];

#[no_mangle]
pub extern "C" fn soma(a: i32, b: i32) -> i32 {
    a + b
}

/// Ponteiro do buffer, para o JS saber onde escrever.
#[no_mangle]
pub extern "C" fn buf_ptr() -> *const u8 {
    unsafe { core::ptr::addr_of!(BUF) as *const u8 }
}

/// Índice por id, para o despacho numérico não alocar nada.
static mut POR_ID: [u32; 256] = [0; 256];

#[no_mangle]
pub extern "C" fn registrar(id: u32) {
    unsafe {
        let t = core::ptr::addr_of_mut!(TABELA);
        if (*t).is_none() {
            *t = Some(HashMap::new());
        }
        (*t).as_mut().unwrap().insert(format!("ev:{}", id), id);
        if (id as usize) < 256 {
            (*core::ptr::addr_of_mut!(POR_ID))[id as usize] = id;
        }
    }
}

/// Despacho por ID numérico. Busca direta em vetor — SEM alocar.
///
/// A primeira versão fazia `format!("ev:{})` a cada chamada e media 123 ns:
/// eu estava medindo o meu Rust ruim e chamando aquilo de "custo da fronteira".
/// Comparação de linguagem tem que dar a cada lado a melhor implementação, ou
/// a conclusão é sobre quem escreveu, não sobre a ferramenta.
#[no_mangle]
pub extern "C" fn despachar(id: u32) -> u32 {
    unsafe {
        CONTAGEM += 1;
        if (id as usize) >= 256 {
            return 0;
        }
        (*core::ptr::addr_of!(POR_ID))[id as usize]
    }
}

/// Despacho por NOME, lido do buffer. É a forma real de um Event Bus.
#[no_mangle]
pub extern "C" fn despachar_str(tam: u32) -> u32 {
    unsafe {
        CONTAGEM += 1;
        let fatia = core::slice::from_raw_parts(core::ptr::addr_of!(BUF) as *const u8, tam as usize);
        let nome = match core::str::from_utf8(fatia) {
            Ok(s) => s,
            Err(_) => return 0,
        };
        let t = core::ptr::addr_of!(TABELA);
        match (*t).as_ref().and_then(|m| m.get(nome)) {
            Some(v) => *v,
            None => 0,
        }
    }
}

#[no_mangle]
pub extern "C" fn contagem() -> u64 {
    unsafe { CONTAGEM }
}
