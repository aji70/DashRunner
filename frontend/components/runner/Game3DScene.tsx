"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Cat3D } from "./Cat3D";
import { Character3D } from "./Character3D";
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

const WORLD_SCROLL_SCALE = 0.045;
const TRACK_CENTER_Z = 14;

function CityBuilder() {
  const buildings = useMemo(() => {
    const buildings: Array<{
      x: number;
      z: number;
      height: number;
      id: string;
      color: string;
      width: number;
      depth: number;
      roofHeight: number;
      windowRows: number;
      windowCols: number;
      setback: number;
    }> = [];
    for (let i = -10; i < 30; i++) {
      for (let side = -1; side <= 1; side += 2) {
        const height = 3.2 + Math.random() * 4.8;
        const width = 0.85 + Math.random() * 0.45;
        const depth = 0.9 + Math.random() * 0.5;
        const roofHeight = 0.15 + Math.random() * 0.28;
        const setback = 0.12 + Math.random() * 0.08;
        const x = side * (2.4 + Math.random() * 0.7);
        const z = i * 4;
        const hue = 205 + Math.floor(Math.random() * 32);
        const lightness = 30 + Math.floor(Math.random() * 18);
        const windowRows = Math.max(3, Math.floor(height * 1.6));
        const windowCols = 2 + Math.floor(Math.random() * 2);
        buildings.push({
          x,
          z,
          height,
          id: `${i}-${side}`,
          color: `hsl(${hue} 20% ${lightness}%)`,
          width,
          depth,
          roofHeight,
          windowRows,
          windowCols,
          setback,
        });
      }
    }
    return buildings;
  }, []);
  const simplifiedRows = useMemo(() => new Set<number>([0, 2, 4, 6]), []);

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

      {/* Sidewalks */}
      {[-1, 1].map((side) => (
        <mesh key={`sidewalk-${side}`} position={[side * 2.7, -0.97, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.1, 500]} />
          <meshStandardMaterial color="#5b6070" roughness={0.9} metalness={0.05} />
        </mesh>
      ))}

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

      {/* Buildings (reduced visual complexity for mobile performance) */}
      {buildings.map((building) => (
        <group key={building.id}>
          <mesh
            position={[building.x, building.height / 2, building.z]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[building.width, building.height, building.depth]} />
            <meshStandardMaterial
              color={building.color}
              roughness={0.72}
              metalness={0.18}
            />
          </mesh>

          {/* roof cap */}
          <mesh
            position={[building.x, building.height + building.roofHeight / 2, building.z]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[building.width * 1.02, building.roofHeight, building.depth * 1.02]} />
            <meshStandardMaterial color="#8b92a5" roughness={0.6} metalness={0.25} />
          </mesh>

          {/* upper setback tower for depth */}
          <mesh
            position={[building.x, building.height * 0.78, building.z]}
            castShadow
            receiveShadow
          >
            <boxGeometry
              args={[
                Math.max(0.35, building.width - building.setback),
                building.height * 0.35,
                Math.max(0.35, building.depth - building.setback),
              ]}
            />
            <meshStandardMaterial color="#4d5566" roughness={0.72} metalness={0.2} />
          </mesh>

          {/* front facade windows */}
          {Array.from({ length: building.windowRows }).map((_, row) =>
            simplifiedRows.has(row % 8) &&
            Array.from({ length: building.windowCols }).map((__, col) => {
              const windowX =
                building.x -
                ((building.windowCols - 1) * 0.18) / 2 +
                col * 0.18;
              const windowY = 0.35 + row * 0.42;
              const windowZ = building.z + building.depth / 2 + 0.01;
              const lit = (row + col + Math.floor(building.x * 10)) % 3 !== 0;
              return (
                <mesh
                  key={`w-${building.id}-${row}-${col}`}
                  position={[windowX, windowY, windowZ]}
                >
                  <planeGeometry args={[0.1, 0.2]} />
                  <meshStandardMaterial
                    color={lit ? "#d8ecff" : "#2e3d52"}
                    emissive={lit ? "#ffe29b" : "#000000"}
                    emissiveIntensity={lit ? 0.4 : 0}
                  />
                </mesh>
              );
            })
          )}
        </group>
      ))}
    </group>
  );
}

function Scene3D({ gameState, catPosition, playerLane, jumping, sliding }: Game3DSceneProps) {
  const { camera } = useThree();
  const [hasCharacterAssets, setHasCharacterAssets] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAssets = async () => {
      try {
        const required = [
          "/motions/character.glb",
          "/motions/running.glb",
          "/motions/jump.glb",
          "/motions/slide.glb",
        ];
        const checks = await Promise.all(
          required.map((path) =>
            fetch(path, { method: "HEAD" }).then((res) => res.ok).catch(() => false)
          )
        );
        if (isMounted) {
          setHasCharacterAssets(checks.every(Boolean));
        }
      } catch {
        if (isMounted) {
          setHasCharacterAssets(false);
        }
      }
    };

    checkAssets();
    return () => {
      isMounted = false;
    };
  }, []);

  // Keep a stable chase camera so the runner moves toward screen top.
  useFrame(() => {
    if (camera) {
      const targetCamX = playerLane - 1;
      camera.position.lerp(
        new THREE.Vector3(targetCamX, 4.6, catPosition - 8),
        0.1
      );
      camera.lookAt(playerLane - 1, 1, catPosition + 12);
    }
  });

  const catX = playerLane - 1;
  const catY = 0;
  const catZ = catPosition;
  const toWorldZ = (y: number) => catZ + TRACK_CENTER_Z - y * WORLD_SCROLL_SCALE;
  const cityOffsetZ = Math.floor(catZ / 4) * 4;

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
      <pointLight position={[0, 5, catZ + 6]} intensity={1} color="#f472b6" />
      <pointLight position={[0, 4, catZ - 4]} intensity={0.6} color="#22d3ee" />

      {/* Background */}
      <group position={[0, 0, cityOffsetZ]}>
        <CityBuilder />
      </group>

      {/* Player character (realistic GLB when present, primitive fallback otherwise) */}
      {hasCharacterAssets ? (
        <Suspense fallback={<Cat3D position={[catX, catY, catZ]} jumping={jumping} sliding={sliding} />}>
          <Character3D position={[catX, catY, catZ]} jumping={jumping} sliding={sliding} />
        </Suspense>
      ) : (
        <Cat3D position={[catX, catY, catZ]} jumping={jumping} sliding={sliding} />
      )}

      {/* Coins */}
      {gameState.coins
        .filter((coin) => {
          const coinZ = toWorldZ(coin.y);
          return !coin.collected && coinZ > catZ - 12 && coinZ < catZ + 30;
        })
        .map((coin) => {
          const coinLaneX = coin.lane - 1;
          return (
            <Coin3D
              key={coin.id}
              position={[coinLaneX, 0.5, toWorldZ(coin.y)]}
              collected={coin.collected}
            />
          );
        })}

      {/* Obstacles */}
      {gameState.obstacles
        .filter((obs) => {
          const obsZ = toWorldZ(obs.y);
          return obsZ > catZ - 12 && obsZ < catZ + 30;
        })
        .map((obs) => {
          const obsLaneX = obs.lane - 1;
          return (
            <Obstacle3D
              key={obs.id}
              position={[obsLaneX, obs.type === "wall" ? 0.75 : 0.15, toWorldZ(obs.y)]}
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
          fov: 68,
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
