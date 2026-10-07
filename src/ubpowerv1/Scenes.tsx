import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  interpolateColors,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { POPPINS } from "../promo/fonts";
import { BatteryIcon, Bolt, BulbIcon, DropIcon, PhoneIcon, TireIcon } from "./Icons";
import { ASSETS, COLORS, COPY, FPB, beatPulse, useLayout } from "./script";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const BODY = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

// Entrada con resorte: devuelve 0→1 empezando en `delay`
const useIn = (delay: number, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.7 } });
};

const Title: React.FC<{ children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties }> = ({
  children,
  size,
  color = COLORS.white,
  style,
}) => (
  <div
    style={{
      fontFamily: POPPINS,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1.05,
      color,
      textAlign: "center",
      letterSpacing: -1,
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------
// 1. GANCHO · batería vacía titilando + "¿Tu auto no arranca?"
// ---------------------------------------------------------------
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, v } = useLayout();

  // Parpadeo irregular, como un tablero que no enciende
  const flicker = random(`ub-flick-${Math.floor(frame / 2)}`) > 0.35 ? 1 : 0.12;
  const lightOn = frame < 48 ? flicker : interpolate(frame, [48, 58], [1, 0.3], clamp);
  const level = interpolate(frame, [0, 45], [0.22, 0.04], clamp);

  const t = useIn(14, 11);
  const shake = frame > 14 && frame < 44 ? Math.sin(frame * 2.4) * 7 * u * (1 - t * 0.6) : 0;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 42%, rgba(255,59,48,${0.22 * lightOn}) 0%, ${COLORS.navyDeep} 55%, #000 100%)`,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 70 * u,
      }}
    >
      <div style={{ opacity: lightOn, filter: `drop-shadow(0 0 ${30 * u}px rgba(255,59,48,0.7))` }}>
        <BatteryIcon size={(v ? 360 : 300) * u} level={level} fill={COLORS.red} stroke={COLORS.red} />
      </div>
      <Title
        size={(v ? 112 : 124) * u}
        style={{
          maxWidth: v ? 900 * u : 1700 * u,
          opacity: t,
          transform: `translate(${shake}px, ${(1 - t) * 60 * u}px) scale(${0.9 + t * 0.1})`,
        }}
      >
        {COPY.hook}
      </Title>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------
