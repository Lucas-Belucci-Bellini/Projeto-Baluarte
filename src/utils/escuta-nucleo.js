/**
 * O ouvido do J.A.R.V.I.S. — a parte que é só matemática (#405).
 *
 * Zero DOM, zero dependência. Recebe uma série de energia (a soma do espectro
 * quadro a quadro, que o `fft-engine` já produz) e devolve os eventos que
 * reconheceu. É essa separação que permite provar a detecção sem microfone,
 * sem navegador e sem ninguém batendo palma — a mesma regra que vale para o
 * motor do Vanguard em `src/utils/vanguard/`.
 *
 * ## O que é uma palma, em números
 *
 * Palma é um **transiente**: sobe muito acima do fundo, sobe RÁPIDO, e cai
 * quase tão rápido quanto subiu. Música alta e voz também passam do limiar —
 * a diferença é que elas SUSTENTAM. Por isso o teste de ataque e o de queda
 * existem: sem eles, qualquer som alto viraria palma, e o gatilho dispararia
 * sozinho a noite inteira com o operador ouvindo música.
 *
 * ## O gesto é palma DUPLA, de propósito
 *
 * Uma palma sozinha acontece o tempo todo — porta batendo, objeto caindo,
 * alguém aplaudindo na TV. Duas palmas dentro de uma janela curta é um gesto
 * que quase não acontece por acaso.
 */

/** Padrões medidos em cima de espectro a ~60 quadros/s. */
export const PADRAO = {
  /** quantas vezes acima do fundo para ser candidato */
  limiar: 3.2,
  /** quanto tem de subir em relação ao quadro anterior (ataque) */
  ataque: 2.4,
  /** quadros de fundo para a média móvel */
  janelaFundo: 24,
  /** dentro de quantos ms tem de voltar ao fundo (queda) */
  quedaMs: 140,
  /** silêncio obrigatório após um pico, para não contar o eco */
  refratarioMs: 90,
  /** intervalo aceito entre a 1ª e a 2ª palma */
  intervaloMinMs: 120,
  intervaloMaxMs: 700,
  /** piso absoluto: abaixo disto é ruído de fundo, não som */
  pisoAbsoluto: 0.02
};

/**
 * Média do fundo imediatamente ANTES de `i`, ignorando o próprio pico.
 * Usar a janela centrada incluiria o transiente no fundo e o esconderia.
 */
function fundoAntes(serie, i, janela) {
  const ini = Math.max(0, i - janela);
  if (i - ini < 3) return null;            // amostra curta demais para opinar
  let soma = 0;
  for (let k = ini; k < i; k += 1) soma += serie[k];
  return soma / (i - ini);
}

/**
 * Índices dos transientes em `serie` (energia por quadro, >= 0).
 *
 * `dtMs` é o intervalo entre quadros. Sem ele não dá para falar em "rápido":
 * a mesma série a 10 fps e a 120 fps descreve fenômenos diferentes.
 */
export function detectarTransientes(serie, dtMs, opc = {}) {
  const p = { ...PADRAO, ...opc };
  if (!Array.isArray(serie) || serie.length < 4 || !(dtMs > 0)) return [];

  const refratarioQuadros = Math.max(1, Math.round(p.refratarioMs / dtMs));
  const quedaQuadros = Math.max(1, Math.round(p.quedaMs / dtMs));

  const picos = [];
  let ultimo = -Infinity;

  for (let i = 1; i < serie.length; i += 1) {
    const e = serie[i];
    if (!(e > p.pisoAbsoluto)) continue;
    if (i - ultimo < refratarioQuadros) continue;

    const fundo = fundoAntes(serie, i, p.janelaFundo);
    if (fundo === null || !(e > fundo * p.limiar)) continue;

    // ataque: tem de ser uma SUBIDA, não um platô que já estava alto
    const anterior = Math.max(serie[i - 1], p.pisoAbsoluto);
    if (!(e > anterior * p.ataque)) continue;

    // queda: dentro da janela, tem de voltar para perto do fundo. É isto que
    // separa palma de música alta — música não volta.
    let caiu = false;
    const fim = Math.min(serie.length - 1, i + quedaQuadros);
    for (let k = i + 1; k <= fim; k += 1) {
      if (serie[k] < fundo * (p.limiar * 0.5)) { caiu = true; break; }
    }
    if (!caiu) continue;

    picos.push(i);
    ultimo = i;
  }
  return picos;
}

