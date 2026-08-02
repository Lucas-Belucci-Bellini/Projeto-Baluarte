/**
 * Testes da matemática de cor (`/color-studio`).
 *
 * A conta já estava certa quando a auditoria chegou — o que não existia era
 * prova. As funções moravam dentro da página, que importa CSS no topo, então
 * não carregavam em Node e nenhum teste podia alcançá-las. Extraídas para
 * `src/utils/cor.js`, passam a ser conferíveis contra fonte publicada.
 *
 * Âncoras usadas, nenhuma delas número lembrado de cabeça:
 *   - WCAG 2.x: luminância 0 no preto e 1 no branco, contraste máximo 21;
 *   - valores de contraste publicados pelo WebAIM para tons cinza conhecidos;
 *   - OKLCH de referência do Björn Ottosson para o vermelho puro;
 *   - propriedades estruturais: ida-e-volta, simetria, monotonicidade.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  hexToRgb, rgbToHex, rgbToHsl, hslToRgb,
  srgbToLinear, rgbToOklch, relLuminance, contrastRatio
} from '../src/utils/cor.js';

const perto = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg || ''} ${a} ≠ ${b} (tol ${tol})`);
const rgb = (hex) => hexToRgb(hex);

/* ============================ leitura de HEX =============================== */

test('lê hex de 6 e de 3 dígitos, com e sem cerquilha', () => {
  assert.deepEqual(rgb('#ff0000'), { r: 255, g: 0, b: 0 });
  assert.deepEqual(rgb('ff0000'), { r: 255, g: 0, b: 0 });
  assert.deepEqual(rgb('#f00'), { r: 255, g: 0, b: 0 }, 'a forma curta duplica cada dígito');
  assert.deepEqual(rgb('#abc'), { r: 0xaa, g: 0xbb, b: 0xcc });
  assert.deepEqual(rgb('#FFFFFF'), { r: 255, g: 255, b: 255 }, 'maiúscula vale igual');
});

test('hex inválido devolve null, não uma cor inventada', () => {
  for (const ruim of ['#gg0000', 'xyz', '', '#12345', '#1234567', null, undefined]) {
    assert.equal(rgb(ruim), null, `"${ruim}" deveria ser rejeitado`);
  }
});

test('ida e volta hex → rgb → hex', () => {
  for (const hex of ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#123456', '#abcdef']) {
    assert.equal(rgbToHex(rgb(hex)), hex);
  }
});

test('rgbToHex prende no intervalo em vez de estourar', () => {
  assert.equal(rgbToHex({ r: 300, g: -20, b: 128 }), '#ff0080');
  assert.equal(rgbToHex({ r: 0.4, g: 0.6, b: 255.7 }), '#0001ff', 'arredonda, não trunca');
});

/* ================================= HSL ===================================== */

test('ida e volta hex → hsl → rgb → hex', () => {
  for (const hex of ['#000000', '#ffffff', '#808080', '#ff0000', '#00ff00', '#0000ff',
                     '#7f3fbf', '#123456', '#abcdef', '#fedcba']) {
    assert.equal(rgbToHex(hslToRgb(rgbToHsl(rgb(hex)))), hex, `${hex} não fechou`);
  }
});

test('as cores primárias caem nos ângulos certos do círculo', () => {
  /* Definição do modelo HSL: vermelho 0°, verde 120°, azul 240°. */
  perto(rgbToHsl(rgb('#ff0000')).h, 0, 0.01, 'vermelho');
  perto(rgbToHsl(rgb('#00ff00')).h, 120, 0.01, 'verde');
  perto(rgbToHsl(rgb('#0000ff')).h, 240, 0.01, 'azul');
});

test('cinza não tem saturação; preto e branco são os extremos da luminosidade', () => {
  for (const cinza of ['#000000', '#404040', '#808080', '#c0c0c0', '#ffffff']) {
    perto(rgbToHsl(rgb(cinza)).s, 0, 1e-9, `${cinza} deveria ter saturação zero`);
  }
  perto(rgbToHsl(rgb('#000000')).l, 0, 1e-9);
  perto(rgbToHsl(rgb('#ffffff')).l, 100, 1e-9);
});

test('matiz dá a volta: 360° é o mesmo que 0°, e negativo normaliza', () => {
  const base = { h: 0, s: 100, l: 50 };
  assert.deepEqual(hslToRgb({ ...base, h: 360 }), hslToRgb(base));
  assert.deepEqual(hslToRgb({ ...base, h: -120 }), hslToRgb({ ...base, h: 240 }));
  assert.deepEqual(hslToRgb({ ...base, h: 480 }), hslToRgb({ ...base, h: 120 }));
});

/* ===================== luminância e contraste (WCAG 2.x) =================== */

test('luminância relativa vale 0 no preto e 1 no branco', () => {
  /* Os dois extremos são definidos pelo próprio padrão. */
  assert.equal(relLuminance(rgb('#000000')), 0);
  assert.equal(relLuminance(rgb('#ffffff')), 1);
});

test('a curva sRGB→linear tem o joelho onde o padrão manda', () => {
  /* IEC 61966-2-1: reta até 0,04045, potência 2,4 depois — e as duas metades
   * têm que se encontrar no ponto de troca, senão há degrau na curva. */
  const t = 0.04045 * 255;
  perto(srgbToLinear(t - 1e-6), srgbToLinear(t + 1e-6), 1e-6, 'degrau no joelho da curva');
  assert.equal(srgbToLinear(0), 0);
  assert.equal(srgbToLinear(255), 1);
});

