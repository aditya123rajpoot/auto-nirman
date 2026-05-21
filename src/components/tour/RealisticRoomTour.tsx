'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { ArrowLeft, Camera, DoorOpen, Move3D, Sparkles } from 'lucide-react';
import { MAP2D_STORAGE_KEY } from '@/components/Map2DGenerator';
import { interiorTierList, interiorTiers, type InteriorTier, type InteriorTierId } from '@/data/interiorTiers';
import type { Map2DLayout } from '@/types/map2d';
import MaterialBreakdown from './MaterialBreakdown';
import RoomCostPanel, { type TourRoom } from './RoomCostPanel';
import TierSelector from './TierSelector';

const feetToWorld = 0.34;
const roomHeight = 9.5 * feetToWorld;
const wallThickness = 0.22;

const sampleRooms: TourRoom[] = [
  { id: 'living', name: 'Living Room', type: 'living', width: 15, length: 13, areaSqFt: 195 },
  { id: 'bedroom', name: 'Bedroom', type: 'bedroom', width: 12, length: 12, areaSqFt: 144 },
  { id: 'kitchen', name: 'Kitchen', type: 'kitchen', width: 10, length: 9, areaSqFt: 90 },
  { id: 'bathroom', name: 'Bathroom', type: 'bathroom', width: 7, length: 8, areaSqFt: 56 },
];

function roomWorldSize(room: TourRoom) {
  return {
    width: Math.max(3.8, Math.min(6.2, room.width * feetToWorld)),
    depth: Math.max(3.2, Math.min(5.4, room.length * feetToWorld)),
  };
}

function formatINR(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function roomsFromLayout(layout: Map2DLayout | null): TourRoom[] {
  if (!layout) return sampleRooms;
  const picked = [
    layout.rooms.find(room => room.type === 'living') ?? layout.rooms.find(room => room.type === 'dining'),
    layout.rooms.find(room => room.type === 'bedroom'),
    layout.rooms.find(room => room.type === 'kitchen'),
    layout.rooms.find(room => room.type === 'bath'),
  ].filter(Boolean);

  if (picked.length < 4) return sampleRooms;

  return picked.slice(0, 4).map(room => {
    const type = room!.type === 'bath' ? 'bathroom' : room!.type === 'kitchen' ? 'kitchen' : room!.type === 'bedroom' ? 'bedroom' : 'living';
    const area = room!.areaSqft ?? room!.width * room!.height;
    return {
      id: room!.id,
      name: type === 'living' ? 'Living Room' : type === 'bathroom' ? 'Bathroom' : room!.label,
      type,
      width: Number(room!.width.toFixed(1)),
      length: Number(room!.height.toFixed(1)),
      areaSqFt: Math.max(36, Math.round(area)),
    };
  });
}

function makeTexture(base: string, accent: string, kind: 'marble' | 'wood' | 'fabric' | 'paint') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);

  if (kind === 'wood') {
    for (let i = 0; i < 80; i += 1) {
      ctx.globalAlpha = 0.08 + (i % 4) * 0.02;
      ctx.strokeStyle = i % 2 ? '#ffffff' : accent;
      ctx.lineWidth = 1 + (i % 3);
      const y = (i * 19) % 512;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(120, y + 16, 250, y - 18, 512, y + 10);
      ctx.stroke();
    }
  } else if (kind === 'marble') {
    for (let i = 0; i < 95; i += 1) {
      ctx.globalAlpha = 0.05 + (i % 5) * 0.018;
      ctx.strokeStyle = i % 3 ? '#ffffff' : accent;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      const x = (i * 37) % 512;
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + 80, 140, x - 90, 300, x + 130, 512);
      ctx.stroke();
    }
  } else if (kind === 'fabric') {
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = '#ffffff';
    for (let i = 0; i < 512; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
  } else {
    for (let i = 0; i < 1500; i += 1) {
      ctx.globalAlpha = 0.025;
      ctx.fillStyle = i % 2 ? '#ffffff' : accent;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(kind === 'paint' ? 2 : 3, kind === 'paint' ? 2 : 3);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function material(params: {
  color: string;
  roughness: number;
  metalness?: number;
  kind?: 'marble' | 'wood' | 'fabric' | 'paint';
  accent?: string;
  physical?: boolean;
}) {
  const map = params.kind ? makeTexture(params.color, params.accent ?? '#ffffff', params.kind) : null;
  const common: THREE.MeshStandardMaterialParameters & THREE.MeshPhysicalMaterialParameters = {
    color: params.color,
    roughness: params.roughness,
    metalness: params.metalness ?? 0,
  };
  if (map) common.map = map;
  if (params.physical) {
    return new THREE.MeshPhysicalMaterial({
      ...common,
      clearcoat: 0.35,
      clearcoatRoughness: 0.2,
      reflectivity: 0.45,
    });
  }
  return new THREE.MeshStandardMaterial(common);
}

function addBox(scene: THREE.Scene, geometry: THREE.BoxGeometry, mat: THREE.Material, position: THREE.Vector3, name: string) {
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.copy(position);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function addCylinder(
  scene: THREE.Scene,
  radiusTop: number,
  radiusBottom: number,
  height: number,
  mat: THREE.Material,
  position: THREE.Vector3,
  name: string,
  segments = 32
) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), mat);
  mesh.position.copy(position);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function addSphere(scene: THREE.Scene, radius: number, mat: THREE.Material, position: THREE.Vector3, name: string, scale = new THREE.Vector3(1, 1, 1)) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 18), mat);
  mesh.position.copy(position);
  mesh.scale.copy(scale);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function addPlant(scene: THREE.Scene, x: number, z: number, scale: number) {
  const pot = material({ color: '#8b4a2f', roughness: 0.62, kind: 'marble', accent: '#f97316' });
  const leaf = material({ color: '#1f7a4d', roughness: 0.76, kind: 'paint', accent: '#86efac' });
  addCylinder(scene, 0.14 * scale, 0.18 * scale, 0.34 * scale, pot, new THREE.Vector3(x, 0.25 * scale, z), 'ceramic planter');
  for (let i = 0; i < 7; i += 1) {
    const angle = (Math.PI * 2 * i) / 7;
    addSphere(
      scene,
      0.16 * scale,
      leaf,
      new THREE.Vector3(x + Math.cos(angle) * 0.12 * scale, 0.55 * scale + (i % 3) * 0.06 * scale, z + Math.sin(angle) * 0.1 * scale),
      'broad leaf plant',
      new THREE.Vector3(0.8, 1.65, 0.32)
    ).rotation.z = angle * 0.28;
  }
}

