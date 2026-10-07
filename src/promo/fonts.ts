import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

// Poppins Black (900) incluida en el proyecto (public/fonts) → funciona sin internet.
export const POPPINS = "PoppinsBlack, Poppins, 'Helvetica Neue', Arial, sans-serif";

let loading: Promise<unknown> | null = null;
const loadPoppins = () => {
  if (!loading) {
    const face = new FontFace("PoppinsBlack", `url(${staticFile("fonts/poppins-900.woff2")}) format("woff2")`, {
      weight: "900",
      style: "normal",
    });
    loading = face.load().then((f) => {
      (document.fonts as unknown as { add: (face: FontFace) => void }).add(f);
    });
  }
  return loading;
};

// Espera a que la fuente esté cargada antes de medir/dibujar texto
export const useFontReady = () => {
  const [handle] = useState(() => delayRender("Cargando Poppins Black"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    loadPoppins()
      .catch(() => undefined)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);
  return ready;
};
