"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { INTERACTION_DISTANCE, PALETTE } from "../constants";

const ALTAR_POSITION = new THREE.Vector3(5, 0.9, -3);

interface AltarProps {
  playerPositionRef: React.RefObject<THREE.Vector3>;
  onNearChange: (near: boolean) => void;
}

export function Altar({ playerPositionRef, onNearChange }: AltarProps) {
  const altarRef = useRef<THREE.Mesh>(null);
  const indicatorRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const isNearRef = useRef(false);

  useFrame(() => {
    timeRef.current += 0.016;

    const dist = playerPositionRef.current.distanceTo(ALTAR_POSITION);
    const nearNow = dist < INTERACTION_DISTANCE;

    // 상태가 바뀔 때만 콜백 호출 (60fps에서 불필요한 setState 방지)
    if (nearNow !== isNearRef.current) {
      isNearRef.current = nearNow;
      onNearChange(nearNow);
    }

    if (altarRef.current) {
      const mat = altarRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = nearNow
        ? 0.6 + Math.sin(timeRef.current * 4) * 0.3
        : 0.15 + Math.sin(timeRef.current * 2) * 0.1;
    }

    if (indicatorRef.current) {
      indicatorRef.current.position.y = 2.2 + Math.sin(timeRef.current * 3) * 0.2;
    }
  });

  return (
    <group>
      <mesh ref={altarRef} position={[5, 0.9, -3]} castShadow>
        <boxGeometry args={[1.2, 1.8, 1.2]} />
        <meshStandardMaterial
          color={PALETTE.interactable}
          emissive={PALETTE.glowColor}
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh ref={indicatorRef} position={[5, 2.2, -3]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial
          color={0xffffff}
          emissive={0xffffff}
          emissiveIntensity={1}
        />
      </mesh>
    </group>
  );
}
