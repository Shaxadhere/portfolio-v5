"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, type ReactNode } from "react";

type CanvasWrapperProps = {
  children: ReactNode;
  className?: string;
  camera?: { position: [number, number, number]; fov?: number };
  dpr?: [number, number];
};

function SceneLoader() {
  return null;
}

export function CanvasWrapper({
  children,
  className = "",
  camera = { position: [0, 0, 6], fov: 45 },
  dpr = [1, 2],
}: CanvasWrapperProps) {
  return (
    <div className={className}>
      <Canvas
        dpr={dpr}
        camera={camera}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={<SceneLoader />}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
