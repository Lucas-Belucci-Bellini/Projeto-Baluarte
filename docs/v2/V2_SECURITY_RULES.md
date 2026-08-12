# V2 — Regras de segurança

> Escrito quando houve material: a construção do decisor de permissões revelou
> que a garantia mais citada da arquitetura **não tinha implementação**. As
> regras abaixo têm caso concreto; o que não tem, não está aqui.
>
> Companheiros: [`V2_CODING_STANDARDS.md`](./V2_CODING_STANDARDS.md) §10 (segredo)
> e [`V2_MODULE_RULES.md`](./V2_MODULE_RULES.md) (o manifesto como teto).

## 1. Garantia documentada e não implementada é pior que garantia nenhuma

A `V2_MODULE_RULES.md` afirmava, em negrito: *"deny-by-default segue valendo:
**declarar não é receber**. O manifesto diz o que o módulo pode pedir; conceder é
decisão do Permission System."*

O Permission System não existia. O `contexto.js` respondia:

```js
function pode(p) { return declaradas.has(p); }   // ❌ declarar ERA receber
```

E os testes estavam **verdes**, porque tinham sido escritos olhando a
implementação: um deles se chamava literalmente *"exigir() passa quando o
manifesto declarou"*.

O custo dessa classe de erro é assimétrico. A ausência de uma garantia ninguém
confia; a garantia falsa todo mundo confia — inclusive quem for escrever o
módulo seguinte, olhando o documento e assumindo que o Core protege.

**A regra:** afirmação de segurança em documento tem que apontar para o arquivo
que a implementa e para o teste que a cobra. Sem os dois, é intenção, e intenção
se escreve como *pendência*, não como garantia.

## 2. O caminho de teste é o único caminho

O que fecha o buraco da §1 não é ter escrito o `permissoes.js`: é o
`contexto.js` **recusar montar** um módulo que declara permissão quando não há
decisor injetado.

```
módulo "militar" declara permissões (NETWORK) e o contexto foi montado sem
decisor — injete `permissoes` no Core
```

As duas alternativas são piores, e valem escritas porque as duas são tentadoras:

| Saída | Por que é pior |
| --- | --- |
| negar tudo em silêncio | o módulo quebra longe da causa, e o log não menciona configuração |
| liberar tudo | volta o buraco exatamente onde ele estava, agora com um arquivo por cima dando a impressão de resolvido |

**A regra:** o Core mal montado falha no lugar onde foi mal montado. Degradação
suave é para o que o operador consegue contornar; para invariante de segurança,
é disfarce.

## 3. Concessão ⊆ declaração — nos dois sentidos, e ao longo do tempo

Três invariantes, e cada um tem um teste que morre sem ele:

1. **Conceder além do declarado é recusado.** Se a política pudesse conceder o
   que o manifesto não declara, o manifesto deixaria de ser a verdade sobre o
   alcance do módulo — e ele é a única fonte de tudo mais.
2. **Teto que estreita derruba a concessão que não cabe mais.** Um módulo que
   numa versão nova deixasse de declarar `NETWORK` continuaria com `NETWORK`: a
   concessão sobreviveria ao próprio fundamento.
3. **Estado gravado é lembrança, não autoridade.** `importar()` descarta o que
   não passa no teto atual. Sem isso, um arquivo de ontem reintroduz permissão
   pela porta dos fundos.

O invariante 2 quase passou sem teste próprio: o mutante que apagava a poda
**sobreviveu**, porque `avaliar()` consulta o teto antes da concessão e cobria.
São defesa em profundidade — e defesa não testada sozinha é sorte. O que só a
poda impede é a permissão **voltar do morto**: teto estreita, concessão órfã fica
guardada, teto reabre numa versão seguinte, e a permissão retorna sem ninguém ter
decidido nada. Dois testes escritos depois do mutante cobrem isso.

## 4. "Não" tem três significados, e confundi-los treina o operador a clicar sim

| Veredicto | O que é | O que a interface faz |
| --- | --- | --- |
| `desconhecida` | permissão fora do vocabulário | nada — é typo de quem chamou |
| `nao-declarada` | existe, o módulo não pediu no manifesto | nada — é defeito do módulo |
| `negada` | declarada e não concedida | **pode** oferecer ao operador conceder |

Só o terceiro é uma negativa legítima. Uma interface que pede autorização para um
typo ensina o operador a autorizar sem ler — e aí a primeira janela que importa
de verdade também é aprovada no reflexo.

## 5. Consulta de permissão é viva, nunca fotografia

`pode()` pergunta ao decisor no momento da chamada. Se fosse valor capturado no
`init`, revogar não alcançaria um módulo já no ar — e *"reinicie o Baluarte para
a revogação valer"* não é revogação.

