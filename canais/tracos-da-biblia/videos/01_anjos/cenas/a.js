import * as C from '/estilos/iluminura/kit/cenario.js';
import * as T from '/estilos/iluminura/kit/texto.js';
export const PLANOS = [{ de: 0, ate: 999, quadro: (t, W) => ({ cam: { x: 540, y: 960, z: 1 }, noite: .8, dim: .7,
  mundo: g => C.ceu(g, { x0: 0, y0: 0, x1: 1080, y1: 1920, noite: 1, seed: 3 }),
  tela: g => { T.moldura(g); T.faixa && T.faixa(g, { texto: 'TESTE ' + W.t('cocho').toFixed(1), x: 540, y: 300, w: 800, t: 5 }); } }) }];
export const EVENTOS = [];
