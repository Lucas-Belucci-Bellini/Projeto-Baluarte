/**
 * Voz do J.A.R.V.I.S. (v0.5.0 · #340) — o marco da 0.5.0.
 *
 * Dois motores, sempre com um funcionando:
 *   1. **ElevenLabs** (voz de referência do operador, `eleven_multilingual_v2`,
 *      fala qualquer idioma) — quando o operador colar a API key. A chave fica
 *      SÓ no navegador (storage local), padrão do cofre da Central de APIs.
 *   2. **speechSynthesis do navegador** — grátis e offline; escolhe a voz pelo
 *      idioma configurado. É o fallback automático se a ElevenLabs falhar.
 *
 * Preferências (storage): `voice:on` · `voice:lang` (pt-BR default) ·
 * `voice:elevenKey`. Controlado por comandos no Núcleo ("voz on", "voz idioma
 * en-US", "voz chave <key>") — sem menu (Regra de Ouro #324).
 */

import { storage } from '../core/storage.js';

/** Voz de referência do J.A.R.V.I.S. na ElevenLabs (escolhida pelo operador). */
export const JARVIS_VOICE_ID = 'Gubgw9l4dtIoQA9YZHgx';

const KEY_ON = 'voice:on';
const KEY_LANG = 'voice:lang';
const KEY_ELEVEN = 'voice:elevenKey';

/** Idiomas oferecidos (o multilingual v2 fala todos; o navegador escolhe a voz). */
export const VOICE_LANGS = ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'ja-JP'];

export function voiceEnabled() { return storage.get(KEY_ON, false) === true; }
export function setVoiceEnabled(v) { storage.set(KEY_ON, !!v); if (!v) stopSpeaking(); return !!v; }
export function voiceLang() { return storage.get(KEY_LANG, 'pt-BR') || 'pt-BR'; }
export function setVoiceLang(lang) {
  const l = VOICE_LANGS.find((x) => x.toLowerCase().startsWith(String(lang).toLowerCase().slice(0, 2)));
  if (l) storage.set(KEY_LANG, l);
  return l || null;
}
export function setElevenKey(key) { storage.set(KEY_ELEVEN, String(key || '').trim()); }
export function hasElevenKey() { return !!storage.get(KEY_ELEVEN, ''); }

let audioEl = null;      // player da ElevenLabs
let currentUrl = null;

/** Para qualquer fala em andamento (dos dois motores). */
export function stopSpeaking() {
  try { if (audioEl) { audioEl.pause(); audioEl = null; } } catch { /* ok */ }
  if (currentUrl) { URL.revokeObjectURL(currentUrl); currentUrl = null; }
  try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch { /* ok */ }
}

/* Limpa o texto pra fala: markdown, urls, emojis de bloco, código. */
function paraFala(text) {
  return String(text || '')
    .replace(/```[\s\S]*?```/g, ' código na tela. ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[*_#>|-]{2,}/g, ' ')
    .replace(/[*_#]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 600);   // teto: respostas longas falam o começo (custo/tempo)
}

/** Fala pelo navegador (grátis/offline). */
function speakBrowser(text) {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    if (!synth) { resolve(false); return; }
    const utt = new SpeechSynthesisUtterance(text);
    const lang = voiceLang();
    utt.lang = lang;
    const voz = (synth.getVoices() || []).find((v) => v.lang === lang)
      || (synth.getVoices() || []).find((v) => v.lang && v.lang.startsWith(lang.slice(0, 2)));
    if (voz) utt.voice = voz;
    utt.rate = 1.04; utt.pitch = 0.92;   // levemente grave/ritmado, estilo mordomo
    utt.onend = () => resolve(true);
    utt.onerror = () => resolve(false);
    synth.cancel();
    synth.speak(utt);
  });
}

/** Fala pela ElevenLabs (voz de referência). Lança se a API falhar. */
async function speakEleven(text) {
  const key = storage.get(KEY_ELEVEN, '');
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${JARVIS_VOICE_ID}`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.25 }
    })
  });
  if (!res.ok) throw new Error(`ElevenLabs HTTP ${res.status}`);
  const blob = await res.blob();
  stopSpeaking();
  currentUrl = URL.createObjectURL(blob);
  audioEl = new Audio(currentUrl);
  await audioEl.play();
  return new Promise((resolve) => { audioEl.onended = () => resolve(true); audioEl.onerror = () => resolve(false); });
}

/**
 * Fala um texto com o melhor motor disponível. Best-effort: nunca lança —
 * ElevenLabs falhou (sem chave/quota/rede) → cai no navegador; nada disponível
 * → silêncio (a resposta continua na tela).
 */
export async function speak(text) {
  if (!voiceEnabled()) return false;
  const t = paraFala(text);
  if (!t) return false;
  if (hasElevenKey()) {
    try { return await speakEleven(t); }
    catch (e) { console.warn('[voz] ElevenLabs falhou — caindo pro navegador:', e.message); }
  }
  try { return await speakBrowser(t); } catch { return false; }
}
