import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { KIT_COMPONENTS, getComponent } from '../data/kitComponents';
import { useAppStore } from '../store/useAppStore';
import LessonPanel from '../components/learning/LessonPanel';
import type { ComponentId } from '../types';

export default function Learn() {
  const [params, setParams] = useSearchParams();
  const lessons = useAppStore((s) => s.lessons);
  const [sel, setSel] = useState<ComponentId>(getComponent(params.get('c') ?? '')?.id ?? 'ultrasonic');
  const pick = (id: ComponentId) => { setSel(id); setParams({ c: id }, { replace: true }); };
  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[280px_1fr]">
      <aside className="glass h-fit p-2 lg:sticky lg:top-20">
        <p className="px-2 pb-1 pt-1 text-xs text-slate-400">{lessons.length} of {KIT_COMPONENTS.length} lessons completed</p>
        <div className="grid grid-cols-2 gap-1 lg:grid-cols-1">
          {KIT_COMPONENTS.map((c, i) => (
            <button key={c.id} onClick={() => pick(c.id)} className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${sel === c.id ? 'bg-violet-600/40' : 'hover:bg-white/10'}`}>
              <span>{i + 1}. {c.name}</span>{lessons.includes(c.id) && <span className="text-xs text-emerald-300">✓</span>}
            </button>
          ))}
        </div>
      </aside>
      <AnimatePresence mode="wait"><LessonPanel key={sel} id={sel} showLink /></AnimatePresence>
    </div>
  );
}
