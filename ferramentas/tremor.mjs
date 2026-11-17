// Mede o tremor das etiquetas: renderiza quadro a quadro (24 qps) e lê a posição que cada etiqueta desenhou
// (globalThis.__ETQ, gravado por etiqueta() do kit). Tremor = 2ª diferença da posição (px/quadro²): numa etiqueta que
// anda suave junto com a câmera ela fica perto de 0; pulos de amostra ou arredondamento aparecem como picos.
// Uso: node ferramentas/tremor.mjs estilos/<estilo>/teste t0 t1 [saida.json]
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'http'; import fs from 'fs'; import path from 'path';
const RAIZ = path.dirname(path.dirname(new URL(import.meta.url).pathname)), FPS = 24;
const [pasta, a = '0', b = '10', saida] = process.argv.slice(2);
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css' };
const srv = http.createServer((q, r) => { const f = path.join(RAIZ, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': TIPOS[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
await new Promise(ok => srv.listen(0, '127.0.0.1', ok));
const br = await chromium.launch(), p = await br.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', e => console.log('ERRO', e.message));
await p.goto(`http://127.0.0.1:${srv.address().port}/${pasta.replace(/\/$/, '')}/index.html`); await p.waitForFunction(() => window.DUR > 0);
const serie = {};
for (let f = Math.round(+a * FPS); f <= Math.round(+b * FPS); f++) {
  const t = f / FPS, e = await p.evaluate(t => { globalThis.__ETQ = {}; window.render(t); return globalThis.__ETQ; }, t);
  for (const [k, v] of Object.entries(e)) if (v.ponto) (serie[k] ||= []).push({ f, t, x: v.ponto[0], y: v.ponto[1], px: v.pilula[0] });
}
await br.close(); srv.close();
const res = {};
for (const [k, s] of Object.entries(serie)) {
  const d1 = [], d2 = [];
  for (let i = 1; i < s.length; i++) if (s[i].f === s[i - 1].f + 1) d1.push([s[i].x - s[i - 1].x, s[i].y - s[i - 1].y, s[i].px - s[i - 1].px]);
  for (let i = 1; i < d1.length; i++) d2.push(Math.hypot(d1[i][0] - d1[i - 1][0], d1[i][1] - d1[i - 1][1]));
  const pil = []; for (let i = 1; i < d1.length; i++) pil.push(Math.abs(d1[i][2] - d1[i - 1][2]));
  const m = v => v.length ? v.reduce((x, y) => x + y, 0) / v.length : 0, mx = v => v.length ? Math.max(...v) : 0;
  res[k] = { quadros: s.length, vel_media_px: +m(d1.map(d => Math.hypot(d[0], d[1]))).toFixed(2), tremor_medio: +m(d2).toFixed(2), tremor_max: +mx(d2).toFixed(2),
    pilula_tremor_max: +mx(pil).toFixed(2), d1: d1.map(d => [+d[0].toFixed(2), +d[1].toFixed(2)]) };
  console.log(`${k.padEnd(12)} ${s.length} quadros · velocidade média ${res[k].vel_media_px} px/q · tremor (2ª dif.) médio ${res[k].tremor_medio}, máx ${res[k].tremor_max} px · pílula máx ${res[k].pilula_tremor_max} px`);
}
if (saida) fs.writeFileSync(saida, JSON.stringify(res));
