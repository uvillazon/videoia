import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { T, beatPhase } from "./script";

// Fondo "aurora": gradientes radiales que respiran con el beat
export const AuroraBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { pulse } = beatPhase(frame);
  const t = frame / 30;

  const blob = (
    color: string,
    cx: number,
    cy: number,
    ax: number,
    ay: number,
    sp: number,
    ph: number,
    size: number
  ) => {
    const x = cx + Math.sin(t * sp + ph) * ax;
    const y = cy + Math.cos(t * sp * 0.8 + ph) * ay;
    const s = size + Math.sin(t * 1.3 + ph) * 4 + pulse * 3;
    return `radial-gradient(circle at ${x}% ${y}%, ${color} 0%, transparent ${s}%)`;
  };

  const [a, b, c, d] = T.blobs;
  return (
    <AbsoluteFill
      style={{
        background: [
          blob(a, 18, 22, 12, 10, 0.6, 0, 55),
          blob(b, 80, 25, 10, 12, 0.5, 2, 55),
          blob(c, 55, 88, 15, 8, 0.7, 4, 60),
          blob(d, 88, 82, 8, 10, 0.4, 1, 45),
          T.bg,
        ].join(", "),
      }}
    />
  );
};

// Anillos "radar": círculos punteados que giran en sentidos opuestos + barrido
export const RadarRings: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;
  const R = Math.min(width, height);

  const rings = [
    { r: 0.28, dash: "2 14", w: 3, speed: 22, op: 0.7 },
    { r: 0.38, dash: "30 18", w: 4, speed: -15, op: 0.55 },
    { r: 0.5, dash: "6 10", w: 2, speed: 9, op: 0.6 },
    { r: 0.64, dash: "90 40", w: 5, speed: -6, op: 0.35 },
    { r: 0.82, dash: "1 9", w: 6, speed: 4, op: 0.6 },
  ];

  const sweepSize = R * 1.0;
  const sweepAngle = (frame * 3.2) % 360;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: cx - sweepSize / 2,
          top: cy - sweepSize / 2,
          width: sweepSize,
          height: sweepSize,
          borderRadius: "50%",
          background: `conic-gradient(from ${sweepAngle}deg, rgba(92,192,255,0) 0deg, rgba(92,192,255,0.28) 70deg, rgba(92,192,255,0) 71deg)`,
          WebkitMaskImage: "radial-gradient(circle, black 45%, transparent 70%)",
          maskImage: "radial-gradient(circle, black 45%, transparent 70%)",
        }}
      />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {rings.map((r, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r.r * R}
            fill="none"
            stroke={i % 2 === 0 ? T.ring : T.ring2}
            strokeOpacity={i % 2 === 0 ? r.op : r.op * 0.4}
            strokeWidth={r.w}
            strokeDasharray={r.dash}
            strokeLinecap="round"
            transform={`rotate(${(frame * r.speed) / 30} ${cx} ${cy})`}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// Círculos de pulso: uno nace en cada beat y se expande
export const PulseCircles: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const { f } = beatPhase(frame);
  const R = Math.min(width, height);
  const cx = width / 2;
  const cy = height / 2;

  return (
    <AbsoluteFill>
      {[0, 1, 2, 3].map((k) => {
        const age = f + k; // en beats (0 = recién nacido)
        const r = interpolate(age, [0, 4], [0.12, 0.95]) * R * 0.6;
        const op = interpolate(age, [0, 4], [0.7, 0]);
        const bw = 3 + (1 - age / 4) * 6;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: cx - r,
              top: cy - r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              border: `${bw}px solid ${T.ring}`,
              background: `radial-gradient(circle, ${T.glow}, transparent 70%)`,
              opacity: op,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
