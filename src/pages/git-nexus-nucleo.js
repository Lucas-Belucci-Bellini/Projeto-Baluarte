/**
 * /git-nexus → NÚCLEO Mark XIII — tela única (issue #324).
 *
 * A "Regra de Ouro" do operador: a tela do Núcleo é 100% LIMPA — apenas a cena
 * 3D do Mark XIII (protagonista, não backdrop), um painel de SINAIS VITAIS e o
 * campo de comando do J.A.R.V.I.S. NADA de aba, botão ou menu para as funções
 * de IA: elas viram CAPACIDADES do agente — o usuário pede via chat/comando
 * ("mostrar memória", "abrir conselho"), a IA executa por baixo dos panos e,
 * quando a função precisa de visual, ela é montada INLINE num painel de vidro
 * (fechável por comando: "fechar"). O Corpo Total é a única função com
 * permissão de desenhar imagem — e mesmo ele SÓ aparece se pedido no chat.
 *
 * Substitui o cockpit de abas (`git-nexus-cockpit.js`) como a cara do Núcleo.
 * O cockpit continua acessível por `?ui=cockpit` (escape hatch/dev), e as
 * rotas individuais (/jarvis, /memoria, …) seguem registradas pra deep-link.
 */

import '../styles/nucleo-screen.css';
import { h, empty } from '../utils/helpers.js';
import { bus } from '../core/events.js';
import {
  loadConfig, saveConfig,
  processLocal, processClaude, processOllama, processServer, processHermes,
  processClaudeServer, processOpenClaw, processAgent
} from '../utils/jarvis-engine.js';
import { processHermesAgent } from '../utils/jarvis-hermes-agent.js';
import { processHermesLocal, healthHermesLocal, listHermesLocalModels, HERMES_LOCAL_PRESETS } from '../utils/hermes-local.js';
import { nativeHermesStatus } from '../utils/jarvis-hermes-native.js';
import { WEBLLM_MODELS } from '../utils/jarvis-webllm.js';
import { speak, stopSpeaking, voiceEnabled, setVoiceEnabled, voiceLang, setVoiceLang, setElevenKey, hasElevenKey, VOICE_LANGS } from '../utils/jarvis-voice.js';
import { initNucleoLink, getNucleoUrl, setNucleoUrl, setNucleoToken, simulateNucleoEvent } from '../utils/nucleo-socket.js';
import {
  initArquivosTools, statusArquivos, buscarArquivos, relatorioArquivos,
  lerArquivo, analisarPasta, grepArquivos
} from '../utils/jarvis-arquivos.js';

/* Pulso da cena por tipo de evento (Fase D do #316). */
const PULSE_MS = { command: 420, biometric: 300, telemetry: 200, system: 160 };

/* ===== As funções do Núcleo (ex-abas) — agora capacidades por comando =====
 * `match` casa o pedido em pt-BR; `load()` importa sob demanda e devolve o
 * elemento pronto (mesmos loaders do cockpit — nada foi reescrito). */
const FUNCOES = [
  { id: 'grafo',     nome: 'Grafo de Código',  match: /\bgrafo\b|c[óo]digo (3d|em 3d)/, load: () => import('./git-nexus.js').then((m) => m.gitNexusPage()) },
  { id: 'vision',    nome: 'Corpo Total',      match: /corpo (total|inteiro)|ativa\w* (a )?vis[ãa]o|\bvis[ãa]o\b/, load: () => import('./jarvis-vision.js').then((m) => m.jarvisVisionPage()) },
  { id: 'gerar',     nome: 'Gerar Código',     match: /gerar c[óo]digo|gera c[óo]digo/, load: () => import('./gerar-codigo.js').then((m) => m.gerarCodigoPage()) },
  { id: 'conselho',  nome: 'Conselho de IAs',  match: /conselho/, load: () => import('./conselho.js').then((m) => m.conselhoPage()) },
  { id: 'apis',      nome: 'Central de APIs',  match: /\bapis?\b|central de apis|chaves/, load: () => import('./apis.js').then((m) => m.apisPage()) },
  { id: 'dashboard', nome: 'Dashboard',        match: /dashboard|painel de (m[ée]tricas|status)/, load: () => import('./jarvis-dashboard.js').then((m) => m.jarvisDashboardPage()) },
  { id: 'ml',        nome: 'ML da Memória',    match: /\bml\b|aprendizado|machine learning/, load: () => import('./aprendizado.js').then((m) => m.aprendizadoPage()) },
  { id: 'llm',       nome: 'Mini-LLM',         match: /mini[- ]?llm|\bllm\b/, load: () => import('./llm-lab.js').then((m) => m.llmLabPage()) },
  { id: 'cerebro',   nome: 'Segundo Cérebro',  match: /c[ée]rebro/, load: () => import('./cerebro.js').then((m) => m.cerebroPage()) },
  { id: 'memoria',   nome: 'Memória',          match: /mem[óo]ria/, load: () => import('./memoria.js').then((m) => m.memoriaPage()) },
  { id: 'terminal',  nome: 'Terminal-IA',      match: /terminal/, load: () => import('./terminal-ia.js').then((m) => m.terminalIaPage()) },
  { id: 'seguranca', nome: 'Segurança',        match: /seguran[çc]a/, load: () => import('./seguranca.js').then((m) => m.segurancaPage()) },
  { id: 'ia',        nome: 'IA Proprietária',  match: /ia propriet[áa]ria|propriet[áa]ria/, load: () => import('./ia-proprietaria.js').then((m) => m.iaProprietariaPage()) },
  { id: 'jarvis',    nome: 'J.A.R.V.I.S. completo', match: /jarvis completo|chat completo|sess[õo]es/, load: () => import('./jarvis.js').then((m) => m.jarvisPage()) }
];

