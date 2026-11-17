"""Narração gravada -> <video>/audio/words.json (palavras do ROTEIRO com os tempos da voz), para a cena amarrar
cada movimento na palavra. O Whisper pode errar a grafia: o alinhamento é feito letra a letra contra o roteiro.

Uso:  python3 -I ferramentas/narracao.py videos/NN_tema    (lê audio/narracao.wav e roteiro.md, parte "NARRAÇÃO")
"""
import sys, os, json, re, unicodedata, difflib, subprocess
import numpy as np
from faster_whisper import WhisperModel
pasta = sys.argv[1]
wav, rot = os.path.join(pasta, "audio", "narracao.wav"), open(os.path.join(pasta, "roteiro.md"), encoding="utf-8").read()
m = re.search(r"## NARRAÇÃO\s*\n(.*?)(\n## |\Z)", rot, re.S); txt = re.sub(r"[>*_`]", "", m.group(1)).strip()
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", wav, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True).stdout
segs, _ = WhisperModel("small", device="cpu", compute_type="int8").transcribe(np.frombuffer(raw, np.float32), language="pt", word_timestamps=True, initial_prompt=txt[:600])
WH = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
def n(s): s = unicodedata.normalize("NFD", s.lower()); return "".join(c for c in s if unicodedata.category(c) != "Mn" and c.isalnum())
NUM = {"24": "vinteequatro", "2": "dois", "3": "tres", "60": "sessenta", "100": "cem"}
nw = lambda w: NUM.get(n(w), n(w))
RW = txt.split(); a = "".join(n(w) for w in RW); b = "".join(nw(w) for w, _, _ in WH); tb = []
for w, s0, e0 in WH:
    k = nw(w); tb += [s0 + (e0 - s0) * i / max(1, len(k)) for i in range(len(k))]
ta = [None] * len(a)
for i, j, size in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
    for k in range(size): ta[i + k] = tb[j + k]
idx = [i for i, v in enumerate(ta) if v is not None]; ta = np.interp(range(len(a)), idx, [ta[i] for i in idx]).tolist()
out, p = [], 0
for w in RW:
    L = len(n(w)) or 1; s = ta[p]; e = ta[min(len(a) - 1, p + L - 1)] + 0.08; p += L
    out.append({"w": w, "s": round(s, 3), "e": round(max(e, s + 0.05), 3)})
json.dump(out, open(os.path.join(pasta, "audio", "words.json"), "w"), ensure_ascii=False, indent=0)
print(len(RW), "palavras alinhadas ->", os.path.join(pasta, "audio", "words.json"))
