// Traços da Bíblia 01: "Como são os anjos segundo a Bíblia?" (191,7 s, 1080×1920, 24 qps), estilo iluminura.
// Cada arquivo de cenas/ exporta PLANOS = [{ de, ate, quadro: (t, W) => opções de I.quadro }] e EVENTOS = [{t, som, ...}].
// t é o tempo do vídeo (absoluto); W(palavraIndex) ou W.t('texto', a partir de) dá o tempo de uma palavra da voz.
import * as I from '/estilos/iluminura/kit/iluminura.js';
import { W } from './cenas/palavras.js';
import * as A from './cenas/a.js';
import * as B from './cenas/b.js';
import * as C from './cenas/c.js';
await I.init(document.getElementById('c'));
const PLANOS = [...A.PLANOS, ...B.PLANOS, ...C.PLANOS].sort((p, q) => p.de - q.de);
window.DUR = 191.7;
window.EVENTOS = [...A.EVENTOS, ...B.EVENTOS, ...C.EVENTOS].sort((a, b) => a.t - b.t);
window.render = t => {
  const p = PLANOS.find(p => t >= p.de && t < p.ate) || PLANOS[PLANOS.length - 1];
  I.quadro({ t, ...p.quadro(t, W) });
};
