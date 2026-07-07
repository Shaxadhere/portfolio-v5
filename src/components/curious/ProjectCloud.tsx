"use client";

import { useMemo } from "react";
import type { CuriousItem } from "@/data/portfolio";
import { buildFloatLayouts } from "@/data/curious-layout";
import { FloatingProject } from "@/components/curious/FloatingProject";

type ProjectCloudProps = {
  items: CuriousItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpen: (item: CuriousItem) => void;
};

export function ProjectCloud({ items, selectedId, onSelect, onOpen }: ProjectCloudProps) {
  const layouts = useMemo(() => buildFloatLayouts(items), [items]);

  return (
    <div className="curious-cloud" aria-label="Projects">
      {items.map((item, index) => (
        <FloatingProject
          key={item.id}
          item={item}
          layout={layouts[index]}
          index={index}
          selected={selectedId === item.id}
          onSelect={onSelect}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
