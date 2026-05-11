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
  gamePhase?: "idle" | "playing" | "paused" | "dead";
  obstacles?: Array<{ id: number; lane: 0 | 1 | 2; y: number; type: string; width: number; height: number }>;
  isBoostActive?: boolean;
  onEnforcerDistanceChange?: (distance: number) => void;
  onEnforcerCaught?: () => void;
  onEnforcerBlocked?: (blocked: boolean) => void;
}

// Step 1: Renderer setup inside GameScene component
function createNullblockLabel() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'transparent'
  ctx.clearRect(0, 0, 256, 64)
  ctx.fillStyle = '#ff2244'
  ctx.font = 'bold 28px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('◆ NULLBLOCK', 128, 40)
  const tex = new THREE.CanvasTexture(canvas)
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(3, 0.8, 1)
  sprite.position.y = 3.5
  return sprite
}

function GameScene({
  catPosition,
  playerLane,
  jumping,
  currentSpeed = 0,
  maxSpeed = 100,
  gamePhase = "playing",
  obstacles = [],
  isBoostActive = false,
  onEnforcerDistanceChange,
  onEnforcerCaught,
  onEnforcerBlocked,
}: Game3DSceneProps) {
  const { camera, scene, gl } = useThree();
  const sceneRef = useRef(false);
  const carModelRef = useRef<THREE.Group | null>(null);
  const leftStreakRef = useRef<THREE.Mesh | null>(null);
  const rightStreakRef = useRef<THREE.Mesh | null>(null);
  const reflectionRef = useRef<THREE.Mesh | null>(null);
  const enforcerRef = useRef<THREE.Group | null>(null);
  const enforcerSpeedRef = useRef(0);
  const enforcerActiveRef = useRef(false);
  const enforcerSpawnTimeRef = useRef(0);
  const underglowLeftRef = useRef<THREE.Light | null>(null);
  const underglowRightRef = useRef<THREE.Light | null>(null);
  const trafficCarsRef = useRef<
    Array<{ mesh: THREE.Group }>
  >([]);
  const pedestriansRef = useRef<THREE.Group[]>([]);
  const lampPoolRef = useRef<
    Array<{ group: THREE.Group; initialZ: number }>
  >([]);
  const buildingPoolRef = useRef<
    Array<{ mesh: THREE.Mesh; side: number; initialZ: number }>
  >([]);
  const gameOverInitiatedRef = useRef(false);
  const cameraStartPosRef = useRef({ y: 4, z: 16 });

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
    scene.background = new THREE.Color("#08001a");

    // Star field
    const starGeo = new THREE.BufferGeometry();
    const starPositions = [];
    for (let i = 0; i < 200; i++) {
      starPositions.push(
        (Math.random() - 0.5) * 300,
        Math.random() * 80 + 20,
        (Math.random() - 0.5) * 300
      );
    }
    starGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starPositions, 3)
    );
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: "#ffffff", size: 0.3 })
    );
    scene.add(stars);

    // STEP 2 — Camera setup (critical for visibility)
    camera.position.set(0, 8, 16);
    camera.lookAt(0, 2, -30);
    (camera as THREE.PerspectiveCamera).fov = 75;
    camera.near = 0.1;
    camera.far = 300;
    camera.updateProjectionMatrix();

    // STEP 3 — Lighting (white first for visibility)
    const ambient = new THREE.AmbientLight("#ffffff", 1.2);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight("#ffffff", 1.5);
    dirLight.position.set(0, 50, 10);
    scene.add(dirLight);

    // Add fog for depth
    scene.fog = new THREE.Fog("#08001a", 80, 220);

    // STEP 4 — Road (simplest possible)
    const roadGeo = new THREE.PlaneGeometry(12, 1000);
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
      new THREE.PlaneGeometry(0.2, 1000),
      lineMat
    );
    leftLine.rotation.x = -Math.PI / 2;
    leftLine.position.set(-2, 0.01, -200);
    scene.add(leftLine);

    // Right lane line
    const rightLine = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 1000),
      lineMat.clone()
    );
    rightLine.rotation.x = -Math.PI / 2;
    rightLine.position.set(2, 0.01, -200);
    scene.add(rightLine);

    // Centre dashes
    const centreLine = new THREE.Mesh(
      new THREE.PlaneGeometry(0.1, 1000),
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
      new THREE.BoxGeometry(0.5, 0.2, 1000),
      kerbMat
    );
    leftKerb.position.set(-5.8, 0.08, -200);
    scene.add(leftKerb);

    const rightKerb = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.2, 1000),
      kerbMat.clone()
    );
    rightKerb.position.set(5.8, 0.08, -200);
    scene.add(rightKerb);

    // Pavement strips on left and right shoulders
    const pavementMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#1a0a2e"),
      emissive: new THREE.Color("#0d0520"),
      emissiveIntensity: 0.3,
      roughness: 0.9,
      metalness: 0,
    });

    // Left pavement (outside left kerb)
    const leftPavement = new THREE.Mesh(
      new THREE.PlaneGeometry(26.2, 1000),
      pavementMat
    );
    leftPavement.rotation.x = -Math.PI / 2;
    leftPavement.position.set(-18.9, 0, -200);
    scene.add(leftPavement);

    // Right pavement (outside right kerb)
    const rightPavement = new THREE.Mesh(
      new THREE.PlaneGeometry(26.2, 1000),
      pavementMat.clone()
    );
    rightPavement.rotation.x = -Math.PI / 2;
    rightPavement.position.set(18.9, 0, -200);
    scene.add(rightPavement);

    // STEP 5 — Car (load GLB model)
    const loader = new GLTFLoader();
    loader.load(
      "/kenney_car-kit/Models/GLB format/race.glb",
      (gltf: any) => {
        const carModel = gltf.scene as THREE.Group;
        carModel.scale.set(1.8, 1.8, 1.8);
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

        // Add underglow lights
        const leftUnderglow = new THREE.PointLight("#00E5CC", 0.5, 20);
        leftUnderglow.position.set(-1.5, -0.3, 0);
        carModel.add(leftUnderglow);
        underglowLeftRef.current = leftUnderglow;

        const rightUnderglow = new THREE.PointLight("#00E5CC", 0.5, 20);
        rightUnderglow.position.set(1.5, -0.3, 0);
        carModel.add(rightUnderglow);
        underglowRightRef.current = rightUnderglow;
      }
    );

    // STEP 6 — Traffic cars with different models
    const trafficModels = [
      "/kenney_car-kit/Models/GLB format/sedan.glb",
      "/kenney_car-kit/Models/GLB format/suv.glb",
      "/kenney_car-kit/Models/GLB format/taxi.glb",
      "/kenney_car-kit/Models/GLB format/police.glb",
      "/kenney_car-kit/Models/GLB format/ambulance.glb",
      "/kenney_car-kit/Models/GLB format/firetruck.glb",
    ];
    const trafficColors = ["#ff2244", "#4488ff", "#ffaa00", "#ffffff", "#44ff88", "#ff44ff"];
    const trafficLoader = new GLTFLoader();

    for (let i = 0; i < 6; i++) {
      const modelPath = trafficModels[i % trafficModels.length];
      trafficLoader.load(modelPath, (gltf: any) => {
        const tc = gltf.scene as THREE.Group;
        tc.scale.set(1.8, 1.8, 1.8);
        tc.rotation.y = Math.PI;

        const lanes = [-2.5, 0, 2.5];
        tc.position.x = lanes[Math.floor(Math.random() * lanes.length)];
        tc.position.z = -(50 + i * 35);

        const box = new THREE.Box3().setFromObject(tc);
        tc.position.y = -box.min.y;

        // Normalize traffic car size to match player car (2.5 units wide)
        const trafficBox = new THREE.Box3().setFromObject(tc);
        const trafficSize = trafficBox.getSize(new THREE.Vector3());
        const scaleFactor = 2.5 / trafficSize.x;
        tc.scale.multiplyScalar(scaleFactor);
        // Re-sit on road after rescaling
        const resitBox = new THREE.Box3().setFromObject(tc);
        tc.position.y = -resitBox.min.y;

        tc.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = false;
            child.receiveShadow = false;
            child.material = child.material.clone();
            const mat = child.material as any;
            if (mat.color) mat.color.set(trafficColors[i]);
          }
        });

        scene.add(tc);
        trafficCarsRef.current.push({ mesh: tc });
      });
    }

    // STEP 6b — NULLBLOCK ENFORCER car (spawns after 3 seconds)
    setTimeout(() => {
      const enforcerLoader = new GLTFLoader();
      // Use the SUV model which is aggressive-looking
      enforcerLoader.load("/kenney_car-kit/Models/GLB format/suv.glb", (gltf: any) => {
        const enforcer = gltf.scene as THREE.Group;
        enforcer.scale.set(1.8, 1.8, 1.8);
        enforcer.rotation.y = Math.PI;

        // Tint it black and red — NULLBLOCK colours
        enforcer.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            child.material = child.material.clone();
            (child.material as any).color.set("#1a0005");
            (child.material as any).emissive = new THREE.Color("#ff0022");
            (child.material as any).emissiveIntensity = 0.3;
            child.castShadow = false;
            child.receiveShadow = false;
          }
        });

        // Sit on road
        const resit = new THREE.Box3().setFromObject(enforcer);
        enforcer.position.y = -resit.min.y;

        // Start behind player
        enforcer.position.x = 0;
        enforcer.position.z = 30; // behind camera = positive z
        scene.add(enforcer);
        enforcerRef.current = enforcer;
        enforcerActiveRef.current = true;
        enforcerSpeedRef.current = 0;
        enforcerSpawnTimeRef.current = performance.now();

        // Add red headlights
        const leftLight = new THREE.PointLight("#ff0022", 2, 15);
        leftLight.position.set(-0.5, 0.8, -1.5);
        enforcer.add(leftLight);
        const rightLight = new THREE.PointLight("#ff0022", 2, 15);
        rightLight.position.set(0.5, 0.8, -1.5);
        enforcer.add(rightLight);

        // Add NULLBLOCK label
        const label = createNullblockLabel();
        enforcer.add(label);
      });
    }, 3000);

    // STEP 7 — Pedestrians and benches
    function createPedestrian() {
      const group = new THREE.Group();
      const colors = ["#ff6ec7", "#00E5CC", "#ffaa00", "#ffffff", "#aa88ff"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const mat = new THREE.MeshStandardMaterial({ color });

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.3), mat);
      head.position.y = 1.5;
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.3), mat);
      body.position.y = 0.9;
      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.7, 0.18), mat);
      legL.position.set(-0.12, 0.35, 0);
      const legR = legL.clone();
      legR.position.x = 0.12;

      group.add(head, body, legL, legR);
      return group;
    }

    function createBench() {
      const group = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: "#334455" });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.5), mat);
      seat.position.y = 0.5;
      const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), mat);
      leg1.position.set(-0.6, 0.25, 0);
      const leg2 = leg1.clone();
      leg2.position.x = 0.6;
      group.add(seat, leg1, leg2);
      return group;
    }

    for (let i = 0; i < 16; i++) {
      const p = createPedestrian();
      const side = i % 2 === 0 ? -11 : 11;
      p.position.set(side + (Math.random() * 3 - 1.5), 0, -(80 + i * 18));
      scene.add(p);
      pedestriansRef.current.push(p);
    }

    for (let i = 0; i < 8; i++) {
      const bench = createBench();
      const side = i % 2 === 0 ? -9 : 9;
      bench.position.set(side, 0, -(100 + i * 30));
      scene.add(bench);
      pedestriansRef.current.push(bench);
    }

    // STEP 8 — Cyberpunk buildings with InstancedMesh
    // Create 3 reusable window textures upfront
    function makeWindowTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 128;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#08001a";
      ctx.fillRect(0, 0, 64, 128);
      for (let row = 0; row < 14; row++) {
        for (let col = 0; col < 6; col++) {
          if (Math.random() > 0.45) { // 55% windows lit
            ctx.fillStyle = Math.random() > 0.5
              ? 'rgba(0,229,204,0.95)'
              : 'rgba(180,80,255,0.95)';
            ctx.fillRect(col * 9 + 3, row * 8 + 3, 5, 4);
          }
        }
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
      return tex;
    }

    // Create NULLBLOCK billboards
    function makeNullblockBillboard(text: string) {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 128
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#0d0010'
      ctx.fillRect(0, 0, 256, 128)
      // Red border
      ctx.strokeStyle = '#ff2244'
      ctx.lineWidth = 4
      ctx.strokeRect(4, 4, 248, 120)
      // Text
      ctx.fillStyle = '#ff2244'
      ctx.font = 'bold 22px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('NULLBLOCK', 128, 45)
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.font = '14px monospace'
      ctx.fillText(text, 128, 75)
      ctx.fillStyle = '#00E5CC'
      ctx.font = '11px monospace'
      ctx.fillText('WE OWN THIS CITY', 128, 105)
      return new THREE.CanvasTexture(canvas)
    }

    const billboardTexts = [
      'YOUR SCORE MEANS NOTHING',
      'THE CHAIN OBEYS US',
      'RESISTANCE IS INVALID',
    ]

    const texPool = [
      makeWindowTexture(),
      makeWindowTexture(),
      makeWindowTexture(),
    ];

    // Create 30 individual building meshes — main foreground row
    const buildingPool: Array<{
      mesh: THREE.Mesh;
      side: number;
      initialZ: number;
    }> = [];
    for (let i = 0; i < 30; i++) {
      const h = 15 + Math.random() * 25;
      const w = 8 + Math.random() * 10;
      const geo = new THREE.BoxGeometry(w, h, 14);
      const mat = new THREE.MeshStandardMaterial({
        map: texPool[i % 3],
        color: "#ffffff",
        emissive: "#0d0d2b",
        emissiveIntensity: 0.5,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const side = i % 2 === 0 ? -35 : 35;
      const baseZ = -(Math.floor(i / 2) * 25);
      const parallaxOffset = Math.random() * 10 - 5;
      mesh.position.set(side, h / 2, baseZ + parallaxOffset);
      scene.add(mesh);
      buildingPool.push({ mesh, side, initialZ: mesh.position.z });
    }
    buildingPoolRef.current = buildingPool;

    // Apply NULLBLOCK billboards to 3 random buildings
    const billboardBuildingIndices = [4, 12, 22]; // Pick 3 specific buildings for visibility
    billboardBuildingIndices.forEach((idx, billboardIdx) => {
      if (idx < buildingPool.length) {
        const building = buildingPool[idx];
        const billboardTex = makeNullblockBillboard(billboardTexts[billboardIdx]);
        const defaultMat = new THREE.MeshStandardMaterial({
          color: "#ffffff",
          emissive: "#0d0d2b",
          emissiveIntensity: 0.5,
        });
        const materials: THREE.Material[] = Array(6).fill(null).map((_, faceIdx) => {
          // Front face (facing road) gets billboard, others get default
          if (faceIdx === 0) {
            return new THREE.MeshStandardMaterial({
              map: billboardTex,
              color: "#ffffff",
              emissive: "#ff2244",
              emissiveIntensity: 0.3,
            });
          }
          return defaultMat;
        });
        building.mesh.material = materials;
      }
    });

    // Create 10 shorter background buildings for depth
    for (let i = 0; i < 10; i++) {
      const h = 10 + Math.random() * 15;
      const geo = new THREE.BoxGeometry(14, h, 8);
      const mat = new THREE.MeshStandardMaterial({
        map: texPool[i % 3],
        color: "#ffffff",
        emissive: "#0a0020",
        emissiveIntensity: 0.3,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const side = i % 2 === 0 ? -50 : 50;
      mesh.position.set(side, h / 2, -(i * 30));
      scene.add(mesh);
    }

    // Check if lights already exist — without them buildings render black
    if (!scene.getObjectByName("ambientLight")) {
      const ambient = new THREE.AmbientLight("#ffffff", 1.0);
      ambient.name = "ambientLight";
      scene.add(ambient);
    }
    if (!scene.getObjectByName("dirLight")) {
      const dir = new THREE.DirectionalLight("#8866ff", 1.2);
      dir.position.set(10, 30, 10);
      dir.name = "dirLight";
      scene.add(dir);
    }

    // Neon street lights - recycled with buildings
    const poleMat = new THREE.MeshBasicMaterial({ color: "#333344" });
    const glowMat = new THREE.MeshBasicMaterial({ color: "#fffae0" });
    const armMat = new THREE.MeshBasicMaterial({ color: "#333344" });
    const lampPool: Array<{ group: THREE.Group; initialZ: number }> = [];

    for (let i = 0; i < 16; i++) {
      const lampGroup = new THREE.Group();

      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 8),
        poleMat
      );
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.12), glowMat);
      const side = i % 2 === 0 ? -10 : 10;
      const z = -(Math.floor(i / 2) * 30);
      const poleHeight = 8;
      pole.position.set(0, 4, 0);
      glow.position.set(0, poleHeight, 0);

      // Arm connecting glow to pole
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1.2),
        armMat
      );
      arm.rotation.z = Math.PI / 2;
      arm.position.set(side > 0 ? -0.6 : 0.6, poleHeight, 0);

      lampGroup.add(pole, glow, arm);
      lampGroup.position.set(side, 0, z);
      scene.add(lampGroup);
      lampPool.push({ group: lampGroup, initialZ: z });
    }
    lampPoolRef.current = lampPool;

    // Purple road glow strip
    const glowStrip = new THREE.Mesh(
      new THREE.PlaneGeometry(0.4, 1000),
      new THREE.MeshBasicMaterial({
        color: "#7B2FFF",
        transparent: true,
        opacity: 0.6,
      })
    );
    glowStrip.rotation.x = -Math.PI / 2;
    glowStrip.position.set(0, 0.02, -200);
    scene.add(glowStrip);

    // Ground reflection strip under car
    const reflectionMat = new THREE.MeshBasicMaterial({
      color: "#7B2FFF",
      transparent: true,
      opacity: 0.15,
    });
    const reflection = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 30),
      reflectionMat
    );
    reflection.rotation.x = -Math.PI / 2;
    reflection.position.set(0, 0.03, 5);
    scene.add(reflection);
    reflectionRef.current = reflection;

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

  // Handle game over camera animation
  useEffect(() => {
    if (gamePhase === "dead" && !gameOverInitiatedRef.current) {
      gameOverInitiatedRef.current = true;
      const startTime = Date.now();
      const duration = 1000; // 1 second

      const animateCamera = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic for smooth deceleration
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        // Animate camera position
        camera.position.y = 4 + (8 - 4) * easeProgress;
        camera.position.z = cameraStartPosRef.current.z + 6 * easeProgress;
        camera.updateProjectionMatrix();

        if (progress < 1) {
          requestAnimationFrame(animateCamera);
        }
      };

      animateCamera();
    }
  }, [gamePhase, camera]);

  // STEP 7 — Animation loop
  useFrame(() => {
    if (document.hidden) return;

    // Pause animation when game over
    if (gamePhase === "dead") return;

    // Store camera start position for game over animation
    if (gamePhase === "playing") {
      cameraStartPosRef.current = { y: camera.position.y, z: camera.position.z };
    }

    // Update camera with car movement
    const speedRatio = Math.min(currentSpeed / maxSpeed, 1);

    // Follow car
    camera.position.x = playerLane === 0 ? -3 : playerLane === 2 ? 3 : 0;
    camera.position.y = jumping ? 6 : 4;
    camera.position.z = catPosition * 0.05 + 10;

    // Look ahead
    camera.lookAt(0, 2, catPosition * 0.05 - 20);

    // Adjust FOV based on speed, enhanced by boost
    let baseFov = 70 + speedRatio * 20;
    if (isBoostActive) {
      baseFov = THREE.MathUtils.lerp(baseFov, 85, 0.3);
    }
    (camera as THREE.PerspectiveCamera).fov = baseFov;
    camera.updateProjectionMatrix();

    // Boost camera shake
    if (isBoostActive) {
      camera.position.x += (Math.random() - 0.5) * 0.08;
      camera.position.y += (Math.random() - 0.5) * 0.08;
    }

    // Update loaded car model
    if (carModelRef.current) {
      carModelRef.current.position.x = playerLane === 0 ? -4 : playerLane === 2 ? 4 : 0;
      carModelRef.current.position.z = catPosition * 0.05;
      carModelRef.current.rotation.z = (playerLane - 1) * 0.1; // Subtle lean rotation
    }

    // Update reflection to follow car
    if (reflectionRef.current && carModelRef.current) {
      reflectionRef.current.position.x = carModelRef.current.position.x;
    }

    // Update speed streaks
    if (leftStreakRef.current && rightStreakRef.current) {
      let streakOpacity = speedRatio > 0.6 ? (speedRatio - 0.6) * 2 : 0;
      if (isBoostActive) {
        streakOpacity = THREE.MathUtils.lerp(streakOpacity, 0.8, 0.2);
      }
      (leftStreakRef.current.material as THREE.MeshBasicMaterial).opacity =
        streakOpacity;
      (rightStreakRef.current.material as THREE.MeshBasicMaterial).opacity =
        streakOpacity;
    }

    // Update underglow intensity during boost
    if (underglowLeftRef.current && underglowRightRef.current) {
      const baseIntensity = 0.5;
      const boostIntensity = isBoostActive ? 3 : baseIntensity;
      underglowLeftRef.current.intensity = THREE.MathUtils.lerp(underglowLeftRef.current.intensity, boostIntensity, 0.1);
      underglowRightRef.current.intensity = THREE.MathUtils.lerp(underglowRightRef.current.intensity, boostIntensity, 0.1);
    }

    // Recycle buildings that pass the camera
    const gameSpeed = (currentSpeed / maxSpeed) * 0.5;
    buildingPoolRef.current.forEach((b) => {
      b.mesh.position.z += gameSpeed;
      if (b.mesh.position.z > camera.position.z + 20) {
        b.mesh.position.z -= 400;
      }
    });

    // Recycle street lamps that pass the camera
    lampPoolRef.current.forEach((lamp) => {
      lamp.group.position.z += gameSpeed;
      if (lamp.group.position.z > camera.position.z + 20) {
        lamp.group.position.z -= 480;
      }
    });

    // Position traffic cars directly from obstacles
    const laneXMap = { 0: -2.5, 1: 0, 2: 2.5 };
    const screenHeight = 768;
    const playerScreenY = screenHeight * 0.75;

    (obstacles || []).slice(0, trafficCarsRef.current.length).forEach((obs, index) => {
      const t = trafficCarsRef.current[index];
      if (t) {
        // Position based on 2D y: convert screen distance to 3D z distance
        const yOffset = obs.y - playerScreenY;
        const zOffset = yOffset * 0.2; // scale: pixels to world units
        t.mesh.position.z = camera.position.z + zOffset;
        t.mesh.position.x = laneXMap[obs.lane as 0 | 1 | 2];
        // Hard clamp to road edges to prevent clipping
        t.mesh.position.x = THREE.MathUtils.clamp(t.mesh.position.x, -4, 4);
        t.mesh.position.y = 0.5;
        t.mesh.visible = true;
      }
    });

    // Hide unused traffic cars
    for (let i = (obstacles || []).length; i < trafficCarsRef.current.length; i++) {
      trafficCarsRef.current[i].mesh.visible = false;
    }

    // Update NULLBLOCK ENFORCER
    if (enforcerActiveRef.current && enforcerRef.current) {
      const now = performance.now();
      const timeElapsed = (now - enforcerSpawnTimeRef.current) / 1000; // seconds since spawn

      // Check if traffic is blocking enforcer
      const enforcerBlocked = trafficCarsRef.current.some(t => {
        const sameLane = Math.abs(t.mesh.position.x - enforcerRef.current!.position.x) < 1.5;
        const ahead = t.mesh.position.z < enforcerRef.current!.position.z;
        const close = Math.abs(t.mesh.position.z - enforcerRef.current!.position.z) < 8;
        return sameLane && ahead && close;
      });

      if (enforcerBlocked && onEnforcerBlocked) {
        onEnforcerBlocked(true);
      }

      // Gradually accelerate toward player speed over time
      const maxEnforcerSpeed = gameSpeed * 0.95; // Hard cap at 95% of game speed
      const baseEnforcerSpeed = gameSpeed * 0.7; // Starts at 70% of player speed
      let enforcerSpeed = Math.min(
        baseEnforcerSpeed + timeElapsed * 0.002, // gets slightly faster each second
        maxEnforcerSpeed
      );

      // Traffic slows down enforcer
      if (enforcerBlocked) {
        enforcerSpeed *= 0.6;
      }

      enforcerSpeedRef.current = enforcerSpeed;

      // Move enforcer toward player z position
      enforcerRef.current.position.z += enforcerSpeedRef.current;

      // Slowly drift toward player x (lane tracking)
      const xDiff = carModelRef.current ? carModelRef.current.position.x - enforcerRef.current.position.x : 0;
      enforcerRef.current.position.x += xDiff * 0.02;

      // Slight left/right weave for alive feel
      enforcerRef.current.position.x += Math.sin(now * 0.0012) * 0.03;

      // Calculate distance
      const enforcerDistance = Math.abs(enforcerRef.current.position.z - camera.position.z);

      // Notify React component of enforcer distance
      if (onEnforcerDistanceChange) {
        onEnforcerDistanceChange(enforcerDistance);
      }

      // If enforcer gets within 5 units of camera (caught)
      if (enforcerRef.current.position.z > camera.position.z - 3) {
        if (onEnforcerCaught) {
          onEnforcerCaught();
        }
        enforcerActiveRef.current = false;
      }
    }

    // Recycle pedestrians and benches
    pedestriansRef.current.forEach((p) => {
      p.position.z += gameSpeed;
      if (p.position.z > camera.position.z + 10) {
        p.position.z -= 300;
        const side = p.position.x > 0 ? 10 : -10;
        p.position.x = side + (Math.random() * 3 - 1.5);
      }
      // Safety clamp: if somehow landed on road, force back to pavement
      if (Math.abs(p.position.x) < 7) {
        p.position.x = p.position.x > 0 ? 9 : -9;
      }
    });
  });

  return null; // All geometry added directly to scene via useEffect
}

export function Game3DScene(props: Game3DSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{
          position: [0, 8, 16],
          fov: 75,
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
