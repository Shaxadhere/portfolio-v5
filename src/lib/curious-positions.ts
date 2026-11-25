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

// ── Shared store (for useSyncExternalStore) ─────────────────────────────────
// Positions live in localStorage; the store keeps one cached snapshot so every
// reader sees the same object and the server render always starts empty.

const EMPTY_POSITIONS: SavedIconPositions = {};
const listeners = new Set<() => void>();
let snapshot: SavedIconPositions | null = null;

export function subscribeIconPositions(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getIconPositionsSnapshot(): SavedIconPositions {
  if (snapshot === null) snapshot = loadIconPositions();
  return snapshot;
}

export function getServerIconPositionsSnapshot(): SavedIconPositions {
  return EMPTY_POSITIONS;
}

export function setIconPositions(next: SavedIconPositions) {
  snapshot = next;
  saveIconPositions(next);
  listeners.forEach((listener) => listener());
}

export function setIconPosition(id: string, position: SavedIconPosition) {
  setIconPositions({ ...getIconPositionsSnapshot(), [id]: position });
}

/** View → Clean Up: back to the default grid */
export function resetIconPositions() {
  setIconPositions({});
}

/** View → Scramble Icons */
export function scrambleIconPositions(ids: string[]) {
  const next: SavedIconPositions = {};
  ids.forEach((id) => {
    next[id] = {
      x: Math.min(95, Math.max(5, 5 + Math.random() * 85)),
      y: Math.min(90, Math.max(5, 5 + Math.random() * 80)),
    };
  });
  setIconPositions(next);
}
