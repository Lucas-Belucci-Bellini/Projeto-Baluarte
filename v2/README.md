# v2/ — a reconstrução

Fundação da V2. **Não é a V1 e não interfere nela**: os geradores da V1 varrem só
`src/`, o Vite empacota a partir do `index.html`, e nada aqui entra no bundle do
site. A V1 segue servindo em `main` até ser congelada.

Documentação: [`../docs/v2/`](../docs/v2/) — plano, regras, decisões, arquitetura
e stack.

## O que existe

```
core/
  manifest.js   contrato do módulo + validador          23 testes · 5 mutantes
  registry.js   quem vê o conjunto: colisão, ciclo, ordem 22 testes · 5 mutantes
  contexto.js   capacidade recortada por módulo          16 testes · 6 mutantes
  log.js        registro estruturado com dono
  ciclo.js      init/start → stop/dispose, isolado       17 testes · 5 mutantes
  boot.js       o Core CONSUMINDO o Registry              11 testes · 4 mutantes
  bus.js        eventos com origem, versão e curinga      16 testes · 6 mutantes
  config.js     declarada, com faixa e SEGREDO que não vaza 19 testes · 6 mutantes
modules/
  cripto/       o caso fácil (prova que o formato serve)
  editor/       o caso do acoplamento (JARVIS escreve na chave dele)
  militar/      o caso difícil (15 rotas, rede, id que não bate)
data/
  migrations/   schema: proveniência, grafo, fila
  test_*.sql    6 garantias, contra Postgres real
services/
  tarefas/      worker Python: backoff, heartbeat, lote  14 testes
```

## Rodar

```sh
npm test                 # JS — junto com os da V1
npm run tipos:v2         # verificação de tipo (JSDoc + checkJs); exit 0 = limpo
```

Postgres e worker Python: ver [`data/README.md`](./data/README.md).

## O fio condutor

Um módulo **se declara num arquivo** e **recebe** o que pode usar. Não importa
capacidade, não registra rota por fora, não alcança chave alheia.

É a resposta ao que a medição da V1 mostrou: adicionar uma página lá exige tocar
**dez** lugares, e a duplicação já derivou — 22 rotas com nome diferente entre
`sidebar.js` e `shell.js`. O problema nunca foi acoplamento entre módulos (a V1
tem zero inversão de dependência); foi **não existir onde um módulo se declare**.

## O que ainda não existe

Fundação, não módulos — §23 do plano, *preparar ≠ implementar*:

- **Ligar o boot da V2 ao shell da V1.** O `boot.js` já inverte a direção — o
  router **recebe** as rotas do Registry, e o critério de pronto da
  `V2_ARCHITECTURE.md` §8 passa: *um módulo novo aparece em rotas e navegação
  sem editar nenhum arquivo do Core*. Falta o `src/main.js` da V1 usá-lo em vez
  de seus 99 `router.register()` — e isso **mexe na V1**, que está congelando.
  É a primeira coisa depois da tag `v1.0.0`.
- **Ingestão, busca e migração de `src/data/`** (21k linhas de JS que são banco).
