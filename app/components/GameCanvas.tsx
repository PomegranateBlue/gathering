"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { World } from "./World";
import { Player } from "./Player";
import { Altar } from "./Altar";
import { PALETTE } from "../constants";
import { styles } from "../styles";

interface GameCanvasProps {
  onNearChange: (near: boolean) => void;
}

export function GameCanvas({ onNearChange }: GameCanvasProps) {
  // Player와 Altar 사이의 위치 공유 — state가 아닌 ref이므로 리렌더 없음
  const playerPositionRef = useRef(new THREE.Vector3());

  return (
    <Canvas
      style={styles.canvas}
      orthographic
      camera={{ position: [10, 12, 10], zoom: 50, near: 0.1, far: 100 }}
      shadows
      gl={{ antialias: true }}
    >
      <color attach="background" args={[PALETTE.bg]} />
      <fogExp2 attach="fog" args={[PALETTE.bg, 0.035]} />
      <World />
      <Player positionRef={playerPositionRef} />
      <Altar playerPositionRef={playerPositionRef} onNearChange={onNearChange} />
    </Canvas>
  );
}
