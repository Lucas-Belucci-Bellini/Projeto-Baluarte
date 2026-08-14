# Smoke das rotas — Projeto Baluarte

Rodado em 2026-08-14T16:07:23.244Z · **98 rotas** descobertas de `src/main.js`.

| Estado | Rotas |
|---|---:|
| 🟢 verde | 98 |

## 🟢 Todas as rotas verdes

## 🟡 Avisos (host externo — não falham o teste)

- `/videos`: rede: https://www.youtube-nocookie.com/api/stats/qoe?cpn=pfzes5qbyywFr3Df&el=embedded&ns=yt&fexp — net::ERR_ABORTED
- `/tv`: rede: https://www.youtube.com/api/stats/qoe?cpn=yJxMK42dyEjpzj2w&el=embedded&ns=yt&fexp=v1%2C240 — net::ERR_ABORTED
- `/mapa`: console: Error: sources.gebco.maxzoom: number expected, undefined found
    at Object.xi [as t] (https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js:42:133151)
    at ce (https://unpkg.com/maplibre-gl@4.7.
- `/memoria`: HTTP 404: http://127.0.0.1:4173/api/memory

## As 8 rotas mais lentas

| Rota | ms | texto |
|---|---:|---:|
| `/modelos-3d` | 1695 | 34924 |
| `/home` | 1619 | 3772 |
| `/vanguard` | 1540 | 12141 |
| `/qr-studio` | 1539 | 318 |
| `/arsenal` | 1501 | 14499 |
| `/arsenal-expandido` | 1484 | 112566 |
| `/forcas-especiais` | 1467 | 3113 |
| `/aprendizado` | 1455 | 913 |
