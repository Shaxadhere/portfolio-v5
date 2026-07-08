import { DESKTOP_LAYOUT_VERSION } from "@/data/curious-default-layout";

export type SavedIconPosition = { x: number; y: number };

export type SavedIconPositions = Record<string, SavedIconPosition>;

type StoredPositions = {
  version: number;
  positions: SavedIconPositions;
};

const STORAGE_KEY = "shehzad-curious-icon-positions";

export function loadIconPositions(): SavedIconPositions {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as StoredPositions | SavedIconPositions;

    if ("version" in parsed && "positions" in parsed) {
      if (parsed.version !== DESKTOP_LAYOUT_VERSION) return {};
      return (parsed.positions as SavedIconPositions) ?? {};
    }

    // Legacy flat format — use curated defaults
    return {};
  } catch {
    return {};
  }
}

export function saveIconPositions(positions: SavedIconPositions) {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredPositions = {
      version: DESKTOP_LAYOUT_VERSION,
      positions,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore quota / privacy errors
  }
}
