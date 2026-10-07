import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "./script";

// Transición azul masiva. Primera mitad: un iris azul crece y cubre todo.
// Segunda mitad: se abre un agujero que revela la escena siguiente.
// type "tunnel" añade anillos concéntricos que se disparan hacia la cámara.
export const TransitionOverlay: React.FC<{ type: "iris" | "tunnel"; T: number }> = ({ type, T: dur }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const diag = (Math.hypot(width, height) / 2) * 1.08;
  const half = dur / 2;
  const easing = Easing.bezier(0.76, 0, 0.24, 1);
  const RIM = Math.min(width, height) * 0.03;

  const r1 = interpolate(f, [0, half], [0, diag], { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const r2 = interpolate(f, [half, dur], [0, diag], { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const closing = f <= half;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {closing ? (
        <>
          <AbsoluteFill style={{ background: T.irisRim, clipPath: `circle(${r1}px at 50% 50%)` }} />
          <AbsoluteFill
            style={{ background: T.iris, clipPath: `circle(${Math.max(0, r1 - RIM)}px at 50% 50%)` }}
          />
        </>
      ) : (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% 50%, transparent ${r2}px, ${T.irisRim} ${r2 + 1}px ${
              r2 + RIM
            }px, ${T.iris} ${r2 + RIM + 1}px)`,
          }}
        />
      )}

      {type === "tunnel" && (
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 9 }, (_, i) => {
            const t = Math.min(1, Math.max(0, (f - i * 0.9) / (dur * 0.75)));
            if (t <= 0 || t >= 1) return null;
            const rad = Math.pow(t, 1.6) * diag * 1.3;
            return (
              <circle
                key={i}
                cx={width / 2}
                cy={height / 2}
                r={rad}
                fill="none"
                stroke={i % 2 === 0 ? "#ffffff" : T.accent}
                strokeWidth={interpolate(t, [0, 1], [4, 36])}
                strokeOpacity={1 - t * 0.35}
              />
            );
          })}
        </svg>
      )}
    </AbsoluteFill>
  );
};