/**
 * Índices `[i1, i2]` de cada palma DUPLA reconhecida.
 *
 * Consome os dois picos ao formar o par: três palmas seguidas viram um gesto,
 * não dois sobrepostos.
 */
export function detectarPalmaDupla(serie, dtMs, opc = {}) {
  const p = { ...PADRAO, ...opc };
  const picos = detectarTransientes(serie, dtMs, opc);
  const pares = [];
  let i = 0;
  while (i < picos.length - 1) {
    const dt = (picos[i + 1] - picos[i]) * dtMs;
    if (dt >= p.intervaloMinMs && dt <= p.intervaloMaxMs) {
      pares.push([picos[i], picos[i + 1]]);
      i += 2;
    } else {
      i += 1;
    }
  }
  return pares;
}

/**
 * Energia de um quadro de espectro, normalizada em 0..1.
 *
 * O `getByteFrequencyData` entrega 0..255 por bin; a média divide pelo total
 * para que o limiar não dependa do `fftSize` escolhido na tela.
 */
export function energiaDoQuadro(bins) {
  if (!bins || !bins.length) return 0;
  let soma = 0;
  for (let i = 0; i < bins.length; i += 1) soma += bins[i];
  return soma / bins.length / 255;
}

/**
 * Janela deslizante de energia, do tamanho necessário para decidir.
 *
 * Guardar só o que a detecção usa é deliberado: gravar áudio para analisar
 * depois seria outra coisa, e outra conversa. Aqui nada além de um número por
 * quadro sai do laço de análise — não há amostra de som guardada em lugar
 * nenhum.
 */
export class JanelaEnergia {
  constructor(quadros = 180) {
    this.max = Math.max(8, quadros);
    this.buf = [];
  }

  push(e) {
    this.buf.push(e);
    if (this.buf.length > this.max) this.buf.shift();
    return this.buf.length;
  }

  serie() { return this.buf; }

  limpar() { this.buf.length = 0; }
}

/**
 * Normaliza o que o operador falou para comparar com a palavra de ativação.
 * Sem acento, sem pontuação, espaço único — "Jarvis!" e "jarvís" são a mesma
 * intenção, e o reconhecimento de fala varia entre as duas o tempo todo.
 */
export function normalizarFala(texto) {
  if (typeof texto !== 'string') return '';
  return texto
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * A frase contém a palavra de ativação?
 *
 * Compara por PALAVRA inteira: "jarvis" não pode casar dentro de outra
 * palavra, senão qualquer frase com um pedaço parecido acordaria o assistente.
 */
export function temAtivacao(texto, palavras = ['jarvis', 'baluarte']) {
  const limpo = normalizarFala(texto);
  if (!limpo) return null;
  const tokens = limpo.split(' ');
  for (const p of palavras) {
    const alvo = normalizarFala(p);
    if (!alvo) continue;
    const partes = alvo.split(' ');
    for (let i = 0; i + partes.length <= tokens.length; i += 1) {
      if (partes.every((w, k) => tokens[i + k] === w)) return alvo;
    }
  }
  return null;
}

/**
 * O que sobra da frase depois da ativação — o comando propriamente dito.
 * "jarvis abre o mapa" -> "abre o mapa".
 */
export function comandoApos(texto, palavras = ['jarvis', 'baluarte']) {
  const limpo = normalizarFala(texto);
  const achou = temAtivacao(texto, palavras);
  if (!achou) return '';
  const i = limpo.indexOf(achou);
  return limpo.slice(i + achou.length).trim();
}
