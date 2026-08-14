# Smoke das rotas — Projeto Baluarte

Rodado em 2026-08-14T16:33:32.565Z · **98 rotas** descobertas de `src/main.js`.

| Estado | Rotas |
|---|---:|
| 🟢 verde | 98 |

## 🟢 Todas as rotas verdes

## 🟡 Avisos (host externo — não falham o teste)

- `/musicas`: HTTP 401: https://hcwzsxdcvmswebunznak.supabase.co/rest/v1/rpc/ingest_stat
- `/videos`: rede: https://www.youtube-nocookie.com/api/stats/qoe?cpn=7EOk1N2okCSCPn2J&el=embedded&ns=yt&fexp — net::ERR_ABORTED
- `/mapa`: console: Error: sources.gebco.maxzoom: number expected, undefined found
    at Object.xi [as t] (https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js:42:133151)
    at ce (https://unpkg.com/maplibre-gl@4.7.
- `/memoria`: HTTP 404: http://127.0.0.1:4173/api/memory

## As 8 rotas mais lentas

| Rota | ms | texto |
|---|---:|---:|
| `/musicas` | 26067 | 3622 |
| `/arsenal-expandido` | 1853 | 112566 |
| `/modelos-3d` | 1652 | 34924 |
| `/home` | 1636 | 3772 |
| `/vanguard` | 1608 | 12141 |
| `/apis` | 1454 | 913 |
| `/media` | 1453 | 425 |
| `/conselho` | 1451 | 913 |