É o mesmo defeito que a ponte do banco de prova teve com as métricas, e ele
**reapareceu no campo vizinho**: o `diagnostico` continuou sendo um retrato do
boot mesmo depois de as métricas virarem função. Bastou existir algo que muda em
runtime para o erro voltar dois metros ao lado.

**A regra:** o que muda em runtime se lê por função. Em produção e no teste.

## 6. Rastro de negativa é obrigatório, e vem antes do `throw`

```js
log.aviso('acesso negado', { permissao: p, veredicto });
decisor?.anotar(id, p, veredicto);
throw new ErroPermissao(id, p, veredicto);
```

Nessa ordem, porque quem captura a exceção pode engoli-la — e aí a tentativa de
acesso indevido some sem deixar rastro. O registro precede a decisão de quem
chamou.

E o anúncio no bus **não pode derrubar a decisão**: quem escuta uma negativa não
tem o poder de impedir a negativa de acontecer. Mesma regra do destino de log,
mesmo motivo.

A trilha tem teto (`TETO_AUDITORIA = 500`). Um módulo em laço de negação comeria
a memória, e o sintoma apareceria longe da causa.

## 7. Credencial: migra-se a REFERÊNCIA, nunca o valor

Instrução permanente do operador, e ela vale para toda a reconstrução:

> *"não coloquem as chaves de API diretamente no código nem façam 'migração'
> delas copiando secrets para arquivos novos. As credenciais devem continuar em
> mecanismos de secrets/configuração apropriados. Na reconstrução, vocês migram a
> referência à credencial, não a credencial em si."*

O que o `config.js` faz para que isso não dependa de disciplina:

- **segredo com valor padrão é recusado na declaração** — um padrão no código é
  uma credencial no código, com outro nome;
- `ler()` recusa segredo e manda usar `revelar()`, cujo nome é feio de propósito;
- `toJSON` devolve o diagnóstico mascarado, então `JSON.stringify(config)` — que
  é como um segredo chega a um log sem ninguém querer — não vaza.

O caminho perigoso é mais difícil de escrever que o seguro; o acidental é
impossível.

## 8. Evento carrega o fato, não o conteúdo

```js
ctx.bus?.emit('cripto:cifrou', { tamanho: entrada.value.length });   // ✅
```

Qualquer módulo com `bus.on('*')` vê tudo que passa. Um evento com o texto
cifrado dentro vaza pelo caminho de quem observa — sem nenhuma permissão
envolvida, porque escutar é livre por desenho.

**A regra:** payload de evento diz **que aconteceu** e o mínimo para reagir.
Conteúdo fica no módulo, e quem precisa dele pede pela `api`, onde há fronteira.

## 9. Namespace obrigatório resolve por construção o que revisão não pega

`src/utils/jarvis-tools.js:232` faz `storage.set('editor:state', …)`, conhecendo
o formato interno do editor (`tabs`, `activeId`). Nenhuma análise estática aponta
isso: é uma chamada legítima a uma função legítima com uma string.

Na V2 é **impossível**: um módulo `jarvis` que declarasse `editor:state` é
recusado pelo validador, porque a chave não começa com `jarvis:`. O caminho
legítimo passa a ser a `api` do editor.

**A regra:** quando dá para tornar o caminho errado impossível por construção,
isso vale mais que qualquer quantidade de revisão — revisão depende de alguém
lembrar, construção não depende de ninguém.

## 10. Isto não é sandbox, e dizer isso faz parte

Em JavaScript, um módulo determinado ainda consegue `import { storage } from
'../core/storage.js'` e furar tudo. O que a arquitetura entrega é a diferença
entre **o caminho errado ser impossível** e **ser visivelmente errado**: um
import do Core dentro de um módulo salta aos olhos em revisão; um `storage.set`
disfarçado no meio de 900 linhas, não.

Sandbox de verdade exige outro runtime, e isso é V4 — Regra 17, não implementar o
futuro antes da hora. O que não se pode é chamar o que existe de sandbox.

---

## Onde cada coisa mora

| | |
| --- | --- |
| decisor | [`v2/core/permissoes.js`](../../v2/core/permissoes.js) · testes: `test/v2/permissoes.test.js` (25) |
| recorte por módulo | [`v2/core/contexto.js`](../../v2/core/contexto.js) · testes: `test/v2/contexto.test.js` |
| segredo e configuração | [`v2/core/config.js`](../../v2/core/config.js) |
| prova no navegador | `scripts/v2-integracao.mjs` — concede e revoga com o sistema no ar |

Vocabulário atual (§9 do #423): `READ_FILES · WRITE_FILES · NETWORK · DATABASE ·
SYSTEM_INFO · USER_DATA · EXECUTION`. É o nível **do módulo**. O nível da ação
(`arsenal.read`, `terminal.execute`, com risco e curinga) existe na V1 e entra na
V2 quando houver tools da V2 para governar — não antes.
