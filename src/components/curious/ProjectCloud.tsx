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

  useEffect(() => {
    const onReset = () => {
      setSavedPositions({});
      saveIconPositions({});
    };

    const onScramble = () => {
      const next: SavedIconPositions = {};
      items.forEach((item) => {
        next[item.id] = {
          x: Math.min(95, Math.max(5, 5 + Math.random() * 85)),
          y: Math.min(90, Math.max(5, 5 + Math.random() * 80)),
        };
      });
      setSavedPositions(next);
      saveIconPositions(next);
    };

    window.addEventListener("curious:reset-icons", onReset);
    window.addEventListener("curious:scramble-icons", onScramble);
    return () => {
      window.removeEventListener("curious:reset-icons", onReset);
      window.removeEventListener("curious:scramble-icons", onScramble);
    };
  }, [items]);

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
          savedPosition={savedPositions[item.id]}
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
