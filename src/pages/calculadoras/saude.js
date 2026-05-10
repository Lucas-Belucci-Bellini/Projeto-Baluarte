/**
 * Calculadora de Saúde (Fase 5)
 *
 * - IMC (Índice de Massa Corporal) + classificação
 * - TMB (Mifflin-St Jeor)
 * - Macros (proteína / carbo / gordura) por kcal e proporção
 * - FC máxima e zonas de treino
 * - Hidratação diária
 */

import { h } from '../../utils/helpers.js';

const NUM = (v) => parseFloat(String(v).replace(',', '.'));
const fmt = (n, dec = 1) => {
  if (!isFinite(n)) return '—';
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: dec }).format(n);
};

/* ===== IMC ===== */
function imcPanel() {
  const card = h('div', { className: 'calc-tile' });
  const inputs = {
    peso: h('input', { className: 'input', type: 'number', value: '70', step: '0.1', oninput: render }),
    altura: h('input', { className: 'input', type: 'number', value: '1.75', step: '0.01', oninput: render })
  };
  const out = h('div', { className: 'calc-tile__out' });

  function classify(imc) {
    if (imc < 16) return ['🔴', 'Magreza grave'];
    if (imc < 17) return ['🟠', 'Magreza moderada'];
    if (imc < 18.5) return ['🟡', 'Magreza leve'];
    if (imc < 25) return ['🟢', 'Peso normal'];
    if (imc < 30) return ['🟡', 'Sobrepeso'];
    if (imc < 35) return ['🟠', 'Obesidade grau I'];
    if (imc < 40) return ['🔴', 'Obesidade grau II'];
    return ['⛔', 'Obesidade grau III'];
  }

  function render() {
    const peso = NUM(inputs.peso.value);
    const altura = NUM(inputs.altura.value);
    const imc = peso / (altura * altura);
    const [emoji, label] = classify(imc);
    const idealMin = 18.5 * altura * altura;
    const idealMax = 24.9 * altura * altura;
    out.innerHTML = `
      <div class="calc-tile__result">
        <div><span>IMC:</span> <strong>${fmt(imc, 1)} kg/m²</strong></div>
        <div><span>Classificação:</span> <strong>${emoji} ${label}</strong></div>
        <div><span>Faixa ideal:</span> <strong>${fmt(idealMin)} – ${fmt(idealMax)} kg</strong></div>
      </div>
      <div class="calc-tile__formula">IMC = peso / altura² (OMS)</div>
    `;
  }

  card.append(
    h('h3', { className: 'calc-tile__title' }, '♥ IMC'),
    h('div', { className: 'calc-tile__grid' },
      h('label', null, 'Peso (kg)', inputs.peso),
      h('label', null, 'Altura (m)', inputs.altura)
    ),
    out
  );
  setTimeout(render, 0);
  return card;
}

