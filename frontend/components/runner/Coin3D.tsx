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

  useFrame(() => {
    if (!meshRef.current || collected) return;
    meshRef.current.rotation.x += 0.05;
    meshRef.current.rotation.y += 0.08;
    meshRef.current.position.y += Math.sin(Date.now() * 0.003) * 0.01;
  });

  if (collected) return null;

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <cylinderGeometry args={[0.25, 0.25, 0.08, 32]} />
      <meshStandardMaterial
        color="#FFD700"
        emissive="#FFD700"
        emissiveIntensity={0.6}
      />
    </mesh>
  );
}
