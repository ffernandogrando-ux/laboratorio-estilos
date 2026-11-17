// Cidade procedural determinística de "maquete noturna": uma avenida em curva suave (trinário: canaleta do ônibus no meio,
// pistas lentas dos lados, vias rápidas uma quadra para fora), quadras de prédios de alturas variadas, ônibus articulados,
// carros e pontos de gente. Tudo é função pura de t (posições = s0 + v·t, com volta).
// Ideias (MIT, © 2026 Lemomo/LemoLab): cidade de blocos de lemo-opuscar styles/white-model; faixas e trânsito andando de
// styles/tilt-shift (traffic.js). Código reescrito para canvas 2D.
import { mulberry, lerp, seg, ss, eio } from '/motor/lib.js';
import { g, prisma, fita, fog, hex, fillWorld, fillCam, toCam, scr } from './proj.js';

export const COR = {
  fundo: '#15171c', chao: hex('#1b1d22'), rua: hex('#25262b'), calcada: hex('#202227'),
  topo: hex('#3b3f49'), lado1: hex('#2c2f37'), lado2: hex('#23262d'),
  vermelho: hex('#e0284a'), laranja: hex('#f2a03a'), menta: hex('#4fd6a8'), azul: hex('#7ab8ff'), branco: hex('#d8dade'),
  amarelo: hex('#e9b949'),
};
// eixo da avenida: x = X(z); seções transversais em metros a partir do centro
export const Z0 = -200, Z1 = 1300;
export const X = z => 38 * Math.sin(z / 230) + 10 * Math.sin(z / 97 + 1);
const dX = z => 38 / 230 * Math.cos(z / 230) + 10 / 97 * Math.cos(z / 97 + 1);
// ponto na avenida: z ao longo, u lateral (direita +), y altura
export function A(z, u = 0, y = 0) { const d = dX(z), n = Math.hypot(1, d); return [X(z) + u / n, y, z - u * d / n]; }
export const yawAt = z => Math.atan(dX(z));
export const SEC = { canaleta: 3.6, linhaV: 4.1, lenta: 11, linhaL: 11.4, calc: 14, rapida: 50, rapLarg: 14 };

const AMOSTRA = 3;   // m entre amostras da curva
function curva(z0, z1) {
  const pts = [];
  for (let z = z0; z <= z1 + 1e-6; z += AMOSTRA) { const d = dX(z), n = Math.hypot(1, d); pts.push([X(z), z, 1 / n, -d / n]); }
  return pts;
}

// —— prédios ——
// opções (padrão = Curitiba): faixas de quadras em u, alturas, terreno(u) → altura do chão, alto(u) → prédio mais alto ali
export function gerarCidade(seed = 7, op = {}) {
  const R = mulberry(seed), predios = [];
  const faixas = op.faixas || [[16, 40], [-40, -16], [62, 110], [-110, -62], [120, 175], [-175, -120], [185, 240], [-240, -185]];   // faixas laterais de quadras (u)
  const terreno = op.terreno || (() => 0), metro = !!op.metropole;
  for (const [u0, u1] of faixas) {
    let z = Z0;
    while (z < Z1) {
      const quadra = 70 + R() * 50;                       // comprimento da quadra; rua transversal de 12 m entre elas
      let zz = z;
      while (zz < z + quadra - 8) {
        const comp = metro ? 8 + R() * 13 : 10 + R() * 18, dz = Math.min(comp, z + quadra - zz);
        // 1 ou 2 prédios na profundidade da faixa (metrópole: até 3, mais colados)
        const parte = metro ? (R() < .35 ? 2 : 3) : R() < .55 ? 1 : 2, larg = (u1 - u0) / parte;
        for (let k = 0; k < parte; k++) {
          const uc = u0 + larg * (k + .5) + (R() - .5) * 4, w = larg - 3 - R() * 6;
          const lonje = Math.min(Math.abs(uc), 150) / 150;
          const h = metro ? 14 + Math.pow(R(), 1.3) * (op.alto ? op.alto(uc) : 70) + (R() < .1 ? 45 : 0)
                          : 7 + Math.pow(R(), 1.6) * (40 + 30 * lonje) + (R() < .07 ? 35 : 0);
          const zc = zz + dz / 2, p = A(zc, uc);
          predios.push({ x: p[0], z: p[2], y0: terreno(uc), w: Math.max(metro ? 5 : 6, w), d: dz - (metro ? 2 : 3), h, yaw: yawAt(zc), u: uc, zc, alt: R() });
        }
        zz += dz;
      }
      z += quadra + 12;
    }
  }
  return predios;
}

