"""Mixagem: <video>/audio/eventos.json (escrito pelo render a partir da própria cena) + narração -> audio/mix.wav.
Os efeitos abaixam sozinhos quando a voz fala (sidechain), para a narração ficar clara e os sons da barata imersivos nas pausas.
Uso: python3 -I ferramentas/mix.py estilos/<estilo>/teste [--efeitos-lufs -24] [--musica-lufs -30]  (audio/musica.wav, se existir, entra por baixo)   (sem audio/narracao.wav, sai só a faixa de efeitos)
Saídas extras (stems, para editar fora): audio/stem_efeitos.wav (efeitos no nível do mix) e audio/stem_voz.wav."""
import sys, os, json, wave, subprocess, numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "motor"))
import sons
pasta = sys.argv[1]; A = os.path.join(pasta, "audio")
EF_ARG = float(sys.argv[sys.argv.index("--efeitos-lufs") + 1]) if "--efeitos-lufs" in sys.argv else None
ev = json.load(open(os.path.join(A, "eventos.json")))
dur = max(e["t"] + e.get("d", 1) for e in ev["eventos"]) if ev["eventos"] else 1
fx = sons.render(ev["eventos"], max(dur, ev.get("dur", dur)))
with wave.open(os.path.join(A, "efeitos.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(sons.SR); w.writeframes((fx * 32767).astype(np.int16).tobytes())
# Níveis (17/11/2026, retorno do usuário: "quase não ouvi os efeitos"): a faixa de efeitos é medida e levada a
# EF_LUFS (perto da voz, que vai a -15), e a voz só abaixa os efeitos ~4 dB (antes: volume 0,62 + ducking forte, ~12 dB abaixo).
# 17/11/2026 (2º retorno, teste São Paulo com voz): "efeitos ficaram muito alto" -> com voz, efeitos a -25 LUFS (~10 dB abaixo da voz);
# sem voz (teste do laboratório) continua -16. --efeitos-lufs troca o nível.
VOZ_LUFS = -15
EF_LUFS = EF_ARG if EF_ARG is not None else (-25 if os.path.exists(os.path.join(A, "narracao.wav")) else -16)
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
# trilha de fundo opcional (audio/musica.wav, ex.: ferramentas/musica.py): bem por baixo da voz (-30 LUFS) e abaixa mais quando ela fala
MUS = os.path.join(A, "musica.wav")
if os.path.exists(MUS):
    MUS_LUFS = float(sys.argv[sys.argv.index("--musica-lufs") + 1]) if "--musica-lufs" in sys.argv else -30
    med = subprocess.run(["ffmpeg", "-hide_banner", "-i", MUS, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    gm = MUS_LUFS - float([l for l in med.splitlines() if l.strip().startswith("I:")][-1].split()[1])
    os.replace(os.path.join(A, "mix.wav"), os.path.join(A, "mix_sem_musica.wav"))
    voz = os.path.join(A, "narracao.wav") if os.path.exists(os.path.join(A, "narracao.wav")) else MUS
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(A, "mix_sem_musica.wav"), "-i", MUS, "-i", voz, "-filter_complex",
                    f"[1:a]aresample=48000,volume={gm:.2f}dB[m];[2:a]aresample=48000[sc];[m][sc]sidechaincompress=threshold=0.05:ratio=3:attack=40:release=400[md];"
                    "[0:a][md]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.89", "-ar", "48000", os.path.join(A, "mix.wav")], check=True)
    print(f"música -> {MUS_LUFS} LUFS ({gm:+.1f} dB), abaixa sob a voz")
print(len(ev["eventos"]), "eventos sonoros ->", os.path.join(A, "mix.wav"))
# stems separados (mesmo nível e duração do mix)
D = str(ev.get("dur", dur))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(A, "efeitos.wav"), "-af", f"aresample=48000,volume={ganho:.2f}dB,alimiter=limit=0.9,apad", "-t", D, "-ar", "48000", os.path.join(A, "stem_efeitos.wav")], check=True)
if os.path.exists(os.path.join(A, "narracao.wav")):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(A, "narracao.wav"), "-af", f"aresample=48000,loudnorm=I={VOZ_LUFS}:TP=-1.5,aresample=48000,apad", "-t", D, "-ar", "48000", os.path.join(A, "stem_voz.wav")], check=True)
print("stems ->", os.path.join(A, "stem_efeitos.wav"), "e stem_voz.wav")
