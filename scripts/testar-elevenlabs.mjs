/**
 * Teste da ElevenLabs — chave, TTS e agente conversacional (#340).
 *
 * Uso (a chave NUNCA vai hardcoded — só por variável de ambiente):
 *   ELEVENLABS_API_KEY="sk_…" node scripts/testar-elevenlabs.mjs
 *
 * Opcionais: ELEVENLABS_VOICE_ID (default: voz de referência do J.A.R.V.I.S.)
 *            ELEVENLABS_AGENT_ID (pro teste da signed URL do agente)
 *
 * O que roda: 1) valida a chave (GET /v1/user, mostra plano/créditos);
 * 2) TTS de teste → grava saida-teste.mp3; 3) signed URL do agente (se houver
 * agent id). Requer Node 18+ (fetch nativo).
 */

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'Gubgw9l4dtIoQA9YZHgx';
const AGENT_ID = process.env.ELEVENLABS_AGENT_ID || '';
const BASE = 'https://api.elevenlabs.io';

if (!API_KEY) {
  console.error('❌ Faltou a variável ELEVENLABS_API_KEY.');
  console.error('   Ex.: ELEVENLABS_API_KEY="sk_xxx" node scripts/testar-elevenlabs.mjs');
  process.exit(1);
}

async function call(path, { method = 'GET', headers = {}, body } = {}) {
  return fetch(`${BASE}${path}`, { method, headers: { 'xi-api-key': API_KEY, ...headers }, body });
}

async function checarChave() {
  console.log('🔎 Validando a API key (GET /v1/user)…');
  const res = await call('/v1/user');
  if (!res.ok) throw new Error(`Chave inválida ou sem permissão (HTTP ${res.status}): ${await res.text()}`);
  const data = await res.json();
  console.log('✅ Chave válida. Plano:', data?.subscription?.tier ?? 'desconhecido');
  console.log('   Créditos:', data?.subscription?.character_count, '/', data?.subscription?.character_limit);
}

async function testarTTS(texto = 'Sistema Baluarte online. Núcleo J.A.R.V.I.S. operacional.') {
  console.log('🗣️  Testando Text-to-Speech…');
  const res = await call(`/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({
      text: texto,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.25 }
    })
  });
  if (!res.ok) throw new Error(`Falha no TTS (HTTP ${res.status}): ${await res.text()}`);
  const { writeFile } = await import('node:fs/promises');
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile('saida-teste.mp3', buf);
  console.log(`✅ TTS ok — áudio salvo em "saida-teste.mp3" (${buf.length} bytes).`);
}

async function testarAgente() {
  if (!AGENT_ID) { console.log('ℹ️  Sem ELEVENLABS_AGENT_ID — pulando o teste do agente.'); return; }
  console.log('🤖 Solicitando a signed URL do agente conversacional…');
  const res = await call(`/v1/convai/conversation/get_signed_url?agent_id=${encodeURIComponent(AGENT_ID)}`);
  if (!res.ok) {
    console.warn(`⚠️  Signed URL falhou (HTTP ${res.status}) — plano/permissão? ${await res.text()}`);
    return;
  }
  const data = await res.json();
  console.log('✅ Signed URL do agente:', (data.signed_url || '').slice(0, 80) + '…');
}

try {
  await checarChave();
  await testarTTS();
  await testarAgente();
  console.log('\n🎉 Testes concluídos. Próximo passo: cole a MESMA chave na env');
  console.log('   ELEVENLABS_API_KEY do Vercel (voz do servidor /api/voz) e/ou');
  console.log('   use "voz chave <key>" no Núcleo (voz local do navegador).');
} catch (err) {
  console.error('\n💥 Erro:', err.message);
  process.exit(1);
}
