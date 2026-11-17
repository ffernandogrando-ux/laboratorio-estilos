// Cidade procedural determinística de "maquete noturna": uma avenida em curva suave (trinário: canaleta do ônibus no meio,
// pistas lentas dos lados, vias rápidas uma quadra para fora), quadras de prédios de alturas variadas, ônibus articulados,
// carros e pontos de gente. Tudo é função pura de t (posições = s0 + v·t, com volta).
// Ideias (MIT, © 2026 Lemomo/LemoLab): cidade de blocos de lemo-opuscar styles/white-model; faixas e trânsito andando de
// styles/tilt-shift (traffic.js). Código reescrito para canvas 2D.
import { mulberry, lerp, seg, ss, eio } from '/motor/lib.js';
import { g, prisma, fita, fog, hex, fillWorld, toCam, scr } from './proj.js';

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
export function gerarCidade(seed = 7) {
  const R = mulberry(seed), predios = [];
  const faixas = [[16, 40], [-40, -16], [62, 110], [-110, -62], [120, 175], [-175, -120], [185, 240], [-240, -185]];   // faixas laterais de quadras (u)
  for (const [u0, u1] of faixas) {
    let z = Z0;
    while (z < Z1) {
      const quadra = 70 + R() * 50;                       // comprimento da quadra; rua transversal de 12 m entre elas
      let zz = z;
      while (zz < z + quadra - 8) {
        const comp = 10 + R() * 18, dz = Math.min(comp, z + quadra - zz);
        // 1 ou 2 prédios na profundidade da faixa
        const parte = R() < .55 ? 1 : 2, larg = (u1 - u0) / parte;
        for (let k = 0; k < parte; k++) {
          const uc = u0 + larg * (k + .5) + (R() - .5) * 4, w = larg - 3 - R() * 6;
          const lonje = Math.min(Math.abs(uc), 150) / 150;
          const h = 7 + Math.pow(R(), 1.6) * (40 + 30 * lonje) + (R() < .07 ? 35 : 0);
          const zc = zz + dz / 2, p = A(zc, uc);
          predios.push({ x: p[0], z: p[2], w: Math.max(6, w), d: dz - 3, h, yaw: yawAt(zc), u: uc, zc, alt: R() });
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
  const zc = cam[2], za = Math.max(Z0, zc - 260), zb = Math.min(Z1, zc + 900);
  const pts = curva(za, zb);
  // chão: grande fita escura
  fita(C, pts, 0, 520, COR.chao);
  // ruas: avenida, vias rápidas
  fita(C, pts, 0, 2 * SEC.calc, COR.calcada);
  fita(C, pts, 0, 2 * SEC.linhaL + 1, COR.rua);
  for (const sd of [-1, 1]) fita(C, pts, sd * SEC.rapida, SEC.rapLarg + 3, COR.rua);
  // ruas transversais (a cada quadra, aproximadas) — faixas escuras finas
  // linhas coloridas (grossas, como na referência)
  const h = o.destaque || {};
  const brilho = (rgb, k) => k ? rgb.map(c => Math.min(255, c + 60 * k)) : rgb;
  for (const sd of [-1, 1]) {
    fita(C, pts, sd * SEC.linhaV, .7 + .3 * (h.canaleta || 0), brilho(COR.vermelho, h.canaleta), .02);
    fita(C, pts, sd * SEC.linhaL, .6 + .3 * (h.lenta || 0), brilho(COR.laranja, h.lenta), .02);
    fita(C, pts, sd * (SEC.rapida + SEC.rapLarg / 2 + .6), 1.1 + .4 * (h.rapida || 0), brilho(COR.menta, h.rapida), .02);
    fita(C, pts, sd * (SEC.rapida - SEC.rapLarg / 2 - .3), .25, COR.branco, .02, .7);
  }
  // tracejado branco nas vias rápidas
  const dash = [];
  for (let z = Math.ceil(za / 9) * 9; z < zb; z += 9) dash.push(z);
  for (const sd of [-1, 1]) for (const o2 of [-2.25, 2.25]) for (const z of dash) {
    const u = sd * SEC.rapida + o2, d = Math.hypot(A(z)[0] - cam[0], z - cam[2]);
    if (d > 520) continue;
    fillWorld(C, [A(z, u - .12, .03), A(z, u + .12, .03), A(z + 3, u + .12, .03), A(z + 3, u - .12, .03)], fog(C, COR.branco.map(c => c * .8), d));
  }
  // itens com volume, ordenados de trás para a frente
  const itens = [];
  const perto = (x, z, lim) => { const dx = x - cam[0], dz = z - cam[2]; return dx * dx + dz * dz < lim * lim; };
  const dentro = (x, z) => { const q = toCam(C, [x, 0, z]); return q[2] > -40; };
  for (const p of o.predios) if (p.zc > za - 40 && p.zc < zb && perto(p.x, p.z, 900) && dentro(p.x, p.z)) {
    const top = p.alt > .93 && o.amarelo ? COR.amarelo : COR.topo;
    itens.push({ d: dist(cam, p.x, p.h * .3, p.z), f: () => prisma(C, { ...p, top, s1: COR.lado1, s2: COR.lado2 }) });
  }
  for (const v of o.veiculos) {
    const z = posZ(v, t); if (z < za || z > zb) continue;
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
}
const dist = (c, x, y, z) => Math.hypot(x - c[0], y - c[1], z - c[2]);
