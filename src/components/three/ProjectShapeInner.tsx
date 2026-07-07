"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MeshDistortMaterial } from "@react-three/drei";
import { CanvasWrapper } from "./CanvasWrapper";

type ProjectShapeInnerProps = {
  variant: 0 | 1 | 2 | 3;
  accent: string;
  hovered: boolean;
};

function Shape({ variant, accent, hovered }: ProjectShapeInnerProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const scale = useRef(1);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    const target = hovered ? 1.15 : 1;
    scale.current = THREE.MathUtils.lerp(scale.current, target, delta * 6);
    mesh.current.scale.setScalar(scale.current);
    mesh.current.rotation.x = state.clock.elapsedTime * 0.5;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.7;
  });

  if (variant === 0) {
    return (
      <mesh ref={mesh}>
        <torusGeometry args={[0.7, 0.22, 24, 48]} />
        <MeshDistortMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
          distort={hovered ? 0.5 : 0.25}
          speed={3}
        />
      </mesh>
    );
  }

  if (variant === 1) {
    return (
      <mesh ref={mesh}>
        <octahedronGeometry args={[0.85, 0]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.45}
          metalness={0.9}
          roughness={0.15}
          wireframe
        />
      </mesh>
    );
  }

  if (variant === 2) {
    return (
      <mesh ref={mesh}>
        <icosahedronGeometry args={[0.75, 0]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.35}
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>
    );
  }

  return (
    <mesh ref={mesh}>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      <meshStandardMaterial
        color={accent}
        emissive={accent}
        emissiveIntensity={0.4}
        metalness={0.75}
        roughness={0.25}
        wireframe
      />
    </mesh>
  );
}

function Scene(props: ProjectShapeInnerProps) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 2, 3]} intensity={1.5} color={props.accent} />
      <Shape {...props} />
    </>
  );
}

export function ProjectShapeInner(props: ProjectShapeInnerProps) {
  return (
    <CanvasWrapper
      className="h-full w-full"
      camera={{ position: [0, 0, 3.2], fov: 40 }}
      dpr={[1, 1.5]}
    >
      <Scene {...props} />
    </CanvasWrapper>
  );
}
