import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, Expand, FlaskConical, Box } from 'lucide-react';
import { KIND_LABEL, getComponent } from '../../data/kitComponents';
import { getLesson } from '../../data/lessons';
import { useAppStore } from '../../store/useAppStore';
import type { ComponentId } from '../../types';

const H = ({ children }: { children: string }) => <h4 className="mb-1 mt-4 text-xs font-bold uppercase tracking-wide text-sky-300">{children}</h4>;

export default function LessonPanel({ id, onInspect, showLink = false }: { id: ComponentId; onInspect?: () => void; showLink?: boolean }) {
  const comp = getComponent(id)!;
  const lesson = getLesson(id)!;
  const done = useAppStore((s) => s.lessons.includes(id));
  const complete = useAppStore((s) => s.completeLesson);
  return (
    <motion.article key={id} className="glass p-5" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">{KIND_LABEL[comp.kind]}</p>
      <h2 className="text-2xl font-extrabold">{comp.name}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link to={`/lab?c=${id}`} className="btn-primary"><FlaskConical size={15} />Try in Simulator</Link>
        {onInspect && <button className="btn-ghost" onClick={onInspect}><Expand size={15} />Inspect in 3D</button>}
        {showLink && <Link to={`/explore?c=${id}`} className="btn-ghost"><Box size={15} />View on 3D kit</Link>}
        <button className="btn-ghost" onClick={() => complete(id)} disabled={done}>{done ? <><CheckCircle2 size={15} className="text-emerald-300" />Lesson completed</> : <><BookOpen size={15} />Mark lesson complete</>}</button>
      </div>
      <H>What it is</H><p className="text-sm text-slate-200">{lesson.what}</p>
      <H>What it is used for</H><p className="text-sm text-slate-200">{lesson.usedFor}</p>
      <H>How it works</H><p className="text-sm text-slate-200">{lesson.how}</p>
      <H>Pin details</H>
      <table className="w-full text-left text-sm"><tbody>{lesson.pins.map((p) => <tr key={p.name} className="border-b border-white/5"><td className="py-1 pr-3 font-mono text-sky-200">{p.name}</td><td className="py-1 text-slate-300">{p.note}</td></tr>)}</tbody></table>
      <H>Connection instructions</H><ul className="list-disc pl-5 text-sm text-slate-200">{lesson.connect.map((c) => <li key={c}>{c}</li>)}</ul>
      <H>Step-by-step usage</H><ol className="list-decimal pl-5 text-sm text-slate-200">{lesson.steps.map((c) => <li key={c}>{c}</li>)}</ol>
      <H>Real-life applications</H><ul className="list-disc pl-5 text-sm text-slate-200">{lesson.apps.map((c) => <li key={c}>{c}</li>)}</ul>
      <H>Simple example</H><p className="rounded-lg bg-white/5 p-3 text-sm text-slate-200">{lesson.example}</p>
    </motion.article>
  );
}
