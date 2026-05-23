# 01 — Conceitos e Abordagem

## Dá para construir uma IA do zero?

Sim. Há dois caminhos, e eles têm custos muito diferentes:

### Caminho A — Criar os algoritmos do zero
Programar a base matemática (redes neurais, aprendizado de máquina) você mesmo.
- Exige base sólida em **álgebra linear, cálculo e probabilidade**.
- Linguagem usual: **Python**.
- Bibliotecas: **Scikit-learn, TensorFlow, PyTorch**.
- **Realidade:** treinar um modelo de linguagem do zero é caríssimo e
  inviável para um projeto pessoal. Quase ninguém faz isso — usa-se modelo
  pronto / open-source.

### Caminho B — Construir um agente com modelos prontos (RECOMENDADO)
Usar um modelo já treinado (Llama, Gemma, Phi, Qwen, Gemini, GPT…) e montar
em volta dele a inteligência do produto: *prompts*, memória, ferramentas,
busca (RAG). É assim que se constrói algo útil de verdade sem treinar nada.

**Decisão para o Baluarte:** Caminho B. A "nossa IA" é a camada de agente
em volta de um modelo pronto — é aí que mora a personalidade e os poderes do
Baluarte.

---

## Python e JavaScript trabalham juntos

O site é **JS puro**. Se um dia precisarmos de Python (para um modelo no
servidor), os dois conversam assim:

1. **APIs HTTP (padrão da indústria)** — Python expõe uma URL (FastAPI /
   Flask / Django) e o JS chama com `fetch()` trocando **JSON**. É a forma
   recomendada.
2. **Python dentro do Node.js** — `child_process` chama um script Python em
   segundo plano. Útil para scripts pontuais.
3. **Python no navegador (PyScript / Pyodide / WebAssembly)** — roda Python
   direto no browser, compartilhando o DOM com o JS. Interessante, mas pesado.

### Divisão de papéis típica
- **JavaScript (frontend):** interface, cliques, render, envio de requisições.
- **Python (backend):** processa dados, banco, algoritmos pesados (modelos).

> Para o Baluarte, o ideal é evitar servidor sempre que possível (ver doc 3,
> WebLLM no navegador). Python entra só se quisermos o plano B com Gemini
> (doc 4).

---

## Resumo da decisão

| Pergunta | Resposta para o Baluarte |
|---|---|
| Treinar modelo do zero? | Não. Usar modelo pronto. |
| Onde a IA roda? | De preferência **no navegador** (sem servidor). |
| Linguagem da "inteligência"? | JavaScript (a cola/agente); Python só no plano B. |
| O diferencial é o quê? | O **agente**: ferramentas + memória + raciocínio. |