test('o verde pesa mais que o vermelho, que pesa mais que o azul', () => {
  /* Coeficientes 0,2126 / 0,7152 / 0,0722: é o olho humano, não escolha nossa. */
  const v = relLuminance(rgb('#ff0000'));
  const g = relLuminance(rgb('#00ff00'));
  const a = relLuminance(rgb('#0000ff'));
  assert.ok(g > v && v > a, `esperado verde > vermelho > azul, veio ${g} ${v} ${a}`);
  perto(v + g + a, 1, 1e-9, 'as três primárias somam o branco');
});

test('contraste: 21 é o máximo do padrão, 1 é o mínimo', () => {
  perto(contrastRatio(rgb('#000000'), rgb('#ffffff')), 21, 1e-9);
  assert.equal(contrastRatio(rgb('#ffffff'), rgb('#ffffff')), 1);
  assert.equal(contrastRatio(rgb('#000000'), rgb('#000000')), 1);
});

test('contraste confere com os valores publicados pelo WebAIM', () => {
  /* Referência externa e verificável — não valor que eu tenha digitado
   * de memória. */
  perto(contrastRatio(rgb('#777777'), rgb('#ffffff')), 4.48, 0.005, '#777 sobre branco');
  perto(contrastRatio(rgb('#767676'), rgb('#ffffff')), 4.54, 0.005, '#767676 sobre branco');
  perto(contrastRatio(rgb('#595959'), rgb('#ffffff')), 7.00, 0.01, '#595959 sobre branco (limiar AAA)');
});

test('contraste é simétrico — a ordem dos dois não muda a razão', () => {
  for (const [a, b] of [['#000000', '#ffffff'], ['#123456', '#fedcba'], ['#ff0000', '#00ff00']]) {
    assert.equal(contrastRatio(rgb(a), rgb(b)), contrastRatio(rgb(b), rgb(a)));
  }
});

test('afastar as cores só aumenta o contraste — monotonicidade', () => {
  /* Contra o branco, quanto mais escuro o cinza, maior o contraste. */
  const contraBranco = (c) => contrastRatio(rgb(c), rgb('#ffffff'));
  const cinzas = ['#ffffff', '#cccccc', '#999999', '#666666', '#333333', '#000000'];
  for (let i = 1; i < cinzas.length; i += 1) {
    assert.ok(contraBranco(cinzas[i]) > contraBranco(cinzas[i - 1]),
      `${cinzas[i]} deveria contrastar mais que ${cinzas[i - 1]}`);
  }
});

test('os limiares da WCAG caem do lado certo', () => {
  /* AA pede 4,5:1 para texto normal; AAA pede 7:1. Se a conta escorregasse,
   * a tela aprovaria combinação reprovada — que é o pior erro possível numa
   * ferramenta de acessibilidade. */
  assert.ok(contrastRatio(rgb('#767676'), rgb('#ffffff')) >= 4.5, '#767676/branco passa em AA');
  assert.ok(contrastRatio(rgb('#777777'), rgb('#ffffff')) < 4.5, '#777777/branco reprova em AA');
  assert.ok(contrastRatio(rgb('#595959'), rgb('#ffffff')) >= 7, '#595959/branco passa em AAA');
});

/* ================================= OKLCH =================================== */

test('OKLCH confere com o valor de referência do Ottosson', () => {
  /* Vermelho puro sRGB em OKLCH: L 0,6280 · C 0,2577 · H 29,23. */
  const v = rgbToOklch(rgb('#ff0000'));
  perto(v.l, 0.6280, 0.0005, 'L');
  perto(v.c, 0.2577, 0.0005, 'C');
  perto(v.h, 29.23, 0.02, 'H');
});

test('OKLCH: preto e branco ficam nos extremos de L, sem croma', () => {
  const preto = rgbToOklch(rgb('#000000'));
  const branco = rgbToOklch(rgb('#ffffff'));
  perto(preto.l, 0, 1e-6);
  perto(branco.l, 1, 1e-6);
  perto(preto.c, 0, 1e-6, 'preto não tem croma');
  perto(branco.c, 0, 1e-6, 'branco não tem croma');
});

test('cinza tem croma zero em qualquer luminosidade', () => {
  for (const cinza of ['#202020', '#606060', '#a0a0a0', '#e0e0e0']) {
    perto(rgbToOklch(rgb(cinza)).c, 0, 1e-6, `${cinza} deveria ser acromático`);
  }
});

test('OKLCH é monotônico na luminosidade — mais claro tem L maior', () => {
  const cinzas = ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff'];
  for (let i = 1; i < cinzas.length; i += 1) {
    assert.ok(rgbToOklch(rgb(cinzas[i])).l > rgbToOklch(rgb(cinzas[i - 1])).l,
      `${cinzas[i]} deveria ter L maior que ${cinzas[i - 1]}`);
  }
});

test('o matiz do OKLCH fica sempre entre 0 e 360', () => {
  for (const hex of ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff', '#7f3f1f']) {
    const { h } = rgbToOklch(rgb(hex));
    assert.ok(h >= 0 && h < 360, `${hex} deu matiz ${h}`);
  }
});
