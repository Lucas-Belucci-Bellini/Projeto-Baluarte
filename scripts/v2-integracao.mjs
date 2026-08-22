/**
 * A fundação da V2 ainda dirige o router REAL da V1?
 *
 * Guarda dois defeitos que já aconteceram e que **nenhum teste com mock pega**:
 *
 * 1. `view` devolvendo o namespace do módulo em vez do elemento da página. As
 *    rotas registram, o `count()` bate, e a tela fica vazia — falha silenciosa
 *    da pior espécie, porque tudo indica sucesso.
 * 2. Esquecer que o router **anuncia** (`route:change`) em vez de montar. Mesmo
 *    sintoma: 17 rotas registradas, nada na tela.
 *
 * Roda contra o banco de prova (`v2/harness/`), que existe só para isto.
 */

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

const PORTA = Number(process.env.PORTA_V2 ?? 4193);
const BASE = `http://127.0.0.1:${PORTA}`;

/* O vite é dependência DESTE repo, então chamamos o bin dele com o próprio
 * Node, em vez de passar por `npx`.
 *
 * Não é preferência de estilo: no Windows o `npx` é `npx.cmd`, e o Node 24
 * recusa spawnar `.cmd` (correção do CVE-2024-27980). Isto morria em
 * `spawn npx ENOENT` antes de abrir o navegador — ou seja, o portão de
 * integração da V2 nunca rodou nesta plataforma. Chamar o bin direto elimina o
 * wrapper de vez, é mais rápido (sem a resolução do npx) e usa a versão fixada
 * no lockfile em vez do que o npx resolver na hora.
 */
const require = createRequire(import.meta.url);
/* O `bin/vite.js` não está no mapa `exports` do pacote, então resolvê-lo direto
 * dá ERR_PACKAGE_PATH_NOT_EXPORTED. Ancoramos no `package.json` (que o vite
 * exporta) e caminhamos a partir da raiz — assim o hoisting do npm continua
 * sendo respeitado, em vez de presumir `./node_modules/vite`. */
const viteBin = (() => {
  try {
    return path.join(path.dirname(require.resolve('vite/package.json')), 'bin', 'vite.js');
  } catch {
    return path.join(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js');
  }
})();

/* `--strictPort` não é detalhe: sem ele o Vite troca de porta EM SILÊNCIO quando
 * a escolhida está ocupada. O `esperarServidor` abaixo então encontra outra
 * coisa viva no 4193 — um servidor zumbi de uma execução anterior, por exemplo —
 * e o portão passa a medir o que não é o alvo. Falhar alto ("vite não subiu") é
 * o comportamento certo: porta ocupada é problema do ambiente, não resultado. */
const servidor = spawn(process.execPath, [viteBin, '--port', String(PORTA), '--strictPort', '--host', '127.0.0.1'],
  { cwd: process.cwd(), stdio: 'ignore' });

const encerrarServidor = async () => {
  if (servidor.exitCode !== null || servidor.signalCode !== null) return;
  const saiu = new Promise((resolve) => servidor.once('exit', resolve));
  if (!servidor.kill('SIGTERM')) return;
  await Promise.race([saiu, new Promise((resolve) => setTimeout(resolve, 1000))]);
  if (servidor.exitCode === null && servidor.signalCode === null) servidor.kill('SIGKILL');
};

const esperarServidor = async () => {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(BASE, { signal: AbortSignal.timeout(1500) })).ok) return true; } catch { /* subindo */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
};

const passos = [];
const conferir = (descricao, condicao, detalhe = '') => {
  passos.push({ descricao, ok: !!condicao });
  console.log(`  ${condicao ? '✓' : '✗'} ${descricao}${!condicao && detalhe ? ` — ${detalhe}` : ''}`);
};

/* Navega e espera a CONDIÇÃO, não o relógio.
 *
 * As três navegações abaixo dormiam um tempo fixo (900ms, 900ms, 1800ms) e só
 * então liam `#saida`. Isso mede a máquina, não o sistema: a view do briefing é
 * a única importada sob demanda com orçamento de 900ms, e numa máquina onde a
 * primeira transformação do Vite passa disso o portão reprova um módulo que
 * está correto — falso vermelho, indistinguível de defeito de verdade.
 *
 * O predicado é o MESMO que o `conferir` avalia depois; em caso de estouro
 * devolvemos o texto real da tela, para a mensagem de falha continuar sendo o
 * conteúdo encontrado e não um "timeout" genérico. Espera por condição só
 * remove falso vermelho: se a tela nunca ficar certa, reprova igual.
 */
const navegarAte = async (pagina, hash, pronto, arg = null, limite = 15000) => {
  await pagina.evaluate((h) => { window.location.hash = h; }, hash);
  await pagina.waitForFunction(pronto, arg, { timeout: limite, polling: 100 }).catch(() => {});
  return pagina.locator('#saida').innerText().catch(() => '');
};