/* ===== TMB (Mifflin-St Jeor) ===== */
function tmbPanel() {
  const card = h('div', { className: 'calc-tile' });
  const inputs = {
    peso: h('input', { className: 'input', type: 'number', value: '70', step: '0.1', oninput: render }),
    altura: h('input', { className: 'input', type: 'number', value: '175', step: '0.1', oninput: render }),
    idade: h('input', { className: 'input', type: 'number', value: '30', oninput: render }),
    sexo: h('select', { className: 'input', onchange: render },
      h('option', { value: 'M', selected: true }, 'Masculino'),
      h('option', { value: 'F' }, 'Feminino')
    ),
    atividade: h('select', { className: 'input', onchange: render },
      h('option', { value: '1.2' }, 'Sedentário'),
      h('option', { value: '1.375', selected: true }, 'Leve (1-3x/sem)'),
      h('option', { value: '1.55' }, 'Moderado (3-5x/sem)'),
      h('option', { value: '1.725' }, 'Intenso (6-7x/sem)'),
      h('option', { value: '1.9' }, 'Atleta')
    )
  };
  const out = h('div', { className: 'calc-tile__out' });

  function render() {
    const peso = NUM(inputs.peso.value);
    const altura = NUM(inputs.altura.value);
    const idade = NUM(inputs.idade.value);
    const sexo = inputs.sexo.value;
    const atv = NUM(inputs.atividade.value);

    const tmb = sexo === 'M'
      ? 10 * peso + 6.25 * altura - 5 * idade + 5
      : 10 * peso + 6.25 * altura - 5 * idade - 161;
    const get = tmb * atv;
    const cut = get - 500;
    const bulk = get + 300;

    out.innerHTML = `
      <div class="calc-tile__result">
        <div><span>TMB (basal):</span> <strong>${fmt(tmb, 0)} kcal</strong></div>
        <div><span>GET (gasto total):</span> <strong>${fmt(get, 0)} kcal</strong></div>
        <div><span>Para emagrecer (-500):</span> <strong>${fmt(cut, 0)} kcal</strong></div>
        <div><span>Para ganhar (+300):</span> <strong>${fmt(bulk, 0)} kcal</strong></div>
      </div>
      <div class="calc-tile__formula">Mifflin-St Jeor (1990) — gold standard</div>
    `;
  }

  card.append(
    h('h3', { className: 'calc-tile__title' }, '◉ TMB & Calorias'),
    h('div', { className: 'calc-tile__grid' },
      h('label', null, 'Peso (kg)', inputs.peso),
      h('label', null, 'Altura (cm)', inputs.altura),
      h('label', null, 'Idade', inputs.idade),
      h('label', null, 'Sexo', inputs.sexo),
      h('label', null, 'Nível de atividade', inputs.atividade)
    ),
    out
  );
  setTimeout(render, 0);
  return card;
}

/* ===== Macros ===== */
function macrosPanel() {
  const card = h('div', { className: 'calc-tile' });
  const inputs = {
    kcal: h('input', { className: 'input', type: 'number', value: '2000', step: '10', oninput: render }),
    profile: h('select', { className: 'input', onchange: render },
      h('option', { value: '30/40/30' }, 'Equilíbrio (P30/C40/G30)'),
      h('option', { value: '40/40/20', selected: true }, 'Corte (P40/C40/G20)'),
      h('option', { value: '25/50/25' }, 'Resistência (P25/C50/G25)'),
      h('option', { value: '20/60/20' }, 'Endurance (P20/C60/G20)'),
      h('option', { value: '35/35/30' }, 'Mediterrâneo'),
      h('option', { value: '30/10/60' }, 'Cetogênica (P30/C10/G60)')
    )
  };
  const out = h('div', { className: 'calc-tile__out' });

  function render() {
    const kcal = NUM(inputs.kcal.value);
    const [p, c, g] = inputs.profile.value.split('/').map(Number);
    const pK = kcal * p / 100;
    const cK = kcal * c / 100;
    const gK = kcal * g / 100;
    const pG = pK / 4;
    const cG = cK / 4;
    const gG = gK / 9;
    out.innerHTML = `
      <div class="calc-tile__result">
        <div><span>Proteína (${p}%):</span> <strong>${fmt(pG, 0)} g · ${fmt(pK, 0)} kcal</strong></div>
        <div><span>Carboidrato (${c}%):</span> <strong>${fmt(cG, 0)} g · ${fmt(cK, 0)} kcal</strong></div>
        <div><span>Gordura (${g}%):</span> <strong>${fmt(gG, 0)} g · ${fmt(gK, 0)} kcal</strong></div>
      </div>
      <div class="calc-tile__formula">P/C: 4 kcal/g · G: 9 kcal/g</div>
    `;
  }

  card.append(
    h('h3', { className: 'calc-tile__title' }, '◐ Macros'),
    h('div', { className: 'calc-tile__grid' },
      h('label', null, 'Calorias diárias (kcal)', inputs.kcal),
      h('label', null, 'Distribuição', inputs.profile)
    ),
    out
  );
  setTimeout(render, 0);
  return card;
}

