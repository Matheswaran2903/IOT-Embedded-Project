import { Link } from 'react-router-dom';
import { CheckCircle2, Play } from 'lucide-react';
import { SIM_PROJECTS } from '../data/simProjects';
import { TINTS, projectVisuals } from '../data/partImages';
import { useAppStore } from '../store/useAppStore';
import Hero3D from '../components/three/Hero3D';
import Tilt from '../components/ui/Tilt';

/** Simulation Lab home: one 3D card per topic. "Start" opens that topic's dashboard and runs it. */
export default function Simulator() {
  const done = useAppStore(s => s.sims);
  return <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
    <section className="sim-hero relative overflow-hidden rounded-[2rem] border border-white/10 p-7 md:p-9"><div className="grid items-center gap-4 md:grid-cols-[1.4fr_.6fr]">
      <div><h1 className="text-4xl font-black md:text-5xl">Circuit Simulation <span className="text-sky-300">Lab</span></h1>
        <p className="mt-3 max-w-xl text-slate-200">Pick a topic and press <b>Start</b>. The circuit opens and runs straight away.</p>
        <p className="mt-3 text-sm text-sky-100">✅ {done.length} of {SIM_PROJECTS.length} circuits wired correctly</p></div>
      <div className="hero3d !h-52"><Hero3D variant="sim" emoji="🔌" /></div></div></section>

    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {SIM_PROJECTS.map(p => <Tilt key={p.id} className="topic-card flex flex-col">
        <div className="pop flex gap-3">{projectVisuals(p).map((v, i) => <div key={v.key} className="sim-thumb" style={{ background: `linear-gradient(145deg, #fff, ${TINTS[i % TINTS.length]})`, ['--dl' as string]: `${i * 0.4}s` } as React.CSSProperties}>
          {v.img ? <img src={`/components/${v.img}.png`} alt={v.label} draggable={false} /> : <span className="emo">{v.emoji}</span>}</div>)}</div>
        <div className="mt-4 flex items-center gap-2"><span className="rounded-full bg-sky-300/15 px-2.5 py-0.5 text-xs font-bold text-sky-200">{p.level}</span>
          {done.includes(p.id) && <span className="flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-bold text-emerald-100"><CheckCircle2 size={12} /> Wired</span>}</div>
        <h3 className="pop2 mt-2 text-lg font-extrabold">{p.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-300">{p.goal}</p>
        <div className="mt-auto pt-5"><Link to={`/simulator/${p.id}?start=1`} className="start-btn sm"><Play size={18} fill="currentColor" /> Start simulation</Link></div>
      </Tilt>)}
    </div>
    <p className="mt-8 text-center text-xs text-slate-400"><Link to="/academy" className="text-cyan-200">← Back to Learning Academy</Link></p>
  </div>;
}
