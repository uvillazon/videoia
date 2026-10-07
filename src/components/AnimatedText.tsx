import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

type Props = {
  text: string;
  fontSize?: number;
  color?: string;
  delay?: number; // frames de retraso
  weight?: number;
  fontFamily?: string;
  stagger?: number; // frames entre palabras
};

// Texto que entra palabra por palabra con efecto "spring" (rebote suave)
export const AnimatedText: React.FC<Props> = ({
  text,
  fontSize = 96,
  color = "#fff",
  delay = 0,
  weight = 800,
  fontFamily,
  stagger = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: fontSize * 0.25,
        fontSize,
        fontWeight: weight,
        color,
        fontFamily,
        lineHeight: 1.1,
        textAlign: "center",
      }}
    >
      {words.map((w, i) => {
        const s = spring({
          frame: frame - delay - i * stagger,
          fps,
          config: { damping: 14, stiffness: 120 },
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: interpolate(s, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(s, [0, 1], [50, 0])}px) scale(${interpolate(s, [0, 1], [0.8, 1])})`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
