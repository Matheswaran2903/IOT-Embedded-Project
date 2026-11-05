import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Billboard, Float, Sparkles, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import CanvasErrorBoundary from './CanvasErrorBoundary';

const ORBIT = [
  { f: 'dht11', c: '#2de2e6' }, { f: 'relay', c: '#ff9f6b' }, { f: 'lcd', c: '#a78bfa' }, { f: 'servo', c: '#ffd23f' },
  { f: 'esp8266', c: '#61dafb' }, { f: 'soil', c: '#6ee7a8' }, { f: 'leds', c: '#ff6b81' }, { f: 'hc05', c: '#f9a8d4' },
];

/** One component picture on a round "sticker" that always faces the camera. */
function PartSprite({ file, color, angle, radius, y }: { file: string; color: string; angle: number; radius: number; y: number }) {
  const tex = useTexture(`/components/${file}.png`);
  const img = tex.image as { width: number; height: number };
  const k = 1.25 / Math.max(img.width, img.height);
  return (
    <Float speed={2} floatIntensity={0.7} rotationIntensity={0}>
      <Billboard position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}>
        <mesh position={[0, 0, -0.04]}><circleGeometry args={[0.92, 48]} /><meshBasicMaterial color={color} /></mesh>
        <mesh position={[0, 0, -0.02]}><circleGeometry args={[0.8, 48]} /><meshBasicMaterial color="#ffffff" /></mesh>
        <mesh><planeGeometry args={[img.width * k, img.height * k]} /><meshBasicMaterial map={tex} transparent /></mesh>
      </Billboard>
    </Float>
  );
}

function Orbit() {
  const g = useRef<THREE.Group>(null!);
  useFrame((_, dt) => { g.current.rotation.y += dt * 0.24; });
  return (
    <group rotation={[0.32, 0, 0]}>
      <group ref={g}>
        {ORBIT.map((p, i) => <PartSprite key={p.f} file={p.f} color={p.c} angle={(i / ORBIT.length) * Math.PI * 2} radius={3.7} y={Math.sin(i * 1.9) * 0.5} />)}
      </group>
    </group>
  );
}

/** A friendly Arduino-style board built from simple 3D shapes. It leans toward the mouse. */
function Board() {
  const g = useRef<THREE.Group>(null!);
  const led = useRef<THREE.MeshStandardMaterial>(null!);
  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime;
    g.current.rotation.y = THREE.MathUtils.lerp(g.current.rotation.y, -0.45 + pointer.x * 0.7 + Math.sin(t * 0.5) * 0.12, 0.06);
    g.current.rotation.x = THREE.MathUtils.lerp(g.current.rotation.x, 0.5 - pointer.y * 0.35, 0.06);
    led.current.emissiveIntensity = 1.4 + Math.sin(t * 4) * 1.1;
  });
  return (
    <Float speed={1.6} floatIntensity={0.6} rotationIntensity={0.1}>
      <group ref={g} scale={0.9}>
        <mesh><boxGeometry args={[3.8, 0.14, 2.6]} /><meshStandardMaterial color="#0b8f93" roughness={0.45} metalness={0.15} /></mesh>
        <mesh position={[0.55, 0.15, 0.1]}><boxGeometry args={[1.4, 0.18, 0.5]} /><meshStandardMaterial color="#151a28" roughness={0.35} metalness={0.5} /></mesh>
        <mesh position={[-1.55, 0.3, -0.6]}><boxGeometry args={[0.85, 0.46, 0.7]} /><meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.25} /></mesh>
        <mesh position={[-1.6, 0.27, 0.65]}><boxGeometry args={[0.65, 0.4, 0.55]} /><meshStandardMaterial color="#111827" roughness={0.5} /></mesh>
        {[-1, 1].map((z) => <mesh key={z} position={[0.35, 0.18, z * 1.12]}><boxGeometry args={[2.7, 0.22, 0.15]} /><meshStandardMaterial color="#111827" roughness={0.5} /></mesh>)}
        {[-1, -0.6, -0.2, 0.2, 0.6, 1, 1.4].map((x) => <mesh key={x} position={[x + 0.35, 0.33, -1.12]}><boxGeometry args={[0.08, 0.1, 0.08]} /><meshStandardMaterial color="#facc15" metalness={0.9} roughness={0.2} /></mesh>)}
        <mesh position={[-0.95, 0.16, -0.75]}><cylinderGeometry args={[0.16, 0.16, 0.14, 24]} /><meshStandardMaterial color="#ef4444" roughness={0.4} /></mesh>
        <mesh position={[1.45, 0.16, 0.55]}><sphereGeometry args={[0.13, 20, 20]} /><meshStandardMaterial ref={led} color="#fde047" emissive="#fde047" emissiveIntensity={1.5} /></mesh>
        <mesh position={[1.45, 0.16, 0.2]}><sphereGeometry args={[0.1, 20, 20]} /><meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.6} /></mesh>
        {[-0.2, 0.15].map((x) => <mesh key={x} position={[x, 0.22, 0.75]}><cylinderGeometry args={[0.12, 0.12, 0.28, 20]} /><meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} /></mesh>)}
      </group>
    </Float>
  );
}

function GlowRings() {
  const r = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => { r.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 1.5) * 0.03); });
  return (
    <group ref={r} position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh><ringGeometry args={[3.2, 3.3, 80]} /><meshBasicMaterial color="#2de2e6" transparent opacity={0.55} /></mesh>
      <mesh><ringGeometry args={[4.4, 4.46, 80]} /><meshBasicMaterial color="#a78bfa" transparent opacity={0.35} /></mesh>
    </group>
  );
}

/** Home-page hero: a 3D board surrounded by orbiting component pictures. Falls back to a plain picture if WebGL is unavailable. */
export default function HeroScene() {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="grid h-full place-items-center"><img src="/components/arduino-uno.png" alt="Arduino Uno board" className="hero-fallback" /></div>;
  return (
    <CanvasErrorBoundary onError={() => setFailed(true)}>
      <Canvas camera={{ position: [0, 1.6, 10.5], fov: 38 }} dpr={[1, 1.75]}>
        <ambientLight intensity={0.95} />
        <directionalLight position={[4, 6, 5]} intensity={1.9} />
        <pointLight position={[-5, 2, 3]} intensity={14} color="#2de2e6" />
        <pointLight position={[5, -1, 2]} intensity={10} color="#ff6b81" />
        <Suspense fallback={null}>
          <Board />
          <Orbit />
        </Suspense>
        <GlowRings />
        <Sparkles count={60} scale={[12, 7, 8]} size={4} speed={0.5} color="#9be7ff" />
      </Canvas>
    </CanvasErrorBoundary>
  );
}
