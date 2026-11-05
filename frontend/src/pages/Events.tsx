import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Award, CalendarDays, CheckCircle2, UploadCloud, Gavel, Lock, Mail, Rocket, Trophy, Video } from 'lucide-react';
import { EVENT, fmtDate } from '../data/eventConfig';
import { LEARNING_TOPICS } from '../data/learningTopics';
import { SIM_PROJECTS } from '../data/simProjects';
import { useAppStore } from '../store/useAppStore';
import { syncEventFromServer } from '../services/eventSync';
import { eventApi } from '../services/api';
import { useAuth } from '../auth/AuthContext';
import Tilt from '../components/ui/Tilt';
import Hero3D from '../components/three/Hero3D';
import { generateGenericCertificate } from '../components/certificate/generatePdf';
import { makeCertificateId } from '../components/certificate/generateCertificate';

const STAGES = [['Register', '📝'], ['Presentation slot', '🎤'], ['Create project', '🧰'], ['Upload', '📤'], ['Evaluation', '🧑‍⚖️'], ['Certificate', '🎓']];
const PH = (a: string, b: string) => { const n = new Date(); const s = new Date(a + 'T00:00:00'), e = new Date(b + 'T23:59:59'); return n < s ? 'Not open yet' : n > e ? 'Closed' : 'Open now'; };

function Card({ n, title, locked, done, children }: { n: number; title: string; locked: boolean; done: boolean; children: ReactNode }) {
  return <section className={`glass p-5 md:p-6 ${locked ? 'opacity-60' : ''}`}><div className="mb-3 flex items-center gap-3"><span className={`grid h-9 w-9 place-items-center rounded-xl font-black ${done ? 'bg-emerald-400/20 text-emerald-200' : 'bg-orange-300/10 text-orange-200'}`}>{done ? '✓' : n}</span><h2 className="text-xl font-extrabold">{title}</h2>{locked && <Lock size={16} className="text-slate-400" />}</div>{locked ? <p className="text-sm text-slate-400">Complete the previous step to unlock this one.</p> : children}</section>;
}

