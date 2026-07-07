"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MouseProvider } from "./MouseContext";

const HeroSceneInner = dynamic(
  () => import("./HeroSceneInner").then((m) => m.HeroSceneInner),
  { ssr: false }
);

type HeroSceneProps = {
  mouse: { x: number; y: number };
};

export function HeroScene({ mouse }: HeroSceneProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      >
        <div className="absolute right-0 top-1/4 h-[60vh] w-[60vw] max-w-2xl rounded-full bg-[var(--accent)] opacity-10 blur-[120px]" />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      <MouseProvider value={mouse}>
        <HeroSceneInner />
      </MouseProvider>
    </div>
  );
}
