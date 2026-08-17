# Smoke das rotas — Projeto Baluarte

Rodado em 2026-08-17T15:19:46.461Z · **98 rotas** descobertas de `src/main.js`.

| Estado | Rotas |
|---|---:|
| 🟢 verde | 98 |

## 🟢 Todas as rotas verdes

## 🟡 Avisos (host externo — não falham o teste)

- `/musicas`: HTTP 401: https://hcwzsxdcvmswebunznak.supabase.co/rest/v1/rpc/ingest_stat
- `/videos`: rede: https://www.youtube-nocookie.com/api/stats/qoe?cpn=zYkEpwagMCLGyNoZ&el=embedded&ns=yt&fexp — net::ERR_ABORTED
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
| `/home` | 13709 | 3695 |
| `/musicas` | 4269 | 3622 |
| `/tv` | 2618 | 852 |
| `/vanguard` | 2166 | 12141 |
| `/simbolos` | 1918 | 17538 |
| `/arsenal-expandido` | 1649 | 112566 |
| `/home2` | 1598 | 3772 |
| `/poder-militar` | 1577 | 1365 |
