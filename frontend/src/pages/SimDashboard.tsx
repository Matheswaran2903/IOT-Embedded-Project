import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Code2, Copy, Lightbulb, Pause, Play, RotateCcw, Square, Volume2, VolumeX, Wrench, XCircle } from 'lucide-react';
import { TINTS, partVisual, projectVisuals } from '../data/partImages';
import Tilt from '../components/ui/Tilt';
import { SIM_PROJECTS, UNO_PINS, checkWires, key, pinName } from '../data/simProjects';
import type { SimProject } from '../data/simProjects';
import { useAppStore } from '../store/useAppStore';

const COLORS = ['#61dafb', '#f472b6', '#facc15', '#9ee7fe', '#fb923c', '#4ade80', '#f87171', '#60a5fa', '#e879f9', '#2dd4bf'];
type Pt = { x: number; y: number };
type Tab = 'simulate' | 'learn' | 'practice' | 'code';
type WireList = [string, string][];

function layout(p: SimProject) {
  const pins: Record<string, Pt> = {};
  UNO_PINS.forEach((n, i) => { pins[`UNO.${n}`] = { x: 228, y: 44 + i * 24 }; });
  let col = 0, y = 24;
  const boxes = p.parts.map(pt => {
    const h = 36 + pt.pins.length * 24;
    if (y + h > 510) { col++; y = 24; }
    const x = 430 + col * 260, box = { pt, x, y, h };
    pt.pins.forEach((n, i) => { pins[`${pt.id}.${n}`] = { x, y: y + 44 + i * 24 }; });
    y += h + 14; return box;
  });
  return { pins, boxes };
}
const path = (a: Pt, b: Pt) => `M${a.x} ${a.y} C${a.x + 90} ${a.y}, ${b.x - 90} ${b.y}, ${b.x} ${b.y}`;

/** The circuit drawing: Arduino on the left, parts on the right, wires between pins. */
function Board({ p, shown, live, interactive, selected, active, verdict, onPin, onWire }: {
  p: SimProject; shown: WireList; live: boolean; interactive: boolean; selected: string | null; active: [string, string, string] | null;
  verdict: 'none' | 'checked'; onPin: (id: string) => void; onWire: (i: number) => void;
}) {
  const { pins, boxes } = useMemo(() => layout(p), [p]);
  return <div className="overflow-x-auto rounded-2xl border border-white/15 bg-gradient-to-br from-[#08203d] to-[#061528]">
    <svg viewBox="0 0 960 530" className="w-full min-w-[760px]" role="img" aria-label={`${p.title} circuit board`}>
      <rect x="20" y="20" width="208" height="496" rx="14" fill="#0b5f9a" stroke="#61dafb66" />
      <text x="124" y="270" fill="#d6f3ff" fontSize="22" fontWeight="800" textAnchor="middle" transform="rotate(-90 124 270)">ARDUINO UNO</text>
      {boxes.map(b => <g key={b.pt.id}>
        <rect x={b.x} y={b.y} width="220" height={b.h} rx="12" fill="#12335a" stroke="#ffffff33" />
        <text x={b.x + 14} y={b.y + 22} fill="#eaf6ff" fontSize="13" fontWeight="700">{b.pt.icon} {b.pt.label}</text>
        {b.pt.pins.map((n, i) => <text key={n} x={b.x + 16} y={b.y + 48 + i * 24} fill="#a9c8e8" fontSize="12">{n}</text>)}
      </g>)}
      {UNO_PINS.map((n, i) => <text key={n} x="218" y={48 + i * 24} fill="#e0f2fe" fontSize="11" textAnchor="end">{n}</text>)}
      {shown.map((w, i) => {
        const a = pins[w[0]], b = pins[w[1]]; if (!a || !b) return null;
        const k = key(w[0], w[1]);
        const bad = verdict === 'checked' && !p.wires.some(x => key(x[0], x[1]) === k);
        const good = verdict === 'checked' && !bad;
        return <g key={k}>
          <path className={`wire ${live ? 'wire-live' : ''}`} d={path(a, b)} stroke={bad ? '#ef4444' : good ? '#22c55e' : COLORS[i % COLORS.length]} strokeDasharray={bad ? '8 6' : undefined} />
          {interactive && <path className="wire-hit" d={path(a, b)} onClick={() => onWire(i)}><title>Click to remove this wire</title></path>}
        </g>;
      })}
      {Object.entries(pins).map(([id, pt]) => {
        const on = selected === id || (active && (active[0] === id || active[1] === id));
        return <circle key={id} className="pin" cx={pt.x} cy={pt.y} r={on ? 8 : 6} fill={on ? '#facc15' : '#cbd5e1'} stroke="#0f172a" strokeWidth="2" onClick={() => onPin(id)}><title>{pinName(id)}</title></circle>;
      })}
    </svg>
  </div>;
}

