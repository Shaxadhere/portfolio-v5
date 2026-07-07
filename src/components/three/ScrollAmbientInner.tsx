"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CanvasWrapper } from "./CanvasWrapper";
import { useScrollProgress } from "./ScrollProgress";
import { palette } from "./colors";

function MorphingOrb() {
  const mesh = useRef<THREE.Mesh>(null);
  const scroll = useScrollProgress();
  const morph = useRef({ t: 0 });

  useFrame((state, delta) => {
    if (!mesh.current) return;

    morph.current.t = THREE.MathUtils.lerp(
      morph.current.t,
      scroll.current,
      delta * 3
    );
    const p = morph.current.t;

    mesh.current.rotation.x = state.clock.elapsedTime * 0.25 + p * Math.PI * 2;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.18 + p * Math.PI;
    mesh.current.position.y = Math.sin(p * Math.PI * 2) * 1.5;
    mesh.current.position.x = -2.5 + p * 1.5;
    mesh.current.scale.setScalar(0.5 + Math.sin(p * Math.PI) * 0.15);
  });

  return (
    <mesh ref={mesh} position={[-2.5, 0, -3]}>
      <icosahedronGeometry args={[1.2, 1]} />
      <meshStandardMaterial
        color={palette.cyan}
        emissive={palette.cyan}
        emissiveIntensity={0.2 + scroll.current * 0.3}
        metalness={0.95}
        roughness={0.1}
        wireframe
      />
    </mesh>
  );
}

function DriftingCube() {
  const mesh = useRef<THREE.Mesh>(null);
  const scroll = useScrollProgress();

  useFrame((state, delta) => {
    if (!mesh.current) return;
    const p = scroll.current;

    mesh.current.rotation.x = state.clock.elapsedTime * 0.4;
    mesh.current.rotation.z = state.clock.elapsedTime * 0.25;
    mesh.current.position.x = 3 - p * 2;
    mesh.current.position.y = 1.5 - p * 3;
    mesh.current.scale.setScalar(
      THREE.MathUtils.lerp(mesh.current.scale.x, 0.35 + p * 0.25, delta * 4)
    );
  });

  return (
    <mesh ref={mesh} position={[3, 1.5, -4]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={palette.accent}
        emissive={palette.accent}
        emissiveIntensity={0.35}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

function TrailingRing() {
  const ring = useRef<THREE.Mesh>(null);
  const scroll = useScrollProgress();

  useFrame((state) => {
    if (!ring.current) return;
    const p = scroll.current;
    ring.current.rotation.x = Math.PI / 2 + p * Math.PI;
    ring.current.rotation.z = state.clock.elapsedTime * 0.1;
    ring.current.position.y = -2 + p * 4;
  });

  return (
    <mesh ref={ring} position={[1, -2, -5]}>
      <torusGeometry args={[1.8, 0.03, 16, 80]} />
      <meshBasicMaterial color={palette.coral} transparent opacity={0.5} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 5, 2]} intensity={1} color={palette.accent} />
      <MorphingOrb />
      <DriftingCube />
      <TrailingRing />
    </>
  );
}

export function ScrollAmbientInner() {
  return (
    <CanvasWrapper
      className="h-full w-full"
      camera={{ position: [0, 0, 8], fov: 50 }}
      dpr={[1, 1.25]}
    >
      <Scene />
    </CanvasWrapper>
  );
}