/* Modos aceitos pelo comando "modo X" (mesmo catálogo do /jarvis). */
const MODOS = ['local', 'webllm', 'hermes-agente', 'hermes-local', 'claude', 'ollama', 'servidor', 'hermes', 'claude-servidor', 'openclaw', 'agente'];

export function gitNexusNucleo(args = {}) {
  const page = h('div', { className: 'nucleo-screen' });

  /* ===== 1. A cena — protagonista, tela cheia ===== */
  const sceneEl = h('div', { className: 'nucleo-screen__scene', 'aria-hidden': 'true' });
  page.appendChild(sceneEl);
  let scene = null;
  import('../utils/nucleo-scene.js')
    .then((m) => m.mountNucleoScene(sceneEl))
    .then((s) => { scene = s; setVital('nucleo', 'ONLINE', 'ok'); })
    .catch((err) => {
      console.warn('[nucleo] cena 3D indisponível:', err);
      sceneEl.classList.add('nucleo-screen__scene--flat');
      setVital('nucleo', 'MODO 2D', 'warn');
    });

  /* ===== 2. Sinais vitais (o único HUD fixo além do chat) ===== */
  const vitals = {};
  function vitalRow(id, label, initial) {
    const val = h('span', { className: 'nucleo-vitals__val' }, initial);
    vitals[id] = val;
    return h('div', { className: 'nucleo-vitals__row' },
      h('span', { className: 'nucleo-vitals__label' }, label), val);
  }
  function setVital(id, text, tone) {
    const el = vitals[id];
    if (!el) return;
    el.textContent = text;
    el.className = 'nucleo-vitals__val' + (tone ? ` nucleo-vitals__val--${tone}` : '');
  }
  const config = loadConfig();
  const vitalsEl = h('aside', { className: 'nucleo-vitals anim-fade-in', 'aria-label': 'Sinais vitais do Núcleo' },
    h('div', { className: 'nucleo-vitals__title' }, '⬡ MARK XIII'),
    vitalRow('nucleo', 'NÚCLEO', '…'),
    vitalRow('rede', 'REDE', getNucleoUrl() ? 'CONECTANDO' : 'OFF'),
    vitalRow('eventos', 'EVENTOS', '0'),
    vitalRow('energia', 'ENERGIA', '—'),
    vitalRow('remoto', 'TELEMETRIA', '—'),
    vitalRow('bio', 'BIOMETRIA', '—'),
    vitalRow('modo', 'MODO IA', (config.mode || 'local').toUpperCase()),
    vitalRow('motor', 'MOTOR', '…'));
  page.appendChild(vitalsEl);

  /* MOTOR (#310 blindagem): qual cérebro Hermes está no controle — NATIVO
   * (GGUF/llama.cpp, app) ou WEB (WebLLM). Sonda o status na entrada e segue
   * AO VIVO pelo `hermes:engine` (o agente publica a escolha e qualquer
   * fallback em pleno voo — se o nativo cair, a linha vira WEB na hora). */
  nativeHermesStatus().then((st) => {
    if (st.available) setVital('motor', 'NATIVO (GGUF)', 'ok');
    else if (st.downloading) setVital('motor', `NATIVO ⬇ ${Math.round(st.pct || 0)}%`, 'warn');
    else setVital('motor', 'WEB (WEBLLM)', st.fatal ? 'warn' : undefined);
  }).catch(() => setVital('motor', 'WEB (WEBLLM)'));
  const offEngine = bus.on('hermes:engine', (ev) => {
    if (ev.engine === 'native') setVital('motor', 'NATIVO (GGUF)', 'ok');
    else setVital('motor', 'WEB (WEBLLM)', ev.reason ? 'warn' : undefined);
  });

  /* Energia: Battery API, best-effort (sem suporte → fica "—"). */
  try {
    if (navigator.getBattery) {
      navigator.getBattery().then((b) => {
        const upd = () => setVital('energia', Math.round(b.level * 100) + '%' + (b.charging ? ' ⚡' : ''), b.level < 0.2 && !b.charging ? 'warn' : 'ok');
        upd(); b.addEventListener('levelchange', upd); b.addEventListener('chargingchange', upd);
      }).catch(() => {});
    }
  } catch { /* best-effort */ }

  /* ===== 3. Painel inline (oculto; abre SÓ por comando) ===== */
  const panelBody = h('div', { className: 'nucleo-panel__body' });
  const panelTitle = h('span', { className: 'nucleo-panel__title' }, '');
  const panelEl = h('section', { className: 'nucleo-panel', hidden: true, 'aria-label': 'Função do Núcleo' },
    h('div', { className: 'nucleo-panel__bar' }, panelTitle,
      h('span', { className: 'nucleo-panel__hint u-text-muted' }, 'diga "fechar" (ou Esc)')),
    panelBody);
  page.appendChild(panelEl);
  let panelToken = 0;

  function fecharPanel() {
    panelToken++;
    panelEl.hidden = true;
    empty(panelBody);
  }
  function abrirFuncao(fn) {
    const my = ++panelToken;
    panelTitle.textContent = fn.nome.toUpperCase();
    panelEl.hidden = false;
    empty(panelBody);
    panelBody.appendChild(h('div', { className: 'nucleo-panel__loading' },
      h('span', { className: 'gn-loading__orb' }),
      h('p', { className: 'u-text-muted' }, `Materializando ${fn.nome}…`)));
    Promise.resolve().then(() => fn.load())
      .then((el) => { if (my !== panelToken) return; empty(panelBody); panelBody.appendChild(el); })
      .catch((err) => {
        if (my !== panelToken) return;
        console.error(`[nucleo] falha ao carregar "${fn.id}":`, err);
        empty(panelBody);
        panelBody.appendChild(h('p', { className: 'u-text-muted' }, 'Não deu pra materializar esta função agora.'));
      });
  }

  /* ===== 4. O chat do J.A.R.V.I.S. — a única porta ===== */
  const log = h('div', { className: 'nucleo-chat__log', role: 'log', 'aria-live': 'polite' });
  const input = h('input', {
    className: 'nucleo-chat__input',
    placeholder: 'Fale com o J.A.R.V.I.S. — ex.: "mostrar memória", "gerar código", "corpo total"…',
    autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Comando para o J.A.R.V.I.S.'
  });
  const chatEl = h('div', { className: 'nucleo-chat' }, log,
    h('form', {
      className: 'nucleo-chat__dock',
      onsubmit: (e) => { e.preventDefault(); enviar(); }
    }, h('span', { className: 'nucleo-chat__sigil', 'aria-hidden': 'true' }, '◉'), input));
  page.appendChild(chatEl);

  const convo = [];   // histórico curto em memória (a tela é a sessão)
  let pensando = null;

  function bolha(role, texto) {
    const b = h('div', { className: `nucleo-chat__msg nucleo-chat__msg--${role}` }, texto);
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
    /* mantém o transcript enxuto — só as últimas 12 falas ficam na tela */
    while (log.children.length > 12) log.removeChild(log.firstChild);
    return b;
  }
  function pensar(on) {
    if (on && !pensando) { pensando = bolha('jarvis', '…'); pensando.classList.add('nucleo-chat__msg--typing'); }
    else if (!on && pensando) { pensando.remove(); pensando = null; }
  }

  /* Roteador de comandos: intents locais primeiro; o resto vai pro cérebro. */
  async function enviar() {
    const texto = input.value.trim();
    if (!texto) return;
    input.value = '';
    bolha('user', texto);
    const t = texto.toLowerCase();

    /* fechar painel */
    if (/^(fechar|ocultar|esconder|sair)( .*)?$/.test(t)) {
      fecharPanel();
      bolha('jarvis', 'Painel recolhido, senhor.');
      return;
    }
    /* trocar modo de IA */
    const modo = t.match(/^modo\s+([a-z-]+)$/);
    if (modo) {
      if (MODOS.includes(modo[1])) {
        saveConfig({ ...loadConfig(), mode: modo[1] });
        setVital('modo', modo[1].toUpperCase());
        bolha('jarvis', `Modo de IA → ${modo[1]}.`);
      } else bolha('jarvis', `Modo desconhecido. Opções: ${MODOS.join(', ')}.`);
      return;
    }
    /* seletor de MODELOS por comando (#340 — alternância dinâmica sem menu):
     * "modelos" lista; "modelo <nº|nome>" troca o modelo do modo ativo. */
    const chaveModelo = (cfg) => (
      cfg.mode === 'hermes-agente' ? 'hermesAgentModel' :
      cfg.mode === 'webllm' ? 'webllmModel' :
      cfg.mode === 'ollama' ? 'ollamaModel' :
      cfg.mode === 'hermes-local' ? 'hermesLocalModel' :
      cfg.mode === 'claude' ? 'model' : null
    );
    /* MOTOR NATIVO (GGUF) — diagnóstico on-device sem DevTools: "motor" mostra
     * o estado real (disponível/baixando/fatal + motivo + correção) e a própria
     * sondagem já dispara o download do modelo quando falta. */
    if (t === 'motor') {
      const st = await nativeHermesStatus();
      /* versão do launcher em toda resposta (0.5.3+) — sem ela ficávamos no
       * escuro sobre qual app está rodando (armadilha da bandeja). */
      const ver = st.appVersion ? ` · launcher v${st.appVersion}` : '';
      if (st.available) {
        setVital('motor', 'NATIVO (GGUF)', 'ok');
        /* motor pronto ≠ motor EM USO: só o modo hermes-agente usa o nativo.
         * Se o modo ativo for outro (ex.: hermes servidor/OpenRouter), avisa —
         * foi exatamente a pegadinha do 402 de créditos do operador. */
        const cfgM = loadConfig();
        if (cfgM.mode === 'hermes-agente') {
          bolha('jarvis', `✅ Motor NATIVO no controle — modelo ${st.model || 'GGUF'} (llama.cpp)${ver}. O modo hermes-agente responde por ele.`);
        } else {
          const quem = cfgM.mode === 'hermes' ? 'o OpenRouter na nuvem (gasta créditos!)' : `"${cfgM.mode}"`;
          bolha('jarvis', `✅ Motor NATIVO pronto — modelo ${st.model || 'GGUF'} (llama.cpp)${ver}.\n⚠ MAS o modo de IA ativo é "${cfgM.mode}" — quem responde o chat é ${quem}, não o motor da sua máquina. Diga "modo hermes-agente" pra usar o nativo (grátis, offline).`);
        }
      } else if (st.downloading) {
        setVital('motor', `NATIVO ⬇ ${Math.round(st.pct || 0)}%`, 'warn');
        bolha('jarvis', `⬇ Baixando o modelo do motor nativo: ${Math.round(st.pct || 0)}% (~4,4 GB — segue em segundo plano; o WebLLM cobre enquanto isso)${ver}. Diga "motor" de novo pra acompanhar.`);
      } else if (st.fatal) {
        setVital('motor', 'WEB (WEBLLM)', 'warn');
        bolha('jarvis', `⚠ Motor nativo DESATIVADO nesta sessão${ver}.\ncódigo: ${st.code || '?'}\nmotivo: ${(st.reason || '').slice(0, 160)}\ncorreção: ${st.hint || 'reinstalar o app'}`);
      } else {
        setVital('motor', 'WEB (WEBLLM)');
        bolha('jarvis', `Motor: WebLLM (navegador)${ver}. ${st.reason || 'Sem ponte com o app — no site, o nativo não existe.'}${st.error ? `\núltimo erro de download: ${st.error}` : ''}`);
      }
      return;
    }
    /* ARQUIVISTA (#369 fase 1, 0.6.0) — os olhos do JARVIS no PC, read-only:
     * "arquivos <termo>" busca por nome · "relatorio arquivos" inventário
     * completo com relatório em Documentos/Baluarte. Só no app. */
    if (t === 'arquivos' || t === 'arquivista') {
      const st = await statusArquivos();
      if (!st.disponivel) {
        bolha('jarvis', 'O Arquivista mora no app (Baluarte Launcher) — no site eu não toco nos seus arquivos. Baixe em /baixar.');
      } else if (st.progresso && st.progresso.ativo) {
        bolha('jarvis', `🗂️ Varredura em andamento: ${st.progresso.varridos.toLocaleString('pt-BR')} arquivos vistos até agora…`);
      } else {
        bolha('jarvis', `🗂️ Arquivista pronto (read-only) — raiz: ${st.raiz}.\nComandos: "arquivos <nome>" busca · "relatorio arquivos" inventário (.md + .txt em Documentos/Baluarte) · "analisar <pasta>" o-que-é-isto + duplicados + gordura · "ler <arquivo>" texto/código · "procurar <trecho> em <pasta>" busca por conteúdo.\n🛡️ Pastas pessoais (${(st.cofrePessoal || []).slice(0, 4).join(', ')}…) ficam de fora, sempre.`);
      }
      return;
    }
    const buscaArq = t.match(/^arquivos?\s+(.{2,})$/);
    if (buscaArq && buscaArq[1] !== 'arquivos') {
      bolha('jarvis', `🔎 Procurando "${buscaArq[1]}" nos seus arquivos…`);
      try {
        const r = await buscarArquivos(buscaArq[1]);
        if (!r.total) {
          bolha('jarvis', `Nada com "${r.termo}" (varri ${r.stats.arquivos.toLocaleString('pt-BR')} arquivos${r.stats.protegidas ? `; ${r.stats.protegidas} pasta(s) pessoais ficaram de fora` : ''}).`);
        } else {
          const linhas = r.resultados.slice(0, 12).map((x) => `· ${x.caminho}`).join('\n');
          bolha('jarvis', `🗂️ ${r.total} resultado(s) pra "${r.termo}"${r.tetoAtingido ? ' (mostrando o teto)' : ''}:\n${linhas}${r.total > 12 ? `\n… e mais ${r.total - 12}.` : ''}${r.stats.parcial ? '\n⚠ varredura parcial (' + r.stats.motivoParcial + ')' : ''}`);
        }
      } catch (e) { bolha('jarvis', `⚠ ${e.message}`); }
      return;
    }
    /* Fase 2 do Arquivista (0.6.1): analisar pasta · ler arquivo · procurar
     * conteúdo. Os caminhos vão como o operador digitou (com caixa original);
     * a validação de cofre/zona proibida acontece no motor do app. */
    const analisarCmd = texto.match(/^analisar\s+(.+)$/i);
    if (analisarCmd) {
      bolha('jarvis', `🔬 Analisando "${analisarCmd[1]}"…`);
      try {
        const a = await analisarPasta(analisarCmd[1].trim());
        const dup = a.duplicados.length
          ? `\n♻ Duplicados: ${a.duplicados.slice(0, 3).map((d) => `${d.tamanho} ×${d.arquivos.length}`).join(' · ')}`
          : '';
        const gordo = a.gordura.length
          ? `\n🏋 Gordura: ${a.gordura.slice(0, 3).map((g) => `${g.tamanho} parado há ${g.paradoHaMeses}m`).join(' · ')}`
          : '';
        bolha('jarvis',
          `🗂️ ${a.caminho}\nTipo: ${a.tipo}${a.parcial ? ' (varredura parcial)' : ''}\n` +
          `${a.arquivos.toLocaleString('pt-BR')} arquivos · ${a.pastas.toLocaleString('pt-BR')} pastas · ${a.tamanho}` +
          `${a.protegidas ? ` · ${a.protegidas} protegida(s)` : ''}\n` +
          `Extensões: ${a.topExtensoes.slice(0, 6).join(' ')}\n` +
          `Maior: ${a.maiores[0] ? `${a.maiores[0].tamanho} — ${a.maiores[0].caminho}` : '—'}${dup}${gordo}`);
      } catch (e) { bolha('jarvis', `⚠ ${e.message}`); }
      return;
    }
    const lerCmd = texto.match(/^ler\s+(.+)$/i);
    if (lerCmd) {
      try {
        const r = await lerArquivo(lerCmd[1].trim());
        const inicio = r.conteudo.split('\n').slice(0, 25).join('\n');
        bolha('jarvis', `📄 ${r.caminho} (${r.linhas} linhas${r.truncado ? ', mostrando o começo' : ''}):\n${inicio}${r.linhas > 25 ? '\n…' : ''}`);
      } catch (e) { bolha('jarvis', `⚠ ${e.message}`); }
      return;
    }
    const grepCmd = texto.match(/^procurar\s+"?([^"]{3,}?)"?(?:\s+em\s+(.+))?$/i);
    if (grepCmd) {
      bolha('jarvis', `🔎 Procurando "${grepCmd[1]}" DENTRO dos arquivos${grepCmd[2] ? ` de ${grepCmd[2]}` : ''}…`);
      try {
        const g = await grepArquivos(grepCmd[1], (grepCmd[2] || '.').trim());
        if (!g.total) { bolha('jarvis', `Nada de "${g.termo}" em ${g.arquivosLidos.toLocaleString('pt-BR')} arquivos de texto lidos.`); return; }
        const linhas = g.acertos.slice(0, 10).map((x) => `· ${x.caminho}:${x.linha} — ${x.trecho.slice(0, 80)}`).join('\n');
        bolha('jarvis', `🔎 ${g.total} acerto(s)${g.tetoAtingido ? ' (teto)' : ''} pra "${g.termo}":\n${linhas}${g.total > 10 ? `\n… e mais ${g.total - 10}.` : ''}`);
      } catch (e) { bolha('jarvis', `⚠ ${e.message}`); }
      return;
    }
    if (/^relat[óo]rio( de)? arquivos$/.test(t) || /^inventari(o|ar)( do pc)?$/.test(t)) {
      bolha('jarvis', '🗂️ Gerando o inventário COMPLETO dos seus arquivos (read-only). Em discos grandes isso leva alguns minutos — diga "arquivos" pra acompanhar o progresso.');
      try {
        const r = await relatorioArquivos();
        const s = r.resumo;
        bolha('jarvis',
          `✅ Inventário pronto${s.parcial ? ` (PARCIAL — ${s.motivoParcial})` : ''}:\n` +
          `· ${s.arquivos.toLocaleString('pt-BR')} arquivos em ${s.pastas.toLocaleString('pt-BR')} pastas — ${s.tamanho}\n` +
          `· ${s.protegidas} pasta(s) pessoais protegidas (fora do relatório) · ${s.duracaoSeg}s\n` +
          `📄 Relatório: ${r.relatorio}\n📜 Todos os caminhos: ${r.listagem}`);
      } catch (e) { bolha('jarvis', `⚠ ${e.message}`); }
      return;
    }
    /* HERMES LOCAL da máquina (#340 fatia 4) — tudo por comando, sem menu:
     * "hermes status" testa a conexão · "hermes url <endereço>" aponta o
     * endpoint · "hermes lmstudio|ollama|textgen" usa uma porta conhecida. */
    if (t === 'hermes status') {
      const cfg = loadConfig();
      bolha('jarvis', 'Sondando o Hermes local…');
      try {
        const hs = await healthHermesLocal(cfg);
        bolha('jarvis', `✅ Hermes local no ar em ${hs.url} — ${hs.models.length} modelo(s): ${hs.models.slice(0, 5).join(', ') || '(nenhum carregado)'}. Diga "modo hermes-local" pra usar.`);
      } catch (e) { bolha('jarvis', `⚠ ${e.message}`); }
      return;
    }
    const hermesPreset = t.match(/^hermes\s+(lmstudio|ollama|textgen)$/);
    if (hermesPreset) {
      const p = HERMES_LOCAL_PRESETS.find((x) => x.id === hermesPreset[1]);
      saveConfig({ ...loadConfig(), hermesLocalUrl: p.url });
      bolha('jarvis', `Endpoint do Hermes local → ${p.label} (${p.url}). Diga "hermes status" pra testar.`);
      return;
    }
    const hermesUrl = t.match(/^hermes\s+url\s+(\S+)$/);
    if (hermesUrl) {
      saveConfig({ ...loadConfig(), hermesLocalUrl: hermesUrl[1] });
      bolha('jarvis', `Endpoint do Hermes local → ${hermesUrl[1]}. Diga "hermes status" pra testar.`);
      return;
    }
    if (t === 'modelos' || t === 'modelo') {
      const cfg = loadConfig();
      const key = chaveModelo(cfg);
      const atual = key ? (cfg[key] || '(padrão)') : '—';
      /* hermes-local: catálogo VIVO — o que o servidor da máquina tem agora. */
      if (cfg.mode === 'hermes-local') {
        try {
          const ids = await listHermesLocalModels(cfg);
          const lista = ids.map((id, i) => `${id === atual ? '▸' : ' '} ${i + 1}. ${id}`).join('\n');
          bolha('jarvis',
            `Modo ativo: hermes-local · modelo: ${atual}\n${lista || '(nenhum modelo carregado no servidor)'}\n` +
            'Diga "modelo <nome>" pra trocar (vazio usa o carregado).');
        } catch (e) { bolha('jarvis', `⚠ ${e.message}`); }
        return;
      }
      const lista = WEBLLM_MODELS
        .map((m, i) => `${m.id === atual ? '▸' : ' '} ${i + 1}. ${m.label}`)
        .join('\n');
      bolha('jarvis',
        `Modo ativo: ${cfg.mode} · modelo: ${atual}\n${lista}\n` +
        'Diga "modelo <nº ou nome>" pra trocar.');
      return;
    }
    const trocaModelo = t.match(/^modelo\s+(.+)$/);
    if (trocaModelo) {
      const cfg = loadConfig();
      const key = chaveModelo(cfg);
      if (!key) { bolha('jarvis', `O modo "${cfg.mode}" não usa modelo trocável por aqui.`); return; }
      const pedido = trocaModelo[1].trim();
      const porIndice = /^\d+$/.test(pedido) ? WEBLLM_MODELS[Number(pedido) - 1] : null;
      const porNome = WEBLLM_MODELS.find((m) =>
        m.id.toLowerCase().includes(pedido) || m.label.toLowerCase().includes(pedido));
      const alvo = porIndice || porNome;
      if (cfg.mode === 'ollama' || cfg.mode === 'claude' || cfg.mode === 'hermes-local') {
        saveConfig({ ...cfg, [key]: pedido });   // nome livre (modelo do provedor)
        bolha('jarvis', `Modelo do ${cfg.mode} → ${pedido}.`);
      } else if (alvo) {
        saveConfig({ ...cfg, [key]: alvo.id });
        bolha('jarvis', `Modelo → ${alvo.label}. A troca vale já na próxima mensagem (1º uso baixa o modelo).`);
      } else {
        bolha('jarvis', 'Não achei esse modelo. Diga "modelos" pra ver a lista.');
      }
      return;
    }
    /* VOZ do J.A.R.V.I.S. (v0.5.0 #340): tudo por comando, sem menu. */
    if (/^voz( on| off)?$/.test(t)) {
      const ligar = t === 'voz on' || (t === 'voz' && !voiceEnabled());
      setVoiceEnabled(ligar);
      const msg = ligar
        ? `Voz ativada (${voiceLang()}${hasElevenKey() ? ' · ElevenLabs' : ' · navegador'}). Diga "voz off" pra silenciar.`
        : 'Voz desativada.';
      bolha('jarvis', msg);
      if (ligar) speak(msg);
      return;
    }
    const vozIdioma = t.match(/^voz idioma\s+([a-z]{2}(-[a-z]{2})?)$/i);
    if (vozIdioma) {
      const l = setVoiceLang(vozIdioma[1]);
      bolha('jarvis', l ? `Idioma da voz → ${l}.` : `Idioma não suportado. Opções: ${VOICE_LANGS.join(', ')}.`);
      if (l && voiceEnabled()) speak(l.startsWith('pt') ? 'Idioma configurado, senhor.' : 'Language configured, sir.');
      return;
    }
    const vozChave = texto.match(/^voz chave\s+(\S+)$/i);
    if (vozChave) {
      setElevenKey(vozChave[1]);
      bolha('jarvis', 'Chave da ElevenLabs guardada SÓ neste navegador. A voz de referência assume na próxima fala.');
      return;
    }
    if (/^(silêncio|silencio|calar?)$/.test(t)) { stopSpeaking(); bolha('jarvis', '…'); return; }

    /* ponte ao vivo: conectar/desconectar/token/simular */
    const con = t.match(/^conectar\s+(wss?:\/\/\S+)$/);
    if (con) { setNucleoUrl(con[1]); bolha('jarvis', `Ponte configurada: ${con[1]}. Conectando… (backend com NUCLEO_TOKEN? Diga "ponte token <valor>".)`); return; }
    if (/^desconectar$/.test(t)) { setNucleoUrl(''); setVital('rede', 'OFF'); bolha('jarvis', 'Ponte desligada.'); return; }
    const pTok = texto.match(/^ponte\s+token\s+(\S+)$/i);   // usa `texto` (token respeita maiúsculas)
    if (pTok) { setNucleoToken(pTok[1]); bolha('jarvis', 'Token da ponte guardado (só neste navegador). Reconectando com ?token=…'); return; }
    const sim = t.match(/^simular( evento)?( bio(metria)?| telemetria| voz| comando)?$/);
    if (sim) {
      const tipo = /bio/.test(t) ? 'biometric' : /telemetria/.test(t) ? 'telemetry' : 'command';
      simulateNucleoEvent(tipo);
      bolha('jarvis', `Evento de demonstração (${tipo}) emitido — olhe os sinais vitais e a cena.`);
      return;
    }

    /* abrir função por comando ("mostrar memória", "abrir conselho", "corpo total"…) */
    const pedido = /^(mostrar?|abrir?|ativar?|exibir?|rodar?)\b/.test(t) ? t.replace(/^(mostrar?|abrir?|ativar?|exibir?|rodar?)\s*/, '') : t;
    const fn = FUNCOES.find((f) => f.match.test(pedido));
    if (fn && (pedido.length < 40)) {   // pedidos curtos = intenção direta de abrir
      abrirFuncao(fn);
      bolha('jarvis', fn.id === 'vision'
        ? 'Ativando o Corpo Total, senhor.'
        : `${fn.nome} materializado. Diga "fechar" quando terminar.`);
      return;
    }

    /* conversa/tarefa → o cérebro configurado responde */
    convo.push({ role: 'user', content: texto });
    pensar(true);
    try {
      const cfg = loadConfig();
      const call = { ...cfg };
      let resposta;
      const aoTool = (nome, _inp, res) => {
        pensar(false);
        bolha('tool', `⚙ ${nome} → ${res && res.ok ? 'ok' : 'erro'}`);
        pensar(true);
      };
      if (cfg.mode === 'agente') resposta = await processAgent(convo, call, aoTool);
      else if (cfg.mode === 'hermes-agente') resposta = await processHermesAgent(convo, call, aoTool, {});
      else if (cfg.mode === 'claude') resposta = await processClaude(convo, call);
      else if (cfg.mode === 'ollama') resposta = await processOllama(convo, call);
      else if (cfg.mode === 'hermes-local') resposta = await processHermesLocal(convo, call);
      else if (cfg.mode === 'servidor') resposta = await processServer(convo, call);
      else if (cfg.mode === 'hermes') resposta = await processHermes(convo, call);
      else if (cfg.mode === 'claude-servidor') resposta = await processClaudeServer(convo, call);
      else if (cfg.mode === 'openclaw') resposta = await processOpenClaw(convo, call);
      else if (cfg.mode === 'webllm') {
        const m = await import('../utils/jarvis-webllm.js');
        resposta = await m.processWebLLM(convo, call, {
          onProgress: (txt) => { if (pensando) pensando.textContent = '⬇ ' + txt; },
          onToken: (parcial) => { if (pensando) pensando.textContent = parcial; }
        });
      } else {
        const r = processLocal(texto);
        resposta = r.text;
        if (r.action?.type === 'navigate') {
          const alvo = FUNCOES.find((f) => r.action.payload.includes(f.id));
          if (alvo) abrirFuncao(alvo);   // navegação vira painel inline (sem sair da tela)
        }
      }
      pensar(false);
      convo.push({ role: 'assistant', content: resposta });
      if (convo.length > 24) convo.splice(0, convo.length - 24);
      bolha('jarvis', resposta);
      speak(resposta);   // voz (v0.5.0): fala se "voz on" — best-effort, nunca lança
      scene && scene.pulse && scene.pulse(360);
    } catch (e) {
      pensar(false);
      bolha('jarvis', `⚙ ${e.message} — diga "modo local" pra respostas imediatas sem configuração.`);
    }
  }

  /* Esc fecha o painel (complemento de acessibilidade ao comando "fechar"). */
  const onKey = (e) => { if (e.key === 'Escape' && !panelEl.hidden) fecharPanel(); };
  document.addEventListener('keydown', onKey);

  /* Comando REMOTO (voz ElevenLabs/API via /api/nucleo → Realtime): mostra no
   * transcript e executa SÓ as intenções de abrir/fechar função — texto vindo
   * de fora NUNCA vai pro cérebro (não gasta tokens nem executa tools). */
  function comandoRemoto(texto, fonte) {
    bolha('tool', `📡 ${fonte || 'remoto'}: ${texto}`);
    const t = String(texto).toLowerCase().trim();
    if (/^(fechar|ocultar|esconder)( .*)?$/.test(t)) { fecharPanel(); return; }
    const pedido = t.replace(/^(mostrar?|abrir?|ativar?|exibir?|rodar?)\s*/, '');
    const fn = FUNCOES.find((f) => f.match.test(pedido));
    if (fn) {
      abrirFuncao(fn);
      const msg = `${fn.nome} materializado por comando remoto.`;
      bolha('jarvis', msg);
      speak(msg);
    }
  }

  /* ===== 5. Núcleo AO VIVO (Fase D #316): eventos fazem a cena pulsar ===== */
  let nEventos = 0;
  const offEvent = bus.on('nucleo:event', (ev) => {
    nEventos++;
    setVital('eventos', String(nEventos));
    scene && scene.pulse && scene.pulse(PULSE_MS[ev.type] || 240);
    /* Fase D rica (#316): cada tipo de evento reage de um jeito. */
    if (ev.type === 'telemetry') {
      /* telemetria → HUD: última leitura do aparelho remoto nos vitais */
      const m = (ev.payload && ev.payload.metrics) || ev.payload || {};
      const bateria = m.battery != null ? `🔋${Math.round(m.battery * 100)}%` : null;
      const chaves = Object.keys(m).length;
      setVital('remoto', `${bateria || `${chaves} métrica(s)`} · ${ev.source || '?'}`, 'ok');
    } else if (ev.type === 'biometric') {
      /* biometria → energia: o núcleo BATE no ritmo do coração */
      const hr = ev.payload && (ev.payload.heartRate || ev.payload.hr);
      if (hr) {
        setVital('bio', `♥ ${hr} bpm · ${ev.source || '?'}`, (hr >= 120 || hr <= 45) ? 'warn' : 'ok');
        scene && scene.setHeartRate && scene.setHeartRate(hr);
      }
    } else if ((ev.type === 'command' || ev.type === 'voice') && ev.payload && ev.payload.text) {
      /* voz/comando → ação de verdade (abre função, executa intenção) */
      comandoRemoto(ev.payload.text, ev.source);
    }
  });
  const offStatus = bus.on('nucleo:status', (st) => {
    setVital('rede', st.connected ? 'ONLINE' : (getNucleoUrl() ? 'RECONECTANDO' : 'OFF'), st.connected ? 'ok' : undefined);
  });
  initNucleoLink();
  initArquivosTools();   // Arquivista (#369): buscar_arquivos/relatorio_arquivos no agente (só no app)

  /* Deep-link compat: /git-nexus?tab=<id> (links antigos do cockpit) abre a
   * função direto — mas via painel, mantendo a tela limpa. */
  const tab = args.tab || (args.query && args.query.tab);
  if (tab) {
    const fn = FUNCOES.find((f) => f.id === tab);
    if (fn) abrirFuncao(fn);
  }

  bolha('jarvis', 'Núcleo Mark XIII operacional. Às ordens, senhor.');

  /* Limpeza ao sair da rota (cena + bus + teclado). */
  if (typeof MutationObserver !== 'undefined') {
    const mo = new MutationObserver(() => {
      if (!document.contains(page)) {
        offEvent(); offStatus(); offEngine();
        stopSpeaking();
        document.removeEventListener('keydown', onKey);
        try { scene && scene.destroy && scene.destroy(); } catch { /* ok */ }
        mo.disconnect();
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  return page;
}
