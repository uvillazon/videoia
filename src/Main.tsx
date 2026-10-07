import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { CONTENT, FPS, SCENES } from "./config";
import { Intro } from "./scenes/Intro";
import { ContentScene } from "./scenes/ContentScene";
import { Outro } from "./scenes/Outro";

const sec = (s: number) => Math.round(s * FPS);

export const Main: React.FC = () => {
  const timing = linearTiming({ durationInFrames: sec(SCENES.transition) });

  // TransitionSeries necesita hijos directos (sin fragmentos),
  // por eso armamos la lista como array plano.
  const scenes: React.ReactNode[] = [
    <TransitionSeries.Sequence key="intro" durationInFrames={sec(SCENES.intro)}>
      <Intro />
    </TransitionSeries.Sequence>,
  ];

  CONTENT.points.forEach((p, i) => {
    scenes.push(
      <TransitionSeries.Transition
        key={`t-${i}`}
        presentation={i % 2 === 0 ? slide({ direction: "from-right" }) : fade()}
        timing={timing}
      />,
      <TransitionSeries.Sequence key={`s-${i}`} durationInFrames={sec(SCENES.content)}>
        <ContentScene
          index={i}
          total={CONTENT.points.length}
          heading={p.heading}
          body={p.body}
        />
      </TransitionSeries.Sequence>
    );
  });

  scenes.push(
    <TransitionSeries.Transition key="t-out" presentation={fade()} timing={timing} />,
    <TransitionSeries.Sequence key="outro" durationInFrames={sec(SCENES.outro)}>
      <Outro />
    </TransitionSeries.Sequence>
  );

  return (
    <AbsoluteFill>
      {CONTENT.useMusic && (
        <Audio src={staticFile(CONTENT.musicFile)} volume={CONTENT.musicVolume} />
      )}
      <TransitionSeries>{scenes}</TransitionSeries>
    </AbsoluteFill>
  );
};
