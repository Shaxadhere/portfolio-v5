"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Float } from "@react-three/drei";
import { CanvasWrapper } from "./CanvasWrapper";
import { palette } from "./colors";

const ORBIT_ITEMS: {
  angle: number;
  radius: number;
  shape: "sphere" | "box" | "cone";
  color: string;
  speed: number;
}[] = [
  { angle: 0, radius: 2.2, shape: "sphere", color: palette.accent, speed: 0.9 },
  { angle: Math.PI / 3, radius: 2.2, shape: "box", color: palette.cyan, speed: 0.7 },
  { angle: (Math.PI * 2) / 3, radius: 2.2, shape: "cone", color: palette.coral, speed: 1.1 },
  { angle: Math.PI, radius: 2.2, shape: "box", color: palette.violet, speed: 0.8 },
  { angle: (Math.PI * 4) / 3, radius: 2.2, shape: "sphere", color: palette.cream, speed: 0.6 },
  { angle: (Math.PI * 5) / 3, radius: 2.2, shape: "cone", color: palette.accent, speed: 1 },
];

function OrbitItem({
  angle,
  radius,
  shape,
  color,
  speed,
}: (typeof ORBIT_ITEMS)[number]) {
  const ref = useRef<THREE.Mesh>(null);
  const baseAngle = useRef(angle);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.35 + baseAngle.current;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius;
    ref.current.position.y = Math.sin(t * 2) * 0.25;
    ref.current.rotation.x = state.clock.elapsedTime * speed;
    ref.current.rotation.y = state.clock.elapsedTime * speed * 0.8;
  });

  const geometry =
    shape === "sphere" ? (
      <sphereGeometry args={[0.22, 16, 16]} />
    ) : shape === "box" ? (
      <boxGeometry args={[0.35, 0.35, 0.35]} />
    ) : (
      <coneGeometry args={[0.25, 0.45, 4]} />
    );

  return (
    <Float speed={3} floatIntensity={0.3} rotationIntensity={0.2}>
      <mesh ref={ref}>
        {geometry}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.45}
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>
    </Float>
  );
}

function Core() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.5;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
  });

  return (
    <mesh ref={ref}>
      <dodecahedronGeometry args={[0.65, 0]} />
      <meshStandardMaterial
        color={palette.accent}
        emissive={palette.accent}
        emissiveIntensity={0.5}
        metalness={0.9}
        roughness={0.1}
        wireframe
      />
    </mesh>
  );
}

function Scene() {
  const ring = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ring.current) return;
    ring.current.rotation.z = state.clock.elapsedTime * 0.15;
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[2, 2, 4]} intensity={2} color={palette.accent} />
      <pointLight position={[-3, -1, 2]} intensity={1} color={palette.cyan} />

      <Core />

      <mesh ref={ring}>
        <torusGeometry args={[2.2, 0.015, 8, 64]} />
        <meshBasicMaterial color={palette.cream} transparent opacity={0.25} />
      </mesh>

      {ORBIT_ITEMS.map((item, i) => (
        <OrbitItem key={i} {...item} />
      ))}
    </>
  );
}

export function SkillsOrbitInner() {
  return (
    <CanvasWrapper
      className="h-full w-full"
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 1.5]}
    >
      <Scene />
    </CanvasWrapper>
  );
}
