# V2 — Regras de teste

> Este documento **não** é teoria de teste. Cada regra abaixo saiu de um erro
> concreto cometido construindo a fundação da V2, e a maioria custou uma rodada
> de mutantes ou um teste vermelho para aparecer. A Regra 6 do plano diz que
> código crítico sem teste não está concluído; aqui está o que "com teste"
> precisa significar para a afirmação valer.

## 1. Teste que nunca falhou não é teste

Antes de confiar num teste, **plante o defeito que ele deveria pegar** e confirme
que ele fica vermelho.

Isso não é rigor extra: nesta sessão, **três mutantes sobreviveram** ao
escalonador de trabalho na primeira rodada, e em nenhum dos casos o código estava
errado — os testes é que não isolavam o que diziam isolar:

| Defeito plantado | Por que passou mesmo assim |
| --- | --- |
| removi o teto **global** de concorrência | o teste usava `limite: 3, limitePorModulo: 3`; o teto por módulo salvava sozinho |
| removi a retirada da fila no cancelamento | a checagem antes de executar cobria — a tarefa rejeitava, só que mais tarde |
| removi a checagem antes de executar | a retirada da fila cobria |

As duas últimas são **defesa em profundidade**, que é bom desenho. Mas defesa não
testada individualmente é sorte: no dia em que uma for removida por refatoração,
nada avisa.

**A regra:** cada defesa tem um teste que falha quando *só ela* é removida.

## 2. `await` pode esconder a diferença entre "resolveu" e "adiou"

O teste de cancelamento na fila esperava a rejeição — e sem a retirada a rejeição
**vem mesmo**, só que quando chegaria a vez da tarefa. O `await` mascarava
esperando mais.

Só medir o estado **no meio** separou os dois casos:

```js
ctrl.abort();
await espera(5);
assert.equal(e.estado().naFila, 1, 'a cancelada continuou ocupando lugar');
```

**A regra:** quando o defeito é *demora* e não *ausência*, asserção sobre o
resultado final não serve. Observe o estado intermediário.

## 3. Limiar de tamanho é asserção fraca

O teste de integração afirmava `conteudo.length > 100`. Quando a view nativa da
V2 — mais enxuta que a página da V1 — passou a renderizar corretamente, o teste
**reprovou o certo**.

Limiar de tamanho erra dos dois lados: aprova qualquer coisa grande e reprova o
correto quando ele encolhe.

**A regra:** afirme **identidade**, não volume. `/Lab de Criptografia/` diz o que
`length > 100` nunca disse.

## 4. Regex grosseira em teste de segurança erra dos dois lados

A asserção "nenhum evento carrega conteúdo sensível" foi escrita como
`/emit\([^)]*entrada\.value/` — e reprovou `{ tamanho: entrada.value.length }`,
que é justamente a forma **correta**.

O reflexo seguinte seria afrouxar a regex, e aí ela aprovaria o vazamento real.

**A regra:** extraia a estrutura e afirme sobre ela. E **prove que a asserção
pega o defeito** plantando o vazamento — foi assim que a versão precisa se
confirmou.

## 5. Ponte de teste que congela estado mente sobre o sistema vivo

O banco de prova expunha `window.__v2.metricas` como **valor**, calculado no
boot. O teste clicava, a métrica era registrada, e a leitura devolvia o
instantâneo anterior: *"executou, mas não mediu"* — com a medição funcionando.

**A regra:** o que o teste lê de um sistema vivo é **função**, não valor. Se for
valor, ele responde sobre o passado.

## 6. Renderizar não prova que funciona

A view nativa apareceu na tela mesmo com o `boot` **sem injetar** `metricas` e
`trabalho` — porque a construção não os usa, só o clique usa. Um teste que só
verifica renderização daria verde num módulo que quebra no primeiro botão.

**A regra:** teste de interface exercita **a interação**, não a pintura.

## 7. Mock prova o mock

Todos os testes do `boot` usavam um router falso, e passavam. O router **real**
revelou dois defeitos em minutos: `view` devolvendo o módulo em vez do elemento,
e o router que **anuncia** em vez de montar. Em ambos, as rotas registravam, o
contador batia, e a tela ficava vazia — sucesso aparente.

**A regra:** o que atravessa fronteira (router, banco, navegador) precisa de pelo
menos um teste contra a coisa real. Os do Postgres e o `v2:integracao` existem
por isso, e estão no CI.

## 8. Suposição do teste ≠ defeito do código

Um teste afirmou `total === 2` e falhou: `aplicarPolitica()` grava uma chave por
conta própria, então eram 3. **O código estava certo.**

Corrigir o código para o teste passar teria sido consertar o lado errado.

**A regra:** teste vermelho é uma pergunta, não um veredicto. Descubra de quem é
o erro antes de mexer.

## 9. Convenção conferida, não suposta

O módulo militar precisa do nome do export de 15 páginas, e o padrão é
`kebab → camelCasePage`. **Foi verificado nas 15** antes de virar código — e o
carregador levanta dizendo qual página fugiu do padrão, em vez de montar
`undefined`.

**A regra:** convenção não verificada é suposição com cara de regra.

## 10. Erro que só aparece sob carga

O escalonador quase teve recursão profunda: mil tarefas resolvendo em sequência
estouram a pilha se o próximo passo for chamado direto. `queueMicrotask` resolve,
e o comentário registra por quê — porque o teste com dez tarefas **nunca**
mostraria isso.

**A regra:** para código concorrente, pense no caso de mil. O teste de três não
distingue implementação boa de implementação sortuda.

---

## O que roda, e onde

```sh
npm test              # 682 testes JS — unidade e integração entre peças
npm run tipos:v2      # verificação de tipo; exit 0 é obrigatório para commitar
npm run v2:integracao # navegador real contra v2/harness — no CI
```

Postgres (esquema + fila + worker Python) tem rotina própria:
[`../../v2/data/README.md`](../../v2/data/README.md). **Ainda não está no CI** —
o workflow não sobe banco, e pendurar um serviço no pipeline da V1 que está
congelando seria mexer onde não se deve.