function Dashboard({ p, autoStart, initialTab }: { p: SimProject; autoStart: boolean; initialTab: Tab }) {
  const idx = SIM_PROJECTS.findIndex(x => x.id === p.id);
  const next = SIM_PROJECTS[idx + 1], prev = SIM_PROJECTS[idx - 1];
  const [tab, setTab] = useState<Tab>(initialTab);
  const [wires, setWires] = useState<WireList>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(false);
  const [checked, setChecked] = useState(false);
  const [hint, setHint] = useState(false);
  const [running, setRunning] = useState(autoStart && initialTab === 'simulate');
  const [t, setT] = useState(0);
  const [vals, setVals] = useState<Record<string, number>>(() => Object.fromEntries(p.inputs.map(i => [i.id, i.def])));
  const [lastPress, setLastPress] = useState(0);
  const [sound, setSound] = useState(false);
  const [copied, setCopied] = useState(false);
  const completeSim = useAppStore(s => s.completeSim);
  const done = useAppStore(s => s.sims).includes(p.id);
  const audio = useRef<{ ctx: AudioContext; osc: OscillatorNode; gain: GainNode } | null>(null);

  useEffect(() => { if (!auto) return; const h = setInterval(() => setStep(s => { if (s >= p.wires.length) { setAuto(false); return s; } return s + 1; }), 1400); return () => clearInterval(h); }, [auto, p]);
  useEffect(() => { if (!running) return; const h = setInterval(() => setT(x => x + 0.05), 50); return () => clearInterval(h); }, [running]);

  const res = checkWires(p, wires);
  const out = running ? p.run(vals, { t, since: t - lastPress }) : null;

  useEffect(() => { // optional real buzzer sound in the browser
    const want = !!out?.buzzer && sound;
    if (want && !audio.current) { const ctx = new AudioContext(), osc = ctx.createOscillator(), gain = ctx.createGain(); osc.frequency.value = 1800; gain.gain.value = 0.04; osc.connect(gain); gain.connect(ctx.destination); osc.start(); audio.current = { ctx, osc, gain }; }
    if (!want && audio.current) { audio.current.osc.stop(); audio.current.ctx.close(); audio.current = null; }
  }, [out?.buzzer, sound]);
  useEffect(() => () => { audio.current?.osc.stop(); audio.current?.ctx.close(); }, []);

  const go = (nt: Tab) => { setTab(nt); setRunning(false); setAuto(false); };
  const start = () => { setT(0); setLastPress(0); setRunning(true); };
  const stop = () => setRunning(false);

  const clickPin = (id: string) => {
    if (tab !== 'practice') return;
    setChecked(false);
    if (!sel) { setSel(id); return; }
    if (sel === id) { setSel(null); return; }
    if (!wires.some(w => key(w[0], w[1]) === key(sel, id))) setWires(w => [...w, [sel, id]]);
    setSel(null);
  };
  const unwire = (i: number) => { if (tab === 'practice') { setWires(w => w.filter((_, k) => k !== i)); setChecked(false); } };
  const onCheck = () => { setChecked(true); if (res.ok) completeSim(p.id); };
  const firstMissing = p.wires.find(w => res.missing.includes(key(w[0], w[1])));
  const copy = async () => { try { await navigator.clipboard.writeText(p.code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ } };
  const cur = tab === 'learn' && step > 0 ? p.wires[step - 1] : null;
  const shown: WireList = tab === 'simulate' ? p.wires.map(w => [w[0], w[1]]) : tab === 'learn' ? p.wires.slice(0, step).map(w => [w[0], w[1]]) : wires;
  const leds = p.parts.filter(x => x.color);

  const TABS: { id: 'simulate' | 'wiring' | 'code'; label: string; icon: JSX.Element }[] = [
    { id: 'simulate', label: 'Simulation', icon: <Play size={16} /> },
    { id: 'wiring', label: 'Wiring', icon: <Wrench size={16} /> },
    { id: 'code', label: 'Arduino code', icon: <Code2 size={16} /> },
  ];
  const wiringToggle = <div className="seg mb-4" role="group" aria-label="Wiring mode"><button aria-pressed={tab === 'learn'} onClick={() => go('learn')}>Watch how</button><button aria-pressed={tab === 'practice'} onClick={() => go('practice')}>Try it yourself</button></div>;
  const parts = <div className="glass p-5 md:p-6"><h2 className="mb-4 text-lg font-extrabold">Parts in this circuit</h2>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{[{ id: 'uno', icon: '🧠', label: 'Arduino Uno', pins: [] as string[] }, ...p.parts].map((pt, i) => { const v = pt.id === 'uno' ? { img: 'arduino-uno', emoji: '🧠', label: 'Arduino Uno' } : partVisual(pt);
      return <Tilt key={pt.id} className="comp-card"><div className="part-img pop" style={{ background: `linear-gradient(145deg, #fff, ${TINTS[i % TINTS.length]})` }}>{v.img ? <img src={`/components/${v.img}.png`} alt={v.label} draggable={false} /> : <span className="text-5xl">{v.emoji}</span>}</div><p className="pop2 mt-3 text-center text-[13px] font-extrabold text-slate-800">{v.label}</p></Tilt>; })}</div></div>;

  return <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-6">
    <Link to="/simulator" className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-200 hover:text-white"><ArrowLeft size={16} /> All simulations</Link>

    <section className="sim-hero overflow-hidden rounded-[2rem] border border-white/10 p-6 md:p-8">
      <div className="grid items-center gap-6 md:grid-cols-[1.3fr_.7fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-sky-300/20 px-2.5 py-0.5 text-xs font-bold text-sky-100">{p.level}</span>{done && <span className="flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-bold text-emerald-100"><CheckCircle2 size={13} /> Wired correctly</span>}</div>
          <h1 className="mt-2 text-3xl font-black md:text-4xl">{p.title}</h1>
          <p className="mt-2 max-w-xl text-slate-200">{p.goal}</p>
        </div>
        <div className="dash-hero-art float-card">{projectVisuals(p).map((v, i) => <div key={v.key} className="sim-thumb lg" style={{ background: `linear-gradient(145deg, #fff, ${TINTS[i % TINTS.length]})`, ['--dl' as string]: `${i * 0.4}s` } as React.CSSProperties}>
          {v.img ? <img src={`/components/${v.img}.png`} alt={v.label} draggable={false} /> : <span className="emo">{v.emoji}</span>}</div>)}</div>
      </div>
    </section>

    <div role="tablist" aria-label="Simulation sections" className="glass flex flex-wrap gap-1.5 p-1.5">
      {TABS.map(x => <button key={x.id} role="tab" aria-selected={x.id === 'wiring' ? (tab === 'learn' || tab === 'practice') : tab === x.id} className="tab-btn" onClick={() => go(x.id === 'wiring' ? 'learn' : x.id)}>{x.icon}{x.label}</button>)}
    </div>

    {tab === 'simulate' && <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
      <div className="space-y-6"><div className="glass p-5">
        <div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-lg font-extrabold">Your circuit</h2>
          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${running ? 'bg-emerald-400/20 text-emerald-100' : 'bg-white/10 text-slate-300'}`}><span className={`h-2 w-2 rounded-full ${running ? 'bg-emerald-300' : 'bg-slate-400'}`} />{running ? 'Running' : 'Stopped'}</span></div>
        <Board p={p} shown={shown} live={running} interactive={false} selected={null} active={null} verdict="none" onPin={() => undefined} onWire={() => undefined} />
        <p className="mt-3 text-sm text-slate-300">Every wire is already connected. Want to connect it yourself? <button className="font-bold text-sky-200 underline" onClick={() => go('practice')}>Try the wiring</button>.</p>
      </div>
      {parts}</div>

      <div className="space-y-6">
        <div className="glass p-5">
          <ol className="mb-4 space-y-2 text-sm">
            <li className="flex items-center gap-3"><span className="step-dot">1</span><span>Press <b>Start simulation</b>.</span></li>
            {p.inputs.length > 0 && <li className="flex items-center gap-3"><span className="step-dot">2</span><span>Change the controls below.</span></li>}
            <li className="flex items-center gap-3"><span className="step-dot">{p.inputs.length > 0 ? 3 : 2}</span><span>Watch the outputs react.</span></li>
          </ol>
          {running
            ? <button className="start-btn stop" onClick={stop}><Square size={22} fill="currentColor" /> Stop simulation</button>
            : <button className="start-btn idle" onClick={start}><Play size={24} fill="currentColor" /> Start simulation</button>}
        </div>

        {p.inputs.length > 0 && <div className="glass p-5"><h2 className="mb-3 text-base font-extrabold">Controls</h2><div className="space-y-3">
          {p.inputs.map(i => <div key={i.id} className="rounded-xl border border-white/15 bg-black/20 p-3">
            <div className="mb-1 flex justify-between text-sm"><span>{i.label}</span>{i.type === 'range' && <b className="text-sky-200">{vals[i.id]}{i.unit ?? ''}</b>}</div>
            {i.type === 'range' && <input type="range" aria-label={i.label} className="w-full accent-sky-300" min={i.min} max={i.max} step={i.step} value={vals[i.id] ?? i.def} onChange={e => setVals(v => ({ ...v, [i.id]: Number(e.target.value) }))} />}
            {i.type === 'toggle' && <button className={`btn ${vals[i.id] ? 'bg-emerald-500 text-slate-900' : 'bg-white/10'}`} onClick={() => setVals(v => ({ ...v, [i.id]: v[i.id] ? 0 : 1 }))}>{vals[i.id] ? 'YES' : 'NO'}</button>}
            {i.type === 'press' && <button className="btn-primary w-full" onClick={() => { setVals(v => ({ ...v, [i.id]: (v[i.id] ?? 0) + 1 })); setLastPress(t); }}>🔘 Press</button>}
          </div>)}</div>
          {!running && <p className="mt-3 text-xs text-slate-400">Controls take effect after you press Start.</p>}
        </div>}

        <div className="glass p-5">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-base font-extrabold">Outputs</h2>
            {p.parts.some(x => x.id === 'buz') && <button className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => setSound(s => !s)} aria-pressed={sound}>{sound ? <Volume2 size={14} /> : <VolumeX size={14} />} Sound {sound ? 'on' : 'off'}</button>}</div>
          <div className="space-y-4 rounded-xl border border-white/15 bg-black/25 p-4">
            {!running && <p className="text-sm text-slate-300">Nothing is happening yet. Press <b>Start simulation</b>.</p>}
            {out?.lcd && <div className="lcd text-lg">{out.lcd[0]}{'\n'}{out.lcd[1]}</div>}
            {leds.length > 0 && <div className="flex flex-wrap gap-5">{leds.map(x => { const lv = out?.leds?.[x.id] ?? 0; return <div key={x.id} className="text-center"><div className="mx-auto h-11 w-11 rounded-full border-2 border-white/40" style={{ background: x.color, opacity: 0.18 + lv * 0.82, boxShadow: lv > 0.05 ? `0 0 ${12 + lv * 28}px ${x.color}` : 'none' }} /><p className="mt-1 text-[11px] text-slate-300">{x.label.split(' ')[0]}</p></div>; })}</div>}
            {p.parts.some(x => x.id === 'buz') && <div className="flex items-center gap-3"><div className="relative grid h-12 w-12 place-items-center text-3xl">{out?.buzzer && <span className="ring absolute inset-0 rounded-full border-2 border-amber-300" />}🔔</div><span className={`text-sm font-bold ${out?.buzzer ? 'text-amber-300' : 'text-slate-400'}`}>{out?.buzzer ? 'BEEP!' : 'Silent'}</span></div>}
            {p.parts.some(x => x.id === 'rel') && <div className="flex items-center gap-3"><span className="text-4xl" style={{ filter: out?.relay ? 'drop-shadow(0 0 12px #facc15)' : 'grayscale(1) opacity(.5)' }}>💡</span><span className="text-sm font-bold">{out?.relay ? 'Relay ON, demo lamp lit' : 'Relay OFF'}</span></div>}
            {out?.note && <p className="rounded-lg bg-sky-300/10 p-2.5 text-sm text-sky-100">{out.note}</p>}
          </div>
        </div>
      </div>
    </div>}

    {tab === 'learn' && <div className="glass p-5 md:p-6">
      {wiringToggle}
      <Board p={p} shown={shown} live={false} interactive={false} selected={null} active={cur} verdict="none" onPin={() => undefined} onWire={() => undefined} />
      <div className="mt-3 rounded-xl border border-sky-300/30 bg-sky-300/10 p-4"><p className="text-sm font-bold text-sky-100">Step {step} of {p.wires.length}</p>
        <p className="mt-1 min-h-[2.5rem] text-sm">{cur ? <><b>{pinName(cur[0])} ↔ {pinName(cur[1])}</b>: {cur[2]}</> : 'Press “Play lesson” to see each wire connected one by one, or use Next step.'}</p>
        <div className="mt-3 flex flex-wrap gap-2"><button className="btn-primary" onClick={() => { if (step >= p.wires.length) setStep(0); setAuto(a => !a); }}>{auto ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Play lesson</>}</button>
          <button className="btn-ghost" onClick={() => { setAuto(false); setStep(s => Math.max(0, s - 1)); }}>◀ Back</button>
          <button className="btn-ghost" onClick={() => { setAuto(false); setStep(s => Math.min(p.wires.length, s + 1)); }}>Next step ▶</button></div></div>
    </div>}

    {tab === 'practice' && <div className="glass p-5 md:p-6">
      {wiringToggle}
      <Board p={p} shown={shown} live={false} interactive selected={sel} active={null} verdict={checked ? 'checked' : 'none'} onPin={clickPin} onWire={unwire} />
      <p className="mt-3 text-sm text-slate-200">Click one pin, then another pin to place a wire. Click a wire to remove it. <b>{wires.length}</b> placed, <b>{p.wires.length}</b> needed.</p>
      <div className="mt-3 flex flex-wrap gap-2"><button className="btn-primary" onClick={onCheck}><CheckCircle2 size={16} /> Check circuit</button><button className="btn-ghost" onClick={() => setHint(true)}><Lightbulb size={16} /> Hint</button><button className="btn-ghost" onClick={() => { setWires([]); setChecked(false); setSel(null); }}><RotateCcw size={16} /> Clear wires</button></div>
      {hint && firstMissing && <p className="mt-2 rounded-lg bg-sky-300/10 p-3 text-sm text-sky-100">💡 Next connection: <b>{pinName(firstMissing[0])} → {pinName(firstMissing[1])}</b>. {firstMissing[2]}.</p>}
      {checked && (res.ok
        ? <div role="status" className="signal-ok mt-3 rounded-xl border border-emerald-300/50 bg-emerald-400/15 p-4 text-emerald-100"><p className="flex items-center gap-2 text-lg font-black"><CheckCircle2 /> Green signal: your circuit is correct!</p><p className="mt-1 text-sm">Every connection matches the real circuit.</p><button className="btn-primary mt-3" onClick={() => { go('simulate'); start(); }}><Play size={16} /> Start simulation</button></div>
        : <div role="status" className="mt-3 rounded-xl border border-rose-300/50 bg-rose-400/15 p-4 text-rose-100"><p className="flex items-center gap-2 text-lg font-black"><XCircle /> Red signal: check your wiring</p>
          <ul className="mt-1 list-disc pl-5 text-sm">{res.short && <li><b>Short circuit!</b> A power pin is wired directly to GND. Remove that wire.</li>}{res.wrong.length > 0 && <li>{res.wrong.length} wire(s) shown dashed red are not part of this circuit. Click them to remove.</li>}{res.missing.length > 0 && <li>{res.missing.length} connection(s) still missing. Use Hint if you are stuck.</li>}</ul></div>)}
    </div>}

    {tab === 'code' && <div className="glass p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-extrabold">Arduino code (checked, no syntax errors)</h2><button className="btn-ghost" onClick={copy}><Copy size={16} /> {copied ? 'Copied!' : 'Copy code'}</button></div>
      {p.libs && <p className="mt-2 text-sm text-amber-200">Install in Arduino IDE → Library Manager: {p.libs.join(', ')}</p>}
      <pre className="mt-3 max-h-[28rem] overflow-auto rounded-xl border border-white/15 bg-black/40 p-4 text-xs leading-5 text-sky-100"><code>{p.code}</code></pre>
      {p.image && <div className="mt-4"><p className="mb-2 text-sm font-bold">Real circuit diagram (from your project document)</p><img src={`/images/circuits/${p.image}.jpg`} alt={`${p.title} real circuit diagram`} className="w-full rounded-xl border border-white/15" loading="lazy" /></div>}
      <p className="mt-4 text-xs text-slate-300">Safety: power off before wiring real hardware. For the relay project use only a low-voltage DC lamp, never mains voltage on a breadboard.</p>
    </div>}

    <div className="flex flex-wrap items-center justify-between gap-3">
      {prev ? <Link to={`/simulator/${prev.id}?start=1`} className="btn-ghost"><ArrowLeft size={16} /> {prev.title}</Link> : <span />}
      {next ? <Link to={`/simulator/${next.id}?start=1`} className="btn-primary">Next: {next.title} <ArrowRight size={16} /></Link> : <Link to="/simulator" className="btn-primary">Back to all simulations</Link>}
    </div>
  </div>;
}

export default function SimDashboard() {
  const { id } = useParams();
  const [q] = useSearchParams();
  const p = SIM_PROJECTS.find(x => x.id === id);
  if (!p) return <Navigate to="/simulator" replace />;
  const tab = q.get('tab');
  const initialTab: Tab = tab === 'learn' || tab === 'practice' || tab === 'code' ? tab : 'simulate';
  return <Dashboard key={p.id} p={p} autoStart={q.get('start') === '1'} initialTab={initialTab} />;
}
