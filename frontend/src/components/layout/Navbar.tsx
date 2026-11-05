import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { BookOpen, Box, ChevronDown, Cpu, Gamepad2, HelpCircle, Home, LayoutDashboard, LogOut, UserRound, Menu, Trophy, X } from 'lucide-react';
import { useProgress } from '../../hooks/useProgress';
import { useAuth } from '../../auth/AuthContext';

const MAIN = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/academy', label: 'Learn', icon: BookOpen },
  { to: '/explore', label: '3D Kit', icon: Box },
  { to: '/simulator', label: 'Build', icon: Cpu },
  { to: '/game', label: 'Play', icon: Gamepad2 },
  { to: '/quiz', label: 'Quiz', icon: HelpCircle },
  { to: '/events', label: 'Events', icon: Trophy },
  { to: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
];
const MORE = [
  { to: '/profile', label: 'My profile' },
  { to: '/resources', label: 'Kit components & project codes' },
  { to: '/circuit-game', label: 'Circuit Quest game' },
  { to: '/learn', label: 'Component lessons' },
  { to: '/lab', label: 'Virtual lab' },
  { to: '/challenges', label: 'Challenges' },
  { to: '/results', label: 'Quiz results' },
  { to: '/feedback', label: 'Feedback' },
];

const link = ({ isActive }: { isActive: boolean }) => `nav7-link${isActive ? ' on' : ''}`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const loc = useLocation();
  const { level, xp, title, avatar } = useProgress();
  const { user, logout } = useAuth();

  useEffect(() => { setOpen(false); setMore(false); }, [loc.pathname]);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMore(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <header className="nav7">
      <div className="nav7-bar">
        <Link to="/" className="nav7-logo">
          <span className="nav7-logo-cube"><Cpu size={21} /></span>
          <span><b>IoT Explorer</b><small>Learn · Build · Play</small></span>
        </Link>

        <nav className="nav7-links" aria-label="Main">
          {MAIN.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={link}><Icon size={16} />{label}</NavLink>)}
          <div className="nav7-more" ref={moreRef}>
            <button type="button" className="nav7-link" onClick={() => setMore((m) => !m)} aria-expanded={more}>More <ChevronDown size={14} className={more ? 'flip' : ''} /></button>
            {more && <div className="nav7-menu">{MORE.map((n) => <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'on' : '')}>{n.label}</NavLink>)}</div>}
          </div>
        </nav>

        <Link to="/dashboard" className="nav7-xp" title="Open my dashboard">
          <span className="nav7-avatar">{avatar}</span>
          <span><b>Level {level} · {title}</b><small>{xp} XP</small></span>
        </Link>
        <Link to="/profile" className="nav7-link" title="My profile"><UserRound size={17} /><span>Profile</span></Link>
        <button className="nav7-logout" type="button" onClick={logout} title={`Sign out ${user?.name ?? ''}`}><LogOut size={17} /><span>Sign out</span></button>
        <button className="nav7-burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
      </div>

      {open && (
        <nav className="nav7-mobile" aria-label="Mobile">
          {MAIN.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={link}><Icon size={17} />{label}</NavLink>)}
          {MORE.map((n) => <NavLink key={n.to} to={n.to} className={link}>{n.label}</NavLink>)}
          <button type="button" className="nav7-link" onClick={logout}><LogOut size={17}/> Sign out</button>
        </nav>
      )}
    </header>
  );
}
