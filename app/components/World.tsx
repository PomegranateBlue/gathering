"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { PALETTE, GROUND_SIZE } from "../constants";

const PILLAR_POSITIONS: [number, number, number][] = [
  [-6, 1.5, -6],
  [6, 1.5, -6],
  [-6, 1.5, 6],
  [6, 1.5, 6],
  [0, 1.5, -8],
  [-8, 1.5, 0],
  [8, 1.5, 0],
  [0, 1.5, 8],
];

export function World() {
  const gridRef = useRef<THREE.GridHelper>(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const mat = gridRef.current.material as THREE.Material;
    mat.transparent = true;
    mat.opacity = 0.3;
  }, []);

  return (
    <>
      {/* Lighting */}
      <ambientLight color={PALETTE.ambient} intensity={0.6} />
      <pointLight
        color={PALETTE.point}
        intensity={1.5}
        distance={30}
        position={[5, 10, 5]}
        castShadow
      />
      <pointLight
        color={PALETTE.glowColor}
        intensity={0.8}
        distance={20}
        position={[-5, 6, -5]}
      />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <meshStandardMaterial color={PALETTE.ground} roughness={0.9} />
      </mesh>

      {/* Grid */}
      <gridHelper
        ref={gridRef}
        args={[GROUND_SIZE, 20, PALETTE.groundGrid, PALETTE.groundGrid]}
        position={[0, 0.01, 0]}
      />

      {/* Pillars */}
      {PILLAR_POSITIONS.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 3, 6]} />
          <meshStandardMaterial
            color={0x2d2d44}
            emissive={PALETTE.glowColor}
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}
    </>
  );
}
