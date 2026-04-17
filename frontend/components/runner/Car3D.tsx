"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Car3DProps {
  position: [number, number, number];
  jumping: boolean;
  sliding: boolean;
  accentTint?: string;
}

const DEFAULT_ACCENT = "#22d3ee";

function WheelAssembly({
  position,
  groupRef,
}: {
  position: [number, number, number];
  groupRef: (el: THREE.Group | null) => void;
}) {
  return (
    <group ref={groupRef} position={position}>
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.132, 0.132, 0.11, 28]} />
        <meshStandardMaterial color="#0c0c12" roughness={0.92} metalness={0.08} />
      </mesh>
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.095, 0.088, 0.07, 28]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.18} envMapIntensity={1.2} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.072, 0.012, 8, 24]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.75} roughness={0.35} />
      </mesh>
    </group>
  );
}

/** Stylized neon chase car — clearcoat body, chrome rims, LEDs, underglow. */
export function Car3D({ position, jumping, sliding, accentTint }: Car3DProps) {
  const rootRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const underglowRef = useRef<THREE.MeshBasicMaterial>(null);
  const bodyMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const stripeMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const wheelGroups = useRef<(THREE.Group | null)[]>([]);

  const accentHex = accentTint || DEFAULT_ACCENT;
  const accentColor = useMemo(() => new THREE.Color(accentHex), [accentHex]);

  useEffect(() => {
    if (bodyMatRef.current) {
      bodyMatRef.current.emissive = accentColor.clone().multiplyScalar(0.12);
      bodyMatRef.current.emissiveIntensity = 0.45;
      bodyMatRef.current.needsUpdate = true;
    }
    if (stripeMatRef.current) {
      stripeMatRef.current.color = accentColor.clone().lerp(new THREE.Color("#0f172a"), 0.35);
      stripeMatRef.current.emissive = accentColor.clone().multiplyScalar(0.4);
      stripeMatRef.current.emissiveIntensity = 0.55;
      stripeMatRef.current.needsUpdate = true;
    }
  }, [accentColor]);

  useFrame((state) => {
    if (!rootRef.current) return;
    const t = state.clock.getElapsedTime();
    const bob = Math.abs(Math.sin(t * 9));
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

    const spin = t * 15;
    wheelGroups.current.forEach((g) => {
      if (g) g.rotation.x = spin;
    });

    if (underglowRef.current) {
      underglowRef.current.opacity = 0.12 + Math.sin(t * 3.2) * 0.06;
    }
  });

  const wheelPos: Array<[number, number, number]> = [
    [0.41, 0.095, 0.46],
    [-0.41, 0.095, 0.46],
    [0.41, 0.095, -0.52],
    [-0.41, 0.095, -0.52],
  ];

  return (
    <group ref={rootRef} position={position}>
      {/* Underglow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} renderOrder={-1}>
        <ringGeometry args={[0.28, 0.52, 40]} />
        <meshBasicMaterial
          ref={underglowRef}
          color={accentHex}
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Lower hull — wide wedge */}
      <mesh castShadow receiveShadow position={[0, 0.19, 0.04]}>
        <boxGeometry args={[0.78, 0.16, 1.42]} />
        <meshPhysicalMaterial
          ref={bodyMatRef}
          color="#0f172a"
          metalness={0.55}
          roughness={0.32}
          clearcoat={0.92}
          clearcoatRoughness={0.14}
        />
      </mesh>

      {/* Nose wedge */}
      <mesh castShadow position={[0, 0.2, 0.82]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.62, 0.14, 0.28]} />
        <meshPhysicalMaterial
          color="#1e293b"
          metalness={0.5}
          roughness={0.28}
          clearcoat={1}
          clearcoatRoughness={0.12}
        />
      </mesh>

      {/* Side skirts */}
      <mesh castShadow position={[0.39, 0.08, 0]} rotation={[0, 0, 0.05]}>
        <boxGeometry args={[0.06, 0.06, 1.2]} />
        <meshStandardMaterial color="#020617" metalness={0.4} roughness={0.55} />
      </mesh>
      <mesh castShadow position={[-0.39, 0.08, 0]} rotation={[0, 0, -0.05]}>
        <boxGeometry args={[0.06, 0.06, 1.2]} />
        <meshStandardMaterial color="#020617" metalness={0.4} roughness={0.55} />
      </mesh>

      {/* Accent stripe */}
      <mesh position={[0, 0.26, 0.02]}>
        <boxGeometry args={[0.74, 0.028, 1.15]} />
        <meshStandardMaterial ref={stripeMatRef} metalness={0.35} roughness={0.45} />
      </mesh>

      {/* Cabin */}
      <mesh castShadow position={[0, 0.46, -0.06]}>
        <boxGeometry args={[0.56, 0.24, 0.52]} />
        <meshPhysicalMaterial color="#020617" metalness={0.35} roughness={0.4} clearcoat={0.85} clearcoatRoughness={0.2} />
      </mesh>

      {/* Glass canopy — high-gloss transparent (no transmission shader). */}
      <mesh position={[0, 0.5, 0.12]} rotation={[0.38, 0, 0]}>
        <boxGeometry args={[0.5, 0.2, 0.38]} />
        <meshStandardMaterial
          color="#bae6fd"
          metalness={0.88}
          roughness={0.09}
          transparent
          opacity={0.48}
          emissive="#0c4a6e"
          emissiveIntensity={0.12}
          envMapIntensity={1.1}
          depthWrite={false}
        />
      </mesh>

      {/* Grille */}
      <mesh position={[0, 0.18, 0.78]}>
        <boxGeometry args={[0.48, 0.1, 0.06]} />
        <meshStandardMaterial color="#020617" metalness={0.2} roughness={0.75} />
      </mesh>

      {/* LED headlights */}
      <mesh position={[0.22, 0.2, 0.76]} rotation={[0, 0, Math.PI / 4]}>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshStandardMaterial color="#ecfeff" emissive="#fef9c3" emissiveIntensity={1.1} metalness={0.2} roughness={0.25} />
      </mesh>
      <mesh position={[-0.22, 0.2, 0.76]} rotation={[0, 0, -Math.PI / 4]}>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshStandardMaterial color="#ecfeff" emissive="#fef9c3" emissiveIntensity={1.1} metalness={0.2} roughness={0.25} />
      </mesh>

      {/* DRL strip */}
      <mesh position={[0, 0.14, 0.79]}>
        <boxGeometry args={[0.5, 0.02, 0.03]} />
        <meshStandardMaterial color="#a5f3fc" emissive={accentHex} emissiveIntensity={0.8} />
      </mesh>

      {/* Mirrors */}
      <mesh castShadow position={[0.34, 0.38, 0.08]}>
        <boxGeometry args={[0.06, 0.05, 0.04]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh castShadow position={[-0.34, 0.38, 0.08]}>
        <boxGeometry args={[0.06, 0.05, 0.04]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.35} />
      </mesh>

      {/* Spoiler + wing */}
      <mesh castShadow position={[0, 0.44, -0.66]}>
        <boxGeometry args={[0.68, 0.05, 0.1]} />
        <meshPhysicalMaterial color="#0f172a" metalness={0.55} roughness={0.3} clearcoat={0.9} clearcoatRoughness={0.15} />
      </mesh>
      <mesh castShadow position={[0, 0.52, -0.7]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.52, 0.03, 0.14]} />
        <meshStandardMaterial color="#334155" metalness={0.65} roughness={0.35} />
      </mesh>

      {/* Taillights */}
      <mesh position={[0.24, 0.22, -0.74]}>
        <boxGeometry args={[0.12, 0.06, 0.04]} />
        <meshStandardMaterial color="#7f1d1d" emissive="#f87171" emissiveIntensity={0.85} />
      </mesh>
      <mesh position={[-0.24, 0.22, -0.74]}>
        <boxGeometry args={[0.12, 0.06, 0.04]} />
        <meshStandardMaterial color="#7f1d1d" emissive="#f87171" emissiveIntensity={0.85} />
      </mesh>

      {wheelPos.map((pos, i) => (
        <WheelAssembly
          key={i}
          position={pos}
          groupRef={(el) => {
            wheelGroups.current[i] = el;
          }}
        />
      ))}

      <mesh ref={shadowRef} position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.46, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.26} />
      </mesh>
    </group>
  );
}
