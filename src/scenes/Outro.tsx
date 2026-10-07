import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { AnimatedText } from "../components/AnimatedText";
import { CONTENT, THEME } from "../config";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const vertical = width < 1200;

  const cta = spring({ frame: frame - 25, fps, config: { damping: 10 } });
  const pulse = 1 + Math.sin(frame / 8) * 0.03;

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 60,
          padding: 100,
          fontFamily: THEME.fontTitle,
        }}
      >
        <AnimatedText
          text={CONTENT.outroTitle}
          fontSize={vertical ? 120 : 130}
          color={THEME.text}
          fontFamily={THEME.fontTitle}
        />
        <div
          style={{
            transform: `scale(${cta * pulse})`,
            opacity: interpolate(cta, [0, 1], [0, 1]),
            padding: "28px 64px",
            borderRadius: 999,
            fontSize: vertical ? 48 : 44,
            fontWeight: 700,
            color: "#fff",
            background: `linear-gradient(90deg, ${THEME.primary}, ${THEME.accent})`,
            boxShadow: `0 20px 60px ${THEME.primary}66`,
          }}
        >
          {CONTENT.outroCta}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
