"""Genera los efectos de sonido del comercial UB Power en public/ubpower/sfx/ (sintetizados, sin derechos).

  starter.wav  motor que intenta arrancar y no puede (escena 1)
  zap.wav      descarga eléctrica que sube mientras se carga la batería (escena 2)
  whoosh.wav   barrido de aire para los cortes
  impact.wav   golpe grave para la oferta
  chime.wav    campanita brillante para el logo final

Uso:  python tools/make_sfx.py
"""
import math
import os
import random
import struct
import wave

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "ubpower", "sfx")
random.seed(11)


def save(name, buf, gain=0.9):
    peak = max(1e-9, max(abs(v) for v in buf))
    os.makedirs(OUT, exist_ok=True)
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", int(v / peak * gain * 32767)) for v in buf))
    print(f"{name}  {len(buf) / SR:.2f} s")


def lowpass(buf, a):
    out, y = [], 0.0
    for v in buf:
        y += a * (v - y)
        out.append(y)
    return out


def starter():
    # 3 intentos de arranque "rr-rr-rr" que se van debilitando + click final
    dur = 1.6
    n = int(SR * dur)
    noise = lowpass([random.uniform(-1, 1) for _ in range(n)], 0.08)
    buf = []
    for i in range(n):
        t = i / SR
        crank = 0.5 + 0.5 * math.sin(2 * math.pi * 9 * t)  # ciclos del motor de arranque
        tone = math.sin(2 * math.pi * 70 * t) + 0.5 * math.sin(2 * math.pi * 140 * t)
        env = max(0.0, 1 - t / 1.35) ** 1.4
        buf.append((noise[i] * 3 + tone * 0.6) * crank**2 * env)
    # click del relé al final
    c = int(SR * 1.42)
    for i in range(int(SR * 0.03)):
        buf[c + i] += random.uniform(-1, 1) * math.exp(-i / 120) * 0.9
    return buf


def zap():
    dur = 1.6
    n = int(SR * dur)
    buf, ph = [], 0.0
    for i in range(n):
        t = i / SR
        f = 180 + 1400 * (t / dur) ** 2
        ph += f / SR
        saw = 2 * (ph % 1) - 1
        crackle = random.uniform(-1, 1) if random.random() < 0.08 else 0.0
        env = min(1, t / 0.05) * (1 if t < dur - 0.25 else max(0, (dur - t) / 0.25))
        buf.append((saw * 0.45 + crackle * 0.8) * env * (0.4 + 0.6 * t / dur))
    return lowpass(buf, 0.35)


def whoosh():
    dur = 0.55
    n = int(SR * dur)
    buf, y = [], 0.0
    for i in range(n):
        t = i / SR
        a = 0.02 + 0.25 * math.sin(math.pi * t / dur)  # filtro que se abre y se cierra
        y += a * (random.uniform(-1, 1) - y)
        buf.append(y * math.sin(math.pi * t / dur) ** 2)
    return buf


def impact():
    dur = 0.9
    n = int(SR * dur)
    noise = lowpass([random.uniform(-1, 1) for _ in range(n)], 0.15)
    buf = []
    for i in range(n):
        t = i / SR
        f = 120 * math.exp(-t * 6) + 40
        boom = math.sin(2 * math.pi * f * t) * math.exp(-t * 4)
        buf.append(boom + noise[i] * math.exp(-t * 25) * 1.5)
    return buf


def chime():
    dur = 1.4
    n = int(SR * dur)
    notes = [(0.0, 1318.5), (0.09, 1975.5)]  # E6 → B6
    buf = [0.0] * n
    for start, f in notes:
        s = int(start * SR)
        for i in range(n - s):
            t = i / SR
            buf[s + i] += (math.sin(2 * math.pi * f * t) + 0.3 * math.sin(4 * math.pi * f * t)) * math.exp(-t * 3.5)
    return buf


if __name__ == "__main__":
    save("starter.wav", starter())
    save("zap.wav", zap(), 0.7)
    save("whoosh.wav", whoosh(), 0.8)
    save("impact.wav", impact())
    save("chime.wav", chime(), 0.6)
