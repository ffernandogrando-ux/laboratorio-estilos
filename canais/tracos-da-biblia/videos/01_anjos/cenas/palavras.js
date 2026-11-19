// Tempos da voz (audio/words.json): W.t('trecho') -> início da 1ª palavra do trecho; W.t('trecho', 100) só procura depois de 100 s;
// W.fim('trecho') -> fim da última palavra do trecho. Comparação sem acento nem pontuação.
const R = await (await fetch(new URL('../audio/words.json', import.meta.url))).json();
const n = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
const NW = R.map(w => n(w.w));
function acha(trecho, desde = 0) {
  const p = n(trecho).split(/\s+/);
  for (let i = 0; i < R.length; i++) if (R[i].s >= desde && p.every((x, k) => NW[i + k] === x)) return [i, i + p.length - 1];
  throw new Error('palavra não achada: ' + trecho + ' depois de ' + desde);
}
export const W = { R, t: (tr, d) => R[acha(tr, d)[0]].s, fim: (tr, d) => R[acha(tr, d)[1]].e };
