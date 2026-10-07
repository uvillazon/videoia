import { useMemo } from "react";
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { POPPINS } from "./fonts";
import { PROMO, T, type ShapeKind } from "./script";

// Iconos propios dibujados en SVG (24x24)
export const Icon: React.FC<{ kind: ShapeKind; color: string }> = ({ kind, color }) => {
  const common = { width: "56%", height: "56%", viewBox: "0 0 24 24" } as const;
  if (kind === "bolt")
    return (
      <svg {...common}>
        <polygon points="13.5,1.5 4,13.5 10.8,13.5 8.8,22.5 20,9.5 13,9.5" fill={color} />
      </svg>
    );
  if (kind === "battery")
    return (
      <svg {...common}>
        <rect x="2" y="7" width="20" height="14" rx="2.2" fill="none" stroke={color} strokeWidth="2" />
        <rect x="5" y="3.5" width="4" height="3.5" rx="0.8" fill={color} />
        <rect x="15" y="3.5" width="4" height="3.5" rx="0.8" fill={color} />
        <rect x="5.5" y="12.5" width="5" height="2" rx="0.5" fill={color} />
        <rect x="14.5" y="12.5" width="5" height="2" rx="0.5" fill={color} />
        <rect x="16" y="11" width="2" height="5" rx="0.5" fill={color} />
      </svg>
    );
  const text = kind === "plus" ? "+" : kind === "minus" ? "−" : kind === "code" ? "</>" : kind === "brackets" ? "{ }" : "=>";
  return (
    <span style={{ color, fontFamily: POPPINS, fontWeight: 900, fontSize: "1.2em", lineHeight: 1 }}>{text}</span>
  );
};

// Formas de cristal 3D que flotan con desenfoque de profundidad de campo.
// layer="back": detrás del texto · layer="front": las más cercanas, delante del texto.
export const FloatingShapes: React.FC<{ layer: "back" | "front" }> = ({ layer }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / 30;
  const k = Math.min(width, height) / 1080;

  const items = useMemo(
    () =>
      Array.from({ length: PROMO.shapeCount }, (_, i) => {
        const d = random(`d-${i}`); // profundidad: 0 lejos, 1 cerca
        return {
          i,
          d,
          x: random(`x-${i}`),
          y: random(`y-${i}`),
          sp: 0.05 + random(`s-${i}`) * 0.09,
          ph: random(`p-${i}`) * 6.28,
          kind: PROMO.shapeKinds[Math.floor(random(`g-${i}`) * PROMO.shapeKinds.length)],
          size: 70 + d * d * 250,
          rx: random(`rx-${i}`) * 360,
          ry: random(`ry-${i}`) * 360,
          rsx: (random(`rsx-${i}`) - 0.5) * 90,
          rsy: (random(`rsy-${i}`) - 0.5) * 90,
          rsz: (random(`rsz-${i}`) - 0.5) * 40,
          useLogo: random(`l-${i}`) > 0.5,
        };
      }).sort((a, b) => a.d - b.d),
    []
  );

  const shown = items.filter((it) => (layer === "back" ? it.d < 0.82 : it.d >= 0.82));

  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {shown.map((it) => {
        const yf = ((((it.y + 1.2 - t * it.sp * (0.5 + it.d)) % 1.3) + 1.3) % 1.3) - 0.15;
        const xf = it.x * 1.1 - 0.05 + Math.sin(t * 0.7 + it.ph) * 0.02;
        const s = it.size * k;
        const blur = (1 + Math.abs(it.d - 0.5) * 20) * k; // foco en d≈0.5
        const bw = Math.max(1.5, s * 0.012);

        return (
          // El blur va en el contenedor externo (un filter aplanaría el 3D del interno)
          <div
            key={it.i}
            style={{
              position: "absolute",
              left: xf * width - s / 2,
              top: yf * height - s / 2,
              width: s,
              height: s,
              filter: `blur(${blur}px)`,
              opacity: 0.7 + 0.3 * it.d,
              perspective: s * 3,
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                transformStyle: "preserve-3d",
                transform: `rotateX(${it.rx + t * it.rsx}deg) rotateY(${it.ry + t * it.rsy}deg) rotateZ(${t * it.rsz}deg)`,
              }}
            >
              {[3, 2, 1, 0].map((z) => (
                <div
                  key={z}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: s * 0.28,
                    transform: `translateZ(${-z * s * 0.035}px)`,
                    background:
                      z === 0 ? `linear-gradient(135deg, ${T.glassA}, ${T.glassB})` : T.glassSide,
                    border: z === 0 ? `${bw}px solid ${T.glassEdge}` : "none",
                    boxShadow:
                      z === 0
                        ? `inset 0 0 ${s * 0.2}px rgba(255,255,255,0.35), 0 ${s * 0.15}px ${s * 0.35}px ${T.glow}`
                        : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: s * 0.3,
                  }}
                >
                  {z === 0 &&
                    (PROMO.logoSrc && it.useLogo ? (
                      <Img src={staticFile(PROMO.logoSrc)} style={{ width: "58%", height: "58%", objectFit: "contain" }} />
                    ) : (
                      <Icon kind={it.kind} color={T.glyph} />
                    ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
