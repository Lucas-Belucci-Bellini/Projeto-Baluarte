# Smoke das rotas — Projeto Baluarte

Rodado em 2026-08-14T16:55:23.292Z · **98 rotas** descobertas de `src/main.js`.

| Estado | Rotas |
|---|---:|
| 🟢 verde | 98 |

## 🟢 Todas as rotas verdes

## 🟡 Avisos (host externo — não falham o teste)

- `/videos`: rede: https://www.youtube-nocookie.com/api/stats/qoe?cpn=VgvIpMOsRLHQIs1N&el=embedded&ns=yt&fexp — net::ERR_ABORTED
- `/tv`: rede: https://www.youtube.com/api/stats/qoe?cpn=XpC-sFY10s_qcA8R&el=embedded&ns=yt&fexp=v1%2C238 — net::ERR_ABORTED
- `/mapa`: console: Error: sources.gebco.maxzoom: number expected, undefined found
    at Object.xi [as t] (https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js:42:133151)
    at ce (https://unpkg.com/maplibre-gl@4.7.
- `/memoria`: HTTP 404: http://127.0.0.1:4173/api/memory

## As 8 rotas mais lentas

| Rota | ms | texto |
|---|---:|---:|
| `/videos` | 1966 | 867 |
| `/arsenal-expandido` | 1786 | 112566 |
| `/modelos-3d` | 1681 | 34924 |
| `/vanguard` | 1609 | 12141 |
| `/home` | 1598 | 3772 |
| `/simbolos` | 1479 | 17538 |
| `/zomboid` | 1467 | 1447 |
| `/dossie` | 1444 | 4198 |
