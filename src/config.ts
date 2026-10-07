// =====================================================
//  CONFIG CENTRAL: aquí cambias casi todo el video
//  (textos, colores, duraciones, fuentes)
// =====================================================

export const FPS = 30;

export const THEME = {
  bg: "#0b0f1a",
  bg2: "#1b1140",
  primary: "#6c5ce7",
  accent: "#00d2ff",
  text: "#ffffff",
  muted: "#a9b0c7",
  fontTitle: "Inter, 'Helvetica Neue', Arial, sans-serif",
  fontBody: "Inter, 'Helvetica Neue', Arial, sans-serif",
};

// Duración de cada escena en segundos
export const SCENES = {
  intro: 4,
  content: 5, // duración POR cada punto de contenido
  outro: 4,
  transition: 0.6, // segundos de transición entre escenas
};

export const CONTENT = {
  brand: "MI MARCA",
  title: "Tu título principal",
  subtitle: "Subtítulo que explica la idea en una línea",
  points: [
    { heading: "Punto 1", body: "Descripción corta del primer punto." },
    { heading: "Punto 2", body: "Descripción corta del segundo punto." },
    { heading: "Punto 3", body: "Descripción corta del tercer punto." },
  ],
  outroTitle: "¡Gracias por ver!",
  outroCta: "Suscríbete · @tuusuario",
  // Para música: pon un archivo en /public/music.mp3 y pon true
  useMusic: false,
  musicFile: "music.mp3",
  musicVolume: 0.25,
};

// Cálculo de duración total (no tocar salvo que cambies la estructura)
export const totalFrames = () => {
  const n = CONTENT.points.length;
  const seconds =
    SCENES.intro +
    SCENES.content * n +
    SCENES.outro -
    SCENES.transition * (n + 1);
  return Math.round(seconds * FPS);
};
