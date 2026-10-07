import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { AnimatedText } from "../components/AnimatedText";
import { CONTENT, THEME } from "../config";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const vertical = width < 1200;

  const brand = spring({ frame, fps, config: { damping: 200 } });
  const line = spring({ frame: frame - 10, fps, config: { damping: 200 } });
  const sub = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: 100,
          gap: 36,
          fontFamily: THEME.fontTitle,
        }}
      >
        <div
          style={{
            color: THEME.accent,
            letterSpacing: 12,
            fontSize: vertical ? 34 : 30,
            fontWeight: 700,
            opacity: brand,
          }}
        >
          {CONTENT.brand}
        </div>

        <div
          style={{
            height: 6,
            width: 220 * line,
            background: `linear-gradient(90deg, ${THEME.primary}, ${THEME.accent})`,
            borderRadius: 3,
          }}
        />

        <AnimatedText
          text={CONTENT.title}
          fontSize={vertical ? 104 : 120}
          color={THEME.text}
          delay={15}
          fontFamily={THEME.fontTitle}
        />

        <div
          style={{
            opacity: sub,
            transform: `translateY(${(1 - sub) * 20}px)`,
            color: THEME.muted,
            fontSize: vertical ? 44 : 40,
            textAlign: "center",
            maxWidth: 1200,
            fontFamily: THEME.fontBody,
          }}
        >
          {CONTENT.subtitle}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
