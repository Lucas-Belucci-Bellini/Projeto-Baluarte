# V2 — Transporte Runtime por stdio

A primeira implementação concreta da fronteira Core → Runtime usa um processo Rust com `stdin/stdout`.

```text
Core
  │ JSON line
  ▼
stdin
  │
  ▼
baluarte-runtime (Rust)
  │
  ├─ valida envelope
  ├─ resolve raízes confiáveis
  ├─ cria RuntimeHost
  └─ executa operação autorizada
  │
  ▼
stdout
  │ JSON line
  ▼
Core
```

## Raiz confiável

O caminho base é fornecido pelo processo pai através de `BALUARTE_RUNTIME_ROOT`. O manifesto não escolhe a raiz física.

Para cada módulo autorizado, o Runtime usa `BALUARTE_RUNTIME_ROOT/<modulo>` como raiz física. A política continua responsável por impedir escapes de caminho.

## Protocolo atual

### Autorizar

```json
{"op":"authorize","envelope":{"versao":1,"modulos":[{"modulo":"alpha","permissoes":["READ_FILES"]}]}}
```

Resposta:

```json
{"status":"authorized","modulos":["alpha"]}
```

### Ler arquivo

```json
{"op":"read_file","envelope":{"versao":1,"modulos":[{"modulo":"alpha","permissoes":["READ_FILES"]}]},"modulo":"alpha","path":"hello.txt"}
```

A resposta de sucesso contém os bytes como array JSON. Falhas retornam `status: error`.

## Limites atuais

- uma requisição em voo por processo;
- somente `READ_FILES` está implementado;
- o transporte ainda é uma implementação experimental, não um contrato final de concorrência;
- Tauri continua fora desta etapa.
