# Smoke das rotas — Projeto Baluarte

Rodado em 2026-08-14T17:06:27.833Z · **98 rotas** descobertas de `src/main.js`.

| Estado | Rotas |
|---|---:|
| 🟢 verde | 98 |

## 🟢 Todas as rotas verdes

## 🟡 Avisos (host externo — não falham o teste)

- `/videos`: rede: https://www.youtube-nocookie.com/api/stats/qoe?cpn=qLM1Ala5kV4S2iqi&el=embedded&ns=yt&fexp — net::ERR_ABORTED
- `/tv`: rede: https://www.youtube.com/api/stats/qoe?cpn=1cHNAmIAaOjiEQZH&el=embedded&ns=yt&fexp=v1%2C240 — net::ERR_ABORTED
- `/mapa`: console: Error: sources.gebco.maxzoom: number expected, undefined found
    at Object.xi [as t] (https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js:42:133151)
    at ce (https://unpkg.com/maplibre-gl@4.7.
- `/memoria`: HTTP 404: http://127.0.0.1:4173/api/memory

## As 8 rotas mais lentas

| Rota | ms | texto |
|---|---:|---:|
| `/videos` | 2006 | 867 |
| `/simbolos` | 1997 | 17538 |
| `/modelos-3d` | 1592 | 34924 |
| `/home` | 1548 | 3772 |
| `/vanguard` | 1509 | 12141 |
| `/elites` | 1448 | 4956 |
| `/arsenal` | 1445 | 14499 |
| `/taticas-estrategias` | 1438 | 2634 |
