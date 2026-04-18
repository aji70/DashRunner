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
    const deltaTime = state.clock.getDelta();
    meshRef.current.rotation.y += 6 * deltaTime;
    meshRef.current.position.y = baseYRef.current + Math.sin(state.clock.elapsedTime * 6) * 0.08;
  });

  if (collected) return null;

  /**
   * Thin disc (low cylinder) with a fixed tilt so the chase camera mostly sees the rim (sideways coin),
   * while the inner mesh spins on Y for a classic “rolling along the road” read.
   */
  return (
    <group position={position} rotation={[0.62, 0, 0]}>
      <mesh ref={meshRef} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.05, 24]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.55}
          metalness={0.65}
          roughness={0.28}
        />
      </mesh>
    </group>
  );
}
