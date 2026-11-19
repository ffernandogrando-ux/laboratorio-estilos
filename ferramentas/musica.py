"""Trilha de fundo sintetizada (sem amostras): harpa em arpejos lentos sobre um bordão suave de órgão, modo dórico.
Serve para narração solene (iluminura, explicador bíblico). Sai em <pasta>/audio/musica.wav, que o mix.py põe por baixo da voz.
Uso: python3 -I ferramentas/musica.py <pasta> <duração_s> [--bpm 66] [--seed 1] [--fim-maior]
--fim-maior: os últimos 12 s resolvem em acorde maior (terça de Picardia), para a chegada."""
import sys, os, math, wave, numpy as np
SR = 48000
pasta, dur = sys.argv[1], float(sys.argv[2])
arg = lambda k, d: type(d)(sys.argv[sys.argv.index(k) + 1]) if k in sys.argv else d
BPM, SEED, PICARDIA = arg("--bpm", 66), arg("--seed", 1), "--fim-maior" in sys.argv
r = np.random.default_rng(SEED); n = int((dur + 4) * SR); y = np.zeros(n)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
# progressão em ré dórico, 2 compassos por acorde: Dm, C, Bb(maj7 suave), Am/C… volta (graus em midi, baixo + tríade)
PROG = [(38, [50, 53, 57, 62]), (36, [48, 52, 55, 60]), (34, [46, 50, 53, 57]), (33, [45, 48, 52, 57]),
        (38, [50, 53, 57, 60]), (41, [48, 53, 57, 60]), (43, [47, 50, 55, 59]), (38, [50, 53, 57, 62])]
beat = 60 / BPM; bar = 4 * beat; acorde = 2 * bar
def harpa(f, L, a):
    t = np.arange(L) / SR; s = sum(np.sin(2 * math.pi * f * k * t) * np.exp(-t * (1.4 + 1.1 * k)) / k ** 1.3 for k in range(1, 6))
    return s * np.minimum(1, t / .003) * a
def orgao(f, L, a):
    t = np.arange(L) / SR; s = np.sin(2 * math.pi * f * t) + .45 * np.sin(2 * math.pi * 2 * f * t) + .2 * np.sin(2 * math.pi * 3 * f * t)
    e = np.minimum(1, np.minimum(t / 1.5, (L / SR - t) / 1.5)); return s * e * a
t0, k = 0.0, 0
while t0 < dur + 2:
    bx, tri = PROG[k % len(PROG)]
    if PICARDIA and t0 > dur - 12: bx, tri = 38, [50, 54, 57, 62]          # ré maior no fim
    L = int((acorde + 1.5) * SR); i = int(t0 * SR); seg = orgao(midi(bx), L, .16) + orgao(midi(bx + 12), L, .07)
    y[i:i + L] += seg[: max(0, n - i)]
    # arpejo de harpa: colcheias espaçadas, com pausas (respira), subindo e descendo
    pad = tri + [tri[1] + 12, tri[2] + 12]
    for j in range(int(acorde / (beat / 2))):
        if r.random() < .38: continue
        m = pad[(j if (j // 6) % 2 == 0 else -j - 1) % len(pad)]; tj = t0 + j * beat / 2 + r.normal(0, .008)
        Lh = int(3 * SR); ih = int(tj * SR); s = harpa(midi(m), Lh, r.uniform(.12, .2)); y[ih:ih + Lh] += s[: max(0, n - ih)]
    t0 += acorde; k += 1
# eco simples (sala de pedra) e fades
for d, g in [(.21, .28), (.47, .18), (.83, .1)]:
    sh = int(d * SR); y[sh:] += g * y[:-sh].copy()
y = y[: int(dur * SR)]; tt = np.arange(len(y)) / SR; y *= np.minimum(1, np.minimum(tt / 3, (dur - tt) / 4))
y = y / np.abs(y).max() * .8
os.makedirs(os.path.join(pasta, "audio"), exist_ok=True)
with wave.open(os.path.join(pasta, "audio", "musica.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
print("audio/musica.wav", round(dur, 1), "s")