function addWarmLamp(scene: THREE.Scene, x: number, z: number, tier: InteriorTier) {
  const brass = material({ color: tier.renderStyle.metalColor, roughness: 0.24, metalness: 0.72, physical: true });
  const shade = new THREE.MeshStandardMaterial({
    color: '#fff3cd',
    emissive: '#ffcf75',
    emissiveIntensity: 0.45,
    roughness: 0.35,
  });
  addCylinder(scene, 0.025, 0.025, 0.72, brass, new THREE.Vector3(x, 0.68, z), 'floor lamp stand');
  addCylinder(scene, 0.2, 0.28, 0.28, shade, new THREE.Vector3(x, 1.16, z), 'warm fabric lamp shade');
  const light = new THREE.PointLight('#ffd89a', 0.8 * tier.renderStyle.lightIntensity, 3.5);
  light.position.set(x, 1.2, z);
  scene.add(light);
}

function addWallArt(scene: THREE.Scene, x: number, y: number, z: number, tier: InteriorTier, label = 'framed landscape art') {
  const frame = material({ color: tier.renderStyle.woodColor, roughness: 0.42, kind: 'wood', accent: tier.renderStyle.accentColor, physical: tier.id !== 'basic' });
  const art = new THREE.MeshStandardMaterial({
    color: '#f59e0b',
    emissive: '#7c2d12',
    emissiveIntensity: 0.08,
    roughness: 0.38,
  });
  addBox(scene, new THREE.BoxGeometry(0.9, 0.62, 0.05), frame, new THREE.Vector3(x, y, z), `${label} frame`);
  addBox(scene, new THREE.BoxGeometry(0.74, 0.46, 0.055), art, new THREE.Vector3(x, y, z + 0.01), label);
}

