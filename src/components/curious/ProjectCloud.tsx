"use client";

import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import type { CuriousItem } from "@/data/portfolio";
import { buildFloatLayouts } from "@/data/curious-layout";
import {
  getIconPositionsSnapshot,
  getServerIconPositionsSnapshot,
  setIconPosition,
  subscribeIconPositions,
} from "@/lib/curious-positions";
import { FloatingProject, type Point } from "@/components/curious/FloatingProject";

type ProjectCloudProps = {
  items: CuriousItem[];
  selectedIds: string[];
  /** Finder is the active app (no window focused) — blue selection instead of gray */
  active: boolean;
  onSelect: (id: string, additive: boolean) => void;
  onOpen: (item: CuriousItem, origin: Point) => void;
  onContextMenu: (item: CuriousItem, point: Point) => void;
};

export function ProjectCloud({
  items,
  selectedIds,
  active,
  onSelect,
  onOpen,
  onContextMenu,
}: ProjectCloudProps) {
  const cloudRef = useRef<HTMLDivElement>(null);
  const defaultLayouts = useMemo(() => buildFloatLayouts(items), [items]);
  const savedPositions = useSyncExternalStore(
    subscribeIconPositions,
    getIconPositionsSnapshot,
    getServerIconPositionsSnapshot,
  );

  const handlePositionChange = useCallback((id: string, x: number, y: number) => {
    setIconPosition(id, { x, y });
  }, []);

  return (
    <div
      ref={cloudRef}
      className={`curious-cloud ${active ? "" : "curious-cloud--inactive"}`}
      aria-label="Desktop"
    >
      {items.map((item, index) => (
        <FloatingProject
          key={item.id}
          item={item}
          layout={defaultLayouts[index]}
          savedPosition={savedPositions[item.id]}
          index={index}
          selected={selectedIds.includes(item.id)}
          cloudRef={cloudRef}
          onSelect={onSelect}
          onOpen={onOpen}
          onContextMenu={onContextMenu}
          onPositionChange={(x, y) => handlePositionChange(item.id, x, y)}
        />
      ))}
    </div>
  );
}
