"""Cliente mínimo de ElevenLabs para videos de Remotion (solo librería estándar).

La API key se lee de la variable ELEVENLABS_API_KEY o del archivo .env del proyecto.

Comandos:
  python .claude/skills/elevenlabs/eleven.py quota
  python .claude/skills/elevenlabs/eleven.py voices                                  # voces de tu cuenta
  python .claude/skills/elevenlabs/eleven.py library --gender female --language es [--accent latin] [--search texto]
  python .claude/skills/elevenlabs/eleven.py add-voice <public_owner_id> <voice_id> "Nombre"
  python .claude/skills/elevenlabs/eleven.py generate --config src/<video>/audio.json --out public/<video>/audio [--only voice,sfx,music] [--ids 01,03]

audio.json:
{
  "voice": {"voice_id": "...", "model_id": "eleven_multilingual_v2", "language_code": "es",
            "settings": {"stability": 0.45, "similarity_boost": 0.8, "style": 0.3, "use_speaker_boost": true, "speed": 1.05}},
  "lines": [{"id": "01", "text": "...", "speed": 1.1}],
  "sfx":   [{"id": "zap", "text": "electric power up", "duration": 1.5, "prompt_influence": 0.5}],
  "music": {"id": "musica", "prompt": "...", "length_ms": 20000}
}
Salida: <out>/voz-<id>.mp3, <out>/sfx-<id>.mp3, <out>/<music id>.mp3 + duración en segundos y frames.
"""
import argparse
import json
import math
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

sys.stdout.reconfigure(encoding="utf-8")
API = "https://api.elevenlabs.io"
FORMAT = "mp3_44100_128"  # CBR 128 kbps → duración = bytes * 8 / 128000
BITRATE = 128000


KEY_NAMES = ("ELEVENLABS_API_KEY", "KEY_ELEVENLABS")


def api_key():
    key = next((os.environ[k] for k in KEY_NAMES if os.environ.get(k)), None)
    if not key and os.path.exists(".env"):
        for line in open(".env", encoding="utf-8-sig"):
            k, _, v = line.strip().partition("=")
            if k.strip() in KEY_NAMES:
                key = v.strip().strip('"').strip("'")
    if not key:
        sys.exit("Falta ELEVENLABS_API_KEY (ponla en .env en la raíz del proyecto: ELEVENLABS_API_KEY=sk_...)")
    return key


def call(method, path, body=None, query=None, raw=False):
    url = API + path + ("?" + urllib.parse.urlencode(query) if query else "")
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("xi-api-key", api_key())
    if data is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            out = r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs {e.code} en {path}: {e.read().decode(errors='replace')[:600]}")
    return out if raw else json.loads(out)


_BR = {1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320], 2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160]}
_SR = {3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000]}


