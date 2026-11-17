// adaptado de lemo-opuscar/styles/stick-explainer (MIT, Lemomo/LemoLab)
// boneco.js: o boneco de palito do estilo ("mangueira de espessura igual"). Esqueleto (quadril, coluna curva, braços de
// dois ossos, pernas com IK, cabeça que só gira em volta do pescoço), cada membro é UMA curva quadrática com a junta como
// ponto de controle, molas amortecidas por parâmetro e poses prontas: andar, pegar, levar à boca, susto/pulo.
// Personagem nosso: o "Palito" (cabeça redonda vazia; no susto, e só nele, ganha dois olhos arregalados).
import { clamp, lerp, ss, seg } from '/motor/lib.js';
import { g, C, traco } from './papel.js';

// unidades: altura do boneco = 1. Ângulo a → direção (sin a, cos a): 0 aponta para baixo, +π/2 para a direita.
export const GEO = { coxa: .215, canela: .215, quadril: .42, coluna: .285, ombro: .065, braco: .18, ante: .155, cabeca: .112, base: .09 };
const dirv = a => [Math.sin(a), Math.cos(a)];
export function rest() {
  return { hx: 0, hy: 0, lean: 0, bend: 0, head: 0, la: -.56, lb: .24, ra: .56, rb: -.24, lfx: 0, lfy: 0, rfx: 0, rfy: 0,
    hdx: 0, hdy: 0, mdx: 0, mdy: 0, mdw: 0, olhos: 0 };   // md*: alvo da mão direita (unid. de altura, a partir dos pés) e peso do IK
}
export const KEYS = Object.keys(rest());

function ik(Hq, F, L1, L2, lado) {      // perna: quadril → pé, joelho para o lado pedido
  let dx = F[0] - Hq[0], dy = F[1] - Hq[1], d = Math.hypot(dx, dy); const m = (L1 + L2) * .9995;
  if (d > m) { F = [Hq[0] + dx / d * m, Hq[1] + dy / d * m]; dx = F[0] - Hq[0]; dy = F[1] - Hq[1]; d = m; }
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const px = Hq[0] + a * dx / d, py = Hq[1] + a * dy / d; let nx = -dy / d, ny = dx / d;
  if (nx * lado < 0) { nx = -nx; ny = -ny; }
  return [[px + nx * h, py + ny * h], F];
}
export function cotovelo(Sh, Hn, L1, L2, baixo = [0, 1]) {   // braço: cotovelo virado para "baixo"
  let dx = Hn[0] - Sh[0], dy = Hn[1] - Sh[1], d = Math.hypot(dx, dy) || 1e-6;
  if (d >= L1 + L2) return [Sh[0] + dx * L1 / (L1 + L2), Sh[1] + dy * L1 / (L1 + L2)];
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  let nx = -dy / d, ny = dx / d; if (nx * baixo[0] + ny * baixo[1] < 0) { nx = -nx; ny = -ny; }
  return [Sh[0] + a * dx / d + nx * h, Sh[1] + a * dy / d + ny * h];
}

// todas as juntas em pixels do mundo. f = {x, y (pés), S (altura px), perfil (1 = virado à direita, -1 à esquerda, 0 = de frente)}
export function juntas(f, p) {
  const S = f.S, bx = f.x, gy = f.y, prof = f.perfil || 0;
  const Hp = [bx + p.hx * S, gy - (GEO.quadril - p.hy) * S];
  const sd = dirv(Math.PI - p.lean);
  const N = [Hp[0] + sd[0] * GEO.coluna * S, Hp[1] + sd[1] * GEO.coluna * S];
  const mid = [(Hp[0] + N[0]) / 2, (Hp[1] + N[1]) / 2], perp = [-sd[1], sd[0]];
  const Cc = [mid[0] + perp[0] * p.bend * S, mid[1] + perp[1] * p.bend * S];
  const u = 1 - GEO.ombro / GEO.coluna;
  const Sh = [(1 - u) ** 2 * Hp[0] + 2 * (1 - u) * u * Cc[0] + u * u * N[0], (1 - u) ** 2 * Hp[1] + 2 * (1 - u) * u * Cc[1] + u * u * N[1]];
  const lag = clamp(p.hdx / GEO.cabeca * .9, -.35, .35);          // a cabeça atrasa girando, nunca solta do pescoço
  const hd = dirv(Math.PI - (p.lean + p.head + lag)), hr = GEO.cabeca * S;
  const Hd = [N[0] + hd[0] * hr, N[1] + hd[1] * hr];
  const L1 = GEO.braco * S, L2 = GEO.ante * S;
  const braco = (a, b) => { const e = dirv(a), E = [Sh[0] + e[0] * L1, Sh[1] + e[1] * L1]; const w = dirv(a + b); return [E, [E[0] + w[0] * L2, E[1] + w[1] * L2]]; };
  let aR = braco(p.ra, p.rb);
  if (p.mdw > .001) {                                               // mão direita indo a um alvo (pegar, levar à boca)
    const T = [bx + p.mdx * S, gy + p.mdy * S], Hn = [lerp(aR[1][0], T[0], clamp(p.mdw)), lerp(aR[1][1], T[1], clamp(p.mdw))];
    aR = [cotovelo(Sh, Hn, L1, L2, [-.3 * (prof || 1), 1]), Hn];
  }
  const st = prof ? .03 : GEO.base;
  const pL = [bx + (-st + p.lfx) * S, gy - p.lfy * S], pR = [bx + (st + p.rfx) * S, gy - p.rfy * S];
  const kL = prof ? prof : -1, kR = prof ? prof : 1;
  return { Hp, N, Cc, Sh, Hd, hr, aL: braco(p.la, p.lb), aR,
    lL: ik(Hp, pL, GEO.coxa * S, GEO.canela * S, kL), lR: ik(Hp, pR, GEO.coxa * S, GEO.canela * S, kR) };
}

