---
name: locucion
description: Genera locución (voz en off) en español con voces neuronales gratuitas de edge-tts y la sincroniza en un video de Remotion. Úsalo cuando el usuario pida voz, locución, narración, voz en off, "que hable", cambiar la voz o mejorar el audio hablado de un video del proyecto.
---

# Locución con edge-tts

Herramienta: `python .claude/skills/locucion/tts.py` (requiere `python -m pip install edge-tts`; usa internet, no necesita API key).

## Voces recomendadas
| Voz | Uso |
|---|---|
| `es-BO-SofiaNeural` / `es-BO-MarceloNeural` | **Bolivia**, Sofía es la predeterminada (preferencia del usuario: latino, voz de mujer) |
| `es-MX-JorgeNeural` / `es-MX-DaliaNeural` | Latino neutro |
| `es-AR-TomasNeural`, `es-CO-GonzaloNeural`, `es-US-AlonsoNeural`, `es-ES-AlvaroNeural` | Otras variantes |

Lista completa: `python .claude/skills/locucion/tts.py --list`.

## Flujo
1. **Guion por escena.** Una línea por escena, corta. Regla práctica a `rate +10%`: ~2.8 palabras por segundo. La voz debe terminar ≥ 0.3 s antes del siguiente corte. Escribe los números como se dicen ("diez por ciento", no "10 %"), y las siglas separadas si deben deletrearse ("U B Power").
2. **Archivo de líneas** junto al video, p. ej. `src/<video>/locucion.json`:
   ```json
   { "voice": "es-BO-MarceloNeural", "rate": "+10%", "pitch": "+0Hz",
     "lines": [ { "id": "01", "text": "¿Tu auto no arranca?" } ] }
   ```
   Cada línea acepta `voice`, `rate` o `pitch` propios.
3. **Generar:** `python .claude/skills/locucion/tts.py --lines src/<video>/locucion.json --out public/<video>/voz`
   Imprime la duración de cada mp3 en segundos y frames (30 fps) y un JSON resumen al final.
4. **Sincronizar en Remotion:** cada archivo va dentro de `<Sequence from={inicio} durationInFrames={frames}>` con `<Audio src={staticFile("…/voz/01.mp3")} />`. Usa los `frames` que imprimió el script; no los estimes. Si el video tiene bloque `AUDIO` en su `script.ts` (p. ej. `src/ubpower/script.ts`), actualiza ahí `file` y `frames`.
5. **Verificar encaje:** `inicio + frames` de cada línea no debe pisar la siguiente. Si no cabe: acorta el texto o sube `rate` (máximo ~`+20%`; más rápido suena atropellado). Nunca recortes el audio a la mitad de una palabra.
6. **Mezcla:** música bajo la voz ~0.3 (ducking), voz a 1.0, efectos ~0.5. Ejecuta `npx tsc --noEmit` y pide al usuario que escuche en el Studio. No hagas render completo sin que lo pida.

## Ajustes de estilo
- Más energía de anuncio: `rate "+12%"`, `pitch "+2Hz"`. Más serio o premium: `rate "+0%"`, `pitch "-4Hz"`.
- Puntuación = pausas: la coma da una pausa corta, el punto o los dos puntos una más larga, y los signos ¡! dan énfasis.
- edge-tts no admite SSML personalizado; para pausas extra divide la frase en dos líneas.

## Aviso
edge-tts usa el servicio de lectura en voz alta de Microsoft Edge de forma no oficial: es ideal para borradores y uso interno. Para piezas comerciales pagadas, sugiere al usuario confirmar los términos o pasar a un TTS con licencia comercial (Azure Speech con las mismas voces, ElevenLabs).