// 2. LA CHISPA · rayo naranja, batería se carga 0→100 %
// ---------------------------------------------------------------
export const SparkScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, v } = useLayout();

  const bolt = useIn(0, 9);
  const charge = interpolate(frame, [8, 50], [0.04, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const color = interpolateColors(charge, [0, 0.5, 1], [COLORS.red, COLORS.orange, COLORS.orangeLight]);
  const full = interpolate(frame, [48, 56], [0, 1], clamp);
  const l1 = useIn(46);
  const l2 = useIn(52);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 40%, rgba(255,122,0,${0.15 + charge * 0.35}) 0%, ${COLORS.navy} 45%, ${COLORS.navyDeep} 100%)`,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 50 * u,
      }}
    >
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 30 * u }}>
        <div
          style={{
            transform: `scale(${bolt}) rotate(${(1 - bolt) * -40}deg)`,
            filter: `drop-shadow(0 0 ${40 * u}px ${COLORS.orange})`,
          }}
        >
          <Bolt size={(v ? 150 : 130) * u} />
        </div>
        <div style={{ filter: `drop-shadow(0 0 ${(20 + full * 40) * u}px ${color})` }}>
          <BatteryIcon size={(v ? 380 : 330) * u} level={charge} fill={color} />
        </div>
      </div>
      <div
        style={{
          fontFamily: POPPINS,
          fontWeight: 900,
          fontSize: 64 * u,
          color,
          transform: `scale(${1 + full * 0.15 * beatPulse(frame)})`,
        }}
      >
        {Math.round(charge * 100)}%
      </div>
      <div>
        <Title size={(v ? 84 : 92) * u} style={{ opacity: l1, transform: `translateY(${(1 - l1) * 40 * u}px)` }}>
          {COPY.spark[0]}
        </Title>
        <Title
          size={(v ? 120 : 130) * u}
          color={COLORS.orange}
          style={{ opacity: l2, transform: `scale(${0.7 + l2 * 0.3})` }}
        >
          {COPY.spark[1]}
        </Title>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------
// 3. HERO · banner del SUV con paneo + marca
// ---------------------------------------------------------------
export const HeroScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { u, v } = useLayout();

  const p = interpolate(frame, [0, duration], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  // Vertical: arranca en el logo del banner y viaja hasta el auto + batería
  const posX = v ? interpolate(p, [0, 1], [4, 86]) : interpolate(p, [0, 1], [0, 60]);
  const scale = 1.04 + p * 0.08;

  const sweep = interpolate(frame, [10, 50], [-60, 160], clamp);
  const tag = useIn(20);
  const line = useIn(30);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Img
        src={staticFile(ASSETS.banner)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${posX}% 50%`,
          transform: `scale(${scale})`,
        }}
      />
      {/* destello de luz que cruza la imagen */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(105deg, transparent ${sweep - 12}%, rgba(255,166,77,0.35) ${sweep}%, transparent ${sweep + 12}%)`,
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.25) 38%, transparent 60%)",
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: v ? "center" : "flex-start",
          padding: v ? `0 ${60 * u}px ${230 * u}px` : `0 ${110 * u}px ${90 * u}px`,
          gap: 22 * u,
        }}
      >
        <div
          style={{
            alignSelf: v ? "center" : "flex-start",
            background: COLORS.orange,
            color: COLORS.white,
            fontFamily: POPPINS,
            fontWeight: 900,
            fontSize: 40 * u,
            textTransform: "uppercase",
            letterSpacing: 4 * u,
            padding: `${10 * u}px ${30 * u}px`,
            borderRadius: 999,
            opacity: tag,
            transform: `translateX(${(1 - tag) * -80 * u}px)`,
          }}
        >
          {COPY.heroTag}
        </div>
        <Title
          size={(v ? 86 : 78) * u}
          style={{
            textAlign: v ? "center" : "left",
            maxWidth: v ? 960 * u : 1600 * u,
            opacity: line,
            transform: `translateY(${(1 - line) * 50 * u}px)`,
            textShadow: "0 6px 30px rgba(0,0,0,0.6)",
          }}
        >
          {COPY.heroLine}
        </Title>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------
// 4. CATÁLOGO · un producto por beat
// ---------------------------------------------------------------
const CatalogIcon: React.FC<{ name: (typeof COPY.catalog)[number]["icon"]; size: number }> = ({ name, size }) => {
  if (name === "battery") return <BatteryIcon size={size} level={1} fill={COLORS.white} />;
  if (name === "bulb") return <BulbIcon size={size} />;
  if (name === "drop") return <DropIcon size={size} />;
  return <TireIcon size={size} />;
};

export const CatalogScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, v } = useLayout();
  const title = useIn(0);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 85% 15%, rgba(255,122,0,0.28) 0%, transparent 45%), linear-gradient(160deg, ${COLORS.navy} 0%, ${COLORS.navyDeep} 100%)`,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: (v ? 80 : 60) * u,
        padding: 60 * u,
      }}
    >
      <Title
        size={(v ? 96 : 88) * u}
        style={{ opacity: title, transform: `translateY(${(1 - title) * -40 * u}px)` }}
      >
        {COPY.catalogTitle.split(" ").slice(0, 2).join(" ")}{" "}
        <span style={{ color: COLORS.orange }}>{COPY.catalogTitle.split(" ").slice(2).join(" ")}</span>
      </Title>
      <div
        style={{
          display: "flex",
          flexDirection: v ? "column" : "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: (v ? 40 : 36) * u,
          width: v ? 980 * u : 1760 * u,
        }}
      >
        {COPY.catalog.map((item, i) => {
          const delay = Math.round(6 + i * FPB);
          const t = spring({ frame: frame - delay, fps, config: { damping: 13, mass: 0.6 } });
          const hit = frame >= delay ? beatPulse(frame - delay) * Math.max(0, 1 - (frame - delay) / FPB) : 0;
          return (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 34 * u,
                width: v ? "100%" : 860 * u,
                padding: `${24 * u}px ${34 * u}px`,
                borderRadius: 28 * u,
                background: "rgba(255,255,255,0.07)",
                border: `${2 * u}px solid rgba(255,255,255,${0.12 + hit * 0.5})`,
                opacity: t,
                transform: `translateX(${(1 - t) * (i % 2 === 0 ? -120 : 120) * u}px)`,
              }}
            >
              <div
                style={{
                  width: 130 * u,
                  height: 130 * u,
                  flexShrink: 0,
                  borderRadius: "50%",
                  background: COLORS.orange,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 ${(20 + hit * 50) * u}px rgba(255,122,0,0.7)`,
                }}
              >
                <CatalogIcon name={item.icon} size={item.icon === "battery" ? 92 * u : 74 * u} />
              </div>
              <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: (v ? 48 : 42) * u, color: COLORS.white }}>
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------
// 5. OFERTA · imagen Focus + sello 10 %
// ---------------------------------------------------------------
export const OfferScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, v } = useLayout();

  const punch = spring({ frame, fps, config: { damping: 10, mass: 0.6 } });
  const imgScale = interpolate(punch, [0, 1], [1.35, 1]) * (1 + 0.015 * beatPulse(frame));
  const sticker = useIn(16, 8);
  const brand = useIn(24);
  const line = useIn(34);
  const extra = useIn(44);

  const imgSize = (v ? 860 : 800) * u;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navyDeep }}>
      <Img
        src={staticFile(ASSETS.promo)}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(40px) brightness(0.45)",
          transform: "scale(1.2)",
        }}
      />
      <AbsoluteFill
        style={{
          flexDirection: v ? "column" : "row",
          justifyContent: "center",
          alignItems: "center",
          gap: (v ? 60 : 80) * u,
        }}
      >
        <div style={{ position: "relative" }}>
          <Img
            src={staticFile(ASSETS.promo)}
            style={{
              width: imgSize,
              height: imgSize,
              borderRadius: 30 * u,
              boxShadow: `0 ${30 * u}px ${90 * u}px rgba(0,0,0,0.6)`,
              transform: `scale(${imgScale})`,
              opacity: interpolate(frame, [0, 4], [0, 1], clamp),
            }}
          />
          {/* sello amarillo */}
          <div
            style={{
              position: "absolute",
              right: -60 * u,
              top: -60 * u,
              width: 260 * u,
              height: 260 * u,
              borderRadius: "50%",
              background: COLORS.yellow,
              border: `${8 * u}px solid ${COLORS.white}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 ${16 * u}px ${40 * u}px rgba(0,0,0,0.45)`,
              transform: `scale(${sticker * (1 + 0.06 * beatPulse(frame))}) rotate(${-14 + (1 - sticker) * -90}deg)`,
            }}
          >
            <div style={{ fontFamily: POPPINS, fontWeight: 900, fontSize: 92 * u, lineHeight: 1, color: "#111" }}>
              {COPY.offerBig}
            </div>
            <div style={{ fontFamily: POPPINS, fontWeight: 900, fontSize: 30 * u, color: "#111" }}>{COPY.offerSmall}</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: v ? "center" : "flex-start",
            gap: 18 * u,
            maxWidth: v ? 960 * u : 720 * u,
          }}
        >
          <Title
            size={(v ? 96 : 92) * u}
            style={{ textAlign: v ? "center" : "left", opacity: brand, transform: `translateY(${(1 - brand) * 40 * u}px)` }}
          >
            {COPY.offerBrand.split(" ")[0]}{" "}
            <span style={{ color: COLORS.orange }}>{COPY.offerBrand.split(" ").slice(1).join(" ")}</span>
          </Title>
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 800,
              fontSize: (v ? 54 : 50) * u,
              color: COLORS.yellow,
              textAlign: v ? "center" : "left",
              opacity: line,
              transform: `translateY(${(1 - line) * 30 * u}px)`,
            }}
          >
            {COPY.offerLine}
          </div>
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: (v ? 40 : 38) * u,
              color: COLORS.muted,
              opacity: extra,
            }}
          >
            ✔ {COPY.offerExtra}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------
// 6. CIERRE · logo + slogan + WhatsApp
// ---------------------------------------------------------------
export const CloseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, v } = useLayout();

  const logo = useIn(0, 11);
  const slogan = useIn(12);
  const cta = useIn(22, 10);
  const info = useIn(32);
  const pulse = beatPulse(frame);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% ${v ? 30 : 50}%, ${COLORS.white} 0%, ${COLORS.cream} 70%, #f4d9a6 100%)`,
      }}
    >
      {/* rayos naranja girando lento */}
      <AbsoluteFill
        style={{
          background: `repeating-conic-gradient(from ${frame * 0.4}deg at 50% ${v ? 30 : 50}%, rgba(255,122,0,0.07) 0deg 10deg, transparent 10deg 20deg)`,
        }}
      />
      <AbsoluteFill
        style={{
          flexDirection: v ? "column" : "row",
          justifyContent: "center",
          alignItems: "center",
          gap: (v ? 30 : 60) * u,
          padding: 60 * u,
        }}
      >
        <Img
          src={staticFile(ASSETS.logo)}
          style={{
            width: (v ? 820 : 680) * u,
            height: (v ? 820 : 680) * u,
            margin: v ? `${-90 * u}px 0` : 0,
            opacity: logo,
            transform: `scale(${0.6 + logo * 0.4})`,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 34 * u,
            maxWidth: (v ? 960 : 900) * u,
          }}
        >
          <Title
            size={(v ? 76 : 72) * u}
            color={COLORS.navy}
            style={{ opacity: slogan, transform: `translateY(${(1 - slogan) * 40 * u}px)` }}
          >
            La energía que te <span style={{ color: COLORS.orange, whiteSpace: "nowrap" }}>pone en marcha</span>
          </Title>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24 * u,
              background: COLORS.whatsapp,
              color: COLORS.white,
              borderRadius: 999,
              padding: `${22 * u}px ${54 * u}px ${22 * u}px ${36 * u}px`,
              boxShadow: `0 ${12 * u}px ${(30 + pulse * 30) * u}px rgba(37,211,102,${0.35 + pulse * 0.3})`,
              opacity: cta,
              transform: `scale(${(0.7 + cta * 0.3) * (1 + 0.04 * pulse)})`,
            }}
          >
            <PhoneIcon size={84 * u} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 30 * u, lineHeight: 1.1 }}>Escríbenos</div>
              <div style={{ fontFamily: POPPINS, fontWeight: 900, fontSize: 76 * u, lineHeight: 1 }}>{COPY.whatsapp}</div>
            </div>
          </div>
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 700,
              fontSize: 34 * u,
              color: COLORS.navy,
              textAlign: "center",
              lineHeight: 1.4,
              opacity: info,
            }}
          >
            {COPY.address}
            <br />
            <span style={{ color: COLORS.orange }}>{COPY.web}</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------