function addRoomShell(scene: THREE.Scene, room: TourRoom, tier: InteriorTier, offset: { x: number; z: number }) {
  const { width: w, depth: d } = roomWorldSize(room);
  const s = tier.renderStyle;
  const floorMat = material({
    color: room.type === 'living' && tier.id !== 'basic' && tier.id !== 'standard' ? s.woodColor : s.floorColor,
    roughness: s.roughness,
    metalness: s.metalness * 0.35,
    kind: tier.id === 'basic' || tier.id === 'standard' ? 'marble' : room.type === 'bedroom' || room.type === 'living' ? 'wood' : 'marble',
    accent: s.accentColor,
    physical: tier.id === 'luxury' || tier.id === 'super_luxury',
  });
  const wallMat = material({ color: s.wallColor, roughness: Math.min(0.78, s.roughness + 0.18), kind: 'paint', accent: s.accentColor });
  const ceilingMat = material({ color: s.ceilingColor, roughness: 0.5, kind: 'paint', accent: s.accentColor });

  addBox(scene, new THREE.BoxGeometry(w, 0.12, d), floorMat, new THREE.Vector3(offset.x, 0, offset.z), `${room.name} ${tier.name} flooring`);
  if (room.type === 'living' || room.type === 'bedroom') {
    const grooveMat = new THREE.MeshBasicMaterial({ color: '#1f140f', transparent: true, opacity: 0.18 });
    for (let i = -6; i <= 6; i += 1) {
      addBox(scene, new THREE.BoxGeometry(w, 0.006, 0.012), grooveMat, new THREE.Vector3(offset.x, 0.068, offset.z + (i / 6) * (d / 2)), `${room.name} floor plank groove`);
    }
  }
  addBox(scene, new THREE.BoxGeometry(w, 0.09, d), ceilingMat, new THREE.Vector3(offset.x, roomHeight, offset.z), `${room.name} ceiling`);
  addBox(scene, new THREE.BoxGeometry(w, roomHeight, wallThickness), wallMat, new THREE.Vector3(offset.x, roomHeight / 2, offset.z - d / 2), `${room.name} back wall`);
  addBox(scene, new THREE.BoxGeometry(wallThickness, roomHeight, d), wallMat, new THREE.Vector3(offset.x - w / 2, roomHeight / 2, offset.z), `${room.name} left wall`);
  addBox(scene, new THREE.BoxGeometry(wallThickness, roomHeight, d), wallMat, new THREE.Vector3(offset.x + w / 2, roomHeight / 2, offset.z), `${room.name} right wall`);

  const trimMat = material({ color: s.metalColor, roughness: 0.26, metalness: Math.min(0.85, s.metalness + 0.2), physical: true });
  addBox(scene, new THREE.BoxGeometry(w * 0.92, 0.035, 0.035), trimMat, new THREE.Vector3(offset.x, roomHeight - 0.24, offset.z - d / 2 + 0.07), `${room.name} cove line`);
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#dff7ff',
    roughness: 0.02,
    metalness: 0,
    transmission: 0.35,
    transparent: true,
    opacity: 0.62,
    clearcoat: 1,
  });
  const curtainMat = material({ color: room.type === 'living' ? '#d8c4aa' : '#d6d3d1', roughness: 0.82, kind: 'fabric', accent: s.accentColor });
  const windowX = room.type === 'bathroom' ? offset.x + w * 0.22 : offset.x + w * 0.18;
  const windowW = room.type === 'bathroom' ? w * 0.34 : w * 0.48;
  const viewMat = new THREE.MeshBasicMaterial({ color: '#f6c273' });
  const skyMat = new THREE.MeshBasicMaterial({ color: '#c7ebff' });
  const gardenMat = new THREE.MeshBasicMaterial({ color: '#5b8f4b' });
  addBox(scene, new THREE.BoxGeometry(windowW * 0.96, roomHeight * 0.3, 0.035), skyMat, new THREE.Vector3(windowX, roomHeight * 0.62, offset.z - d / 2 - 0.055), `${room.name} blue sky view`);
  addBox(scene, new THREE.BoxGeometry(windowW * 0.96, roomHeight * 0.16, 0.035), gardenMat, new THREE.Vector3(windowX, roomHeight * 0.42, offset.z - d / 2 - 0.055), `${room.name} garden view`);
  addSphere(scene, 0.13, viewMat, new THREE.Vector3(windowX - windowW * 0.24, roomHeight * 0.62, offset.z - d / 2 - 0.025), `${room.name} sunset glow`, new THREE.Vector3(1, 1, 0.08));
  addBox(scene, new THREE.BoxGeometry(windowW, roomHeight * 0.46, 0.045), glass, new THREE.Vector3(windowX, roomHeight * 0.56, offset.z - d / 2 - 0.035), `${room.name} tall sun window`);
  addBox(scene, new THREE.BoxGeometry(windowW + 0.18, 0.05, 0.06), trimMat, new THREE.Vector3(windowX, roomHeight * 0.82, offset.z - d / 2 - 0.02), `${room.name} window top rail`);
  addBox(scene, new THREE.BoxGeometry(0.04, roomHeight * 0.47, 0.065), trimMat, new THREE.Vector3(windowX, roomHeight * 0.56, offset.z - d / 2 - 0.015), `${room.name} window mullion`);
  addBox(scene, new THREE.BoxGeometry(windowW, 0.035, 0.065), trimMat, new THREE.Vector3(windowX, roomHeight * 0.56, offset.z - d / 2 - 0.015), `${room.name} window cross rail`);
  addBox(scene, new THREE.BoxGeometry(0.12, roomHeight * 0.56, 0.06), curtainMat, new THREE.Vector3(windowX - windowW * 0.56, roomHeight * 0.54, offset.z - d / 2 + 0.01), `${room.name} left curtain`);
  addBox(scene, new THREE.BoxGeometry(0.12, roomHeight * 0.56, 0.06), curtainMat, new THREE.Vector3(windowX + windowW * 0.56, roomHeight * 0.54, offset.z - d / 2 + 0.01), `${room.name} right curtain`);
  addBox(scene, new THREE.BoxGeometry(w * 0.28, roomHeight * 0.52, 0.04), material({ color: s.woodColor, roughness: s.roughness, kind: 'wood', accent: s.accentColor, physical: tier.id !== 'basic' }), new THREE.Vector3(offset.x - w * 0.3, roomHeight * 0.42, offset.z - d / 2 + 0.08), `${room.name} feature panel`);
  addBox(scene, new THREE.BoxGeometry(w, 0.08, 0.07), trimMat, new THREE.Vector3(offset.x, 0.22, offset.z - d / 2 + 0.08), `${room.name} skirting back`);
  addBox(scene, new THREE.BoxGeometry(0.07, 0.08, d), trimMat, new THREE.Vector3(offset.x - w / 2 + 0.08, 0.22, offset.z), `${room.name} skirting left`);
  addBox(scene, new THREE.BoxGeometry(0.07, 0.08, d), trimMat, new THREE.Vector3(offset.x + w / 2 - 0.08, 0.22, offset.z), `${room.name} skirting right`);

  const sunPatch = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 0.55, d * 0.34),
    new THREE.MeshBasicMaterial({ color: '#ffd38a', transparent: true, opacity: 0.13, depthWrite: false })
  );
  sunPatch.rotation.x = -Math.PI / 2;
  sunPatch.rotation.z = -0.24;
  sunPatch.position.set(offset.x + w * 0.1, 0.065, offset.z + d * 0.12);
  scene.add(sunPatch);
}

