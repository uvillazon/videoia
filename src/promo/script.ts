import { FPS } from "../config";

// =====================================================
//  PROMO · todo lo editable del video está aquí
//  Contenido actual: UBPower Energía Automotriz (15 s)
// =====================================================

export const BPM = 140;
export const FPB = (FPS * 60) / BPM; // frames por beat (≈ 12.86 a 30 fps)
export const beatsToFrames = (b: number) => Math.round(b * FPB);

// Posición dentro del beat: pulse = 1 justo en el golpe, cae a 0 antes del siguiente
export const beatPhase = (frame: number) => {
  const b = frame / FPB;
  const f = b - Math.floor(b);
  return { b, f, pulse: Math.pow(1 - f, 3) };
};

// ---------- Temas de color ----------
export const THEMES = {
  // Azul marino de la marca (#001E43) + amarillo "energía"
  dark: {
    bg: "#001e43",
    blobs: ["#0a4fb3", "#0b84f3", "#00346e", "#123f8c", "#0b6fd6"],
    ink: "#ffffff",
    muted: "#9db8dd",
    accent: "#ffd21f",
    ring: "#5cc0ff",
    ring2: "#ffffff",
    iris: "#0b84f3",
    irisRim: "#001533",
    shadow: "rgba(0,10,30,0.45)",
    glassA: "rgba(150,205,255,0.55)",
    glassB: "rgba(150,205,255,0.10)",
    glassEdge: "rgba(200,230,255,0.85)",
    glassSide: "rgba(60,130,220,0.45)",
    glyph: "#ffd21f",
    glow: "rgba(11,132,243,0.35)",
  },
  // Aurora pastel (rosa, lavanda, azul suave)
  light: {
    bg: "#f3eeff",
    blobs: ["#ffbfe0", "#c9b3ff", "#b0d8ff", "#ffd8ec", "#d8c8ff"],
    ink: "#07070d",
    muted: "#555a7a",
    accent: "#0b84f3",
    ring: "#0b84f3",
    ring2: "#07070d",
    iris: "#0b84f3",
    irisRim: "#064fa8",
    shadow: "rgba(11,132,243,0.25)",
    glassA: "rgba(255,255,255,0.78)",
    glassB: "rgba(255,255,255,0.18)",
    glassEdge: "rgba(255,255,255,0.9)",
    glassSide: "rgba(176,208,255,0.35)",
    glyph: "#0b84f3",
    glow: "rgba(11,132,243,0.2)",
  },
};

export type ShapeKind = "bolt" | "battery" | "plus" | "minus" | "code" | "brackets" | "arrow";

export const PROMO = {
  theme: "dark" as keyof typeof THEMES,
  // Pista de audio en /public (se genera con tools/make_beat.py; reemplázala por tu música a 140 BPM)
  music: "promo-beat.wav" as string | null,
  musicVolume: 0.9,
  // Tu logo (archivo en /public, ej. "logoubpower.png"). null = se usa un rayo + texto.
  logoSrc: null as string | null,
  brandName: "UBPOWER",
  shapeKinds: ["bolt", "battery", "plus", "minus"] as ShapeKind[],
  transitionBeats: 1.25, // duración de cada transición
  shapeCount: 36, // cuántas formas flotan
};

export const T = THEMES[PROMO.theme];

export type PromoWord = { t: string; accent?: boolean };
export type PromoScene = {
  beats: number; // duración de la escena en beats
  lines: PromoWord[][]; // líneas de palabras; cada palabra "choca" cada medio beat
  transitionOut?: "iris" | "tunnel"; // transición hacia la siguiente escena
  tag?: string; // texto pequeño arriba (con rayo o logo)
  footer?: string; // texto pequeño abajo
};

export const PROMO_SCENES: PromoScene[] = [
  {
    beats: 6,
    lines: [
      [{ t: "¿TU" }, { t: "AUTO" }],
      [{ t: "NO" }, { t: "ARRANCA?", accent: true }],
    ],
    transitionOut: "iris",
  },
  {
    beats: 8,
    lines: [
      [{ t: "LA" }, { t: "ENERGÍA", accent: true }],
      [{ t: "QUE" }, { t: "TE" }, { t: "PONE" }],
      [{ t: "EN" }, { t: "MARCHA" }],
    ],
    tag: "UBPOWER · ENERGÍA AUTOMOTRIZ",
    transitionOut: "tunnel",
  },
  {
    beats: 7,
    lines: [
      [{ t: "AUTOBAT" }, { t: "TOYO" }],
      [{ t: "PIONERO" }, { t: "NAGOYA" }],
      [{ t: "AUTOS" }, { t: "Y" }, { t: "MOTOS", accent: true }],
    ],
    transitionOut: "iris",
  },
  {
    beats: 6,
    lines: [
      [{ t: "BATERÍAS" }, { t: "Y" }, { t: "LEDs" }],
      [{ t: "DESDE", accent: true }, { t: "Bs", accent: true }, { t: "326", accent: true }],
    ],
    transitionOut: "tunnel",
  },
  {
    beats: 8,
    lines: [
      [{ t: "ESCRÍBENOS" }],
      [{ t: "POR" }, { t: "WHATSAPP", accent: true }],
      [{ t: "+591" }, { t: "72708767", accent: true }],
    ],
    tag: "UBPOWER · ENERGÍA AUTOMOTRIZ",
    footer: "AV. CHAPARE Nro 4767 · KM 4",
  },
];

export const promoLayout = () => {
  let cum = 0;
  return PROMO_SCENES.map((s) => {
    const from = beatsToFrames(cum);
    cum += s.beats;
    const end = beatsToFrames(cum);
    return { ...s, from, end, dur: end - from };
  });
};

export const promoTotalFrames = () =>
  beatsToFrames(PROMO_SCENES.reduce((a, s) => a + s.beats, 0));
