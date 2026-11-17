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
def whoosh(d=.45, seed=1):
    n = int(d * SR); x = np.random.default_rng(seed).standard_normal(n); f = np.linspace(500, 2800, n); y = np.zeros(n); a = 0.0
    for i in range(n): k = 2 * math.pi * f[i] / SR; a += k * (x[i] - a) / (1 + k); y[i] = a
    return y * np.sin(np.linspace(0, math.pi, n)) ** 2 * .5
def baque(seed=0):
    t = np.arange(int(.4 * SR)) / SR; return np.sin(2 * math.pi * (110 - 50 * t) * t) * np.exp(-t * 11) * .9
def esfrega(d=.6, seed=3):
    n = int(d * SR); x = np.random.default_rng(seed).standard_normal(n); y = np.convolve(x, np.ones(30) / 30, "same")
    return y * (.5 + .5 * np.sin(np.arange(n) / SR * 2 * math.pi * 7)) * .25
SONS = {"patinhas": patinhas, "asas": asas, "chiado": chiado, "gota": gota, "squish": squish, "pop": pop, "whoosh": whoosh, "baque": baque, "esfrega": esfrega}
CONTINUOS = {"patinhas", "asas", "whoosh", "esfrega"}

def render(eventos, dur):
    out = np.zeros(int((dur + 1) * SR))
    for e in eventos:
        f = SONS[e["som"]]; seed = int(e.get("seed", 0))
        extra = {"ritmo": e["ritmo"]} if "ritmo" in e else {}
        s = f(e["d"], seed, **extra) if e["som"] in CONTINUOS and "d" in e else f(seed=seed)
        i = max(0, int(e["t"] * SR)); s = s[: len(out) - i]; out[i:i + len(s)] += s * e.get("g", 1.0)
    return out / max(1.0, np.abs(out).max() / .9)
