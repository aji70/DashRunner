"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Coin3DProps {
  position: [number, number, number];
  collected?: boolean;
}

export function Coin3D({ position, collected }: Coin3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const baseYRef = useRef(position[1]);

  useFrame((state) => {
    if (!meshRef.current || collected) return;
    meshRef.current.rotation.y += 6 * state.delta;
    meshRef.current.position.y = baseYRef.current + Math.sin(state.clock.elapsedTime * 6) * 0.08;
  });

  if (collected) return null;

  return (
    <mesh ref={meshRef} position={position} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.25, 0.25, 0.08, 16]} />
      <meshStandardMaterial
        color="#FFD700"
        emissive="#FFD700"
        emissiveIntensity={0.6}
      />
    </mesh>
  );
}
