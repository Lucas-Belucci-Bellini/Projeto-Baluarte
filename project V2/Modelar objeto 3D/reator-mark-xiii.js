// Reator de contenção Mark XIII — Projeto Baluarte
// Modelo em metros, y-up, base assentada em y=0. Cada peça e cada material têm
// nome: são eles que viram os blocos `o` / `usemtl` do OBJ e os nós do GLB.
import * as THREE from 'three';

export const CY = 0.40; // altura do eixo do reator

function makeMaterials() {
  return {
    aco: new THREE.MeshStandardMaterial({
      name: 'aco_escovado', color: 0x9a958c, metalness: 0.88, roughness: 0.38,
      side: THREE.DoubleSide,
    }),
    grafite: new THREE.MeshStandardMaterial({
      name: 'grafite_fosco', color: 0x3a3541, metalness: 0.5, roughness: 0.66,
      side: THREE.DoubleSide,
    }),
    ouro: new THREE.MeshStandardMaterial({
      name: 'ouro_baluarte', color: 0xd8a44e, metalness: 0.95, roughness: 0.24,
    }),
    cobre: new THREE.MeshStandardMaterial({
      name: 'cobre_bobina', color: 0xb06a34, metalness: 0.9, roughness: 0.33,
    }),
    plasma: new THREE.MeshStandardMaterial({
      name: 'plasma_nucleo', color: 0xffe0b0, emissive: 0xffb347,
      emissiveIntensity: 2.0, metalness: 0, roughness: 0.3,
    }),
    vidro: new THREE.MeshStandardMaterial({
      name: 'vidro_ambar', color: 0xffcb8e, metalness: 0.15, roughness: 0.06,
      transparent: true, opacity: 0.2, side: THREE.DoubleSide,
    }),
    conduite: new THREE.MeshStandardMaterial({
      name: 'conduite_blindado', color: 0x201d26, metalness: 0.3, roughness: 0.82,
    }),
  };
}

const lathe = (pts, mat, name, seg = 72) => {
  const g = new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.name = name;
  return m;
};
const cyl = (rt, rb, h, mat, name, seg = 40) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.name = name;
  return m;
};
const torus = (r, t, mat, name, tub = 18, seg = 96, arc) => {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, t, tub, seg, arc), mat);
  m.name = name;
  return m;
};
const box = (w, h, d, mat, name) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.name = name;
  return m;
};
const anchor = (x, y, z) => {
  const a = new THREE.Object3D();
  a.position.set(x, y, z);
  return a;
};

