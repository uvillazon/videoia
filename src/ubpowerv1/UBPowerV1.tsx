import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { useFontReady } from "../promo/fonts";
import { CatalogScene, CloseScene, HeroScene, HookScene, OfferScene, SparkScene, WebScene } from "./Scenes";
import { ASSETS, AUDIO, SCENE_BEATS, UB_TOTAL, WEB_START, beat } from "./script";

const S = {
  hook: beat(SCENE_BEATS.hook),
  spark: beat(SCENE_BEATS.spark),
  hero: beat(SCENE_BEATS.hero),
  catalog: beat(SCENE_BEATS.catalog),
  offer: beat(SCENE_BEATS.offer),
  close: beat(SCENE_BEATS.close),
  web: WEB_START,
};
const CUTS = [S.spark, S.hero, S.catalog, S.offer, S.close, S.web];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 0..1: cuánto está hablando la voz en el frame f (con rampas de 6 frames)
const voiceActivity = (f: number) =>
  AUDIO.voiceOn
    ? Math.max(0, ...AUDIO.voice.map((v) => interpolate(f, [v.at - 6, v.at, v.at + v.frames - 10, v.at + v.frames - 4], [0, 1, 1, 0], clamp)))
    : 0;

export const UBPowerV1: React.FC = () => {
  useFontReady();
  const frame = useCurrentFrame();

  // Destello naranja en cada corte
  const flash = Math.max(
    0,
    ...CUTS.map((c) => interpolate(frame, [c - 2, c, c + 9], [0, 0.85, 0], clamp))
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence from={S.hook} durationInFrames={S.spark - S.hook} name="1 · Gancho">
        <HookScene />
      </Sequence>
      <Sequence from={S.spark} durationInFrames={S.hero - S.spark} name="2 · Chispa">
        <SparkScene />
      </Sequence>
      <Sequence from={S.hero} durationInFrames={S.catalog - S.hero} name="3 · Hero">
        <HeroScene duration={S.catalog - S.hero} />
      </Sequence>
      <Sequence from={S.catalog} durationInFrames={S.offer - S.catalog} name="4 · Catálogo">
        <CatalogScene />
      </Sequence>
      <Sequence from={S.offer} durationInFrames={S.close - S.offer} name="5 · Oferta">
        <OfferScene />
      </Sequence>
      <Sequence from={S.close} durationInFrames={S.web - S.close} name="6 · Cierre">
        <CloseScene />
      </Sequence>
      <Sequence from={S.web} durationInFrames={UB_TOTAL - S.web} name="7 · Web">
        <WebScene />
      </Sequence>

      <AbsoluteFill style={{ backgroundColor: "#ffb366", opacity: flash, pointerEvents: "none" }} />

      {ASSETS.music && (
        <Audio
          src={staticFile(ASSETS.music)}
          volume={(f) => {
            const base = ASSETS.musicVolume * (1 - voiceActivity(f) * (1 - AUDIO.musicDucked / ASSETS.musicVolume));
            return base * interpolate(f, [0, 6, UB_TOTAL - 30, UB_TOTAL], [0, 1, 1, 0], clamp);
          }}
        />
      )}

      {AUDIO.voiceOn &&
        AUDIO.voice.map((v) => (
          <Sequence key={v.file} from={v.at} durationInFrames={v.frames} name={`voz ${v.file.slice(-6)}`}>
            <Audio src={staticFile(v.file)} volume={AUDIO.voiceVolume * (v.volume ?? 1)} />
          </Sequence>
        ))}

      {AUDIO.sfxOn &&
        AUDIO.sfx.map((x, i) => (
          <Sequence key={i} from={Math.max(0, x.at)} durationInFrames={x.frames} name={`sfx ${x.file.split("/").pop()}`}>
            <Audio src={staticFile(x.file)} volume={AUDIO.sfxVolume * (x.volume ?? 1)} />
          </Sequence>
        ))}
    </AbsoluteFill>
  );
};
