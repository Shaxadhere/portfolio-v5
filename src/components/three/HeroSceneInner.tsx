"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useMousePosition } from "./MouseContext";
import {
  Float,
  MeshDistortMaterial,
  Sparkles,
  Torus,
  Environment,
  MeshWobbleMaterial,
} from "@react-three/drei";
import * as THREE from "three";
import { CanvasWrapper } from "./CanvasWrapper";
import { palette } from "./colors";

function MouseRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const mouse = useMousePosition();
  const target = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    if (!group.current) return;
    target.current.x = mouse.x * 0.6;
    target.current.y = mouse.y * 0.35;
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      target.current.x,
      delta * 2
    );
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      -target.current.y,
      delta * 2
    );
  });

  return <group ref={group}>{children}</group>;
}

function CoreKnot() {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.z = state.clock.elapsedTime * 0.12;
  });

  return (
    <Float speed={1.8} rotationIntensity={0.35} floatIntensity={1.2}>
      <mesh ref={mesh} scale={1.15}>
        <torusKnotGeometry args={[1.1, 0.32, 220, 24]} />
        <MeshDistortMaterial
          color={palette.accent}
          emissive={palette.accent}
          emissiveIntensity={0.35}
          metalness={0.85}
          roughness={0.15}
          distort={0.28}
          speed={2.5}
          transparent
          opacity={0.92}
        />
      </mesh>
    </Float>
  );
}

function OrbitRing({
  radius,
  speed,
  color,
  wireframe,
}: {
  radius: number;
  speed: number;
  color: string;
  wireframe?: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * speed;
    ref.current.rotation.y = state.clock.elapsedTime * speed * 0.7;
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshBasicMaterial color={color} wireframe={wireframe} transparent opacity={0.7} />
    </mesh>
  );
}

function Satellite({
  position,
  geometry,
  color,
  speed,
}: {
  position: [number, number, number];
  geometry: "box" | "octa" | "tetra";
  color: string;
  speed: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * speed;
    ref.current.rotation.y = state.clock.elapsedTime * speed * 1.3;
  });

  return (
    <Float speed={2.5} rotationIntensity={0.6} floatIntensity={0.5}>
      <mesh ref={ref} position={position}>
        {geometry === "box" && <boxGeometry args={[0.35, 0.35, 0.35]} />}
        {geometry === "octa" && <octahedronGeometry args={[0.35, 0]} />}
        {geometry === "tetra" && <tetrahedronGeometry args={[0.35, 0]} />}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.2}
          wireframe
        />
      </mesh>
    </Float>
  );
}

function FloatingTorus() {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.2;
  });

  return (
    <group ref={ref} position={[2.8, -1.2, -1]}>
      <Torus args={[0.9, 0.08, 32, 100]}>
        <MeshWobbleMaterial
          color={palette.coral}
          emissive={palette.coral}
          emissiveIntensity={0.25}
          metalness={0.7}
          roughness={0.3}
          factor={0.4}
          speed={1.5}
        />
      </Torus>
    </group>
  );
}

function Scene() {
  const sparkles = useMemo(
    () => ({
      count: 80,
      scale: 14,
      size: 2.5,
      speed: 0.3,
    }),
    []
  );

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[8, 8, 5]} intensity={1.2} color={palette.cream} />
      <pointLight position={[-4, 2, 4]} intensity={2} color={palette.accent} />
      <pointLight position={[4, -2, 2]} intensity={1.5} color={palette.cyan} />

      <Environment preset="night" />

      <MouseRig>
        <group position={[2.2, 0.3, 0]}>
          <CoreKnot />
          <OrbitRing radius={2.2} speed={0.15} color={palette.cyan} />
          <OrbitRing radius={2.6} speed={-0.1} color={palette.accent} wireframe />
          <Satellite position={[2.4, 0.8, 0.5]} geometry="octa" color={palette.cyan} speed={0.8} />
          <Satellite position={[-2.1, -0.6, 1]} geometry="box" color={palette.coral} speed={0.6} />
          <Satellite position={[0.5, 2.2, -0.8]} geometry="tetra" color={palette.violet} speed={1} />
          <FloatingTorus />
        </group>
      </MouseRig>

      <Sparkles
        count={sparkles.count}
        scale={sparkles.scale}
        size={sparkles.size}
        speed={sparkles.speed}
        color={palette.accent}
        opacity={0.55}
      />
    </>
  );
}

export function HeroSceneInner() {
  return (
    <CanvasWrapper
      className="h-full w-full"
      camera={{ position: [0, 0, 7.5], fov: 42 }}
      dpr={[1, 1.75]}
    >
      <Scene />
    </CanvasWrapper>
  );
}
