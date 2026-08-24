/**
 * O que toca na máquina — lado WEB do canal `musica:*`.
 *
 * Por que isto existe, e não é mais Spotify
 * -----------------------------------------
 * A ligação ao Spotify pela Web API funciona, mas depende de configuração que
 * não é do Baluarte: conta, app registado, e — enquanto o app estiver em
 * Development mode — a conta do operador listada em User Management. Enquanto
 * qualquer uma dessas peças não estiver no lugar, o Núcleo não sabe o que toca,
 * e não há código deste lado que resolva.
 *
 * O Windows já sabe. O SMTC alimenta o cartão de mídia do sistema com o que
 * qualquer aplicação está tocando — Spotify de desktop, Spotify no navegador,
 * YouTube, VLC. Ler dali dá título e artista sem pedir nada a ninguém, e serve
 * para MAIS fontes do que o caminho do Spotify jamais serviria.
 *
 * Adaptador fino sobre `window.baluarte.invoke('musica:agora')`. O poder real
 * mora no app (`desktop/src/musica.js`); aqui só se conversa com ele. Na web
 * pura nada disto existe — regra do #238: o nativo fica no app.
 */

import { observeJarvisSistemaPlayback } from './jarvis-music-presence';

export interface BaluarteNativeBridge {
  readonly native?: boolean;
  invoke(channel: string, payload?: Readonly<Record<string, unknown>>): Promise<unknown>;
}

export type MusicaNativaPlayback = 'playing' | 'paused' | 'unknown' | 'idle';

export interface MusicaNativaAgora {
  readonly disponivel: boolean;
  readonly motivo: string | null;
  readonly playback: MusicaNativaPlayback;
  readonly titulo: string | null;
  readonly artista: string | null;
  readonly app: string | null;
}

export interface MusicaNativaMonitor {
  start(): void;
  stop(): void;
}

const INTERVALO_PADRAO_MS = 5000;

function bridge(): BaluarteNativeBridge | undefined {
  return typeof window !== 'undefined' ? window.baluarte : undefined;
}

/** A capacidade só existe dentro do Launcher. Na web, dizer isso é a resposta. */
export function musicaNativaDisponivel(): boolean {
  const atual = bridge();
  return !!atual && atual.native === true && typeof atual.invoke === 'function';
}

function texto(valor: unknown): string | null {
  return typeof valor === 'string' && valor.trim() ? valor.trim().slice(0, 200) : null;
}

function indisponivel(motivo: string): MusicaNativaAgora {
  return { disponivel: false, motivo, playback: 'idle', titulo: null, artista: null, app: null };
}

/**
 * Normaliza o que veio do outro lado da ponte.
 *
 * O IPC devolve `unknown` de propósito: o processo principal é outro programa, e
 * confiar na forma do que ele mandou é a mesma classe de erro que confiar num
 * `JSON.parse` de rede.
 */
export function lerMusicaNativa(payload: unknown): MusicaNativaAgora {
  if (payload === null || typeof payload !== 'object') return indisponivel('a ponte devolveu um formato inesperado');
  const registo = payload as Record<string, unknown>;
  if (registo.disponivel !== true) return indisponivel(texto(registo.motivo) ?? 'a leitura não está disponível');
  const bruto = registo.playback;
  const playback: MusicaNativaPlayback =
    bruto === 'playing' || bruto === 'paused' || bruto === 'idle' ? bruto : 'unknown';
  return {
    disponivel: true,
    motivo: null,
    playback,
    titulo: texto(registo.titulo),
    artista: texto(registo.artista),
    app: texto(registo.app),
  };
}

/** Uma leitura avulsa. Nunca rejeita: a falha vem no `motivo`. */
export async function musicaNativaAgora(): Promise<MusicaNativaAgora> {
  const atual = bridge();
  if (!musicaNativaDisponivel() || !atual) {
    return indisponivel('esta leitura vive no app: baixe o Baluarte Launcher para o Núcleo saber o que toca');
  }
  try {
    return lerMusicaNativa(await atual.invoke('musica:agora'));
  } catch (erro) {
    return indisponivel(erro instanceof Error ? erro.message : 'a ponte falhou');
  }
}

/** O texto cru da sonda, para o dia em que não funcionar numa máquina. */
export async function musicaNativaDiagnostico(): Promise<unknown> {
  const atual = bridge();
  if (!musicaNativaDisponivel() || !atual) return { plataforma: 'web', suportado: false };
  try { return await atual.invoke('musica:diagnostico'); } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : String(erro) };
  }
}

/**
 * Pergunta de tempos a tempos e avisa quando MUDA.
 *
 * Só emite na mudança porque quem ouve repinta a interface e reenvia a presença
 * para dentro do quadro do V7: emitir a cada ciclo faria o mesmo trabalho cinco
 * vezes por minuto sem nada de novo para dizer.
 *
 * O ciclo não se sobrepõe a si mesmo — cada volta é agendada quando a anterior
 * termina. Com `setInterval`, uma sonda lenta acumularia chamadas até o
 * PowerShell disputar consigo próprio.
 */
export function createMusicaNativaMonitor(options: {
  readonly intervaloMs?: number;
  readonly onChange: (agora: MusicaNativaAgora) => void;
  readonly ler?: () => Promise<MusicaNativaAgora>;
} ): MusicaNativaMonitor {
  const intervalo = Math.max(1000, options.intervaloMs ?? INTERVALO_PADRAO_MS);
  const ler = options.ler ?? musicaNativaAgora;
  let vivo = false;
  let relogio: ReturnType<typeof setTimeout> | null = null;
  let assinaturaAnterior = '';

  const assinatura = (a: MusicaNativaAgora): string =>
    `${a.disponivel}|${a.playback}|${a.titulo ?? ''}|${a.artista ?? ''}|${a.motivo ?? ''}`;

  const volta = async (): Promise<void> => {
    if (!vivo) return;
    const atual = await ler();
    if (!vivo) return;
    const agora = assinatura(atual);
    if (agora !== assinaturaAnterior) {
      assinaturaAnterior = agora;
      /* A presença é do Baluarte inteiro, não só desta página: o `/diagnostico`
       * e o Mark XIII leem o mesmo instantâneo. */
      if (atual.disponivel) {
        observeJarvisSistemaPlayback(
          atual.playback === 'idle' ? 'unknown' : atual.playback,
          atual.titulo,
          atual.artista,
        );
      }
      options.onChange(atual);
    }
    if (vivo) relogio = setTimeout(() => { void volta(); }, intervalo);
  };

  return {
    start(): void {
      if (vivo) return;
      vivo = true;
      assinaturaAnterior = '';
      void volta();
    },
    stop(): void {
      vivo = false;
      if (relogio !== null) { clearTimeout(relogio); relogio = null; }
    },
  };
}
