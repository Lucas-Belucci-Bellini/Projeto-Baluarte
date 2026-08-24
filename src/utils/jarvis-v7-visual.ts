import { h } from './helpers.js';

export type JarvisV7VisualState = 'loading' | 'ready' | 'fallback';

export const JARVIS_V7_PATH = '/project%20V2/Modelar%20objeto%203D/jarvis-nucleo-v7.html';

/** As superfícies que a página oferece ao Núcleo — o app tem as duas; a web, nenhuma. */
export type JarvisV7Superficie = 'conversa' | 'config';

export interface JarvisV7SuperficiesOferecidas {
  readonly conversa: boolean;
  readonly config: boolean;
}

export interface JarvisV7VisualOptions {
  readonly fallback: HTMLElement;
  readonly source?: string;
  readonly onState?: (state: JarvisV7VisualState) => void;
  /**
   * Chamado quando alguém prime um dos botões de superfície no HUD do Núcleo.
   *
   * O Núcleo não abre nada: ele avisa. Quem tem a conversa é quem a abre — é
   * isso que permite os botões viverem lá dentro sem o artefato 3D saber o que
   * é uma sessão de chat.
   */
  readonly onSuperficie?: (superficie: JarvisV7Superficie) => void;
}

/** Só metadado de playback: o que a Web API do Spotify entrega, e nada além. */
export interface JarvisV7PresencaMusical {
  readonly tocando: boolean;
  readonly titulo: string | null;
  readonly artista: string | null;
}

export interface JarvisV7Visual {
  readonly root: HTMLDivElement;
  readonly frame: HTMLIFrameElement;
  readonly source: string;
  setState(state: JarvisV7VisualState): void;
  /**
   * Conta ao Núcleo o que está tocando fora dele.
   *
   * O V7 vive num `<iframe>` e não fala com o Spotify — quem tem a sessão é
   * esta página. Sem esta ponte, o operador via o Spotify tocando e o botão
   * `♪ música` respondendo "partitura generativa", que é uma resposta errada
   * para a pergunta certa. O estado fica guardado e é reenviado quando o quadro
   * termina de carregar, senão uma faixa que já tocava antes do `load` nunca
   * chegaria lá.
   */
  publicarPresencaMusical(presenca: JarvisV7PresencaMusical): void;
  /** Diz ao Núcleo quais botões de superfície mostrar. Sem isto, nenhum aparece. */
  publicarSuperficies(oferecidas: JarvisV7SuperficiesOferecidas): void;
  /** Devolve ao Núcleo qual superfície está aberta, para o botão acender junto. */
  publicarSuperficieAberta(aberta: JarvisV7Superficie | null): void;
  dispose(): void;
}

function currentOrigin(): string {
  const locationValue = globalThis.location;
  return locationValue && typeof locationValue.origin === 'string'
    ? locationValue.origin
    : 'http://localhost';
}

/**
 * Faz o palco ocupar o que sobra da janela — medindo, não calculando.
 *
 * `calc(100vh - cabeçalho - padding)` erra aqui, e erra por pouco: o que fica
 * acima do palco varia com a faixa "V2 em construção", que o operador pode
 * fechar, e com o padding do shell. Medido em navegador, o erro era de 42 px —
 * o bastante para a página ganhar barra de rolagem, que é exatamente o defeito
 * que o palco existe para não ter.
 *
 * Devolve a função que solta os ouvintes; chamá-la é obrigatório ao sair da rota.
 */
export function ocuparAlturaRestante(elemento: HTMLElement, folga = 14): () => void {
  let ultimo = -1;
  const ajustar = (): void => {
    const topo = elemento.getBoundingClientRect().top;
    const disponivel = Math.max(320, Math.round(window.innerHeight - topo - folga));
    /* Sair cedo quando nada mudou é o que impede o observador de se realimentar:
     * mudar a altura muda o corpo, que dispara o observador de novo. */
    if (disponivel === ultimo) return;
    ultimo = disponivel;
    elemento.style.setProperty('--palco-altura', `${disponivel}px`);
  };
  /* A primeira medição pega a página a meio caminho — o shell ainda monta, a
   * faixa do topo ainda entra — e mediu 39 px a menos numa observação real. O
   * observador abaixo não corrige isso: o corpo tem `min-height: 100vh` e não
   * muda de altura quando o palco muda. Daí as remedições escalonadas, que a
   * guarda de igualdade torna baratas: a que chegar depois do layout assentar
   * é a que vale, e as outras saem sem tocar em nada. */
  ajustar();
  const remedicoes = [0, 60, 250, 800].map((atraso) => setTimeout(ajustar, atraso));
  window.addEventListener('resize', ajustar);
  /* A faixa do topo some sem a janela mudar de tamanho: só o layout avisa. */
  const observador = typeof ResizeObserver === 'function' ? new ResizeObserver(ajustar) : null;
  observador?.observe(document.body);
  return (): void => {
    for (const id of remedicoes) clearTimeout(id);
    window.removeEventListener('resize', ajustar);
    observador?.disconnect();
  };
}

export function normalizeJarvisV7Url(source = JARVIS_V7_PATH): string {
  if (typeof source !== 'string' || source.trim().length === 0) {
    throw new TypeError('fonte do JARVIS V7 deve ser texto não vazio');
  }
  const origin = currentOrigin();
  const resolved = new URL(source.trim(), `${origin}/`);
  if (resolved.origin !== origin || resolved.pathname !== JARVIS_V7_PATH || resolved.search || resolved.hash) {
    throw new TypeError('fonte do JARVIS V7 deve ser o artefato local same-origin');
  }
  return resolved.href;
}

