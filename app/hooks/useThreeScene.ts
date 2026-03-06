"use client";

import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import {
  PLAYER_SPEED,
  INTERACTION_DISTANCE,
  GROUND_SIZE,
  WORLD_BOUNDARY,
  PALETTE,
} from "../constants";

export function useThreeScene() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isNearObject, setIsNearObject] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerRef = useRef<THREE.Group | null>(null);
  const interactableRef = useRef<THREE.Mesh | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const animFrameRef = useRef<number | null>(null);
  const playerDirectionRef = useRef(0);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(PALETTE.bg);
    scene.fog = new THREE.FogExp2(PALETTE.bg, 0.035);
    sceneRef.current = scene;

    // Camera (isometric view)
    const aspect = container.clientWidth / container.clientHeight;
    const frustum = 8;
    const camera = new THREE.OrthographicCamera(
      -frustum * aspect,
      frustum * aspect,
      frustum,
      -frustum,
      0.1,
      100,
    );
    camera.position.set(10, 12, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(PALETTE.ambient, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(PALETTE.point, 1.5, 30);
    pointLight.position.set(5, 10, 5);
    pointLight.castShadow = true;
    scene.add(pointLight);

    const accentLight = new THREE.PointLight(PALETTE.glowColor, 0.8, 20);
    accentLight.position.set(-5, 6, -5);
    scene.add(accentLight);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE);
    const groundMat = new THREE.MeshStandardMaterial({
      color: PALETTE.ground,
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(
      GROUND_SIZE,
      20,
      PALETTE.groundGrid,
      PALETTE.groundGrid,
    );
    gridHelper.position.y = 0.01;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.3;
    scene.add(gridHelper);

    // Player character
    const playerGroup = new THREE.Group();

    const bodyGeo = new THREE.BoxGeometry(0.8, 1.0, 0.6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: PALETTE.player });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.0;
    body.castShadow = true;
    playerGroup.add(body);

    const headGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const headMat = new THREE.MeshStandardMaterial({
      color: PALETTE.playerHead,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.9;
    head.castShadow = true;
    playerGroup.add(head);

    const eyeGeo = new THREE.BoxGeometry(0.1, 0.1, 0.05);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.15, 2.0, 0.35);
    playerGroup.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.15, 2.0, 0.35);
    playerGroup.add(eyeR);

    playerGroup.position.set(0, 0, 0);
    scene.add(playerGroup);
    playerRef.current = playerGroup;

    // Interactable object
    const objGeo = new THREE.BoxGeometry(1.2, 1.8, 1.2);
    const objMat = new THREE.MeshStandardMaterial({
      color: PALETTE.interactable,
      emissive: PALETTE.glowColor,
      emissiveIntensity: 0.3,
    });
    const interactable = new THREE.Mesh(objGeo, objMat);
    interactable.position.set(5, 0.9, -3);
    interactable.castShadow = true;
    scene.add(interactable);
    interactableRef.current = interactable;

    const indicatorGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const indicatorMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1,
    });
    const indicator = new THREE.Mesh(indicatorGeo, indicatorMat);
    indicator.position.set(5, 2.2, -3);
    scene.add(indicator);

    // Decorative pillars
    const pillarGeo = new THREE.CylinderGeometry(0.2, 0.2, 3, 6);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x2d2d44,
      emissive: PALETTE.glowColor,
      emissiveIntensity: 0.1,
    });
    const pillarPositions: [number, number, number][] = [
      [-6, 1.5, -6],
      [6, 1.5, -6],
      [-6, 1.5, 6],
      [6, 1.5, 6],
      [0, 1.5, -8],
      [-8, 1.5, 0],
      [8, 1.5, 0],
      [0, 1.5, 8],
    ];
    pillarPositions.forEach(([x, y, z]) => {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(x, y, z);
      pillar.castShadow = true;
      scene.add(pillar);
    });

    // Keyboard events
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (e.key === " ") e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // Resize
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      const newAspect = w / h;
      camera.left = -frustum * newAspect;
      camera.right = frustum * newAspect;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // Game loop
    let time = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      time += 0.016;

      const player = playerRef.current;
      const keys = keysRef.current;
      const obj = interactableRef.current;

      if (!player || !obj) return;

      let dx = 0,
        dz = 0;
      if (keys["ArrowUp"] || keys["w"]) dz = -PLAYER_SPEED;
      if (keys["ArrowDown"] || keys["s"]) dz = PLAYER_SPEED;
      if (keys["ArrowLeft"] || keys["a"]) dx = -PLAYER_SPEED;
      if (keys["ArrowRight"] || keys["d"]) dx = PLAYER_SPEED;

      if (dx !== 0 && dz !== 0) {
        const normalize = 1 / Math.sqrt(2);
        dx *= normalize;
        dz *= normalize;
      }

      const newX = THREE.MathUtils.clamp(
        player.position.x + dx,
        -WORLD_BOUNDARY,
        WORLD_BOUNDARY,
      );
      const newZ = THREE.MathUtils.clamp(
        player.position.z + dz,
        -WORLD_BOUNDARY,
        WORLD_BOUNDARY,
      );
      player.position.x = newX;
      player.position.z = newZ;

      if (dx !== 0 || dz !== 0) {
        const targetAngle = Math.atan2(dx, dz);
        playerDirectionRef.current = targetAngle;
        player.rotation.y += (targetAngle - player.rotation.y) * 0.15;
      }

      if (dx !== 0 || dz !== 0) {
        player.position.y = Math.abs(Math.sin(time * 10)) * 0.15;
      } else {
        player.position.y *= 0.9;
      }

      camera.position.x = player.position.x + 10;
      camera.position.z = player.position.z + 10;
      camera.lookAt(player.position.x, 0, player.position.z);

      const dist = player.position.distanceTo(obj.position);
      const nearNow = dist < INTERACTION_DISTANCE;

      setIsNearObject((prev) => {
        if (prev !== nearNow) return nearNow;
        return prev;
      });

      (obj.material as THREE.MeshStandardMaterial).emissiveIntensity = nearNow
        ? 0.6 + Math.sin(time * 4) * 0.3
        : 0.15 + Math.sin(time * 2) * 0.1;

      indicator.position.y = 2.2 + Math.sin(time * 3) * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return { canvasRef, isNearObject };
}
