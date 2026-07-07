"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const ScrollAmbientInner = dynamic(
  () => import("./ScrollAmbientInner").then((m) => m.ScrollAmbientInner),
  { ssr: false }
);

export function ScrollAmbientScene() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] opacity-60"
      aria-hidden
    >
      <ScrollAmbientInner />
    </div>
  );
}
