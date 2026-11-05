import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpen, CheckCircle2, Search, Trophy, Cpu } from 'lucide-react';
import { LEARNING_TOPICS } from '../data/learningTopics';
import { SIM_PROJECTS } from '../data/simProjects';
import { useAppStore } from '../store/useAppStore';
import Tilt from '../components/ui/Tilt';
import Hero3D from '../components/three/Hero3D';

export default function Academy() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All');
  const { learnedTopics, sims, quiz } = useAppStore();
  const cats = useMemo(() => ['All', ...Array.from(new Set(LEARNING_TOPICS.map(t => t.category)))], []);
  const filtered = LEARNING_TOPICS.filter(t => (cat === 'All' || t.category === cat) && `${t.title} ${t.category}`.toLowerCase().includes(query.toLowerCase()));
  const avg = quiz?.score ?? 0;
  const pct = Math.round((learnedTopics.length / 30) * 100);



  return <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
    <section className="academy-hero relative overflow-hidden rounded-[2rem] border border-white/10 p-7 md:p-10">
      <div className="absolute -right-8 -top-12 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="relative grid items-center gap-6 md:grid-cols-[1.3fr_.7fr]">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-200"><BookOpen size={14} /> Learning Academy · கற்றல் மையம்</div>
          <h1 className="text-4xl font-black leading-tight md:text-5xl">Learn 30 IoT topics. <span className="text-cyan-300">Build real skills.</span></h1>
          <p className="mt-4 max-w-xl text-slate-300">Simple topic notes covering principles, working, applications, advantages, disadvantages and safety. Download a PDF for every topic and track your learning.</p>
          <div className="mt-6 flex flex-wrap gap-3"><a className="btn-primary" href="#topics">Start learning</a><Link className="btn-ghost" to="/simulator"><Cpu size={16} /> Simulation Lab</Link></div>
        </div>
        <div className="hero3d"><Hero3D variant="academy" emoji="🧑‍🚀" /></div>
      </div>
    </section>

    <div className="my-6 grid gap-3 sm:grid-cols-4">
      {[['Topics learned', `${learnedTopics.length} / 30`, Trophy, 'text-emerald-200'], ['Quiz average', `${avg}%`, Award, 'text-violet-200'], ['Quiz levels', '3 levels', CheckCircle2, 'text-cyan-200'], ['Circuits wired', `${sims.length} / ${SIM_PROJECTS.length}`, Cpu, 'text-orange-200']].map(([l, v, I, c]) => { const Icon = I as typeof Trophy; return <div key={l as string} className="glass flex items-center gap-3 p-4"><Icon className={c as string} /><div><div className="text-xl font-black">{v as string}</div><div className="text-xs text-slate-400">{l as string}</div></div></div>; })}
    </div>
    <div className="glass mb-6 p-4"><div className="mb-2 flex justify-between text-xs text-slate-300"><span>Your course progress</span><span>{pct}%</span></div><div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all" style={{ width: `${pct}%` }} /></div>
      <p className="mt-3 text-xs text-slate-400">{learnedTopics.length} topics marked as learned. Complete all 30 to finish the study path.</p></div>

    <Link to="/simulator" className="mb-6 block"><Tilt className="sim-hero flex items-center gap-4 rounded-2xl border border-emerald-300/20 p-5"><div className="pop text-5xl">🎮</div><div className="pop2"><p className="text-xs font-bold uppercase tracking-widest text-emerald-200">Special topic · Simulation</p><h3 className="text-xl font-black">Circuit Simulation Lab — wire it, run it, win green!</h3><p className="text-sm text-slate-300">Watch how to connect, then wire it yourself. Green signal when correct, red when wrong.</p></div></Tilt></Link>

    <section id="topics" className="scroll-mt-24">
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><p className="text-sm font-bold text-cyan-300">YOUR LEARNING PATH</p><h2 className="text-2xl font-extrabold md:text-3xl">Choose a topic to study</h2></div>
        <div className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={16} /><input className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-cyan-300 sm:w-64" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search 30 topics..." /></div></div>
      <div className="mb-4 flex flex-wrap gap-2">{cats.map(c => <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-3 py-1 text-xs font-semibold ${cat === c ? 'border-cyan-300 bg-cyan-300/15 text-cyan-100' : 'border-white/10 text-slate-300 hover:bg-white/10'}`}>{c}</button>)}</div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(t => { return <Link key={t.id} to={`/academy/${t.id}`} className="block"><Tilt className="topic-card group text-left">
        <div className="flex items-start justify-between"><div className="topic-icon pop">{t.icon}</div>{learnedTopics.includes(t.id) ? <span className="flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-bold text-emerald-200"><CheckCircle2 size={12}/> LEARNED</span> : <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-slate-400">{String(t.id).padStart(2, '0')}</span>}</div>
        <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-cyan-200">{t.category}</p><h3 className="pop2 mt-1 text-base font-extrabold">{t.title}</h3><p className="mt-2 min-h-10 text-sm leading-5 text-slate-400">{t.summary}</p>
        <div className="mt-4 flex items-center justify-between text-xs font-bold text-cyan-200"><span>{learnedTopics.includes(t.id) ? '✓ Learned · Open notes / PDF' : 'Open notes · Learn this topic'}</span><span className="transition group-hover:translate-x-1">→</span></div></Tilt></Link>; })}</div>
    </section>
    <p className="mt-8 text-center text-xs text-slate-500">Topic progress is saved in this browser. Generate a PDF from any topic page. Quizzes are separate and available at three difficulty levels.</p>
  </div>;
}
