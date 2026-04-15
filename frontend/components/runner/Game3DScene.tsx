"use client";

import { useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Cat3D } from "./Cat3D";
import { Coin3D } from "./Coin3D";
import { Obstacle3D } from "./Obstacle3D";
import type { GameState } from "@/types/runner";

interface Game3DSceneProps {
  gameState: GameState;
  catPosition: number;
  playerLane: 0 | 1 | 2;
  jumping: boolean;
  sliding: boolean;
}

function CityBuilder() {
  const buildings = useMemo(() => {
    const buildings: Array<{ x: number; z: number; height: number; id: string; color: string }> = [];
    for (let i = -20; i < 50; i++) {
      for (let side = -1; side <= 1; side += 2) {
        const height = 3 + Math.random() * 4;
        const x = side * (2 + Math.random() * 0.5);
        const z = i * 4;
        const hue = 250 + Math.floor(Math.random() * 95);
        const lightness = 35 + Math.floor(Math.random() * 25);
        buildings.push({
          x,
          z,
          height,
          id: `${i}-${side}`,
          color: `hsl(${hue} 65% ${lightness}%)`,
        });
      }
    }
    return buildings;
  }, []);

  return (
    <group>
      {/* Ground */}
      <mesh position={[0, -1, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 500]} />
        <meshStandardMaterial color="#170f2e" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Road */}
      <mesh position={[0, -0.98, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.2, 500]} />
        <meshStandardMaterial color="#312e81" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Lane markers */}
      {[-1, 0, 1].map((lane) => (
        <group key={`lane-${lane}`}>
          {Array.from({ length: 100 }).map((_, i) => (
            <mesh key={`marker-${i}`} position={[lane, 0.01, i * 4]}>
              <boxGeometry args={[0.15, 0.01, 0.3]} />
              <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.35} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Buildings */}
      {buildings.map((building) => (
        <mesh
          key={building.id}
          position={[building.x, building.height / 2, building.z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.2, building.height, 1.2]} />
          <meshStandardMaterial
            color={building.color}
            emissive="#ec4899"
            emissiveIntensity={0.18}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene3D({ gameState, catPosition, playerLane, jumping, sliding }: Game3DSceneProps) {
  const { camera } = useThree();

  // Update camera position to follow cat
  useFrame(() => {
    if (camera) {
      const targetCamZ = catPosition * 2 + 5;
      const targetCamX = playerLane - 1;
      camera.position.lerp(
        new THREE.Vector3(targetCamX, 3, targetCamZ),
        0.1
      );
      camera.lookAt(playerLane - 1, 1, catPosition * 2);
    }
  });

  const catX = (playerLane - 1);
  const catY = 0;

  return (
    <>
      <fog attach="fog" args={["#140a24", 20, 82]} />

      {/* Lighting */}
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={100}
        shadow-camera-near={0.1}
      />
      <pointLight position={[0, 5, catPosition * 2]} intensity={1} color="#f472b6" />
      <pointLight position={[0, 4, catPosition * 2 - 4]} intensity={0.6} color="#22d3ee" />

      {/* Background */}
      <CityBuilder />

      {/* Cat Player */}
      <Cat3D
        position={[catX, catY, catPosition * 2]}
        jumping={jumping}
        sliding={sliding}
      />

      {/* Coins */}
      {gameState.coins
        .filter((coin) => !coin.collected && coin.y < catPosition * 2 + 30)
        .map((coin) => {
          const coinLaneX = (coin.lane - 1);
          return (
            <Coin3D
              key={coin.id}
              position={[coinLaneX, 0.5, coin.y * 2]}
              collected={coin.collected}
            />
          );
        })}

      {/* Obstacles */}
      {gameState.obstacles
        .filter((obs) => obs.y < catPosition * 2 + 30)
        .map((obs) => {
          const obsLaneX = (obs.lane - 1);
          return (
            <Obstacle3D
              key={obs.id}
              position={[obsLaneX, obs.type === "wall" ? 0.75 : 0.15, obs.y * 2]}
              type={obs.type}
            />
          );
        })}
    </>
  );
}

interface CanvasWrapperProps extends Game3DSceneProps {}

function CanvasRenderer(props: CanvasWrapperProps) {
  try {
    return (
      <Canvas
        shadows
        camera={{
          position: [0, 3, 15],
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        dpr={[1, 1.75]}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
        onError={(error: any) => {
          console.error("Canvas error:", error);
        }}
      >
        <color attach="background" args={["#12091f"]} />
        <Scene3D {...props} />
      </Canvas>
    );
  } catch (error) {
    console.error("Failed to render 3D scene:", error);
    return null;
  }
}

export const Game3DScene = CanvasRenderer;
