// =====================================================
//  MONTAJE: lista aquí tus clips en el orden en que quieres verlos
//  1) Copia tus videos a  public/clips/
//  2) Agrégalos a CLIPS (o pídele a Claude que los ordene por ti)
// =====================================================

export type Clip = {
  file: string; // ruta dentro de /public, ej: "clips/entrevista.mp4"
  title?: string; // texto opcional que aparece abajo (lower third)
  startSec?: number; // desde qué segundo del clip empieza (recorte)
  endSec?: number; // hasta qué segundo (si no pones nada, usa todo el clip)
  volume?: number; // 0 a 1 (por defecto 1)
  fit?: "cover" | "contain"; // cover = llena la pantalla, contain = se ve completo
  zoom?: boolean; // zoom lento tipo Ken Burns
  transition?: "fade" | "slide" | "wipe"; // transición al ENTRAR a este clip
};

export type ResolvedClip = Clip & { frames: number };

export const MONTAGE = {
  withIntro: true, // usa la escena Intro de config.ts
  withOutro: true, // usa la escena Outro de config.ts
  introSec: 3,
  outroSec: 4,
  transitionSec: 0.5,
  // Música de fondo: archivo en /public (ej. "music.mp3")
  music: null as string | null,
  musicVolume: 0.2,
};

export const CLIPS: Clip[] = [
  // Ejemplos (descomenta y cambia por tus archivos):
  // { file: "clips/clip1.mp4", title: "Escena 1", zoom: true },
  // { file: "clips/clip2.mp4", startSec: 2, endSec: 8, transition: "slide" },
  // { file: "clips/clip3.mp4", title: "Final", fit: "contain", transition: "wipe" },
];
