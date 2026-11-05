import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { CHALLENGES, type Challenge } from '../data/challenges';
import { useAppStore } from '../store/useAppStore';

function Card({ c }: { c: Challenge }) {
  const done = useAppStore((s) => s.challenges.includes(c.id));
  const complete = useAppStore((s) => s.completeChallenge);
  const [val, setVal] = useState('');
  const [res, setRes] = useState<null | boolean>(null);
  const [hint, setHint] = useState(false);
  const check = () => {
    let ok = false;
    if (c.type === 'number') { const n = Number(val); ok = val.trim() !== '' && Number.isFinite(n) && Math.abs(n - c.answer) <= c.tol; }
    else ok = val !== '' && Number(val) === c.answer;
    setRes(ok); if (ok) complete(c.id);
  };
  return (
    <div className="glass p-4">
      <div className="flex items-center justify-between"><h3 className="font-bold">{c.title}</h3>{done && <span className="text-xs text-emerald-300">✓ Done</span>}</div>
      <p className="my-2 text-sm text-slate-200">{c.question}</p>
      {c.type === 'number' ? (
        <input type="number" value={val} onChange={(e) => { setVal(e.target.value); setRes(null); }} placeholder="Your answer" className="w-full rounded-lg border border-white/10 bg-lab-900 px-3 py-1.5 text-sm" />
      ) : (
        <div className="space-y-1">{c.options.map((o, i) => (
          <label key={o} className="flex cursor-pointer items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-sm"><input type="radio" name={c.id} checked={val === String(i)} onChange={() => { setVal(String(i)); setRes(null); }} />{o}</label>
        ))}</div>
      )}
      <div className="mt-3 flex gap-2"><button className="btn-primary !py-1.5" onClick={check} disabled={val === ''}>Check answer</button><button className="btn-ghost !py-1.5" onClick={() => setHint(!hint)}>Hint</button></div>
      {hint && <p className="mt-2 text-xs text-sky-300">Hint: {c.hint}</p>}
      {res !== null && <p className={`mt-2 flex gap-1.5 text-sm ${res ? 'text-emerald-300' : 'text-red-300'}`}>{res ? <CheckCircle2 size={16} /> : <XCircle size={16} />}{res ? `Correct! ${c.why}` : 'Not quite. Try again or use the hint.'}</p>}
    </div>
  );
}

export default function Challenges() {
  const done = useAppStore((s) => s.challenges.length);
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-3xl font-extrabold">Practice Challenges</h1>
      <p className="mb-4 text-slate-300">{done} of {CHALLENGES.length} solved. Use what you learned in the lessons and the lab.</p>
      <div className="grid gap-3 md:grid-cols-2">{CHALLENGES.map((c) => <Card key={c.id} c={c} />)}</div>
    </div>
  );
}
