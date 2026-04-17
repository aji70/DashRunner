"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Car3D } from "./Car3D";
import { Coin3D } from "./Coin3D";
import { Obstacle3D } from "./Obstacle3D";
import type { GameState } from "@/types/runner";

interface Game3DSceneProps {
  gameState: GameState;
  catPosition: number;
  playerLane: 0 | 1 | 2;
  jumping: boolean;
  sliding: boolean;
  /** Route / city theme (0–31); shifts skyline palette and lighting. */
  cityId?: number;
  /** Per-character accent on the runner model. */
  characterTint?: string;
}

const CITY_ROUTE_THEMES = [
  { fog: "#140a24", bg: "#12091f", accentA: "#f472b6", accentB: "#22d3ee" },
  { fog: "#0f172a", bg: "#0c1424", accentA: "#38bdf8", accentB: "#a78bfa" },
  { fog: "#1a0a14", bg: "#160812", accentA: "#fb7185", accentB: "#fbbf24" },
  { fog: "#052e16", bg: "#041a0d", accentA: "#4ade80", accentB: "#86efac" },
  { fog: "#2a0f06", bg: "#1a0a04", accentA: "#fb923c", accentB: "#fcd34d" },
  { fog: "#0b1e2e", bg: "#07121c", accentA: "#7dd3fc", accentB: "#e0f2fe" },
] as const;

const WORLD_SCROLL_SCALE = 0.045;
const TRACK_CENTER_Z = 14;
const BUILDING_PALETTES = [
  { body: "#60a5fa", accent: "#f8fafc", secondary: "#bfdbfe" },
  { body: "#a78bfa", accent: "#fdf4ff", secondary: "#ddd6fe" },
  { body: "#f472b6", accent: "#fff1f2", secondary: "#fbcfe8" },
  { body: "#34d399", accent: "#ecfdf5", secondary: "#a7f3d0" },
  { body: "#f59e0b", accent: "#fffbeb", secondary: "#fde68a" },
  { body: "#22d3ee", accent: "#ecfeff", secondary: "#a5f3fc" },
];
const SKYLINE_PALETTES = ["#1d4ed8", "#7c3aed", "#db2777", "#0f766e", "#ea580c", "#0891b2"];