export function createJarvisV7Visual(options: JarvisV7VisualOptions): JarvisV7Visual {
  const source = normalizeJarvisV7Url(options.source);
  const root = h('div', {
    className: 'jv-visual-switcher',
    dataset: { visualSource: 'jarvis-nucleo-v7', visualState: 'loading' },
  }) as HTMLDivElement;
  const frame = h('iframe', {
    className: 'jv-visual-switcher__frame',
    title: 'J.A.R.V.I.S. Núcleo V7 — visualização 3D',
    loading: 'eager',
    referrerPolicy: 'no-referrer',
    sandbox: 'allow-scripts allow-same-origin',
    /* O quadro é same-origin, então a política de permissões já o alcançaria por
     * herança; declarar mesmo assim é o que impede uma mudança futura de origem
     * ou de cabeçalho de desligar microfone e partilha de áudio em silêncio —
     * e é por essas duas que o espectrómetro recebe som de verdade. */
    allow: 'microphone; display-capture',
    src: source,
    'aria-label': 'J.A.R.V.I.S. Núcleo V7, visualização 3D',
  }) as HTMLIFrameElement;
  const fallback = options.fallback;
  fallback.classList.add('jv-visual-switcher__fallback');
  fallback.dataset.v7Fallback = 'true';
  root.append(frame, fallback);

  let disposed = false;
  const setState = (state: JarvisV7VisualState): void => {
    if (disposed) return;
    root.dataset.visualState = state;
    frame.hidden = state !== 'ready';
    fallback.hidden = state === 'ready';
    options.onState?.(state);
  };
  let presencaAtual: JarvisV7PresencaMusical | null = null;
  const enviarPresenca = (): void => {
    if (disposed || presencaAtual === null) return;
    frame.contentWindow?.postMessage({
      source: 'baluarte-presenca-musical',
      tocando: presencaAtual.tocando,
      titulo: presencaAtual.titulo,
      artista: presencaAtual.artista,
    }, currentOrigin());
  };

  /* O estado das superfícies também é guardado e reenviado no `load`: o quadro
   * recarrega, e sem isto os botões voltariam escondidos com a conversa aberta
   * atrás deles. */
  let superficiesAtuais: JarvisV7SuperficiesOferecidas | null = null;
  let superficieAberta: JarvisV7Superficie | null = null;
  const enviarSuperficies = (): void => {
    if (disposed || superficiesAtuais === null) return;
    frame.contentWindow?.postMessage({
      source: 'baluarte-superficies',
      conversa: superficiesAtuais.conversa,
      config: superficiesAtuais.config,
    }, currentOrigin());
    frame.contentWindow?.postMessage({
      source: 'baluarte-superficie-estado',
      aberta: superficieAberta,
    }, currentOrigin());
  };

  const onLoad = (): void => { setState('ready'); enviarPresenca(); enviarSuperficies(); };
  const onError = (): void => setState('fallback');

  /* O `load` do iframe só conta que o DOCUMENTO carregou. Se o three.js não
   * chegar ou o WebGL não subir, o documento carrega igual e o núcleo fica um
   * retângulo com uma frase de erro — pior ainda na web, onde ele é a página
   * inteira. O artefato V7 avisa o desfecho por postMessage; é esse aviso, e
   * não o `load`, que sabe a diferença entre "pronto" e "falhou". */
  const onMessage = (event: MessageEvent): void => {
    if (event.origin !== currentOrigin() || event.source !== frame.contentWindow) return;
    const payload = event.data;
    if (payload === null || typeof payload !== 'object') return;
    const record = payload as Record<string, unknown>;
    if (record.source === 'baluarte-nucleo-acao') {
      const acao = record.acao;
      if (acao === 'conversa' || acao === 'config') options.onSuperficie?.(acao);
      return;
    }
    if (record.source !== 'jarvis-nucleo-v7') return;
    if (record.status === 'failed') setState('fallback');
    else if (record.status === 'ready') setState('ready');
  };

  frame.addEventListener('load', onLoad);
  frame.addEventListener('error', onError);
  globalThis.addEventListener('message', onMessage);
  setState('loading');

  return {
    root,
    frame,
    source,
    setState,
    publicarPresencaMusical(presenca: JarvisV7PresencaMusical): void {
      presencaAtual = presenca;
      enviarPresenca();
    },
    publicarSuperficies(oferecidas: JarvisV7SuperficiesOferecidas): void {
      superficiesAtuais = oferecidas;
      enviarSuperficies();
    },
    publicarSuperficieAberta(aberta: JarvisV7Superficie | null): void {
      superficieAberta = aberta;
      enviarSuperficies();
    },
    dispose(): void {
      if (disposed) return;
      disposed = true;
      frame.removeEventListener('load', onLoad);
      frame.removeEventListener('error', onError);
      globalThis.removeEventListener('message', onMessage);
      frame.src = 'about:blank';
      frame.remove();
      fallback.hidden = false;
      fallback.classList.remove('jv-visual-switcher__fallback');
      delete fallback.dataset.v7Fallback;
    },
  };
}