/* ===== FC Máxima e Zonas ===== */
function fcPanel() {
  const card = h('div', { className: 'calc-tile' });
  const inputs = {
    idade: h('input', { className: 'input', type: 'number', value: '30', oninput: render }),
    repouso: h('input', { className: 'input', type: 'number', value: '60', oninput: render })
  };
  const out = h('div', { className: 'calc-tile__out' });

  function render() {
    const idade = NUM(inputs.idade.value);
    const repouso = NUM(inputs.repouso.value);
    const max = 220 - idade;
    /* Karvonen */
    const reserva = max - repouso;
    function karv(p) { return Math.round(repouso + reserva * p); }
    out.innerHTML = `
      <div class="calc-tile__result">
        <div><span>FC máxima:</span> <strong>${max} bpm</strong> <span class="u-text-muted">(220 - idade)</span></div>
        <div><span>FC reserva:</span> <strong>${reserva} bpm</strong></div>
      </div>
      <div class="zones">
        <div class="zone z1"><span>Z1 50-60%</span> <strong>${karv(0.5)} – ${karv(0.6)} bpm</strong> Recuperação</div>
        <div class="zone z2"><span>Z2 60-70%</span> <strong>${karv(0.6)} – ${karv(0.7)} bpm</strong> Aeróbico leve</div>
        <div class="zone z3"><span>Z3 70-80%</span> <strong>${karv(0.7)} – ${karv(0.8)} bpm</strong> Aeróbico</div>
        <div class="zone z4"><span>Z4 80-90%</span> <strong>${karv(0.8)} – ${karv(0.9)} bpm</strong> Limiar</div>
        <div class="zone z5"><span>Z5 90-100%</span> <strong>${karv(0.9)} – ${max} bpm</strong> VO2 máx</div>
      </div>
      <div class="calc-tile__formula">Karvonen: FC_alvo = FC_repouso + %·(FC_max - FC_repouso)</div>
    `;
  }

  card.append(
    h('h3', { className: 'calc-tile__title' }, '♥ FC Máxima & Zonas'),
    h('div', { className: 'calc-tile__grid' },
      h('label', null, 'Idade (anos)', inputs.idade),
      h('label', null, 'FC repouso (bpm)', inputs.repouso)
    ),
    out
  );
  setTimeout(render, 0);
  return card;
}

/* ===== Hidratação ===== */
function hidratacaoPanel() {
  const card = h('div', { className: 'calc-tile' });
  const inputs = {
    peso: h('input', { className: 'input', type: 'number', value: '70', oninput: render }),
    atv: h('select', { className: 'input', onchange: render },
      h('option', { value: '35', selected: true }, 'Sedentário (35 ml/kg)'),
      h('option', { value: '40' }, 'Moderado (40 ml/kg)'),
      h('option', { value: '45' }, 'Atleta (45 ml/kg)')
    )
  };
  const out = h('div', { className: 'calc-tile__out' });

  function render() {
    const peso = NUM(inputs.peso.value);
    const ml = NUM(inputs.atv.value);
    const total = peso * ml;
    const copos = total / 250;
    out.innerHTML = `
      <div class="calc-tile__result">
        <div><span>Total recomendado:</span> <strong>${fmt(total / 1000, 2)} L/dia</strong></div>
        <div><span>Em copos (250 ml):</span> <strong>${fmt(copos, 0)} copos</strong></div>
        <div><span>Por hora (8h ativas):</span> <strong>${fmt(total / 8, 0)} ml/h</strong></div>
      </div>
      <div class="calc-tile__formula">Recomendação geral: 35 ml/kg de peso (varia com atividade e clima)</div>
    `;
  }

  card.append(
    h('h3', { className: 'calc-tile__title' }, '◊ Hidratação'),
    h('div', { className: 'calc-tile__grid' },
      h('label', null, 'Peso (kg)', inputs.peso),
      h('label', null, 'Nível de atividade', inputs.atv)
    ),
    out
  );
  setTimeout(render, 0);
  return card;
}

export function saudePanel() {
  return h('div', { className: 'calc-grid' },
    imcPanel(),
    tmbPanel(),
    macrosPanel(),
    fcPanel(),
    hidratacaoPanel()
  );
}
