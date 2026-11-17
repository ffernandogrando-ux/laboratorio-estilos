"""Folha de contato: junta PNG/JPG numa grade com o nome de cada quadro.
Uso: python3 -I ferramentas/folha.py saida.jpg img1 img2 ... [--largura 270]"""
import sys
from PIL import Image, ImageDraw
args = sys.argv[1:]; larg = 270
if "--largura" in args: i = args.index("--largura"); larg = int(args[i + 1]); del args[i:i + 2]
saida, imgs = args[0], args[1:]
cols = min(len(imgs), 8 if larg <= 180 else 4); alt = int(larg * 16 / 9); linhas = (len(imgs) + cols - 1) // cols
folha = Image.new("RGB", (cols * (larg + 6) + 6, linhas * (alt + 30) + 6), "#222")
d = ImageDraw.Draw(folha)
for k, p in enumerate(imgs):
    x, y = 6 + k % cols * (larg + 6), 6 + k // cols * (alt + 30)
    folha.paste(Image.open(p).convert("RGB").resize((larg, alt)), (x, y))
    d.text((x + 4, y + alt + 6), p.split("/")[-1].rsplit(".", 1)[0].replace("q_", "t="), fill="#ddd")
folha.save(saida, quality=88); print(saida)
