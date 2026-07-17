/**
 * Biblioteca da INSTALAÇÃO de Arma 3 do operador (#386, 0.7.2) — catálogo
 * montado a partir do snapshot no Google Drive do operador (2026-07-17).
 *
 * SÓ METADADOS: nomes de pastas/DLC. Nenhum binário ou conteúdo do jogo
 * (modelos .p3d, PBOs, executáveis) entra no site — é conteúdo protegido da
 * Bohemia Interactive. Isto é só o "índice" do que está instalado, pra
 * completar os dados dos modpacks no site.
 */

/* Pastas de conteúdo → DLC/expansão oficial correspondente (as que o Drive
 * do operador tinha). "base" = jogo-base, sempre presente. */
export const ARMA3_DLCS = [
  { pasta: 'Addons',    nome: 'Arma 3 (jogo-base)',        tipo: 'base',       ano: 2013 },
  { pasta: 'Curator',   nome: 'Zeus',                       tipo: 'grátis',     ano: 2014 },
  { pasta: 'Kart',      nome: 'Karts',                      tipo: 'DLC',        ano: 2014 },
  { pasta: 'Heli',      nome: 'Helicopters',                tipo: 'DLC',        ano: 2014 },
  { pasta: 'Mark',      nome: 'Marksmen',                   tipo: 'DLC',        ano: 2015 },
  { pasta: 'Expansion', nome: 'Apex',                       tipo: 'expansão',   ano: 2016 },
  { pasta: 'Jets',      nome: 'Jets',                       tipo: 'DLC',        ano: 2017 },
  { pasta: 'Orange',    nome: 'Laws of War',                tipo: 'DLC',        ano: 2017 },
  { pasta: 'Argo',      nome: 'Argo (spin-off grátis)',     tipo: 'grátis',     ano: 2017 },
  { pasta: 'Tacops',    nome: 'Tac-Ops',                    tipo: 'DLC',        ano: 2018 },
  { pasta: 'Tank',      nome: 'Tanks',                      tipo: 'DLC',        ano: 2018 },
  { pasta: 'Enoch',     nome: 'Contact (Livônia)',          tipo: 'expansão',   ano: 2019 },
  { pasta: 'Contact',   nome: 'Contact (plataforma)',       tipo: 'expansão',   ano: 2019 },
  { pasta: 'AoW',       nome: 'Art of War',                 tipo: 'DLC',        ano: 2021 },
  { pasta: 'WS',        nome: 'Western Sahara (CDLC)',      tipo: 'CDLC',       ano: 2021 },
  { pasta: 'EF',        nome: 'Expeditionary Forces',       tipo: 'CDLC',       ano: 2023 },
  { pasta: 'RF',        nome: 'Reaction Forces',            tipo: 'CDLC',       ano: 2024 }
];

export const ARMA3_INSTALACAO = {
  origem: 'snapshot do Drive do operador · 2026-07-17',
  totalDlcs: ARMA3_DLCS.length,
  nota: 'Só o índice dos DLCs instalados — nenhum arquivo do jogo é hospedado (licença Bohemia). Os modelos do jogo abrem localmente pelo Visualizador universal (/modelos-3d).'
};
