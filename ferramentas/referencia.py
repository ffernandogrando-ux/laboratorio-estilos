"""Vídeo de referência (ex.: baixado do Instagram) -> 1 folha com 6 quadros espalhados, para descrever o estilo gastando
uma imagem só. Uso: python3 -I ferramentas/referencia.py <video.mp4> <nome>   -> referencias/<nome>/folha.jpg (+ quadros)"""
import sys, os, subprocess, json
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
video, nome = sys.argv[1], sys.argv[2]; out = os.path.join(RAIZ, "referencias", nome); os.makedirs(out, exist_ok=True)
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video], capture_output=True, text=True).stdout)
ts = [round(dur * k / 7, 2) for k in range(1, 7)]; fs = []
for t in ts:
    f = os.path.join(out, f"q_{t}.jpg"); fs.append(f)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", video, "-frames:v", "1", "-q:v", "3", f], check=True)
subprocess.run([sys.executable, "-I", os.path.join(RAIZ, "ferramentas", "folha.py"), os.path.join(out, "folha.jpg"), *fs, "--largura", "240"], check=True)
json.dump({"video": os.path.basename(video), "dur": dur, "quadros": ts}, open(os.path.join(out, "info.json"), "w"))
