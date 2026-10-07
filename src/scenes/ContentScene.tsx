import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { AnimatedText } from "../components/AnimatedText";
import { THEME } from "../config";

type Props = { index: number; total: number; heading: string; body: string };

// Plantilla para cada punto de contenido.
// Para usar un clip de video o imagen: importa <Video/> o <Img/> de "remotion"
// y ponlo dentro de la zona marcada "MEDIA".
export const ContentScene: React.FC<Props> = ({ index, total, heading, body }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const vertical = width < 1200;

  const num = spring({ frame, fps, config: { damping: 12 } });
  const bodyOp = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const progress = interpolate(frame, [0, 5 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill
        style={{
          flexDirection: vertical ? "column" : "row",
          justifyContent: "center",
          alignItems: "center",
          padding: 120,
          gap: 80,
          fontFamily: THEME.fontTitle,
        }}
      >
        {/* Número grande */}
        <div
          style={{
            fontSize: vertical ? 320 : 380,
            fontWeight: 900,
            lineHeight: 1,
            background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.accent})`,
            WebkitBackgroundClip: "text",
            color: "transparent",
            transform: `scale(${num})`,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Texto */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            alignItems: vertical ? "center" : "flex-start",
            maxWidth: 900,
          }}
        >
          <AnimatedText
            text={heading}
            fontSize={vertical ? 100 : 96}
            color={THEME.text}
            delay={8}
            fontFamily={THEME.fontTitle}
          />
          <div
            style={{
              fontSize: vertical ? 48 : 44,
              color: THEME.muted,
              opacity: bodyOp,
              textAlign: vertical ? "center" : "left",
              lineHeight: 1.35,
              fontFamily: THEME.fontBody,
            }}
          >
            {body}
          </div>
        </div>

        {/* MEDIA: aquí puedes poner <Video src={staticFile("clip.mp4")} /> o <Img /> */}
      </AbsoluteFill>

      {/* Barra de progreso inferior */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 120,
          right: 120,
          height: 8,
          borderRadius: 4,
          background: "rgba(255,255,255,0.12)",
        }}
      >
        <div
          style={{
            width: `${((index + progress) / total) * 100}%`,
            height: "100%",
            borderRadius: 4,
            background: `linear-gradient(90deg, ${THEME.primary}, ${THEME.accent})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
