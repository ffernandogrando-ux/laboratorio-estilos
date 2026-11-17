"""Gráfico antes × depois do tremor das etiquetas (saída de ferramentas/tremor.mjs), só com PIL.
Uso: python3 -I ferramentas/grafico_tremor.py antes.json depois.json saida.png"""
import sys, json, math
from PIL import Image, ImageDraw, ImageFont
a, d = json.load(open(sys.argv[1])), json.load(open(sys.argv[2]))
W, H, M = 1200, 760, 70
img = Image.new("RGB", (W, H), (21, 23, 28)); g = ImageDraw.Draw(img)
try: F = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-Bold.otf", 26); f = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-Regular.otf", 18)
except OSError: F = f = ImageFont.load_default()
CORES = {"canaleta": (224, 40, 74), "pista lenta": (242, 160, 58), "rápida": (79, 214, 168)}
def painel(y0, dados, titulo):
    h = 300; g.text((M, y0), titulo, fill="white", font=F)
    top = y0 + 40; g.rectangle([M, top, W - 30, top + h], outline=(60, 64, 72))
    vmax = 50
    for v in (0, 10, 20, 30, 40, 50):
        yy = top + h - v / vmax * h; g.line([M, yy, W - 30, yy], fill=(40, 43, 50)); g.text((M - 40, yy - 11), str(v), fill=(150, 155, 165), font=f)
    for k, s in dados.items():
        vs = [math.hypot(*p) for p in s["d1"]]; n = len(vs)
        pts = [(M + i / 84 * (W - 30 - M), top + h - min(v, vmax) / vmax * h) for i, v in enumerate(vs)]
        if len(pts) > 1: g.line(pts, fill=CORES.get(k, "white"), width=3)
    return top + h
painel(20, a, "ANTES: velocidade da etiqueta na tela (px/quadro), 24 qps")
painel(380, d, "DEPOIS: mesma medida (curvas lisas = anda junto com a câmera)")
x = M
for k, c in CORES.items():
    s1, s2 = a.get(k), d.get(k)
    txt = f"{k}: tremor máx {s1['tremor_max'] if s1 else '-'} → {s2['tremor_max'] if s2 else '-'} px"
    g.rectangle([x, 730, x + 14, 744], fill=c); g.text((x + 22, 724), txt, fill="white", font=f); x += 385
img.save(sys.argv[3]); print(sys.argv[3])
