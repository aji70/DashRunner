"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Cat3DProps {
  position: [number, number, number];
  jumping: boolean;
  sliding: boolean;
}

export function Cat3D({ position, jumping, sliding }: Cat3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const runTime = state.clock.getElapsedTime();
    const bob = Math.abs(Math.sin(runTime * 10));
    const target = new THREE.Vector3(...position);

    // Smooth position updates
    groupRef.current.position.lerp(target, 0.16);

    // Face forward down the lane (away from camera, into the run)
    groupRef.current.rotation.y = 0;

    // Rotation based on movement state
    if (jumping) {
      groupRef.current.rotation.x = Math.PI / 10;
    } else if (sliding) {
      groupRef.current.rotation.x = Math.PI / 4;
    } else {
      groupRef.current.rotation.x *= 0.9;
    }

    groupRef.current.position.y += jumping ? 0.14 : sliding ? -0.08 : bob * 0.035;

    if (shadowRef.current) {
      const shadowScale = jumping ? 0.75 : sliding ? 1.15 : 1 - bob * 0.08;
      shadowRef.current.scale.set(shadowScale, shadowScale, 1);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Rounded main block */}
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[0.56, 0.62, 0.56]} />
        <meshStandardMaterial color="#ff5bbd" emissive="#8b1d63" emissiveIntensity={0.24} />
      </mesh>

      {/* Rounded top cap */}
      <mesh castShadow receiveShadow position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.22, 18, 16]} />
        <meshStandardMaterial color="#ffc857" />
      </mesh>

      {/* Front face panel */}
      <mesh position={[0, 0.43, -0.29]}>
        <boxGeometry args={[0.26, 0.14, 0.04]} />
        <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={0.75} />
      </mesh>

      {/* Small side nubs to avoid a dead cube feel */}
      <mesh castShadow receiveShadow position={[-0.32, 0.33, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#7dd3fc" />
      </mesh>
      <mesh castShadow receiveShadow position={[0.32, 0.33, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#7dd3fc" />
      </mesh>

      {/* Bottom edge / base */}
      <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[0.42, 0.14, 0.42]} />
        <meshStandardMaterial color="#34d399" />
      </mesh>

      {/* Contact shadow */}
      <mesh ref={shadowRef} position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.34, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} />
      </mesh>
    </group>
  );
}
