/**
 * Cenas Spline por página (#246/#207) — o "nível Spline" do redesign.
 *
 * Dois formatos aceitos:
 *   • `https://prod.spline.design/<id>/scene.splinecode`  (Export → Viewer/Code → <spline-viewer>)
 *   • `https://my.spline.design/<slug>/`                   (Share / Public → embed via <iframe>;
 *      funciona no plano FREE sem exportar, com o selo "Built with Spline")
 *
 * Vazio ('') = a página usa o herói/fundo padrão (fallback WebGL/2D), sem custo.
 * Dá pra testar QUALQUER cena na hora via querystring, sem commitar:
 *   #/home?spline=https://my.spline.design/<slug>/
 *
 * Referências escolhidas pelo operador estão catalogadas na issue do estudo 3D (#262).
 */
export const SPLINE_SCENES = {
  // Ponte de Comando — "Retrofuturistic circuit loop" (embed público, escolha do operador)
  home: 'https://my.spline.design/retrofuturisticcircuitloop-LFzl4kwBK0PnXffLtt4u8469/',
  perfil: '',      // Dossiê (ex.: "Heart Health HUD")
  gitNexus: '',    // Núcleo de IA (ex.: "The Eternal ARC" / "Retrofuturistic circuit loop")
  universo: '',    // Hub de Universos (ex.: "Orbital View of Arrakis")
  biblioteca: '',  // Crônicas (ex.: "The Eternal ARC" / "Pandemonium")
  elites: '',      // Elites (ex.: "Sci-fi Spaceship" / "Gridcorp")
  arsenal: '',     // Arsenal (ex.: "Ducati XDiavel")
  sobre: '',       // Sobre (ex.: "Gridcorp" / "3D Diagram")
  baixar: ''       // /baixar (ex.: "SPLYN mockups")
};

/** Resolve a cena de uma página: querystring (teste) > config.
 * A URL via querystring é restrita ao domínio do Spline (evita carregar origem
 * arbitrária a partir de um parâmetro de URL). */
export function sceneFor(key, query) {
  const q = query && (query.spline || query.scene);
  if (q && /^https:\/\/(prod\.|my\.)?spline\.design\/[^"'<>]+$/.test(q)) return q;
  return SPLINE_SCENES[key] || '';
}
