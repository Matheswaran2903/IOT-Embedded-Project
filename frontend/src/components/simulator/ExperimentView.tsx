import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Trash2, Plug, Wand2 } from 'lucide-react';
import { validateWiring, type Conn, type Experiment, type SimState, type Values } from '../../data/experiments';
import { useTick } from '../../hooks/useTick';
import { useAppStore } from '../../store/useAppStore';
import VisualView from './Visuals';

const initialValues = (e: Experiment): Values => Object.fromEntries(e.controls.map((c) => [c.id, c.def]));

export default function ExperimentView({ exp }: { exp: Experiment }) {
  const tick = useTick(100);
  const complete = useAppStore((s) => s.completeExperiment);
  const done = useAppStore((s) => s.experiments.includes(exp.id));
  const [conns, setConns] = useState<Conn[]>([]);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [values, setValues] = useState<Values>(() => initialValues(exp));
  const [st, setSt] = useState<SimState>({});
  const [log, setLog] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [touched, setTouched] = useState(false);

  const result = useMemo(() => validateWiring(exp, conns), [exp, conns]);
  const out = useMemo(() => exp.sim(values, tick, st, log), [exp, values, tick, st, log]);

  useEffect(() => { if (result.ok && touched && !done) complete(exp.id); }, [result.ok, touched, done, complete, exp.id]);

  const connect = () => {
    if (!a || !b || a === b) return;
    if (conns.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) return;
    setConns([...conns, [a, b]]); setChecked(true);
  };
  const setVal = (id: string, v: number | boolean | string) => { setValues((p) => ({ ...p, [id]: v })); setTouched(true); };
  const press = (id: string) => {
    setTouched(true);
    if (!result.ok || !exp.action) return;
    const r = exp.action(id, values, st);
    if (r.state) setSt(r.state);
    if (r.log) setLog((l) => [...l, ...r.log!].slice(-12));
  };
  const autoWire = () => { setConns(exp.wires.map((w) => [w.a, w.b] as Conn)); setChecked(true); };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="glass p-4">
        <h2 className="text-xl font-extrabold">{exp.n}. {exp.title}</h2>
        <p className="mb-2 text-sm text-slate-300">{exp.goal}</p>
        {done && <p className="mb-2 text-xs font-semibold text-emerald-300">✓ Experiment completed</p>}
        <ol className="mb-3 list-decimal pl-5 text-sm text-slate-300">{exp.steps.map((s) => <li key={s}>{s}</li>)}</ol>
        {exp.note && <p className="mb-3 rounded-lg bg-amber-500/10 p-2 text-xs text-amber-200">{exp.note}</p>}

        <h3 className="mb-2 mt-4 font-bold">1. Virtual wiring</h3>
        <div className="flex flex-wrap items-center gap-2">
          <select value={a} onChange={(e) => setA(e.target.value)} className="rounded-lg border border-white/10 bg-lab-900 px-2 py-1.5 text-sm" aria-label="First pin">
            <option value="">From pin…</option>{exp.pins.map((p) => <option key={p}>{p}</option>)}
          </select>
          <span>↔</span>
          <select value={b} onChange={(e) => setB(e.target.value)} className="rounded-lg border border-white/10 bg-lab-900 px-2 py-1.5 text-sm" aria-label="Second pin">
            <option value="">To pin…</option>{exp.pins.map((p) => <option key={p}>{p}</option>)}
          </select>
          <button className="btn-primary !py-1.5" onClick={connect} disabled={!a || !b || a === b}><Plug size={14} />Connect</button>
        </div>
        <div className="mt-2 flex gap-2">
          <button className="btn-ghost !py-1 text-xs" onClick={() => setChecked(true)}>Check wiring</button>
          <button className="btn-ghost !py-1 text-xs" onClick={autoWire}><Wand2 size={13} />Show correct wiring</button>
          <button className="btn-ghost !py-1 text-xs" onClick={() => { setConns([]); setChecked(false); }}>Clear</button>
        </div>
        <ul className="mt-3 space-y-1 text-sm">
          {conns.map(([x, y], i) => (
            <li key={i} className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1"><span>{x} ↔ {y}</span>
              <button aria-label="Remove wire" onClick={() => setConns(conns.filter((_, j) => j !== i))}><Trash2 size={14} className="text-slate-400 hover:text-red-300" /></button></li>
          ))}
          {conns.length === 0 && <li className="text-xs text-slate-500">No wires yet. Pick two pins and press Connect.</li>}
        </ul>
        {checked && (
          <div className="mt-3 space-y-1 text-xs">
            {result.msgs.map((m, i) => (
              <p key={i} className={`flex gap-1.5 ${m.type === 'ok' ? 'text-emerald-300' : m.type === 'warn' ? 'text-amber-300' : 'text-red-300'}`}>
                {m.type === 'ok' ? <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> : m.type === 'warn' ? <AlertTriangle size={14} className="mt-0.5 shrink-0" /> : <XCircle size={14} className="mt-0.5 shrink-0" />}{m.text}</p>
            ))}
            {result.missing.map((w) => <p key={w.a + w.b} className="flex gap-1.5 text-sky-300"><AlertTriangle size={14} className="mt-0.5 shrink-0" />Still missing: {w.a} ↔ {w.b}. {w.why}</p>)}
            {result.ok && <p className="font-bold text-emerald-300">Wiring complete. The circuit is powered (simulated).</p>}
          </div>
        )}
        {exp.code && <pre className="mt-3 overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-sky-200">{exp.code}</pre>}
      </section>

      <section className="glass p-4">
        <div className="mb-2 flex items-center justify-between"><h3 className="font-bold">2. Controls</h3><span className="rounded-full bg-violet-500/30 px-2 py-0.5 text-[10px] font-bold tracking-wide text-violet-200">SIMULATED</span></div>
        <div className="space-y-3">
          {exp.controls.map((c) => (
            <div key={c.id}>
              {c.type === 'slider' && (<label className="block text-sm"><span className="flex justify-between"><span>{c.label}</span><b>{String(values[c.id])}{c.unit ? ` ${c.unit}` : ''}</b></span>
                <input type="range" className="w-full accent-violet-500" min={c.min} max={c.max} step={c.step} value={Number(values[c.id])} onChange={(e) => setVal(c.id, Number(e.target.value))} /></label>)}
              {c.type === 'switch' && (<label className="flex cursor-pointer items-center justify-between text-sm"><span>{c.label}</span>
                <button type="button" role="switch" aria-checked={Boolean(values[c.id])} onClick={() => setVal(c.id, !values[c.id])}
                  className={`relative h-6 w-11 rounded-full transition ${values[c.id] ? 'bg-emerald-500' : 'bg-white/20'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${values[c.id] ? 'left-[22px]' : 'left-0.5'}`} /></button></label>)}
              {c.type === 'text' && (<label className="block text-sm"><span>{c.label}</span>
                <input className="mt-1 w-full rounded-lg border border-white/10 bg-lab-900 px-3 py-1.5" maxLength={c.maxLen} value={String(values[c.id])} onChange={(e) => setVal(c.id, e.target.value)} /></label>)}
              {c.type === 'button' && <button className="btn-primary" onClick={() => press(c.id)}>{c.label}</button>}
            </div>
          ))}
        </div>
        {!result.ok && <p className="mt-3 rounded-lg bg-red-500/10 p-2 text-xs text-red-200">The circuit is not complete yet, so the outputs below are idle. Finish the wiring first.</p>}

        <h3 className="mb-2 mt-4 font-bold">3. Output (simulated)</h3>
        <div className={`rounded-xl border border-white/10 bg-black/20 p-3 transition ${result.ok ? '' : 'opacity-40'}`}>
          <dl className="mb-3 grid grid-cols-2 gap-2 text-sm">{out.readouts.map((r) => <div key={r.label} className="rounded-lg bg-white/5 p-2"><dt className="text-[11px] text-slate-400">{r.label}</dt><dd className="font-bold">{result.ok ? r.value : '-'}</dd></div>)}</dl>
          <div className="flex flex-wrap items-center justify-around gap-4">{result.ok ? out.visuals.map((v, i) => <VisualView key={i} v={v} />) : <p className="text-sm text-slate-400">No power</p>}</div>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">All values on this page are simulated. They are not real hardware readings.</p>
      </section>
    </div>
  );
}
