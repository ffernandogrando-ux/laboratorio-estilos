"""Mixagem: <video>/audio/eventos.json (escrito pelo render a partir da própria cena) + narração -> audio/mix.wav.
Os efeitos abaixam sozinhos quando a voz fala (sidechain), para a narração ficar clara e os sons da barata imersivos nas pausas.
Uso: python3 -I ferramentas/mix.py estilos/<estilo>/teste   (sem audio/narracao.wav, sai só a faixa de efeitos)"""
import sys, os, json, wave, subprocess, numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "motor"))
import sons
pasta = sys.argv[1]; A = os.path.join(pasta, "audio")
ev = json.load(open(os.path.join(A, "eventos.json")))
dur = max(e["t"] + e.get("d", 1) for e in ev["eventos"]) if ev["eventos"] else 1
fx = sons.render(ev["eventos"], max(dur, ev.get("dur", dur)))
with wave.open(os.path.join(A, "efeitos.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(sons.SR); w.writeframes((fx * 32767).astype(np.int16).tobytes())
# Níveis (17/11/2026, retorno do usuário: "quase não ouvi os efeitos"): a faixa de efeitos é medida e levada a
# EF_LUFS (perto da voz, que vai a -15), e a voz só abaixa os efeitos ~4 dB (antes: volume 0,62 + ducking forte, ~12 dB abaixo).
VOZ_LUFS, EF_LUFS = -15, -16
med = subprocess.run(["ffmpeg", "-hide_banner", "-i", os.path.join(A, "efeitos.wav"), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
lufs = float([l for l in med.splitlines() if l.strip().startswith("I:")][-1].split()[1])
ganho = EF_LUFS - lufs
if not os.path.exists(os.path.join(A, "narracao.wav")):   # teste sem voz (laboratório): só os efeitos
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(A, "efeitos.wav"), "-af", f"aresample=48000,volume={ganho:.2f}dB,alimiter=limit=0.89",
                    "-t", str(ev.get("dur", dur)), "-ar", "48000", os.path.join(A, "mix.wav")], check=True)
else: subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(A, "narracao.wav"), "-i", os.path.join(A, "efeitos.wav"), "-filter_complex",
                f"[0:a]aresample=48000,loudnorm=I={VOZ_LUFS}:TP=-1.5,aresample=48000,asplit=2[v][sc];[1:a]aresample=48000,volume={ganho:.2f}dB,alimiter=limit=0.9[e];"
                "[e][sc]sidechaincompress=threshold=0.1:ratio=2:attack=20:release=200[ed];"
                "[v][ed]amix=inputs=2:normalize=0:duration=longest,alimiter=limit=0.89,apad", "-t", str(ev.get("dur", dur)), "-ar", "48000", os.path.join(A, "mix.wav")], check=True)
print(f"efeitos {lufs:.1f} -> {EF_LUFS} LUFS ({ganho:+.1f} dB)")
print(len(ev["eventos"]), "eventos sonoros ->", os.path.join(A, "mix.wav"))
