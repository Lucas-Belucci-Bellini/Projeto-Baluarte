/* Loader único do MapLibre GL (CDN, sob demanda).
 *
 * Morava dentro de src/pages/mapa.js; saiu de lá no dia em que uma SEGUNDA
 * tela (o mapa tático do /vanguard) precisou do mesmo loader — duplicar
 * significaria duas versões pinadas divergindo em silêncio, que é
 * exatamente o defeito que o camadas-mapa.js compartilhado já corrige
 * para as fontes de tile.
 *
 * Resolve com `null` em falha (rede bloqueada, CDN fora) em vez de
 * rejeitar: quem chama mostra o fallback e segue — mapa é acessório,
 * não pré-condição da página.
 */
let _promise = null;

export function loadMapLibre() {
  if (_promise) return _promise;
  _promise = new Promise((resolve) => {
    if (window.maplibregl) { resolve(window.maplibregl); return; }
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
    document.head.appendChild(css);
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
    s.onload = () => resolve(window.maplibregl);
    s.onerror = () => { _promise = null; resolve(null); };
    document.head.appendChild(s);
  });
  return _promise;
}