export default function Events() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const { event: ev } = useAppStore();
  const [mailLog, setMailLog] = useState<Awaited<ReturnType<typeof eventApi.mails>>>([]);
  const [ok, setOk] = useState(false);
  const [f, setF] = useState({ name: user?.name ?? '', email: user?.email ?? '', parentEmail: '', school: user?.school && user.school !== 'Independent learner' ? user.school : '', className: user?.class_name && user.class_name !== 'Open' ? user.class_name : '', city: user?.city ?? '', team: '' });
  const [slot, setSlot] = useState({ date: EVENT.presentationDates[0], time: EVENT.presentationTimes[0], mode: 'Online (Google Meet)' });
  const [pr, setPr] = useState({ title: '', problem: '', description: '', code: '', simId: '', topics: [] as number[] });
  const [file, setFile] = useState<File | null>(null); const [link, setLink] = useState(''); const [msg, setMsg] = useState('');
  const up = (k: keyof typeof f, v: string) => setF(x => ({ ...x, [k]: v }));
  const stageDone = [!!ev.profile, !!ev.slot, !!ev.project, !!ev.submission, !!ev.evaluation, !!ev.certId];
  const current = stageDone.findIndex(d => !d); const cur = current === -1 ? 5 : current;
  const loadMails = () => eventApi.mails().then(setMailLog).catch(() => {});
  const say = (text: string, good = false) => { setMsg(text); setOk(good); };
  useEffect(() => {
    eventApi.count().then(r => setRegistrations(r.count)).catch(() => setRegistrations(null));
    syncEventFromServer().catch(() => say('Cannot reach the server. Start the backend (cd server && npm run dev) and refresh this page.'));
    loadMails();
  }, [user?.id]);
  // Mails are sent in the background by the server, so check again a few seconds after each step.
  const refreshMailsSoon = () => { setTimeout(loadMails, 1500); setTimeout(loadMails, 5000); };

  const register = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return; setBusy(true); say('');
    try {
      const r = await eventApi.register({ name: f.name, school: f.school, class_name: f.className, parent_email: f.parentEmail, city: f.city, team: f.team });
      setRegistrations(v => v === null ? null : v + 1);
      await syncEventFromServer();
      const st = (r.email_status ?? []).find((m: { to: string }) => m.to === user?.email)?.status;
      say(st === 'sent' ? `Registration saved. Confirmation e-mail sent to ${user?.email}.` : st === 'failed' ? 'Registration saved, but the confirmation e-mail could not be delivered (check the SMTP settings on the server).' : 'Registration saved. E-mail was not delivered because SMTP is not configured on the server (see EMAIL_SETUP.md).', true);
      refreshMailsSoon();
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Registration failed';
      if (/already registered/i.test(text)) { await syncEventFromServer().catch(() => {}); say('You are already registered - your saved details are shown below.', true); }
      else say(text);
    } finally { setBusy(false); }
  };
  const enroll = async () => { try { await eventApi.slot(slot); await syncEventFromServer(); } catch (err) { say(err instanceof Error ? err.message : 'Slot booking failed'); return; } say(`Presentation booked. Details sent to ${user?.email}.`, true); refreshMailsSoon(); };
  const saveProject = async (e: FormEvent) => { e.preventDefault(); if (!pr.topics.length) { say('Choose at least one topic/component for your project.'); return; } try { await eventApi.project({title:pr.title,problem:pr.problem,description:pr.description,code:pr.code,sim_id:pr.simId,topics:pr.topics}); await syncEventFromServer(); } catch(err) { say(err instanceof Error ? err.message : 'Project save failed'); return; } say('Project saved.', true); refreshMailsSoon(); };
  const upload = async () => {
    if (new Date() > new Date(EVENT.uploadDeadline + 'T23:59:59')) { say('The project upload deadline has passed.'); return; }
    if (!file && !link.trim()) { say('Choose a file or paste a demo link.'); return; }
    if (file && file.size > 25 * 1024 * 1024) { say('File must be smaller than 25 MB.'); return; }
    try { await eventApi.submission(file,link.trim()); await syncEventFromServer(); } catch(err) { say(err instanceof Error ? err.message : 'Upload failed'); return; } say('Submission saved.', true); refreshMailsSoon();
  };
  const certificate = async () => {
    if (!ev.profile || !ev.evaluation) return; const ach = ev.evaluation.total >= EVENT.passScore; const winner = (ev.evaluation.award ?? 'Participant') !== 'Participant' && ev.evaluation.award !== 'Finalist'; const id = ev.certId ?? makeCertificateId();
    await generateGenericCertificate({ heading: winner ? `${ev.evaluation.award} · Winner Certificate` : ach ? 'Certificate of Achievement' : 'Certificate of Participation', name: ev.profile.name, line1: `of ${ev.profile.school}, Class ${ev.profile.className}, ${winner ? `won the ${ev.evaluation.award} award at` : ach ? 'achieved in' : 'participated in'} ${EVENT.name} with the project "${ev.project?.title}"${ach ? ` and scored ${ev.evaluation.total} out of 100` : ''}${ev.profile.team ? ` as team ${ev.profile.team}` : ''}.`, line2: `Event: ${fmtDate(EVENT.eventStart)} – ${fmtDate(EVENT.eventEnd)}`, id, date: new Date().toLocaleDateString('en-IN'), accent: [194, 65, 12] });
  };
  const toggleTopic = (id: number) => setPr(p => ({ ...p, topics: p.topics.includes(id) ? p.topics.filter(x => x !== id) : [...p.topics, id] }));

  return <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
    <section className="event-hero relative overflow-hidden rounded-[2rem] border border-white/10 p-7 md:p-10"><div className="absolute -right-10 top-0 h-64 w-64 rounded-full bg-orange-400/20 blur-3xl" />
      <div className="relative grid items-center gap-6 md:grid-cols-[1.3fr_.7fr]"><div><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-300/30 bg-orange-300/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-200"><Rocket size={14} /> IoT Hackathon · போட்டி</div>
        <h1 className="text-4xl font-black leading-tight md:text-5xl">{EVENT.name.replace(' 2026', '')} <span className="text-orange-300">2026</span></h1><p className="mt-3 max-w-xl text-slate-300">Build an IoT project using any of the 30 topics, register your team, present online, submit your project, move through evaluation rounds and receive a certificate or winner award.</p><div className="mt-5 flex flex-wrap gap-3"><Link className="btn-primary" to="/events/register">Student registration →</Link><a className="btn-ghost" href={EVENT.meetingLink} target="_blank" rel="noreferrer">Online presentation room</a></div></div>
        <div className="hero3d"><Hero3D variant="event" emoji="🏆" /></div></div></section>

    <section className="glass my-5 p-5" aria-live="polite"><p className="text-sm text-slate-300">Students registered for this event</p><p className="mt-1 text-3xl font-black text-cyan-200">{registrations === null ? 'Unavailable' : registrations.toLocaleString()}</p><p className="text-xs text-slate-400">Live count from the event database</p></section>
    <div className="my-6 grid gap-3 sm:grid-cols-4">{[['Registration', `${fmtDate(EVENT.registrationOpens)} – ${fmtDate(EVENT.registrationCloses)}`, PH(EVENT.registrationOpens, EVENT.registrationCloses)], ['Event starts', fmtDate(EVENT.eventStart), PH(EVENT.eventStart, EVENT.eventEnd)], ['Event ends', fmtDate(EVENT.eventEnd), ''], ['Upload deadline', fmtDate(EVENT.uploadDeadline), PH(EVENT.eventStart, EVENT.uploadDeadline)]].map(([l, v, s]) => <Tilt key={l} className="glass p-4"><CalendarDays className="pop2 text-orange-200" size={18} /><p className="mt-2 text-xs text-slate-400">{l}</p><p className="text-sm font-extrabold">{v}</p>{s && <p className="mt-1 text-[10px] font-bold uppercase text-cyan-200">{s}</p>}</Tilt>)}</div>

    <section className="glass mb-6 p-5"><div className="mb-4 flex items-center gap-2"><Gavel className="text-orange-200" size={19}/><h2 className="text-xl font-extrabold">Event evaluation & results timeline</h2></div><div className="grid gap-3 md:grid-cols-3">{EVENT.evaluationRounds.map((round,i)=><div key={round.name} className="rounded-xl border border-white/10 bg-white/[.03] p-4"><p className="text-xs font-bold uppercase tracking-wider text-orange-200">Stage {i+1}</p><h3 className="mt-1 font-extrabold">{round.name}</h3><p className="mt-1 text-sm text-cyan-200">{round.date}</p><p className="mt-2 text-xs leading-5 text-slate-400">{round.detail}</p></div>)}</div><p className="mt-3 text-xs text-slate-500">Online event schedule is shown in IST. The organiser must replace the demo meeting URL and configure real hosting, file storage and judge accounts before publishing.</p></section>

    <ol className="mb-6 grid grid-cols-3 gap-2 md:grid-cols-6">{STAGES.map(([t, ic], i) => <li key={t} className={`rounded-xl border p-3 text-center text-xs ${stageDone[i] ? 'border-emerald-300/40 bg-emerald-400/10' : i === cur ? 'border-orange-300/60 bg-orange-300/10' : 'border-white/10 bg-white/[.03]'}`}><div className="text-2xl">{stageDone[i] ? '✅' : ic}</div><div className="mt-1 font-bold">{i + 1}. {t}</div></li>)}</ol>
    {msg && <p role="alert" className={`mb-4 rounded-xl border p-3 text-sm ${ok ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100' : 'border-rose-300/30 bg-rose-400/10 text-rose-100'}`}>{msg}</p>}

    <div className="space-y-5">
      <Card n={1} title="Register for the event" locked={false} done={stageDone[0]}>{ev.profile ? <p className="text-sm text-emerald-200">✓ Registered as <b>{ev.profile.name}</b> · {ev.profile.school}, Class {ev.profile.className}. Email: {ev.profile.email}. Confirmation e-mail status is shown in the notifications box below.</p> :
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={register}>{([['name', 'Student full name', 'text', true], ['email', 'Account e-mail (notifications are sent here)', 'email', true], ['parentEmail', 'Parent / teacher email (optional)', 'email', false], ['school', 'School name', 'text', true], ['city', 'City / district', 'text', true], ['team', 'Team name (optional)', 'text', false]] as [keyof typeof f, string, string, boolean][]).map(([k, l, ty, rq]) => <label key={k} className="text-xs text-slate-300">{l}<input required={rq} type={ty} value={f[k]} readOnly={k === 'email'} onChange={e => up(k, e.target.value)} className="form-field" />{k === 'email' && <span className="mt-1 block text-[10px] text-slate-500">Confirmation e-mails go to your account e-mail.</span>}</label>)}
          <label className="text-xs text-slate-300">Class<select required value={f.className} onChange={e => up('className', e.target.value)} className="form-field"><option value="">Select class</option>{['6', '7', '8', '9', '10', '11', '12'].map(c => <option key={c}>{c}</option>)}</select></label>
          <div className="flex items-end"><button className="btn-primary w-full" type="submit" disabled={busy}>{busy ? 'Registering…' : 'Register →'}</button></div><p className="text-[11px] text-slate-500 sm:col-span-2">School students should register with a teacher’s or parent’s guidance. Do not share private information publicly.</p></form>}</Card>

      <Card n={2} title="Enrol for the online presentation" locked={!stageDone[0]} done={stageDone[1]}>{ev.slot ? <p className="text-sm text-emerald-200">✓ Slot: <b>{fmtDate(ev.slot.date)}, {ev.slot.time}</b> · {ev.slot.mode}. <a className="underline" href={EVENT.meetingLink} target="_blank" rel="noreferrer">Meeting link</a></p> :
        <div className="grid gap-3 sm:grid-cols-3"><label className="text-xs text-slate-300">Date<select className="form-field" value={slot.date} onChange={e => setSlot(s => ({ ...s, date: e.target.value }))}>{EVENT.presentationDates.map(d => <option key={d} value={d}>{fmtDate(d)}</option>)}</select></label><label className="text-xs text-slate-300">Time (IST)<select className="form-field" value={slot.time} onChange={e => setSlot(s => ({ ...s, time: e.target.value }))}>{EVENT.presentationTimes.map(t => <option key={t}>{t}</option>)}</select></label><label className="text-xs text-slate-300">Mode<select className="form-field" value={slot.mode} onChange={e => setSlot(s => ({ ...s, mode: e.target.value }))}><option>Online (Google Meet)</option><option>Pre-recorded video</option></select></label><button className="btn-primary sm:col-span-3" onClick={enroll}><Video size={16} /> Book my presentation</button></div>}</Card>

      <Card n={3} title="Create your project" locked={!stageDone[1]} done={stageDone[2]}>{ev.project ? <p className="text-sm text-emerald-200">✓ Project: <b>{ev.project.title}</b> · {ev.project.topics.length} topics used.</p> :
        <form className="grid gap-3" onSubmit={saveProject}><label className="text-xs text-slate-300">Project title<input required className="form-field" value={pr.title} onChange={e => setPr({ ...pr, title: e.target.value })} placeholder="e.g. Smart plant watering alert" /></label><label className="text-xs text-slate-300">Problem you are solving<input required className="form-field" value={pr.problem} onChange={e => setPr({ ...pr, problem: e.target.value })} /></label><label className="text-xs text-slate-300">How it works<textarea required rows={3} className="form-field" value={pr.description} onChange={e => setPr({ ...pr, description: e.target.value })} /></label>
          <div><p className="mb-1 text-xs text-slate-300">Topics / components used (tap to select)</p><div className="flex flex-wrap gap-1.5">{LEARNING_TOPICS.map(t => <button type="button" key={t.id} onClick={() => toggleTopic(t.id)} className={`rounded-full border px-2.5 py-1 text-[11px] ${pr.topics.includes(t.id) ? 'border-orange-300 bg-orange-300/20' : 'border-white/10 text-slate-300'}`}>{t.icon} {t.title}</button>)}</div></div>
          <label className="text-xs text-slate-300">Test your circuit first in the <Link className="underline" to="/simulator">Simulation Lab</Link>, then pick the closest one<select className="form-field" value={pr.simId} onChange={e => setPr({ ...pr, simId: e.target.value })}><option value="">— none —</option>{SIM_PROJECTS.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select></label>
          <label className="text-xs text-slate-300">Arduino code (paste)<textarea rows={4} className="form-field font-mono" value={pr.code} onChange={e => setPr({ ...pr, code: e.target.value })} /></label><button className="btn-primary" type="submit">Save project</button></form>}</Card>

      <Card n={4} title="Upload to the event website" locked={!stageDone[2]} done={stageDone[3]}>{ev.submission ? <div className="text-sm text-emerald-200">✓ Submitted {ev.submission.fileName || 'demo link'}. <Tilt className="mt-3 max-w-sm rounded-2xl border border-orange-300/30 bg-orange-300/5 p-4 text-white"><p className="text-[10px] font-bold uppercase text-orange-200">Event website gallery</p><p className="pop2 mt-1 text-lg font-black">{ev.project?.title}</p><p className="text-xs text-slate-300">by {ev.profile?.name} · {ev.profile?.school}</p></Tilt></div> :
        <div className="grid gap-3 md:grid-cols-2"><label className="cursor-pointer rounded-xl border border-dashed border-white/20 p-5 text-center hover:border-orange-300/50"><UploadCloud className="mx-auto mb-2 text-orange-200" /><span className="block text-sm font-bold">{file ? file.name : 'Choose report / video / ZIP'}</span><span className="text-xs text-slate-500">PDF, ZIP, PPTX, MP4 · max 25 MB</span><input className="sr-only" type="file" accept=".pdf,.zip,.ppt,.pptx,.mp4,.doc,.docx" onChange={e => setFile(e.target.files?.[0] ?? null)} /></label><div className="space-y-3"><label className="text-xs text-slate-300">Or demo video / repository link<input className="form-field" value={link} onChange={e => setLink(e.target.value)} placeholder="https://" /></label><button className="btn-primary w-full" onClick={upload}>Submit project</button></div>
          <p className="text-[11px] text-slate-500 md:col-span-2">Your file is uploaded to the event server. Allowed: PDF, ZIP, PPT/PPTX, DOC/DOCX, MP4 (max 25 MB).</p></div>}</Card>

      <Card n={5} title="Evaluation" locked={!stageDone[3]} done={stageDone[4]}>{ev.evaluation ? <div className="text-sm"><p className="text-emerald-200">✓ Score: <b>{ev.evaluation.total} / 100</b></p><p className="mt-1 text-slate-300">Judge remark: {ev.evaluation.remark}</p><ul className="mt-2 grid gap-1 text-xs text-slate-400 sm:grid-cols-2">{EVENT.rubric.map((r, i) => <li key={r[0]}>{r[0]}: {ev.evaluation!.scores[i]} / {r[1]}</li>)}</ul></div> :
        <div><p className="text-sm text-slate-300">Judges review your project during {EVENT.evaluationDates}. Status: <b className="text-orange-200">Under evaluation</b>.</p>
<p className="mt-2 text-xs text-slate-500">Results are published by the judges. Refresh this page after the results date ({fmtDate(EVENT.resultsOn)}).</p></div>}</Card>

      <Card n={6} title="Result & certificate" locked={!stageDone[4]} done={stageDone[5]}>{ev.evaluation && <div className="text-center"><div className={`mx-auto max-w-md rounded-2xl border p-5 ${ev.evaluation.total >= EVENT.passScore ? 'border-emerald-300/40 bg-emerald-400/10' : 'border-amber-300/40 bg-amber-400/10'}`}><Trophy className="mx-auto" /><p className="mt-2 text-xl font-black">{(ev.evaluation.award ?? 'Participant') !== 'Participant' ? `🏆 ${ev.evaluation.award}` : ev.evaluation.total >= EVENT.passScore ? '🎉 Certificate of Achievement' : 'Certificate of Participation'}</p><p className="mt-1 text-sm text-slate-200">{(ev.evaluation.award ?? 'Participant') !== 'Participant' ? `Congratulations! Your team received ${ev.evaluation.award}. Score: ${ev.evaluation.total}/100.` : ev.evaluation.total >= EVENT.passScore ? `You scored ${ev.evaluation.total}/100 — well done!` : `You scored ${ev.evaluation.total}/100 (Achievement needs ${EVENT.passScore}). Thank you for taking part — keep building!`}</p></div><button className="btn-primary mx-auto mt-4" onClick={certificate}><Award size={16} /> Download certificate (PDF)</button></div>}</Card>
    </div>

    {ev.evaluation && <section className="glass mt-8 border border-amber-300/20 p-5"><div className="mb-3 flex items-center gap-2"><Trophy className="text-amber-300" size={20}/><h2 className="text-xl font-extrabold">Awards & winning team dashboard</h2></div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-white/[.04] p-4"><p className="text-xs text-slate-400">Team</p><p className="mt-1 font-extrabold">{ev.profile?.team || 'Individual participant'}</p></div><div className="rounded-xl bg-white/[.04] p-4"><p className="text-xs text-slate-400">Project</p><p className="mt-1 font-extrabold">{ev.project?.title || 'Project submission'}</p></div><div className="rounded-xl bg-white/[.04] p-4"><p className="text-xs text-slate-400">Published result</p><p className="mt-1 font-extrabold text-amber-200">{ev.evaluation.award || 'Participant'} · {ev.evaluation.total}/100</p></div></div><p className="mt-3 text-xs text-slate-500">The judge selects the award after evaluation. Results are read from the event database.</p></section>}

    <section className="glass mt-8 p-5"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-extrabold"><Mail size={18} className="text-cyan-200" /> Email notifications</h2><button className="btn-ghost !py-1 text-xs" onClick={loadMails}>Refresh</button></div>
      <p className="mt-1 text-xs text-slate-400">Mails are sent by the server to <b>{user?.email}</b>. <b>sent</b> = accepted by the mail server (check spam too). <b>simulated</b> = SMTP is not configured on the server, so nothing was delivered. <b>failed</b> = SMTP rejected it.</p>
      <ul className="mt-3 space-y-2">{mailLog.length === 0 && <li className="text-sm text-slate-500">No emails yet — register to see the first one.</li>}{mailLog.map(m => <li key={m.id} className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs"><div className="flex justify-between gap-2"><b>{m.subject}</b><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${m.status === 'sent' ? 'bg-emerald-400/20 text-emerald-200' : m.status === 'failed' ? 'bg-rose-400/20 text-rose-200' : 'bg-amber-400/20 text-amber-200'}`}>{m.status}</span></div><p className="text-slate-400">To: {m.to}</p><p className="mt-1 whitespace-pre-line text-slate-300">{m.body}</p></li>)}</ul></section>
    <p className="mt-6 flex items-center justify-center gap-1 text-center text-xs text-slate-500"><CheckCircle2 size={12} /> Dates come from src/data/eventConfig.ts — edit them for your real event.</p>
  </div>;
}
