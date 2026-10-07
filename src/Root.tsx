import { Composition, staticFile, type CalculateMetadataFunction } from "remotion";
import { getVideoMetadata } from "@remotion/media-utils";
import { Main } from "./Main";
import { Montage, type MontageProps } from "./montage/Montage";
import { CLIPS, MONTAGE } from "./montage/clips";
import { Promo } from "./promo/Promo";
import { promoTotalFrames } from "./promo/script";
import { FPS, totalFrames } from "./config";
import { UBPower } from "./ubpower/UBPower";
import { UB_TOTAL } from "./ubpower/script";
import { UBPowerV1 } from "./ubpowerv1/UBPowerV1";
import { UB_TOTAL as UBV1_TOTAL } from "./ubpowerv1/script";
import { UBPowerV2 } from "./ubpowerv2/UBPowerV2";
import { UB_TOTAL as UBV2_TOTAL } from "./ubpowerv2/script";

const sec = (s: number) => Math.round(s * FPS);

// Lee la duración real de cada video y calcula la duración total del montaje
const calculateMontage: CalculateMetadataFunction<MontageProps> = async () => {
  const clips = await Promise.all(
    CLIPS.map(async (c) => {
      let end = c.endSec;
      if (end === undefined) {
        const meta = await getVideoMetadata(staticFile(c.file));
        end = meta.durationInSeconds;
      }
      const frames = Math.max(1, Math.round((end - (c.startSec ?? 0)) * FPS));
      return { ...c, frames };
    })
  );

  const segments = [
    ...(MONTAGE.withIntro ? [sec(MONTAGE.introSec)] : []),
    ...clips.map((c) => c.frames),
    ...(MONTAGE.withOutro ? [sec(MONTAGE.outroSec)] : []),
  ];

  // La transición no puede ser más larga que el segmento más corto
  const shortest = segments.length ? Math.min(...segments) : 2;
  const transFrames = Math.max(1, Math.min(sec(MONTAGE.transitionSec), shortest - 1));

  const total = segments.reduce((a, b) => a + b, 0) - Math.max(0, segments.length - 1) * transFrames;

  return {
    durationInFrames: Math.max(FPS, total),
    props: { clips, transFrames },
  };
};

const montageDefaults: MontageProps = { clips: [], transFrames: sec(MONTAGE.transitionSec) };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ---------- Comercial UB Power 20 s ---------- */}
      <Composition id="UBPower" component={UBPower} durationInFrames={UB_TOTAL} fps={FPS} width={1920} height={1080} />
      <Composition id="UBPowerVertical" component={UBPower} durationInFrames={UB_TOTAL} fps={FPS} width={1080} height={1920} />

      {/* ---------- Comercial UB Power V1 · audio ElevenLabs ---------- */}
      <Composition id="UBPowerV1" component={UBPowerV1} durationInFrames={UBV1_TOTAL} fps={FPS} width={1920} height={1080} />
      <Composition id="UBPowerV1Vertical" component={UBPowerV1} durationInFrames={UBV1_TOTAL} fps={FPS} width={1080} height={1920} />

      {/* ---------- Comercial UB Power V2 · voz masculina profesional ---------- */}
      <Composition id="UBPowerV2" component={UBPowerV2} durationInFrames={UBV2_TOTAL} fps={FPS} width={1920} height={1080} />
      <Composition id="UBPowerV2Vertical" component={UBPowerV2} durationInFrames={UBV2_TOTAL} fps={FPS} width={1080} height={1920} />

      {/* ---------- Promo cinético 140 BPM (Aurora Glassmorphism) ---------- */}
      <Composition
        id="Promo"
        component={Promo}
        durationInFrames={promoTotalFrames()}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="PromoVertical"
        component={Promo}
        durationInFrames={promoTotalFrames()}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* ---------- Plantilla de texto/animación ---------- */}
      <Composition
        id="Main"
        component={Main}
        durationInFrames={totalFrames()}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="MainVertical"
        component={Main}
        durationInFrames={totalFrames()}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* ---------- Montaje con tus propios videos ---------- */}
      <Composition
        id="Montage"
        component={Montage}
        durationInFrames={FPS * 10}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={montageDefaults}
        calculateMetadata={calculateMontage}
      />
      <Composition
        id="MontageVertical"
        component={Montage}
        durationInFrames={FPS * 10}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={montageDefaults}
        calculateMetadata={calculateMontage}
      />
    </>
  );
};
