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

export type Position = { x: number; y: number };

/** Automatically calculates responsive left-side desktop grid slots based on screen resolution */
export function calculateAutoGridPositions(
  items: CuriousItem[],
  containerWidth: number,
  containerHeight: number,
): Record<string, Position> {
  const width = Math.max(containerWidth, 320);
  const height = Math.max(containerHeight, 350);

  const cellWidth = 98;   // px per column
  const cellHeight = 100;  // px per row
  const topMargin = 42;   // top offset px below menubar with extra breathing room
  const bottomMargin = 95; // bottom offset px above dock
  const leftMargin = 44;  // left margin px from screen edge

  const availableHeight = height - topMargin - bottomMargin;
  const maxRows = Math.max(1, Math.floor(availableHeight / cellHeight));

  const result: Record<string, Position> = {};

  items.forEach((item, index) => {
    const col = Math.floor(index / maxRows);
    const row = index % maxRows;

    const posX = leftMargin + col * cellWidth;
    const posY = topMargin + row * cellHeight;

    result[item.id] = {
      x: (posX / width) * 100,
      y: (posY / height) * 100,
    };
  });

  return result;
}

/** Default positions from curated layout; fallback slots for unknown ids */
export function buildFloatLayouts(items: CuriousItem[]): FloatLayout[] {
  return items.map((item, index) => {
    const position = DESKTOP_DEFAULT_LAYOUT[item.id];

    const col = Math.floor(index / 7);
    const row = index % 7;
    const fallbackX = 5.5 + col * 6.5;
    const fallbackY = 7 + row * 11;

    return {
      x: position?.x ?? fallbackX,
      y: position?.y ?? fallbackY,
      rotate: 0,
      scale: 1,
      variant: "icon" as const,
      zIndex: 30 + index,
    };
  });
}
