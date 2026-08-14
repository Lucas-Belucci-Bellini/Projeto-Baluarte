# Smoke das rotas — Projeto Baluarte

Rodado em 2026-08-14T17:57:56.908Z · **98 rotas** descobertas de `src/main.js`.

| Estado | Rotas |
|---|---:|
| 🟢 verde | 98 |

## 🟢 Todas as rotas verdes

## 🟡 Avisos (host externo — não falham o teste)

- `/videos`: rede: https://www.youtube-nocookie.com/api/stats/qoe?cpn=-YQa1jxHB-wchXkg&el=embedded&ns=yt&fexp — net::ERR_ABORTED
- `/tv`: rede: https://www.youtube.com/api/stats/qoe?cpn=ZsZTorzRoQyAGcoL&el=embedded&ns=yt&fexp=v1%2C100 — net::ERR_ABORTED
- `/mapa`: console: Error: sources.gebco.maxzoom: number expected, undefined found
    at Object.xi [as t] (https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js:42:133151)
    at ce (https://unpkg.com/maplibre-gl@4.7.
- `/memoria`: HTTP 404: http://127.0.0.1:4173/api/memory

## As 8 rotas mais lentas

| Rota | ms | texto |
|---|---:|---:|
| `/modelos-3d` | 1855 | 34924 |
| `/home` | 1561 | 3772 |
| `/vanguard` | 1546 | 12141 |
| `/sobre` | 1500 | 5508 |
| `/radar` | 1499 | 1414 |
| `/arsenal` | 1485 | 14499 |
| `/jarvis` | 1482 | 913 |
| `/academia` | 1468 | 5365 |
