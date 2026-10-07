---
name: elevenlabs
description: Genera audio con ElevenLabs (locución, efectos de sonido y música) para videos de Remotion y lo sincroniza por escena. Úsalo cuando el usuario pida audio, voz o música con ElevenLabs, o trabaje en un video cuyo audio viene de ElevenLabs (p. ej. UBPowerV1). Para voz gratis sin API key usa el skill `locucion`.
---

# Audio con ElevenLabs

Herramienta: `python .claude/skills/elevenlabs/eleven.py <comando>` (solo librería estándar).
API key: `ELEVENLABS_API_KEY` o `KEY_ELEVENLABS` (el usuario usa esta) en el entorno o en `.env` en la raíz (ya está en `.gitignore`). Nunca imprimas, copies ni hagas commit de la clave. Si falta, pídele al usuario que cree el `.env` él mismo; no le pidas que la pegue en el chat.

## Preferencias del usuario
- Voz: **español latino, mujer**. Modelo `eleven_multilingual_v2` (o `eleven_v3` si quiere más expresión).
- Busca voces con `library --gender female --language es --accent latin` (prueba también `--accent mexican`, `colombian`, `argentine`). Muestra al usuario 3 o 4 opciones con su `preview` y deja que elija. Agrégala con `add-voice` y guarda el `voice_id` en el `audio.json`.

## Costos (avisar antes de generar)
- Voz: ~1 crédito por carácter. Un comercial de 20 s ≈ 250 caracteres.
- Efectos: ~40 créditos por segundo generado si se fija `duration`.
- **Plan gratis: las voces de la biblioteca (p. ej. Ninoska) NO se pueden usar por API (error 402 `paid_plan_required`)**; solo las voces premade de la cuenta. Los efectos sí funcionan en el plan gratis. Además, el plan gratis no permite uso comercial.
- El usuario tiene plan **Starter** desde 2026-10-07 (biblioteca de voces, música y licencia comercial). Voz elegida para UB Power: Ninoska `p4w8j6zCUDJ0nGJ3okKs`.
- Música: necesita plan pago. **`length_ms` puede ignorarse** (pedimos 20 s y llegó una pista de 38 s): usa la duración medida por el script y corta con un fade-out en Remotion. Si devuelve 401 o 402, avisa y sigue sin música.
- Revisa los créditos con `quota` antes de generar todo. Para regenerar una sola pieza usa `--ids 03` o `--only sfx`.

## Flujo
1. Config por video en `src/<video>/audio.json` (formato en el docstring de `eleven.py`): voz y ajustes, una línea por escena, prompts de efectos en **inglés** (funcionan mejor) con `duration`, y un prompt de música con BPM si el video está sincronizado al beat.
2. `generate --config src/<video>/audio.json --out public/<video>/audio` imprime segundos y **frames** de cada archivo y un JSON final.
3. Pega esos `frames` en el bloque `AUDIO` del `script.ts` del video (`voice`, `sfx`, `ASSETS.music`). Usa los valores impresos; no los estimes.
4. Encaje: `at + frames` de cada voz no debe pisar la siguiente línea. Si no cabe: acorta el texto o sube `speed` en esa línea (rango de 0.7 a 1.2).
5. Mezcla: voz 1.0, efectos ~0.6, música 0.8 con ducking a ~0.25 bajo la voz. Ejecuta `npx tsc --noEmit` y pide al usuario que escuche en el Studio. No hagas render completo sin que lo pida.

## Tips de texto para la voz
- Números y siglas escritos como se dicen: "diez por ciento", "U B Power".
- Signos ¡! y ¿? dan entonación; las comas dan pausas cortas.
- `stability` baja (0.3–0.45) da más emoción; alta (0.6+) da un tono más estable. `style` 0.2–0.4 para tono publicitario.
