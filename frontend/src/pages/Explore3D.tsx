import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Layers, Loader2, RotateCcw, Tag, Orbit, Maximize2, Minimize2, Search, type LucideIcon } from 'lucide-react';
import LessonPanel from '../components/learning/LessonPanel';
import KitScene, { HOME_GOAL, focusGoal, type CamGoal } from '../components/three/KitScene';
import ComponentInspector from '../components/three/ComponentInspector';
import CanvasErrorBoundary from '../components/three/CanvasErrorBoundary';
import { KIT_COMPONENTS, getComponent } from '../data/kitComponents';
import { useAppStore } from '../store/useAppStore';
import type { ComponentId } from '../types';

function Tool({ on, onClick, icon: I, text }: { on?: boolean; onClick: () => void; icon: LucideIcon; text: string }) {
  return (
    <button onClick={onClick} className={`btn !px-3 !py-1.5 ${on ? 'bg-sky-500 text-white' : 'bg-lab-900/80 border border-white/10 text-slate-200 hover:bg-white/10'}`}><I size={15} />{text}</button>
  );
}

export default function Explore3D() {
  const [params] = useSearchParams();
  const initial = getComponent(params.get('c') ?? '')?.id ?? null;
  const [selected, setSelected] = useState<ComponentId | null>(initial);
  const [hovered, setHovered] = useState<ComponentId | null>(null);
  const [explode, setExplode] = useState(false);
  const [labels, setLabels] = useState(false);
  const [spin, setSpin] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [inspect, setInspect] = useState(false);
  const [full, setFull] = useState(false);
  const [goal, setGoal] = useState<CamGoal | null>(() => (initial ? focusGoal(getComponent(initial)!) : null));
  const box = useRef<HTMLDivElement>(null);
  const markExplored = useAppStore((s) => s.markExplored);
  const explored = useAppStore((s) => s.explored);

  const select = useCallback((id: ComponentId) => {
    setSelected(id);
    markExplored(id);
    setGoal(focusGoal(getComponent(id)!));
  }, [markExplored]);

  useEffect(() => { if (initial) markExplored(initial); }, [initial, markExplored]);
  useEffect(() => {
    const f = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', f);
    return () => document.removeEventListener('fullscreenchange', f);
  }, []);

  const reset = () => { setSelected(null); setExplode(false); setGoal(HOME_GOAL()); };
  const toggleFull = () => { if (document.fullscreenElement) document.exitFullscreen(); else box.current?.requestFullscreen?.().catch(() => undefined); };

  return (
    <div className="mx-auto grid max-w-[1500px] gap-4 px-4 py-4 lg:grid-cols-[1fr_340px]">
      <div ref={box} className="relative h-[68vh] min-h-[420px] overflow-hidden rounded-2xl border border-white/10 bg-lab-950 lg:h-[calc(100vh-110px)]">
        <CanvasErrorBoundary onError={() => setFailed(true)}>
          <KitScene selected={selected} hovered={hovered} onSelect={select} onHover={setHovered} onBackground={() => setSelected(null)}
            explode={explode} labels={labels} autoRotate={spin} goal={goal} onReady={() => setReady(true)} />
        </CanvasErrorBoundary>
        {!ready && !failed && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-lab-950">
            <div className="flex items-center gap-3 text-slate-300"><Loader2 className="animate-spin" /> Loading 3D kit…</div>
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Tool onClick={reset} icon={RotateCcw} text="Reset view" />
          <Tool on={explode} onClick={() => setExplode((v) => !v)} icon={Layers} text="Exploded view" />
          <Tool on={labels} onClick={() => setLabels((v) => !v)} icon={Tag} text="Labels" />
          <Tool on={spin} onClick={() => setSpin((v) => !v)} icon={Orbit} text="Auto-rotate" />
          <Tool onClick={toggleFull} icon={full ? Minimize2 : Maximize2} text={full ? 'Exit fullscreen' : 'Fullscreen'} />
        </div>
        <p className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-lab-950/70 px-3 py-1.5 text-xs text-slate-300">
          Drag to rotate · scroll or pinch to zoom · right-drag to move · click a part to focus
        </p>
      </div>

      <aside className="flex max-h-[calc(100vh-110px)] flex-col gap-3 overflow-hidden lg:min-h-0">
        <div className="min-h-0 overflow-y-auto">
          {selected ? (
            <LessonPanel id={selected} onInspect={() => setInspect(true)} showLink={false} />
          ) : (
            <div className="glass flex items-center gap-3 p-4 text-sm text-slate-300">
              <Search className="shrink-0 text-violet-300" size={20} /> Click any part on the board, or pick one from the list.
            </div>
          )}
        </div>
        <div className="glass max-h-52 shrink-0 overflow-y-auto p-2">
          <p className="px-2 pb-1 pt-1 text-xs text-slate-400">{explored.length} of {KIT_COMPONENTS.length} explored</p>
          {KIT_COMPONENTS.map((c) => (
            <button key={c.id} onClick={() => select(c.id)} onMouseEnter={() => setHovered(c.id)} onMouseLeave={() => setHovered(null)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${selected === c.id ? 'bg-violet-600/40' : 'hover:bg-white/10'}`}>
              <span>{c.name}</span>
              {explored.includes(c.id) && <span className="text-xs text-emerald-300">✓</span>}
            </button>
          ))}
        </div>
      </aside>

      <AnimatePresence>{inspect && selected && <ComponentInspector id={selected} onClose={() => setInspect(false)} />}</AnimatePresence>
    </div>
  );
}