let navegador;
try {
  if (!await esperarServidor()) {
    console.error('vite não subiu');
    process.exit(1);
  }

  /* `CHROME_PATH` cobre o ambiente que já tem o Chromium instalado fora do
   * cache do Playwright (contêiner de desenvolvimento); no CI o
   * `playwright install` põe no lugar padrão e a variável não existe. */
  navegador = await chromium.launch({
    args: ['--no-sandbox'],
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {})
  });
  const pagina = await (await navegador.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  const errosJs = [];
  pagina.on('pageerror', (e) => errosJs.push(e.message));

  await pagina.goto(`${BASE}/v2/harness/index.html#/cripto`, { waitUntil: 'load', timeout: 40000 });
  await pagina.waitForFunction(() => window.__v2, null, { timeout: 25000 }).catch(() => {});
  await pagina.waitForTimeout(2500);

  const v2 = await pagina.evaluate(() => window.__v2);

  conferir('o boot da V2 roda no navegador', v2 && !v2.erro, v2?.erro);
  /* Contagem EXATA, não `>= 7`: um módulo que some do registro é defeito tão
   * real quanto um que falha, e `>=` deixaria o sumiço passar calado. Foi para
   * 7 com o `wiki-zomboid`, o piloto local de schema e Evidence. */
  conferir('os 7 módulos sobem sem falha',
    v2?.resultado?.vivos?.length === 7 && v2?.resultado?.falhas?.length === 0,
    JSON.stringify(v2?.resultado?.falhas ?? []));
  /* A autorização foi de fato PEDIDA, e antes do `init`. Esta é a asserção que
   * o estado anterior não tinha: o ciclo ia direto ao `init`, os 4 módulos
   * subiam, e tudo acima ficava verde com o Runtime nunca consultado. Uma peça
   * correta e desligada dá exatamente o mesmo retrato que uma peça ligada — até
   * alguém perguntar por ela. */
  const runtimeAbertos = await pagina.evaluate(() => window.__v2?.runtimeAbertos?.());
  /* Compara com `vivos`, e não com um literal: as duas listas terem o mesmo
   * tamanho E todo vivo estar entre os abertos é dizer que os CONJUNTOS são
   * iguais — que é a propriedade real. O literal `4` dizia a mesma coisa por
   * acidente e envelhecia a cada módulo novo, transformando "acrescentei um
   * módulo" em "o portão ficou vermelho". */
  const vivos = v2?.resultado?.vivos ?? [];
  conferir('todo módulo no ar teve sessão de Runtime aberta',
    Array.isArray(runtimeAbertos)
      && runtimeAbertos.length === vivos.length
      && vivos.every((id) => runtimeAbertos.includes(id)),
    JSON.stringify(runtimeAbertos ?? null));

  const registryModulos = await pagina.evaluate(() => window.__v2?.plataforma?.().registry?.modulos);
  conferir('Platform reflete a saúde real do Registry após o boot',
    Array.isArray(registryModulos)
      && registryModulos.length === vivos.length
      && registryModulos.every((modulo) => modulo.mode === 'healthy' && modulo.status === 'healthy'),
    JSON.stringify(registryModulos ?? null));

  const registryIncidentes = await pagina.evaluate(() => window.__v2?.plataforma?.().registry?.incidentes);
  conferir('Platform expõe incidentes de health sem stack trace',
    Array.isArray(registryIncidentes)
      && registryIncidentes.length === vivos.length
      && registryIncidentes.every((incidente) => incidente.type === 'healthy' && !('stack' in incidente)),
    JSON.stringify(registryIncidentes ?? null));

  const platformRuntimeObservation = await pagina.evaluate(() => window.__v2?.platformRuntimeObservation?.());
  conferir('diagnóstico V2 projeta estado observado sem autoridade client-side',
    platformRuntimeObservation?.source === 'v2-platform-diagnostic'
      && platformRuntimeObservation?.connection === 'connected'
      && platformRuntimeObservation?.health === 'healthy'
      && platformRuntimeObservation?.severity === 'none'
      && platformRuntimeObservation?.fallback === 'available'
      && platformRuntimeObservation?.authority === 'not-authorized'
      && platformRuntimeObservation?.moduleCount === vivos.length
      && platformRuntimeObservation?.incidentCount === 0,
    JSON.stringify(platformRuntimeObservation ?? null));

  const platformRuntimeObservationEnvelope = await pagina.evaluate(() => window.__v2?.platformRuntimeObservationEnvelope?.());
  conferir('envelope V2 transporta somente observação redigida',
    platformRuntimeObservationEnvelope?.contractVersion === 'platform-observation/v1'
      && platformRuntimeObservationEnvelope?.origin === 'v2-harness'
      && platformRuntimeObservationEnvelope?.source === 'v2-platform-diagnostic'
      && platformRuntimeObservationEnvelope?.authority === 'not-authorized'
      && platformRuntimeObservationEnvelope?.redaction?.applied === true
      && Array.isArray(platformRuntimeObservationEnvelope?.redaction?.fields)
      && platformRuntimeObservationEnvelope.redaction.fields.includes('registry.incidentes[].error')
      && platformRuntimeObservationEnvelope?.summary?.moduleCount === vivos.length
      && platformRuntimeObservationEnvelope?.summary?.incidentCount === 0
      && /^[A-Za-z0-9._~-]{16,128}$/.test(platformRuntimeObservationEnvelope?.nonce ?? '')
      && !('boot' in platformRuntimeObservationEnvelope)
      && !('registry' in platformRuntimeObservationEnvelope),
    JSON.stringify(platformRuntimeObservationEnvelope ?? null));

  conferir('envelope V2 possui integridade verificável e origem declarada',
    platformRuntimeObservationEnvelope?.integrity?.algorithm === 'SHA-256'
      && platformRuntimeObservationEnvelope?.integrity?.status === 'sealed'
      && /^[a-f0-9]{64}$/.test(platformRuntimeObservationEnvelope?.integrity?.digest ?? '')
      && platformRuntimeObservationEnvelope?.origin === 'v2-harness'
      && platformRuntimeObservationEnvelope?.authority === 'not-authorized',
    JSON.stringify(platformRuntimeObservationEnvelope?.integrity ?? null));

  conferir('envelope V2 possui TTL verificável e não autoriza ações',
    Number.isInteger(platformRuntimeObservationEnvelope?.capturedAt)
      && Number.isInteger(platformRuntimeObservationEnvelope?.expiresAt)
      && platformRuntimeObservationEnvelope.expiresAt > platformRuntimeObservationEnvelope.capturedAt
      && platformRuntimeObservationEnvelope.expiresAt - platformRuntimeObservationEnvelope.capturedAt === platformRuntimeObservationEnvelope.ttlMs
      && platformRuntimeObservationEnvelope.ttlMs > 0
      && platformRuntimeObservationEnvelope.ttlMs <= 60_000
      && !('execute' in platformRuntimeObservationEnvelope)
      && !('grant' in platformRuntimeObservationEnvelope),
    JSON.stringify(platformRuntimeObservationEnvelope ?? null));

  const missingClaimsObservation = await pagina.evaluate(() => window.__v2?.serverClaimsObservation?.(null));
  conferir('claims ausentes permanecem negadas por padrão',
    missingClaimsObservation?.identity?.authenticated === false
      && missingClaimsObservation?.identity?.subjectPresent === false
      && missingClaimsObservation?.scopes?.accepted?.length === 0
      && missingClaimsObservation?.decision === 'not-authorized'
      && missingClaimsObservation?.authority === 'not-authorized',
    JSON.stringify(missingClaimsObservation ?? null));

  const validClaimsObservation = await pagina.evaluate(() => window.__v2?.serverClaimsObservation?.({
    issuer: 'baluarte-auth',
    subject: 'operator-test',
    audience: 'baluarte-platform',
    scopes: ['platform:observe', 'module:read', 'module:execute'],
    issuedAt: Date.now() - 1_000,
    expiresAt: Date.now() + 10_000,
    requestId: 'claims-gate-test',
    source: 'server-validated',
    authenticated: true,
  }));
  conferir('claims válidas são observadas com escopo limitado e sem autorização operacional',
    validClaimsObservation?.identity?.authenticated === true
      && validClaimsObservation?.identity?.trustedSource === true
      && validClaimsObservation?.identity?.audienceMatched === true
      && validClaimsObservation?.validity?.fresh === true
      && validClaimsObservation?.scopes?.accepted?.includes('platform:observe')
      && validClaimsObservation?.scopes?.accepted?.includes('module:read')
      && validClaimsObservation?.scopes?.rejected?.includes('module:execute')
      && validClaimsObservation?.decision === 'not-authorized'
      && validClaimsObservation?.authority === 'not-authorized',
    JSON.stringify(validClaimsObservation ?? null));

  const invalidClaimsObservation = await pagina.evaluate(() => window.__v2?.serverClaimsObservation?.({
    issuer: 'attacker',
    subject: 'operator-test',
    audience: 'baluarte-platform',
    scopes: ['platform:observe'],
    issuedAt: Date.now() + 10_000,
    expiresAt: Date.now() + 20_000,
    source: 'client-input',
    authenticated: true,
  }));
  conferir('claims com origem ou frescor inválidos não recebem escopo',
    invalidClaimsObservation?.identity?.trustedSource === false
      && invalidClaimsObservation?.validity?.fresh === false
      && invalidClaimsObservation?.scopes?.accepted?.length === 0
      && invalidClaimsObservation?.decision === 'not-authorized',
    JSON.stringify(invalidClaimsObservation ?? null));

  /* Estas duas seguem exatas de propósito: rota ou item de navegação que SOME é
   * defeito tão real quanto um que falha, e só o número fixo pega o sumiço.
   * Foram de 18→19 e 4→5 com a rota `/visor3d`. */
  conferir('as 20 rotas chegam ao router REAL da V1',
    v2?.resultado?.rotas === 20 && v2?.totalRotas === 20,
    `boot=${v2?.resultado?.rotas} router=${v2?.totalRotas}`);
  conferir('a navegação vem do manifesto',
    v2?.resultado?.nav?.length === 6, String(v2?.resultado?.nav?.length));
  const navigationObservation = await pagina.evaluate(() => window.__v2?.navigationObservation?.());
  const commandCenter = await pagina.evaluate(() => window.__v2?.commandCenterPilot?.());
  conferir('Command Center deriva categorias e busca sem trocar a sidebar V1',
    commandCenter?.projection?.queryPlaceholder === 'Buscar ou executar comando…'
      && commandCenter?.projection?.commands?.length === 6
      && commandCenter?.projection?.categories?.length > 0
      && commandCenter?.search?.length === 1
      && commandCenter?.search?.[0]?.path === '/editor',
    JSON.stringify(commandCenter ?? null));

  const visualPilot = await pagina.evaluate(() => window.__v2?.commandCenterVisualPilot?.());
  const navBeforePilot = await pagina.locator('#nav').innerText();
  conferir('protótipo visual Command Center fica restrito ao harness',
    visualPilot?.visibility === 'harness-only'
      && visualPilot?.publicSidebarUntouched === true
      && Number(visualPilot?.commandCount) === 6
      && Number(visualPilot?.categoryCount) > 0,
    JSON.stringify(visualPilot ?? null));

  await pagina.fill('#command-center-search', 'editor');
  const searchPilot = await pagina.evaluate(() => ({
    commandCount: document.querySelectorAll('#command-center-categories .pilot-command').length,
    categoryCount: document.querySelectorAll('#command-center-categories .pilot-category').length,
    status: document.getElementById('command-center-status')?.textContent ?? '',
  }));
  const navAfterSearch = await pagina.locator('#nav').innerText();
  conferir('busca visual filtra o Command Center sem alterar a sidebar V1',
    searchPilot.commandCount === 1
      && searchPilot.categoryCount === 1
      && /1 comandos/.test(searchPilot.status)
      && navAfterSearch === navBeforePilot,
    JSON.stringify({ searchPilot, navBeforePilot, navAfterSearch }));

  await pagina.getByRole('button', { name: 'Recolher' }).click();
  const collapsedPilot = await pagina.evaluate(() => ({
    collapsed: document.getElementById('command-center-pilot')?.dataset.collapsed,
    expanded: document.getElementById('command-center-toggle')?.getAttribute('aria-expanded'),
  }));
  conferir('protótipo visual oferece recolhimento acessível',
    collapsedPilot.collapsed === 'true' && collapsedPilot.expanded === 'false',
    JSON.stringify(collapsedPilot));
  await pagina.getByRole('button', { name: 'Expandir' }).click();
  await pagina.fill('#command-center-search', '');
  const a11yPilot = await pagina.evaluate(() => window.__v2?.commandCenterAccessibilityPilot?.());
  const commandCenterA11y = await pagina.evaluate(() => ({
    searchRole: document.querySelector('[role="search"]')?.getAttribute('role'),
    searchControls: document.getElementById('command-center-search')?.getAttribute('aria-controls'),
    helpText: document.getElementById('command-center-help')?.textContent ?? '',
  }));
  conferir('protótipo visual expõe atributos de acessibilidade corretos',
    a11yPilot?.searchLabel?.includes('Buscar')
      && a11yPilot?.searchShortcut === '/'
      && a11yPilot?.toggleExpanded === 'true'
      && commandCenterA11y.searchRole === 'search'
      && commandCenterA11y.searchControls === 'command-center-categories'
      && commandCenterA11y.helpText.includes('Esc'),
    JSON.stringify({ a11yPilot, commandCenterA11y }));
  await pagina.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await pagina.keyboard.press('/');
  const searchFocused = await pagina.evaluate(() => document.activeElement?.id === 'command-center-search');
  conferir('atalho / foca o campo de busca do Command Center',
    searchFocused === true, String(searchFocused));
  await pagina.fill('#command-center-search', 'editor');
  await pagina.keyboard.press('Escape');
  const searchCleared = await pagina.evaluate(() => document.getElementById('command-center-search')?.value === '');
  conferir('Escape limpa a busca do Command Center',
    searchCleared === true, String(searchCleared));
  await pagina.keyboard.press('ArrowDown');
  const firstCommandFocused = await pagina.evaluate(() => document.activeElement?.classList.contains('pilot-command'));
  conferir('ArrowDown move o foco para o primeiro comando',
    firstCommandFocused === true, String(firstCommandFocused));

  conferir('UI-03 observa o Registry sem trocar a sidebar V1',
    navigationObservation?.source === 'registry-observer'
      && navigationObservation?.projection?.entries?.length === 6
      && navigationObservation?.parity?.sharedPaths?.includes('/editor')
      && navigationObservation?.parity?.sharedPaths?.includes('/cripto')
      && navigationObservation?.parity?.sharedPaths?.includes('/militar')
      && navigationObservation?.parity?.legacyOnly?.length > 0
      && navigationObservation?.parity?.registryOnly?.length > 0,
    JSON.stringify(navigationObservation?.parity ?? null));
  const moduleAlignment = await pagina.evaluate(() => window.__v2?.moduleAlignmentPilot?.());
  const promotionCandidates = Array.isArray(moduleAlignment)
    ? moduleAlignment.filter((decision) => decision.allowPublicPromotion)
    : [];
  conferir('piloto por módulo exige health e deep link antes da promoção',
    Array.isArray(moduleAlignment)
      && moduleAlignment.length === 6
      && moduleAlignment.every((decision) => decision.evidence.health.source === 'runtime-registry')
      && moduleAlignment.every((decision) => decision.evidence.deepLink === 'verified')
      && moduleAlignment.every((decision) => decision.normalUserAction === 'preserve-current-surface')
      && promotionCandidates.length === 1
      && promotionCandidates[0]?.path === '/editor'
      && promotionCandidates[0]?.outcome === 'promotion-candidate',
    JSON.stringify(moduleAlignment ?? null));
  const moduleOperationalDefault = await pagina.evaluate(() => (
    window.__v2?.moduleOperationalPolicyPilot?.()
  ));
  conferir('política operacional mantém módulo saudável sem claims sem revisão elevada',
    Array.isArray(moduleOperationalDefault)
      && moduleOperationalDefault.length === 6
      && moduleOperationalDefault.every((decision) => decision.button === 'enabled')
      && moduleOperationalDefault.every((decision) => decision.elevatedReview === 'unavailable')
      && moduleOperationalDefault.every((decision) => decision.fallback === 'v1-preserved')
      && moduleOperationalDefault.every((decision) => decision.authority === 'not-authorized')
      && moduleOperationalDefault.every((decision) => decision.publicPromotionAllowed === false),
    JSON.stringify(moduleOperationalDefault ?? null));
  const moduleOperationalClaims = await pagina.evaluate(() => (
    window.__v2?.moduleOperationalPolicyPilot?.({
      issuer: 'baluarte-auth',
      subject: 'operator-test',
      audience: 'baluarte-platform',
      scopes: ['platform:observe', 'module:read', 'module:execute'],
      issuedAt: Date.now() - 1_000,
      expiresAt: Date.now() + 10_000,
      requestId: 'module-operational-test',
      source: 'server-validated',
      authenticated: true,
    })
  ));
  conferir('scope module:read produz somente revisão elevada observável',
    Array.isArray(moduleOperationalClaims)
      && moduleOperationalClaims.length === 6
      && moduleOperationalClaims.every((decision) => decision.elevatedReview === 'review-only')
      && moduleOperationalClaims.every((decision) => decision.button === 'enabled')
      && moduleOperationalClaims.every((decision) => decision.authority === 'not-authorized')
      && moduleOperationalClaims.every((decision) => decision.publicPromotionAllowed === false),
    JSON.stringify(moduleOperationalClaims ?? null));

  const moduleObservationDefault = await pagina.evaluate(() => ({
    decisions: window.__v2?.moduleObservationVisualPilot?.(),
    snapshot: window.__v2?.moduleObservationVisualPilotSnapshot?.(),
  }));
  conferir('observação ausente preserva V1 e degrada o retrato visual',
    Array.isArray(moduleObservationDefault?.decisions)
      && moduleObservationDefault.decisions.length === 6
      && moduleObservationDefault.decisions.every((decision) => decision.availability === 'degraded')
      && moduleObservationDefault.decisions.every((decision) => decision.fallback === 'v1-preserved')
      && moduleObservationDefault.decisions.every((decision) => decision.publicPromotionAllowed === false)
      && moduleObservationDefault.snapshot?.publicSidebarUntouched === true
      && moduleObservationDefault.snapshot?.degradedCount === 6,
    JSON.stringify(moduleObservationDefault ?? null));

  const healthyServerObservation = {
    contractVersion: 'server-observation/v1',
    source: 'server-observed',
    health: {
      contractVersion: 'server-health/v1', source: 'runtime-observed', connection: 'connected',
      health: 'healthy', severity: 'none', fallback: 'available', authority: 'not-authorized',
      ok: true, service: 'jarvis-backend', model: 'gemini-test', hasKey: true, detail: 'health observado',
    },
    claims: {
      contractVersion: 'server-claims/v1', source: 'server-authority',
      identity: { issuerPresent: true, subjectPresent: true, audienceMatched: true, authenticated: true, trustedSource: true },
      scopes: { requested: ['platform:observe'], accepted: ['platform:observe'], rejected: [] },
      validity: { issuedAt: 10_000, expiresAt: 20_000, ttlMs: 10_000, fresh: true },
      requestIdPresent: true, decision: 'not-authorized', authority: 'not-authorized',
    },
    evidence: {
      healthObserved: true, claimsObserved: true, claimsFresh: true, severity: 'none',
      fallback: 'available', reasonCodes: ['observation-ready'],
    },
    transport: { originAllowed: true, rateLimited: false }, authority: 'not-authorized',
  };
  const moduleObservationReady = await pagina.evaluate((observation) => (
    window.__v2?.moduleObservationVisualPilot?.({ editor: observation })
  ), healthyServerObservation);
  const editorObservation = Array.isArray(moduleObservationReady)
    ? moduleObservationReady.find((decision) => decision.path === '/editor')
    : null;
  conferir('módulo saudável é observado sem autorizar promoção pública',
    editorObservation?.availability === 'enabled'
      && editorObservation?.outcome === 'observe-only'
      && editorObservation?.fallback === 'v1-preserved'
      && editorObservation?.authority === 'not-authorized'
      && editorObservation?.publicPromotionAllowed === false
      && moduleObservationReady.filter((decision) => decision.availability === 'degraded').length === 5,
    JSON.stringify({ editorObservation, moduleObservationReady }));

  const controlledRolloutBlocked = await pagina.evaluate((observation) => (
    window.__v2?.controlledRolloutEvidencePilot?.({ observation })
  ), healthyServerObservation);
  conferir('observação pronta sem autoridade server-claims permanece bloqueada',
    controlledRolloutBlocked?.observationReady === true
      && controlledRolloutBlocked?.status === 'blocked'
      && controlledRolloutBlocked?.eligibleForControlledRollout === false
      && controlledRolloutBlocked?.publicPromotionAllowed === false
      && controlledRolloutBlocked?.normalUserAction === 'preserve-current-surface',
    JSON.stringify(controlledRolloutBlocked ?? null));

  const controlledRolloutEligible = await pagina.evaluate(({ observation, authority, rollback }) => (
    window.__v2?.controlledRolloutEvidencePilot?.({ observation, authority, rollback })
  ), {
    observation: healthyServerObservation,
    authority: {
      source: 'server-claims', permitted: true, actorRole: 'developer',
      requestId: 'req-editor-rollout-1', auditId: 'audit-editor-rollout-1',
    },
    rollback: {
      reversible: true, fallbackPath: '/editor', rollbackReference: 'commit:editor-pilot-1',
    },
  });
  conferir('evidências completas permitem somente rollout controlado',
    controlledRolloutEligible?.observationReady === true
      && controlledRolloutEligible?.status === 'eligible'
      && controlledRolloutEligible?.eligibleForControlledRollout === true
      && controlledRolloutEligible?.publicPromotionAllowed === false
      && controlledRolloutEligible?.normalUserAction === 'preserve-current-surface',
    JSON.stringify(controlledRolloutEligible ?? null));

  const promotionGate = await pagina.evaluate(() => window.__v2?.promotionGatePilot?.());
  conferir('gate de promoção bloqueia editor sem claims server-side',
    promotionGate?.status === 'blocked'
      && promotionGate?.eligibleForControlledRollout === false
      && promotionGate?.publicPromotionAllowed === false
      && promotionGate?.reasons?.some((reason) => /claims server-side/.test(reason)),
    JSON.stringify(promotionGate ?? null));

  /* O elo que faz a regra de `ambiente` existir de verdade. O manifesto declara,
   * o `manifest.js` valida, o ciclo aplica — e nada disso vale se ninguém
   * INFORMAR onde estamos. Aqui, num navegador sem `window.baluarte`, tem de ser
   * `web`; no app seria `app`. Sem esta asserção, alguém remove a dedução do
   * entrypoint e a regra volta a ser decorativa sem nenhum vermelho. */
  conferir('o entrypoint informa o ambiente ao ciclo',
    v2?.ambiente === 'web', String(v2?.ambiente));
  /* E nada foi ignorado: os 6 módulos declaram `ambos`. Se um passar a declarar
   * `app`, esta linha acusa a mudança em vez de deixá-la silenciosa. */
  conferir('nenhum módulo foi ignorado por ambiente',
    Array.isArray(v2?.resultado?.ignorados) && v2.resultado.ignorados.length === 0,
    JSON.stringify(v2?.resultado?.ignorados ?? null));

  /* O nome longo prova a fonte: a sidebar da V1 diz "Lab de Cripto"; o manifesto
   * diz "Lab de Criptografia". Se aparecer o curto, alguém voltou a ler da V1. */
  const textoNav = await pagina.locator('#nav').innerText().catch(() => '');
  conferir('o nome vem do manifesto, não da sidebar da V1',
    /Lab de Criptografia/.test(textoNav), textoNav.slice(0, 80));

  const briefingNaTela = await navegarAte(pagina, '#/briefing', () => {
    const t = document.getElementById('saida')?.innerText ?? '';
    return /Briefing de Notícias/.test(t) && /módulo experimental V2/i.test(t) && /Evidence local conectada/i.test(t);
  });
  conferir('a superfície de briefing V2 renderiza',
    /Briefing de Notícias/.test(briefingNaTela) && /módulo experimental V2/i.test(briefingNaTela), briefingNaTela.slice(0, 90));
  conferir('a superfície de briefing observa Evidence',
    /Evidence local conectada/i.test(briefingNaTela), briefingNaTela.slice(0, 140));

  const wikiSummary = await pagina.evaluate(() => window.__v2?.api?.('wiki-zomboid', 'summary'));
  const wikiReviewQueue = await pagina.evaluate(() => window.__v2?.api?.('wiki-zomboid', 'reviewQueue', 25));
  conferir('a API Wiki Zomboid é resolvida pelo Registry',
    wikiSummary?.total === 159
      && wikiSummary?.sourceMode === 'local-curated'
      && wikiSummary?.evidenceAvailable === true
      && wikiSummary?.evidenceLinked === 0
      && wikiSummary?.evidenceByStatus?.pending === 0
      && wikiSummary?.evidenceByStatus?.verified === 0,
    JSON.stringify(wikiSummary ?? null));
  conferir('a fila Wiki Zomboid expõe somente revisão bounded',
    Array.isArray(wikiReviewQueue)
      && wikiReviewQueue.length === 0,
    JSON.stringify(wikiReviewQueue ?? null));
  const wikiNaTela = await navegarAte(pagina, '#/wiki-zomboid', () => {
    const t = document.getElementById('saida')?.innerText ?? '';
    return /Wiki Zomboid V2/.test(t)
      && /159 entradas locais/.test(t)
      && /Evidence local conectada/i.test(t)
      && /0 vinculadas/.test(t)
      && /0 pendentes/.test(t);
  });
  conferir('a superfície Wiki Zomboid V2 renderiza o schema local',
    /Wiki Zomboid V2/.test(wikiNaTela)
      && /159 entradas locais/.test(wikiNaTela)
      && /Evidence local conectada/i.test(wikiNaTela)
      && /0 vinculadas/.test(wikiNaTela)
      && /0 pendentes/.test(wikiNaTela), wikiNaTela.slice(0, 220));

  /* O DEFEITO 1: se `view` devolver o módulo em vez do elemento, isto fica
   * vazio. A asserção é de IDENTIDADE, não de tamanho — a versão anterior media
   * `length > 100` e reprovou quando a view nativa (mais enxuta que a página da
   * V1) passou a renderizar. Limiar de tamanho é asserção fraca: aprova
   * qualquer coisa grande e reprova o certo quando ele encolhe. */
  const conteudo = await navegarAte(pagina, '#/cripto', () => {
    const t = document.getElementById('saida')?.innerText ?? '';
    return /Lab de Criptografia/.test(t) && /AES-GCM/.test(t);
  });
  conferir('a view NATIVA da V2 renderiza',
    /Lab de Criptografia/.test(conteudo) && /AES-GCM/.test(conteudo)
      && !/falhou|não é um nó/.test(conteudo),
    conteudo.slice(0, 90));

  /* O engine 3D só é provável AQUI. Node não tem GPU, então a suíte cobre a
   * fronteira (degradação sem WebGL) e o grafo de cena — nunca o render. Se esta
   * asserção sair, o `cena.js` volta a ser preparação testada que nada executa.
   *
   * `estado === 'ativo'` é o que a vista escreve quando `criarCena` NÃO devolveu
   * `null`: significa que o contexto WebGL foi criado de verdade. E o canvas
   * ainda ter contexto prova que ele não foi perdido logo em seguida. */
  const visor = await navegarAte(pagina, '#/visor3d', () => {
    const raiz = document.querySelector('.v2-visor3d');
    return raiz?.dataset?.estado === 'ativo' || raiz?.dataset?.estado === 'sem-webgl';
  });
  const cena3d = await pagina.evaluate(() => {
    const raiz = document.querySelector('.v2-visor3d');
    const canvas = raiz?.querySelector('canvas');
    return {
      estado: raiz?.dataset?.estado ?? null,
      temCanvas: !!canvas,
      temContexto: !!(canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl'))),
      descartavel: typeof (/** @type {any} */ (raiz)?.destruir) === 'function'
    };
  });
  conferir('o engine 3D monta uma cena com WebGL de verdade',
    cena3d.estado === 'ativo' && cena3d.temCanvas && cena3d.temContexto,
    JSON.stringify(cena3d));
  /* Sem `destruir`, o `requestAnimationFrame` sobrevive à saída da rota e a GPU
   * segue desenhando uma cena que ninguém vê. */
  conferir('a vista 3D expõe o descarte que para o laço',
    cena3d.descartavel === true, JSON.stringify(cena3d));
  void visor;

  /* Volta para `/cripto`: o bloco abaixo interage com a view do cripto e assumia
   * estar nela. Restaurar a precondição EXPLICITAMENTE é melhor que reordenar as
   * asserções — a ordem aqui conta uma história (boot → rotas → render → uso), e
   * mexer nela para acomodar uma navegação esconde a dependência em vez de
   * declará-la. */
  await navegarAte(pagina, '#/cripto', () => {
    const t = document.getElementById('saida')?.innerText ?? '';
    return /Lab de Criptografia/.test(t);
  });

  /* O módulo nativo usa ctx.trabalho e ctx.metricas — que só existem se o boot
   * os injetou. Clicar é o que prova; renderizar não prova nada disso. */
  await pagina.fill('.cripto-entrada', 'texto de prova');
  await pagina.fill('input[type=password]', 'senha-de-prova');
  await pagina.getByRole('button', { name: 'SHA-256' }).click();
  await pagina.waitForTimeout(1200);
  const hashNaTela = await pagina.locator('.cripto-saida').innerText().catch(() => '');
  conferir('o módulo EXECUTA usando o contexto (escalonador + métricas)',
    /^[0-9a-f]{64}$/.test(hashNaTela.trim()), hashNaTela.slice(0, 70));

  const metricas = await pagina.evaluate(() => window.__v2?.metricas?.());
  conferir('a execução foi medida pelo módulo',
    !!metricas?.contadores?.cripto_hash, JSON.stringify(metricas?.contadores ?? {}).slice(0, 80));

  /* ── permissões, no navegador ───────────────────────────────────────────
   * `militar` declara NETWORK. Sem política, o banco de prova não concede nada
   * — e é isso que "deny-by-default" tem que significar quando o sistema está
   * de fato no ar, não só num teste de unidade. */
  const permAntes = await pagina.evaluate(() => window.__v2?.permissoes?.());
  const militarAntes = permAntes?.find((x) => x.modulo === 'militar');
  conferir('declarar não é receber: militar sobe com NETWORK negada',
    militarAntes?.declaradas?.includes('NETWORK') === true
      && militarAntes?.concedidas?.length === 0
      && militarAntes?.pendentes?.includes('NETWORK') === true,
    JSON.stringify(militarAntes ?? null));

  /* E a concessão precisa alcançar um módulo que JÁ está no ar — se `pode()`
   * fosse fotografia do init, isto continuaria negado. */
  const depoisDeConceder = await pagina.evaluate(() => {
    window.__v2.conceder('militar', 'NETWORK');
    return window.__v2.diagnostico().modulos.find((m) => m.id === 'militar');
  });
  conferir('conceder alcança módulo já no ar',
    depoisDeConceder?.concedidas?.includes('NETWORK') === true,
    JSON.stringify(depoisDeConceder?.concedidas ?? null));

  const depoisDeRevogar = await pagina.evaluate(() => {
    window.__v2.revogar('militar', 'NETWORK');
    return window.__v2.diagnostico().modulos.find((m) => m.id === 'militar');
  });
  conferir('revogar também alcança — senão "revogar" é enfeite',
    depoisDeRevogar?.concedidas?.length === 0,
    JSON.stringify(depoisDeRevogar?.concedidas ?? null));

  /* Um módulo ADAPTADOR (militar → páginas da V1) continua funcionando: a V2
   * serve os dois mundos enquanto a migração acontece. */
  const conteudo2 = await navegarAte(pagina, '#/arsenal', (anterior) => {
    const t = document.getElementById('saida')?.innerText ?? '';
    return t.length > 100 && t !== anterior;
  }, conteudo);
  conferir('módulo adaptador ainda serve a página da V1',
    conteudo2.length > 100 && conteudo2 !== conteudo, conteudo2.slice(0, 70));

  conferir('nenhum erro de JS', errosJs.length === 0, errosJs.slice(0, 2).join(' | '));
} finally {
  await navegador?.close().catch(() => {});
  await encerrarServidor();
}

const falhas = passos.filter((p) => !p.ok);
console.log(`\n${passos.length - falhas.length}/${passos.length}`);
if (falhas.length) {
  console.error('\n🔴 A fundação da V2 parou de dirigir o router da V1.');
  console.error('   Ver docs/v2/V2_MODULE_RULES.md — "view devolve o ELEMENTO".');
  process.exit(1);
}