// ponto de controle da junta: k=0 só curva para a junta, k=1 passa por ela. k=.8 = mangueira macia
function ctrl(A, B, E, k) { const m = [(A[0] + E[0]) / 2, (A[1] + E[1]) / 2]; return [B[0] + (B[0] - m[0]) * k, B[1] + (B[1] - m[1]) * k]; }

// desenha o boneco. o = {cor, recheio (cabeça), lw (px p/ 380 px de altura), perfil}
export function boneco(f, p, o = {}) {
  const S = f.S, j = juntas(f, p), cor = o.cor || C.tinta, rech = o.recheio || C.papel, k = .8;
  const lw = Math.max(3, (o.lw ?? 8) * clamp(Math.sqrt(S / 380), .6, 1.05)) * traco();
  g.save(); g.strokeStyle = cor; g.fillStyle = cor; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = lw;
  g.beginPath();
  for (const [K, F] of [j.lL, j.lR]) { const Q = ctrl(j.Hp, K, F, k); g.moveTo(j.Hp[0], j.Hp[1]); g.quadraticCurveTo(Q[0], Q[1], F[0], F[1]); }
  g.moveTo(j.Hp[0], j.Hp[1]); g.quadraticCurveTo(j.Cc[0], j.Cc[1], j.N[0], j.N[1]);
  for (const [El, Hn] of [j.aL, j.aR]) { const Q = ctrl(j.Sh, El, Hn, k); g.moveTo(j.Sh[0], j.Sh[1]); g.quadraticCurveTo(Q[0], Q[1], Hn[0], Hn[1]); }
  g.stroke();
  g.beginPath(); g.arc(j.Hd[0], j.Hd[1], j.hr, 0, Math.PI * 2); g.fillStyle = rech; g.fill();
  g.lineWidth = lw * .94; g.stroke();
  if (p.olhos > .02) olhosSusto(j, f.perfil || 1, clamp(p.olhos), lw);
  g.restore();
  return j;
}
// o único rosto que o Palito tem: dois olhos redondos arregalados + três risquinhos de espanto em volta da cabeça
function olhosSusto(j, lado, a, lw) {
  const r = j.hr, cx = j.Hd[0] + lado * r * .3, cy = j.Hd[1] - r * .12;
  g.save(); g.lineWidth = lw * .55;
  for (const [dx, rr] of [[-.24, .26], [.3, .3]]) {
    const ox = cx + lado * dx * r, R = rr * r * (.4 + .6 * a);
    g.beginPath(); g.arc(ox, cy, R, 0, Math.PI * 2); g.fillStyle = C.papel; g.fill(); g.stroke();
    g.beginPath(); g.arc(ox + lado * R * .25, cy - R * .1, R * .32, 0, Math.PI * 2); g.fillStyle = C.tinta; g.fill();
  }
  g.lineWidth = lw * .7;
  for (const ang of [-2.2, -1.57, -.95]) {
    const a0 = ang + lado * .15, r0 = r * 1.35, r1 = r * (1.35 + .45 * a);
    g.beginPath(); g.moveTo(j.Hd[0] + Math.cos(a0) * r0, j.Hd[1] + Math.sin(a0) * r0); g.lineTo(j.Hd[0] + Math.cos(a0) * r1, j.Hd[1] + Math.sin(a0) * r1); g.stroke();
  }
  g.restore();
}

// molas amortecidas (ω, ζ): braço rápido, antebraço mais lento, cabeça a mais solta → o antebraço chega atrasado e passa um pouco
export const MOLA = { hx: [20, .8], hy: [24, .62], lean: [13, .6], bend: [12, .55], head: [9, .42], la: [13, .58], ra: [13, .58], lb: [9.5, .46], rb: [9.5, .46],
  lfx: [30, .85], lfy: [30, .85], rfx: [30, .85], rfy: [30, .85], mdx: [15, .62], mdy: [15, .62], mdw: [16, .8], olhos: [22, .5] };
