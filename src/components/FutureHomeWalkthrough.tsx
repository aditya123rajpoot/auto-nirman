'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { ArrowLeft, Camera, DoorOpen, Home, ImageDown, LocateFixed, MousePointer2, Sparkles, SunMedium } from 'lucide-react';
import { MAP2D_STORAGE_KEY } from '@/components/Map2DGenerator';
import type { Map2DLayout, Map2DRoom } from '@/types/map2d';

const TOUR_STORAGE_KEY = 'auto_nirman_future_home_preview_still';

type RoomTone = {
  floor: string;
  wall: string;
  accent: string;
  furniture: string;
  roughness: number;
};

const roomTones: Record<Map2DRoom['type'], RoomTone> = {
  living: { floor: '#b9a68d', wall: '#f1eadf', accent: '#d9b46d', furniture: '#31546b', roughness: 0.58 },
  kitchen: { floor: '#c6d5d5', wall: '#f6f2ea', accent: '#d6af5f', furniture: '#25323a', roughness: 0.42 },
  bedroom: { floor: '#a77f67', wall: '#efe6dc', accent: '#8fb3c8', furniture: '#5b382d', roughness: 0.62 },
  bath: { floor: '#9fb6bd', wall: '#e7f0f2', accent: '#c8d8dd', furniture: '#e8edf0', roughness: 0.34 },
  parking: { floor: '#787f86', wall: '#d8dde1', accent: '#94a3b8', furniture: '#64748b', roughness: 0.72 },
  stair: { floor: '#a78b8e', wall: '#eee5e6', accent: '#c56f7d', furniture: '#7f1d1d', roughness: 0.52 },
  dining: { floor: '#bca587', wall: '#f0e7dc', accent: '#9fd6bc', furniture: '#493a2f', roughness: 0.55 },
  utility: { floor: '#b7b9bf', wall: '#eef0f3', accent: '#d88eb9', furniture: '#4b5563', roughness: 0.46 },
  circulation: { floor: '#aab2bd', wall: '#eceff3', accent: '#7dd3fc', furniture: '#475569', roughness: 0.64 },
  court: { floor: '#9dbc75', wall: '#e8f0df', accent: '#84cc16', furniture: '#3f6212', roughness: 0.74 },
  balcony: { floor: '#91b794', wall: '#edf5ec', accent: '#22c55e', furniture: '#365f3b', roughness: 0.68 },
  store: { floor: '#aaa2b8', wall: '#eee9f4', accent: '#c084fc', furniture: '#4c1d95', roughness: 0.58 },
};

const wallHeight = 9.6;
const wallThickness = 0.45;
const slabThickness = 0.28;
const feetToWorld = 0.36;

