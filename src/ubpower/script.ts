import { useVideoConfig } from "remotion";
import { FPS } from "../config";

// =====================================================
//  COMERCIAL UB POWER · 20 s · todo lo editable está aquí
//  Cortes sincronizados a 140 BPM (misma pista que el promo)
// =====================================================

export const BPM = 140;
export const FPB = (FPS * 60) / BPM; // frames por beat (≈ 12.86 a 30 fps)
export const beat = (b: number) => Math.round(b * FPB);
export const UB_TOTAL = FPS * 20; // 600 frames

// pulse = 1 en el golpe del beat y cae a 0 antes del siguiente
export const beatPulse = (frame: number) => {
  const b = frame / FPB;
  return Math.pow(1 - (b - Math.floor(b)), 3);
};

export const COLORS = {
  navy: "#0b2540",
  navyDeep: "#050f1e",
  orange: "#ff7a00",
  orangeLight: "#ffa64d",
  cream: "#fbeccd",
  yellow: "#ffd21f",
  red: "#ff3b30",
  whatsapp: "#25d366",
  white: "#ffffff",
  muted: "#a9bdd6",
};

export const ASSETS = {
  logo: "ubpower/logo.webp",
  banner: "ubpower/banner-suv.webp",
  promo: "ubpower/promo-focus.jpg",
  music: null as string | null, // sin música de fondo; pon aquí tu pista (p. ej. "ubpower/musica.mp3")
  musicVolume: 0.8,
};

export const COPY = {
  hook: "¿Tu auto no arranca?",
  spark: ["Nosotros tenemos", "la energía"],
  heroTag: "Energía automotriz",
  heroLine: "La batería ideal para tu auto o moto",
  catalogTitle: "Todo para tu vehículo",
  catalog: [
    { icon: "battery", label: "Baterías para auto y moto" },
    { icon: "bulb", label: "Luces LED" },
    { icon: "drop", label: "Agua destilada y electrolito" },
    { icon: "tire", label: "Llantas y bornes" },
  ] as const,
  offerBrand: "Baterías FOCUS",
  offerBig: "10%",
  offerSmall: "DESCUENTO",
  offerLine: "Más potencia, menos precio",
  offerExtra: "Asesoramiento profesional",
  slogan: "La energía que te pone en marcha",
  whatsapp: "7270 8767",
  address: "Av. Chapare Nº 4767 · Km 4½",
  web: "comercialubpower.com",
};

// Inicio de cada escena en beats (la última termina en UB_TOTAL)
export const SCENE_BEATS = {
  hook: 0, // 0.0 s  ¿Tu auto no arranca?
  spark: 7, // 3.0 s  rayo + batería se carga
  hero: 14, // 6.0 s  banner SUV + marca
  catalog: 23, // 9.9 s  productos
  offer: 30, // 12.9 s oferta Focus 10 %
  close: 40, // 17.1 s logo + WhatsApp
};

// ---------- Audio: locución + efectos ----------
// Locución: skill /locucion (.claude/skills/locucion) · Efectos: tools/make_sfx.py
// `at` = frame absoluto donde empieza; `frames` = duración del archivo
const at = (scene: keyof typeof SCENE_BEATS, offset: number) => beat(SCENE_BEATS[scene]) + offset;

export const AUDIO = {
  voiceOn: true,
  sfxOn: true,
  voiceVolume: 1,
  sfxVolume: 0.55,
  musicDucked: 0.3, // volumen de la música mientras habla la voz
  // Archivos generados con el skill /locucion (edge-tts, es-BO-SofiaNeural) desde src/ubpower/locucion.json
  voice: [
    { file: "ubpower/voz/01.mp3", at: at("hook", 32), frames: 57 }, // ¿Tu auto no arranca?
    { file: "ubpower/voz/02.mp3", at: at("spark", 6), frames: 81 }, // En UB Power, tenemos la energía
    { file: "ubpower/voz/03.mp3", at: at("hero", 14), frames: 82 }, // La batería ideal para tu auto o moto
    { file: "ubpower/voz/04.mp3", at: at("catalog", -3), frames: 93 }, // Baterías, luces LED, llantas y más
    { file: "ubpower/voz/05.mp3", at: at("offer", 10), frames: 89 }, // ¡10 % de descuento en baterías Focus!
    { file: "ubpower/voz/06.mp3", at: at("close", -4), frames: 89 }, // UB Power: la energía que te pone en marcha
  ],
  sfx: [
    { file: "ubpower/sfx/starter.wav", at: at("hook", 0), frames: 48, volume: 1 },
    { file: "ubpower/sfx/zap.wav", at: at("spark", 2), frames: 48, volume: 0.7 },
    { file: "ubpower/sfx/whoosh.wav", at: at("hero", -8), frames: 17, volume: 0.8 },
    { file: "ubpower/sfx/whoosh.wav", at: at("catalog", -8), frames: 17, volume: 0.8 },
    { file: "ubpower/sfx/impact.wav", at: at("offer", 0), frames: 27, volume: 1 },
    { file: "ubpower/sfx/chime.wav", at: at("close", 0), frames: 42, volume: 0.6 },
  ],
};

// Medidas responsivas: sirve igual para 16:9 y 9:16
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const v = height > width;
  const u = Math.min(width, height) / 1080;
  return { width, height, v, u };
};