// —— veículos ——
// faixas de rodagem: u, sentido, velocidade (m/s), tipo
export const FAIXAS = [
  { u: -1.8, dir: 1, v: 12, tipo: 'bus', n: 9 }, { u: 1.8, dir: -1, v: 12, tipo: 'bus', n: 9 },
  { u: -6, dir: 1, v: 7, tipo: 'car', n: 26 }, { u: -9, dir: 1, v: 6, tipo: 'car', n: 20 },
  { u: 6, dir: -1, v: 7, tipo: 'car', n: 26 }, { u: 9, dir: -1, v: 6, tipo: 'car', n: 20 },
  ...[-1, 1].flatMap(sd => [-4.5, 0, 4.5].map((o, i) => ({ u: sd * SEC.rapida + o, dir: sd, v: 16 + i * 2, tipo: 'car', n: 60 }))),
];
export function gerarVeiculos(seed = 3) {
  const R = mulberry(seed), vs = [], L = Z1 - Z0;
  for (const f of FAIXAS) for (let i = 0; i < f.n; i++) {
    const s0 = (i + R() * .6) / f.n * L;
    const cor = R() < .7 ? 0 : R() < .5 ? 1 : 2;
    vs.push({ f, s0, v: f.v * (.9 + R() * .2), cor, len: f.tipo === 'bus' ? 3 : 1 });
  }
  return vs;
}
const posZ = (vh, t) => { const L = Z1 - Z0; let s = (vh.s0 + vh.v * t * vh.f.dir) % L; if (s < 0) s += L; return Z0 + s; };

const CARRO = [hex('#e4e5e8'), hex('#a9adb4'), hex('#6f747c')];
function carro(C, z, u, dir, cor) {
  const p = A(z, u), yaw = yawAt(z), base = CARRO[cor];
  const lado = base.map(c => c * .78), lado2 = base.map(c => c * .6);
  prisma(C, { x: p[0], z: p[2], w: 2, d: 4.4, h: 1.1, yaw, top: base, s1: lado, s2: lado2 });
  const q = A(z - dir * .3, u);   // cabine escura
  prisma(C, { x: q[0], z: q[2], y0: 1.1, w: 1.7, d: 2.2, h: .55, yaw, top: hex('#14161a'), s1: hex('#1d2026'), s2: hex('#191b20'),
    deco: null });
  // lanterna traseira
  const tz = z - dir * 2.22, a = A(tz, u - .8, .55), b = A(tz, u + .8, .55), c2 = A(tz, u + .8, .85), d2 = A(tz, u - .8, .85);
  fillWorld(C, [a, b, c2, d2], 'rgb(226,40,74)');
}
function onibus(C, z, u, dir) {
  // 3 módulos articulados que seguem a curva
  for (let k = 0; k < 3; k++) {
    const zc = z - dir * k * 6.4, p = A(zc, u), yaw = yawAt(zc);
    prisma(C, { x: p[0], z: p[2], w: 2.6, d: 6, h: 3.2, yaw, top: hex('#d42246'), s1: hex('#b81b3b'), s2: hex('#8f1530'),
      deco: (C, topo, d) => {   // janelas do teto (rosa claro)
        for (const e of [-1.5, 1.5]) {
          const pts = [[-.7, e - 1.1], [.7, e - 1.1], [.7, e + 1.1], [-.7, e + 1.1]].map(([a, b]) => A(zc + b, u + a, 3.22));
          fillWorld(C, pts, fog(C, hex('#f7c9d3'), d));
        }
      } });
  }
}

