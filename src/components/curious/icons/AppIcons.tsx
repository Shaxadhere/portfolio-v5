import type { ReactNode } from "react";
import type { CuriousItem } from "@/data/portfolio";

type IconProps = {
  accent: string;
  size?: number;
};

function IconShell({
  accent,
  size = 48,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="curious-app-icon"
    >
      <defs>
        <linearGradient id={`icon-gloss-${accent.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.38" />
          <stop offset="45%" stopColor="white" stopOpacity="0.08" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect
        x="4"
        y="4"
        width="56"
        height="56"
        rx="14"
        fill={accent}
      />
      <rect
        x="4"
        y="4"
        width="56"
        height="56"
        rx="14"
        fill={`url(#icon-gloss-${accent.replace("#", "")})`}
      />
      <rect
        x="5"
        y="5"
        width="54"
        height="54"
        rx="13"
        stroke="white"
        strokeOpacity="0.22"
        strokeWidth="0.75"
        fill="none"
      />
      {children}
    </svg>
  );
}

function SimplifiIcon({ accent, size }: IconProps) {
  return (
    <IconShell accent={accent} size={size}>
      <path
        d="M20 38h24M20 30h16M20 22h20"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </IconShell>
  );
}

function YDriveIcon({ accent, size }: IconProps) {
  return (
    <IconShell accent={accent} size={size}>
      <path
        d="M18 42l14-24 14 24H18z"
        stroke="white"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="38" r="3" fill="white" />
    </IconShell>
  );
}

function BHealthyIcon({ accent, size }: IconProps) {
  return (
    <IconShell accent={accent} size={size}>
      <path
        d="M32 22c-4 0-7 3-7 7 0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"
        stroke="white"
        strokeWidth="2.5"
        fill="white"
        fillOpacity="0.25"
      />
    </IconShell>
  );
}

function FishFinIcon({ accent, size }: IconProps) {
  return (
    <IconShell accent={accent} size={size}>
      <ellipse cx="28" cy="32" rx="12" ry="8" fill="white" fillOpacity="0.9" />
      <path d="M40 32l8-6v12l-8-6z" fill="white" fillOpacity="0.9" />
      <circle cx="22" cy="30" r="2" fill={accent} />
    </IconShell>
  );
}

function DaVinciIcon({ accent, size }: IconProps) {
  return (
    <IconShell accent={accent} size={size}>
      <rect x="22" y="20" width="20" height="28" rx="4" stroke="white" strokeWidth="2.5" />
      <path d="M28 28h8M28 34h8M28 40h5" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </IconShell>
  );
}

function RangeIcon({ accent, size }: IconProps) {
  return (
    <IconShell accent={accent} size={size}>
      <path
        d="M18 38c0-8 6-14 14-14s14 6 14 14"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="32" cy="38" r="3" fill="white" />
    </IconShell>
  );
}

function MailIcon({ accent, size }: IconProps) {
  return (
    <IconShell accent={accent} size={size}>
      <rect x="16" y="22" width="32" height="22" rx="4" stroke="white" strokeWidth="2.5" />
      <path d="M16 26l16 12 16-12" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
    </IconShell>
  );
}

function GlobeIcon({ accent, size }: IconProps) {
  return (
    <IconShell accent={accent} size={size}>
      <circle cx="32" cy="32" r="14" stroke="white" strokeWidth="2.5" />
      <ellipse cx="32" cy="32" rx="6" ry="14" stroke="white" strokeWidth="2" />
      <path d="M18 32h28M20 24h24M20 40h24" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </IconShell>
  );
}

function PdfIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden className="curious-app-icon">
      <rect x="12" y="8" width="36" height="48" rx="4" fill="white" stroke="#d1d1d6" strokeWidth="1.5" />
      <path d="M36 8v12h12" fill="#f5f5f7" stroke="#d1d1d6" strokeWidth="1.5" />
      <rect x="18" y="34" width="24" height="10" rx="2" fill="#ff3b30" />
      <text x="32" y="42" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="system-ui">
        PDF
      </text>
    </svg>
  );
}

