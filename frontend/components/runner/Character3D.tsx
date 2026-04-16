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

const RUN_MODEL_PATH = "/motions/running.glb";

type GLTFLike = {
  scene: THREE.Object3D;
  animations: THREE.AnimationClip[];
};

export function Character3D({ position, jumping, sliding }: Character3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const activeActionRef = useRef<THREE.AnimationAction | null>(null);

  const gltf = useGLTF(RUN_MODEL_PATH) as unknown as GLTFLike;
  const characterScene = useMemo(
    () => SkeletonUtils.clone(gltf.scene) as THREE.Object3D,
    [gltf.scene]
  );
  const { actions, names } = useAnimations(gltf.animations, groupRef);

  useEffect(() => {
    characterScene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [characterScene]);

  useEffect(() => {
    const runName = names[0];
    if (!runName || !actions?.[runName]) return;
    const action = actions[runName];
    if (activeActionRef.current === action) return;

    action.reset();
    action.fadeIn(0.15);
    action.play();
    activeActionRef.current = action;

    return () => {
      action.fadeOut(0.1);
    };
  }, [actions, names]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const bob = Math.abs(Math.sin(state.clock.getElapsedTime() * 8));
    const target = new THREE.Vector3(...position);

    groupRef.current.position.lerp(target, 0.16);
    groupRef.current.rotation.y = Math.PI;

    if (jumping) {
      groupRef.current.rotation.x = Math.PI / 14;
      groupRef.current.position.y += 0.16;
      groupRef.current.scale.setScalar(0.96);
    } else if (sliding) {
      groupRef.current.rotation.x = Math.PI / 5;
      groupRef.current.position.y += -0.06;
      groupRef.current.scale.set(1.02, 0.82, 1.02);
    } else {
      groupRef.current.rotation.x *= 0.88;
      groupRef.current.position.y += bob * 0.02;
      groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.18);
    }

    if (shadowRef.current) {
      const shadowScale = jumping ? 0.78 : sliding ? 1.12 : 1 - bob * 0.05;
      shadowRef.current.scale.set(shadowScale, shadowScale, 1);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <primitive object={characterScene} scale={0.82} position={[0, -0.48, 0]} />
      <mesh ref={shadowRef} position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.34, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} />
      </mesh>
    </group>
  );
}

useGLTF.preload(RUN_MODEL_PATH);
