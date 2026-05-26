/* Adiciona o campo `genero` a cada faixa de src/data/musicas-yt.js
 * por heurística de artista/palavra-chave. Uso: node scripts/classify-musicas.mjs */
import { readFileSync, writeFileSync } from 'fs';
const { MUSICAS_YT } = await import('../src/data/musicas-yt.js');

function classify(title) {
  const t = title.toLowerCase();
  if (/bar[õo]es da pisadinha|wesley safad[ãa]o|pisadinha/.test(t)) return 'forro';
  if (/pixote|p[ée]ricles|dilsinho|grupo menos é mais|menos e mais|ferrugem|\bpagode|\bsamba/.test(t)) return 'pagode';
  if (/\btauz\b|rap do |rap da |rap de |rap minecraft|rapgame|raptributo|rapsports|\bamv\b|high school dxd|minecraft song|ben 10/.test(t)) return 'rap-geek';
  if (/\bost\b|soundtrack|main theme|\btheme\b|\bdoom\b|assassin|\bhalo\b|fast\s*&?\s*furious|fast  furious|sea shant|\bhino\b|anthem|marcha|battotai|soviet|tribute|optimus prime/.test(t)) return 'trilhas';
  if (/skillet|linkin park|thousand foot|courtesy call|the score|capital cities/.test(t)) return 'rock';
  if (/david guetta|calvin harris|alan walker|timmy trumpet|shadxwbxrn|phonk|sped up|speed up|marlon hoffstadt|dimension remix/.test(t)) return 'eletronica';
  if (/flo rida|usher|britney|wiz khalifa|charlie puth|gym class heroes|o-zone|dragostea|danza kuduro|lane brody|neffex/.test(t)) return 'pop';
  if (/jorge & mateus|jorge e mateus|luan santana|bruno e barretto|antony e gabriel|loubet|z[ée] neto e cristiano|israel & rodolffo|israel e rodolffo|hugo & tiago|hugo e tiago|gusttavo lima|marcos & belutti|henrique e juliano|c[ée]sar menotti|daniel oficial|lucas lucco|munhoz & mariano|munhoz e mariano|ana castela|luan pereira|rafael garcez|edy lemond|alanzim coreano|ti[ãa]o carreiro|milion[áa]rio|sandro becker|traia v[ée]ia|felipe ara[úu]jo/.test(t)) return 'sertanejo';
  return 'outros';
}

const out = MUSICAS_YT.map((v) => ({ ...v, genero: classify(v.title) }));
const dist = {};
out.forEach((v) => (dist[v.genero] = (dist[v.genero] || 0) + 1));
writeFileSync('src/data/musicas-yt.js',
  '/* GERADO por scripts/gen-musicas-yt.mjs + classify-musicas.mjs. Não editar à mão. */\n\n' +
  'export const MUSICAS_YT = ' + JSON.stringify(out) + ';\n');
console.log('Distribuição:', dist);
console.log('\nOUTROS:');
out.filter((v) => v.genero === 'outros').forEach((v) => console.log(' ', v.ytId, v.title));
