import {
  AbsoluteFill,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { THEME, FPS } from "../config";
import type { ResolvedClip } from "./clips";

export const ClipScene: React.FC<{ clip: ResolvedClip }> = ({ clip }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const vertical = width < 1200;

  const startFrom = Math.round((clip.startSec ?? 0) * FPS);
  const scale = clip.zoom
    ? interpolate(frame, [0, clip.frames], [1, 1.08], {
        extrapolateRight: "clamp",
      })
    : 1;

  const titleIn = spring({ frame: frame - 12, fps, config: { damping: 200 } });
  const titleOut = interpolate(
    frame,
    [clip.frames - 20, clip.frames - 8],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <OffthreadVideo
          src={staticFile(clip.file)}
          startFrom={startFrom}
          endAt={startFrom + clip.frames}
          volume={clip.volume ?? 1}
          style={{
            width: "100%",
            height: "100%",
            objectFit: clip.fit ?? "cover",
          }}
        />
      </AbsoluteFill>

      {clip.title && (
        <div
          style={{
            position: "absolute",
            left: vertical ? 60 : 100,
            bottom: vertical ? 220 : 110,
            opacity: titleIn * titleOut,
            transform: `translateX(${(1 - titleIn) * -60}px)`,
            display: "flex",
            alignItems: "stretch",
            gap: 24,
            fontFamily: THEME.fontTitle,
          }}
        >
          <div
            style={{
              width: 8,
              borderRadius: 4,
              background: `linear-gradient(${THEME.primary}, ${THEME.accent})`,
            }}
          />
          <div
            style={{
              color: "#fff",
              fontSize: vertical ? 64 : 56,
              fontWeight: 800,
              textShadow: "0 4px 24px rgba(0,0,0,0.6)",
            }}
          >
            {clip.title}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
