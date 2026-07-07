"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const ProjectShapeInner = dynamic(
  () => import("./ProjectShapeInner").then((m) => m.ProjectShapeInner),
  { ssr: false }
);

type ProjectShape3DProps = {
  variant: 0 | 1 | 2 | 3;
  accent: string;
};

export function ProjectShape3D({ variant, accent }: ProjectShape3DProps) {
  const reducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (reducedMotion) {
    return (
      <div
        className="absolute -right-4 -top-4 h-28 w-28 opacity-30"
        style={{
          background: `radial-gradient(circle, ${accent}40, transparent 70%)`,
        }}
        aria-hidden
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute right-4 top-4 h-32 w-32 opacity-90 transition-opacity md:h-36 md:w-36"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-hidden
    >
      <ProjectShapeInner variant={variant} accent={accent} hovered={hovered} />
    </div>
  );
}
