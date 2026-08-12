# Baluarte Runtime — primeiro corte

Este diretório é o **Core de Runtime local** definido pelo ADR-004. Ele não é o
Core de Orquestração do navegador.

## Escopo desta etapa

- política explícita de capacidades;
- leitura de arquivos somente quando `READ_FILES` foi concedida;
- confinamento do caminho a uma raiz autorizada;
- testes da fronteira de permissão e filesystem.

## Deliberadamente fora desta etapa

Processos, rede, secrets, IPC, supervisão de agentes e integração com Tauri ainda
não entram aqui. Primeiro a fronteira precisa existir e ser testável; depois as
capacidades são adicionadas uma a uma.

Isso segue a ordem registrada no ADR-004: o Runtime Rust vem antes da conversão
sintática do Core de Orquestração para TypeScript, porque a fronteira Runtime ↔
Orquestração precisa estar definida antes de o lado TypeScript depender dela.
