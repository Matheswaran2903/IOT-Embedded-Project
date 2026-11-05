import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Gamepad2, RotateCcw, Star, Target } from 'lucide-react';
import { GAME_PARTS } from '../data/gameParts';
import type { GamePart } from '../data/gameParts';
import { useAppStore } from '../store/useAppStore';

const LEVELS = [
  { id: 'easy', label: 'Easy', pairs: 6, cols: 4 },
  { id: 'medium', label: 'Medium', pairs: 8, cols: 4 },
  { id: 'hard', label: 'Hard', pairs: 10, cols: 5 },
];
type Card = { uid: string; pid: string; kind: 'img' | 'clue' };

const shuffle = <T,>(a: T[]): T[] => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
};
const build = (pairs: number): Card[] =>
  shuffle(shuffle(GAME_PARTS).slice(0, pairs).flatMap((p): Card[] => [{ uid: `${p.id}-img`, pid: p.id, kind: 'img' }, { uid: `${p.id}-clue`, pid: p.id, kind: 'clue' }]));
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const byId = Object.fromEntries(GAME_PARTS.map((p) => [p.id, p])) as Record<string, GamePart>;

export default function PartMatch() {
  const [levelId, setLevelId] = useState('easy');
  const lv = LEVELS.find((l) => l.id === levelId)!;
  const [cards, setCards] = useState<Card[]>(() => build(LEVELS[0].pairs));
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState<'idle' | 'playing' | 'won'>('idle');
  const [fact, setFact] = useState<GamePart | null>(null);
  const [result, setResult] = useState({ stars: 0, score: 0 });
  const saved = useRef(false);
  const setGameResult = useAppStore((s) => s.setGameResult);
  const best = useAppStore((s) => s.gameBest[levelId]);

  const reset = (id: string) => {
    const l = LEVELS.find((x) => x.id === id)!;
    setLevelId(id); setCards(build(l.pairs)); setFlipped([]); setMatched([]); setMoves(0); setSeconds(0); setStatus('idle'); setFact(null); saved.current = false;
  };

  useEffect(() => {
    if (status !== 'playing') return;
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [status]);

  useEffect(() => {
    if (status !== 'playing' || matched.length !== lv.pairs || saved.current) return;
    saved.current = true;
    const stars = moves <= Math.ceil(lv.pairs * 1.5) ? 3 : moves <= Math.ceil(lv.pairs * 2.5) ? 2 : 1;
    const score = Math.max(50, Math.round(lv.pairs * 150 - moves * 8 - seconds * 2));
    setResult({ stars, score });
    setGameResult(lv.id, score, stars);
    setStatus('won');
  }, [matched, status, moves, seconds, lv, setGameResult]);

  const flip = (c: Card) => {
    if (status === 'won' || flipped.length >= 2 || flipped.includes(c.uid) || matched.includes(c.pid)) return;
    if (status === 'idle') setStatus('playing');
    const next = [...flipped, c.uid];
    setFlipped(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const a = cards.find((x) => x.uid === next[0])!;
    if (a.pid === c.pid) {
      window.setTimeout(() => { setMatched((m) => [...m, c.pid]); setFlipped([]); setFact(byId[c.pid]); }, 450);
    } else {
      window.setTimeout(() => setFlipped([]), 900);
    }
  };

  const confetti = useMemo(() => Array.from({ length: 28 }, (_, i) => ({ l: Math.random() * 100, d: Math.random() * 0.8, t: 1.8 + Math.random() * 1.6, c: ['#ffd23f', '#2de2e6', '#ff6b81', '#6ee7a8', '#a78bfa'][i % 5] })), [status === 'won']); // eslint-disable-line react-hooks/exhaustive-deps
  const nextLevel = LEVELS[LEVELS.findIndex((l) => l.id === levelId) + 1];

  return (
    <div className="page7 match7">
      <section className="match-top">
        <div>
          <span className="pill7">Game · Part Match 3D</span>
          <h1>Match each part with its job</h1>
          <p>Flip two cards. A picture card matches the card that says what it does. Fewer moves and a faster time earn more stars.</p>
        </div>
        <div className="seg7" role="group" aria-label="Level">
          {LEVELS.map((l) => <button key={l.id} aria-pressed={l.id === levelId} onClick={() => reset(l.id)}>{l.label}<small>{l.pairs} pairs</small></button>)}
        </div>
      </section>

      <div className="hud7">
        <div><Target size={18} /><b>{moves}</b><span>moves</span></div>
        <div><Clock size={18} /><b>{fmt(seconds)}</b><span>time</span></div>
        <div><Gamepad2 size={18} /><b>{matched.length}/{lv.pairs}</b><span>pairs found</span></div>
        <div><Star size={18} /><b>{best ? `${best.stars}★ · ${best.score}` : '—'}</b><span>your best</span></div>
        <button className="btn7 btn7-glass sm" onClick={() => reset(levelId)}><RotateCcw size={16} /> New game</button>
      </div>

      <div className="board-wrap">
        <div className="match-board" style={{ '--cols': lv.cols } as CSSProperties}>
          {cards.map((c) => {
            const p = byId[c.pid];
            const done = matched.includes(c.pid);
            const on = done || flipped.includes(c.uid);
            return (
              <button key={c.uid} type="button" className={`mcard${on ? ' on' : ''}${done ? ' done' : ''}`} onClick={() => flip(c)} aria-label={on ? (c.kind === 'img' ? p.name : p.clue) : 'Hidden card'}>
                <span className="mcard-in">
                  <span className="mface mfront"><Gamepad2 size={26} /></span>
                  {c.kind === 'img'
                    ? <span className="mface mback m-img" style={{ '--t': p.tint } as CSSProperties}><img src={`/components/${p.img}.png`} alt="" draggable={false} /><b>{p.name}</b></span>
                    : <span className="mface mback m-clue"><em>I am used to…</em><b>{p.clue}</b></span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="fact7" role="status">{fact ? <>✅ <b>{fact.name}</b>: {fact.clue}.</> : 'Tap a card to start. The timer begins with your first flip.'}</p>
      <p className="match-links"><Link to="/circuit-game">Try Circuit Quest, the wiring game</Link><Link to="/dashboard">See my badges</Link></p>

      {status === 'won' && (
        <div className="win7" role="dialog" aria-modal="true" aria-label="You won">
          {confetti.map((c, i) => <i key={i} className="conf" style={{ left: `${c.l}%`, background: c.c, animationDelay: `${c.d}s`, animationDuration: `${c.t}s` }} />)}
          <div className="win7-card">
            <div className="win7-stars">{[1, 2, 3].map((n) => <span key={n} className={n <= result.stars ? 'on' : ''} style={{ animationDelay: `${n * 0.2}s` }}>★</span>)}</div>
            <h2>{result.stars === 3 ? 'Perfect memory!' : result.stars === 2 ? 'Great job!' : 'You did it!'}</h2>
            <p>{result.score} points in {moves} moves and {fmt(seconds)}.</p>
            <div className="win7-actions">
              <button className="btn7 btn7-sun" onClick={() => reset(levelId)}><RotateCcw size={16} /> Play again</button>
              {nextLevel && <button className="btn7 btn7-coral" onClick={() => reset(nextLevel.id)}>Try {nextLevel.label}</button>}
              <Link to="/dashboard" className="btn7 btn7-glass">My dashboard</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
