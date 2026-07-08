"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CuriousItem } from "@/data/portfolio";
import { buildFloatLayouts } from "@/data/curious-layout";
import {
  loadIconPositions,
  saveIconPositions,
  type SavedIconPositions,
} from "@/lib/curious-positions";
import { FloatingProject } from "@/components/curious/FloatingProject";

type ProjectCloudProps = {
  items: CuriousItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpen: (item: CuriousItem) => void;
};

export function ProjectCloud({ items, selectedId, onSelect, onOpen }: ProjectCloudProps) {
  const cloudRef = useRef<HTMLDivElement>(null);
  const defaultLayouts = useMemo(() => buildFloatLayouts(items), [items]);
  const [savedPositions, setSavedPositions] = useState<SavedIconPositions>({});

  useEffect(() => {
    setSavedPositions(loadIconPositions());
  }, []);

  const getPosition = useCallback(
    (id: string, index: number) =>
      savedPositions[id] ?? {
        x: defaultLayouts[index]?.x ?? 50,
        y: defaultLayouts[index]?.y ?? 50,
      },
    [savedPositions, defaultLayouts],
  );

  const handlePositionChange = useCallback((id: string, x: number, y: number) => {
    setSavedPositions((prev) => {
      const next = { ...prev, [id]: { x, y } };
      saveIconPositions(next);
      return next;
    });
  }, []);

  return (
    <div ref={cloudRef} className="curious-cloud" aria-label="Projects">
      {items.map((item, index) => (
        <FloatingProject
          key={item.id}
          item={item}
          layout={defaultLayouts[index]}
          position={getPosition(item.id, index)}
          index={index}
          selected={selectedId === item.id}
          cloudRef={cloudRef}
          onSelect={onSelect}
          onOpen={onOpen}
          onPositionChange={(x, y) => handlePositionChange(item.id, x, y)}
        />
      ))}
    </div>
  );
}
