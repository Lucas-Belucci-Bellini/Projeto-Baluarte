/**
 * Visor 3D — o módulo que dá consumidor ao engine 3D da V2.
 *
 * O `V2_MASTER_PLAN` §12 manda **preparar** um visualizador reutilizável. O
 * engine (`cena.js`) é a preparação; este módulo é o que impede a preparação de
 * virar peça morta. Sem ele o engine teria testes e nenhum caminho de execução —
 * o padrão que este repositório já pagou quatro vezes.
 *
 * ── O que este módulo NÃO declara, e por quê ────────────────────────────────
 * Nenhuma permissão e nenhuma chave de storage. Uma cena de demonstração não lê
 * arquivo, não vai à rede e não guarda nada. Declarar permissão "para o futuro"
 * seria pedir poder sem uso — o oposto de deny-by-default, e o tipo de
 * declaração que envelhece concedida.
 *
 * ── Sobre `ambiente` ────────────────────────────────────────────────────────
 * Declarado `ambos`, e é escolha, não descuido. O mega-plano (#238) reserva o 3D
 * pesado para o app; a cena aqui é leve de propósito (icosaedro em wireframe,
 * sem textura nem post-processing). Vale registrar o achado que levou a isso:
 * **`ambiente` não é cobrado por ninguém** — nem o boot nem o registry filtram
 * por ele. Declarar `app` não impediria a execução na web; impediria só que
 * alguém percebesse. A contenção real é a cena ser leve.
 */

/** @typedef {{log: {info: (m: string, f?: Record<string, unknown>) => void}}} VisorContexto */

/** @type {VisorContexto|null} */
let ctx = null;

/** @param {unknown} _args */
const loadView = (_args) => import('./view.js').then((m) => m.criarView());

const moduleManifest = {
  id: 'visor3d',
  name: 'Visor 3D',
  version: '1.0.0',
  description: 'Engine 3D reutilizável da V2 — cena, câmera, luz, animação e descarte.',
  stability: 'experimental',
  icon: '⬢',
  ambiente: 'ambos',
  nav: { section: 'nucleo', order: 90 },
  permissions: [],
  storage: [],
  events: { emits: [], consumes: [] },
  api: {
    health: () => ({ ok: true, status: ctx ? 'ready' : 'stopped' })
  },
  apiVersion: 1,
  routes: [
    { path: '/visor3d', view: loadView }
  ],
  lifecycle: {
    /** @param {VisorContexto} contexto */
    init(contexto) {
      ctx = contexto;
      contexto.log.info('visor 3D preparado', { cena: 'leve' });
    },
    dispose() {
      /* A cena em si é descartada pela vista (`destruir()`), quando a rota sai.
       * Aqui só se solta o contexto: o módulo não é dono de nenhuma cena, e
       * fingir que é faria duas coisas disputarem o mesmo `dispose`. */
      ctx = null;
    }
  }
};

export default moduleManifest;
