import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming, type TransitionPresentation } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { FPS } from "../config";
import { Intro } from "../scenes/Intro";
import { Outro } from "../scenes/Outro";
import { ClipScene } from "./ClipScene";
import { MONTAGE, type Clip, type ResolvedClip } from "./clips";

export type MontageProps = {
  clips: ResolvedClip[];
  transFrames: number;
};

const sec = (s: number) => Math.round(s * FPS);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const presentationFor = (t: Clip["transition"] | undefined, i: number): TransitionPresentation<any> => {
  const kind = t ?? (["fade", "slide", "wipe"] as const)[i % 3];
  if (kind === "slide") return slide({ direction: "from-right" });
  if (kind === "wipe") return wipe({ direction: "from-left" });
  return fade();
};

export const Montage: React.FC<MontageProps> = ({ clips, transFrames }) => {
  const timing = linearTiming({ durationInFrames: Math.max(1, transFrames) });
  const items: React.ReactNode[] = [];

  if (MONTAGE.withIntro) {
    items.push(
      <TransitionSeries.Sequence key="intro" durationInFrames={sec(MONTAGE.introSec)}>
        <Intro />
      </TransitionSeries.Sequence>
    );
  }

  clips.forEach((clip, i) => {
    if (items.length > 0) {
      items.push(
        <TransitionSeries.Transition
          key={`t-${i}`}
          presentation={presentationFor(clip.transition, i)}
          timing={timing}
        />
      );
    }
    items.push(
      <TransitionSeries.Sequence key={`c-${i}`} durationInFrames={clip.frames}>
        <ClipScene clip={clip} />
      </TransitionSeries.Sequence>
    );
  });

  if (MONTAGE.withOutro) {
    if (items.length > 0) {
      items.push(
        <TransitionSeries.Transition key="t-out" presentation={fade()} timing={timing} />
      );
    }
    items.push(
      <TransitionSeries.Sequence key="outro" durationInFrames={sec(MONTAGE.outroSec)}>
        <Outro />
      </TransitionSeries.Sequence>
    );
  }

  if (items.length === 0) {
    return (
      <AbsoluteFill
        style={{
          background: "#111",
          color: "#fff",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 48,
          fontFamily: "sans-serif",
          textAlign: "center",
          padding: 80,
        }}
      >
        Agrega tus videos en public/clips/ y lístalos en src/montage/clips.ts
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      {MONTAGE.music && (
        <Audio src={staticFile(MONTAGE.music)} volume={MONTAGE.musicVolume} loop />
      )}
      <TransitionSeries>{items}</TransitionSeries>
    </AbsoluteFill>
  );
};
