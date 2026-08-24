# V2 — Lifecycle ↔ Runtime contract

A integração do Runtime com o lifecycle segue uma ordem fixa.

> **Quem executa esta ordem:** o `v2/core/ciclo.ts`, através de um Runtime Host
> injetado (`LifecycleOptions.runtime`). Até 17/08/2026 este documento descrevia
> uma ordem que **nenhum caminho de produção percorria**: o Host
> (`criarLifecycleRuntime`) existia e era testado, mas o ciclo real ia direto ao
> `init`. Contrato sem executor é intenção.

## Subida

```text
Registry selado
  → Runtime.open
  → module.init
  → module.start
```

O módulo não deve iniciar trabalho antes de o Runtime ter sido autorizado e aberto.

## Descida

```text
module.stop
  → Runtime.close
  → module.dispose
```

O Runtime é fechado antes do descarte final do módulo para que recursos de execução sejam encerrados antes de a instância desaparecer.

## Invariantes

- Registry deve estar selado antes da abertura.
- Um módulo aberto não é aberto novamente.
- `close` de módulo não aberto é no-op.
- Falha em `close` não pode deixar o registro interno marcado como aberto.
- Transporte e processo Rust permanecem detalhes abaixo da Session.

## Invariantes do ciclo (quem chama o Host)

- **Sem autorização não há `init`.** Se a abertura falha, o módulo não executa
  nenhuma fase e não entra em `ciclo.vivos()` — logo não pode ser `running`.
- A falha da abertura é reportada na fase **`runtime`**, não em `init`: `init`
  não rodou, e acusá-lo mandaria quem lê o diagnóstico para o arquivo errado.
- A abertura respeita o **mesmo teto** das outras fases (`tetoInitMs`). Runtime
  que não responde pendura a subida igual a um `init` que trava.
- Módulo que falha *depois* de abrir tem o Host fechado assim mesmo — a descida
  só percorre os vivos, então uma sessão órfã não seria fechada por mais ninguém.
- Falha ao fechar não interrompe o `dispose`, e falha no `stop` não impede o
  fechamento: desligamento que desiste no primeiro erro vaza o resto.
- O Host é **opcional**. Sem ele o ciclo se comporta como antes — é o que mantém
  honestos os testes de unidade das outras peças, que não têm Runtime.

## O que ainda não é verdade

O entrypoint (`v2/harness/main.js`) injeta um Host cuja sessão é a **autorização
sem transporte** (`criarGrantRuntime`). Isso prova que o ciclo pede autorização
antes do `init` e que um módulo sem ela não sobe. **Não** prova nada sobre o
Runtime Rust, que não existe no navegador — o transporte concreto é item
posterior da fila.

Atenção a uma distinção que já quase virou defeito: **grant vazio é autorização
disponível.** `militar` declara `NETWORK`, não recebe nada e continua subindo.
Tratar "sem permissão concedida" como "sem autorização" derrubaria um módulo
correto e transformaria deny-by-default em deny-tudo.
