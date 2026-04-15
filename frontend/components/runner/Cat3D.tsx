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

  useFrame(() => {
    if (!groupRef.current) return;

    // Smooth position updates
    groupRef.current.position.lerp(
      new THREE.Vector3(...position),
      0.1
    );

    // Rotation based on movement
    if (jumping) {
      groupRef.current.rotation.x = Math.PI / 6;
    } else if (sliding) {
      groupRef.current.rotation.x = Math.PI / 3;
    } else {
      groupRef.current.rotation.x *= 0.9;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.6]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>

      {/* Head */}
      <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>

      {/* Left Ear */}
      <mesh castShadow position={[-0.2, 0.95, 0]}>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>

      {/* Right Ear */}
      <mesh castShadow position={[0.2, 0.95, 0]}>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>

      {/* Left Eye */}
      <mesh position={[-0.12, 0.65, 0.33]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={0.5} />
      </mesh>

      {/* Right Eye */}
      <mesh position={[0.12, 0.65, 0.33]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={0.5} />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0.55, 0.35]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#FF69B4" />
      </mesh>

      {/* Tail */}
      <mesh position={[0, 0, -0.6]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.06, 0.8, 8]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>

      {/* Front Left Leg */}
      <mesh castShadow position={[-0.2, -0.4, 0.25]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>

      {/* Front Right Leg */}
      <mesh castShadow position={[0.2, -0.4, 0.25]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>

      {/* Back Left Leg */}
      <mesh castShadow position={[-0.2, -0.4, -0.25]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>

      {/* Back Right Leg */}
      <mesh castShadow position={[0.2, -0.4, -0.25]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
    </group>
  );
}
