import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import CanvasErrorBoundary from './CanvasErrorBoundary';

const THEME = { academy: ['#0e7490', '#22d3ee'], event: ['#9a3412', '#fb923c'], sim: ['#0b4a8f', '#61dafb'] } as const;

function Board({ v }: { v: keyof typeof THEME }) {
  const [base, glow] = THEME[v];
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.2}>
      <group rotation={[-0.5, 0.5, 0]}>
        <mesh castShadow><boxGeometry args={[3.2, 0.18, 2.2]} /><meshStandardMaterial color={base} metalness={0.3} roughness={0.45} /></mesh>
        <mesh position={[0, 0.2, 0]}><boxGeometry args={[1, 0.22, 0.7]} /><meshStandardMaterial color="#111827" metalness={0.6} roughness={0.3} /></mesh>
        {[-1.3, -0.9, -0.5, 0.5, 0.9, 1.3].map(x => <mesh key={x} position={[x, 0.2, -0.95]}><boxGeometry args={[0.12, 0.2, 0.12]} /><meshStandardMaterial color="#facc15" metalness={0.8} roughness={0.2} /></mesh>)}
        <mesh position={[1.1, 0.3, 0.55]}><sphereGeometry args={[0.18, 24, 24]} /><meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={2} /></mesh>
        <mesh position={[-1.1, 0.3, 0.55]}><cylinderGeometry args={[0.2, 0.2, 0.3, 24]} /><meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} /></mesh>
      </group>
    </Float>
  );
}

/** 3D rotating IoT board for page heroes. Falls back to an emoji if WebGL is unavailable. */
export default function Hero3D({ variant, emoji }: { variant: keyof typeof THEME; emoji: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="grid h-full place-items-center text-7xl">{emoji}</div>;
  return (
    <CanvasErrorBoundary onError={() => setFailed(true)}>
      <Canvas camera={{ position: [0, 1.5, 5], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.8} /><directionalLight position={[3, 5, 4]} intensity={1.6} /><pointLight position={[-3, 2, 2]} intensity={8} color={THEME[variant][1]} />
        <Board v={variant} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
      </Canvas>
    </CanvasErrorBoundary>
  );
}
