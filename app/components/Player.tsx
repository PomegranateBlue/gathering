"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PLAYER_SPEED, WORLD_BOUNDARY, PALETTE } from "../constants";
import { usePlayerControls } from "../hooks/usePlayerControls";

interface PlayerProps {
  positionRef: React.RefObject<THREE.Vector3>;
}

enum KeyboardKeys {
  ARROWUP = "ArrowUp",
  ARROWDOWN = "ArrowDown",
  ARROWLEFT = "ArrowLeft",
  ARROWRIGHT = "ArrowRight",
}

export function Player({ positionRef }: PlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const keys = usePlayerControls();

  useFrame(({ camera }) => {
    if (!groupRef.current) return;
    timeRef.current += 0.016;

    let dx = 0,
      dz = 0;
    if (keys.current[KeyboardKeys.ARROWUP]) dz = -PLAYER_SPEED;
    if (keys.current[KeyboardKeys.ARROWDOWN]) dz = PLAYER_SPEED;
    if (keys.current[KeyboardKeys.ARROWLEFT]) dx = -PLAYER_SPEED;
    if (keys.current[KeyboardKeys.ARROWRIGHT]) dx = PLAYER_SPEED;

    if (dx !== 0 && dz !== 0) {
      const n = 1 / Math.sqrt(2);
      dx *= n;
      dz *= n;
    }

    const player = groupRef.current;
    player.position.x = THREE.MathUtils.clamp(
      player.position.x + dx,
      -WORLD_BOUNDARY,
      WORLD_BOUNDARY,
    );
    player.position.z = THREE.MathUtils.clamp(
      player.position.z + dz,
      -WORLD_BOUNDARY,
      WORLD_BOUNDARY,
    );

    if (dx !== 0 || dz !== 0) {
      const targetAngle = Math.atan2(dx, dz);
      player.rotation.y += (targetAngle - player.rotation.y) * 0.15;
      player.position.y = Math.abs(Math.sin(timeRef.current * 10)) * 0.15;
    } else {
      player.position.y *= 0.9;
    }

    // 공유 positionRef 업데이트 (Altar에서 거리 계산에 사용)
    positionRef.current.copy(player.position);

    // 카메라 추적
    camera.position.x = player.position.x + 10;
    camera.position.z = player.position.z + 10;
    camera.lookAt(player.position.x, 0, player.position.z);
  });

  return (
    <group ref={groupRef}>
      {/* 몸통 */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[0.8, 1.0, 0.6]} />
        <meshStandardMaterial color={PALETTE.player} />
      </mesh>

      {/* 머리 */}
      <mesh position={[0, 1.9, 0]} castShadow>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color={PALETTE.playerHead} />
      </mesh>

      {/* 눈 */}
      <mesh position={[-0.15, 2.0, 0.35]}>
        <boxGeometry args={[0.1, 0.1, 0.05]} />
        <meshStandardMaterial color={0x111111} />
      </mesh>
      <mesh position={[0.15, 2.0, 0.35]}>
        <boxGeometry args={[0.1, 0.1, 0.05]} />
        <meshStandardMaterial color={0x111111} />
      </mesh>
    </group>
  );
}
