// Render de um vídeo do canal. Uso (da raiz do repositório):
//   node motor/render.mjs estilos/<estilo>/teste quadros 0.5,3,7   -> PNGs soltos em <pasta>/prev/
//   node motor/render.mjs estilos/<estilo>/teste video [processos]  -> <pasta>/video.mp4 (com audio/mix.wav, se existir)
//                                                                     e <pasta>/tempo.json (segundos de render por 10 s de vídeo)
// Serve o repositório por HTTP (módulos ES: /motor, /acervo, /videos), abre a página no Chromium e chama
// window.render(t) quadro a quadro, a 24 qps. 12 s de vídeo renderizam em ~20 s na nuvem, sem placa de vídeo.
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'http'; import fs from 'fs'; import path from 'path'; import { spawnSync } from 'child_process';
const RAIZ = path.dirname(path.dirname(new URL(import.meta.url).pathname)), FPS = 24;
const [pasta, modo = 'quadros', arg] = process.argv.slice(2);
if (!pasta || !fs.existsSync(path.join(RAIZ, pasta, 'index.html'))) { console.error('uso: node render.mjs videos/NN_tema quadros|video [arg]'); process.exit(1); }
const DIR = path.join(RAIZ, pasta);
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg' };
const srv = http.createServer((q, r) => { const f = path.join(RAIZ, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(RAIZ)) { r.writeHead(403); r.end(); return; }
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': TIPOS[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); });
await new Promise(ok => srv.listen(0, '127.0.0.1', ok)); const URL_ = `http://127.0.0.1:${srv.address().port}/${pasta.replace(/\/$/, '')}/index.html`;
const b = await chromium.launch();
async function pagina() { const p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); p.on('pageerror', e => console.log('ERRO', e.message));
  await p.goto(URL_); await p.waitForFunction(() => window.DUR > 0); await p.evaluate(() => document.fonts.ready); return p; }
async function eventos(p) {   // a cena declara os sons em window.EVENTOS (sincronia exata com a animação) -> audio/eventos.json
  const ev = await p.evaluate(() => window.EVENTOS || null); if (!ev) return;
  fs.mkdirSync(path.join(DIR, 'audio'), { recursive: true });
  fs.writeFileSync(path.join(DIR, 'audio', 'eventos.json'), JSON.stringify({ dur: await p.evaluate(() => window.DUR), eventos: ev }, null, 0));
}
if (modo === 'quadros') {
  const p = await pagina(); await eventos(p); fs.mkdirSync(path.join(DIR, 'prev'), { recursive: true });
  for (const t of (arg || '0.5,3,6,9').split(',').map(Number)) { await p.evaluate(t => window.render(t), t); await p.screenshot({ path: path.join(DIR, 'prev', `q_${t}.png`) }); }
  console.log('prev/');
} else {
  const W = +(arg || 4), p0 = await pagina(); await eventos(p0);
  const DUR = await p0.evaluate(() => window.DUR), N = Math.round(DUR * FPS), out = path.join(DIR, 'quadros');
  fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out); let prox = 0; const t0 = Date.now();
  const ps = [p0]; for (let i = 1; i < W; i++) ps.push(await pagina());
  await Promise.all(ps.map(async p => { while (true) { const f = prox++; if (f >= N) break; await p.evaluate(t => window.render(t), f / FPS);
    await p.screenshot({ path: path.join(out, String(f).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 94 }); } }));
  const mix = path.join(DIR, 'audio', 'mix.wav'), tem = fs.existsSync(mix);
  spawnSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(out, '%05d.jpg'), ...(tem ? ['-i', mix] : []), '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p',
    ...(tem ? ['-c:a', 'aac', '-b:a', '192k', '-shortest'] : []), path.join(DIR, 'video.mp4')], { stdio: 'inherit' });
  const seg = (Date.now() - t0) / 1000; fs.writeFileSync(path.join(DIR, 'tempo.json'), JSON.stringify({ quadros: N, dur: DUR, processos: W, segundos: +seg.toFixed(1), seg_por_10s: +(seg / DUR * 10).toFixed(1) }));
  console.log(`${pasta}/video.mp4 · ${N} quadros em ${((Date.now() - t0) / 1000).toFixed(0)} s${tem ? '' : ' (sem áudio: rode o mix.py antes)'}`);
}
await b.close(); srv.close();
