# 🎬 Video con IA — Esqueleto Remotion

Proyecto base para crear videos profesionales **con código** (equivalente a After Effects / Premiere, pero editable por texto). Claude modifica los archivos y tú ves el resultado en el navegador.

## Inicio rápido

Requisitos: [Node.js 18+](https://nodejs.org)

```bash
npm install
npm run dev            # abre el Studio (vista previa en vivo) en localhost:3000
npm run build          # renderiza out/video.mp4 (1920x1080)
npm run build:vertical # renderiza out/video-vertical.mp4 (1080x1920, TikTok/Reels)
npm run thumb          # genera una miniatura PNG
```

## Estructura

```
src/
  config.ts              ← AQUÍ cambias textos, colores, duraciones, música
  Root.tsx               ← registra los formatos (horizontal y vertical)
  Main.tsx               ← orden de escenas y transiciones
  scenes/
    Intro.tsx            ← escena de apertura
    ContentScene.tsx     ← plantilla que se repite por cada punto
    Outro.tsx            ← cierre con llamada a la acción
  components/
    Background.tsx       ← fondo animado (cámbialo por video/imagen)
    AnimatedText.tsx     ← texto con animación spring palabra por palabra
public/                  ← pon aquí tus videos, imágenes, música, fuentes
```

## Cómo trabajar con Claude (flujo recomendado)

1. Abre esta carpeta con **Claude Code** (`claude` en la terminal) o pásame los archivos aquí.
2. Deja `npm run dev` corriendo para ver los cambios al instante.
3. Pídeme cosas concretas, por ejemplo:
   - "Cambia la paleta a tonos naranja y negro"
   - "Agrega una escena con un gráfico de barras animado con estos datos: ..."
   - "Pon subtítulos sincronizados con este guion"
   - "Añade una transición tipo wipe entre la escena 2 y 3"
   - "Usa mi clip `public/entrevista.mp4` en la escena 2 con zoom lento"
4. Cuando te guste: `npm run build`.

## ⚡ Promo cinético (Aurora Glassmorphism · 140 BPM)

Composiciones `Promo` (16:9) y `PromoVertical` (9:16). Todo se edita en `src/promo/script.ts`:
textos y escenas (`PROMO_SCENES`), color azul, BPM, cantidad de formas flotantes, transiciones (`iris` / `tunnel`) y música.

```bash
npm run build:promo            # out/promo.mp4
npm run build:promo:vertical   # out/promo-vertical.mp4
npm run beat                   # regenera la pista guía public/promo-beat.wav (necesita python3)
```

- La pista `promo-beat.wav` es solo un loop guía (kick, clap, hi-hat). Para usar tu música a 140 BPM, ponla en `public/` y cambia `PROMO.music`. Si tu música tiene otro BPM, cambia `BPM`.
- Fuente: Poppins Black (se descarga sola desde Google Fonts, necesita internet la primera vez).
- Tu logo en las formas flotantes: pon el archivo en `public/` y define `PROMO.logoSrc = "logo.svg"`.

## 🎞️ Montaje con tus propios videos

1. Copia tus videos a `public/clips/`.
2. Lístalos en orden en `src/montage/clips.ts` (o dime "arma el montaje con estos clips" y lo hago yo).
3. Cada clip admite: `title`, `startSec`/`endSec` (recorte), `volume`, `fit`, `zoom` y `transition` (`fade`, `slide`, `wipe`).
4. En el Studio elige la composición **Montage** (horizontal) o **MontageVertical**.
5. Exporta con `npm run build:montage` o `npm run build:montage:vertical`.

La duración total se calcula sola leyendo cada video. La intro y el cierre salen de `config.ts` y se pueden apagar en `MONTAGE` (`withIntro`, `withOutro`).

## Cómo añadir tus propios medios

- **Video**: copia `clip.mp4` a `public/` y usa `<Video src={staticFile("clip.mp4")} />` (de `remotion`).
- **Imagen**: `<Img src={staticFile("foto.png")} />`.
- **Música/voz**: activa `useMusic: true` en `config.ts` y deja el archivo en `public/music.mp3`.
- **Fuentes de Google**: `npm i @remotion/google-fonts` y usa `loadFont()`.

## Equivalencias con Premiere / After Effects

| Premiere / AE | Remotion |
|---|---|
| Composición | `<Composition>` en Root.tsx |
| Capa | Componente React dentro de `<AbsoluteFill>` |
| Línea de tiempo / clips | `<Sequence from={..} durationInFrames={..}>` |
| Keyframes | `interpolate()` y `spring()` |
| Transiciones | `@remotion/transitions` |
| Precomposición | Cualquier componente reutilizable |
| Exportar | `npm run build` |

## Siguientes pasos útiles

- Voz en off con IA (ElevenLabs, etc.) + subtítulos automáticos (`@remotion/captions`)
- Gráficos de datos animados, mapas, código resaltado
- Plantillas por plataforma (YouTube, Reels, Shorts) usando las dos composiciones
