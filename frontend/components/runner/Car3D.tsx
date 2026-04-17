"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Car3DProps {
  position: [number, number, number];
  jumping: boolean;
  sliding: boolean;
  accentTint?: string;
}

/** Low-poly chase car (no GLB). Faces down-lane like the previous GLB runner (`rotation.y = π`). */
export function Car3D({ position, jumping, sliding, accentTint }: Car3DProps) {
  const rootRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const bodyMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const wheelRefs = useRef<(THREE.Mesh | null)[]>([]);

  useEffect(() => {
    if (!bodyMatRef.current || !accentTint) return;
    const c = new THREE.Color(accentTint);
    bodyMatRef.current.emissive = c.clone().multiplyScalar(0.28);
    bodyMatRef.current.needsUpdate = true;
  }, [accentTint]);

  useFrame((state) => {
    if (!rootRef.current) return;
    const bob = Math.abs(Math.sin(state.clock.getElapsedTime() * 9));
    const target = new THREE.Vector3(...position);

    rootRef.current.position.lerp(target, 0.16);
    rootRef.current.rotation.y = Math.PI;

    if (jumping) {
      rootRef.current.rotation.x = Math.PI / 12;
      rootRef.current.position.y += 0.15;
      rootRef.current.scale.setScalar(0.96);
    } else if (sliding) {
      rootRef.current.rotation.x = Math.PI / 6;
      rootRef.current.position.y += -0.05;
      rootRef.current.scale.set(1.04, 0.78, 1.04);
    } else {
      rootRef.current.rotation.x *= 0.88;
      rootRef.current.position.y += bob * 0.018;
      rootRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.18);
    }

    if (shadowRef.current) {
      const shadowScale = jumping ? 0.8 : sliding ? 1.1 : 1 - bob * 0.06;
      shadowRef.current.scale.set(shadowScale, shadowScale, 1);
    }

    const t = state.clock.getElapsedTime() * 14;
    wheelRefs.current.forEach((w) => {
      if (w) w.rotation.x = t;
    });
  });

  const bodyColor = "#1e293b";
  const glass = "#38bdf8";
  const wheelPositions: Array<[number, number, number]> = [
    [0.38, 0.1, 0.42],
    [-0.38, 0.1, 0.42],
    [0.38, 0.1, -0.48],
    [-0.38, 0.1, -0.48],
  ];

  return (
    <group ref={rootRef} position={position}>
      {/* Local +Z is forward; root `rotation.y = π` aligns with lane */}
      <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[0.72, 0.2, 1.35]} />
        <meshStandardMaterial
          ref={bodyMatRef}
          color={bodyColor}
          metalness={0.35}
          roughness={0.45}
          emissive="#0f172a"
          emissiveIntensity={0.15}
        />
      </mesh>
      <mesh castShadow position={[0, 0.48, -0.08]}>
        <boxGeometry args={[0.58, 0.26, 0.55]} />
        <meshStandardMaterial color="#0f172a" metalness={0.2} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.48, 0.22]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[0.52, 0.2, 0.04]} />
        <meshStandardMaterial color={glass} metalness={0.6} roughness={0.15} transparent opacity={0.55} />
      </mesh>
      <mesh position={[0.26, 0.2, 0.66]}>
        <boxGeometry args={[0.1, 0.08, 0.04]} />
        <meshStandardMaterial color="#fef9c3" emissive="#fef08a" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[-0.26, 0.2, 0.66]}>
        <boxGeometry args={[0.1, 0.08, 0.04]} />
        <meshStandardMaterial color="#fef9c3" emissive="#fef08a" emissiveIntensity={0.9} />
      </mesh>
      {wheelPositions.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => {
            wheelRefs.current[i] = el;
          }}
          castShadow
          position={pos}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.11, 0.11, 0.1, 14]} />
          <meshStandardMaterial color="#0b1220" metalness={0.05} roughness={0.85} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 0.42, -0.62]}>
        <boxGeometry args={[0.62, 0.06, 0.12]} />
        <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.5} />
      </mesh>

      <mesh ref={shadowRef} position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.24} />
      </mesh>
    </group>
  );
}
