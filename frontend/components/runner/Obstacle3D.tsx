"use client";

interface Obstacle3DProps {
  position: [number, number, number];
  type: "wall" | "barrier";
}

export function Obstacle3D({ position, type }: Obstacle3DProps) {
  if (type === "wall") {
    return (
      <mesh position={position} castShadow receiveShadow>
        <boxGeometry args={[1, 1.5, 0.5]} />
        <meshStandardMaterial color="#00F0FF" emissive="#0088FF" emissiveIntensity={0.3} />
      </mesh>
    );
  }

  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[1, 0.3, 1]} />
      <meshStandardMaterial color="#FF0080" emissive="#FF0080" emissiveIntensity={0.2} />
    </mesh>
  );
}
