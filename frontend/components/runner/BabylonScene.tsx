"use client";

import { useEffect, useRef } from "react";
import * as BABYLON from "babylonjs";

interface BabylonSceneProps {
  catPosition: number;
  playerLane: 0 | 1 | 2;
  jumping: boolean;
  sliding: boolean;
}

export function BabylonScene({
  catPosition,
  playerLane,
  jumping,
  sliding,
}: BabylonSceneProps) {
  const containerRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const cameraRef = useRef<BABYLON.UniversalCamera | null>(null);
  const catGroupRef = useRef<BABYLON.Mesh | null>(null);
  const stateRef = useRef({ catPosition, playerLane, jumping, sliding });

  useEffect(() => {
    stateRef.current = { catPosition, playerLane, jumping, sliding };
  }, [catPosition, playerLane, jumping, sliding]);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Create engine with antialiasing for better quality
      const engine = new BABYLON.Engine(containerRef.current, true, {
        antialias: true,
        preserveDrawingBuffer: false,
        stencil: false,
        adaptToDeviceRatio: true,
      });
      engineRef.current = engine;

      // Create scene
      const scene = new BABYLON.Scene(engine);
      scene.clearColor = new BABYLON.Color4(0.02, 0.1, 0.12, 1); // Dark blue-green background
      scene.collisionsEnabled = true;
      sceneRef.current = scene;

      // Camera - positioned to see the cat from a nice angle
      const camera = new BABYLON.UniversalCamera(
        "camera",
        new BABYLON.Vector3(0, 2.5, 8)
      );
      camera.attachControl(containerRef.current, true);
      camera.speed = 0;
      camera.inertia = 0.7;
      cameraRef.current = camera;

      // Lighting setup
      const ambientLight = new BABYLON.HemisphericLight(
        "ambient",
        new BABYLON.Vector3(0, 1, 0),
        scene
      );
      ambientLight.intensity = 0.6;
      ambientLight.groundColor = new BABYLON.Color3(0.1, 0.12, 0.15);

      const sunLight = new BABYLON.DirectionalLight(
        "sunlight",
        new BABYLON.Vector3(5, 8, 5),
        scene
      );
      sunLight.intensity = 1.2;

      // Add glow effect for neon aesthetic
      const glow = new BABYLON.GlowLayer("glow", scene);

      // Road/Ground with better material
      const ground = BABYLON.MeshBuilder.CreateGround(
        "ground",
        { width: 4, height: 1000, subdivisions: 50 },
        scene
      );
      const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
      groundMat.emissiveColor = new BABYLON.Color3(0.12, 0.12, 0.16);
      ground.material = groundMat;

      // Lane markers
      for (let i = -1; i <= 1; i++) {
        const line = BABYLON.MeshBuilder.CreateTube(
          `lane_${i}`,
          {
            path: [
              new BABYLON.Vector3(i, 0.01, -500),
              new BABYLON.Vector3(i, 0.01, 500),
            ],
            radius: 0.05,
            updatable: false,
          },
          scene
        );
        const lineMat = new BABYLON.StandardMaterial(`lineMat_${i}`, scene);
        lineMat.emissiveColor = new BABYLON.Color3(0, 0.8, 1);
        lineMat.alpha = 0.5;
        line.material = lineMat;
      }

      // Create cat with better geometry
      const catGroup = BABYLON.MeshBuilder.CreateBox("catBody", { size: 0.6 }, scene);
      const catMat = new BABYLON.StandardMaterial("catMat", scene);
      catMat.emissiveColor = new BABYLON.Color3(1, 0.84, 0); // Gold
      catGroup.material = catMat;
      glow.addIncludedOnlyMesh(catGroup);

      // Cat eyes with glow
      const eyeGeometry = BABYLON.MeshBuilder.CreateSphere("eye", { diameter: 0.15, segments: 16 }, scene);
      const eyeMat = new BABYLON.StandardMaterial("eyeMat", scene);
      eyeMat.emissiveColor = new BABYLON.Color3(0, 1, 1);
      eyeGeometry.material = eyeMat;

      const leftEye = eyeGeometry.clone("leftEye");
      leftEye.position = new BABYLON.Vector3(-0.15, 0.2, 0.35);
      leftEye.parent = catGroup;
      glow.addIncludedOnlyMesh(leftEye);

      const rightEye = eyeGeometry.clone("rightEye");
      rightEye.position = new BABYLON.Vector3(0.15, 0.2, 0.35);
      rightEye.parent = catGroup;
      glow.addIncludedOnlyMesh(rightEye);

      catGroupRef.current = catGroup;

      // Create dynamic obstacles in the distance
      const obstaclePool: BABYLON.Mesh[] = [];
      for (let i = 0; i < 20; i++) {
        const obstacle = BABYLON.MeshBuilder.CreateBox(
          `obstacle_${i}`,
          { width: 0.8, height: 1.5, depth: 0.4 },
          scene
        );
        const obstacleMat = new BABYLON.StandardMaterial(`obstacleMat_${i}`, scene);
        obstacleMat.emissiveColor = new BABYLON.Color3(0, 0.9, 0.95);
        obstacleMat.alpha = 0.85;
        obstacle.material = obstacleMat;
        obstacle.isVisible = false;
        obstaclePool.push(obstacle);
      }

      // Game loop
      engine.runRenderLoop(() => {
        const { catPosition: cp, playerLane: pl, jumping: j, sliding: s } = stateRef.current;
        const laneX = pl === 0 ? -1 : pl === 2 ? 1 : 0;
        const catZ = cp * 2;

        // Smooth camera follow
        const cameraDistance = j || s ? 10 : 8;
        const cameraHeight = j ? 3.5 : 2.5;
        const targetCam = new BABYLON.Vector3(laneX, cameraHeight, catZ + cameraDistance);
        camera.position = BABYLON.Vector3.Lerp(camera.position, targetCam, 0.08);
        camera.setTarget(new BABYLON.Vector3(laneX, 1, catZ));

        // Update cat position and rotation
        catGroup.position.x = laneX;
        catGroup.position.z = catZ;

        // Smooth rotation for jumping/sliding
        let targetRotX = 0;
        if (j) {
          targetRotX = -Math.PI / 8; // Tilt up when jumping
        } else if (s) {
          targetRotX = Math.PI / 4; // Tilt forward when sliding
        }
        catGroup.rotation.x += (targetRotX - catGroup.rotation.x) * 0.1;

        // Rotate cat on Y axis continuously
        catGroup.rotation.y += 0.01;

        // Render glow layer
        scene.render();
      });

      // Handle resize
      const handleResize = () => {
        engine.resize();
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (engine) {
          engine.dispose();
        }
      };
    } catch (error) {
      console.error("Babylon.js scene initialization error:", error);
    }
  }, []);

  return (
    <canvas
      ref={containerRef as any}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        display: "block",
        touchAction: "none",
      } as React.CSSProperties}
    />
  );
}