def mp3_seconds(b):
    """Duración real contando frames MPEG Layer III (no depende de que el bitrate sea constante)."""
    i = 0
    if b[:3] == b"ID3":
        i = 10 + ((b[6] << 21) | (b[7] << 14) | (b[8] << 7) | b[9])
    sec = 0.0
    while i + 4 <= len(b):
        h = int.from_bytes(b[i : i + 4], "big")
        ver, layer, bri, sri, pad = (h >> 19) & 3, (h >> 17) & 3, (h >> 12) & 15, (h >> 10) & 3, (h >> 9) & 1
        if (h >> 21) != 0x7FF or ver == 1 or layer != 1 or bri in (0, 15) or sri == 3:
            i += 1
            continue
        sr = _SR[ver][sri]
        spf = 1152 if ver == 3 else 576
        size = (spf // 8) * _BR[1 if ver == 3 else 2][bri] * 1000 // sr + pad
        sec += spf / sr
        i += max(1, size)
    return sec or len(b) * 8 / BITRATE


def save(path, audio, fps):
    with open(path, "wb") as f:
        f.write(audio)
    sec = mp3_seconds(audio)
    return round(sec, 2), math.ceil(sec * fps)


def cmd_quota(_):
    s = call("GET", "/v1/user/subscription")
    print(f'Plan: {s.get("tier")} · caracteres usados {s.get("character_count")}/{s.get("character_limit")} · renueva {s.get("next_character_count_reset_unix")}')


def cmd_voices(_):
    for v in call("GET", "/v1/voices")["voices"]:
        l = v.get("labels", {})
        print(f'{v["voice_id"]}  {v["name"][:30]:30} {l.get("gender", ""):7} {l.get("accent", ""):16} {l.get("language", "")} {v.get("category", "")}')


def cmd_library(a):
    q = {"page_size": a.limit, "language": a.language}
    if a.gender:
        q["gender"] = a.gender
    if a.accent:
        q["accent"] = a.accent
    if a.search:
        q["search"] = a.search
    for v in call("GET", "/v1/shared-voices", query=q)["voices"]:
        print(
            f'{v["public_owner_id"]} {v["voice_id"]}  {v["name"][:28]:28} {v.get("gender", ""):7} '
            f'{v.get("accent", ""):14} {v.get("use_case", ""):14} usos:{v.get("usage_character_count_1y", 0)}  {(v.get("description") or "")[:60]}'
        )
        if v.get("preview_url"):
            print(f'      preview: {v["preview_url"]}')


def cmd_add_voice(a):
    r = call("POST", f"/v1/voices/add/{a.owner}/{a.voice_id}", {"new_name": a.name})
    print("Agregada a tu cuenta. voice_id =", r.get("voice_id"))


def cmd_generate(a):
    cfg = json.load(open(a.config, encoding="utf-8"))
    only = set(a.only.split(",")) if a.only else {"voice", "sfx", "music"}
    ids = set(a.ids.split(",")) if a.ids else None
    os.makedirs(a.out, exist_ok=True)
    rel = lambda p: p.replace("\\", "/").split("public/", 1)[-1]
    summary = {"voice": [], "sfx": [], "music": None}

    if "voice" in only and cfg.get("lines"):
        v = cfg["voice"]
        if not v.get("voice_id"):
            sys.exit("Falta voice.voice_id en el config (usa `voices` o `library` para elegir una)")
        for line in cfg["lines"]:
            if ids and line["id"] not in ids:
                continue
            settings = dict(v.get("settings", {}))
            if "speed" in line:
                settings["speed"] = line["speed"]
            body = {"text": line["text"], "model_id": v.get("model_id", "eleven_multilingual_v2"), "voice_settings": settings}
            if v.get("language_code") and v.get("model_id", "").startswith(("eleven_flash", "eleven_turbo", "eleven_v3")):
                body["language_code"] = v["language_code"]
            audio = call("POST", f'/v1/text-to-speech/{v["voice_id"]}', body, {"output_format": FORMAT}, raw=True)
            path = os.path.join(a.out, f'voz-{line["id"]}.mp3')
            sec, fr = save(path, audio, a.fps)
            summary["voice"].append({"id": line["id"], "file": rel(path), "sec": sec, "frames": fr})
            print(f'voz {line["id"]:>4}  {sec:5.2f} s  {fr:4d} f  {line["text"]}')

    if "sfx" in only:
        for fx in cfg.get("sfx", []):
            if ids and fx["id"] not in ids:
                continue
            body = {"text": fx["text"], "prompt_influence": fx.get("prompt_influence", 0.5)}
            if fx.get("duration"):
                body["duration_seconds"] = max(0.5, min(30, fx["duration"]))
            audio = call("POST", "/v1/sound-generation", body, {"output_format": FORMAT}, raw=True)
            path = os.path.join(a.out, f'sfx-{fx["id"]}.mp3')
            sec, fr = save(path, audio, a.fps)
            summary["sfx"].append({"id": fx["id"], "file": rel(path), "sec": sec, "frames": fr})
            print(f'sfx {fx["id"]:>8}  {sec:5.2f} s  {fr:4d} f  {fx["text"]}')

    m = cfg.get("music")
    if "music" in only and m and (not ids or m.get("id", "musica") in ids):
        body = {"prompt": m["prompt"], "music_length_ms": m.get("length_ms", 20000), "model_id": m.get("model_id", "music_v1")}
        audio = call("POST", "/v1/music", body, {"output_format": FORMAT}, raw=True)
        path = os.path.join(a.out, f'{m.get("id", "musica")}.mp3')
        sec, fr = save(path, audio, a.fps)
        summary["music"] = {"file": rel(path), "sec": sec, "frames": fr}
        print(f'música  {sec:5.2f} s  {fr:4d} f  {m["prompt"][:70]}')

    print(json.dumps(summary, ensure_ascii=False))


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("quota").set_defaults(fn=cmd_quota)
    sub.add_parser("voices").set_defaults(fn=cmd_voices)
    p = sub.add_parser("library")
    p.add_argument("--language", default="es")
    p.add_argument("--gender")
    p.add_argument("--accent")
    p.add_argument("--search")
    p.add_argument("--limit", type=int, default=15)
    p.set_defaults(fn=cmd_library)
    p = sub.add_parser("add-voice")
    p.add_argument("owner")
    p.add_argument("voice_id")
    p.add_argument("name")
    p.set_defaults(fn=cmd_add_voice)
    p = sub.add_parser("generate")
    p.add_argument("--config", required=True)
    p.add_argument("--out", required=True)
    p.add_argument("--only")
    p.add_argument("--ids")
    p.add_argument("--fps", type=int, default=30)
    p.set_defaults(fn=cmd_generate)
    a = ap.parse_args()
    a.fn(a)


main()