function titleCase(value?: string) {
  if (!value) return 'Family';
  return value
    .replaceAll('_', ' ')
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function createTexture(color: string, kind: 'floor' | 'wall' | 'wood' | 'stone') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 256, 256);
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 90; i += 1) {
    const shade = i % 2 === 0 ? '#ffffff' : '#0f172a';
    ctx.strokeStyle = shade;
    ctx.lineWidth = kind === 'wood' ? 1.4 : 0.8;
    ctx.beginPath();
    if (kind === 'wood') {
      const y = (i * 17) % 256;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(70, y + 9, 145, y - 11, 256, y + 6);
    } else {
      const x = (i * 31) % 256;
      const y = (i * 47) % 256;
      ctx.moveTo(x, y);
      ctx.lineTo((x + 70) % 256, (y + 40) % 256);
    }
    ctx.stroke();
  }

  if (kind === 'floor' || kind === 'stone') {
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = '#ffffff';
    for (let i = 0; i <= 256; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(kind === 'wall' ? 2 : 4, kind === 'wall' ? 2 : 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeMaterial(color: string, roughness = 0.55, textureKind?: 'floor' | 'wall' | 'wood' | 'stone') {
  const texture = textureKind ? createTexture(color, textureKind) : null;
  const options: THREE.MeshStandardMaterialParameters = {
    color,
    roughness,
    metalness: 0.04,
  };
  if (texture) options.map = texture;
  return new THREE.MeshStandardMaterial(options);
}

function roomCenter(room: Map2DRoom, layout: Map2DLayout) {
  return {
    x: (room.x + room.width / 2 - layout.plot.width / 2) * feetToWorld,
    z: (room.y + room.height / 2 - layout.plot.length / 2) * feetToWorld,
  };
}

function addBox(scene: THREE.Scene, geometry: THREE.BoxGeometry, material: THREE.Material, position: THREE.Vector3, name: string, castShadow = true) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  mesh.name = name;
  scene.add(mesh);
  return mesh;
}

function addWallSet(scene: THREE.Scene, room: Map2DRoom, layout: Map2DLayout, wallMaterial: THREE.Material) {
  const center = roomCenter(room, layout);
  const width = room.width * feetToWorld;
  const depth = room.height * feetToWorld;
  const wallY = wallHeight * feetToWorld * 0.5 + slabThickness * feetToWorld;
  const wallH = wallHeight * feetToWorld;
  const t = wallThickness * feetToWorld;

  addBox(scene, new THREE.BoxGeometry(width + t, wallH, t), wallMaterial, new THREE.Vector3(center.x, wallY, center.z - depth / 2), `${room.label} north wall`);
  addBox(scene, new THREE.BoxGeometry(width + t, wallH, t), wallMaterial, new THREE.Vector3(center.x, wallY, center.z + depth / 2), `${room.label} south wall`);
  addBox(scene, new THREE.BoxGeometry(t, wallH, depth + t), wallMaterial, new THREE.Vector3(center.x - width / 2, wallY, center.z), `${room.label} west wall`);
  addBox(scene, new THREE.BoxGeometry(t, wallH, depth + t), wallMaterial, new THREE.Vector3(center.x + width / 2, wallY, center.z), `${room.label} east wall`);
}

function addRoomFurniture(scene: THREE.Scene, room: Map2DRoom, layout: Map2DLayout, material: THREE.Material) {
  const center = roomCenter(room, layout);
  const width = room.width * feetToWorld;
  const depth = room.height * feetToWorld;
  const y = slabThickness * feetToWorld + 0.18;

  if (room.type === 'bedroom') {
    addBox(scene, new THREE.BoxGeometry(width * 0.45, 0.34, depth * 0.36), material, new THREE.Vector3(center.x - width * 0.18, y + 0.17, center.z - depth * 0.16), 'bed');
    addBox(scene, new THREE.BoxGeometry(width * 0.43, 0.08, depth * 0.14), makeMaterial('#f7ead7', 0.7), new THREE.Vector3(center.x - width * 0.18, y + 0.43, center.z - depth * 0.28), 'pillows', false);
    addBox(scene, new THREE.BoxGeometry(width * 0.1, 0.7, depth * 0.62), material, new THREE.Vector3(center.x + width * 0.36, y + 0.35, center.z), 'wardrobe');
  }

  if (room.type === 'living') {
    addBox(scene, new THREE.BoxGeometry(width * 0.48, 0.32, depth * 0.16), material, new THREE.Vector3(center.x - width * 0.18, y + 0.16, center.z - depth * 0.18), 'sofa');
    addBox(scene, new THREE.BoxGeometry(width * 0.28, 0.12, depth * 0.2), makeMaterial('#7c5e46', 0.5, 'wood'), new THREE.Vector3(center.x + width * 0.1, y + 0.08, center.z + depth * 0.12), 'coffee table');
    addBox(scene, new THREE.BoxGeometry(width * 0.16, 0.8, 0.08), makeMaterial('#111827', 0.38), new THREE.Vector3(center.x + width * 0.36, y + 0.4, center.z - depth * 0.38), 'media panel');
  }

  if (room.type === 'dining') {
    addBox(scene, new THREE.BoxGeometry(width * 0.48, 0.12, depth * 0.3), makeMaterial('#745238', 0.5, 'wood'), new THREE.Vector3(center.x, y + 0.12, center.z), 'dining table');
    [-0.28, 0.28].forEach(offset => {
      addBox(scene, new THREE.BoxGeometry(width * 0.12, 0.22, depth * 0.12), material, new THREE.Vector3(center.x + width * offset, y + 0.11, center.z - depth * 0.28), 'dining chair');
      addBox(scene, new THREE.BoxGeometry(width * 0.12, 0.22, depth * 0.12), material, new THREE.Vector3(center.x + width * offset, y + 0.11, center.z + depth * 0.28), 'dining chair');
    });
  }

  if (room.type === 'kitchen' || room.type === 'utility') {
    addBox(scene, new THREE.BoxGeometry(width * 0.82, 0.42, depth * 0.18), material, new THREE.Vector3(center.x, y + 0.21, center.z - depth * 0.36), 'kitchen counter');
    addBox(scene, new THREE.BoxGeometry(width * 0.28, 0.04, depth * 0.15), makeMaterial('#dbeafe', 0.18), new THREE.Vector3(center.x + width * 0.24, y + 0.45, center.z - depth * 0.36), 'counter top', false);
  }

  if (room.type === 'bath') {
    addBox(scene, new THREE.BoxGeometry(width * 0.28, 0.35, depth * 0.24), makeMaterial('#f8fafc', 0.28, 'stone'), new THREE.Vector3(center.x - width * 0.25, y + 0.17, center.z - depth * 0.25), 'wc');
    addBox(scene, new THREE.BoxGeometry(width * 0.44, 0.16, depth * 0.22), makeMaterial('#e0f2fe', 0.2), new THREE.Vector3(center.x + width * 0.16, y + 0.12, center.z + depth * 0.22), 'vanity');
  }

  if (room.type === 'stair') {
    for (let i = 0; i < 7; i += 1) {
      addBox(scene, new THREE.BoxGeometry(width * 0.76, 0.08 + i * 0.03, depth / 8), material, new THREE.Vector3(center.x, y + i * 0.05, center.z - depth * 0.35 + i * (depth / 9)), 'stair tread');
    }
  }
}

function buildHouseScene(scene: THREE.Scene, layout: Map2DLayout) {
  const textureCache = new Map<string, THREE.Material>();
  const materialFor = (key: string, color: string, roughness: number, kind?: 'floor' | 'wall' | 'wood' | 'stone') => {
    const cacheKey = `${key}-${color}-${kind ?? 'plain'}`;
    if (!textureCache.has(cacheKey)) textureCache.set(cacheKey, makeMaterial(color, roughness, kind));
    return textureCache.get(cacheKey)!;
  };

  const shellMaterial = materialFor('exterior-wall', '#e8ded0', 0.5, 'wall');
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: '#f8fafc',
    roughness: 0.42,
    metalness: 0.02,
    transparent: true,
    opacity: 0.18,
  });
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: '#bdefff',
    roughness: 0.05,
    metalness: 0,
    transmission: 0.2,
    transparent: true,
    opacity: 0.42,
  });

  layout.rooms.forEach(room => {
    const tone = roomTones[room.type];
    const center = roomCenter(room, layout);
    const width = room.width * feetToWorld;
    const depth = room.height * feetToWorld;
    const floorMaterial = materialFor(`${room.type}-floor`, tone.floor, tone.roughness, room.type === 'bedroom' ? 'wood' : 'floor');
    const wallMaterial = materialFor(`${room.type}-wall`, tone.wall, 0.55, 'wall');
    const furnitureMaterial = materialFor(`${room.type}-furniture`, tone.furniture, 0.48, room.type === 'living' || room.type === 'dining' || room.type === 'bedroom' ? 'wood' : undefined);

    addBox(scene, new THREE.BoxGeometry(width, slabThickness * feetToWorld, depth), floorMaterial, new THREE.Vector3(center.x, 0, center.z), `${room.label} floor`, false);
    addWallSet(scene, room, layout, wallMaterial);
    addRoomFurniture(scene, room, layout, furnitureMaterial);

    if (room.type !== 'bath' && room.type !== 'store') {
      addBox(scene, new THREE.BoxGeometry(width * 0.24, 0.42, 0.04), glassMaterial, new THREE.Vector3(center.x, wallHeight * feetToWorld * 0.55, center.z - depth / 2 - 0.03), `${room.label} window`, false);
    }
  });

  const plotW = layout.plot.width * feetToWorld;
  const plotD = layout.plot.length * feetToWorld;
  addBox(scene, new THREE.BoxGeometry(plotW + 2.8, 0.08, plotD + 2.8), materialFor('site', '#4f5f4c', 0.82, 'floor'), new THREE.Vector3(0, -0.08, 0), 'site slab', false);
  addBox(scene, new THREE.BoxGeometry(plotW + 0.75, 0.16, 0.4), shellMaterial, new THREE.Vector3(0, wallHeight * feetToWorld + 0.12, -plotD / 2), 'front lintel');
  addBox(scene, new THREE.BoxGeometry(plotW + 0.75, 0.16, 0.4), shellMaterial, new THREE.Vector3(0, wallHeight * feetToWorld + 0.12, plotD / 2), 'rear lintel');
  addBox(scene, new THREE.BoxGeometry(plotW + 0.75, 0.08, plotD + 0.75), ceilingMaterial, new THREE.Vector3(0, wallHeight * feetToWorld + 0.2, 0), 'soft ceiling', false);

  const entryDoor = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 2.15, 0.08),
    materialFor('main-door', '#6b3f27', 0.44, 'wood')
  );
  entryDoor.position.set(0, 1.1, -plotD / 2 - 0.1);
  entryDoor.name = 'main entrance';
  entryDoor.castShadow = true;
  scene.add(entryDoor);
}

