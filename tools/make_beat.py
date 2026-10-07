"""Genera public/promo-beat.wav: un loop simple a 140 BPM (kick, clap, hi-hat) para sincronizar el video.
Es solo una pista guía/placeholder: reemplázala por tu música (ponla en /public y cambia PROMO.music).

Uso:  python3 tools/make_beat.py
"""
import math
import os
import random
import struct
import wave

BPM = 140
SR = 44100
BEATS = 38  # un poco más que el video (36 beats)

spb = 60.0 / BPM
total = int(SR * spb * BEATS)
buf = [0.0] * total
random.seed(7)


def add(start, samples):
    for i, v in enumerate(samples):
        j = start + i
        if j < total:
            buf[j] += v


def kick():
    out, phase = [], 0.0
    for n in range(int(0.28 * SR)):
        t = n / SR
        f = 48 + 120 * math.exp(-t * 32)
        phase += 2 * math.pi * f / SR
        out.append(math.sin(phase) * math.exp(-t * 9) * 0.95)
    return out


def hat():
    return [(random.random() * 2 - 1) * math.exp(-(n / SR) * 75) * 0.22 for n in range(int(0.06 * SR))]


def clap():
    out = [0.0] * int(0.18 * SR)
    for burst in (0.0, 0.012, 0.024):
        s = int(burst * SR)
        for n in range(int(0.14 * SR)):
            if s + n < len(out):
                out[s + n] += (random.random() * 2 - 1) * math.exp(-(n / SR) * 24) * 0.28
    return out


K, H, C = kick(), hat(), clap()
for b in range(BEATS):
    start = int(b * spb * SR)
    add(start, K)  # kick en cada beat
    add(int(start + spb * SR / 2), H)  # hi-hat a contratiempo
    if b % 2 == 1:
        add(start, C)  # clap en beats 2 y 4

peak = max(abs(x) for x in buf) or 1.0
os.makedirs("public", exist_ok=True)
with wave.open("public/promo-beat.wav", "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, x / peak * 0.85)) * 32767)) for x in buf))
print("OK -> public/promo-beat.wav")
