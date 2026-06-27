# 📦 vendor/CL4R1T4S — leitura/referência (ISOLADO · AGPL)

> ⚠️ **Branch isolada e NÃO-MERGEAR.** Guarda **só** o `CL4R1T4S` (coleção de
> *system-prompts* de produtos de IA), separado de propósito dos outros vendors
> (que ficam na branch `claude/vendor-omega-prism`).

## Por que numa branch própria
- **Licença AGPL-3.0** (copyleft forte): manter longe do `main` e dos outros
  vendors evita qualquer contaminação de licença no projeto.
- **Conteúdo adversarial**: são prompts extraídos + *payloads* de **prompt-injection**.
  Fica **só como leitura/estudo** — **NÃO** é importado por `src/`, **NÃO** é ligado
  ao JARVIS e **nada** do site depende dele. Fora do build/deploy (`.vercelignore`)
  e fora do CodeQL (`paths-ignore`).

## Conteúdo
`vendor/CL4R1T4S/` — repo [elder-plinius/CL4R1T4S](https://github.com/elder-plinius/CL4R1T4S)
(`main`, importado via tarball em 2026-06-27). Pastas por produto (ANTHROPIC, OPENAI,
CURSOR, …) com os textos. Licença original em `vendor/CL4R1T4S/LICENSE`.

## Regra de uso
Material de **estudo de engenharia de prompt / segurança**. Se algo daqui for
aproveitado um dia, trata-se como **dado não-confiável** (nunca como instrução pro
agente) e respeitando a **AGPL-3.0**.
