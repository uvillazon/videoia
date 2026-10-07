import React from "react";

type IconProps = { size: number; color?: string };

// Batería con nivel de carga (0..1)
export const BatteryIcon: React.FC<IconProps & { level: number; fill: string; stroke?: string }> = ({
  size,
  level,
  fill,
  stroke = "#ffffff",
}) => (
  <svg width={size} height={(size * 84) / 120} viewBox="0 0 120 84">
    <rect x="18" y="4" width="18" height="12" rx="3" fill={stroke} />
    <rect x="84" y="4" width="18" height="12" rx="3" fill={stroke} />
    <rect x="4" y="16" width="112" height="64" rx="10" fill="none" stroke={stroke} strokeWidth="6" />
    <rect x="13" y="25" width={Math.max(0, 94 * Math.min(1, level))} height="46" rx="5" fill={fill} />
    <path d="M22 36h12M28 30v12" stroke={stroke} strokeWidth="4" strokeLinecap="round" opacity={0.85} />
    <path d="M86 36h12" stroke={stroke} strokeWidth="4" strokeLinecap="round" opacity={0.85} />
  </svg>
);

export const Bolt: React.FC<IconProps> = ({ size, color = "#ff7a00" }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 100 130">
    <polygon points="62,0 8,74 44,74 30,130 94,48 56,48 78,0" fill={color} />
  </svg>
);

export const BulbIcon: React.FC<IconProps> = ({ size, color = "#ffffff" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round">
    <path d="M50 18a24 24 0 0 0-14 43c3 3 4 6 4 10h20c0-4 1-7 4-10a24 24 0 0 0-14-43z" />
    <path d="M40 82h20M43 92h14" />
    <path d="M50 2v6M14 18l5 5M86 18l-5 5M4 46h7M89 46h7" />
  </svg>
);

export const DropIcon: React.FC<IconProps> = ({ size, color = "#ffffff" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="7" strokeLinejoin="round">
    <path d="M50 8C50 8 20 46 20 64a30 30 0 0 0 60 0C80 46 50 8 50 8z" />
    <path d="M36 66a14 14 0 0 0 12 14" strokeLinecap="round" />
  </svg>
);

export const TireIcon: React.FC<IconProps> = ({ size, color = "#ffffff" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeLinecap="round">
    <circle cx="50" cy="50" r="40" strokeWidth="12" />
    <circle cx="50" cy="50" r="12" strokeWidth="6" />
    <path d="M50 38V22M50 62v16M38 50H22M62 50h16" strokeWidth="6" />
  </svg>
);

export const PhoneIcon: React.FC<IconProps> = ({ size, color = "#ffffff" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path
      d="M50 6a44 44 0 0 0-38 66L6 94l23-6A44 44 0 1 0 50 6z"
      fill="none"
      stroke={color}
      strokeWidth="7"
      strokeLinejoin="round"
    />
    <path
      d="M36 28c-3 0-6 4-6 9 0 12 17 31 31 33 5 1 9-3 9-6l-1-5-10-4-4 5c-6-2-12-9-14-14l5-4-4-10z"
      fill={color}
    />
  </svg>
);
