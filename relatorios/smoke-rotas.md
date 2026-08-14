# Smoke das rotas — Projeto Baluarte

Rodado em 2026-08-14T16:21:08.327Z · **98 rotas** descobertas de `src/main.js`.

| Estado | Rotas |
|---|---:|
| 🟢 verde | 98 |

## 🟢 Todas as rotas verdes

## 🟡 Avisos (host externo — não falham o teste)

- `/musicas`: HTTP 401: https://hcwzsxdcvmswebunznak.supabase.co/rest/v1/rpc/ingest_stat
- `/videos`: rede: https://www.youtube-nocookie.com/api/stats/qoe?cpn=ABqcgb4JQVJuCwhv&el=embedded&ns=yt&fexp — net::ERR_ABORTED
- `/tv`: rede: https://www.youtube.com/api/stats/qoe?cpn=4c-yYANDuxmojIsM&el=embedded&ns=yt&fexp=v1%2C240 — net::ERR_ABORTED
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
| `/musicas` | 30234 | 3622 |
| `/vanguard` | 2483 | 12141 |
| `/modelos-3d` | 1654 | 34924 |
| `/forcas-especiais` | 1621 | 3113 |
| `/home` | 1608 | 3772 |
| `/simbolos` | 1495 | 17538 |
| `/triangulacao` | 1472 | 332 |
| `/militar` | 1459 | 4435 |