// —— gente ——  n pontos com posição espalhada (de) e ao longo do eixo (para); k = 0→1 junta
export function gerarGente(n = 420, seed = 11) {
  const R = mulberry(seed), gs = [];
  for (let i = 0; i < n; i++) {
    const de = [lerp(-30, 700, R()), (R() < .5 ? -1 : 1) * lerp(20, 210, R())];
    const lado = R() < .5 ? -1 : 1, para = [lerp(-30, 700, R()), lado * lerp(SEC.linhaL + .8, SEC.calc + 4, R())];
    gs.push({ de, para, atraso: R() * .45, fase: R() * 6.28 });
  }
  return gs;
}

// —— desenho ——
// o = { predios, veiculos, gente, juntar (0..1), genteA (alpha), destaque: { canaleta, lenta, rapida } (0..1, brilho extra) }
export function desenharCidade(C, t, o) {
  const cam = C.pos;
  g.fillStyle = COR.fundo; g.fillRect(0, 0, 1080, 1920);
  // janela de z visível (aprox.): ao redor da câmera, para não desenhar a avenida inteira
  const zc = cam[2], corte = o.corte ?? -1e9, za = Math.max(Z0, zc - 260, corte), zb = Math.min(Z1, zc + 900);
  const pts = curva(za, zb);
  const rapidas = o.rapidas !== false, rx = o.raiox || 0, va = 1 - .78 * rx;   // raio-X: o asfalto fica translúcido
  // chão: grande fita escura, ou degraus de curva de nível (terreno = [[u, y], ...] para |u| ≥ u; lados: o.terrenoE / o.terrenoD)
  if (o.terrenoD) terrenoDegraus(C, pts, o.terrenoD, o.terrenoE || o.terrenoD);
  else fita(C, pts, 0, 520, COR.chao);
  if (o.rio) rioGaleria(C, pts, t, o.rio, rx);
  if (o.corte != null && o.terrenoD) faceCorte(C, o.corte, o.terrenoD, o.terrenoE || o.terrenoD, o.rio);
  // ruas: avenida, vias rápidas
  fita(C, pts, 0, 2 * SEC.calc, COR.calcada, 0, o.rio ? va : 1);
  fita(C, pts, 0, 2 * SEC.linhaL + 1, COR.rua, 0, o.rio ? va : 1);
  if (rapidas) for (const sd of [-1, 1]) fita(C, pts, sd * SEC.rapida, SEC.rapLarg + 3, COR.rua);
  if (o.ruaAlta) fita(C, pts, o.ruaAlta.u, o.ruaAlta.larg, COR.rua, o.ruaAlta.y + .05);
  // ruas transversais (a cada quadra, aproximadas) — faixas escuras finas
  // linhas coloridas (grossas, como na referência)
  const h = o.destaque || {};
  const brilho = (rgb, k) => k ? rgb.map(c => Math.min(255, c + 25 * k)) : rgb;
  for (const sd of [-1, 1]) {
    fita(C, pts, sd * SEC.linhaV, .6 + .3 * (h.canaleta || 0), brilho(COR.vermelho, h.canaleta), .02);
    fita(C, pts, sd * SEC.linhaL, .5 + .3 * (h.lenta || 0), brilho(COR.laranja, h.lenta), .02);
    if (!rapidas) continue;
    fita(C, pts, sd * (SEC.rapida + SEC.rapLarg / 2 + .6), 1.1 + .4 * (h.rapida || 0), brilho(COR.menta, h.rapida), .02);
    fita(C, pts, sd * (SEC.rapida - SEC.rapLarg / 2 - .3), .25, COR.branco, .02, .7);
  }
  if (o.ruaAlta) for (const sd of [-1, 1]) fita(C, pts, o.ruaAlta.u + sd * (o.ruaAlta.larg / 2 + .4), .9 + .5 * (h.ruaAlta || 0), brilho(COR.menta, h.ruaAlta), o.ruaAlta.y + .08);
  // tracejado branco nas vias rápidas
  const dash = [];
  for (let z = Math.ceil(za / 9) * 9; z < zb; z += 9) dash.push(z);
  if (rapidas) for (const sd of [-1, 1]) for (const o2 of [-2.25, 2.25]) for (const z of dash) {
    const u = sd * SEC.rapida + o2, d = Math.hypot(A(z)[0] - cam[0], z - cam[2]);
    if (d > 520) continue;
    fillWorld(C, [A(z, u - .12, .03), A(z, u + .12, .03), A(z + 3, u + .12, .03), A(z + 3, u - .12, .03)], fog(C, COR.branco.map(c => c * .8), d));
  }
  // itens com volume, ordenados de trás para a frente
  const itens = [];
  const perto = (x, z, lim) => { const dx = x - cam[0], dz = z - cam[2]; return dx * dx + dz * dz < lim * lim; };
  const dentro = (x, z) => { const q = toCam(C, [x, 0, z]); return q[2] > -40; };
  for (const p of o.predios) if (p.zc - p.d / 2 > corte + 1 && p.zc > za - 40 && p.zc < zb && perto(p.x, p.z, 900) && dentro(p.x, p.z)) {
    const top = p.alt > .93 && o.amarelo ? COR.amarelo : COR.topo;
    itens.push({ d: dist(cam, p.x, p.h * .3, p.z), f: () => prisma(C, { ...p, top, s1: COR.lado1, s2: COR.lado2 }) });
  }
  for (const v of o.veiculos) {
    const z = posZ(v, t); if (z < za + (o.corte != null ? 8 : 0) || z > zb) continue;
    const p = A(z, v.f.u); if (!perto(p[0], p[2], 650) || !dentro(p[0], p[2])) continue;
    const dd = dist(cam, p[0], 1, p[2]);
    itens.push({ d: dd, f: v.f.tipo === 'bus' ? () => onibus(C, z, v.f.u, v.f.dir) : () => carro(C, z, v.f.u, v.f.dir, v.cor) });
  }
  if (o.gente && (o.genteA ?? 1) > 0) {
    const ga = o.genteA ?? 1, k0 = o.juntar || 0;
    for (const p of o.gente) {
      const k = eio(seg(k0, p.atraso, p.atraso + .55));
      const zz = lerp(p.de[0], p.para[0], k), uu = lerp(p.de[1], p.para[1], k) + Math.sin(t * 2 + p.fase) * .4;
      const w = A(zz, uu, .9);
      if (!perto(w[0], w[2], 600)) continue;
      const q = toCam(C, w); if (q[2] < 1) continue;
      itens.push({ d: q[2] + .5, f: () => {
        const s = scr(C, q), r = Math.max(1.5, 1.1 * C.F / q[2]);
        g.globalAlpha = ga; g.fillStyle = fog(C, COR.azul, q[2] * .6); g.beginPath(); g.ellipse(s[0], s[1], r, r * .8, 0, 0, 7); g.fill(); g.globalAlpha = 1;
      } });
    }
  }
  itens.sort((a, b) => b.d - a.d);
  for (const it of itens) it.f();
  if (o.rede && o.rede.k > 0) redeRios(C, t, o.rede);
}

