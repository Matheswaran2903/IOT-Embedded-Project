import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Edges, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { KIT_COMPONENTS } from '../../data/kitComponents';
import { BOARD_TOP } from '../../utils/coords';
import type { ComponentId, KitComponent } from '../../types';
import BoardBase from './BoardBase';
import { MODELS } from './models';

export interface CamGoal { pos: THREE.Vector3; look: THREE.Vector3; key: number }

export const HOME_GOAL = (): CamGoal => ({ pos: new THREE.Vector3(0, 13.5, 10.5), look: new THREE.Vector3(0, 0, 0), key: Date.now() });

export const focusGoal = (c: KitComponent): CamGoal => {
  const look = new THREE.Vector3(c.position[0], 0.15, c.position[1]);
  const d = Math.max(c.size[0], c.size[2]) * 1.3 + 2.6;
  return { pos: look.clone().add(new THREE.Vector3(0, d * 0.85, d * 0.6)), look, key: Date.now() };
};

function CameraRig({ goal }: { goal: CamGoal | null }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as (THREE.EventDispatcher & { target: THREE.Vector3; update: () => void }) | null;
  const anim = useRef(false);
  useEffect(() => { if (goal) anim.current = true; }, [goal]);
  useEffect(() => {
    if (!controls) return;
    const stop = () => { anim.current = false; };
    controls.addEventListener('start' as never, stop);
    return () => controls.removeEventListener('start' as never, stop);
  }, [controls]);
  useFrame((_, dt) => {
    if (!anim.current || !goal || !controls) return;
    const k = 1 - Math.pow(0.0008, dt);
    camera.position.lerp(goal.pos, k);
    controls.target.lerp(goal.look, k);
    controls.update();
    if (camera.position.distanceTo(goal.pos) < 0.03 && controls.target.distanceTo(goal.look) < 0.03) anim.current = false;
  });
  return null;
}

interface PartProps {
  comp: KitComponent; index: number; selected: boolean; hovered: boolean; explode: boolean; labels: boolean;
  onSelect: (id: ComponentId) => void; onHover: (id: ComponentId | null) => void;
}

function KitPart({ comp, index, selected, hovered, explode, labels, onSelect, onHover }: PartProps) {
  const ref = useRef<THREE.Group>(null!);
  const cur = useRef(0);
  const Model = MODELS[comp.id];
  const lift = 0.9 + (index % 5) * 0.5;
  useFrame((_, dt) => {
    const target = explode ? 1 : 0;
    cur.current += (target - cur.current) * Math.min(1, dt * 4);
    const e = cur.current;
    ref.current.position.set(comp.position[0] * (1 + 0.14 * e), BOARD_TOP + lift * e, comp.position[1] * (1 + 0.14 * e));
  });
  const active = selected || hovered;
  return (
    <group
      ref={ref}
      onPointerOver={(e) => { e.stopPropagation(); onHover(comp.id); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { onHover(null); document.body.style.cursor = 'auto'; }}
      onClick={(e) => { e.stopPropagation(); onSelect(comp.id); }}
    >
      <Model />
      <mesh position={[0, comp.size[1] / 2, 0]}>
        <boxGeometry args={comp.size} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={selected ? 0.22 : hovered ? 0.14 : 0} depthWrite={false} />
        {active && <Edges color={selected ? '#e0f2fe' : '#7dd3fc'} />}
      </mesh>
      {(labels || active) && (
        <Html position={[0, comp.size[1] + 0.4, 0]} center distanceFactor={11} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className={`kit-label ${selected ? 'kit-label-active' : ''}`}>{comp.name}</div>
        </Html>
      )}
    </group>
  );
}

export interface KitSceneProps {
  selected: ComponentId | null; hovered: ComponentId | null;
  onSelect: (id: ComponentId) => void; onHover: (id: ComponentId | null) => void; onBackground: () => void;
  explode: boolean; labels: boolean; autoRotate: boolean; goal: CamGoal | null; onReady: () => void;
}

export default function KitScene(p: KitSceneProps) {
  const initial = useMemo(() => ({ position: [0, 13.5, 10.5] as [number, number, number], fov: 45, near: 0.1, far: 120 }), []);
  return (
    <Canvas dpr={[1, 2]} camera={initial} onCreated={p.onReady} onPointerMissed={p.onBackground} gl={{ antialias: true }}>
      <color attach="background" args={['#06182e']} />
      <fog attach="fog" args={['#06182e', 28, 60]} />
      <ambientLight intensity={0.75} />
      <hemisphereLight args={['#9ee7fe', '#0a2540', 0.6]} />
      <directionalLight position={[6, 14, 8]} intensity={1.6} />
      <directionalLight position={[-8, 8, -6]} intensity={0.6} color="#93c5fd" />
      <Suspense fallback={null}>
        <BoardBase />
        {KIT_COMPONENTS.map((c, i) => (
          <KitPart key={c.id} comp={c} index={i} selected={p.selected === c.id} hovered={p.hovered === c.id}
            explode={p.explode} labels={p.labels} onSelect={p.onSelect} onHover={p.onHover} />
        ))}
      </Suspense>
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={2} maxDistance={26}
        maxPolarAngle={Math.PI / 2.05} autoRotate={p.autoRotate} autoRotateSpeed={1.2} />
      <CameraRig goal={p.goal} />
    </Canvas>
  );
}
