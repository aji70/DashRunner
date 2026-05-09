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

  // Initialize scene once
  useEffect(() => {
    if (sceneRef.current) return;
    sceneRef.current = true;

    // STEP 1 — Renderer settings
    gl.setSize(window.innerWidth, window.innerHeight);
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    gl.shadowMap.enabled = false;
    gl.setClearColor("#05000f");

    // STEP 2 — Camera setup (critical for visibility)
    camera.position.set(0, 4, 10);
    camera.lookAt(0, 0, -20);
    (camera as THREE.PerspectiveCamera).fov = 70;
    camera.near = 0.1;
    camera.far = 300;
    camera.updateProjectionMatrix();

    // STEP 3 — Lighting (white first for visibility)
    const ambient = new THREE.AmbientLight("#ffffff", 0.8);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight("#ffffff", 1);
    dirLight.position.set(5, 20, 5);
    scene.add(dirLight);

    // STEP 4 — Road (simplest possible)
    const roadGeo = new THREE.PlaneGeometry(12, 500);
    const roadMat = new THREE.MeshStandardMaterial({ color: "#1a1a2e" });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2; // CRITICAL: rotate plane to be horizontal
    road.position.set(0, 0, -200);
    scene.add(road);

    // STEP 5 — Car (load GLB model)
    const loader = new GLTFLoader();
    loader.load(
      "/kenney_car-kit/Models/GLB format/race.glb",
      (gltf: any) => {
        const carModel = gltf.scene as THREE.Group;
        carModel.position.set(0, 0.5, 0);
        carModel.scale.set(1, 1, 1);
        carModel.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = false;
            child.receiveShadow = false;
          }
        });
        scene.add(carModel);
        carModelRef.current = carModel;
      }
    );

    // STEP 6 — Test buildings (5 each side)
    for (let i = 0; i < 5; i++) {
      const h = 20 + Math.random() * 40;
      const geo = new THREE.BoxGeometry(8, h, 8);
      const mat = new THREE.MeshStandardMaterial({ color: "#0d0d2b" });

      const left = new THREE.Mesh(geo, mat);
      const right = new THREE.Mesh(geo.clone(), mat.clone());

      left.position.set(-12, h / 2, -30 * i);
      right.position.set(12, h / 2, -30 * i);

      scene.add(left, right);
    }

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
  });

  return null; // All geometry added directly to scene via useEffect
}

export function Game3DScene(props: Game3DSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{
          position: [0, 4, 10],
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