function FolderIcon({ accent = "#007aff", size = 48, iconImage }: IconProps & { iconImage?: string }) {
  const badgeSize = Math.round(size * 0.42);
  const badgeRadius = Math.round(badgeSize * 0.22);
  const accentKey = accent.replace("#", "");

  return (
    <span
      className="curious-app-folder-icon"
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id={`folder-back-${accentKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2c94ff" />
            <stop offset="100%" stopColor="#0066d6" />
          </linearGradient>
          <linearGradient id={`folder-front-${accentKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4cb0ff" />
            <stop offset="100%" stopColor="#0077f2" />
          </linearGradient>
        </defs>

        {/* Folder Back Tab */}
        <path
          d="M6 16C6 13.7909 7.79086 12 10 12H24C26.5 12 28.5 14 30.5 16.5L32.5 19H54C56.2091 19 58 20.7909 58 23V50C58 52.2091 56.2091 54 54 54H10C7.79086 54 6 52.2091 6 50V16Z"
          fill={`url(#folder-back-${accentKey})`}
        />

        {/* Paper Sheet Preview Inside Folder */}
        <rect x="13" y="18" width="38" height="22" rx="3" fill="#ffffff" fillOpacity="0.9" />
        <line x1="19" y1="23" x2="35" y2="23" stroke="#0066d6" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4" />
        <line x1="19" y1="28" x2="43" y2="28" stroke="#0066d6" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.3" />

        {/* Folder Front Cover Flap */}
        <path
          d="M5 24C5 21.7909 6.79086 20 9 20H55C57.2091 20 59 21.7909 59 24V50C59 52.7614 56.7614 55 54 55H10C7.23858 55 5 52.7614 5 50V24Z"
          fill={`url(#folder-front-${accentKey})`}
        />

        {/* Top Edge Highlight on Front Flap */}
        <path
          d="M9 20.5H55C56.933 20.5 58.5 22.067 58.5 24V25H5.5V24C5.5 22.067 7.067 20.5 9 20.5Z"
          fill="white"
          fillOpacity="0.32"
        />
      </svg>

      {/* Embedded Mini Project Logo Badge */}
      {iconImage ? (
        <span
          style={{
            position: "absolute",
            top: "56%",
            left: "50%",
            transform: "translate(-50%, -40%)",
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeRadius,
            overflow: "hidden",
            boxShadow: "0 3px 8px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.5)",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={iconImage}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            draggable={false}
          />
        </span>
      ) : null}
    </span>
  );
}

function ImageIcon({ iconImage, size }: { iconImage: string; size: number }) {
  const radius = Math.round(size * 0.21875);
  return (
    <span
      className="curious-app-icon-image"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={iconImage}
        alt=""
        draggable={false}
      />
    </span>
  );
}

export function CuriousAppIcon({
  icon,
  accent,
  size = 48,
  iconImage,
}: Pick<CuriousItem, "icon" | "accent"> & { size?: number; iconImage?: string }) {
  if (icon === "folder") {
    return <FolderIcon accent={accent} size={size} iconImage={iconImage} />;
  }

  if (iconImage) {
    return <ImageIcon iconImage={iconImage} size={size} />;
  }

  const props = { accent, size };

  switch (icon) {
    case "simplifi":
      return <SimplifiIcon {...props} />;
    case "ydrive":
      return <YDriveIcon {...props} />;
    case "bhealthy":
      return <BHealthyIcon {...props} />;
    case "fishfin":
      return <FishFinIcon {...props} />;
    case "davinci":
      return <DaVinciIcon {...props} />;
    case "range":
      return <RangeIcon {...props} />;
    case "instagram":
      return <ImageIcon iconImage="/icons/instagram.png" size={size} />;
    case "github":
      return <ImageIcon iconImage="/icons/github.png" size={size} />;
    case "linkedin":
      return <ImageIcon iconImage="/icons/linkedin.webp" size={size} />;
    case "mail":
      return <MailIcon {...props} />;
    case "globe":
      return <GlobeIcon {...props} />;
    case "pdf":
      return <PdfIcon size={size} />;
    default:
      return <GlobeIcon {...props} />;
  }
}
