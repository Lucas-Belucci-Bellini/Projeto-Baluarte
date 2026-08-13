/* Loader único do MapLibre GL — do npm, sob demanda.
 *
 * Morava dentro de src/pages/mapa.js; saiu de lá no dia em que uma SEGUNDA
 * tela (o mapa tático do /vanguard) precisou do mesmo loader — duplicar
 * significaria duas versões pinadas divergindo em silêncio, que é exatamente
 * o defeito que o camadas-mapa.js compartilhado já corrige para as fontes de
 * tile.
 *
 * ## Por que saiu do CDN (o defeito do mapa em branco)
 *
 * A versão anterior injetava `<link>` do CSS e `<script>` da biblioteca, os
 * dois do unpkg, e resolvia no `onload` do SCRIPT. O CSS não era esperado.
 *
 * Isso é uma corrida, e ela perde com frequência: o MapLibre mede o contêiner
 * DENTRO do construtor. Sem `.maplibregl-canvas { position: absolute }` já
 * aplicado, ele mede errado, o canvas nasce 0×0 — e não remede sozinho. O
 * resultado é o pior tipo de falha: o mapa "funciona". Controles de zoom
 * aparecem, marcadores ficam no lugar certo, clique responde, coordenada e
 * azimute saem corretos. Só o mapa não desenha, porque a única peça que
 * dependia do CSS era justamente a que pinta.
 *
 * Vindo do npm, o `import` do CSS é awaitado junto com o do módulo: quando a
 * promessa resolve, as duas coisas estão de pé. De quebra, some a dependência
 * de rede em runtime — o app desktop e o modo offline passam a ter mapa, e a
 * versão fica pinada no lockfile em vez de num pedaço de URL.
 *
 * É também o que o Project Vanguard já fazia. Uma implementação, dois repos.
 *
 * Resolve com `null` em falha (chunk que não baixa, WebGL ausente) em vez de
 * rejeitar: quem chama mostra o fallback e segue — mapa é acessório, não
 * pré-condição da página.
 */
let _promise = null;

export function loadMapLibre() {
  if (_promise) return _promise;

  _promise = (async () => {
    try {
      /* Os dois juntos, e AWAITADOS juntos. A ordem entre eles não importa;
       * o que importa é nenhum consumidor ver o módulo antes do CSS. */
      const [mod] = await Promise.all([
        import('maplibre-gl'),
        import('maplibre-gl/dist/maplibre-gl.css')
      ]);
      return mod.default ?? mod;
    } catch (err) {
      console.error('[maplibre] não deu para carregar:', err);
      _promise = null;              // deixa uma próxima tentativa acontecer
      return null;
    }
  })();

  return _promise;
}
