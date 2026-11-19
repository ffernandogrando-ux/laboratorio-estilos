"""Sons do canal: gravados (sons/, CC0) + sintetizados no ritmo da animação.
Uso pela ferramenta de mixagem: sons.render(eventos, dur) -> np.array mono 48 kHz.
Cada evento: {"t": s, "som": nome, "g": ganho, "d": duração (s, para os contínuos), "seed": n}."""
import os, glob, math, subprocess, numpy as np
SR = 48000
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_C = {}
def carregar(rel):
    if rel not in _C:
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(RAIZ, rel), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True).stdout
        x = np.frombuffer(raw, np.float32).astype(np.float64); _C[rel] = x / (np.abs(x).max() + 1e-9)
    return _C[rel]
def _lista(pasta): return sorted(os.path.relpath(f, RAIZ) for f in glob.glob(os.path.join(RAIZ, "sons", pasta, "*.ogg")))
def _passa_faixa(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))

# —— barata ——
def patinhas(d=.5, seed=1, ritmo=38):
    """Patinhas correndo: cliques secos e rápidos (≈ritmo por segundo), irregulares, agudos, como unha em tecido/louça."""
    r = np.random.default_rng(seed); n = int(d * SR); y = np.zeros(n)
    t = 0.0
    while t < d:
        i = int(t * SR); L = int(.004 * SR); c = r.standard_normal(L) * np.exp(-np.arange(L) / (.0009 * SR)) * r.uniform(.4, 1)
        y[i:i + L] += c[: max(0, n - i)]; t += r.uniform(.6, 1.4) / ritmo
    y = _passa_faixa(y, 2200, 9000); env = np.minimum(1, np.minimum(np.arange(n) / (.03 * SR), (n - np.arange(n)) / (.05 * SR)))
    return y / (np.abs(y).max() + 1e-9) * env * .8
def asas(d=.35, seed=2):
    """Bater de asas (susto/fuga): ruído pulsando a ~70 Hz, com ataque rápido."""
    n = int(d * SR); x = np.random.default_rng(seed).standard_normal(n); t = np.arange(n) / SR
    y = _passa_faixa(x, 300, 4000) * (.5 + .5 * np.sin(2 * math.pi * 68 * t)) ** 2
    return y / (np.abs(y).max() + 1e-9) * np.exp(-t * 5) * .8
def chiado(seed=0):
    """'Voz' da barata: chiado/estalido agudo gravado (inseto)."""
    L = _lista("inseto"); return carregar(L[seed % len(L)])
def gota(seed=0):
    """Gota de baba caindo: som de gosma gravado, mais grave e curto."""
    L = _lista("gosma"); x = carregar(L[seed % len(L)])
    return np.interp(np.arange(0, len(x), 1.25), np.arange(len(x)), x)[: int(.45 * SR)]   # um pouco mais grave
def squish(seed=0):
    x = carregar("sons/molhado/squish_pack.ogg"); k = seed % 8; a = int(len(x) * k / 8); return x[a:a + int(.5 * SR)]

# —— gerais ——
def pop(seed=0, f0=900):
    n = int(.09 * SR); t = np.arange(n) / SR; return np.sin(2 * math.pi * f0 * (1 - .4 * t / .09) * t) * np.exp(-t * 45) * .5
def tick(seed=0):   # clique curto e agudo (número contando, relógio)
    n = int(.03 * SR); t = np.arange(n) / SR; return np.sin(2 * math.pi * (2400 + 150 * (seed % 3)) * t) * np.exp(-t * 160) * .45
def whoosh(d=.45, seed=1):
    n = int(d * SR); x = np.random.default_rng(seed).standard_normal(n); f = np.linspace(500, 2800, n); y = np.zeros(n); a = 0.0
    for i in range(n): k = 2 * math.pi * f[i] / SR; a += k * (x[i] - a) / (1 + k); y[i] = a
    return y * np.sin(np.linspace(0, math.pi, n)) ** 2 * .5
def baque(seed=0):
    t = np.arange(int(.4 * SR)) / SR; return np.sin(2 * math.pi * (110 - 50 * t) * t) * np.exp(-t * 11) * .9
def esfrega(d=.6, seed=3):
    n = int(d * SR); x = np.random.default_rng(seed).standard_normal(n); y = np.convolve(x, np.ones(30) / 30, "same")
    return y * (.5 + .5 * np.sin(np.arange(n) / SR * 2 * math.pi * 7)) * .25
SONS = {"patinhas": patinhas, "asas": asas, "chiado": chiado, "gota": gota, "squish": squish, "pop": pop, "tick": tick, "whoosh": whoosh, "baque": baque, "esfrega": esfrega}
CONTINUOS = {"patinhas", "asas", "whoosh", "esfrega"}

