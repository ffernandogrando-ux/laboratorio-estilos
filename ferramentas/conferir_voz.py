"""Confere a narração gerada contra o texto: transcreve cada bloco (audio/bloco_NN.wav) com o Whisper e compara as
palavras com o bloco de narracao_tags.txt sem as marcações. Mostra % de acerto, palavras faltando/sobrando e se alguma
marcação foi lida em voz alta.  Uso: python3 -I ferramentas/conferir_voz.py <pasta>"""
import sys, os, re, glob, subprocess, difflib, unicodedata, numpy as np
from faster_whisper import WhisperModel
pasta = sys.argv[1]
txt = open(os.path.join(pasta, "narracao_tags.txt"), encoding="utf-8").read()
blocos = [" ".join(l.strip() for l in b.splitlines() if l.strip() and not l.startswith("#")) for b in txt.split("\n\n")]; blocos = [b for b in blocos if b]
n = lambda s: "".join(c for c in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(c) != "Mn" and (c.isalnum() or c == " "))
NUM = {"23": "vinte e tres", "26": "vinte e seis", "46": "quarenta e seis", "100": "cem", "300": "trezentos", "1930": "mil novecentos e trinta", "tt": "tiete", "tite": "tiete", "pra": "para"}
M = WhisperModel("small", device="cpu", compute_type="int8"); ok = True
for i, b in enumerate(blocos, 1):
    alvo = " ".join(NUM.get(w, w) for w in n(re.sub(r"\[[^\]]*\]", " ", b)).split()).split()
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", os.path.join(pasta, "audio", f"bloco_{i:02d}.wav"), "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True).stdout
    # sem initial_prompt: com ele o Whisper às vezes pula o começo do bloco e acusa falta que não existe
    segs, _ = M.transcribe(np.frombuffer(raw, np.float32), language="pt")
    ouvido = " ".join(NUM.get(w, w) for w in n(" ".join(s.text for s in segs)).split()).split()
    sm = difflib.SequenceMatcher(None, alvo, ouvido); r = sm.ratio()
    falta = [" ".join(alvo[a:b]) for t, a, b, c, d in sm.get_opcodes() if t in ("delete", "replace")]
    sobra = [" ".join(ouvido[c:d]) for t, a, b, c, d in sm.get_opcodes() if t in ("insert", "replace")]
    tags = [t for t in re.findall(r"\[([^\]]*)\]", b) for w in n(t).split() if len(w) > 4 and w in ouvido]
    print(f"bloco {i}: {r*100:.0f}% | falta: {falta} | sobra: {sobra}" + (f" | MARCAÇÃO FALADA: {tags}" if tags else ""))
    ok &= r > .9 and not tags
print("OK" if ok else "REVER")
