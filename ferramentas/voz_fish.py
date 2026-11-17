"""Narração com o Fish Audio (TTS): <pasta>/narracao_tags.txt -> <pasta>/audio/narracao.wav
O arquivo de entrada tem um bloco por parágrafo (separados por linha em branco); cada bloco vira um pedido à API, e os
blocos são emendados com PAUSA s de silêncio. Marcações de tom entre colchetes ([curious], [break], [sighing], ou frases
como [lowering voice, telling a secret]) seguem o padrão dos modelos S2. Linhas começando com # são ignoradas.
O proxy do ambiente injeta a chave de api.fish.audio (não precisa de chave aqui).
Uso: python3 -I ferramentas/voz_fish.py <pasta> <reference_id> [--modelo s2.1-pro-free] [--temp 0.8] [--top_p 0.8] [--pausa 0.45] [--so 1,2]"""
import sys, os, json, subprocess, urllib.request, tempfile
a = sys.argv[1:]; pasta, voz = a[0], a[1]
op = {k: v for k, v in zip(a[2::2], a[3::2])}
modelo = op.get("--modelo", "s2.1-pro-free"); temp = float(op.get("--temp", .8)); top_p = float(op.get("--top_p", .8)); pausa = float(op.get("--pausa", .45))
so = [int(x) for x in op["--so"].split(",")] if "--so" in op else None
txt = open(os.path.join(pasta, "narracao_tags.txt"), encoding="utf-8").read()
blocos = [" ".join(l.strip() for l in b.splitlines() if l.strip() and not l.startswith("#")) for b in txt.split("\n\n")]
blocos = [b for b in blocos if b]
A = os.path.join(pasta, "audio"); os.makedirs(A, exist_ok=True); tmp = tempfile.mkdtemp()
partes = []
for i, b in enumerate(blocos, 1):
    out = os.path.join(A, f"bloco_{i:02d}.wav")
    if so is None or i in so:
        corpo = json.dumps({"text": b, "reference_id": voz, "format": "wav", "sample_rate": 44100, "latency": "normal", "temperature": temp, "top_p": top_p,
                            "normalize": True, "language": "pt-BR", "prosody": {"speed": 1.0, "normalize_loudness": True}}).encode()
        rq = urllib.request.Request("https://api.fish.audio/v1/tts", corpo, {"content-type": "application/json", "model": modelo, "authorization": "Bearer x"})
        open(out, "wb").write(urllib.request.urlopen(rq, timeout=300).read())
        print(f"bloco {i}: {b[:70]}…")
    partes.append(out)
# emenda: corta silêncio das pontas de cada bloco e põe PAUSA entre eles
lista = os.path.join(tmp, "l.txt"); sil = os.path.join(tmp, "sil.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", str(pausa), sil], check=True)
with open(lista, "w") as f:
    for i, p in enumerate(partes):
        q = os.path.join(tmp, f"c{i}.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", p, "-af", "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",
                        "-ar", "44100", "-ac", "1", q], check=True)
        f.write(f"file '{q}'\n" + (f"file '{sil}'\n" if i < len(partes) - 1 else ""))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lista, "-ar", "44100", "-ac", "1", os.path.join(A, "narracao.wav")], check=True)
d = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", os.path.join(A, "narracao.wav")], capture_output=True, text=True).stdout.strip()
print(f"{len(partes)} blocos -> {os.path.join(A, 'narracao.wav')} ({float(d):.1f} s)")
