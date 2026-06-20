/**
 * Cenas Spline por página (#246/#207) — o "nível Spline" do redesign.
 *
 * COLE aqui a URL .splinecode exportada de cada cena que você escolher:
 *   Spline → abrir a cena (community: ela duplica pra sua conta) → Export →
 *   Viewer → copiar a URL  https://prod.spline.design/<id>/scene.splinecode
 *
 * Vazio ('') = a página usa o herói/fundo padrão (fallback WebGL/2D), sem custo.
 * Também dá pra testar QUALQUER cena na hora via querystring, sem commitar:
 *   #/home?spline=https://prod.spline.design/<id>/scene.splinecode
 *
 * Referências escolhidas pelo operador estão catalogadas na issue do estudo 3D (#262).
 */
export const SPLINE_SCENES = {
  home: '',        // herói da Ponte de Comando (ex.: "AI Landing" / "Sci-fi Spaceship" / "Futuristic Rays")
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
  if (q && /^https:\/\/(prod\.)?spline\.design\/[^"'<>]+$/.test(q)) return q;
  return SPLINE_SCENES[key] || '';
}