function addFurniture(scene: THREE.Scene, room: TourRoom, tier: InteriorTier, offset: { x: number; z: number }) {
  const { width: w, depth: d } = roomWorldSize(room);
  const s = tier.renderStyle;
  const wood = material({ color: s.woodColor, roughness: s.roughness, metalness: s.metalness, kind: 'wood', accent: s.accentColor, physical: tier.id !== 'basic' });
  const fabric = material({ color: s.fabricColor, roughness: 0.68, kind: 'fabric', accent: s.accentColor });
  const stone = material({ color: s.floorColor, roughness: Math.max(0.18, s.roughness - 0.16), metalness: s.metalness * 0.35, kind: 'marble', accent: s.accentColor, physical: true });
  const metal = material({ color: s.metalColor, roughness: 0.24, metalness: 0.78, physical: true });
  const y = 0.18;

  if (room.type === 'living') {
    const rugMat = material({ color: tier.id === 'basic' ? '#475569' : '#1f2937', roughness: 0.86, kind: 'fabric', accent: s.accentColor });
    const pillowA = material({ color: s.accentColor, roughness: 0.74, kind: 'fabric', accent: '#ffffff' });
    const pillowB = material({ color: '#f97316', roughness: 0.72, kind: 'fabric', accent: '#fff7ed' });
    const cream = material({ color: '#d8cec1', roughness: 0.64, kind: 'fabric', accent: '#ffffff' });

    addBox(scene, new THREE.BoxGeometry(w * 0.62, 0.035, d * 0.4), rugMat, new THREE.Vector3(offset.x + w * 0.06, 0.095, offset.z + d * 0.13), 'woven area rug');
    addBox(scene, new THREE.BoxGeometry(w * 0.52, 0.26, d * 0.16), cream, new THREE.Vector3(offset.x - w * 0.16, y + 0.2, offset.z - d * 0.12), 'linen sofa seat');
    addBox(scene, new THREE.BoxGeometry(w * 0.52, 0.42, 0.11), cream, new THREE.Vector3(offset.x - w * 0.16, y + 0.46, offset.z - d * 0.02), 'linen sofa back');
    addBox(scene, new THREE.BoxGeometry(0.13, 0.31, d * 0.16), cream, new THREE.Vector3(offset.x - w * 0.44, y + 0.32, offset.z - d * 0.12), 'sofa left arm');
    addBox(scene, new THREE.BoxGeometry(0.13, 0.31, d * 0.16), cream, new THREE.Vector3(offset.x + w * 0.12, y + 0.32, offset.z - d * 0.12), 'sofa right arm');
    addSphere(scene, 0.16, pillowA, new THREE.Vector3(offset.x - w * 0.29, y + 0.43, offset.z - d * 0.18), 'accent cushion', new THREE.Vector3(1.15, 0.62, 0.22));
    addSphere(scene, 0.15, pillowB, new THREE.Vector3(offset.x - w * 0.12, y + 0.43, offset.z - d * 0.18), 'warm cushion', new THREE.Vector3(1.05, 0.62, 0.22));
    addSphere(scene, 0.14, fabric, new THREE.Vector3(offset.x + w * 0.03, y + 0.42, offset.z - d * 0.18), 'dark cushion', new THREE.Vector3(1, 0.58, 0.2));

    addBox(scene, new THREE.BoxGeometry(w * 0.26, 0.12, d * 0.18), wood, new THREE.Vector3(offset.x + w * 0.03, y + 0.12, offset.z + d * 0.17), 'wood coffee table top');
    addCylinder(scene, 0.025, 0.025, 0.22, metal, new THREE.Vector3(offset.x - w * 0.08, y + 0.01, offset.z + d * 0.1), 'coffee table leg');
    addCylinder(scene, 0.025, 0.025, 0.22, metal, new THREE.Vector3(offset.x + w * 0.14, y + 0.01, offset.z + d * 0.1), 'coffee table leg');
    addCylinder(scene, 0.025, 0.025, 0.22, metal, new THREE.Vector3(offset.x - w * 0.08, y + 0.01, offset.z + d * 0.24), 'coffee table leg');
    addCylinder(scene, 0.025, 0.025, 0.22, metal, new THREE.Vector3(offset.x + w * 0.14, y + 0.01, offset.z + d * 0.24), 'coffee table leg');

    addBox(scene, new THREE.BoxGeometry(w * 0.16, 0.26, d * 0.18), fabric, new THREE.Vector3(offset.x + w * 0.35, y + 0.2, offset.z - d * 0.03), 'accent lounge chair');
    addBox(scene, new THREE.BoxGeometry(w * 0.16, 0.34, 0.1), fabric, new THREE.Vector3(offset.x + w * 0.35, y + 0.42, offset.z + d * 0.07), 'accent chair back');

    addBox(scene, new THREE.BoxGeometry(w * 0.28, 1.45, 0.12), wood, new THREE.Vector3(offset.x - w * 0.36, y + 0.78, offset.z - d * 0.43), 'built in book shelf');
    for (let i = 0; i < 12; i += 1) {
      addBox(
        scene,
        new THREE.BoxGeometry(0.05 + (i % 3) * 0.015, 0.2, 0.055),
        material({ color: i % 3 === 0 ? s.accentColor : i % 3 === 1 ? '#f97316' : '#e5e7eb', roughness: 0.58 }),
        new THREE.Vector3(offset.x - w * 0.46 + (i % 4) * 0.12, y + 0.35 + Math.floor(i / 4) * 0.34, offset.z - d * 0.35),
        'shelf book'
      );
    }
    addWallArt(scene, offset.x - w * 0.05, roomHeight * 0.54, offset.z - d / 2 + 0.12, tier);
    addWarmLamp(scene, offset.x - w * 0.46, offset.z + d * 0.16, tier);
    addPlant(scene, offset.x + w * 0.43, offset.z - d * 0.27, 1.25);
    addPlant(scene, offset.x + w * 0.28, offset.z + d * 0.34, 0.72);
  }

  if (room.type === 'bedroom') {
    addBox(scene, new THREE.BoxGeometry(w * 0.48, 0.34, d * 0.46), fabric, new THREE.Vector3(offset.x - w * 0.12, y + 0.18, offset.z + d * 0.12), 'bed base');
    addBox(scene, new THREE.BoxGeometry(w * 0.46, 0.08, d * 0.2), material({ color: '#f4eadf', roughness: 0.7, kind: 'fabric' }), new THREE.Vector3(offset.x - w * 0.12, y + 0.42, offset.z - d * 0.06), 'bedding');
    addBox(scene, new THREE.BoxGeometry(w * 0.15, 1.22, d * 0.62), wood, new THREE.Vector3(offset.x + w * 0.38, y + 0.64, offset.z), 'wardrobe');
  }

  if (room.type === 'kitchen') {
    addBox(scene, new THREE.BoxGeometry(w * 0.86, 0.46, d * 0.18), wood, new THREE.Vector3(offset.x, y + 0.24, offset.z - d * 0.36), 'kitchen base cabinets');
    addBox(scene, new THREE.BoxGeometry(w * 0.86, 0.07, d * 0.2), stone, new THREE.Vector3(offset.x, y + 0.53, offset.z - d * 0.36), 'kitchen counter');
    addBox(scene, new THREE.BoxGeometry(w * 0.32, 0.58, d * 0.06), metal, new THREE.Vector3(offset.x + w * 0.2, y + 0.92, offset.z - d * 0.45), 'premium chimney');
  }

  if (room.type === 'bathroom') {
    addBox(scene, new THREE.BoxGeometry(w * 0.42, 0.32, d * 0.2), stone, new THREE.Vector3(offset.x - w * 0.16, y + 0.22, offset.z + d * 0.16), 'vanity counter');
    addBox(scene, new THREE.BoxGeometry(w * 0.24, 0.34, d * 0.26), material({ color: '#f8fafc', roughness: 0.22, physical: true }), new THREE.Vector3(offset.x - w * 0.28, y + 0.22, offset.z - d * 0.22), 'sanitaryware');
    addBox(scene, new THREE.BoxGeometry(w * 0.36, 1.5, 0.04), material({ color: '#dbeafe', roughness: 0.03, physical: true }), new THREE.Vector3(offset.x + w * 0.24, y + 0.8, offset.z - d * 0.25), 'glass partition');
  }

  if (room.type !== 'living') {
    const decorCount = Math.round(2 + tier.renderStyle.decorDensity * 3);
    for (let i = 0; i < decorCount; i += 1) {
      const px = offset.x - w * 0.34 + ((i % 4) / 3) * w * 0.68;
      const pz = offset.z + d * 0.4;
      addBox(scene, new THREE.BoxGeometry(0.1, 0.22 + i * 0.015, 0.1), material({ color: i % 2 ? s.accentColor : s.metalColor, roughness: 0.34, metalness: s.metalness }), new THREE.Vector3(px, y + 0.14, pz), 'tier decor');
    }
  }
}

