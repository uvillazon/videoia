import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AuroraBackground, PulseCircles, RadarRings } from "./Backdrop";
import { FloatingShapes } from "./Shapes";
import { KineticScene } from "./KineticScene";
import { TransitionOverlay } from "./Transitions";
import { useFontReady } from "./fonts";
import { FPB, PROMO, T, beatPhase, promoLayout } from "./script";

export const Promo: React.FC = () => {
  const ready = useFontReady();
  const frame = useCurrentFrame();
  const { pulse } = beatPhase(frame);

  const scenes = promoLayout();
  const trans = Math.round(PROMO.transitionBeats * FPB);

  if (!ready) return null;

  return (
    <AbsoluteFill style={{ background: T.bg, overflow: "hidden" }}>
      {PROMO.music && <Audio src={staticFile(PROMO.music)} volume={PROMO.musicVolume} />}

      {/* Capa continua de fondo: no se corta entre escenas */}
      <AuroraBackground />
      <RadarRings />
      <PulseCircles />
      <FloatingShapes layer="back" />

      {/* Texto: pequeño "latido" de escala en cada beat */}
      <AbsoluteFill style={{ transform: `scale(${1 + 0.015 * pulse})` }}>
        {scenes.map((s, i) => (
          <Sequence key={i} from={s.from} durationInFrames={s.dur}>
            <KineticScene
              lines={s.lines}
              durationInFrames={s.dur}
              hold={i === scenes.length - 1}
              tag={s.tag}
              footer={s.footer}
            />
          </Sequence>
        ))}
      </AbsoluteFill>

      {/* Las formas delanteras se ocultan en la escena final para no tapar el contacto */}
      <AbsoluteFill
        style={{
          opacity: interpolate(
            frame,
            [scenes[scenes.length - 1].from - 6, scenes[scenes.length - 1].from + 6],
            [1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          ),
        }}
      >
        <FloatingShapes layer="front" />
      </AbsoluteFill>

      {/* Transiciones centradas en cada corte */}
      {scenes.slice(0, -1).map((s, i) =>
        s.transitionOut ? (
          <Sequence key={`t${i}`} from={Math.round(s.end - trans / 2)} durationInFrames={trans}>
            <TransitionOverlay type={s.transitionOut} T={trans} />
          </Sequence>
        ) : null
      )}
    </AbsoluteFill>
  );
};
