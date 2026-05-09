"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { GameState } from "@/types/runner";

interface Game3DSceneProps {
  gameState: GameState;
  catPosition: number;
  playerLane: 0 | 1 | 2;
  jumping: boolean;
  sliding: boolean;
  cityId?: number;
  characterTint?: string;
  currentSpeed?: number;
  maxSpeed?: number;
}

const WORLD_SCROLL_SCALE = 0.045;
const TRACK_CENTER_Z = 14;
const POOL_SIZE = 20;
const TOTAL_ROAD_LENGTH = POOL_SIZE * 30;

// Create window textures once at startup - 3 variations
function createWindowTextures(): THREE.Texture[] {
  const textures: THREE.Texture[] = [];

  for (let v = 0; v < 3; v++) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#0d0d1f";
    ctx.fillRect(0, 0, 256, 256);

    const windowSize = 16;
    const windowSpacing = 20;
    const seed = v * 12345;

    for (let y = 0; y < 256; y += windowSpacing) {
      for (let x = 0; x < 256; x += windowSpacing) {
        const rand = Math.sin(x * 0.1 + y * 0.1 + seed) * 10000;
        if ((rand - Math.floor(rand)) > 0.5) {
          ctx.fillStyle = "rgba(0, 229, 204, 0.6)";
          ctx.fillRect(x + 2, y + 2, windowSize - 4, windowSize - 4);
        } else if ((rand - Math.floor(rand)) > 0.3) {
          ctx.fillStyle = "rgba(180, 100, 255, 0.4)";
          ctx.fillRect(x + 2, y + 2, windowSize - 4, windowSize - 4);
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    textures.push(texture);
  }

  return textures;
}

// Cyberpunk car
function CyberpunkCar({ position }: { position: THREE.Vector3Tuple }) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} position={position}>
      {/* Main body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.5, 0.8, 3]} />
        <meshStandardMaterial
          color="#00E5CC"
          metalness={0.9}
          roughness={0.1}
          emissive="#00E5CC"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Windscreen */}
      <mesh position={[0, 0.6, 0.5]}>
        <boxGeometry args={[1.4, 0.5, 0.3]} />
        <meshStandardMaterial color="#0a0a1a" transparent opacity={0.7} />
      </mesh>

      {/* Left wheel */}
      <mesh position={[-0.8, 0.3, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 8]} />
        <meshStandardMaterial color="#111" roughness={1} metalness={0} />
      </mesh>

      {/* Right wheel */}
      <mesh position={[0.8, 0.3, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 8]} />
        <meshStandardMaterial color="#111" roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

// Street lamp - visual only, no light
function StreetLamp({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 10, 6]} />
        <meshStandardMaterial color="#333" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Light head - emissive glow only */}
      <mesh position={[0, 10, 0]}>
        <sphereGeometry args={[0.4, 6, 6]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

// Main scene
function GameScene({
  gameState,
  catPosition,
  playerLane,
  jumping,
  sliding,
  currentSpeed = 0,
  maxSpeed = 100,
}: Game3DSceneProps) {
  const { camera, scene, renderer } = useThree();
  const clockRef = useRef(new THREE.Clock());
  const buildingPoolRef = useRef<THREE.Mesh[]>([]);
  const windowTexturesRef = useRef<THREE.Texture[]>([]);
  const lastTabVisibleRef = useRef(true);

  // Initialize textures and settings
  useEffect(() => {
    // Set renderer for performance
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = false;
    renderer.powerPreference = "high-performance";
    renderer.antialias = false;

    // Create window textures once
    windowTexturesRef.current = createWindowTextures();

    // Create building pool
    const buildingGeo = new THREE.BoxGeometry(1, 1, 1);
    const buildingMat = new THREE.MeshStandardMaterial({
      color: "#0d0d1f",
      roughness: 0.7,
      metalness: 0.3,
      map: windowTexturesRef.current[0],
    });

    const pool: THREE.Mesh[] = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      const building = new THREE.Mesh(buildingGeo, buildingMat.clone());
      building.scale.set(
        8 + Math.random() * 8,
        20 + Math.random() * 60,
        8 + Math.random() * 8
      );
      building.position.set(
        Math.random() > 0.5 ? -10 - Math.random() * 5 : 10 + Math.random() * 5,
        building.scale.y / 2,
        i * 30
      );
      scene.add(building);
      pool.push(building);
    }
    buildingPoolRef.current = pool;

    // Visibility change listener
    const handleVisibilityChange = () => {
      lastTabVisibleRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [scene, renderer]);

  // Update scene on frame
  useFrame(() => {
    if (document.hidden) return;

    const clock = clockRef.current;
    const delta = Math.min(clock.getDelta(), 0.05); // Cap delta to 50ms

    // Update camera
    const speedRatio = Math.min(currentSpeed / maxSpeed, 1);
    camera.position.x = playerLane === 0 ? -1.5 : playerLane === 2 ? 1.5 : 0;
    camera.position.y = jumping ? 3.5 : 2.5;
    camera.position.z = catPosition * WORLD_SCROLL_SCALE;
    camera.fov = 60 + speedRatio * 15;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 2, catPosition * WORLD_SCROLL_SCALE + 20);

    // Recycle buildings
    buildingPoolRef.current.forEach((building) => {
      if (building.position.z > camera.position.z + 80) {
        building.position.z -= TOTAL_ROAD_LENGTH;
        // Reassign random window texture
        const mat = building.material as THREE.MeshStandardMaterial;
        mat.map = windowTexturesRef.current[Math.floor(Math.random() * 3)];
        mat.needsUpdate = true;
      }
    });
  });

  return (
    <>
      {/* Minimal lighting */}
      <ambientLight color="#0a0020" intensity={0.4} />
      <directionalLight position={[10, 20, 10]} color="#4400ff" intensity={0.6} />

      {/* Single PointLight - underglow */}
      <pointLight
        position={[0, 0.5, catPosition * WORLD_SCROLL_SCALE]}
        color="#7B2FFF"
        intensity={1}
        distance={15}
      />

      {/* Cheap linear fog */}
      <fog attach="fog" args={["#05000f", 80, 200]} />

      {/* Background */}
      <color attach="background" args={["#0a0510"]} />

      {/* Road surfaces */}
      <mesh position={[0, -1, catPosition * WORLD_SCROLL_SCALE]}>
        <planeGeometry args={[4, 500]} />
        <meshStandardMaterial color="#0a0a0f" roughness={0.8} metalness={0.1} />
      </mesh>

      <mesh position={[-7, -1, catPosition * WORLD_SCROLL_SCALE]}>
        <planeGeometry args={[6, 500]} />
        <meshStandardMaterial color="#080810" roughness={0.9} metalness={0} />
      </mesh>

      <mesh position={[7, -1, catPosition * WORLD_SCROLL_SCALE]}>
        <planeGeometry args={[6, 500]} />
        <meshStandardMaterial color="#080810" roughness={0.9} metalness={0} />
      </mesh>

      {/* Lane dividers */}
      <lineSegments position={[0, -0.5, catPosition * WORLD_SCROLL_SCALE]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={100}
            array={new Float32Array(
              Array.from({ length: 100 }, (_, i) => [-1.5, 0, (i - 50) * 2]).flat()
            )}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00E5CC" opacity={0.6} transparent />
      </lineSegments>

      <lineSegments position={[0, -0.5, catPosition * WORLD_SCROLL_SCALE]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={100}
            array={new Float32Array(
              Array.from({ length: 100 }, (_, i) => [1.5, 0, (i - 50) * 2]).flat()
            )}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00E5CC" opacity={0.6} transparent />
      </lineSegments>

      {/* Street lamps - visual only */}
      {[...Array(10)].map((_, i) => (
        <StreetLamp
          key={`lamp-left-${i}`}
          position={[-8, 0, (i - 5) * 30]}
          color={i % 2 === 0 ? "#00E5CC" : "#ff6ec7"}
        />
      ))}
      {[...Array(10)].map((_, i) => (
        <StreetLamp
          key={`lamp-right-${i}`}
          position={[8, 0, (i - 5) * 30]}
          color={i % 2 === 0 ? "#ff6ec7" : "#00E5CC"}
        />
      ))}

      {/* Player car */}
      <CyberpunkCar position={[playerLane === 0 ? -1.5 : playerLane === 2 ? 1.5 : 0, 1, 0]} />
    </>
  );
}

export function Game3DScene(props: Game3DSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{
          position: [0, 2.5, 0],
          fov: 60,
          near: 0.1,
          far: 500,
        }}
        style={{ width: "100%", height: "100%" }}
        dpr={[1, 1.5]}
      >
        <GameScene {...props} />
      </Canvas>
    </div>
  );
}