function makeEnvironment(scene: THREE.Scene, tier: InteriorTier) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const gradient = ctx.createLinearGradient(0, 0, 512, 256);
  gradient.addColorStop(0, '#dbeafe');
  gradient.addColorStop(0.48, '#f8fafc');
  gradient.addColorStop(1, tier.renderStyle.accentColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  scene.environment = texture;
}

function buildScene(scene: THREE.Scene, room: TourRoom, tier: InteriorTier) {
  scene.clear();
  scene.background = new THREE.Color('#0b0a08');
  scene.fog = new THREE.Fog('#0b0a08', 14, 34);
  makeEnvironment(scene, tier);

  const ambient = new THREE.HemisphereLight('#fff7ed', '#1f1712', 0.7);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight('#ffe0a3', 2.25 * tier.renderStyle.lightIntensity);
  sun.position.set(-5.5, 7.5, 4.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -6;
  sun.shadow.camera.right = 6;
  sun.shadow.camera.top = 6;
  sun.shadow.camera.bottom = -6;
  scene.add(sun);

  const offset = { x: 0, z: 0 };
  addRoomShell(scene, room, tier, offset);
  addFurniture(scene, room, tier, offset);
  const point = new THREE.PointLight(tier.renderStyle.accentColor, tier.renderStyle.lightIntensity * 1.1, 7);
  point.position.set(0, roomHeight - 0.7, 0.2);
  scene.add(point);
  const spot = new THREE.SpotLight('#fff2dc', tier.renderStyle.lightIntensity * 2.4, 8, Math.PI / 5, 0.5, 1.2);
  spot.position.set(0, roomHeight - 0.28, 1.2);
  spot.target.position.set(0, 0.35, -0.4);
  spot.castShadow = true;
  scene.add(spot);
  scene.add(spot.target);

  const pendantMat = new THREE.MeshStandardMaterial({
    color: '#fff4d6',
    emissive: '#ffd08a',
    emissiveIntensity: 0.38,
    roughness: 0.3,
  });
  const cordMat = material({ color: '#1f1b16', roughness: 0.42, metalness: 0.3 });
  [-0.38, 0, 0.38].forEach((x, index) => {
    addCylinder(scene, 0.012, 0.012, 0.52, cordMat, new THREE.Vector3(x, roomHeight - 0.48, -0.18 + index * 0.08), 'pendant cord', 12);
    addSphere(scene, 0.12, pendantMat, new THREE.Vector3(x, roomHeight - 0.78, -0.18 + index * 0.08), 'warm pendant globe', new THREE.Vector3(1, 0.72, 1));
  });
}

function frameRoomCamera(camera: THREE.PerspectiveCamera, room: TourRoom) {
  const { width, depth } = roomWorldSize(room);
  camera.fov = 54;
  camera.position.set(width * 0.03, 1.32, depth * 1.12);
  camera.lookAt(width * 0.02, 1.02, -depth * 0.16);
  camera.updateProjectionMatrix();
}

export default function RealisticRoomTour() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [selectedTierId, setSelectedTierId] = useState<InteriorTierId>('premium');
  const [selectedRoomId, setSelectedRoomId] = useState('living');
  const [layout, setLayout] = useState<Map2DLayout | null>(null);
  const [loaded, setLoaded] = useState(false);

  const tier = interiorTiers[selectedTierId];
  const rooms = useMemo(() => roomsFromLayout(layout), [layout]);
  const selectedRoom = rooms.find(room => room.id === selectedRoomId) ?? rooms[0];
  const totalCost = rooms.reduce((sum, room) => sum + room.areaSqFt * tier.costPerSqFt, 0);

  useEffect(() => {
    const raw = sessionStorage.getItem(MAP2D_STORAGE_KEY);
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
    if (!mountRef.current || !loaded) return;
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(54, mount.clientWidth / Math.max(mount.clientHeight, 1), 0.1, 80);
    frameRoomCamera(camera, selectedRoom);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    let frame = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let yaw = Math.PI;
    let pitch = -0.08;

    const moveCamera = () => {
      const target = new THREE.Vector3(
        camera.position.x + Math.sin(yaw) * Math.cos(pitch),
        camera.position.y + Math.sin(pitch),
        camera.position.z + Math.cos(yaw) * Math.cos(pitch)
      );
      camera.lookAt(target);
    };

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const onPointerUp = () => {
      dragging = false;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      yaw -= (event.clientX - lastX) * 0.004;
      pitch = THREE.MathUtils.clamp(pitch - (event.clientY - lastY) * 0.003, -0.55, 0.35);
      lastX = event.clientX;
      lastY = event.clientY;
      moveCamera();
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
    window.addEventListener('resize', onResize);
    moveCamera();

    const animate = () => {
      frame = window.requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frame);
      mount.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [loaded]);

  useEffect(() => {
    if (!sceneRef.current || !loaded) return;
    buildScene(sceneRef.current, selectedRoom, tier);
    if (cameraRef.current) frameRoomCamera(cameraRef.current, selectedRoom);
  }, [selectedRoom, tier, loaded]);

  const visitRoom = (room: TourRoom) => {
    const camera = cameraRef.current;
    if (!camera) return;
    setSelectedRoomId(room.id);
    frameRoomCamera(camera, room);
  };

  const downloadStill = () => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    const link = document.createElement('a');
    link.href = renderer.domElement.toDataURL('image/png');
    link.download = `auto-nirman-${tier.id}-interior-tour.png`;
    link.click();
  };

  if (!loaded) return <div className="px-4 py-24 text-center text-slate-300">Preparing realistic interior tour...</div>;

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <section className="command-header-card living-surface mb-6 rounded-lg p-5 sm:p-7">
        <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-100">
              <Sparkles size={14} /> Realistic interior tour
            </div>
            <h1 className="text-4xl font-black tracking-normal text-white sm:text-6xl">Room Tour Studio</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
              Switch interior tiers and see the material palette, furniture quality, lighting, and cost change together.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 xl:w-[520px]">
            {[
              [tier.name, 'selected tier'],
              [`Rs ${tier.costPerSqFt.toLocaleString('en-IN')}`, 'per sq ft'],
              [formatINR(totalCost), 'interior total'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                <p className="text-lg font-black text-white">{value}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="overflow-hidden rounded-lg border border-white/10 bg-[#080808] shadow-2xl shadow-black/50">
          <div className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.025] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-amber-200/20 bg-amber-200/10 text-amber-100">
                <DoorOpen size={18} />
              </div>
              <div>
                <p className="text-sm font-black text-white">Photoreal room prototype</p>
                <p className="mt-1 text-xs text-slate-500">Drag to look around. Choose a room to visit.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={downloadStill}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/[0.07]"
              >
                <Camera size={14} /> Capture still
              </button>
              <Link href="/dashboard/2d-map-generator/result" className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/[0.07]">
                <ArrowLeft size={14} /> 2D plan
              </Link>
            </div>
          </div>
          <div ref={mountRef} className="h-[68vh] min-h-[520px] w-full cursor-grab active:cursor-grabbing" />
        </section>

        <aside className="space-y-3">
          <TierSelector tiers={interiorTierList} selectedTierId={selectedTierId} onSelect={setSelectedTierId} />
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Visit room</p>
            <div className="grid grid-cols-2 gap-2">
              {rooms.map(room => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => visitRoom(room)}
                  className={`living-surface rounded-lg border p-3 text-left transition-all hover:-translate-y-0.5 ${
                    selectedRoom.id === room.id ? 'border-amber-200/50 bg-amber-200/10' : 'border-white/10 bg-black/20 hover:border-white/25'
                  }`}
                >
                  <Move3D size={14} className="mb-2 text-amber-100" />
                  <p className="text-xs font-black text-white">{room.name}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{room.areaSqFt} sq ft</p>
                </button>
              ))}
            </div>
          </div>
          <RoomCostPanel room={selectedRoom} tier={tier} totalCost={totalCost} />
          <MaterialBreakdown tier={tier} />
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Included items</p>
            <div className="flex flex-wrap gap-2">
              {tier.sampleItems.map(item => (
                <span key={item} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold text-slate-300">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
