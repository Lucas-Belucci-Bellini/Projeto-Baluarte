# Motor do Project Vanguard — cópia vendorizada

Estes arquivos são **cópia** de `Project-Vanguard/src/engine/`. Não edite aqui:
corrija no repo de origem e recopie.

```bash
cp ../Project-Vanguard/src/engine/*.js src/utils/vanguard/
```

## Por que copiar em vez de instalar

O motor tem **zero dependências e zero DOM** — é a regra mais forte do repo do
Vanguard. Isso é o que permite a mesma física rodar no navegador, no Node, num
Web Worker e numa função serverless, e é o que impede duas implementações do
cálculo divergirem em silêncio.

Como não há dependência, "instalar" é copiar. Enquanto o motor estiver em
evolução, cópia é mais simples que submódulo; quando estabilizar, vira pacote —
aí a cópia passa a ser dívida. O plano está em
`Project-Vanguard/docs/INTEGRACAO-BALUARTE.md`, passo 1.

## O que NÃO fazer

- **Não** reimplementar balística ou MGRS aqui. Uma implementação, testada.
- **Não** importar nada do site nestes arquivos (nem `helpers.js`). No minuto
  em que um deles tocar o DOM, ele deixa de rodar no Node e a regra morre.
- **Não** confundir com `src/utils/arma3-balistica.js`: aquele resolve tiro
  TENSO ("dado o ângulo, onde a bala cai"), este resolve tiro CURVO ("dado o
  alvo, qual o ângulo"). São problemas inversos e os dois continuam existindo.