// —— metrópole: terreno, rio canalizado, rede de rios ——
export const COR_AGUA = hex('#3aa0ff'), COR_AGUA2 = hex('#8fd0ff');
// degraus de curva de nível: cada patamar é uma fita na sua altura; a parede do degrau olha para o vale
function terrenoDegraus(C, pts, D, E) {
  for (const [lado, deg] of [[1, D], [-1, E]]) for (let i = 0; i < deg.length; i++) {
    const [u0, y] = deg[i], u1 = i + 1 < deg.length ? deg[i + 1][0] : 300;
    if (i > 0) parede(C, pts, lado * u0, deg[i - 1][1], y, i);
    const tom = COR.chao.map(c => c + 3 * i);
    fita(C, pts, lado * (u0 + u1) / 2 + (i === 0 ? -lado * u0 : 0) / 2, (u1 - u0) + (i === 0 ? u0 : 0) + .4, tom, y);
  }
}
export const alturaDegrau = (deg, u) => { let y = 0; for (const [u0, yy] of deg) if (Math.abs(u) >= u0) y = yy; return y; };
function parede(C, pts, u, y0, y1, i) {
  const step = 6, cor = COR.lado2.map(c => c - 2 + 2 * i);
  for (let a = 0; a < pts.length - 1; a += step) {
    const b = Math.min(pts.length - 1, a + step), Q = [];
    for (let k = a; k <= b; k++) { const p = pts[k]; Q.push(toCam(C, [p[0] + p[2] * u, y0, p[1] + p[3] * u])); }
    for (let k = b; k >= a; k--) { const p = pts[k]; Q.push(toCam(C, [p[0] + p[2] * u, y1, p[1] + p[3] * u])); }
    let dmin = 1e9; for (const q of Q) dmin = Math.min(dmin, q[2]);
    fillCam(C, Q, fog(C, cor, Math.max(0, dmin)));
  }
}
// corte da maquete em z = zc: perfil do relevo (degraus) visto de frente, com o canal do rio no fundo
function faceCorte(C, zc, D, E, rio) {
  const fundo = -26, L = rio ? (rio.larg || 9) / 2 + .6 : 0, perfil = [];
  for (const [lado, deg] of [[-1, E], [1, D]]) {
    const pts = []; for (let i = 0; i < deg.length; i++) { const u1 = i + 1 < deg.length ? deg[i + 1][0] : 320; pts.push([lado * Math.max(deg[i][0], i ? 0 : L), deg[i][1]], [lado * u1, deg[i][1]]); }
    perfil.push(lado < 0 ? pts.reverse() : pts);
  }
  const P = [[-320, fundo], ...perfil[0], ...(rio ? [[-L, -(rio.fundo || 4) - .6], [L, -(rio.fundo || 4) - .6]] : []), ...perfil[1], [320, fundo]];
  const d = Math.hypot(A(zc)[0] - C.pos[0], zc - C.pos[2]);
  fillWorld(C, P.map(([u, y]) => A(zc, u, y)), fog(C, hex('#363b46'), d));
  // faixas de "camadas" no corte
  for (let k = 1; k < 4; k++) { const y = fundo * k / 4; fillWorld(C, [A(zc, -320, y), A(zc, 320, y), A(zc, 320, y + .5), A(zc, -320, y + .5)], fog(C, hex('#2c3038'), d)); }
  if (rio) fillWorld(C, [A(zc, -L + .6, -(rio.fundo || 4)), A(zc, L - .6, -(rio.fundo || 4)), A(zc, L - .6, -1.5), A(zc, -L + .6, -1.5)], fog(C, COR_AGUA, d));
  // contorno do topo do terreno
  for (const lado of [0, 1]) { const pf = perfil[lado]; for (let i = 0; i < pf.length - 1; i++) { const [u0, y0] = pf[i], [u1, y1] = pf[i + 1];
    const n = y0 === y1 ? [0, .7] : [.7 * Math.sign(u1 - u0 || 1), 0];
    fillWorld(C, [A(zc, u0, y0), A(zc, u1, y1), A(zc, u1 + n[0], y1 + n[1]), A(zc, u0 + n[0], y0 + n[1])], fog(C, COR.menta.map(c => c * .55), d)); } }
}
// rio na galeria debaixo da avenida: fundo, paredes de concreto, água com listras correndo (o.rio = { larg, fundo, v })
function rioGaleria(C, pts, t, r, rx) {
  if (rx <= .01) return;
  const L = r.larg || 9, y = -(r.fundo || 4);
  fita(C, pts, 0, L + 2, COR.lado2, y - .6, rx);
  for (const sd of [-1, 1]) parede(C, pts, sd * (L / 2 + .6), y - .6, 0, 1);
  fita(C, pts, 0, L, COR_AGUA.map(c => c * .55), y, rx);
  // listras de correnteza
  const v = r.v || 3, per = 14;
  for (let k = 0; k < pts.length - 2; k += 2) {
    const z = pts[k][1], f = ((z - v * t) % per + per) % per; if (f > 4) continue;
    for (const o of [-L / 4, L / 6]) fillWorld(C, [A(z, o - .5, y + .05), A(z, o + .5, y + .05), A(z + 3, o + .5, y + .05), A(z + 3, o - .5, y + .05)], fog(C, COR_AGUA2, Math.hypot(pts[k][0] - C.pos[0], z - C.pos[2])), rx);
  }
}
// rede de rios em raio-X por cima da cidade: o.rede = { k (0..1 crescimento), rios: [{ pts: [[z,u],...], larg, y }] , alpha }
function redeRios(C, t, rede) {
  for (const rio of rede.rios) {
    const n = rio.pts.length, m = Math.max(2, Math.ceil(n * clamp01((rede.k - (rio.atraso || 0)) / (1 - (rio.atraso || 0)))));
    if (rede.k <= (rio.atraso || 0)) continue;
    const P = rio.pts.slice(0, m).map(([z, u]) => A(z, u));
    const tr = []; for (let i = 0; i < P.length; i++) { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], dx = b[0] - a[0], dz = b[2] - a[2], l = Math.hypot(dx, dz) || 1; tr.push([P[i][0], P[i][2], dz / l, -dx / l]); }
    fita(C, tr, 0, rio.larg * 2.6, COR_AGUA.map(c => c * .35), rio.y || 0, .45 * (rede.alpha ?? 1));
    fita(C, tr, 0, rio.larg, COR_AGUA, (rio.y || 0) + .1, rede.alpha ?? 1);
  }
}
const clamp01 = x => Math.max(0, Math.min(1, x));
// gera uma rede de afluentes (ilustrativa) que sobem os vales laterais até o rio principal (u = 0)
export function gerarRede(seed = 4, { z0 = -100, z1 = 1200, n = 26, alcance = 280 } = {}) {
  const R = mulberry(seed), rios = [{ pts: Array.from({ length: 160 }, (_, i) => [lerp(z0, z1, i / 159), 0]), larg: 6, atraso: 0 }];
  for (let i = 0; i < n; i++) {
    const zb = lerp(z0, z1, (i + R() * .8) / n), lado = R() < .5 ? -1 : 1, pts = [], comp = alcance * (.4 + R() * .6), ang = .15 + R() * 1.3, ond = R() * 6, fq = .15 + R() * .25;
    let z = zb, u = 0;
    for (let k = 0; k < 40; k++) { pts.push([z, u]); const step = comp / 40, a = ang + .5 * Math.sin(k * fq + ond); u += lado * step * Math.cos(a * .7); z += step * Math.sin(a) + (R() - .5) * 2; }
    rios.push({ pts, larg: 2.2 + R() * 1.6, atraso: .05 + R() * .55 });
    if (R() < .6) { const j = 10 + (R() * 20 | 0), [zz, uu] = pts[j], br = []; let z2 = zz, u2 = uu;
      for (let k = 0; k < 18; k++) { br.push([z2, u2]); u2 += lado * 3.2; z2 -= 3 + R() * 2; }
      rios.push({ pts: br, larg: 1.5, atraso: .3 + R() * .6 }); }
  }
  return rios;
}
const dist = (c, x, y, z) => Math.hypot(x - c[0], y - c[1], z - c[2]);
