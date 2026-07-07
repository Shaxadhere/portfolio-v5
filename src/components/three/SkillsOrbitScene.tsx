"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const SkillsOrbitInner = dynamic(
  () => import("./SkillsOrbitInner").then((m) => m.SkillsOrbitInner),
  { ssr: false }
);

export function SkillsOrbitScene() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) return null;

  return (
    <div
      className="pointer-events-none absolute -right-8 top-1/2 hidden h-[420px] w-[420px] -translate-y-1/2 md:block lg:-right-4 lg:h-[500px] lg:w-[500px]"
      aria-hidden
    >
      <SkillsOrbitInner />
    </div>
  );
}
