import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../config";

// Fondo animado con gradiente y "orbes" flotantes.
// Puedes reemplazarlo por un <Video src=.../> o <Img src=.../>
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const angle = interpolate(frame, [0, durationInFrames], [120, 240]);

  const orb = (
    color: string,
    size: number,
    x: number,
    y: number,
    speed: number,
    phase: number
  ) => ({
    position: "absolute" as const,
    width: size,
    height: size,
    borderRadius: "50%",
    background: color,
    filter: "blur(120px)",
    opacity: 0.45,
    left: x * width + Math.sin(frame / speed + phase) * 120,
    top: y * height + Math.cos(frame / speed + phase) * 120,
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, ${THEME.bg}, ${THEME.bg2})`,
        overflow: "hidden",
      }}
    >
      <div style={orb(THEME.primary, 600, 0.1, 0.1, 40, 0)} />
      <div style={orb(THEME.accent, 500, 0.65, 0.55, 55, 2)} />
    </AbsoluteFill>
  );
};
