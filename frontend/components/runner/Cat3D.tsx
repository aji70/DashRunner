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
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const bobRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const runTime = state.clock.getElapsedTime();
    const runSwing = Math.sin(runTime * 11) * 0.45;

    // Smooth position updates
    groupRef.current.position.lerp(
      new THREE.Vector3(...position),
      0.1
    );

    // Face forward down the lane (away from camera, into the run)
    groupRef.current.rotation.y = Math.PI;

    // Rotation based on movement state
    if (jumping) {
      groupRef.current.rotation.x = Math.PI / 10;
    } else if (sliding) {
      groupRef.current.rotation.x = Math.PI / 4;
    } else {
      groupRef.current.rotation.x *= 0.9;
    }

    if (bobRef.current) {
      bobRef.current.position.y = 0.03 + Math.abs(Math.sin(runTime * 11)) * 0.05;
    }

    if (leftArmRef.current && rightArmRef.current && leftLegRef.current && rightLegRef.current) {
      const armAmplitude = sliding ? 0.15 : jumping ? 0.2 : runSwing;
      const legAmplitude = sliding ? 0.1 : jumping ? 0.2 : runSwing;

      leftArmRef.current.rotation.x = armAmplitude;
      rightArmRef.current.rotation.x = -armAmplitude;
      leftLegRef.current.rotation.x = -legAmplitude;
      rightLegRef.current.rotation.x = legAmplitude;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <group ref={bobRef}>
        {/* Body */}
        <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
          <capsuleGeometry args={[0.24, 0.5, 8, 16]} />
          <meshStandardMaterial color="#ff4fd8" emissive="#7c1d72" emissiveIntensity={0.25} />
        </mesh>

        {/* Head */}
        <mesh castShadow receiveShadow position={[0, 0.72, 0]}>
          <sphereGeometry args={[0.25, 20, 20]} />
          <meshStandardMaterial color="#ffd166" />
        </mesh>

        {/* Visor */}
        <mesh position={[0, 0.72, -0.2]}>
          <boxGeometry args={[0.28, 0.12, 0.08]} />
          <meshStandardMaterial color="#5ee7ff" emissive="#5ee7ff" emissiveIntensity={0.6} />
        </mesh>

        {/* Arms */}
        <mesh ref={leftArmRef} castShadow position={[-0.28, 0.35, 0]}>
          <capsuleGeometry args={[0.07, 0.3, 6, 10]} />
          <meshStandardMaterial color="#7dd3fc" />
        </mesh>
        <mesh ref={rightArmRef} castShadow position={[0.28, 0.35, 0]}>
          <capsuleGeometry args={[0.07, 0.3, 6, 10]} />
          <meshStandardMaterial color="#7dd3fc" />
        </mesh>

        {/* Legs */}
        <mesh ref={leftLegRef} castShadow position={[-0.14, -0.2, 0]}>
          <capsuleGeometry args={[0.08, 0.38, 6, 10]} />
          <meshStandardMaterial color="#34d399" />
        </mesh>
        <mesh ref={rightLegRef} castShadow position={[0.14, -0.2, 0]}>
          <capsuleGeometry args={[0.08, 0.38, 6, 10]} />
          <meshStandardMaterial color="#34d399" />
        </mesh>
      </group>
    </group>
  );
}