function SkylineLayer({
  catPosition,
  mobileMode = false,
  paletteShift = 0,
}: {
  catPosition: number;
  mobileMode?: boolean;
  paletteShift?: number;
}) {
  const skyline = useMemo(() => {
    const chunks: Array<{ x: number; z: number; width: number; height: number; color: string }> = [];
    const count = mobileMode ? 18 : 28;
    for (let i = -6; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      chunks.push({
        x: side * (6.2 + (i % 3) * 0.8),
        z: i * 8,
        width: 1.2 + (i % 4) * 0.35,
        height: 5 + (i % 5) * 1.4,
        color: SKYLINE_PALETTES[(i + paletteShift) % SKYLINE_PALETTES.length],
      });
    }
    return chunks;
  }, [mobileMode, paletteShift]);

  const skylineOffsetZ = Math.floor((catPosition * 0.35) / 8) * 8;

  return (
    <group position={[0, 0, skylineOffsetZ]}>
      {skyline.map((chunk, idx) => (
        <group key={`skyline-${idx}`}>
          <mesh position={[chunk.x, chunk.height / 2 + 0.2, chunk.z]}>
            <boxGeometry args={[chunk.width, chunk.height, 1.1]} />
            <meshBasicMaterial color={chunk.color} transparent opacity={0.55} />
          </mesh>
          <mesh position={[chunk.x, chunk.height / 2 + 0.2, chunk.z + 0.57]}>
            <planeGeometry args={[chunk.width * 0.7, chunk.height * 0.7]} />
            <meshBasicMaterial color="#e0f2fe" transparent opacity={0.18} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CityBuilder({ mobileMode = false }: { mobileMode?: boolean }) {
  const buildings = useMemo(() => {
    const buildings: Array<{
      x: number;
      z: number;
      height: number;
      id: string;
      color: string;
      accentColor: string;
      secondaryColor: string;
      width: number;
      depth: number;
      roofHeight: number;
      windowRows: number;
      windowCols: number;
      setback: number;
      style: "tower" | "steps" | "slab";
    }> = [];
    const start = mobileMode ? -6 : -10;
    const end = mobileMode ? 20 : 30;
    for (let i = start; i < end; i++) {
      for (let side = -1; side <= 1; side += 2) {
        const height = 3.2 + Math.random() * 4.8;
        const width = 0.85 + Math.random() * 0.45;
        const depth = 0.9 + Math.random() * 0.5;
        const roofHeight = 0.15 + Math.random() * 0.28;
        const setback = 0.12 + Math.random() * 0.08;
        const x = side * (2.4 + Math.random() * 0.7);
        const z = i * 4;
        const palette = BUILDING_PALETTES[Math.floor(Math.random() * BUILDING_PALETTES.length)];
        const windowRows = Math.max(3, Math.floor(height * 1.6));
        const windowCols = 2 + Math.floor(Math.random() * 2);
        buildings.push({
          x,
          z,
          height,
          id: `${i}-${side}`,
          color: palette.body,
          accentColor: palette.accent,
          secondaryColor: palette.secondary,
          width,
          depth,
          roofHeight,
          windowRows,
          windowCols,
          setback,
          style: (["tower", "steps", "slab"] as const)[Math.floor(Math.random() * 3)],
        });
      }
    }
    return buildings;
  }, [mobileMode]);
  const simplifiedRows = useMemo(
    () => new Set<number>(mobileMode ? [0, 4] : [0, 2, 4, 6]),
    [mobileMode]
  );

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
          <meshStandardMaterial color="#6b7280" roughness={0.9} metalness={0.05} />
        </mesh>
      ))}

      {/* Neon curb strips */}
      {[-1, 1].map((side) => (
        <mesh key={`curb-${side}`} position={[side * 2.1, -0.955, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.08, 500]} />
          <meshStandardMaterial
            color={side === -1 ? "#22d3ee" : "#f472b6"}
            emissive={side === -1 ? "#22d3ee" : "#f472b6"}
            emissiveIntensity={0.85}
          />
        </mesh>
      ))}

      {/* Sky glow columns */}
      {[-1, 1].map((side) => (
        <mesh key={`sky-glow-${side}`} position={[side * 4.8, 4.5, 60]} rotation={[0, 0, 0]}>
          <planeGeometry args={[10, 20]} />
          <meshBasicMaterial
            color={side === -1 ? "#22d3ee" : "#f472b6"}
            transparent
            opacity={0.12}
          />
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
            <meshPhongMaterial
              color={building.color}
              emissive={building.color}
              emissiveIntensity={0.45}
              shininess={20}
            />
          </mesh>

          {/* checker-box facade modules */}
          {Array.from({ length: Math.min(building.windowRows, mobileMode ? 5 : 8) }).map((_, row) =>
            Array.from({ length: mobileMode ? 2 : 3 }).map((__, col) => {
              const moduleWidth = building.width * 0.18;
              const moduleHeight = 0.22;
              const moduleDepth = 0.08;
              const offsetX =
                building.x -
                ((mobileMode ? 2 : 3) - 1) * 0.16 +
                col * 0.32;
              const offsetY = 0.45 + row * 0.42;
              const frontZ = building.z + building.depth / 2 + moduleDepth / 2;
              const backZ = building.z - building.depth / 2 - moduleDepth / 2;
              const useAccent = (row + col) % 2 === 0;
              const boxColor = useAccent ? building.accentColor : building.secondaryColor;

              return (
                <group key={`checker-${building.id}-${row}-${col}`}>
                  <mesh position={[offsetX, offsetY, frontZ]} castShadow receiveShadow>
                    <boxGeometry args={[moduleWidth, moduleHeight, moduleDepth]} />
                    <meshStandardMaterial
                      color={boxColor}
                      emissive={boxColor}
                      emissiveIntensity={0.18}
                    />
                  </mesh>
                  {!mobileMode && (
                    <mesh position={[offsetX, offsetY, backZ]} castShadow receiveShadow>
                      <boxGeometry args={[moduleWidth, moduleHeight, moduleDepth]} />
                      <meshStandardMaterial
                        color={useAccent ? building.secondaryColor : building.accentColor}
                        emissive={useAccent ? building.secondaryColor : building.accentColor}
                        emissiveIntensity={0.14}
                      />
                    </mesh>
                  )}
                </group>
              );
            })
          )}

          {/* strong vertical accent panel */}
          <mesh
            position={[
              building.x + (building.x < 0 ? building.width * 0.22 : -building.width * 0.22),
              building.height * 0.48,
              building.z + building.depth / 2 + 0.03,
            ]}
          >
            <planeGeometry args={[building.width * 0.2, Math.max(1.2, building.height * 0.72)]} />
            <meshStandardMaterial
              color={building.secondaryColor}
              emissive={building.secondaryColor}
              emissiveIntensity={0.35}
            />
          </mesh>

          {/* roof cap */}
          <mesh
            position={[building.x, building.height + building.roofHeight / 2, building.z]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[building.width * 1.02, building.roofHeight, building.depth * 1.02]} />
            <meshPhongMaterial color={building.accentColor} emissive={building.accentColor} emissiveIntensity={0.45} shininess={28} />
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
            <meshPhongMaterial color={building.secondaryColor} emissive={building.secondaryColor} emissiveIntensity={0.25} shininess={16} />
          </mesh>

          {/* silhouette variants so buildings don't all read as boxes */}
          {building.style === "tower" && (
            <mesh
              position={[building.x, building.height + 0.65, building.z]}
              castShadow
              receiveShadow
            >
              <cylinderGeometry args={[0.12, 0.18, 1.1, 8]} />
              <meshStandardMaterial
                color={building.secondaryColor}
                emissive={building.secondaryColor}
                emissiveIntensity={0.22}
              />
            </mesh>
          )}

          {building.style === "steps" && (
            <>
              <mesh
                position={[building.x - 0.12, building.height * 0.52, building.z - 0.16]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[building.width * 0.45, building.height * 0.22, building.depth * 0.45]} />
                <meshStandardMaterial color={building.secondaryColor} emissive={building.secondaryColor} emissiveIntensity={0.08} />
              </mesh>
              <mesh
                position={[building.x + 0.08, building.height * 0.67, building.z + 0.08]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[building.width * 0.3, building.height * 0.16, building.depth * 0.3]} />
                <meshStandardMaterial color={building.accentColor} emissive={building.accentColor} emissiveIntensity={0.08} />
              </mesh>
            </>
          )}

          {building.style === "slab" && (
            <mesh
              position={[building.x, building.height * 0.3, building.z - building.depth / 2 - 0.04]}
            >
              <planeGeometry args={[building.width * 0.78, building.height * 0.3]} />
              <meshStandardMaterial
                color={building.secondaryColor}
                emissive={building.secondaryColor}
                emissiveIntensity={0.28}
              />
            </mesh>
          )}

          {/* side neon sign */}
          <mesh
            position={[
              building.x + (building.x < 0 ? building.width / 2 + 0.03 : -building.width / 2 - 0.03),
              building.height * 0.58,
              building.z,
            ]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <planeGeometry args={[0.12, Math.max(0.7, building.height * 0.22)]} />
            <meshStandardMaterial
              color={building.accentColor}
              emissive={building.accentColor}
              emissiveIntensity={0.42}
            />
          </mesh>

          {/* front billboard strip */}
          <mesh
            position={[building.x, Math.max(0.8, building.height * 0.42), building.z + building.depth / 2 + 0.025]}
          >
            <planeGeometry args={[building.width * 0.55, 0.14]} />
            <meshStandardMaterial
              color={building.accentColor}
              emissive={building.accentColor}
              emissiveIntensity={0.3}
            />
          </mesh>

          {/* street level storefront */}
          <mesh
            position={[building.x, 0.38, building.z + building.depth / 2 + 0.028]}
          >
            <planeGeometry args={[building.width * 0.72, 0.24]} />
            <meshStandardMaterial
              color={building.secondaryColor}
              emissive={building.secondaryColor}
              emissiveIntensity={0.3}
            />
          </mesh>

          {/* main entrance door */}
          <mesh
            position={[building.x, 0.24, building.z + building.depth / 2 + 0.04]}
          >
            <boxGeometry args={[building.width * 0.18, 0.34, 0.05]} />
            <meshStandardMaterial
              color="#111827"
              emissive={building.accentColor}
              emissiveIntensity={0.08}
              roughness={0.35}
              metalness={0.45}
            />
          </mesh>

          {/* door frame */}
          <mesh
            position={[building.x, 0.24, building.z + building.depth / 2 + 0.032]}
          >
            <boxGeometry args={[building.width * 0.24, 0.4, 0.02]} />
            <meshStandardMaterial color={building.accentColor} emissive={building.accentColor} emissiveIntensity={0.18} />
          </mesh>

          {/* large lobby windows */}
          {[-1, 1].map((side) => (
            <mesh
              key={`lobby-window-${building.id}-${side}`}
              position={[
                building.x + side * building.width * 0.22,
                0.32,
                building.z + building.depth / 2 + 0.03,
              ]}
            >
              <boxGeometry args={[building.width * 0.18, 0.24, 0.03]} />
              <meshStandardMaterial
                color="#dbeafe"
                emissive="#dbeafe"
                emissiveIntensity={0.35}
                roughness={0.15}
                metalness={0.55}
              />
            </mesh>
          ))}

          {/* side window bands */}
          {Array.from({ length: mobileMode ? 5 : 8 }).map((_, idx) => {
            const y = 0.75 + idx * (building.height / (mobileMode ? 5.5 : 8.5));
            return (
              <group key={`side-band-${building.id}-${idx}`}>
                <mesh
                  position={[building.x + building.width / 2 + 0.02, y, building.z]}
                  rotation={[0, Math.PI / 2, 0]}
                >
                  <planeGeometry args={[building.depth * 0.62, 0.18]} />
                  <meshStandardMaterial
                    color="#bfdbfe"
                    emissive="#bfdbfe"
                    emissiveIntensity={0.45}
                  />
                </mesh>
                {!mobileMode && (
                  <mesh
                    position={[building.x - building.width / 2 - 0.02, y, building.z]}
                    rotation={[0, Math.PI / 2, 0]}
                  >
                    <planeGeometry args={[building.depth * 0.62, 0.18]} />
                    <meshStandardMaterial
                      color="#bfdbfe"
                      emissive="#bfdbfe"
                      emissiveIntensity={0.38}
                    />
                  </mesh>
                )}
              </group>
            );
          })}

          {/* front facade windows */}
          {Array.from({ length: building.windowRows }).map((_, row) =>
            simplifiedRows.has(row % 8) &&
            Array.from({ length: building.windowCols }).map((__, col) => {
              const windowX =
                building.x -
                ((building.windowCols - 1) * 0.18) / 2 +
                col * 0.18;
              const windowY = 0.55 + row * (building.height / (building.windowRows + 2));
              const windowZ = building.z + building.depth / 2 + 0.02;
              const lit = (row + col + Math.floor(building.x * 10)) % 4 !== 0;
              const windowColor =
                (row + col) % 3 === 0 ? "#fef3c7" : (row + col) % 3 === 1 ? "#cffafe" : "#f5d0fe";
              return (
                <mesh
                  key={`w-${building.id}-${row}-${col}`}
                  position={[windowX, windowY, windowZ]}
                >
                  <planeGeometry args={[0.16, 0.28]} />
                  <meshStandardMaterial
                    color={lit ? windowColor : "#243244"}
                    emissive={lit ? windowColor : "#000000"}
                    emissiveIntensity={lit ? 0.85 : 0}
                  />
                </mesh>
              );
            })
          )}

          {/* rear facade windows */}
          {Array.from({ length: Math.min(building.windowRows, mobileMode ? 6 : 10) }).map((_, row) =>
            Array.from({ length: building.windowCols }).map((__, col) => {
              const windowX =
                building.x -
                ((building.windowCols - 1) * 0.18) / 2 +
                col * 0.18;
              const windowY = 0.55 + row * (building.height / (Math.min(building.windowRows, mobileMode ? 6 : 10) + 2));
              const windowZ = building.z - building.depth / 2 - 0.02;
              const lit = (row + col) % 2 === 0;
              return (
                <mesh
                  key={`rear-w-${building.id}-${row}-${col}`}
                  position={[windowX, windowY, windowZ]}
                  rotation={[0, Math.PI, 0]}
                >
                  <planeGeometry args={[0.18, 0.3]} />
                  <meshStandardMaterial
                    color={lit ? "#dbeafe" : "#334155"}
                    emissive={lit ? "#dbeafe" : "#000000"}
                    emissiveIntensity={lit ? 0.65 : 0}
                  />
                </mesh>
              );
            })
          )}

          {/* left and right face window grids */}
          {Array.from({ length: Math.min(building.windowRows, mobileMode ? 6 : 10) }).map((_, row) =>
            Array.from({ length: mobileMode ? 2 : 3 }).map((__, col) => {
              const sideZ =
                building.z -
                (((mobileMode ? 2 : 3) - 1) * 0.22) / 2 +
                col * 0.22;
              const windowY = 0.55 + row * (building.height / (Math.min(building.windowRows, mobileMode ? 6 : 10) + 2));
              const lit = (row + col + 1) % 2 === 0;
              return (
                <group key={`side-grid-${building.id}-${row}-${col}`}>
                  <mesh
                    position={[building.x + building.width / 2 + 0.02, windowY, sideZ]}
                    rotation={[0, Math.PI / 2, 0]}
                  >
                    <planeGeometry args={[0.18, 0.3]} />
                    <meshStandardMaterial
                      color={lit ? "#e0f2fe" : "#334155"}
                      emissive={lit ? "#e0f2fe" : "#000000"}
                      emissiveIntensity={lit ? 0.6 : 0}
                    />
                  </mesh>
                  <mesh
                    position={[building.x - building.width / 2 - 0.02, windowY, sideZ]}
                    rotation={[0, -Math.PI / 2, 0]}
                  >
                    <planeGeometry args={[0.18, 0.3]} />
                    <meshStandardMaterial
                      color={lit ? "#e0f2fe" : "#334155"}
                      emissive={lit ? "#e0f2fe" : "#000000"}
                      emissiveIntensity={lit ? 0.6 : 0}
                    />
                  </mesh>
                </group>
              );
            })
          )}
        </group>
      ))}
    </group>
  );
}

function Scene3D({
  gameState,
  catPosition,
  playerLane,
  jumping,
  sliding,
  cityId = 0,
  characterTint,
}: Game3DSceneProps) {
  const { camera } = useThree();
  const [mobileMode, setMobileMode] = useState(false);

  useEffect(() => {
    const updateMobileMode = () => {
      const coarsePointer =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(pointer: coarse)").matches;
      const smallScreen = typeof window !== "undefined" && window.innerWidth < 768;
      setMobileMode(Boolean(coarsePointer || smallScreen));
    };

    updateMobileMode();
    window.addEventListener("resize", updateMobileMode);
    return () => window.removeEventListener("resize", updateMobileMode);
  }, []);

  // Keep a stable chase camera so the runner moves toward screen top.
  useFrame(() => {
    if (camera) {
      const targetCamX = playerLane - 1;
      camera.position.lerp(
        new THREE.Vector3(targetCamX, mobileMode ? 4.2 : 4.6, catPosition - 8),
        0.1
      );
      camera.lookAt(playerLane - 1, 1, catPosition + (mobileMode ? 10 : 12));
    }
  });

  const catX = playerLane - 1;
  const catY = 0;
  const catZ = catPosition;
  const toWorldZ = (y: number) => catZ + TRACK_CENTER_Z - y * WORLD_SCROLL_SCALE;
  const cityOffsetZ = Math.floor(catZ / 4) * 4;
  const routeTheme = CITY_ROUTE_THEMES[Math.abs(cityId | 0) % CITY_ROUTE_THEMES.length];

  return (
    <>
      <fog attach="fog" args={[routeTheme.fog, 20, 82]} />

      {/* Lighting */}
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.1}
        castShadow={!mobileMode}
        shadow-mapSize-width={mobileMode ? 512 : 1024}
        shadow-mapSize-height={mobileMode ? 512 : 1024}
        shadow-camera-far={100}
        shadow-camera-near={0.1}
      />
      <pointLight position={[0, 5, catZ + 6]} intensity={1} color={routeTheme.accentA} />
      <pointLight position={[0, 4, catZ - 4]} intensity={0.6} color={routeTheme.accentB} />

      {/* Background */}
      <SkylineLayer catPosition={catPosition} mobileMode={mobileMode} paletteShift={cityId | 0} />
      <group position={[0, 0, cityOffsetZ]}>
        <CityBuilder mobileMode={mobileMode} />
      </group>

      {/* Player — procedural car */}
      <Car3D position={[catX, catY, catZ]} jumping={jumping} sliding={sliding} accentTint={characterTint} />

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
  const isMobile =
    typeof window !== "undefined" &&
    ((window.matchMedia && window.matchMedia("(pointer: coarse)").matches) ||
      window.innerWidth < 768);
  try {
    return (
      <Canvas
        shadows={!isMobile}
        camera={{
          position: [0, 3, 15],
          fov: 68,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: "high-performance"
        }}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
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
        <color
          attach="background"
          args={[CITY_ROUTE_THEMES[Math.abs((props.cityId ?? 0) | 0) % CITY_ROUTE_THEMES.length].bg]}
        />
        <Scene3D {...props} />
      </Canvas>
    );
  } catch (error) {
    console.error("Failed to render 3D scene:", error);
    return null;
  }
}

export const Game3DScene = CanvasRenderer;
