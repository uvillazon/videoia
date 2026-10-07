import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { measureText } from "@remotion/layout-utils";
import { POPPINS } from "./fonts";
import { Icon } from "./Shapes";
import { FPB, PROMO, T, type PromoWord } from "./script";

const REF = 200;
const cache = new Map<string, number>();
const textWidth = (text: string, size: number) => {
  let w = cache.get(text);
  if (w === undefined) {
    w = measureText({ text, fontFamily: POPPINS, fontWeight: "900", fontSize: REF }).width;
    cache.set(text, w);
  }
  return (w * size) / REF;
};

// Tipografía cinética con "layout smoothing" elástico:
// cada palabra entra de golpe (spring con rebote) y su ancho crece, así EMPUJA a las demás.
// Al salir, rota -15° y se encoge a cero.
export const KineticScene: React.FC<{
  lines: PromoWord[][];
  durationInFrames: number;
  hold?: boolean; // true = no sale (última escena)
  tag?: string;
  footer?: string;
}> = ({ lines, durationInFrames, hold, tag, footer }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const landscape = width > height;

  const base = width * (landscape ? 0.125 : 0.21);
  const GAP = 0.24;
  const maxW = width * 0.9;

  // Un solo tamaño para todas las líneas: el necesario para que la más larga quepa
  // (y para que el bloque entre en pantalla a lo alto)
  const fitW = Math.min(
    1,
    ...lines.map((line) => {
      const total = line.reduce(
        (a, w, i) => a + textWidth(w.t, base) + (i ? base * GAP : 0),
        0
      );
      return maxW / total;
    })
  );
  const fitH = Math.min(1, (height * 0.56) / (lines.length * base * 1.1));
  const size = base * Math.min(fitW, fitH);
  const gap = size * GAP;

  let n = -1;

  const exitAll = hold
    ? 0
    : interpolate(frame, [durationInFrames - 1.25 * FPB, durationInFrames - 0.7 * FPB], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  const small = Math.min(width, height) * 0.032;
  const smallIn = interpolate(frame, [FPB, FPB * 1.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: size * 0.02 }}>
      {tag && (
        <div
          style={{
            position: "absolute",
            top: height * 0.09,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: small * 0.6,
            opacity: smallIn * (1 - exitAll),
            transform: `translateY(${(1 - smallIn) * -20}px)`,
          }}
        >
          {PROMO.logoSrc ? (
            <Img src={staticFile(PROMO.logoSrc)} style={{ height: small * 2.4, objectFit: "contain" }} />
          ) : (
            <>
              <div style={{ width: small * 1.4, height: small * 1.4, display: "flex" }}>
                <Icon kind="bolt" color={T.accent} />
              </div>
              <div
                style={{
                  fontFamily: POPPINS,
                  fontWeight: 900,
                  fontSize: small,
                  letterSpacing: small * 0.35,
                  color: T.muted,
                  whiteSpace: "nowrap",
                }}
              >
                {tag}
              </div>
            </>
          )}
        </div>
      )}

      {lines.map((line, li) => (
        <div
          key={li}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: size * 1.08,
          }}
        >
          {line.map((w, wi) => {
            n += 1;
            const idx = n;
            const enter = idx * 0.5 * FPB; // una palabra cada medio beat

            const p = spring({
              frame: frame - enter,
              fps,
              config: { damping: 9, stiffness: 170, mass: 0.7 },
            });

            const exitStart = durationInFrames - 1.25 * FPB + idx * 0.1 * FPB;
            const q = hold
              ? 0
              : interpolate(frame, [exitStart, exitStart + 0.55 * FPB], [0, 1], {
                  easing: Easing.in(Easing.cubic),
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });

            const full = textWidth(w.t, size) + (wi ? gap : 0);
            const vis = Math.max(0, p) * (1 - q);

            return (
              <div
                key={wi}
                style={{
                  width: full * vis,
                  flex: "0 0 auto",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    flex: "0 0 auto",
                    paddingLeft: wi ? gap : 0,
                    fontFamily: POPPINS,
                    fontWeight: 900,
                    fontSize: size,
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                    color: w.accent ? T.accent : T.ink,
                    opacity: interpolate(frame - enter, [0, 2], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                    transform: `translateY(${interpolate(p, [0, 1], [-size * 1.7, 0])}px) rotate(${
                      interpolate(p, [0, 1], [14, 0]) - 15 * q
                    }deg) scale(${interpolate(p, [0, 1], [2.4, 1]) * (1 - q)})`,
                    textShadow: `0 ${size * 0.05}px ${size * 0.14}px ${T.shadow}`,
                  }}
                >
                  {w.t}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {footer && (
        <div
          style={{
            position: "absolute",
            bottom: height * 0.08,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: POPPINS,
            fontWeight: 900,
            fontSize: small * 1.1,
            letterSpacing: small * 0.25,
            color: T.muted,
            opacity: smallIn * (1 - exitAll),
            transform: `translateY(${(1 - smallIn) * 20}px)`,
          }}
        >
          {footer}
        </div>
      )}
    </AbsoluteFill>
  );
};
