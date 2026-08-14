# Smoke das rotas — Projeto Baluarte

Rodado em 2026-08-14T17:20:13.205Z · **98 rotas** descobertas de `src/main.js`.

| Estado | Rotas |
|---|---:|
| 🟢 verde | 98 |

## 🟢 Todas as rotas verdes

## 🟡 Avisos (host externo — não falham o teste)

- `/videos`: rede: https://www.youtube-nocookie.com/api/stats/qoe?cpn=04wfLkCTRXya1lGU&el=embedded&ns=yt&fexp — net::ERR_ABORTED
- `/tv`: rede: https://www.youtube.com/api/stats/qoe?cpn=Sz9uQSnEapfaR3fE&el=embedded&ns=yt&fexp=v1%2C240 — net::ERR_ABORTED
- `/vanguard`: console: Error: sources.gebco.maxzoom: number expected, undefined found
    at Object.xi [as t] (https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js:42:133151)
    at ce (https://unpkg.com/maplibre-gl@4.7.
- `/mapa`: console: Error: sources.gebco.maxzoom: number expected, undefined found
    at Object.xi [as t] (https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js:42:133151)
    at ce (https://unpkg.com/maplibre-gl@4.7.
- `/memoria`: HTTP 404: http://127.0.0.1:4173/api/memory

## As 8 rotas mais lentas

| Rota | ms | texto |
|---|---:|---:|
| `/vanguard` | 2784 | 12141 |
| `/simbolos` | 2020 | 17538 |
| `/arsenal` | 1879 | 14499 |
| `/modelos-3d` | 1651 | 34924 |
| `/home` | 1562 | 3772 |
| `/terminal` | 1555 | 478 |
| `/videos` | 1461 | 867 |
| `/ia-proprietaria` | 1456 | 913 |
