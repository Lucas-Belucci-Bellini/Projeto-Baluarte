# Smoke das rotas — Projeto Baluarte

Rodado em 2026-08-17T16:40:32.373Z · **98 rotas** descobertas de `src/main.js`.

| Estado | Rotas |
|---|---:|
| 🟢 verde | 98 |

## 🟢 Todas as rotas verdes

## 🟡 Avisos (host externo — não falham o teste)

- `/musicas`: HTTP 401: https://hcwzsxdcvmswebunznak.supabase.co/rest/v1/rpc/ingest_stat
- `/videos`: rede: https://www.youtube-nocookie.com/api/stats/qoe?cpn=RrFoRCz0IbztqYKJ&el=embedded&ns=yt&fexp — net::ERR_ABORTED
- `/mapa`: console: Error: sources.gebco.maxzoom: number expected, undefined found
    at Object.xi [as t] (https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js:42:133151)
    at ce (https://unpkg.com/maplibre-gl@4.7.
- `/memoria`: HTTP 404: http://127.0.0.1:4173/api/memory

## As 8 rotas mais lentas

| Rota | ms | texto |
|---|---:|---:|
| `/home` | 13794 | 3695 |
| `/musicas` | 4549 | 3622 |
| `/videos` | 2680 | 867 |
| `/modelos-3d` | 2074 | 34924 |
| `/historia-militar` | 1704 | 416 |
| `/arma3-tutorial` | 1700 | 29101 |
| `/organizacao-militar` | 1695 | 763 |
| `/radio` | 1688 | 772 |
