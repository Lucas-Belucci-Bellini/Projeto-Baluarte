# Baluarte Runtime — primeiro corte

Este diretório é o **Core de Runtime local** definido pelo ADR-004. Ele não é o
Core de Orquestração do navegador.

## Escopo desta etapa

- política explícita de capacidades;
- leitura de arquivos somente quando `READ_FILES` foi concedida;
- confinamento do caminho a uma raiz autorizada;
- contrato lógico `RuntimeRequest` → `RuntimeResponse`;
- testes da fronteira de permissão, filesystem e contrato.

## Contrato atual

O Runtime recebe uma operação `ReadFile { path }` e devolve `FileContents`
ou `Error`. Esse contrato é intencionalmente independente de transporte.

**Ainda não há IPC, Tauri ou serialização JSON.** O transporte será escolhido
somente depois que a fronteira lógica estiver estável e testada.

## Deliberadamente fora desta etapa

Processos, rede, secrets, IPC, supervisão de agentes e integração com Tauri ainda
não entram aqui. Primeiro a fronteira precisa existir e ser testável; depois as
capacidades são adicionadas uma a uma.

Isso segue a ordem registrada no ADR-004: o Runtime Rust vem antes da conversão
sintática do Core de Orquestração para TypeScript, porque a fronteira Runtime ↔
Orquestração precisa estar definida antes de o lado TypeScript depender dela.
