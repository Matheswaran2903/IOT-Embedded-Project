import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CheckCircle2, Users } from 'lucide-react';
import { EVENT, fmtDate } from '../data/eventConfig';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../auth/AuthContext';
import { eventApi } from '../services/api';
import { syncEventFromServer } from '../services/eventSync';

export default function EventRegister() {
  const nav = useNavigate();
  const { user } = useAuth();
  const ev = useAppStore(s => s.event);
  const [form, setForm] = useState({
    name: user?.name ?? '', email: user?.email ?? '', parentEmail: '',
    school: user?.school && user.school !== 'Independent learner' ? user.school : '',
    className: user?.class_name && user.class_name !== 'Open' ? user.class_name : '',
    city: user?.city ?? '', team: '',
  });
  const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const now = new Date(); const opens = new Date(EVENT.registrationOpens + 'T00:00:00'); const closes = new Date(EVENT.registrationCloses + 'T23:59:59');
  const open = now >= opens && now <= closes;
  const update = (key: keyof typeof form, value: string) => setForm(old => ({ ...old, [key]: value }));

  // Always start from what the SERVER knows, so this page and the dashboard can never disagree.
  useEffect(() => { syncEventFromServer().catch(() => setError('Cannot reach the server. Start the backend and refresh this page.')); }, [user?.id]);
  useEffect(() => { if (ev.profile) setForm(f => ({ ...f, name: ev.profile!.name, school: ev.profile!.school, className: ev.profile!.className, city: ev.profile!.city, parentEmail: ev.profile!.parentEmail, team: ev.profile!.team })); }, [ev.profile?.at]);

  const submit = async (e: FormEvent) => {
    e.preventDefault(); if (!open || busy || ev.profile) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const r = await eventApi.register({ name: form.name, school: form.school, class_name: form.className, parent_email: form.parentEmail, city: form.city, team: form.team });
      await syncEventFromServer();
      const st = (r.email_status ?? []).find((m: { to: string }) => m.to === user?.email)?.status;
      setMessage(st === 'sent' ? `Registration saved. A confirmation e-mail was sent to ${user?.email}.` : st === 'failed' ? 'Registration saved, but the confirmation e-mail could not be delivered (check the SMTP settings on the server).' : 'Registration saved. E-mail was not delivered because SMTP is not configured on the server (see EMAIL_SETUP.md).');
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Registration failed';
      if (/already registered/i.test(text)) { await syncEventFromServer().catch(() => {}); setMessage('You are already registered for this event.'); } else setError(text);
    } finally { setBusy(false); }
  };

  return <div className="mx-auto max-w-3xl px-4 py-8"><Link to="/events" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-200"><ArrowLeft size={16}/> Back to Events</Link><section className="academy-hero mt-4 rounded-[2rem] border border-white/10 p-6 md:p-8"><div className="flex items-center gap-2 text-sm font-bold text-orange-200"><Users size={18}/> STUDENT EVENT REGISTRATION</div><h1 className="mt-3 text-3xl font-black md:text-4xl">Join the IoT Young Innovators Hackathon</h1><p className="mt-2 text-slate-300">Register as an individual or team. Your confirmation is e-mailed to <b>{user?.email}</b>; add a teacher or parent email to copy them too.</p><div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-300"><span className="flex items-center gap-1"><CalendarDays size={14}/> Opens {fmtDate(EVENT.registrationOpens)}</span><span>Closes {fmtDate(EVENT.registrationCloses)}</span></div></section>
    {ev.profile && <div className="mt-4 rounded-xl border border-emerald-300/30 bg-emerald-400/10 p-3 text-sm text-emerald-100"><CheckCircle2 className="mr-2 inline" size={16}/>Registered as {ev.profile.name}. <button onClick={() => nav('/events')} className="ml-1 font-bold underline">Go to event dashboard →</button></div>}
    <form onSubmit={submit} className="glass mt-5 grid gap-4 p-5 md:grid-cols-2 md:p-7">{([['name','Student full name','text',true],['email','Account e-mail (notifications are sent here)','email',true],['parentEmail','Parent / teacher email (optional)','email',false],['school','School name','text',true],['city','City / district','text',true],['team','Team name (optional)','text',false]] as [keyof typeof form,string,string,boolean][]).map(([key,label,type,required])=><label key={key} className="text-xs font-semibold text-slate-300">{label}<input required={required} type={type} className="form-field" value={form[key]} readOnly={key === 'email' || !!ev.profile} onChange={e=>update(key,e.target.value)} placeholder={label}/></label>)}<label className="text-xs font-semibold text-slate-300">Class / Grade<select required disabled={!!ev.profile} className="form-field" value={form.className} onChange={e=>update('className',e.target.value)}><option value="">Select class</option>{['6','7','8','9','10','11','12','Diploma','Other'].map(x=><option key={x}>{x}</option>)}</select></label><div className="flex items-end"><button className="btn-primary w-full" disabled={!open || busy || !!ev.profile} type="submit">{ev.profile ? 'Already registered' : busy ? 'Registering…' : open ? 'Complete registration' : 'Registration not open'}</button></div><p className="text-xs leading-5 text-slate-500 md:col-span-2">{open ? 'Please check all details before submitting.' : 'Registration window: ' + fmtDate(EVENT.registrationOpens) + ' – ' + fmtDate(EVENT.registrationCloses) + '.'}</p></form>
    {error && <div role="alert" className="mt-4 rounded-xl border border-rose-300/30 bg-rose-400/10 p-4 text-sm text-rose-100">{error}</div>}
    {message && <div className="mt-4 rounded-xl border border-emerald-300/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">{message} <button onClick={()=>nav('/events')} className="ml-2 font-bold underline">Go to event dashboard →</button></div>}
  </div>;
}
