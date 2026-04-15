"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations } from "@react-three/drei/core/useAnimations";
import { useGLTF } from "@react-three/drei/core/useGLTF";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";

interface Character3DProps {
  position: [number, number, number];
  jumping: boolean;
  sliding: boolean;
}

const MODEL_PATH = "/motions/character.glb";
const EXTRA_ANIMATION_PATHS = [
  "/motions/running.glb",
  "/motions/jump.glb",
  "/motions/slide.glb",
];

type GLTFLike = {
  scene: THREE.Object3D;
  animations: THREE.AnimationClip[];
};

function findClipName(names: string[], keywords: string[]): string | null {
  for (const name of names) {
    const normalized = name.toLowerCase();
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return name;
    }
  }
  return null;
}

export function Character3D({ position, jumping, sliding }: Character3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const activeActionRef = useRef<THREE.AnimationAction | null>(null);

  const base = useGLTF(MODEL_PATH) as unknown as GLTFLike;
  const running = useGLTF(EXTRA_ANIMATION_PATHS[0]) as unknown as GLTFLike;
  const jump = useGLTF(EXTRA_ANIMATION_PATHS[1]) as unknown as GLTFLike;
  const slide = useGLTF(EXTRA_ANIMATION_PATHS[2]) as unknown as GLTFLike;

  const characterScene = useMemo(
    () => SkeletonUtils.clone(base.scene) as THREE.Object3D,
    [base.scene]
  );

  const animationClips = useMemo(
    () => [
      ...base.animations,
      ...running.animations,
      ...jump.animations,
      ...slide.animations,
    ],
    [base.animations, running.animations, jump.animations, slide.animations]
  );

  const { actions, names } = useAnimations(animationClips, groupRef);

  useEffect(() => {
    characterScene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [characterScene]);

  const clipNames = useMemo(() => {
    const runName = findClipName(names, ["run", "jog", "sprint", "walk"]);
    const jumpName = findClipName(names, ["jump", "hop"]);
    const slideName = findClipName(names, ["slide", "crouch", "duck", "roll"]);
    return { runName, jumpName, slideName };
  }, [names]);

  useEffect(() => {
    if (!actions) return;

    const nextName = jumping
      ? clipNames.jumpName ?? clipNames.runName
      : sliding
        ? clipNames.slideName ?? clipNames.runName
        : clipNames.runName;

    if (!nextName) return;
    const nextAction = actions[nextName];
    if (!nextAction) return;
    if (activeActionRef.current === nextAction) return;

    activeActionRef.current?.fadeOut(0.15);
    nextAction.reset().fadeIn(0.15).play();
    activeActionRef.current = nextAction;

    return () => {
      nextAction.fadeOut(0.1);
    };
  }, [actions, clipNames, jumping, sliding]);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.lerp(new THREE.Vector3(...position), 0.1);
  });

  return (
    <group ref={groupRef} position={position}>
      <primitive object={characterScene} scale={0.95} rotation={[0, Math.PI, 0]} />
      <mesh position={[0, -0.92, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.36, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} />
      </mesh>
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
for (const path of EXTRA_ANIMATION_PATHS) {
  useGLTF.preload(path);
}
