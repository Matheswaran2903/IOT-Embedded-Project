import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { X, Rotate3D } from 'lucide-react';
import { KIND_LABEL, getComponent } from '../../data/kitComponents';
import type { ComponentId } from '../../types';
import { MODELS } from './models';
import CanvasErrorBoundary from './CanvasErrorBoundary';
import LessonPanel from '../learning/LessonPanel';

/** Enlarged component view paired with its complete learning details. */
export default function ComponentInspector({ id, onClose }: { id: ComponentId; onClose: () => void }) {
  const comp = getComponent(id)!;
  const Model = MODELS[id];
  const scale = 3.6 / Math.max(comp.size[0], comp.size[2]);
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="glass relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden"
        initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}>
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-3 pr-16">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-violet-300">{KIND_LABEL[comp.kind]}</p><h2 className="text-xl font-extrabold sm:text-2xl">{comp.name}</h2></div>
          <button aria-label="Close component details" className="btn-ghost absolute right-3 top-3 !p-2" onClick={onClose}><X size={18} /></button>
        </header>
        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="flex min-h-[300px] flex-col border-b border-white/10 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2 px-4 pt-3 text-sm font-semibold text-sky-200"><Rotate3D size={16} /> Component view</div>
            <div className="relative min-h-[300px] flex-1 sm:min-h-[420px]">
              <CanvasErrorBoundary>
                <Canvas dpr={[1, 2]} camera={{ position: [0, 3.2, 4.2], fov: 40 }}>
                  <color attach="background" args={['#0d0826']} />
                  <ambientLight intensity={0.9} />
                  <hemisphereLight args={['#9ee7fe', '#0a2540', 0.6]} />
                  <directionalLight position={[4, 8, 5]} intensity={1.7} />
                  <directionalLight position={[-5, 4, -4]} intensity={0.6} color="#93c5fd" />
                  <group scale={scale} position={[0, -0.4, 0]}><Model /></group>
                  <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[3.2, 48]} /><meshStandardMaterial color="#5e1a58" /></mesh>
                  <OrbitControls enableDamping autoRotate autoRotateSpeed={1.5} minDistance={2} maxDistance={10} />
                </Canvas>
              </CanvasErrorBoundary>
              <p className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-black/50 px-3 py-1.5 text-xs text-slate-300">Drag to rotate · scroll to zoom</p>
            </div>
            <p className="px-4 pb-4 text-sm text-slate-300">{comp.summary}</p>
          </section>
          <section className="min-w-0 p-3 sm:p-4">
            <LessonPanel id={id} showLink={false} />
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}
