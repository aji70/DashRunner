"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface Coin3DProps {
  position: [number, number, number];
  collected?: boolean;
}

/**
 * Gold pickup read as a flat disc: always faces the camera (`lookAt`), with a slow in-plane spin for shine.
 */
export function Coin3D({ position, collected }: Coin3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useFrame((state) => {
    if (!meshRef.current || collected) return;
    const dt = state.clock.getDelta();
    const bob = Math.sin(state.clock.elapsedTime * 6) * 0.08;

    meshRef.current.position.set(position[0], position[1] + bob, position[2]);
    meshRef.current.lookAt(camera.position);
    // `rotateZ` is incremental in local space — spin the disc in its plane after facing the camera.
    meshRef.current.rotateZ(dt * 2.8);
  });

  if (collected) return null;

  return (
    <mesh ref={meshRef} position={position}>
      <circleGeometry args={[0.28, 48]} />
      <meshStandardMaterial
        color="#FFD700"
        emissive="#FFD700"
        emissiveIntensity={0.45}
        metalness={0.55}
        roughness={0.32}
      />
    </mesh>
  );
}
