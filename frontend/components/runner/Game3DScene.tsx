"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
// @ts-ignore
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

interface Game3DSceneProps {
  catPosition: number;
  playerLane: 0 | 1 | 2;
  jumping: boolean;
  cityId?: number;
  characterTint?: string;
  currentSpeed?: number;
  maxSpeed?: number;
}

// Step 1: Renderer setup inside GameScene component
function GameScene({
  catPosition,
  playerLane,
  jumping,
  currentSpeed = 0,
  maxSpeed = 100,
}: Game3DSceneProps) {
  const { camera, scene, gl } = useThree();
  const sceneRef = useRef(false);
  const carModelRef = useRef<THREE.Group | null>(null);
  const leftStreakRef = useRef<THREE.Mesh | null>(null);
  const rightStreakRef = useRef<THREE.Mesh | null>(null);

  // Initialize scene once
  useEffect(() => {
    if (sceneRef.current) return;
    sceneRef.current = true;

    // STEP 1 — Renderer settings
    gl.setSize(window.innerWidth, window.innerHeight);
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    gl.shadowMap.enabled = false;
    gl.setClearColor("#05000f");

    // Deep purple sky
    scene.background = new THREE.Color("#0a0010");

    // STEP 2 — Camera setup (critical for visibility)
    camera.position.set(0, 6, 12);
    camera.lookAt(0, 1, -20);
    (camera as THREE.PerspectiveCamera).fov = 70;
    camera.near = 0.1;
    camera.far = 300;
    camera.updateProjectionMatrix();

    // STEP 3 — Lighting (white first for visibility)
    const ambient = new THREE.AmbientLight("#ffffff", 1.2);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight("#ffffff", 1.5);
    dirLight.position.set(0, 50, 10);
    scene.add(dirLight);

    // STEP 4 — Road (simplest possible)
    const roadGeo = new THREE.PlaneGeometry(12, 500);
    const roadMat = new THREE.MeshStandardMaterial({
      color: "#1a1a3e",
      roughness: 0.8,
      metalness: 0.1,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2; // CRITICAL: rotate plane to be horizontal
    road.position.set(0, 0, -200);
    scene.add(road);

    // Lane markings
    const lineMat = new THREE.MeshBasicMaterial({
      color: "#ffffff",
      opacity: 0.4,
      transparent: true,
    });
    // Left lane line
    const leftLine = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 500),
      lineMat
    );
    leftLine.rotation.x = -Math.PI / 2;
    leftLine.position.set(-2, 0.01, -200);
    scene.add(leftLine);

    // Right lane line
    const rightLine = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 500),
      lineMat.clone()
    );
    rightLine.rotation.x = -Math.PI / 2;
    rightLine.position.set(2, 0.01, -200);
    scene.add(rightLine);

    // Centre dashes
    const centreLine = new THREE.Mesh(
      new THREE.PlaneGeometry(0.1, 500),
      new THREE.MeshBasicMaterial({
        color: "#00E5CC",
        opacity: 0.5,
        transparent: true,
      })
    );
    centreLine.rotation.x = -Math.PI / 2;
    centreLine.position.set(0, 0.01, -200);
    scene.add(centreLine);

    // Edge kerbs
    const kerbMat = new THREE.MeshStandardMaterial({ color: "#ff2244" });
    const leftKerb = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.2, 500),
      kerbMat
    );
    leftKerb.position.set(-6.5, 0.1, -200);
    scene.add(leftKerb);

    const rightKerb = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.2, 500),
      kerbMat.clone()
    );
    rightKerb.position.set(6.5, 0.1, -200);
    scene.add(rightKerb);

    // STEP 5 — Car (load GLB model)
    const loader = new GLTFLoader();
    loader.load(
      "/kenney_car-kit/Models/GLB format/race.glb",
      (gltf: any) => {
        const carModel = gltf.scene as THREE.Group;
        carModel.scale.set(3, 3, 3);
        carModel.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = false;
            child.receiveShadow = false;
          }
        });
        const box = new THREE.Box3().setFromObject(carModel);
        carModel.position.y = -box.min.y;
        carModel.position.z = 0;
        scene.add(carModel);
        carModelRef.current = carModel;
      }
    );

    // STEP 6 — Cyberpunk buildings with InstancedMesh
    // Create window texture
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#0d0d2b";
    ctx.fillRect(0, 0, 64, 128);
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle =
        Math.random() > 0.5 ? "rgba(0,229,204,0.8)" : "rgba(120,40,255,0.6)";
      ctx.fillRect(Math.random() * 50 + 4, Math.random() * 110 + 4, 6, 4);
    }
    const windowTex = new THREE.CanvasTexture(canvas);
    windowTex.generateMipmaps = false;
    windowTex.minFilter = THREE.LinearFilter;

    const buildingGeo = new THREE.BoxGeometry(1, 1, 1);
    const buildingMat = new THREE.MeshStandardMaterial({
      color: "#0d0d2b",
      emissive: "#1a1a3e",
      emissiveIntensity: 0.6,
      roughness: 0.7,
      metalness: 0.3,
      map: windowTex,
    });
    const buildings = new THREE.InstancedMesh(buildingGeo, buildingMat, 16);
    scene.add(buildings);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < 8; i++) {
      const h = 15 + Math.random() * 35;
      const w = 6 + Math.random() * 6;
      // Left side
      dummy.position.set(-14, h / 2, -i * 35);
      dummy.scale.set(w, h, 8);
      dummy.updateMatrix();
      buildings.setMatrixAt(i, dummy.matrix);
      // Right side
      dummy.position.set(14, h / 2, -i * 35);
      dummy.updateMatrix();
      buildings.setMatrixAt(i + 8, dummy.matrix);
    }
    buildings.instanceMatrix.needsUpdate = true;

    // Neon street lights
    const poleMat = new THREE.MeshBasicMaterial({ color: "#333344" });
    const glowMat = new THREE.MeshBasicMaterial({ color: "#00E5CC" });
    for (let i = 0; i < 8; i++) {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 8),
        poleMat
      );
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.15), glowMat);
      const side = i % 2 === 0 ? -8 : 8;
      pole.position.set(side, 4, -i * 25);
      glow.position.set(side, 8, -i * 25);
      scene.add(pole, glow);
    }

    // Purple road glow strip
    const glowStrip = new THREE.Mesh(
      new THREE.PlaneGeometry(0.4, 500),
      new THREE.MeshBasicMaterial({
        color: "#7B2FFF",
        transparent: true,
        opacity: 0.6,
      })
    );
    glowStrip.rotation.x = -Math.PI / 2;
    glowStrip.position.set(0, 0.02, -200);
    scene.add(glowStrip);

    // Speed streak lines
    const streakMat = new THREE.MeshBasicMaterial({
      color: "#00E5CC",
      transparent: true,
      opacity: 0,
    });
    const leftStreak = new THREE.Mesh(
      new THREE.PlaneGeometry(0.05, 12),
      streakMat
    );
    const rightStreak = new THREE.Mesh(
      new THREE.PlaneGeometry(0.05, 12),
      streakMat.clone()
    );
    leftStreak.position.set(-4, 1, -3);
    rightStreak.position.set(4, 1, -3);
    leftStreak.rotation.x = -0.3;
    rightStreak.rotation.x = -0.3;
    scene.add(leftStreak, rightStreak);
    leftStreakRef.current = leftStreak;
    rightStreakRef.current = rightStreak;

    return () => {
      // Cleanup on unmount
      roadGeo.dispose();
      roadMat.dispose();
      if (carModelRef.current) {
        carModelRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
        scene.remove(carModelRef.current);
      }
    };
  }, [scene, gl, camera]);

  // STEP 7 — Animation loop
  useFrame(() => {
    if (document.hidden) return;

    // Update camera with car movement
    const speedRatio = Math.min(currentSpeed / maxSpeed, 1);

    // Follow car
    camera.position.x = playerLane === 0 ? -3 : playerLane === 2 ? 3 : 0;
    camera.position.y = jumping ? 6 : 4;
    camera.position.z = catPosition * 0.05 + 10;

    // Look ahead
    camera.lookAt(0, 2, catPosition * 0.05 - 20);

    // Adjust FOV based on speed
    (camera as THREE.PerspectiveCamera).fov = 70 + speedRatio * 20;
    camera.updateProjectionMatrix();

    // Update loaded car model
    if (carModelRef.current) {
      carModelRef.current.position.x = playerLane === 0 ? -4 : playerLane === 2 ? 4 : 0;
      carModelRef.current.position.z = catPosition * 0.05;
      carModelRef.current.rotation.z = (playerLane - 1) * 0.1; // Subtle lean rotation
    }

    // Update speed streaks
    if (leftStreakRef.current && rightStreakRef.current) {
      const streakOpacity = speedRatio > 0.6 ? (speedRatio - 0.6) * 2 : 0;
      (leftStreakRef.current.material as THREE.MeshBasicMaterial).opacity =
        streakOpacity;
      (rightStreakRef.current.material as THREE.MeshBasicMaterial).opacity =
        streakOpacity;
    }
  });

  return null; // All geometry added directly to scene via useEffect
}

export function Game3DScene(props: Game3DSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{
          position: [0, 6, 12],
          fov: 70,
          near: 0.1,
          far: 300,
        }}
        style={{ width: "100%", height: "100%" }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
        }}
      >
        <GameScene {...props} />
      </Canvas>
    </div>
  );
}
