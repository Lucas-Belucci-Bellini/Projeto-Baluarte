# 🕸️ Nexus Central — multi-site + telemetria de IA + Direito (migration 0010)

Banco oficial (Supabase `hcwzsxdcvmswebunznak`). Aplicado em 10–11/07 pelo
**Claude do Chrome** (via MCP) e ajustado pela sessão remota (fixes abaixo).
Espelho fiel no repo: `supabase/migrations/0010_nexus.sql`.

## Os 3 pilares

1. **Nexus multi-site** — `tenants` (slugs: `baluarte` · `codevibe` · `essence`,
   cada um com `ingest_key_hash` bcrypt) + `tenant_members` (quem LÊ o quê) +
   `nexus.is_member()` sustentando o RLS.
2. **IA/Telemetria** — as tabelas EXISTENTES `nucleo_events` / `memories` /
   `site_stats` ganharam `tenant_id` (nada recriado; o `/api/nucleo` segue
   intacto). Escrita externa **só** pelas RPCs `SECURITY DEFINER` — nenhum site
   tem INSERT direto; o portão é a `ingest_key` validada dentro da função.
3. **Direito** — `partes` (PF/PJ) · `processos` · `processo_partes` (N:N) ·
   `prazos_eventos` (flag fatal) · `juris_doutrina` (**pgvector 1536** +
   ivfflat, pronto pro RAG) · `pecas` + `pecas_versoes`. RLS: membro do tenant.

## RPCs (assinaturas REAIS do banco)

| RPC | Args | Retorno |
|---|---|---|
| `ingest_event` | `p_slug, p_key, p_event_type, p_payload={}, p_source=null` | uuid |
| `ingest_stat` | `p_slug, p_key, p_metrica, p_valor, p_dimensoes={}, p_dia=hoje` | void (upsert **soma**) |
| `ingest_memory` | `p_slug, p_key, p_text, p_tags=[], p_source=null` | uuid |
| `buscar_juris` | `p_tenant, p_query_embedding vector, p_limite=5` | tabela (só autenticado + membro) |

Tipos de evento aceitos (check da 0010): os 5 do `/api/nucleo`
(`command/telemetry/biometric/system/response`) + telemetria
(`page_view/click/interaction/session/voice/error/learning/custom`).

## Cliente no site Baluarte

`src/utils/nexus.js` — sem SDK (`dbFetch`): `nexusEvent()` · `nexusStat()` ·
`nexusMemory()` + **telemetria automática** (`initNexusTelemetry` no boot,
lazy): `page_views` por rota e `tempo_tela_seg` por sessão (flush no
`pagehide` com `fetch keepalive`). Best-effort: telemetria nunca quebra o site.

## Snippet portátil pros OUTROS sites (CodeVibe, Essence…)

Cole num `<script type="module">` (troque slug/chave):

```js
const SB = 'https://hcwzsxdcvmswebunznak.supabase.co/rest/v1/rpc';
const ANON = 'sb_publishable_uR0aJkZN54dkQJY0Tnx6GA_-4ehyOCm';   // pública
const TENANT = { slug: 'codevibe', key: 'chave_codevibe_456' };  // a do SEU site

function nexus(rpc, args) {
  return fetch(`${SB}/${rpc}`, {
    method: 'POST',
    headers: { apikey: ANON, authorization: `Bearer ${ANON}`, 'content-type': 'application/json' },
    body: JSON.stringify({ p_slug: TENANT.slug, p_key: TENANT.key, ...args })
  }).catch(() => {});
}
// page view da carga:
nexus('ingest_stat', { p_metrica: 'page_views', p_valor: 1, p_dimensoes: { pagina: location.pathname } });
```

## 🔑 Chaves de ingestão — rotação

As chaves semeadas (`chave_baluarte_123` etc.) são **de teste** e apareceram em
transcripts — são anti-abuso (públicas por design no bundle), mas rotacione
quando quiser, no SQL Editor:

```sql
update public.tenants set ingest_key_hash = crypt('NOVA_CHAVE', gen_salt('bf'))
where slug = 'baluarte';
```

Depois: no site Baluarte, console → `localStorage.setItem('baluarte:nexus:key','NOVA_CHAVE')`
(ou troque o default em `src/utils/nexus.js`); nos outros sites, o snippet.

## Fixes da sessão remota (11/07, já no banco + na 0010)

- 🐛 `ingest_event` estourava o `nucleo_events_type_check` legado (só aceitava
  os 5 tipos do `/api/nucleo`) — check ampliado com os tipos de telemetria.
- 🔒 `buscar_juris` era executável por `anon` via grant implícito a PUBLIC —
  revogado na raiz (agora só `authenticated`/`service_role`). `nexus.*`
  internas idem. Advisors: warns restantes das `ingest_*` são **by design**
  (portão = ingest_key); `vector` no schema public é cosmético (não mover — o
  índice ivfflat referencia o tipo).

## Voz (ElevenLabs) — as duas pontas

- **Servidor** (`api/voz.py`): `POST /api/voz {text}` → MP3 (chave nas envs:
  `ELEVENLABS_API_KEY`, opcional `ELEVENLABS_VOICE_ID`/`ELEVENLABS_AGENT_ID`;
  `GET ?signed=1` = signed URL do agente). O `speak()` do site tenta: chave
  local → servidor → navegador.
- **Teste local**: `ELEVENLABS_API_KEY="sk_…" node scripts/testar-elevenlabs.mjs`
  (valida a chave, gera `saida-teste.mp3`, testa a signed URL do agente).

## ⏳ Pendências do OPERADOR (chaves — só você)

1. **ElevenLabs**: criar a API key (painel → API Keys, permissões TTS +
   Conversational AI) → rodar o script de teste → colar em
   `ELEVENLABS_API_KEY` no Vercel (voz do servidor) e/ou `voz chave <key>` no
   Núcleo (voz local).
2. **`NUCLEO_TOKEN`** no Vercel (ponte voz→Núcleo, `configured:false` — ver #340).
3. (Quando quiser) rotacionar as ingest keys (SQL acima).
4. (Dashboard) ativar **Leaked Password Protection** no Auth (advisor).
