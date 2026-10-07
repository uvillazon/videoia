# Proyecto: videos con Remotion

Proyecto de video programático (Remotion 4 + React + TypeScript). El usuario habla español; responde en español.

## Comandos
- `npm run dev` → Studio con vista previa en vivo (localhost:3000)
- `npm run build` / `build:vertical` → plantilla de texto (Main / MainVertical)
- `npm run build:montage` / `build:montage:vertical` → montaje con clips propios
- `npx tsc --noEmit` → verificar tipos SIEMPRE después de editar código

## Estructura
- `src/promo/` → promo cinético a 140 BPM; textos/escenas/colores en `src/promo/script.ts` (todo se sincroniza con `FPB`, frames por beat)
- `src/config.ts` → textos, colores, duraciones de la plantilla Main
- `src/Root.tsx` → registra composiciones (Main, MainVertical, Montage, MontageVertical)
- `src/montage/clips.ts` → lista de clips del montaje (orden, recortes, títulos, transiciones)
- `src/scenes/` y `src/components/` → escenas y piezas reutilizables
- `public/clips/` → videos del usuario; `public/` → música, imágenes, fuentes

## Reglas
- Todo valor de tiempo se calcula con `fps` (30). No uses `setTimeout`, CSS animations ni `Date`: solo `useCurrentFrame`, `interpolate` y `spring`.
- Los medios se cargan con `staticFile("ruta")` desde `public/`, usando `<OffthreadVideo>` para video e `<Img>` para imágenes.
- Para ordenar clips o leer duraciones, usa `ffprobe`/`ffmpeg` si están instalados.
- Cambios de estilo: edita `THEME` en `src/config.ts` antes de tocar componentes.
- Después de editar, ejecuta `npx tsc --noEmit` y avisa si hay errores. No hagas render completo sin que el usuario lo pida.
- Pide confirmación antes de borrar archivos del usuario en `public/`.

## Flujo típico
1. El usuario copia videos a `public/clips/`.
2. Lista los archivos, obtén la duración de cada uno con ffprobe y propone un orden.
3. Actualiza `src/montage/clips.ts`.
4. El usuario revisa en el Studio y pide ajustes.