export function buildReactor() {
  const M = makeMaterials();
  const model = new THREE.Group();
  model.name = 'reator_mark_xiii';
  const hotspots = [];

  /* ── 1. BERÇO DE ANCORAGEM ───────────────────────────────────────────── */
  const berco = new THREE.Group();
  berco.name = 'berco_ancoragem';
  berco.userData.explode = { dir: [0, -1, 0], dist: 0.22 };

  const base = cyl(0.37, 0.385, 0.042, M.grafite, 'base_hexagonal', 6);
  base.position.y = 0.021;
  base.rotation.y = Math.PI / 6;
  berco.add(base);

  const inlay = cyl(0.285, 0.285, 0.010, M.ouro, 'base_inlay_hexagonal', 6);
  inlay.position.y = 0.046;
  inlay.rotation.y = Math.PI / 6;
  berco.add(inlay);

  const sulco = torus(0.325, 0.008, M.aco, 'base_sulco', 10, 72);
  sulco.rotation.x = Math.PI / 2;
  sulco.position.y = 0.044;
  berco.add(sulco);

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const b = cyl(0.014, 0.014, 0.016, M.ouro, 'parafuso_base_' + i, 14);
    b.position.set(Math.cos(a) * 0.345, 0.046, Math.sin(a) * 0.345);
    berco.add(b);
    const w = cyl(0.024, 0.024, 0.006, M.aco, 'arruela_base_' + i, 14);
    w.position.set(Math.cos(a) * 0.345, 0.041, Math.sin(a) * 0.345);
    berco.add(w);
  }

  [-1, 1].forEach((s, i) => {
    const lado = i === 0 ? 'esq' : 'dir';
    const h = CY - 0.043;
    const col = cyl(0.026, 0.044, h, M.aco, 'coluna_' + lado, 28);
    col.position.set(s * 0.31, 0.043 + h / 2, 0);
    berco.add(col);

    const nerv = box(0.014, h * 0.86, 0.086, M.grafite, 'nervura_' + lado);
    nerv.position.set(s * 0.31, 0.043 + h * 0.45, 0);
    berco.add(nerv);

    const boss = cyl(0.052, 0.052, 0.062, M.aco, 'mancal_' + lado, 28);
    boss.rotation.z = Math.PI / 2;
    boss.position.set(s * 0.312, CY, 0);
    berco.add(boss);

    const cap = torus(0.038, 0.009, M.ouro, 'anel_mancal_' + lado, 12, 32);
    cap.rotation.y = Math.PI / 2;
    cap.position.set(s * 0.341, CY, 0);
    berco.add(cap);

    const pin = cyl(0.013, 0.013, 0.024, M.ouro, 'pino_mancal_' + lado, 16);
    pin.rotation.z = Math.PI / 2;
    pin.position.set(s * 0.352, CY, 0);
    berco.add(pin);
  });

  const placa = box(0.14, 0.036, 0.008, M.aco, 'placa_identificacao');
  placa.position.set(0, 0.030, 0.318);
  berco.add(placa);
  const placaOuro = box(0.104, 0.014, 0.004, M.ouro, 'placa_gravacao');
  placaOuro.position.set(0, 0.030, 0.323);
  berco.add(placaOuro);

  const aBerco = anchor(0.31, 0.20, 0.02);
  berco.add(aBerco);
  hotspots.push({
    anchor: aBerco, normal: [0.85, -0.1, 0.5], dx: 128, dy: 8,
    label: 'BERÇO DE ANCORAGEM', value: 'gimbal · 2 mancais',
  });
  model.add(berco);

  /* ── 2. ANEL DE CONTENÇÃO ────────────────────────────────────────────── */
  const gimbal = new THREE.Group();
  gimbal.name = 'anel_contencao';
  gimbal.position.set(0, CY, 0);
  gimbal.userData.explode = { dir: [0, 1, 0], dist: 0.24 };

  gimbal.add(torus(0.28, 0.016, M.ouro, 'aro_externo', 20, 120));
  gimbal.add(torus(0.262, 0.007, M.grafite, 'aro_interno', 12, 120));

  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const long = i % 3 === 0;
    const t = box(0.010, long ? 0.036 : 0.020, 0.016, M.aco, 'marca_angular_' + i);
    t.position.set(Math.cos(a) * 0.268, Math.sin(a) * 0.268, 0);
    t.rotation.z = a + Math.PI / 2;
    gimbal.add(t);
  }
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i / 4) * Math.PI * 2;
    const n = cyl(0.020, 0.020, 0.030, M.ouro, 'no_contencao_' + i, 18);
    n.rotation.x = Math.PI / 2;
    n.position.set(Math.cos(a) * 0.28, Math.sin(a) * 0.28, 0);
    gimbal.add(n);
  }

  const aAnel = anchor(0, 0.288, 0);
  gimbal.add(aAnel);
  hotspots.push({
    anchor: aAnel, normal: [0, 1, 0.25], dx: -60, dy: -66,
    label: 'ANEL DE CONTENÇÃO', value: 'liga Baluarte · 36 marcas',
  });
  model.add(gimbal);

  /* ── 3. CARCAÇA BLINDADA ─────────────────────────────────────────────── */
  const carcaca = new THREE.Group();
  carcaca.name = 'carcaca_blindada';
  carcaca.position.set(0, CY, 0);
  carcaca.userData.explode = { dir: [0, 0, 1], dist: 0.34 };

  const casco = lathe([
    [0.055, -0.078], [0.19, -0.078], [0.212, -0.064], [0.232, -0.040],
    [0.232, 0.028], [0.222, 0.042], [0.222, 0.056], [0.246, 0.068],
    [0.246, 0.080], [0.214, 0.087], [0.176, 0.078], [0.152, 0.060],
  ], M.grafite, 'casco_externo');
  casco.rotation.x = Math.PI / 2;
  carcaca.add(casco);

  const flange = torus(0.252, 0.013, M.ouro, 'flange_frontal', 16, 120);
  flange.position.z = 0.078;
  carcaca.add(flange);

  const cinta = torus(0.236, 0.008, M.ouro, 'cinta_equatorial', 12, 120);
  cinta.position.z = -0.010;
  carcaca.add(cinta);

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 12;
    const t = box(0.030, 0.020, 0.150, M.aco, 'trava_radial_' + i);
    t.position.set(Math.cos(a) * 0.238, Math.sin(a) * 0.238, 0.0);
    t.rotation.z = a;
    carcaca.add(t);
  }

  const emblema = cyl(0.046, 0.046, 0.014, M.ouro, 'emblema_baluarte', 6);
  emblema.rotation.x = Math.PI / 2;
  emblema.position.set(0, -0.196, 0.082);
  carcaca.add(emblema);
  const emblemaNucleo = cyl(0.024, 0.024, 0.018, M.grafite, 'emblema_nucleo', 6);
  emblemaNucleo.rotation.x = Math.PI / 2;
  emblemaNucleo.position.set(0, -0.196, 0.086);
  carcaca.add(emblemaNucleo);

  const funil = lathe([
    [0.148, 0.058], [0.126, 0.026], [0.100, -0.004], [0.078, -0.038],
    [0.062, -0.062],
  ], M.aco, 'funil_interno', 64);
  funil.rotation.x = Math.PI / 2;
  carcaca.add(funil);

  const aCarcaca = anchor(-0.20, -0.10, 0.05);
  carcaca.add(aCarcaca);
  hotspots.push({
    anchor: aCarcaca, normal: [-0.8, -0.35, 0.45], dx: -196, dy: 26,
    label: 'CARCAÇA BLINDADA', value: 'ø 492 mm · 6 travas',
  });
  model.add(carcaca);

  /* ── 4. DISSIPADOR TRASEIRO ──────────────────────────────────────────── */
  const dissipador = new THREE.Group();
  dissipador.name = 'dissipador_termico';
  dissipador.position.set(0, CY, 0);
  dissipador.userData.explode = { dir: [0, 0, -1], dist: 0.30 };

  const tampa = cyl(0.196, 0.232, 0.026, M.aco, 'tampa_traseira', 64);
  tampa.rotation.x = Math.PI / 2;
  tampa.position.z = -0.092;
  dissipador.add(tampa);

  const cubo = cyl(0.062, 0.076, 0.044, M.grafite, 'cubo_traseiro', 32);
  cubo.rotation.x = Math.PI / 2;
  cubo.position.z = -0.120;
  dissipador.add(cubo);

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const f = box(0.100, 0.011, 0.052, M.aco, 'aleta_' + i);
    f.position.set(Math.cos(a) * 0.152, Math.sin(a) * 0.152, -0.118);
    f.rotation.z = a;
    dissipador.add(f);
  }

  const aDiss = anchor(-0.11, -0.14, -0.13);
  dissipador.add(aDiss);
  hotspots.push({
    anchor: aDiss, normal: [-0.35, -0.5, -0.79], dx: -186, dy: 46,
    label: 'DISSIPADOR TÉRMICO', value: '12 aletas · 214 °C',
  });
  model.add(dissipador);

  /* ── 5. BOBINAS DE INDUÇÃO (explodem radialmente) ────────────────────── */
  const bobinas = new THREE.Group();
  bobinas.name = 'conjunto_bobinas';
  bobinas.position.set(0, CY, 0);

  const NB = 8;
  for (let i = 0; i < NB; i++) {
    const a = (i / NB) * Math.PI * 2 + Math.PI / NB;
    const g = new THREE.Group();
    g.name = 'bobina_' + i;
    g.rotation.z = a;
    g.userData.explode = { dir: [Math.cos(a), Math.sin(a), 0], dist: 0.16 };

    const post = cyl(0.017, 0.017, 0.092, M.aco, 'poste_' + i, 20);
    post.rotation.z = Math.PI / 2;
    post.position.x = 0.156;
    g.add(post);

    const coil = torus(0.030, 0.0115, M.cobre, 'enrolamento_' + i, 14, 34);
    coil.rotation.y = Math.PI / 2;
    coil.position.x = 0.156;
    g.add(coil);

    const coil2 = torus(0.030, 0.0115, M.cobre, 'enrolamento_sec_' + i, 14, 34);
    coil2.rotation.y = Math.PI / 2;
    coil2.position.x = 0.128;
    g.add(coil2);

    const capOut = cyl(0.024, 0.031, 0.014, M.ouro, 'terminal_ext_' + i, 20);
    capOut.rotation.z = Math.PI / 2;
    capOut.position.x = 0.199;
    g.add(capOut);

    const capIn = cyl(0.012, 0.019, 0.012, M.ouro, 'terminal_int_' + i, 16);
    capIn.rotation.z = Math.PI / 2;
    capIn.position.x = 0.106;
    g.add(capIn);

    bobinas.add(g);
    if (i === 1) {
      const aB = anchor(0.156, 0.036, 0.0);
      g.add(aB);
      hotspots.push({
        anchor: aB, normal: [0.55, 0.6, 0.58], dx: 122, dy: -54,
        label: 'BOBINAS DE INDUÇÃO', value: '8 × cobre · 3.1 T',
      });
    }
  }
  model.add(bobinas);

  /* ── 6. ROTOR (gira) ─────────────────────────────────────────────────── */
  const rotor = new THREE.Group();
  rotor.name = 'rotor_interno';
  rotor.position.set(0, CY, 0.024);
  rotor.userData.explode = { dir: [0, 0, 1], dist: 0.18 };

  rotor.add(torus(0.104, 0.011, M.ouro, 'aro_rotor', 14, 80));
  rotor.add(torus(0.082, 0.005, M.cobre, 'aro_rotor_sec', 10, 80));
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const s = box(0.096, 0.009, 0.008, M.aco, 'raio_rotor_' + i);
    s.position.set(Math.cos(a) * 0.052, Math.sin(a) * 0.052, 0);
    s.rotation.z = a;
    rotor.add(s);
    const p = cyl(0.010, 0.010, 0.016, M.ouro, 'pastilha_rotor_' + i, 14);
    p.rotation.x = Math.PI / 2;
    p.position.set(Math.cos(a) * 0.104, Math.sin(a) * 0.104, 0);
    rotor.add(p);
  }
  model.add(rotor);

  /* ── 7. CORAÇÃO DE PLASMA ────────────────────────────────────────────── */
  const nucleo = new THREE.Group();
  nucleo.name = 'coracao_plasma';
  nucleo.position.set(0, CY, 0.012);

  const heart = new THREE.Mesh(new THREE.SphereGeometry(0.046, 40, 28), M.plasma);
  heart.name = 'esfera_plasma';
  nucleo.add(heart);

  const iris = lathe([
    [0.052, -0.014], [0.062, -0.006], [0.070, 0.006], [0.074, 0.020],
    [0.084, 0.026], [0.084, 0.014], [0.078, -0.006], [0.066, -0.020],
  ], M.ouro, 'iris_nucleo', 56);
  iris.rotation.x = Math.PI / 2;
  nucleo.add(iris);

  nucleo.add(torus(0.062, 0.0045, M.plasma, 'halo_plasma', 10, 64));
  const cage1 = torus(0.058, 0.0035, M.ouro, 'gaiola_a', 8, 48);
  cage1.rotation.y = Math.PI / 2.4;
  nucleo.add(cage1);
  const cage2 = torus(0.058, 0.0035, M.ouro, 'gaiola_b', 8, 48);
  cage2.rotation.x = Math.PI / 2.4;
  nucleo.add(cage2);

  const aNuc = anchor(0, 0.052, 0.05);
  nucleo.add(aNuc);
  hotspots.push({
    anchor: aNuc, normal: [0.1, 0.35, 0.93], dx: 108, dy: -104,
    label: 'CORAÇÃO DE PLASMA', value: '4.2 GJ · contido',
  });
  model.add(nucleo);

  /* ── 8. LENTE ÂMBAR ─────────────────────────────────────────────────── */
  const lente = new THREE.Group();
  lente.name = 'lente_ambar';
  lente.position.set(0, CY, 0);
  lente.userData.explode = { dir: [0, 0, 1], dist: 0.52 };

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.30, 56, 28, 0, Math.PI * 2, 0, 0.52), M.vidro
  );
  dome.name = 'cupula_ambar';
  dome.rotation.x = Math.PI / 2;
  dome.position.z = -0.202;
  lente.add(dome);

  const aroLente = torus(0.152, 0.008, M.ouro, 'aro_lente', 12, 96);
  aroLente.position.z = 0.058;
  lente.add(aroLente);
  model.add(lente);

  /* ── 9. CONDUÍTES DE ENERGIA ─────────────────────────────────────────── */
  const conduites = new THREE.Group();
  conduites.name = 'conduites_energia';
  [-1, 1].forEach((s, i) => {
    const lado = i === 0 ? 'esq' : 'dir';
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 0.062, CY - 0.040, -0.126),
      new THREE.Vector3(s * 0.150, CY - 0.130, -0.190),
      new THREE.Vector3(s * 0.196, CY - 0.250, -0.176),
      new THREE.Vector3(s * 0.190, 0.100, -0.116),
      new THREE.Vector3(s * 0.170, 0.052, -0.062),
    ]);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 48, 0.019, 16, false), M.conduite
    );
    tube.name = 'conduite_' + lado;
    conduites.add(tube);

    [0.0, 0.5, 1.0].forEach((t, k) => {
      const p = curve.getPointAt(t);
      const collar = torus(0.024, 0.006, M.ouro, 'braçadeira_' + lado + '_' + k, 10, 24);
      const tan = curve.getTangentAt(t);
      collar.position.copy(p);
      collar.lookAt(p.clone().add(tan));
      conduites.add(collar);
    });
  });
  model.add(conduites);

  return { model, materials: M, rotor, hotspots, corePos: new THREE.Vector3(0, CY, 0.02) };
}
