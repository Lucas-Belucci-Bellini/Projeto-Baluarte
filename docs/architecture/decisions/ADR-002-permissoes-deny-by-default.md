# ADR-002 — Acesso negado por omissão, e permissão precisa ser declarada

**Data:** 2026-08-09 · **Estado:** aceita · **Contexto:** [#420](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420) · **Implementa:** `src/core/permissions.js`

## O problema

Hoje o caminho de uma ação no Baluarte é:

```
JARVIS → tool → executa
```

Enquanto o único chamador é o operador clicando na tela, isso é aceitável — quem
decide é uma pessoa olhando. Mas o projeto vai ter JARVIS agente, servidor MCP e
Nexus, e nos três o **chamador escolhe a ação sozinho**. Nesse momento "executa e
pronto" deixa de ser simplicidade e vira acesso irrestrito.

E o Baluarte não é uma coleção de páginas inofensivas: tem terminal, editor de
código, criptografia, esteganografia, acesso a arquivos pela ponte do Launcher e
integração com APIs externas.

## A decisão

Todo acesso passa por um Permission Manager:

```
JARVIS → Permission → Tool → Result
```

Com quatro regras, todas cobradas por teste:

**1. Deny-by-default.** `checar()` de algo não concedido é `false`. Não existe
"se não configurou, libera".

**2. Permissão precisa ser declarada antes de ser usada.** `exigir('arsenl.read')`
(com o typo) não vira um deny — lança com `code: 'desconhecida'`.

**3. Curinga nunca alcança risco `restrito`.** `conceder('terminal.*')` cobre
`terminal.read` e `terminal.write`, jamais `terminal.execute`. Revogar por
curinga, ao contrário, **alcança tudo**.

**4. Sem risco declarado, assume-se `restrito`.** Classificar errado deve doer,
não passar.

## Por quê

**A regra 2 é a menos óbvia e a mais importante.** Num sistema em que a permissão
é uma string solta, o typo é o modo de falha mais provável — e é o único que o
deny-by-default sozinho **não** pega: `checar('arsenl.read')` devolveria `false`,
que é indistinguível de "o operador não autorizou". A UI então pede autorização
ao operador, ele concede, e continua sem funcionar. Falhar alto transforma horas
de confusão em uma linha de erro.

**A regra 3 vem de como as permissões são realmente concedidas.** Ninguém marca
40 caixinhas; a pessoa clica em "liberar o Arsenal". Se o curinga fosse total,
conveniência viraria o caminho pelo qual um agente ganha execução de código. A
assimetria com o revogar é deliberada: **tirar acesso é sempre seguro, dar não é.**

**Módulo puro**, sem DOM nem storage: é o mesmo motor para web, app e um futuro
servidor MCP, e roda em Node puro nos testes. Quem persiste chama
`exportar()`/`importar()` e decide onde guardar.

## Consequências

- Toda tool do JARVIS precisa declarar a permissão que exige. `protegido()` faz a
  checagem virar propriedade do **registro**, não disciplina de quem escreve a
  tool — assim uma tool nova nasce protegida mesmo que o autor esqueça.
- O estado exportado guarda **ids exatos**, nunca o curinga usado. Se guardasse
  `arsenal.*`, uma permissão `arsenal.delete` criada amanhã apareceria concedida
  no próximo boot sem ninguém ter autorizado.
- Concessão importada de uma permissão que não existe mais é **descartada**: o
  estado gravado é lembrança, não autoridade.
- Existe uma auditoria em memória (últimas 200 decisões) para que
  `/sistema/diagnostico` e o JARVIS respondam "por que isso foi negado?" sem log
  externo.
- **Falta o catálogo.** O motor está vazio: nenhuma permissão real declarada e
  nenhuma tool atrás dele ainda. Esse é o próximo passo na
  [fila de hardening](../../HARDENING-1.0.0.md), e até ele acontecer esta decisão
  está implementada mas não *aplicada*.

## Alternativas descartadas

**Permissões só por nível (`read`/`write`/`admin`), sem domínio.** Simples demais:
"write" abrangeria alterar o Arsenal e apagar arquivo pela ponte do Launcher, que
não são a mesma conversa.

**Permissão implícita pela rota** ("está em `/terminal`, então pode terminal").
Funciona para o operador e desmonta na hora em que o chamador é um agente, que
não está em rota nenhuma.

**Deixar para a V2.** Foi a alternativa mais tentadora, e é errada pela ordem que
a #420 fixou: o MCP não pode vir antes das proteções. Construir a porta antes da
fechadura significaria ter uma porta aberta durante todo o intervalo.
