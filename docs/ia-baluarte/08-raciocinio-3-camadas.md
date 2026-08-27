# 08 — Raciocínio em 3 Camadas

A regra de ouro do Lucas: para economizar tempo, a IA **usa primeiro o
próprio site**; se não achar, **busca na internet**; se nem aí existir, ela
**deduz uma hipótese viável** com base em evidências (sem inventar fatos).

É o que se chama de **fallback sequencial** com **geração de hipóteses**.

## As 3 camadas

### 🟢 Camada 1 — O site (prioridade máxima, mais rápida)
A IA olha o estado das funções (doc 7) e tenta resolver com as ferramentas do
site (doc 6). Se resolve, responde na hora — **sem gastar internet**.

### 🌐 Camada 2 — A internet (fallback)
Biblioteca nova, erro raro, doc atualizada → busca na web (doc 4, Gemini com
Google Search, ou outra API de busca como Tavily/Serper). Lê as páginas,
extrai e responde.

### 🧠 Camada 3 — Dedução viável (último recurso)
Se nem a internet tem a resposta (ex.: um bug só seu, misturando duas funções
do site), a IA **junta as pistas** e monta uma hipótese — proibido inventar
("alucinar") ou só dizer "não sei".

## Algoritmo (referência)

```js
async function processarPergunta(pergunta) {
  // 1) SITE
  const estado = lerBaluarteStatus();
  const local = tentarResolverComSite(pergunta, estado);
  if (local.sucesso) return local.texto;          // rápido, sem internet

  // 2) INTERNET
  const web = await buscarNaInternet(pergunta);
  if (web.encontrouRespostaExata) return web.resposta;

  // 3) DEDUÇÃO
  const hipotese = deduzirSolucaoViavel(estado, web);
  return `[Dedução baseada em evidências]\n${hipotese}`;
}
```

## Prompt do sistema (deixar fixo no backend/agente)

```text
Você é o núcleo do Projeto Baluarte Mark XIII.
Sua tomada de decisão segue estritamente esta ordem:

1. VERIFICAÇÃO LOCAL: tente resolver com as funções e o estado do próprio site.
2. BUSCA WEB: se o site não tiver, pesquise na internet documentação real.
3. DEDUÇÃO LÓGICA: se a resposta exata não existir, é PROIBIDO inventar.
   Junte as pistas e monte um raciocínio dedutivo.

No modo 3, estruture a resposta assim:
- "Evidência A: [fato conhecido X]"
- "Evidência B: [comportamento conhecido Y]"
- "Conclusão/Hipótese: com base em A e B, a causa provável é Z; tente fazer …"

Regras: nunca alucine; extrapole apenas regras lógicas conhecidas;
mostre o raciocínio para o usuário entender de onde veio a solução.
```

## Como fica para o usuário

| Cenário | Caminho | Tempo |
|---|---|---|
| "Como mudo a cor do editor?" | Camada 1 (site) | < 1 s |
| "Qual a última versão da lib X?" | Camada 2 (internet) | ~3 s |
| "Misturei a função 4 com a 11 e o sinal some, por quê?" | Camada 3 (dedução) | ~2 s |

Exemplo de resposta no modo dedução:
> ⚙️ **Baluarte — Análise de Núcleo:**
> - Busca local: não há padrão pronto para esse chip no simulador.
> - Busca web: nenhum registro exato desse erro.
> - Dedução: como a porta XOR inverte em nível alto **e** o componente real
>   gera capacitância parasita, é provável que o motor calcule o loop de
>   feedback rápido demais. **Tente** colocar uma porta NOT extra como atraso.

Esse comportamento de "detetive de código" deixa o Baluarte resiliente mesmo
quando a resposta não existe pronta em lugar nenhum.