function getInitialCamera(layout: Map2DLayout) {
  const startRoom = layout.rooms.find(room => room.type === 'living') ?? layout.rooms[0];
  const center = roomCenter(startRoom, layout);
  return new THREE.Vector3(
    center.x + startRoom.width * feetToWorld * 0.28,
    1.55,
    center.z + startRoom.height * feetToWorld * 0.3
  );
}

function getInitialTarget(layout: Map2DLayout) {
  const startRoom = layout.rooms.find(room => room.type === 'living') ?? layout.rooms[0];
  const center = roomCenter(startRoom, layout);
  return new THREE.Vector3(
    center.x - startRoom.width * feetToWorld * 0.22,
    0.72,
    center.z - startRoom.height * feetToWorld * 0.25
  );
}

export default function FutureHomeWalkthrough() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const keysRef = useRef<Record<string, boolean>>({});
  const [layout, setLayout] = useState<Map2DLayout | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string>('Living Lounge');
  const [walkMode, setWalkMode] = useState(false);
  const [previewStill, setPreviewStill] = useState<string | null>(null);

  const heroRooms = useMemo(() => layout?.rooms.filter(room => ['living', 'kitchen', 'bedroom', 'dining'].includes(room.type)).slice(0, 7) ?? [], [layout]);

  useEffect(() => {
    const raw = sessionStorage.getItem(MAP2D_STORAGE_KEY);
    const savedStill = sessionStorage.getItem(TOUR_STORAGE_KEY);
    if (savedStill) setPreviewStill(savedStill);
    if (raw) {
      try {
        setLayout(JSON.parse(raw) as Map2DLayout);
      } catch {
        setLayout(null);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!layout || !mountRef.current) return;
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#08111c');
    scene.fog = new THREE.Fog('#08111c', 24, 58);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(68, mount.clientWidth / Math.max(mount.clientHeight, 1), 0.1, 100);
    camera.position.copy(getInitialCamera(layout));
    const initialTarget = getInitialTarget(layout);
    camera.lookAt(initialTarget);
    const initialDirection = initialTarget.clone().sub(camera.position).normalize();
    yawRef.current = Math.atan2(initialDirection.x, initialDirection.z);
    pitchRef.current = Math.asin(initialDirection.y);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight('#c7e9ff', '#6f563f', 1.2);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight('#fff2d3', 3.2);
    sun.position.set(-8, 15, -10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun);
    const warmInterior = new THREE.PointLight('#ffd29a', 1.8, 22);
    warmInterior.position.set(0, 2.6, 0);
    scene.add(warmInterior);
    const eveningWindow = new THREE.RectAreaLight('#8bdcff', 3.5, 5, 3);
    eveningWindow.position.set(0, 2.6, -layout.plot.length * feetToWorld * 0.48);
    scene.add(eveningWindow);

    buildHouseScene(scene, layout);

    let previousTime = performance.now();
    let pointerDown = false;
    let previousX = 0;
    let previousY = 0;
    let frame = 0;

    const updateCameraDirection = () => {
      const direction = new THREE.Vector3(
        Math.sin(yawRef.current) * Math.cos(pitchRef.current),
        Math.sin(pitchRef.current),
        Math.cos(yawRef.current) * Math.cos(pitchRef.current)
      );
      camera.lookAt(camera.position.clone().add(direction));
    };

    const onPointerDown = (event: PointerEvent) => {
      pointerDown = true;
      previousX = event.clientX;
      previousY = event.clientY;
    };
    const onPointerUp = () => {
      pointerDown = false;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!pointerDown && !walkMode) return;
      const dx = event.clientX - previousX;
      const dy = event.clientY - previousY;
      previousX = event.clientX;
      previousY = event.clientY;
      yawRef.current -= dx * 0.004;
      pitchRef.current = Math.max(-0.7, Math.min(0.7, pitchRef.current - dy * 0.003));
      updateCameraDirection();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      keysRef.current[event.key.toLowerCase()] = true;
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keysRef.current[event.key.toLowerCase()] = false;
    };
    const onResize = () => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    };

    mount.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onResize);

    const animate = () => {
      frame = window.requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min(0.04, (now - previousTime) / 1000);
      previousTime = now;
      const speed = (keysRef.current.shift ? 4.4 : 2.4) * delta;
      const forward = new THREE.Vector3(Math.sin(yawRef.current), 0, Math.cos(yawRef.current)).normalize();
      const right = new THREE.Vector3(forward.z, 0, -forward.x).normalize();
      if (keysRef.current.w || keysRef.current.arrowup) camera.position.addScaledVector(forward, speed);
      if (keysRef.current.s || keysRef.current.arrowdown) camera.position.addScaledVector(forward, -speed);
      if (keysRef.current.a || keysRef.current.arrowleft) camera.position.addScaledVector(right, -speed);
      if (keysRef.current.d || keysRef.current.arrowright) camera.position.addScaledVector(right, speed);
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -layout.plot.width * feetToWorld * 0.52, layout.plot.width * feetToWorld * 0.52);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -layout.plot.length * feetToWorld * 0.52, layout.plot.length * feetToWorld * 0.52);
      camera.position.y = 1.55;
      updateCameraDirection();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frame);
      mount.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [layout, walkMode]);

  const visitRoom = (room: Map2DRoom) => {
    if (!cameraRef.current || !layout) return;
    const center = roomCenter(room, layout);
    cameraRef.current.position.set(center.x, 1.55, center.z);
    yawRef.current = room.type === 'living' ? Math.PI : 0;
    pitchRef.current = -0.22;
    setActiveRoom(room.label);
  };

  const captureStill = () => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) return;
    renderer.render(scene, camera);
    const url = renderer.domElement.toDataURL('image/png');
    setPreviewStill(url);
    sessionStorage.setItem(TOUR_STORAGE_KEY, url);
  };

  const downloadStill = () => {
    if (!previewStill) return;
    const link = document.createElement('a');
    link.href = previewStill;
    link.download = 'auto-nirman-future-home-preview.png';
    link.click();
  };

  if (!loaded) {
    return <div className="mx-auto max-w-4xl px-4 py-24 text-center text-slate-300">Preparing your virtual home...</div>;
  }

  if (!layout) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <div className="rounded-lg border border-white/10 bg-slate-950/80 p-8">
          <Home className="mx-auto text-cyan-200" size={34} />
          <h1 className="mt-5 text-3xl font-bold text-white">No home plan found</h1>
          <p className="mt-3 text-sm text-slate-400">Generate a 2D plan first, then open the walkable home tour from the result page.</p>
          <Link href="/dashboard/2d-map-generator" className="mt-6 inline-flex rounded-lg bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950">
            Build a plan first
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-lg border border-cyan-300/15 bg-slate-950/75 p-5 shadow-2xl shadow-cyan-950/20 sm:p-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
            <Sparkles size={14} /> Realistic home walkthrough
          </div>
          <h1 className="mt-4 max-w-5xl text-4xl font-bold tracking-normal text-white sm:text-6xl">
            Walk through your future home.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
            Built from your 2D layout with PBR-style materials, procedural assets, warm interior lighting, daylight, and a preview-still composer from the beginning.
          </p>
        </section>

        <aside className="rounded-lg border border-white/10 bg-slate-950/75 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Tour package</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {[
              [layout.input.houseType.toUpperCase(), 'Plan'],
              [`${layout.rooms.length} Zones`, 'Rooms'],
              ['PBR ready', 'Materials'],
              ['Cinematic', 'Still'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-cyan-300/10 bg-cyan-300/[0.045] p-3">
                <p className="font-bold text-white">{value}</p>
                <p className="mt-1 uppercase tracking-[0.12em] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          <Link href="/dashboard/2d-map-generator/result" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.07]">
            <ArrowLeft size={16} /> Back to 2D result
          </Link>
        </aside>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-lg border border-cyan-300/20 bg-slate-950 shadow-2xl shadow-cyan-950/20">
          <div className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.025] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                <DoorOpen size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Live walkable house</p>
                <p className="mt-1 text-xs text-slate-500">WASD / arrow keys to move, drag to look around</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setWalkMode(value => !value)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${walkMode ? 'bg-emerald-300 text-slate-950' : 'border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]'}`}
              >
                <MousePointer2 size={15} /> {walkMode ? 'Walk mode on' : 'Start walk mode'}
              </button>
              <button
                type="button"
                onClick={captureStill}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-200"
              >
                <Camera size={15} /> Compose still
              </button>
            </div>
          </div>
          <div ref={mountRef} className="h-[68vh] min-h-[520px] w-full cursor-grab active:cursor-grabbing" />
        </section>

        <aside className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-slate-950/75 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">Guided rooms</p>
                <h2 className="mt-2 text-xl font-bold text-white">{activeRoom}</h2>
              </div>
              <LocateFixed className="text-cyan-200" size={20} />
            </div>
            <div className="mt-4 space-y-2">
              {heroRooms.map(room => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => visitRoom(room)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-3 text-left text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-300/30 hover:bg-cyan-300/10"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: room.color }} />
                    {room.label}
                  </span>
                  <span className="text-slate-500">{Math.round(room.width * room.height)} sq ft</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-slate-950/75 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">AI-rendered preview still</p>
                <h2 className="mt-2 text-lg font-bold text-white">Cinematic memory frame</h2>
              </div>
              <ImageDown className="text-cyan-200" size={20} />
            </div>
            <div className="aspect-video overflow-hidden rounded-lg border border-cyan-300/15 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.22),transparent_34%),#07111f]">
              {previewStill ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewStill} alt="AI preview still" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-5 text-center">
                  <Camera className="text-cyan-200" size={28} />
                  <p className="mt-3 text-sm font-bold text-white">Compose a still from the current view</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">This slot is ready for AI image refinement while already producing a cinematic scene capture.</p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={previewStill ? downloadStill : captureStill}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-200"
            >
              {previewStill ? <ImageDown size={15} /> : <Camera size={15} />}
              {previewStill ? 'Download preview still' : 'Compose preview still'}
            </button>
          </div>

          <div className="rounded-lg border border-white/10 bg-slate-950/75 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <SunMedium size={14} className="text-amber-200" /> Visual stack
            </p>
            <div className="mt-4 grid gap-2 text-xs text-slate-400">
              {['Procedural PBR-style floor and wall textures', 'Warm interior lights plus daylight/environment lighting', 'Room-wise furniture primitives and fixtures', 'Walkable camera with guided room jumps', 'Preview still composer ready for AI image refinement'].map(item => (
                <div key={item} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">{item}</div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
