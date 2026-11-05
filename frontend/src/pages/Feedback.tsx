import { useState } from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../components/quiz/StarRating';
import { KIT_COMPONENTS } from '../data/kitComponents';
import { useAppStore } from '../store/useAppStore';

const Err = ({ msg }: { msg?: string }) => (msg ? <p className="mt-1 text-xs text-red-300">{msg}</p> : null);

export default function Feedback() {
  const { quiz, feedback, studentName, schoolName, className, setFeedback, setStudent } = useAppStore();
  const [f, setF] = useState({ name: feedback?.name ?? studentName, cls: feedback?.cls ?? className, school: feedback?.school ?? schoolName, overall: feedback?.overall ?? 0, usability: feedback?.usability ?? 0, learning: feedback?.learning ?? 0, favorite: feedback?.favorite ?? '', suggestions: feedback?.suggestions ?? '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  if (!quiz) return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center"><div className="glass p-8"><h1 className="mb-2 text-2xl font-extrabold">Finish the quiz first</h1><p className="mb-4 text-slate-300">The feedback form opens after you complete the quiz.</p><Link className="btn-primary" to="/quiz">Go to quiz</Link></div></div>
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.name.trim().length < 2) er.name = 'Please enter your name.';
    if (!f.cls) er.cls = 'Please choose your class.';
    if (f.school.trim().length < 2) er.school = 'Please enter your school name.';
    if (!f.overall) er.overall = 'Please give an overall rating.';
    if (!f.usability) er.usability = 'Please rate the simulator.';
    if (!f.learning) er.learning = 'Please rate your learning experience.';
    if (!f.favorite) er.favorite = 'Please choose a favourite component.';
    setErr(er);
    if (Object.keys(er).length) return;
    setFeedback({ ...f, name: f.name.trim(), school: f.school.trim(), suggestions: f.suggestions.trim(), date: new Date().toISOString() });
    setStudent({ studentName: f.name.trim(), schoolName: f.school.trim(), className: f.cls });
    setSaved(true);
  };
  const inp = 'w-full rounded-lg border border-white/10 bg-lab-900 px-3 py-2 text-sm';

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-3xl font-extrabold">Student Feedback</h1>
      <p className="mb-4 text-slate-300">Tell us what you think. This is saved only in your browser.</p>
      <form onSubmit={submit} className="glass space-y-3 p-5" noValidate>
        <div><label className="text-sm font-medium">Student name</label><input className={inp} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /><Err msg={err.name} /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="text-sm font-medium">Class</label><select className={inp} value={f.cls} onChange={(e) => setF({ ...f, cls: e.target.value })}><option value="">Choose…</option><option>10</option><option>11</option><option>12</option></select><Err msg={err.cls} /></div>
          <div><label className="text-sm font-medium">School name</label><input className={inp} value={f.school} onChange={(e) => setF({ ...f, school: e.target.value })} /><Err msg={err.school} /></div>
        </div>
        <div><StarRating label="Overall rating" value={f.overall} onChange={(n) => setF({ ...f, overall: n })} /><Err msg={err.overall} /></div>
        <div><StarRating label="Simulator usability" value={f.usability} onChange={(n) => setF({ ...f, usability: n })} /><Err msg={err.usability} /></div>
        <div><StarRating label="Learning experience" value={f.learning} onChange={(n) => setF({ ...f, learning: n })} /><Err msg={err.learning} /></div>
        <div><label className="text-sm font-medium">Favourite component</label><select className={inp} value={f.favorite} onChange={(e) => setF({ ...f, favorite: e.target.value })}><option value="">Choose…</option>{KIT_COMPONENTS.map((c) => <option key={c.id}>{c.name}</option>)}</select><Err msg={err.favorite} /></div>
        <div><label className="text-sm font-medium">Suggestions (optional)</label><textarea className={inp} rows={3} maxLength={500} value={f.suggestions} onChange={(e) => setF({ ...f, suggestions: e.target.value })} /></div>
        <button className="btn-primary" type="submit">Submit feedback</button>
        {saved && <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-200">Thank you! Feedback saved. {quiz.passed ? <Link className="underline" to="/certificate">Get your certificate</Link> : 'Pass the quiz (60 marks) to unlock your certificate.'}</p>}
      </form>
    </div>
  );
}
