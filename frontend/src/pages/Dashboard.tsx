import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { ArrowRight, Gamepad2, HelpCircle, BookOpen, Cpu } from 'lucide-react';
import ProgressRing from '../components/ui/ProgressRing';
import { useProgress } from '../hooks/useProgress';

const ACTIONS = [
  { to: '/academy', label: 'Continue learning', icon: BookOpen, tone: 'violet' },
  { to: '/simulator', label: 'Build a circuit', icon: Cpu, tone: 'aqua' },
  { to: '/game', label: 'Play Part Match', icon: Gamepad2, tone: 'coral' },
  { to: '/quiz', label: 'Take the quiz', icon: HelpCircle, tone: 'sun' },
];

export default function Dashboard() {
  const { s, items, pct, xp, level, title, avatar, into, need, badges, next } = useProgress();
  const earned = badges.filter((b) => b.earned).length;
  const bestGame = Object.entries(s.gameBest);

  return (
    <div className="page7 dash7">
      <section className="dash-hero">
        <div className="dash-who">
          <div className="dash-avatar">{avatar}</div>
          <div>
            <p className="dash-hi">{s.studentName ? `Hi, ${s.studentName}!` : 'Hi, Explorer!'}</p>
            <h1>Level {level}: {title}</h1>
            <div className="xp7" aria-label={`${into} of ${need} XP to next level`}><i style={{ width: `${(into / need) * 100}%` }} /></div>
            <p className="dash-sub">{xp} XP total · {need - into} XP to Level {level + 1}</p>
            {next && <Link to={next.to} className="dash-next">Next step: {next.cta} <ArrowRight size={15} /></Link>}
          </div>
        </div>
        <ProgressRing pct={pct} size={170}><b>{pct}%</b><small>overall</small></ProgressRing>
      </section>

      <section className="dash-actions" aria-label="Quick actions">
        {ACTIONS.map(({ to, label, icon: Icon, tone }) => <Link key={to} to={to} className={`qa qa-${tone}`}><Icon size={22} />{label}</Link>)}
      </section>

      <h2 className="dash-h">My progress</h2>
      <section className="stat-grid">
        {items.map((i) => {
          const f = Math.round((i.done / i.total) * 100);
          return (
            <Link key={i.key} to={i.to} className="stat7" style={{ '--c': i.color } as CSSProperties}>
              <span className="stat7-emoji">{i.emoji}</span>
              <b className="stat7-num">{i.text ?? `${i.done} / ${i.total}`}</b>
              <span className="stat7-label">{i.label}</span>
              <span className="bar7"><i style={{ width: `${f}%` }} /></span>
            </Link>
          );
        })}
      </section>

      <div className="dash-cols">
        <section className="panel7">
          <h2 className="dash-h sm">Badges <small>{earned} of {badges.length} earned</small></h2>
          <div className="badge-grid">
            {badges.map((b) => (
              <div key={b.id} className={`badge7${b.earned ? ' on' : ''}`} title={b.hint}>
                <span>{b.earned ? b.emoji : '🔒'}</span><b>{b.name}</b><small>{b.earned ? 'Earned!' : b.hint}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="panel7">
          <h2 className="dash-h sm">My profile</h2>
          <label className="pf">Name<input className="form-field" value={s.studentName} onChange={(e) => s.setStudent({ studentName: e.target.value })} placeholder="Your name" /></label>
          <label className="pf">School<input className="form-field" value={s.schoolName} onChange={(e) => s.setStudent({ schoolName: e.target.value })} placeholder="Your school" /></label>
          <label className="pf">Class<input className="form-field" value={s.className} onChange={(e) => s.setStudent({ className: e.target.value })} placeholder="e.g. 9" /></label>
          <ul className="pf-list">
            <li><span>Final quiz</span><b>{s.quiz ? `${s.quiz.score} / ${s.quiz.total} (${s.quiz.passed ? 'passed' : 'not passed yet'})` : 'Not taken'}</b></li>
            <li><span>Feedback</span><b>{s.feedback ? 'Submitted' : 'Pending'}</b></li>
            <li><span>Certificate</span><b>{s.certificateDownloaded ? `Downloaded ${s.certificateId ?? ''}` : 'Not downloaded'}</b></li>
            {bestGame.map(([id, g]) => <li key={id}><span>Part Match · {id}</span><b>{'★'.repeat(g.stars)} {g.score} pts</b></li>)}
          </ul>
          <div className="pf-actions">
            <Link to="/certificate" className="btn7 btn7-sun sm">Certificate</Link>
            <Link to="/feedback" className="btn7 btn7-glass sm">Feedback</Link>
            <button className="btn7 btn7-glass sm" onClick={() => { if (confirm('Clear all saved progress on this device?')) s.resetAll(); }}>Reset progress</button>
          </div>
        </section>
      </div>
    </div>
  );
}