# —— iluminura / narrativa (sintetizados, sem amostra externa) ——
def _env(n, a, r):   # ataque e soltura em segundos
    i = np.arange(n); return np.minimum(1, np.minimum(i / max(1, a * SR), (n - i) / max(1, r * SR)))
def sino(seed=0):
    """Sino pequeno de ouro acendendo: parciais inarmônicos de sino com decaimento longo."""
    f0 = [660, 784, 880, 988][seed % 4]; n = int(3.2 * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for k, a, dec in [(1, 1, 1.6), (2.0, .5, 2.4), (2.76, .35, 3.2), (5.4, .2, 5), (8.9, .1, 7)]:
        y += a * np.sin(2 * math.pi * f0 * k * t) * np.exp(-t * dec)
    return y / np.abs(y).max() * _env(n, .002, .3) * .55
def pena(d=1.0, seed=4):
    """Pena riscando pergaminho: ruído agudo em traços curtos."""
    r = np.random.default_rng(seed); n = int(d * SR); x = _passa_faixa(r.standard_normal(n), 2500, 9000); t = np.arange(n) / SR
    m = np.zeros(n); s = 0.0
    while s < d: L = r.uniform(.08, .22); i0, i1 = int(s * SR), int(min(d, s + L) * SR); m[i0:i1] = np.sin(np.linspace(0, math.pi, i1 - i0)) * r.uniform(.5, 1); s += L + r.uniform(.03, .1)
    return x / (np.abs(x).max() + 1e-9) * m * .22
def vento(d=4.0, seed=5):
    """Vento noturno suave: ruído grave com sopros lentos."""
    r = np.random.default_rng(seed); n = int(d * SR); t = np.arange(n) / SR
    y = _passa_faixa(r.standard_normal(n), 150, 900) * (.6 + .4 * np.sin(2 * math.pi * .23 * t + r.uniform(0, 6)) * np.sin(2 * math.pi * .11 * t))
    return y / (np.abs(y).max() + 1e-9) * _env(n, 1.0, 1.2) * .35
def ferro(seed=0):
    """Ferro: corrente caindo ou portão girando (choques metálicos curtos e ressonantes)."""
    r = np.random.default_rng(seed); n = int(1.2 * SR); y = np.zeros(n); t0 = 0.0
    for k in range(6):
        i = int(t0 * SR); L = n - i; tt = np.arange(L) / SR; f = r.uniform(900, 2600)
        y[i:] += (np.sin(2 * math.pi * f * tt) + .6 * np.sin(2 * math.pi * f * 2.31 * tt)) * np.exp(-tt * r.uniform(9, 18)) * r.uniform(.4, 1); t0 += r.uniform(.04, .16)
    return y / np.abs(y).max() * .6
def murmurio(d=3.0, seed=6):
    """Murmúrio grave e solene (presença, "Santo"): acorde baixo de órgão com ar."""
    n = int(d * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for f, a in [(65.4, 1), (98, .7), (130.8, .5), (196, .25)]:
        y += a * (np.sin(2 * math.pi * f * t) + .3 * np.sin(2 * math.pi * f * 2 * t)) * (1 + .05 * np.sin(2 * math.pi * .7 * t))
    y += .15 * _passa_faixa(np.random.default_rng(seed).standard_normal(n), 80, 600)
    return y / np.abs(y).max() * _env(n, .8, 1.2) * .6
def fogo(d=4.0, seed=7):
    """Fogueira: chiado baixo com estalos."""
    r = np.random.default_rng(seed); n = int(d * SR); y = _passa_faixa(r.standard_normal(n), 200, 2500) * .3
    for _ in range(int(d * 6)):
        i = r.integers(0, n - 400); L = 300; y[i:i + L] += r.standard_normal(L) * np.exp(-np.arange(L) / 40) * r.uniform(.5, 1.5)
    return y / (np.abs(y).max() + 1e-9) * _env(n, .5, .8) * .4
SONS.update({"sino": sino, "pena": pena, "vento": vento, "ferro": ferro, "murmurio": murmurio, "fogo": fogo})
CONTINUOS |= {"pena", "vento", "murmurio", "fogo"}

def render(eventos, dur):
    out = np.zeros(int((dur + 1) * SR))
    for e in eventos:
        f = SONS[e["som"]]; seed = int(e.get("seed", 0))
        extra = {"ritmo": e["ritmo"]} if "ritmo" in e else {}
        s = f(e["d"], seed, **extra) if e["som"] in CONTINUOS and "d" in e else f(seed=seed)
        i = max(0, int(e["t"] * SR)); s = s[: len(out) - i]; out[i:i + len(s)] += s * e.get("g", 1.0)
    return out / max(1.0, np.abs(out).max() / .9)
