import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Box, Cpu, Gamepad2, Play } from 'lucide-react';
import type { CSSProperties } from 'react';
import Tilt from '../components/ui/Tilt';
import ProgressRing from '../components/ui/ProgressRing';
import { GAME_PARTS } from '../data/gameParts';
import { LEARNING_TOPICS } from '../data/learningTopics';
import { SIM_PROJECTS } from '../data/simProjects';
import { KIT_COMPONENTS } from '../data/kitComponents';
import { useProgress } from '../hooks/useProgress';

// three.js is large, so the 3D hero loads after the first paint.
const HeroScene = lazy(() => import('../components/three/HeroScene'));

const ADVENTURES = [
  { to: '/academy', title: 'Learn', text: `${LEARNING_TOPICS.length} short topics with quizzes, in Tamil or English.`, img: 'arduino-uno', tone: 'violet' },
  { to: '/explore', title: 'Explore in 3D', text: 'Spin, zoom and tap every part of the kit.', img: 'breadboard', tone: 'aqua' },
  { to: '/simulator', title: 'Build circuits', text: `Wire ${SIM_PROJECTS.length} circuits and watch them run.`, img: 'dht11', tone: 'sun' },
  { to: '/game', title: 'Play Part Match', text: 'Flip 3D cards and match each part to its job.', img: 'servo', tone: 'coral', isNew: true },
  { to: '/quiz', title: 'Quiz & certificate', text: 'Score 60 or more and download your certificate.', img: 'leds', tone: 'mint' },
];

const STATS = [
  { n: LEARNING_TOPICS.length, label: 'topics' },
  { n: SIM_PROJECTS.length, label: 'circuit labs' },
  { n: KIT_COMPONENTS.length, label: '3D kit parts' },
  { n: 2, label: 'games' },
];

export default function Home() {
  const { pct, level, title, avatar, xp, next } = useProgress();
  const strip = [...GAME_PARTS, ...GAME_PARTS];

  return (
    <div className="home7">
      <section className="hero7">
        <motion.div className="hero7-copy" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="pill7">Made for school students</span>
          <h1>Learn Embedded-IoT</h1>
          <p>Explore real components in 3D, wire up circuits, play the Part Match game and earn badges. You don't need any hardware.</p>
          <div className="hero7-actions">
            <Link to="/academy" className="btn7 btn7-sun"><Play size={18} fill="currentColor" /> Start learning</Link>
            <Link to="/game" className="btn7 btn7-glass"><Gamepad2 size={18} /> Play Part Match</Link>
            <Link to="/explore" className="btn7 btn7-glass"><Box size={18} /> 3D kit</Link>
          </div>
          <ul className="hero7-stats">{STATS.map((s) => <li key={s.label}><b>{s.n}</b><span>{s.label}</span></li>)}</ul>
        </motion.div>

        <div className="hero7-stage">
          <Suspense fallback={<div className="grid h-full place-items-center"><img src="/components/arduino-uno.png" alt="" className="hero-fallback" /></div>}>
            <HeroScene />
          </Suspense>
          <span className="stage-hint">Move your mouse or finger over the board</span>
        </div>
      </section>

      <section className="sec7">
        <div className="sec7-head"><h2>Pick your adventure</h2><p>Start anywhere. Every activity earns XP and moves your progress bar.</p></div>
        <div className="adv-grid">
          {ADVENTURES.map((a) => (
            <Tilt key={a.to}>
              <Link to={a.to} className={`adv adv-${a.tone}`}>
                {a.isNew && <span className="adv-new">NEW</span>}
                <img className="pop adv-img" src={`/components/${a.img}.png`} alt="" draggable={false} />
                <h3 className="pop2">{a.title}</h3>
                <p>{a.text}</p>
                <span className="adv-go">Open <ArrowRight size={16} /></span>
              </Link>
            </Tilt>
          ))}
        </div>
      </section>

      <section className="sec7 tight">
        <div className="sec7-head"><h2>Meet the parts</h2><p>These are the real components you will learn about and play with.</p></div>
        <div className="marq">
          <div className="marq-track">
            {strip.map((p, i) => (
              <div className="part7" key={`${p.id}-${i}`}>
                <div className="pimg" style={{ '--t': p.tint } as CSSProperties}><img src={`/components/${p.img}.png`} alt={p.name} draggable={false} /></div>
                <b>{p.name}</b><small>{p.clue}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec7">
        <div className="split7">
          <div className="panel7 progress-panel">
            <ProgressRing pct={pct} size={150}><b>{pct}%</b><small>done</small></ProgressRing>
            <div>
              <h3>{avatar} Level {level}: {title}</h3>
              <p>{xp} XP earned so far.</p>
              {next && <p className="next-line">Next step: <Link to={next.to}>{next.cta}</Link></p>}
              <Link to="/dashboard" className="btn7 btn7-sun sm">Open my dashboard</Link>
            </div>
          </div>
          <div className="panel7 game-panel">
            <div className="mini-flips" aria-hidden="true">
              {['dht11', 'relay', 'servo'].map((f, i) => (
                <div className="mini-flip" key={f} style={{ animationDelay: `${i * 0.9}s` }}>
                  <div className="mini-face mf-front">?</div>
                  <div className="mini-face mf-back"><img src={`/components/${f}.png`} alt="" /></div>
                </div>
              ))}
            </div>
            <div>
              <h3>Part Match 3D</h3>
              <p>Flip the cards, find each part and its job. Win three stars on every level to unlock the Memory Master badge.</p>
              <Link to="/game" className="btn7 btn7-coral sm"><Gamepad2 size={16} /> Play now</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="foot7"><span className="foot7-logo"><Cpu size={16} /> IoT Explorer</span><span>Learn, build and play. Simulated circuits only, so never connect mains power to real hardware.</span></footer>
    </div>
  );
}
