// Projetor 3D→2D em canvas (3D falso, sem WebGL): câmera com posição/alvo/fov, recorte no plano próximo,
// faces de cor chapada ordenadas por profundidade (pintor) e névoa escura pela distância.
// Ideia do visual "maquete" (blocos chapados, topo mais claro) de lemo-opuscar styles/white-model (MIT, © 2026 Lemomo/LemoLab).
export const W = 1080, H = 1920;
export let g = null;
export const BG = [21, 23, 28];                       // #15171c
export function init(canvas) { g = canvas.getContext('2d'); return g; }

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

// câmera: pos e alvo em metros (x direita, y para cima, z para a frente); fov vertical em graus
export function camera(pos, alvo, fov = 50, roll = 0) {
  const f = norm(sub(alvo, pos)); let r = norm(cross(f, [0, 1, 0])); let u = cross(r, f);
  if (roll) { const c = Math.cos(roll), s = Math.sin(roll); const r2 = [r[0] * c + u[0] * s, r[1] * c + u[1] * s, r[2] * c + u[2] * s]; u = cross(r2, f); r = r2; }
  return { pos, f, r, u, F: (H / 2) / Math.tan(fov * Math.PI / 360), near: .6, far: 900, fogA: 140, fogB: 620 };
}
export const toCam = (C, p) => { const v = sub(p, C.pos); return [dot(v, C.r), dot(v, C.u), dot(v, C.f)]; };
export const scr = (C, q) => [W / 2 + q[0] * C.F / q[2], H / 2 - q[1] * C.F / q[2]];
// ponto 3D → [x, y, z] na tela (null se atrás da câmera)
export function project(C, p) { const q = toCam(C, p); if (q[2] < C.near) return null; const s = scr(C, q); return [s[0], s[1], q[2]]; }

// recorte do polígono (em coordenadas de câmera) no plano próximo
function clipNear(C, P) {
  const out = [], n = C.near;
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length], ia = a[2] >= n, ib = b[2] >= n;
    if (ia) out.push(a);
    if (ia !== ib) { const k = (n - a[2]) / (b[2] - a[2]); out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, n]); }
  }
  return out;
}
// cor com névoa: mistura com o fundo pela distância
export function fog(C, rgb, d, extra = 0) {
  let k = Math.min(1, Math.max(0, (d - C.fogA) / (C.fogB - C.fogA))); k = k * k * (3 - 2 * k); k = Math.min(1, k + extra);
  return `rgb(${(rgb[0] + (BG[0] - rgb[0]) * k) | 0},${(rgb[1] + (BG[1] - rgb[1]) * k) | 0},${(rgb[2] + (BG[2] - rgb[2]) * k) | 0})`;
}
export const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

// polígono de pontos já em coordenadas de câmera → preenchido (com traço da mesma cor para fechar emendas)
export function fillCam(C, Q, cor, alpha = 1) {
  if (Q.every(q => q[2] < C.near) || Q.every(q => q[2] > C.far)) return;
  const P = clipNear(C, Q); if (P.length < 3) return;
  g.beginPath();
  for (let i = 0; i < P.length; i++) { const s = scr(C, P[i]); i ? g.lineTo(s[0], s[1]) : g.moveTo(s[0], s[1]); }
  g.closePath(); g.globalAlpha = alpha; g.fillStyle = cor; g.fill(); g.strokeStyle = cor; g.lineWidth = 1; g.stroke(); g.globalAlpha = 1;
}
export function fillWorld(C, pts, cor, alpha = 1) { fillCam(C, pts.map(p => toCam(C, p)), cor, alpha); }

// prisma de base retangular girado (yaw) — 3 tons chapados: topo, lado "da luz", lado da sombra
// b = { x, z, y0, w (largura, eixo lateral), d (comprimento, eixo da rua), h, yaw, top, s1, s2, deco(C, cantos) }
export function prisma(C, b) {
  const c = Math.cos(b.yaw), s = Math.sin(b.yaw), hw = b.w / 2, hd = b.d / 2, y0 = b.y0 || 0, y1 = y0 + b.h;
  // eixo lateral (lx) e eixo da rua (lz) girados
  const P = (a, e, y) => [b.x + a * c + e * s, y, b.z - a * s + e * c];
  const base = [P(-hw, -hd, y0), P(hw, -hd, y0), P(hw, hd, y0), P(-hw, hd, y0)];
  const topo = [P(-hw, -hd, y1), P(hw, -hd, y1), P(hw, hd, y1), P(-hw, hd, y1)];
  const qb = base.map(p => toCam(C, p)), qt = topo.map(p => toCam(C, p));
  const d = Math.hypot(b.x - C.pos[0], (y0 + y1) / 2 - C.pos[1], b.z - C.pos[2]);
  const cam = C.pos;
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4, a = base[i], bb = base[j];
    const nx = (bb[2] - a[2]), nz = -(bb[0] - a[0]);          // normal para fora (ordem anti-horária vista de cima)
    const mx = (a[0] + bb[0]) / 2, mz = (a[2] + bb[2]) / 2;
    if (nx * (cam[0] - mx) + nz * (cam[2] - mz) <= 0) continue;
    const luz = (nx * .55 + nz * -.83) / (Math.hypot(nx, nz) || 1); // luz difusa fixa
    const rgb = luz > 0 ? b.s1 : b.s2;
    fillCam(C, [qb[i], qb[j], qt[j], qt[i]], fog(C, rgb, d));
  }
  if (cam[1] > y1) fillCam(C, qt, fog(C, b.top, d));
  if (b.deco) b.deco(C, topo, d);
}

// "fita" no chão: centro (u0) e largura ao longo de uma curva amostrada; pts = [[x,z,nx,nz],...]
export function fita(C, pts, u, larg, cor, y = 0, alpha = 1) {
  const L = [], R = [];
  for (const p of pts) { L.push(toCam(C, [p[0] + p[2] * (u - larg / 2), y, p[1] + p[3] * (u - larg / 2)])); R.push(toCam(C, [p[0] + p[2] * (u + larg / 2), y, p[1] + p[3] * (u + larg / 2)])); }
  // em pedaços, para o recorte no plano próximo continuar correto em curvas longas
  const step = 6;
  for (let i = 0; i < pts.length - 1; i += step) {
    const j = Math.min(pts.length - 1, i + step), Q = [];
    for (let k = i; k <= j; k++) Q.push(L[k]);
    for (let k = j; k >= i; k--) Q.push(R[k]);
    let dmin = 1e9; for (const q of Q) dmin = Math.min(dmin, q[2]);
    fillCam(C, Q, fog(C, cor, Math.max(0, dmin)), alpha);
  }
}
