"use client";

import type { MutableRefObject } from "react";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ObstacleType } from "@/types/runner";

interface TrafficCar3DProps {
  position: [number, number, number];
  type: ObstacleType;
  /** Stable id for color variety per car. */
  styleSeed: number;
}

const PALETTES = [
  { body: "#9f1239", cabin: "#4c0519", glass: "#7dd3fc", rim: "#e2e8f0" },
  { body: "#a16207", cabin: "#422006", glass: "#bae6fd", rim: "#cbd5e1" },
  { body: "#6b21a8", cabin: "#2e1065", glass: "#c4b5fd", rim: "#e9d5ff" },
  { body: "#0f766e", cabin: "#042f2e", glass: "#99f6e4", rim: "#ccfbf1" },
  { body: "#b45309", cabin: "#431407", glass: "#fed7aa", rim: "#fef3c7" },
] as const;

function Wheel({
  pos,
  spinRef,
  idx,
  rim,
}: {
  pos: [number, number, number];
  spinRef: MutableRefObject<(THREE.Group | null)[]>;
  idx: number;
  rim: string;
}) {
  return (
    <group
      ref={(el) => {
        spinRef.current[idx] = el;
      }}
      position={pos}
    >
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.11, 0.11, 0.09, 10]} />
        <meshStandardMaterial color="#0a0a0f" roughness={0.9} metalness={0.06} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.078, 0.072, 0.055, 10]} />
        <meshStandardMaterial color={rim} metalness={0.88} roughness={0.2} />
      </mesh>
    </group>
  );
}

/** Other traffic in the lane — tall van (`wall` = jump) or low sedan (`barrier` = slide under). */
export function TrafficCar3D({ position, type, styleSeed }: TrafficCar3DProps) {
  const rootRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const wheelSpin = useRef<(THREE.Group | null)[]>([]);

  const palette = useMemo(() => PALETTES[Math.abs(styleSeed) % PALETTES.length], [styleSeed]);
  const tall = type === "wall";

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 13;
    wheelSpin.current.forEach((g) => {
      if (g) g.rotation.x = t;
    });
  });

  const len = tall ? 1.22 : 1.32;
  const bodyH = tall ? 0.22 : 0.12;
  const bodyY = tall ? 0.14 : 0.08;
  const cabinH = tall ? 0.26 : 0.11;
  const cabinY = tall ? 0.33 : 0.17;
  const wx = 0.36;
  const wheelY = bodyY - bodyH * 0.45;
  const wheelZf = len * 0.32;
  const wheelZr = -len * 0.36;

  return (
    <group ref={rootRef} position={position} rotation={[0, Math.PI, 0]}>
      <mesh castShadow receiveShadow position={[0, bodyY, 0]}>
        <boxGeometry args={[0.76, bodyH, len]} />
        <meshPhysicalMaterial
          color={palette.body}
          metalness={0.45}
          roughness={0.38}
          clearcoat={0.75}
          clearcoatRoughness={0.22}
        />
      </mesh>

      <mesh castShadow position={[0, cabinY, tall ? -0.06 : 0.02]}>
        <boxGeometry args={[0.62, cabinH, tall ? 0.55 : 0.48]} />
        <meshStandardMaterial color={palette.cabin} metalness={0.35} roughness={0.45} />
      </mesh>

      <mesh position={[0, cabinY + 0.02, tall ? 0.12 : 0.18]} rotation={[0.32, 0, 0]}>
        <boxGeometry args={[0.52, tall ? 0.14 : 0.1, 0.34]} />
        <meshStandardMaterial
          color={palette.glass}
          metalness={0.75}
          roughness={0.12}
          transparent
          opacity={0.42}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, bodyY, len * 0.42]}>
        <boxGeometry args={[0.55, bodyH * 0.7, 0.05]} />
        <meshStandardMaterial color="#fef9c3" emissive="#fef08a" emissiveIntensity={0.55} />
      </mesh>

      {tall ? (
        <mesh position={[0, cabinY + 0.08, -len * 0.38]}>
          <boxGeometry args={[0.58, 0.06, 0.12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.4} />
        </mesh>
      ) : (
        <mesh position={[0, bodyY - 0.02, -len * 0.42]}>
          <boxGeometry args={[0.62, 0.04, 0.08]} />
          <meshStandardMaterial color="#7f1d1d" emissive="#f87171" emissiveIntensity={0.45} />
        </mesh>
      )}

      <Wheel pos={[wx, wheelY, wheelZf]} spinRef={wheelSpin} idx={0} rim={palette.rim} />
      <Wheel pos={[-wx, wheelY, wheelZf]} spinRef={wheelSpin} idx={1} rim={palette.rim} />
      <Wheel pos={[wx, wheelY, wheelZr]} spinRef={wheelSpin} idx={2} rim={palette.rim} />
      <Wheel pos={[-wx, wheelY, wheelZr]} spinRef={wheelSpin} idx={3} rim={palette.rim} />

      <mesh ref={shadowRef} position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.44, 28]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} />
      </mesh>
    </group>
  );
}
