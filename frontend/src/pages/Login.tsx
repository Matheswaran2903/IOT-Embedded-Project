import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Cpu, Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound, ArrowRight, CircuitBoard, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const requirements = [{ ok: password.length >= 8, label: 'At least 8 characters' }, { ok: /[A-Z]/.test(password), label: 'Add an uppercase letter' }, { ok: /[a-z]/.test(password), label: 'Add a lowercase letter' }, { ok: /[0-9]/.test(password), label: 'Add a number' }, { ok: /[^A-Za-z0-9]/.test(password), label: 'Add special characters (!@#$...)' }];
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      if (mode === 'register') await register(name.trim(), email.trim(), password);
      else await login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally { setBusy(false); }
  }

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-one" /><div className="auth-orb auth-orb-two" />
      <div className="auth-shell">
        <div className="auth-brand"><span className="auth-brand-icon"><Cpu size={23} /></span><span><b>IoT Explorer</b><small>LEARN · BUILD · INNOVATE</small></span></div>
        <section className="auth-card">
          <div className="auth-card-top"><div className="auth-mark"><CircuitBoard size={25} /></div><span className="auth-pill"><Sparkles size={13} /> YOUR NEXT IDEA STARTS HERE</span></div>
          <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="auth-subtitle">{mode === 'login' ? 'Sign in and continue exploring the world of IoT.' : 'Join a community of curious minds and makers.'}</p>
          <div className="auth-tabs"><button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); }}>Sign in</button><button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); }}>Create account</button></div>
          <form onSubmit={submit} className="auth-form">
            {mode === 'register' && <label className="auth-label">Full name<div className="auth-input-wrap"><UserRound size={17} /><input autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" required minLength={2} maxLength={80} /></div></label>}
            <label className="auth-label">Email address<div className="auth-input-wrap"><Mail size={17} /><input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></div></label>
            <label className="auth-label">Password<div className="auth-input-wrap"><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'login' ? 'Enter your password' : 'At least 8 characters'} required minLength={mode === 'register' ? 8 : 1} maxLength={128} /><button type="button" className="auth-eye" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            {mode === 'register' && <div className="rounded-xl bg-slate-900/70 p-3 text-sm" aria-live="polite">{requirements.map(r => <p key={r.label} className={r.ok ? 'text-green-300' : 'text-slate-300'}>{r.ok ? '✓' : '○'} {r.label}</p>)}</div>}
            {error && <div className="auth-error" role="alert">{error}</div>}
            <button className="auth-submit" type="submit" disabled={busy || (mode === 'register' && !requirements.every(r => r.ok))}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in to IoT Explorer' : 'Create my account'}<ArrowRight size={17} /></button>
          </form>
          <div className="auth-security"><ShieldCheck size={15} /><span>Your account and learning progress stay protected.</span></div>
        </section>
        <p className="auth-footer">A space to explore ideas, experiment with technology, and build what’s next.</p>
      </div>
    </div>
  );
}
