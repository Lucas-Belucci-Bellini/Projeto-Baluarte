/* Gera src/data/elites-rosters.js a partir do .md das Equipes.
 * Uso: node scripts/gen-elites-rosters.mjs
 * Best-effort: extrai os nomes dos membros de cada seção de equipe. */
import { readFileSync, writeFileSync } from 'fs';

const MD = 'Equipes ALFA e BRAVO e CHARLIE e DELTA e ECHO e Foxtrott e Golf e Hotel e India e  Juliett e Kilo e Mike e November e Oscar e Papa e Quebec e Romeo.md';
const md = readFileSync(MD, 'utf8');
const body = md.slice(md.indexOf('# TODAS AS EQUIPES'));
const teamRe = /^#\s+(?:\*\*)?([A-Z]{4,})(?:\*\*)?\s*$/;

const SKIP = /^(Equipe|Operador|Agente|Policial|Pesquisador|Funcion[aá]rio|Membro da|Operativo|Capit[aã]o d[ao]\b|Objetivo|Especialidade|Fun[cç][aã]o|Lideran[cç]a|Comando|Comandante|L[íi]der|Membros|E \d+ equipes|E equipes|Perfil|Ocupa[cç][aã]o|Status|Armamento|Equipamento|Ve[íi]culo|Nave|Divis[aã]o|Se[cç][aã]o)/i;

function clean(name) {
  name = name.trim();
  // parênteses desbalanceados → corta a partir do "(" solto
  if ((name.match(/\(/g) || []).length > (name.match(/\)/g) || []).length) {
    name = name.slice(0, name.lastIndexOf('(')).trim();
  }
  name = name.replace(/,\s*(Sexo|G[eê]nero)\b.*$/i, '').trim();
  return name.replace(/[\s,;]+$/, '').trim();
}

const teams = {};
let cur = null;
for (const raw of body.split('\n')) {
  const m = raw.match(teamRe);
  if (m && m[1] !== 'TODAS') { cur = m[1]; teams[cur] = teams[cur] || []; continue; }
  if (!cur || !/^#\s+/.test(raw)) continue;
  let t = raw.replace(/^#\s+/, '').replace(/\*/g, '').replace(/\\/g, '').trim();
  if (!t) continue;
  if (/^\d+\s*\./.test(t)) continue;
  let name = clean(t.split(':')[0].split(/\s+\(\s*(?:Ocupa|Piloto)/i)[0]);
  if (name.length < 2 || name.length > 60) continue;
  if (SKIP.test(name)) continue;
  if (/\b(19|20)\d{2}\b/.test(name)) continue;
  if (/^[a-z]/.test(name)) continue;
  if (/^\d/.test(name)) continue;                    // veículos/contagens "3 HMMWV"
  if (name.toUpperCase() === cur) continue;          // nome da própria equipe
  teams[cur].push(name);
}
for (const k of Object.keys(teams)) { teams[k] = [...new Set(teams[k])]; if (!teams[k].length) delete teams[k]; }

writeFileSync('src/data/elites-rosters.js',
  '/* GERADO por scripts/gen-elites-rosters.mjs a partir do .md das Equipes.\n' +
  ' * Não editar à mão — rode o script para atualizar. Roster best-effort. */\n\n' +
  'export const ROSTERS = ' + JSON.stringify(teams, null, 2) + ';\n');

console.log('Contagem:', Object.fromEntries(Object.entries(teams).map(([k,v])=>[k,v.length])));
console.log('ALFA:', JSON.stringify(teams.ALFA));
console.log('BRAVO:', JSON.stringify(teams.BRAVO));
console.log('DELTA:', JSON.stringify(teams.DELTA));
