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

function GitHubIcon({ accent, size }: IconProps) {
  return (
    <IconShell accent={accent} size={size}>
      <path
        fill="white"
        d="M32 18c-7.7 0-14 6.3-14 14 0 6.2 4 11.5 9.6 13.4.7.1 1-.3 1-.7v-2.5c-3.9.9-4.7-1.9-4.7-1.9-.6-1.6-1.6-2-1.6-2-1.3-.9.1-.9.1-.9 1.4.1 2.2 1.5 2.2 1.5 1.3 2.1 3.3 1.5 4.1 1.2.1-.9.5-1.5 1-1.9-3.5-.4-7.2-1.8-7.2-7.9 0-1.7.6-3.2 1.6-4.3-.2-.4-.7-2 .2-4.1 0 0 1.3-.4 4.3 1.6 1.2-.3 2.6-.5 3.9-.5s2.7.2 3.9.5c3-2 4.3-1.6 4.3-1.6.9 2.1.4 3.7.2 4.1 1 1.1 1.6 2.6 1.6 4.3 0 6.2-3.7 7.5-7.2 7.9.6.5 1.1 1.4 1.1 2.9v4.3c0 .4.3.8 1 .7 5.6-1.9 9.6-7.2 9.6-13.4 0-7.7-6.3-14-14-14z"
      />
    </IconShell>
  );
}

function LinkedInIcon({ accent, size }: IconProps) {
  return (
    <IconShell accent={accent} size={size}>
      <rect x="20" y="28" width="6" height="16" rx="1" fill="white" />
      <circle cx="23" cy="22" r="3.5" fill="white" />
      <path
        d="M32 28v16M32 34c0-4 2-6 6-6s6 2 6 6v10"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
      />
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

function FolderIcon({ accent, size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden className="curious-app-icon">
      <path
        d="M8 20c0-2.2 1.8-4 4-4h12l4 4h24c2.2 0 4 1.8 4 4v28c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V20z"
        fill={accent}
        fillOpacity="0.85"
      />
      <path
        d="M8 24h48v28c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V24z"
        fill={accent}
      />
    </svg>
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
    case "folder":
      return <FolderIcon {...props} />;
    default:
      return <GlobeIcon {...props} />;
  }
}
