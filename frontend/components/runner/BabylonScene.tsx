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
      // Create engine
      const engine = new BABYLON.Engine(containerRef.current, true, {
        preserveDrawingBuffer: true,
        stencil: true,
      });
      engineRef.current = engine;

      // Create scene
      const scene = new BABYLON.Scene(engine);
      scene.clearColor = new BABYLON.Color4(0.004, 0.06, 0.063, 1);
      sceneRef.current = scene;

      // Camera
      const camera = new BABYLON.UniversalCamera(
        "camera",
        new BABYLON.Vector3(0, 3, 15)
      );
      camera.attachControl(containerRef.current, true);
      camera.speed = 0;
      cameraRef.current = camera;

      // Lights
      const ambientLight = new BABYLON.HemisphericLight(
        "ambient",
        new BABYLON.Vector3(0, 1, 0),
        scene
      );
      ambientLight.intensity = 0.8;

      const directionalLight = new BABYLON.PointLight(
        "directional",
        new BABYLON.Vector3(10, 15, 10),
        scene
      );
      directionalLight.intensity = 1;

      // Ground/Road
      const ground = BABYLON.MeshBuilder.CreateGround(
        "ground",
        { width: 10, height: 500 },
        scene
      );
      const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
      groundMat.emissiveColor = new BABYLON.Color3(0.066, 0.066, 0.133);
      ground.material = groundMat;
      ground.position.z = 0;

      // Cat
      const catGroup = BABYLON.MeshBuilder.CreateBox("cat", { size: 0.6 }, scene);
      const catMat = new BABYLON.StandardMaterial("catMat", scene);
      catMat.emissiveColor = new BABYLON.Color3(1, 0.843, 0);
      catGroup.material = catMat;

      // Cat eyes (emissive cyan)
      const leftEye = BABYLON.MeshBuilder.CreateSphere("leftEye", { diameter: 0.16 }, scene);
      leftEye.position = new BABYLON.Vector3(-0.12, 0.65, 0.33);
      const eyeMat = new BABYLON.StandardMaterial("eyeMat", scene);
      eyeMat.emissiveColor = new BABYLON.Color3(0, 0.94, 1);
      leftEye.material = eyeMat;
      leftEye.parent = catGroup;

      const rightEye = leftEye.clone("rightEye");
      rightEye.position.x = 0.12;
      rightEye.parent = catGroup;

      catGroupRef.current = catGroup;

      // Game loop
      engine.runRenderLoop(() => {
        const { catPosition: cp, playerLane: pl, jumping: j, sliding: s } = stateRef.current;
        const catX = pl - 1;
        const catZ = cp * 2;

        // Smooth camera follow
        const targetCam = new BABYLON.Vector3(catX, 3, catZ + 5);
        camera.position = BABYLON.Vector3.Lerp(
          camera.position,
          targetCam,
          0.1
        );
        camera.setTarget(new BABYLON.Vector3(catX, 1, catZ));

        // Update cat position
        catGroup.position = new BABYLON.Vector3(catX, 0, catZ);

        // Cat rotation for jumping/sliding
        if (j) {
          catGroup.rotation.x = Math.PI / 6;
        } else if (s) {
          catGroup.rotation.x = Math.PI / 3;
        } else {
          catGroup.rotation.x *= 0.9;
        }

        // TODO: Render coins
        // gameState.coins
        //   .filter((coin) => !coin.collected && coin.y < catZ + 30)
        //   .forEach((coin) => {
        //     // Render coin geometry
        //   });

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
      console.error("Babylon.js scene error:", error);
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
      }}
    />
  );
}
