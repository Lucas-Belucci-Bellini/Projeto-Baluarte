# Smoke das rotas — Projeto Baluarte

Rodado em 2026-08-14T18:45:41.102Z · **98 rotas** descobertas de `src/main.js`.

| Estado | Rotas |
|---|---:|
| 🟢 verde | 98 |

## 🟢 Todas as rotas verdes

## 🟡 Avisos (host externo — não falham o teste)

- `/musicas`: HTTP 401: https://hcwzsxdcvmswebunznak.supabase.co/rest/v1/rpc/ingest_stat
- `/videos`: rede: https://www.youtube-nocookie.com/api/stats/qoe?cpn=X6AGhbm5hLcJr_PP&el=embedded&ns=yt&fexp — net::ERR_ABORTED
- `/mapa`: console: Error: sources.gebco.maxzoom: number expected, undefined found
    at Object.xi [as t] (https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js:42:133151)
    at ce (https://unpkg.com/maplibre-gl@4.7.
- `/memoria`: HTTP 404: http://127.0.0.1:4173/api/memory

## As 8 rotas mais lentas

| Rota | ms | texto |
|---|---:|---:|
| `/musicas` | 18727 | 3622 |
| `/simbolos` | 2012 | 17538 |
| `/modelos-3d` | 1680 | 34924 |
| `/home` | 1563 | 3772 |
| `/vanguard` | 1523 | 12141 |
| `/home2` | 1488 | 3772 |
| `/arsenal-expandido` | 1481 | 112566 |
| `/poder-militar` | 1478 | 1365 |
