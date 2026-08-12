//! Core Runtime do Baluarte V2.
//!
//! Esta crate começa deliberadamente pequena. O runtime local será a fronteira
//! de confiança para execução isolada, permissões sobre recursos do processo e
//! supervisão. A orquestração do navegador continua no Core TypeScript.

/// Versão do protocolo do runtime.
///
/// O protocolo é separado da versão do crate para permitir evolução explícita
/// entre o orquestrador e o processo local.
pub const PROTOCOL_VERSION: u32 = 1;

/// Estado mínimo observável do runtime.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RuntimeState {
    Starting,
    Ready,
    Stopped,
}

/// Identidade da instância do runtime.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RuntimeInfo {
    pub protocol_version: u32,
    pub state: RuntimeState,
}

impl RuntimeInfo {
    pub fn new() -> Self {
        Self {
            protocol_version: PROTOCOL_VERSION,
            state: RuntimeState::Starting,
        }
    }

    pub fn ready(mut self) -> Self {
        self.state = RuntimeState::Ready;
        self
    }
}

impl Default for RuntimeInfo {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn protocolo_e_estado_inicial_sao_deterministicos() {
        let info = RuntimeInfo::new();
        assert_eq!(info.protocol_version, 1);
        assert_eq!(info.state, RuntimeState::Starting);
    }

    #[test]
    fn runtime_pode_ser_marcado_como_pronto() {
        let info = RuntimeInfo::new().ready();
        assert_eq!(info.state, RuntimeState::Ready);
    }
}
