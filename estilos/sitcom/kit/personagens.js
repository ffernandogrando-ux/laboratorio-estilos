// personagens.js — elenco ORIGINAL do canal (técnica de desenho do estilo "sitcom de desenho": traço grosso que ferve,
// cor chapada, sombra recortada, olho grande com pupila pequena). Origem nos pés, y para baixo.
import { clamp, lerp, hash, TAU } from '/motor/lib.js';
import { INK, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot } from './toon.js';

export const COR = {
  pele: '#c98b5e', peleS: '#a86d45', cabelo: '#2b1d1a', cabeloS: '#1a110f', blusa: '#e8a33d', blusaS: '#c4822a',
  avental: '#2f8f83', aventalS: '#216a61', calca: '#3d4e7a', calcaS: '#2c3a5e', tenis: '#f2f0ea', tenisS: '#cfcac0',
  boca: '#4a1a2a', lingua: '#e8637a', branco: '#ffffff', brinco: '#f2c14e',
  pano: '#f6f1e6', panoX: '#d9473b', mancha: '#8a7a4a', prato: '#fbfaf6', pratoS: '#d8d8e2', pratoB: '#4c7dd1',
};

// —— rosto ——
export function olho(cx, cy, rx, ry, { lid = 0, olhar = [0, 0], pupila = 5, fechado = false, tremor = 0 } = {}) {
  if (fechado) { stroke(arc(cx, cy + ry * .15, rx * .8, ry * .45, Math.PI * .1, Math.PI * .9, 14), 6); return; }
  shape(ell(cx, cy, rx, ry, 36), {
    fill: COR.branco, lw: 6, shade: () => {
      dot(cx + olhar[0] * rx * .5 + tremor, cy + olhar[1] * ry * .45, pupila);
      if (lid > 0) {
        const yl = cy - ry + lid * 2 * ry;
        fillOnly([[cx - rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, yl], [cx - rx * 1.3, yl]], COR.pele, { boil: .5 });
        stroke([[cx - rx * 1.2, yl], [cx + rx * 1.2, yl]], 6);
      }
    }
  });
}
export function boca(cx, cy, mw, { o = 0, sm = 0, torto = 0, lingua = false } = {}) {
  const hw = mw / 2, k = mw * .24, le = [cx - hw, cy - sm * k + torto * k], ld = [cx + hw, cy - sm * k - torto * k];
  if (o < .07) { stroke(quad(le, [cx, cy + sm * k * 1.3], ld, 12), 6); return; }
  const h = o * mw * .6;
  const cima = quad(le, [cx, cy - h * .2 + sm * k * .4], ld, 12), baixo = quad(ld, [cx, cy + h + sm * k * .6], le, 14);
  shape([...cima, ...baixo], {
    fill: COR.boca, lw: 6, shade: () => {
      if (o > .25) fillOnly(rect(cx - hw * 1.2, cy - h, hw * 2.4, h * .38), COR.branco, { boil: .3 });
      fillOnly(ell(cx + hw * .1, cy + h * .95, hw * .55, h * .42, 20), COR.lingua, { boil: .3 });
    }
  });
  if (lingua) shape(spline([[cx - hw * .3, cy + h * .7], [cx + hw * .35, cy + h * .7], [cx + hw * .3, cy + h * 1.5], [cx - hw * .2, cy + h * 1.6]]), { fill: COR.lingua, lw: 6 });
}
export function mao(x, y, ang, r = 24, { fechada = false } = {}) {
  push(); translate(x, y); rotate(ang);
  const p = fechada ? spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]])
    : spline([[-r * .5, -r * .85], [r * .5, -r * 1.05], [r * 1.35, -r * .75], [r * 1.05, -r * .3], [r * 1.5, -r * .1], [r * 1.1, r * .3], [r * 1.35, r * .7], [r * .6, r * .95], [-r * .6, r * .8], [-r * .95, 0]]);
  shape(p, { fill: COR.pele, lw: 6 }); pop();
}
const gota = (x, y, s = 1) => shape(spline([[x, y - 18 * s], [x + 10 * s, y + 4 * s], [x, y + 13 * s], [x - 10 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });

// —— a protagonista: BIA (30 e poucos, coque crespo, blusa mostarda, avental verde-petróleo) ——
// P: { maoD:[x,y], maoE:[x,y], olhar, lid, o (boca), sm, torto, lingua, sobr (sobrancelha: + brava/nojo, − surpresa),
//      respira, tremor, suor, inclina, fechados }
export function bia(P = {}) {
  const resp = 1 + (P.respira || 0) * .012, inc = P.inclina || 0;
  push(); scale(P.espelho ? -1 : 1, resp);   // espelho: virada para a esquerda
  // pernas e tênis
  const pes = P.pes || [[0, 0], [0, 0]], bob = P.bob || 0;
  [[-38, 1], [38, -1]].forEach(([dx, s], k) => {
    const [fx, fy] = pes[k];
    shape(noodle([dx, -330 + bob], [dx + s * 4 + fx, -40 + fy], s * 6 + fx * .2, 64, 54), { fill: COR.calca, shade: () => fillOnly(rect(dx + s * 6, -330, 40, 300), COR.calcaS, { boil: .4 }) });
    shape(rr(dx - 46 + s * 8 + fx, -52 + fy, 92, 52, 22), { fill: COR.tenis, shade: () => fillOnly(rect(dx - 50 + fx, -22 + fy, 100, 30), COR.tenisS, { boil: .4 }) });
  });
  push(); translate(0, -320 + bob); rotate(inc);
  // tronco: blusa + avental
  const tronco = spline([[-118, 10], [-104, -190], [-66, -300], [0, -318], [66, -300], [104, -190], [118, 10]]);
  shape(tronco, { fill: COR.blusa, shade: () => fillOnly(rect(40, -320, 120, 340), COR.blusaS, { boil: .4 }) });
  shape(spline([[-92, 20], [-84, -170], [-50, -230], [50, -230], [84, -170], [92, 20]]), { fill: COR.avental, shade: () => fillOnly(rect(36, -240, 80, 270), COR.aventalS, { boil: .4 }) });
  shape(rr(-40, -120, 80, 56, 12), { fill: COR.aventalS, lw: 5 });                               // bolso
  stroke([[-50, -230], [-30, -300]], 6); stroke([[50, -230], [30, -300]], 6);                    // alças
  // braços (macarrão) até as mãos
  const mD = P.maoD || [150, -60], mE = P.maoE || [-150, -60];
  shape(noodle([92, -270], mD, -30, 46, 38), { fill: COR.blusa, shade: () => fillOnly(rect(100, -280, 200, 300), COR.blusaS, { boil: .4 }) });
  shape(noodle([-92, -270], mE, 30, 46, 38), { fill: COR.blusa });
  mao(mD[0], mD[1], P.angD ?? .3, 26, { fechada: P.fechaD }); mao(mE[0], mE[1], P.angE ?? Math.PI - .3, 26, { fechada: P.fechaE });
  // pescoço e cabeça
  shape(rr(-26, -350, 52, 50, 16), { fill: COR.pele, shade: () => fillOnly(rect(4, -350, 30, 50), COR.peleS, { boil: .4 }) });
  push(); translate(0, -470); rotate((P.cabeca || 0));
  shape(ell(0, -105, 96, 64), { fill: COR.cabelo, shade: () => fillOnly(ell(30, -95, 60, 50), COR.cabeloS, { boil: .4 }) });         // coque
  shape(spline([[-104, 40], [-112, -40], [-60, -112], [40, -118], [104, -60], [110, 30], [84, 120], [0, 150], [-84, 120]]), {   // rosto
    fill: COR.pele, shade: () => fillOnly(ell(70, 40, 60, 110), COR.peleS, { boil: .4 })
  });
  shape(spline([[-112, 10], [-118, -60], [-70, -118], [10, -130], [90, -104], [118, -40], [108, 0], [70, -62], [-10, -84], [-80, -60]]), { fill: COR.cabelo });   // franja crespa
  for (const [x, y] of [[-112, 30], [112, 22]]) shape(ell(x, y, 22, 30), { fill: COR.cabelo });                                   // cachos laterais
  shape(ell(-108, 82, 12, 12), { fill: COR.brinco, lw: 5 });
  const sob = P.sobr || 0;
  stroke([[-70, -44 + sob * 10], [-24, -54 - sob * 6]], 8); stroke([[24, -54 - sob * 6], [70, -44 + sob * 10]], 8);
  olho(-44, -6, 34, 42, { lid: P.lid || 0, olhar: P.olhar || [0, 0], fechado: P.fechados || P.piscaE, tremor: P.tremor || 0 });
  olho(44, -6, 34, 42, { lid: P.lid || 0, olhar: P.olhar || [0, 0], fechado: P.fechados, tremor: -(P.tremor || 0) });
  stroke(quad([4, 30], [16, 52], [-6, 56]), 6);                                                       // nariz
  boca(0, 88, 70, { o: P.o || 0, sm: P.sm ?? .6, torto: P.torto || 0, lingua: P.lingua });
  if (P.suor) gota(108, -40, P.suor);
  pop(); pop(); pop();
}

// —— objetos ——
export function pano(x, y, w, h, t, { sujo = 0, ang = 0, balanço = 1, pendurado = false } = {}) {
  push(); translate(x, y); rotate(ang + Math.sin(t * 3.1) * .03 * balanço);
  const onda = i => Math.sin(t * 4 + i) * 6 * balanço;
  const P = pendurado
    ? spline([[-w / 2, 0], [w / 2, 0], [w / 2 + onda(1), h * .5], [w / 2 - 6 + onda(2), h], [0, h + onda(3)], [-w / 2 + 6 + onda(4), h], [-w / 2 + onda(5), h * .5]])
    : spline([[-w / 2, -h / 2], [w / 2, -h / 2 + onda(1)], [w / 2 + onda(2), h / 2], [-w / 2, h / 2 + onda(3)]]);
  shape(P, {
    fill: COR.pano, shade: () => {
      const y0 = pendurado ? 0 : -h / 2;
      for (const yy of [.18, .26, .74, .82]) fillOnly(rect(-w, y0 + h * yy, w * 2, h * .045), COR.panoX, { boil: .3 });   // listras
      for (let i = 0; i < Math.round(sujo * 9); i++)
        fillOnly(ell((hash(i * 3.1) - .5) * w * .8, y0 + hash(i * 7.7) * h, 14 + hash(i) * 26, 10 + hash(i * 2) * 18), COR.mancha, { boil: .5, alpha: .55 });
    }
  });
  pop();
}
export function prato(x, y, r, ang = 0) {
  push(); translate(x, y); rotate(ang);
  shape(ell(0, 0, r, r * .92), { fill: COR.prato, shade: () => fillOnly(ell(r * .35, r * .3, r * .7, r * .6), COR.pratoS, { boil: .3 }) });
  stroke(ell(0, 0, r * .72, r * .66, 40), 4, { line: COR.pratoB });
  pop();
}

// —— bichinhos (bactérias e fungos): nojentos e fofos, sem fala, só efeitos sonoros ——
const CORES_BICHO = [['#7fc96b', '#5aa54a'], ['#b07fd6', '#8a5bb5'], ['#e8c547', '#c4a22a'], ['#6fb8c9', '#4a93a5']];
export function bicho(x, y, s, t, i, { aparece = 1, olhar = [0, 0], tchau = 0 } = {}) {
  if (aparece <= 0) return;
  const [c, cs] = CORES_BICHO[i % 4], k = aparece * s, q = Math.floor(t * 12) / 12;
  push(); translate(x, y + Math.sin(q * 5 + i) * 6 * s); scale(k * (1 + Math.sin(q * 7 + i) * .05), k * (1 - Math.sin(q * 7 + i) * .05));
  const n = 9, pts = [];
  for (let j = 0; j < n; j++) { const a = j / n * TAU, r = 40 * (1 + .18 * Math.sin(j * 2.7 + i)); pts.push([Math.cos(a) * r, Math.sin(a) * r * .9]); }
  for (let j = 0; j < 5; j++) { const a = -Math.PI * .9 + j * .45; stroke([[Math.cos(a) * 36, Math.sin(a) * 34], [Math.cos(a) * 54, Math.sin(a) * 52]], 5); }   // pelinhos
  shape(spline(pts), { fill: c, shade: () => { fillOnly(ell(16, 14, 30, 26), cs, { boil: .4 }); for (let j = 0; j < 4; j++) fillOnly(ell(-14 + j * 9, -16 + (j % 2) * 18, 4, 4), cs, { boil: .2 }); } });
  olho(-12, -6, 13, 16, { olhar, pupila: 3.5 }); olho(14, -6, 11, 14, { olhar, pupila: 3.5 });
  boca(2, 16, 24, { o: .35 + .2 * Math.sin(q * 6 + i), sm: .6 });
  if (tchau) { const a = Math.sin(q * 14 + i) * .5; stroke(noodle([30, 0], [56 + Math.cos(a) * 10, -30 + Math.sin(a) * 10], 6, 8, 6), 5); }
  pop();
}

// nota musical (cantarolando)
export function nota(x, y, s, a = 1) {
  if (s <= .02) return;
  push(); translate(x, y); scale(s);
  shape(ell(0, 0, 16, 12), { fill: '#1b1422', lw: 4, alpha: a }); stroke([[14, -2], [14, -60], [36, -50]], 6, { alpha: a });
  pop();
}

// —— olho esbugalhado (nojo/pavor): maior, saltado, pupila mínima, veias vermelhas ——
export function olhoEsbugalhado(cx, cy, r, t, { olhar = [0, 0], pupila = 4, veias = 1, tremor = 0, seed = 0 } = {}) {
  const q = Math.floor(t * 12) / 12, pulsa = 1 + .05 * Math.sin(q * 20 + seed);
  shape(ell(cx, cy, r * pulsa, r * 1.08 * pulsa, 40), {
    fill: '#fffdf4', lw: 7, shade: () => {
      for (let i = 0; i < 7 * veias; i++) {                                   // veias saindo da borda
        const a = hash(i * 3.7 + seed) * Math.PI * 2, L = r * (.35 + hash(i * 1.3 + seed) * .35);
        const x0 = cx + Math.cos(a) * r, y0 = cy + Math.sin(a) * r;
        stroke(quad([x0, y0], [x0 - Math.cos(a) * L * .5 + (hash(i) - .5) * 14, y0 - Math.sin(a) * L * .5], [x0 - Math.cos(a) * L, y0 - Math.sin(a) * L], 8), 2.5, { line: '#d9473b', boil: .6 });
      }
      fillOnly(ell(cx - r * .35, cy - r * .4, r * .22, r * .14), '#ffffff', { boil: .2 });
      dot(cx + olhar[0] * r * .45 + tremor, cy + olhar[1] * r * .45, pupila);
    }
  });
}

// —— BARATA (acabamento caprichado): casca marrom brilhante, asas, antenas longas, 6 pernas com espinhos andando em
// tripé (12 qps), olhos esbugalhados desiguais. Desenhada virada para cima (-y); rot = direção em radianos. ——
const BAR = { casca: '#6b3a1a', cascaS: '#4a2610', escudo: '#8a5226', escudoS: '#5e3416', perna: '#3d200d', brilho: '#f6e2c4' };
export function barata(x, y, s, t, { rot = 0, andando = 1, seed = 0, olhar = [0, 0], aparece = 1, baba = true } = {}) {
  if (aparece <= 0) return;
  const q = Math.floor(t * 12) / 12, fase = q * 18 * andando + seed;
  push(); translate(x, y); rotate(rot); scale(s * aparece);
  // pernas: três de cada lado, tripé alternado (L1, R2, L3 juntas)
  [[-1, -40, -.9], [-1, 0, -1.6], [-1, 40, -2.3], [1, -40, -.9], [1, 0, -1.6], [1, 40, -2.3]].forEach(([lado, yy, ang], k) => {
    const grupo = (k + (lado > 0 ? 1 : 0)) % 2, sw = Math.sin(fase + grupo * Math.PI) * .35 * andando;
    const a0 = [lado * 34, yy], ang2 = lado > 0 ? Math.PI - ang : ang;
    const joelho = [a0[0] + Math.cos(ang2 + sw) * -lado * 0 + lado * 62, yy - 26 + Math.sin(fase + k) * 6 * andando];
    const pe = [joelho[0] + lado * 46, joelho[1] + (yy < 0 ? -40 : yy > 0 ? 50 : 8) + sw * 40];
    stroke([a0, joelho], 9, { line: BAR.perna }); stroke([joelho, pe], 6, { line: BAR.perna });
    for (let j = 1; j < 4; j++) { const u = j / 4, px = lerp(joelho[0], pe[0], u), py = lerp(joelho[1], pe[1], u); stroke([[px, py], [px + lado * 10, py - 8]], 3, { line: BAR.perna }); }   // espinhos
  });
  // antenas longas, mexendo
  for (const lado of [-1, 1]) {
    const w1 = Math.sin(q * 9 + lado + seed) * 22, w2 = Math.sin(q * 6.3 + lado * 2 + seed) * 30;
    stroke(spline([[lado * 12, -92], [lado * 40 + w1 * .3, -150], [lado * 70 + w1, -210], [lado * 90 + w2, -270]], false, 8), 4, { line: BAR.perna });
  }
  // corpo: abdome + asas + escudo (pronoto)
  shape(ell(0, 30, 52, 92), { fill: BAR.cascaS });
  for (const lado of [-1, 1]) shape(spline([[0, -38], [lado * 50, -20], [lado * 56, 50], [lado * 34, 116], [0, 128]]), {
    fill: BAR.casca, shade: () => { fillOnly(ell(lado * 30, 40, 16, 70), BAR.cascaS, { boil: .3 }); stroke([[lado * 20, -10], [lado * 26, 80]], 4, { line: BAR.brilho, alpha: .7 }); }
  });
  for (const yy of [60, 84, 104]) stroke([[-30, yy], [30, yy + 4]], 3, { line: BAR.cascaS });
  shape(ell(0, -52, 50, 34), { fill: BAR.escudo, shade: () => { fillOnly(ell(0, -48, 22, 16), BAR.escudoS, { boil: .3 }); fillOnly(ell(-20, -62, 12, 6), BAR.brilho, { boil: .2 }); } });
  // cabeça com os olhos saltados (um maior que o outro, olhando para lados diferentes)
  shape(ell(0, -88, 26, 18), { fill: BAR.cascaS });
  olhoEsbugalhado(-20, -104, 19, t, { olhar: [-.6 + olhar[0], -.4 + olhar[1]], pupila: 3, veias: .7, seed: seed + 1 });
  olhoEsbugalhado(22, -102, 15, t, { olhar: [.7 + olhar[0], .2 + olhar[1]], pupila: 3, veias: .7, seed: seed + 2 });
  stroke([[-8, -72], [-2, -66]], 4); stroke([[8, -72], [2, -66]], 4);                                             // mandíbulas
  if (baba) babaBarata(t, seed, rot);
  pop();
}

// —— baba da barata: um fio que estica para baixo (na direção da gravidade da TELA, mesmo com a barata girada), a gota
// engorda, solta e cai; depois recomeça. Período fixo por barata (seed), para o som da gota cair no mesmo quadro. ——
export const BABA_P = 1.5;
const babaOff = seed => hash(seed * 1.91 + 7) * BABA_P;
export function babaQuedas(t0, t1, seed) {           // instantes em que a gota se solta (para sincronizar o som)
  const out = []; const off = babaOff(seed);
  for (let k = Math.floor((t0 + off) / BABA_P) - 1; k * BABA_P - off + .75 * BABA_P <= t1; k++) { const tt = k * BABA_P - off + .75 * BABA_P; if (tt >= t0) out.push(tt); }
  return out;
}
function babaBarata(t, seed, rot) {
  const u = ((t + babaOff(seed)) % BABA_P) / BABA_P, gx = Math.sin(rot), gy = Math.cos(rot);   // "para baixo" em coordenadas locais
  const m = [2, -62], cresce = clamp(u / .75), cai = clamp((u - .75) / .25);
  const L = (cai > 0 ? 1 - cai * .85 : cresce) * 95 + 8, onda = Math.sin(t * 7 + seed) * 6 * (1 - cai);
  const ponta = [m[0] + gx * L + gy * onda, m[1] + gy * L - gx * onda];
  const meio = [m[0] + gx * L * .5 - gy * onda * .6, m[1] + gy * L * .5 + gx * onda * .6];
  shape(noodle(m, ponta, onda * .4, 9, 4 + cresce * 3), { fill: '#d6e8a2', lw: 3, line: '#5d6b2c', alpha: .92 });   // fio
  if (cai <= 0) {
    const r = 6 + cresce * 11;
    shape(ell(ponta[0] + gx * r * .7, ponta[1] + gy * r * .7, r * .85, r * 1.05), { fill: '#d6e8a2', lw: 3, line: '#5d6b2c', alpha: .95 });
    dot(ponta[0] + gx * r * .5 - 4, ponta[1] + gy * r * .5 - 4, 2.5, '#ffffff');
  } else {                                                                     // a gota caindo, acelerando
    const d = 95 + cai * cai * 260, r = 16 * (1 - cai * .3);
    shape(ell(m[0] + gx * d, m[1] + gy * d, r * .75, r * 1.25), { fill: '#d6e8a2', lw: 3, line: '#5d6b2c', alpha: 1 - cai * .6 });
  }
  void meio;
}

// —— poses prontas da Bia (combine com bia({...POSES.x, ...ajustes})) ——
export const POSES = {
  secando:   { maoD: [70, -140], maoE: [-40, -110], angE: -.2, sm: .9, olhar: [.3, .4] },
  cheirando: { maoD: [20, -420], maoE: [-30, -400], angD: -1.2, angE: -1.9, sm: 1.1, fechados: true, cabeca: -.08 },   // pano no nariz
  apontando: { maoD: [230, -330], angD: -.4, maoE: [-60, -60], sm: .6, olhar: [.9, -.2], sobr: -.4 },
  cintura:   { maoD: [110, -40], maoE: [-110, -40], angD: 1.2, angE: 1.9, sm: .3, sobr: .5, olhar: [0, 0] },                 // mãos na cintura, desconfiada
  susto:     { maoD: [160, -420], maoE: [-160, -420], angD: -1.4, angE: -1.7, o: .8, sm: -.3, sobr: -1, olhar: [0, -.2] },
  nojo:      { maoD: [70, -140], maoE: [-40, -110], sm: -.6, o: .35, torto: .6, lingua: true, sobr: 1, olhar: [.2, .7] },
  joinha:    { maoD: [170, -300], angD: -1.6, fechaD: true, maoE: [-60, -60], sm: 1.2, olhar: [0, .1] },
};