// 7. WEB · navegador: se escribe la URL y carga la página real
// ---------------------------------------------------------------
const TYPE_START = 12;
const FRAMES_PER_CHAR = 2;

export const WebScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, v } = useLayout();

  const enter = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const title = useIn(4);

  // Tecleo de la URL, luego "Enter" → barra de carga → aparece la página
  const url = COPY.webUrl;
  const typed = Math.max(0, Math.min(url.length, Math.floor((frame - TYPE_START) / FRAMES_PER_CHAR)));
  const typeEnd = TYPE_START + url.length * FRAMES_PER_CHAR;
  const enterAt = typeEnd + 2;
  const caretOn = frame < enterAt && Math.floor(frame / 8) % 2 === 0;
  const loading = interpolate(frame, [enterAt, enterAt + 16], [0, 1], clamp);
  const pageIn = interpolate(frame, [enterAt + 10, enterAt + 22], [0, 1], clamp);
  const keyPress = interpolate(frame, [enterAt - 1, enterAt, enterAt + 6], [1, 0.96, 1], clamp);

  // Medidas de la ventana del navegador
  const shot = v ? ASSETS.webMobile : ASSETS.webDesktop;
  const winW = (v ? 760 : 1480) * u;
  const winH = (v ? 1360 : 760) * u;
  const barH = (v ? 120 : 74) * u;
  const viewH = winH - barH;
  const imgH = (shot.h / shot.w) * winW; // alto del contenido útil escalado
  const scroll = interpolate(frame, [enterAt + 30, 146], [0, -(imgH - viewH) * (v ? 0.55 : 0.75)], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% ${v ? 60 : 70}%, rgba(255,122,0,0.3) 0%, transparent 55%), linear-gradient(160deg, ${COLORS.navy} 0%, ${COLORS.navyDeep} 100%)`,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: (v ? 50 : 34) * u,
      }}
    >
      <div style={{ opacity: title, transform: `translateY(${(1 - title) * -30 * u}px)`, textAlign: "center" }}>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: (v ? 46 : 40) * u, color: COLORS.muted }}>
          {COPY.webTitle}
        </div>
        <Title size={(v ? 76 : 70) * u} color={COLORS.orange}>
          {COPY.webUrl}
        </Title>
      </div>

      {/* ventana del navegador */}
      <div
        style={{
          width: winW,
          height: winH,
          borderRadius: (v ? 48 : 18) * u,
          overflow: "hidden",
          background: "#fff",
          boxShadow: `0 ${30 * u}px ${100 * u}px rgba(0,0,0,0.55), 0 0 0 ${(v ? 12 : 2) * u}px ${v ? "#11161f" : "rgba(255,255,255,0.15)"}`,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 200 * u}px) scale(${(0.85 + enter * 0.15) * keyPress})`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* barra superior con la dirección */}
        <div
          style={{
            height: barH,
            flexShrink: 0,
            background: "#eef1f5",
            borderBottom: "1px solid #d5dae2",
            display: "flex",
            alignItems: "center",
            gap: 18 * u,
            padding: `${v ? 30 * u : 0}px ${22 * u}px 0`,
            position: "relative",
          }}
        >
          {!v &&
            ["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <div key={c} style={{ width: 16 * u, height: 16 * u, borderRadius: "50%", background: c }} />
            ))}
          <div
            style={{
              flex: 1,
              height: (v ? 60 : 44) * u,
              marginLeft: v ? 0 : 20 * u,
              borderRadius: 999,
              background: "#fff",
              border: `${2 * u}px solid ${frame < enterAt ? COLORS.orange : "#d5dae2"}`,
              display: "flex",
              alignItems: "center",
              gap: 12 * u,
              padding: `0 ${22 * u}px`,
              fontFamily: BODY,
              fontSize: (v ? 30 : 24) * u,
              color: "#1d2533",
            }}
          >
            <svg width={18 * u} height={22 * u} viewBox="0 0 18 22">
              <rect x="1" y="9" width="16" height="12" rx="3" fill="#5b6576" />
              <path d="M5 9V6a4 4 0 0 1 8 0v3" stroke="#5b6576" strokeWidth="2.4" fill="none" />
            </svg>
            <span style={{ color: "#8a93a3" }}>{typed > 0 ? "https://" : ""}</span>
            <span style={{ marginLeft: -12 * u }}>{url.slice(0, typed)}</span>
            {caretOn && <span style={{ width: 2 * u, height: 30 * u, background: "#1d2533", marginLeft: -8 * u }} />}
          </div>
          {/* barra de carga */}
          <div
            style={{
              position: "absolute",
              left: 0,
              bottom: -2,
              height: 4 * u,
              width: `${loading * 100}%`,
              background: COLORS.orange,
              opacity: loading < 1 ? 1 : interpolate(frame, [enterAt + 16, enterAt + 22], [1, 0], clamp),
            }}
          />
        </div>

        {/* contenido: página real con scroll */}
        <div style={{ position: "relative", flex: 1, overflow: "hidden", background: "#fff" }}>
          <Img
            src={staticFile(shot.src)}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: winW,
              opacity: pageIn,
              transform: `translateY(${scroll}px)`,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
