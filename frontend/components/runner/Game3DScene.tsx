"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Car3D } from "./Car3D";
import { TrafficCar3D } from "./TrafficCar3D";
import { Coin3D } from "./Coin3D";
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
    }> = [];
    const start = mobileMode ? -4 : -8;
    const end = mobileMode ? 16 : 24;
    for (let i = start; i < end; i++) {
      for (let side = -1; side <= 1; side += 2) {
        const height = 3.2 + Math.random() * 4.8;
        const width = 0.85 + Math.random() * 0.45;
        const depth = 0.9 + Math.random() * 0.5;
        const roofHeight = 0.15 + Math.random() * 0.28;
        const x = side * (2.4 + Math.random() * 0.7);
        const z = i * 4;
        const palette = BUILDING_PALETTES[Math.floor(Math.random() * BUILDING_PALETTES.length)];
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
        });
      }
    }
    return buildings;
  }, [mobileMode]);

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
          {Array.from({ length: 25 }).map((_, i) => (
            <mesh key={`marker-${i}`} position={[lane, 0.01, i * 16]}>
              <boxGeometry args={[0.1, 0.01, 1.2]} />
              <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.4} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Buildings (drastically simplified for performance) */}
      {buildings.map((building) => (
        <group key={building.id}>
          {/* Main body */}
          <mesh position={[building.x, building.height / 2, building.z]} castShadow>
            <boxGeometry args={[building.width, building.height, building.depth]} />
            <meshStandardMaterial
              color={building.color}
              emissive={building.color}
              emissiveIntensity={0.35}
              metalness={0.3}
              roughness={0.6}
            />
          </mesh>

          {/* Roof cap */}
          <mesh position={[building.x, building.height + building.roofHeight / 2, building.z]} castShadow>
            <boxGeometry args={[building.width * 1.02, building.roofHeight, building.depth * 1.02]} />
            <meshStandardMaterial
              color={building.accentColor}
              emissive={building.accentColor}
              emissiveIntensity={0.4}
            />
          </mesh>

          {/* Front facade window band (simple emissive plane) */}
          <mesh position={[building.x, building.height * 0.55, building.z + building.depth / 2 + 0.02]}>
            <planeGeometry args={[building.width * 0.85, building.height * 0.6]} />
            <meshBasicMaterial
              color={building.secondaryColor}
              emissive={building.secondaryColor}
              emissiveIntensity={0.5}
            />
          </mesh>

          {/* Side accent strip */}
          <mesh position={[building.x + (building.x < 0 ? building.width * 0.35 : -building.width * 0.35), building.height * 0.5, building.z]}>
            <planeGeometry args={[0.08, building.height * 0.7]} />
            <meshBasicMaterial
              color={building.accentColor}
              emissive={building.accentColor}
              emissiveIntensity={0.6}
            />
          </mesh>
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
  const camTargetRef = useRef(new THREE.Vector3());
  const lookAtTargetRef = useRef(new THREE.Vector3());

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
      const camY = mobileMode ? 4.2 : 4.6;
      const lookAtZ = catPosition + (mobileMode ? 10 : 12);

      camTargetRef.current.set(targetCamX, camY, catPosition - 8);
      camera.position.lerp(camTargetRef.current, 0.1);

      lookAtTargetRef.current.set(playerLane - 1, 1, lookAtZ);
      camera.lookAt(lookAtTargetRef.current);
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
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={0.9}
        castShadow={!mobileMode}
        shadow-mapSize-width={mobileMode ? 256 : 512}
        shadow-mapSize-height={mobileMode ? 256 : 512}
        shadow-camera-far={60}
        shadow-camera-near={0.1}
      />
      {/* Car tracking point light for clear car visibility */}
      <pointLight position={[0, 3.5, catZ]} intensity={0.8} color="#ffffff" distance={40} decay={2} />

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

      {/* Other traffic (same hitboxes as former obstacles). */}
      {gameState.obstacles
        .filter((obs) => {
          const obsZ = toWorldZ(obs.y);
          return obsZ > catZ - 12 && obsZ < catZ + 30;
        })
        .map((obs) => {
          const obsLaneX = obs.lane - 1;
          return (
            <TrafficCar3D
              key={obs.id}
              position={[obsLaneX, obs.type === "wall" ? 0.72 : 0.12, toWorldZ(obs.y)]}
              type={obs.type}
              styleSeed={obs.id}
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
