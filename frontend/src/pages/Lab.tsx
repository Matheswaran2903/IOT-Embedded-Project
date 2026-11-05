import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ExperimentView from '../components/simulator/ExperimentView';
import { EXPERIMENTS } from '../data/experiments';
import { useAppStore } from '../store/useAppStore';

export default function Lab() {
  const [params] = useSearchParams();
  const done = useAppStore((s) => s.experiments);
  const byComp = EXPERIMENTS.find((e) => e.component === params.get('c'));
  const [id, setId] = useState(byComp?.id ?? EXPERIMENTS[0].id);
  const exp = EXPERIMENTS.find((e) => e.id === id)!;
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <h1 className="text-3xl font-extrabold">Virtual Lab</h1>
      <p className="mb-4 text-slate-300">{done.length} of {EXPERIMENTS.length} experiments completed. Wire the circuit, then use the controls. All outputs are simulated.</p>
      <div className="grid gap-4 xl:grid-cols-[260px_1fr]">
        <div className="glass grid h-fit grid-cols-1 gap-1 p-2 sm:grid-cols-2 xl:grid-cols-1">
          {EXPERIMENTS.map((e) => (
            <button key={e.id} onClick={() => setId(e.id)} className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${id === e.id ? 'bg-violet-600/40' : 'hover:bg-white/10'}`}>
              <span>{e.n}. {e.title}</span>{done.includes(e.id) && <span className="text-xs text-emerald-300">✓</span>}
            </button>
          ))}
        </div>
        <ExperimentView key={exp.id} exp={exp} />
      </div>
    </div>
  );
}
