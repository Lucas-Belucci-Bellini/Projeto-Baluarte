# Smoke das rotas — Projeto Baluarte

Rodado em 2026-08-17T15:54:44.932Z · **98 rotas** descobertas de `src/main.js`.

| Estado | Rotas |
|---|---:|
| 🟢 verde | 98 |

## 🟢 Todas as rotas verdes

## 🟡 Avisos (host externo — não falham o teste)

- `/musicas`: HTTP 401: https://hcwzsxdcvmswebunznak.supabase.co/rest/v1/rpc/ingest_stat
- `/videos`: rede: https://www.youtube-nocookie.com/api/stats/qoe?cpn=Jc4BWCPM1nY156ko&el=embedded&ns=yt&fexp — net::ERR_ABORTED
- `/tv`: rede: https://www.youtube.com/api/stats/qoe?fmt=397&afmt=251&cpn=gqJ_vL3UeOS32pUP&el=embedded&ns — net::ERR_ABORTED
- `/vanguard`: console: Error: sources.gebco.maxzoom: number expected, undefined found
    at Object.xi [as t] (https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js:42:133151)
    at ce (https://unpkg.com/maplibre-gl@4.7.
- `/jarvis-dashboard`: HTTP 404: https://fonts.gstatic.com/s/cormorantgaramond/v21/co3hmX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI2
- `/mapa`: console: Error: sources.gebco.maxzoom: number expected, undefined found
    at Object.xi [as t] (https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js:42:133151)
    at ce (https://unpkg.com/maplibre-gl@4.7.
- `/taticas-estrategias`: HTTP 404: https://fonts.gstatic.com/s/cormorantgaramond/v21/co3hmX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI2
- `/banco`: HTTP 404: https://fonts.gstatic.com/s/cormorantgaramond/v21/co3hmX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI2
- `/memoria`: HTTP 404: http://127.0.0.1:4173/api/memory

## As 8 rotas mais lentas

| Rota | ms | texto |
|---|---:|---:|
| `/home` | 13321 | 3695 |
| `/musicas` | 4150 | 3622 |
| `/tv` | 2446 | 852 |
| `/jarvis-dashboard` | 2232 | 913 |
| `/videos` | 2225 | 867 |
| `/vanguard` | 2172 | 12141 |
| `/taticas-estrategias` | 2161 | 2634 |
| `/banco` | 1955 | 533 |
