"""Genera locución con voces neuronales de Microsoft Edge (edge-tts, gratis, sin API key).

Uso:
  python .claude/skills/locucion/tts.py --lines src/ubpower/locucion.json --out public/ubpower/voz
  python .claude/skills/locucion/tts.py --text "Hola" --id prueba --out public/tmp --voice es-MX-JorgeNeural
  python .claude/skills/locucion/tts.py --list            # voces en español

JSON de entrada: {"voice": "...", "rate": "+10%", "pitch": "+0Hz", "lines": [{"id": "01", "text": "..."}]}
(voice/rate/pitch del JSON se pueden sobrescribir por línea o por argumentos)

Salida: <out>/<id>.mp3 y un resumen con la duración de cada archivo en segundos y en frames.
"""
import argparse
import asyncio
import json
import math
import os
import sys

try:
    import edge_tts
except ImportError:
    sys.exit("Falta edge-tts → python -m pip install edge-tts")

sys.stdout.reconfigure(encoding="utf-8")

BITRATE = 48000  # formato por defecto de edge-tts: audio-24khz-48kbitrate-mono-mp3 (CBR)


async def synth(text, voice, rate, pitch, path):
    await edge_tts.Communicate(text, voice, rate=rate, pitch=pitch).save(path)
    return os.path.getsize(path) * 8 / BITRATE


async def list_voices():
    for v in sorted(await edge_tts.list_voices(), key=lambda v: v["ShortName"]):
        if v["Locale"].startswith("es-"):
            print(f'{v["ShortName"]:28} {v["Gender"]:7} {", ".join(v["VoiceTag"].get("VoicePersonalities", []))}')


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lines", help="JSON con las líneas")
    ap.add_argument("--text")
    ap.add_argument("--id", default="voz")
    ap.add_argument("--out", default="public/voz")
    ap.add_argument("--voice")
    ap.add_argument("--rate", help='ej. "+10%%" o "-5%%"')
    ap.add_argument("--pitch", help='ej. "-2Hz"')
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--list", action="store_true")
    a = ap.parse_args()

    if a.list:
        return await list_voices()

    cfg = {"lines": [{"id": a.id, "text": a.text}]} if a.text else json.load(open(a.lines, encoding="utf-8"))
    voice = a.voice or cfg.get("voice", "es-BO-SofiaNeural")
    rate = a.rate or cfg.get("rate", "+0%")
    pitch = a.pitch or cfg.get("pitch", "+0Hz")
    os.makedirs(a.out, exist_ok=True)

    summary = []
    for line in cfg["lines"]:
        path = os.path.join(a.out, f'{line["id"]}.mp3')
        sec = await synth(line["text"], line.get("voice", voice), line.get("rate", rate), line.get("pitch", pitch), path)
        frames = math.ceil(sec * a.fps)
        summary.append({"id": line["id"], "file": path.replace("\\", "/"), "sec": round(sec, 2), "frames": frames})
        print(f'{line["id"]:>4}  {sec:5.2f} s  {frames:4d} f  {line["text"]}')

    print(json.dumps({"voice": voice, "rate": rate, "pitch": pitch, "files": summary}, ensure_ascii=False))


asyncio.run(main())
