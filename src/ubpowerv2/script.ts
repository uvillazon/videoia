import { useVideoConfig } from "remotion";
import { FPS } from "../config";

// =====================================================
//  COMERCIAL UB POWER V2 · 20 s · ElevenLabs, voz masculina profesional
//  (copia independiente de src/ubpowerv1; editar aquí no afecta a UBPower)
// =====================================================

export const BPM = 140;
export const FPB = (FPS * 60) / BPM; // frames por beat (≈ 12.86 a 30 fps)
export const beat = (b: number) => Math.round(b * FPB);
export const WEB_START = FPS * 20; // 600: escena final del navegador
export const WEB_FRAMES = FPS * 5; // 5 s
export const UB_TOTAL = WEB_START + WEB_FRAMES; // 750 frames = 25 s

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
  logo: "ubpowerv2/logo.webp",
  banner: "ubpowerv2/banner-suv.webp",
  promo: "ubpowerv2/promo-focus.jpg",
  // Capturas reales de comercialubpower.com (chrome headless). h = alto útil del contenido (sin el blanco del final)
  webDesktop: { src: "ubpowerv2/web-desktop.png", w: 1440, h: 1740 },
  webMobile: { src: "ubpowerv2/web-mobile.png", w: 800, h: 4130 },
  music: "ubpowerv2/audio/musica.mp3" as string | null, // ElevenLabs Music (dura 38 s; se usan los primeros 20 con fade-out)
  musicVolume: 0.55,
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
  webTitle: "Visítanos en nuestra página web",
  webUrl: "comercialubpower.com",
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

// ---------- Audio (ElevenLabs) ----------
// Se genera con el skill /elevenlabs desde src/ubpowerv2/audio.json → public/ubpowerv2/audio/
// `at` = frame absoluto donde empieza; `frames` = duración del archivo (la imprime el generador)
const at = (scene: keyof typeof SCENE_BEATS | "web", offset: number) =>
  (scene === "web" ? WEB_START : beat(SCENE_BEATS[scene])) + offset;
type Cue = { file: string; at: number; frames: number; volume?: number };

export const AUDIO = {
  voiceOn: true,
  sfxOn: true,
  voiceVolume: 1,
  sfxVolume: 0.6,
  musicDucked: 0.25, // volumen de la música mientras habla la voz
  // Se completan después de generar el audio (vacío = el video corre en silencio sin errores)
  // Voz: Emanuel (ElevenLabs, latino neutro, grave y cálida)
  voice: [
    { file: "ubpowerv2/audio/voz-01.mp3", at: at("hook", 36), frames: 43 }, // ¿Tu auto no arranca?
    { file: "ubpowerv2/audio/voz-02.mp3", at: at("spark", 8), frames: 72 }, // En UB Power, ¡tenemos la energía!
    { file: "ubpowerv2/audio/voz-03.mp3", at: at("hero", 14), frames: 77 }, // La batería ideal para tu auto o moto
    { file: "ubpowerv2/audio/voz-04.mp3", at: at("catalog", -2), frames: 87 }, // Baterías, luces LED, llantas y más
    { file: "ubpowerv2/audio/voz-05.mp3", at: at("offer", 10), frames: 89 }, // ¡Diez por ciento de descuento en baterías Focus!
    { file: "ubpowerv2/audio/voz-06.mp3", at: at("close", -10), frames: 95 }, // UB Power: la energía que te pone en marcha
    { file: "ubpowerv2/audio/voz-07.mp3", at: at("web", 18), frames: 90 }, // Visítanos en comercialubpower.com
  ] as Cue[],
  sfx: [
    { file: "ubpowerv2/audio/sfx-starter.mp3", at: at("hook", 0), frames: 51, volume: 1 },
    { file: "ubpowerv2/audio/sfx-zap.mp3", at: at("spark", 2), frames: 51, volume: 0.8 },
    { file: "ubpowerv2/audio/sfx-whoosh.mp3", at: at("hero", -10), frames: 20, volume: 0.8 },
    { file: "ubpowerv2/audio/sfx-whoosh.mp3", at: at("catalog", -10), frames: 20, volume: 0.8 },
    { file: "ubpowerv2/audio/sfx-impact.mp3", at: at("offer", 0), frames: 33, volume: 1 },
    { file: "ubpowerv2/audio/sfx-chime.mp3", at: at("close", 0), frames: 47, volume: 0.7 },
    { file: "ubpowerv2/audio/sfx-whoosh.mp3", at: at("web", -10), frames: 20, volume: 0.8 },
    { file: "ubpowerv2/audio/sfx-typing.mp3", at: at("web", 12), frames: 44, volume: 0.9 },
    { file: "ubpowerv2/audio/sfx-click.mp3", at: at("web", 54), frames: 17, volume: 1 },
  ] as Cue[],
};

// Medidas responsivas: sirve igual para 16:9 y 9:16
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const v = height > width;
  const u = Math.min(width, height) / 1080;
  return { width, height, v, u };
};
