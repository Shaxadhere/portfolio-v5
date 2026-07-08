import type { CuriousItem } from "@/data/portfolio";
import { DESKTOP_DEFAULT_LAYOUT } from "@/data/curious-default-layout";

export type FloatVariant = "icon";

export type FloatLayout = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  variant: FloatVariant;
  zIndex: number;
};

/** Default positions from curated layout; fallback slots for unknown ids */
export function buildFloatLayouts(items: CuriousItem[]): FloatLayout[] {
  return items.map((item, index) => {
    const position = DESKTOP_DEFAULT_LAYOUT[item.id];

    return {
      x: position?.x ?? 12 + (index % 6) * 14,
      y: position?.y ?? 12 + Math.floor(index / 6) * 14,
      rotate: 0,
      scale: 1,
      variant: "icon" as const,
      zIndex: 30 + index,
    };
  });
}
