import { h, cx, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { PC_PRESETS } from '../data/modpack.js';

const STORAGE_KEY = 'guia-pc:state';
interface GuidePcState { selected: string; }
interface Step { readonly title: string; readonly items: readonly string[]; }
let state: GuidePcState = { selected: 'gamer' };
let detailEl: HTMLDivElement | null = null;
const STEPS: readonly Step[] = [
  { title: '1. Preparação', items: ['Espaço de trabalho limpo, anti-estático (pulseira ou toque na carcaça aterrada).', 'Chave Phillips #2 magnetizada e organizador para parafusos.', 'Manual da placa-mãe ao lado — referência de slots e jumpers.', 'Pasta térmica (se cooler não vier pré-aplicado).'] },
  { title: '2. Montagem na placa-mãe (fora do gabinete)', items: ['Instalar CPU: alinhar triângulo dourado com o do socket. Sem força.', 'Aplicar pasta térmica: 1 grão de ervilha no centro do CPU.', 'Encaixar cooler/AIO conforme manual; conectar fan no header CPU_FAN.', 'Inserir RAM nos slots 2 e 4 (A2/B2) para dual-channel — checar manual.', 'Instalar M.2 NVMe principal (slot CPU, geralmente o de cima).'] },
  { title: '3. Montagem no gabinete', items: ['Fixar PSU primeiro (geralmente embaixo, fan virado pra baixo se houver entrada).', 'Instalar standoffs no gabinete conforme tamanho da mobo (ATX/mATX/ITX).', 'Fixar I/O shield (em mobos antigas) ou checar shield integrado.', 'Posicionar mobo nos standoffs, parafusar em todos os 9 pontos (ATX).', 'Conectar 24-pin ATX, 8-pin EPS (CPU), front panel headers conforme manual.'] },
  { title: '4. GPU + storage adicional', items: ['Remover slots PCIe correspondentes do gabinete.', 'Inserir GPU no slot PCIe x16 (geralmente o mais próximo da CPU).', 'Conectar cabos PCIe da PSU à GPU (não usar adaptador molex).', 'Adicionar SSD SATA / HDD em baias dedicadas.'] },
  { title: '5. Cabos de gabinete', items: ['Power SW, Reset SW, Power LED, HDD LED — checar polaridade no manual.', 'USB header frontal (USB 3.0 = azul, blocky; 2.0 = pinos).', 'Audio HD AUDIO header.', 'Fans do gabinete: organize em air-pressure positiva (entrada > saída).'] },
  { title: '6. Primeiro boot', items: ['Antes de fechar: revisar todas conexões.', 'Plug monitor na GPU (não na mobo, exceto se for APU sem GPU).', 'Power on. Se POST, acessar BIOS (Del/F2) e habilitar XMP/DOCP/EXPO.', 'Atualizar BIOS se necessário (especialmente AM4 com Ryzen 5xxx).', 'Instalar Windows/Linux. Drivers GPU primeiro, depois chipset.'] },
  { title: '7. Pós-boot — Stress test', items: ['CPU: Cinebench R23 (10min loop) — temperaturas <85°C.', 'GPU: 3DMark Time Spy ou Furmark 15min.', 'RAM: MemTest86 (boot USB) — 4+ passes sem erro.', 'NVMe: CrystalDiskMark — confirmar velocidades anunciadas.'] },
];
function loadState(): GuidePcState { const stored = storage.get(STORAGE_KEY); if (typeof stored === 'object' && stored !== null && 'selected' in stored && typeof stored.selected === 'string') return { selected: stored.selected }; return { selected: 'gamer' }; }
function persist(): void { storage.set(STORAGE_KEY, state); }
function renderDetail(): void {
  if (!detailEl) return;
  empty(detailEl);
  const preset = PC_PRESETS.find((candidate) => candidate.id === state.selected);
  if (!preset) return;
  detailEl.append(
    h('div', { className: 'pc-preset__head', style: `--p-color: ${preset.color};` }, h('div', { className: 'pc-preset__icon', style: `color: ${preset.color}; border-color: ${preset.color};` }, preset.icon), h('div', null, h('h2', { className: 'pc-preset__name' }, preset.name), h('p', { className: 'pc-preset__purpose' }, preset.purpose))),
    h('div', { className: 'pc-parts' }, ...preset.parts.map((part) => h('div', { className: 'pc-part' }, h('span', { className: 'pc-part__type' }, part.type), h('span', { className: 'pc-part__value' }, part.value)))),
    h('div', { className: 'pc-preset__tip' }, h('strong', null, '◆ Dica: '), preset.tip)
  );
}
export function guiaPcPage(): HTMLDivElement {
  state = loadState();
  const fullPage = h('div', { className: 'page-pc' });
  fullPage.append(h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } }, h('div', { className: 'page-header__crumbs' }, h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'FERRAMENTAS'), h('span', null, '›'), h('span', null, 'GUIA PC')), h('h1', { className: 'page-header__title' }, '◨ Guia para Montar PC'), h('p', { className: 'page-header__description' }, '4 presets de build (orçamento, gamer 1440p, creator, workstation) + tutorial de 7 passos pra montar do zero.')));
  const presetGrid = h('div', { className: 'pc-presets' });
  PC_PRESETS.forEach((preset) => presetGrid.appendChild(h('button', { className: cx('pc-preset-tab', state.selected === preset.id && 'is-active'), style: `--p-color: ${preset.color};`, onclick: (): void => { state.selected = preset.id; persist(); document.querySelectorAll('.pc-preset-tab').forEach((button) => button.classList.toggle('is-active', (button.textContent ?? '').includes(preset.name.split(' ')[0] ?? ''))); renderDetail(); } }, h('span', { className: 'pc-preset-tab__icon', style: `color: ${preset.color};` }, preset.icon), h('span', { className: 'pc-preset-tab__name' }, preset.name))));
  fullPage.appendChild(presetGrid);
  detailEl = h('div', { className: 'pc-detail' });
  fullPage.appendChild(detailEl);
  const stepsWrap = h('div', { className: 'pc-steps' }, h('h2', { className: 'pc-steps__title' }, '☷ Tutorial de montagem · 7 passos'));
  STEPS.forEach((step) => stepsWrap.appendChild(h('div', { className: 'pc-step' }, h('div', { className: 'pc-step__title' }, step.title), h('ul', { className: 'pc-step__list' }, ...step.items.map((item) => h('li', null, item))))));
  fullPage.appendChild(stepsWrap);
  renderDetail();
  return fullPage;
}