const MOLA_CABECA = [16, .38];
// integra as molas em passo fixo desde t0 (o quadro continua função pura de t: a simulação é a mesma em qualquer aba)
export function simular(alvo, t0, t1) {
  const dt = 1 / 1200, cada = 5, fr = [], p = { ...alvo(t0) }, v = {}; for (const k in p) v[k] = 0;
  const cabeca = q => { const hy = GEO.quadril - q.hy; return [q.hx + Math.sin(q.lean) * GEO.coluna + Math.sin(q.lean + q.head) * GEO.cabeca, hy + Math.cos(q.lean) * GEO.coluna]; };
  let hp = null; const hv = [0, 0]; let n = 0;
  for (let t = t0; t <= t1 + 1e-9; t += dt, n++) {
    if (n % cada === 0) fr.push({ ...p });
    const a = alvo(t);
    for (const k in MOLA) { const [w, z] = MOLA[k]; const ac = w * w * (a[k] - p[k]) - 2 * z * w * v[k]; v[k] += ac * dt; p[k] += v[k] * dt; }
    const R = cabeca(p); if (!hp) hp = [...R];
    for (let q = 0; q < 2; q++) { const [w, z] = MOLA_CABECA, ac = w * w * (R[q] - hp[q]) - 2 * z * w * hv[q]; hv[q] += ac * dt; hp[q] += hv[q] * dt; }
    p.hdx = clamp(hp[0] - R[0], -.03, .03); p.hdy = clamp(hp[1] - R[1], -.03, .03);
  }
  return t => { const f = (t - t0) * 240, i = clamp(Math.floor(f), 0, fr.length - 2), u = clamp(f - i), A = fr[i], B = fr[i + 1], q = {};
    for (const k of KEYS) q[k] = lerp(A[k], B[k], u); return q; };
}

// ---------- poses-alvo (o que as molas perseguem) ----------
export function respira(t, fase = 0) {     // parado nunca fica parado: respiração e balanço leve
  const p = rest(); p.hx += .004 * Math.sin(t * 1.25 + fase); p.lean += .012 * Math.sin(t * 1.05 + fase);
  p.hy += .004 * (.5 + .5 * Math.sin(t * 2.1 + fase)); p.la -= .03 * Math.sin(t * 1.5 + fase); p.ra += .03 * Math.sin(t * 1.5 + fase + .7);
  p.head += .04 * Math.sin(t * .7 + fase); return p;
}
export function anda(ph, k = 1, lado = 1) {  // ciclo de passada (fase em radianos), de perfil
  const p = rest(), A = .16 * k;
  p.lfx = A * Math.sin(ph); p.rfx = -A * Math.sin(ph);
  p.lfy = .05 * k * Math.max(0, Math.cos(ph)); p.rfy = .05 * k * Math.max(0, -Math.cos(ph));
  p.hy = .012 + .014 * Math.abs(Math.cos(ph)); p.lean = .07 * k * lado; p.bend = -.01 * lado; p.head = .04 * lado;
  p.la = -.75 * k * Math.sin(ph); p.lb = .55 * lado + .25 * Math.sin(ph); p.ra = .75 * k * Math.sin(ph); p.rb = .55 * lado - .25 * Math.sin(ph);
  return p;
}
export function pega(p, alvo, w = 1) { p.mdx = alvo[0]; p.mdy = alvo[1]; p.mdw = w; return p; }   // alvo em unid. de altura, a partir dos pés
export function levaBoca(p, u, lado = 1) {   // u 0→1: mão sobe até a boca, cabeça inclina para trás (preparação do gole)
  p.mdx = lerp(p.mdx, .17 * lado, u); p.mdy = lerp(p.mdy, -.83, u); p.mdw = 1;
  p.head -= .2 * lado * u; p.lean -= .04 * lado * u; p.bend += .015 * lado * u; return p;
}
// susto/pulo: u = tempo desde o susto (s). Agacha (antecipação), salta com braço livre para o alto e olhos arregalados
export function susto(p, u, lado = 1) {
  const agacha = ss(seg(u, 0, .08)) * (1 - ss(seg(u, .08, .16)));
  p.hy += .05 * agacha;
  if (u > .08) {
    const no_ar = Math.sin(Math.PI * clamp((u - .08) / .5));
    p.lfy = .11 * no_ar; p.rfy = .05 * no_ar; p.lfx = .03 * lado * no_ar; p.rfx = -.05 * lado * no_ar;
    p.la = -2.0 * lado; p.lb = -.9 * lado; p.lean = -.14 * lado; p.head = -.18 * lado; p.bend = .03 * lado;
    p.mdx += -.05 * lado; p.mdy -= .05; p.olhos = 1;
  }
  return p;
}
// altura do pulo (px do mundo / S) para somar à posição dos pés
export const alturaPulo = u => u > .08 ? .26 * Math.sin(Math.PI * clamp((u - .08) / .5)) : 0;
