import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Download, Lightbulb, ShieldCheck, ThumbsDown, ThumbsUp, Wrench, Youtube } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { LEARNING_TOPICS } from '../data/learningTopics';
import { getStudyNotes } from '../data/topicStudy';
import { TOPIC_CONTENT, ytLink } from '../data/topicContent';
import { useAppStore } from '../store/useAppStore';

export default function TopicCourse() {
  const id = Number(useParams().id);
  const topic = LEARNING_TOPICS.find(t => t.id === id);
  const notes = getStudyNotes(id);
  const channels = TOPIC_CONTENT[id];
  const learned = useAppStore(s => s.learnedTopics.includes(id));
  const markTopicLearned = useAppStore(s => s.markTopicLearned);
  if (!topic) return <div className="mx-auto max-w-3xl p-10 text-center"><h1 className="text-2xl font-black">Topic not found</h1><Link className="btn-primary mt-4" to="/academy">Back to topics</Link></div>;
  const prev = LEARNING_TOPICS.find(t => t.id === id - 1), next = LEARNING_TOPICS.find(t => t.id === id + 1);
  const sections = [
    { title: 'Principle', icon: Lightbulb, color: 'text-amber-300', body: notes.principle },
    { title: 'How it works', icon: Wrench, color: 'text-cyan-300', body: notes.working },
  ];
  const makePdf = () => {
    const pdf = new jsPDF(); const pageW = pdf.internal.pageSize.getWidth(); let y = 22;
    pdf.setFillColor(30, 41, 90); pdf.rect(0, 0, pageW, 42, 'F');
    pdf.setTextColor(255,255,255); pdf.setFont('helvetica','bold'); pdf.setFontSize(19); pdf.text('IoT Explorer | Student Study Notes', 14, 18);
    pdf.setFontSize(14); pdf.text(`${id}. ${topic.title}`, 14, 31);
    pdf.setTextColor(35,45,65); y = 54;
    const writeSection = (heading: string, content: string | string[]) => {
      const lines = Array.isArray(content) ? content.map((x,i) => `${i+1}. ${x}`).join('\n') : content;
      pdf.setFont('helvetica','bold'); pdf.setFontSize(13); pdf.setTextColor(25,80,130); pdf.text(heading,14,y); y += 7;
      pdf.setFont('helvetica','normal'); pdf.setFontSize(10.5); pdf.setTextColor(45,52,65);
      const wrapped = pdf.splitTextToSize(lines, pageW - 28);
      wrapped.forEach((line: string) => { if (y > 278) { pdf.addPage(); y = 18; } pdf.text(line,14,y); y += 5.2; }); y += 6;
    };
    writeSection('Category', `${topic.category} | ${topic.summary}`);
    writeSection('Principle', notes.principle); writeSection('How it works', notes.working);
    writeSection('Applications', notes.applications); writeSection('Advantages', notes.advantages);
    writeSection('Disadvantages', notes.disadvantages); writeSection('Safety notes', notes.safety);
    pdf.setFontSize(8); pdf.setTextColor(120,120,120); pdf.text('For learning purposes. Check the exact component datasheet before building a real circuit.',14,287);
    pdf.save(`IoT-Topic-${String(id).padStart(2,'0')}-${topic.title.replace(/[^a-z0-9]+/gi,'-')}.pdf`);
  };
  return <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
    <Link to="/academy" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-200"><ArrowLeft size={16}/> All 30 topics</Link>
    <section className="academy-hero mt-4 rounded-[2rem] border border-white/10 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-4"><div className="topic-icon !h-20 !w-20 !text-5xl">{topic.icon}</div><div><p className="text-xs font-bold uppercase tracking-widest text-cyan-200">Topic {id} of 30 · {topic.category}</p><h1 className="mt-1 text-3xl font-black md:text-4xl">{topic.title}</h1><p className="mt-2 max-w-2xl text-slate-300">{topic.summary}</p></div></div><span className={`rounded-full px-3 py-2 text-xs font-extrabold ${learned ? 'bg-emerald-400/15 text-emerald-200' : 'bg-white/10 text-slate-300'}`}>{learned ? '✓ LEARNED' : 'NOT COMPLETED'}</span></div>
      <div className="mt-6 flex flex-wrap gap-3"><button onClick={makePdf} className="btn-primary"><Download size={17}/> Generate topic PDF</button><button onClick={() => markTopicLearned(id)} disabled={learned} className="btn-ghost disabled:cursor-default disabled:opacity-60"><CheckCircle2 size={17}/>{learned ? 'Topic completed' : 'Mark as learned'}</button></div>
    </section>
    {channels && topic && <section className="glass mt-6 p-5 md:p-6">
      <div className="mb-4 flex items-center gap-3"><Youtube className="text-red-400" size={24}/><div><h2 className="text-xl font-extrabold">Watch &amp; Learn · வீடியோ மூலம் கற்க</h2><p className="text-xs text-slate-400">Opens YouTube search for this topic from a recommended channel.</p></div></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <a href={ytLink(channels.ta, topic.tamilQuery)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-red-400/60 hover:bg-white/10"><div><p className="text-[10px] font-bold uppercase tracking-widest text-amber-300">தமிழ் · Tamil</p><p className="mt-1 font-extrabold">{channels.ta}</p><p className="text-xs text-slate-400">{topic.title}</p></div><span className="flex shrink-0 items-center gap-1 rounded-full bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-200"><Youtube size={14}/> Watch</span></a>
        <a href={ytLink(channels.en, topic.englishQuery)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-red-400/60 hover:bg-white/10"><div><p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">English</p><p className="mt-1 font-extrabold">{channels.en}</p><p className="text-xs text-slate-400">{topic.title}</p></div><span className="flex shrink-0 items-center gap-1 rounded-full bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-200"><Youtube size={14}/> Watch</span></a>
      </div>
    </section>}
    <div className="mt-6 grid gap-4 md:grid-cols-2">{sections.map(s => { const Icon = s.icon; return <section key={s.title} className="glass p-5 md:p-6"><div className="mb-3 flex items-center gap-3"><Icon className={s.color} size={22}/><h2 className="text-xl font-extrabold">{s.title}</h2></div><p className="leading-7 text-slate-200">{s.body}</p></section>; })}</div>
    <div className="mt-4 grid gap-4 md:grid-cols-2"><section className="glass p-5 md:p-6"><div className="mb-3 flex items-center gap-3"><BookOpen className="text-violet-300" size={22}/><h2 className="text-xl font-extrabold">Applications</h2></div><ul className="space-y-3">{notes.applications.map(x=><li key={x} className="flex gap-2 text-slate-200"><CheckCircle2 className="mt-1 shrink-0 text-violet-300" size={16}/>{x}</li>)}</ul></section>
      <section className="glass p-5 md:p-6"><div className="mb-3 flex items-center gap-3"><ThumbsUp className="text-emerald-300" size={22}/><h2 className="text-xl font-extrabold">Advantages</h2></div><ul className="space-y-3">{notes.advantages.map(x=><li key={x} className="flex gap-2 text-slate-200"><CheckCircle2 className="mt-1 shrink-0 text-emerald-300" size={16}/>{x}</li>)}</ul></section>
      <section className="glass p-5 md:p-6"><div className="mb-3 flex items-center gap-3"><ThumbsDown className="text-rose-300" size={22}/><h2 className="text-xl font-extrabold">Disadvantages</h2></div><ul className="space-y-3">{notes.disadvantages.map(x=><li key={x} className="flex gap-2 text-slate-200"><span className="mt-1 text-rose-300">•</span>{x}</li>)}</ul></section>
      <section className="glass p-5 md:p-6"><div className="mb-3 flex items-center gap-3"><ShieldCheck className="text-amber-300" size={22}/><h2 className="text-xl font-extrabold">Safety notes</h2></div><ul className="space-y-3">{notes.safety.map(x=><li key={x} className="flex gap-2 text-slate-200"><ShieldCheck className="mt-1 shrink-0 text-amber-300" size={16}/>{x}</li>)}</ul></section></div>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><Link className="btn-ghost" to={prev ? `/academy/${prev.id}` : '/academy'}><ArrowLeft size={16}/>{prev ? 'Previous topic' : 'Back to topics'}</Link><Link className="btn-ghost" to="/quiz">Go to separate quizzes</Link>{next && <Link className="btn-primary" to={`/academy/${next.id}`}>Next topic <ArrowRight size={16}/></Link>}</div>
    <p className="mt-6 text-center text-xs text-slate-500">Your learned status is saved in this browser. PDF notes are generated on your device.</p>
  </div>;
}
