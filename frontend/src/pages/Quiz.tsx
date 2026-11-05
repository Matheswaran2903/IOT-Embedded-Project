import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, ChevronLeft, ChevronRight, Send, Sparkles } from 'lucide-react';
import { QUIZ } from '../data/quizQuestions';
import { QUIZ_LEVELS, type QuizLevel } from '../data/quizLevels';
import { useAppStore } from '../store/useAppStore';

export default function Quiz() {
  const nav = useNavigate();
  const setQuiz = useAppStore(s => s.setQuiz);
  const setSavedLevel = useAppStore(s => s.setQuizLevel);
  const savedLevel = useAppStore(s => s.quizLevel);
  const previous = useAppStore(s => s.quiz);
  const [level, setLevel] = useState<QuizLevel>(savedLevel || 'beginner');
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const indices = useMemo(() => QUIZ_LEVELS[level].indices, [level]);
  const questions = indices.map(index => ({ ...QUIZ[index], originalIndex: index }));
  const [answers, setAnswers] = useState<number[]>([]);
  const q = questions[i];
  const answered = answers.filter(a => a >= 0).length;
  const start = (next: QuizLevel) => { setLevel(next); setSavedLevel(next); setAnswers(Array(QUIZ_LEVELS[next].indices.length).fill(-1)); setI(0); setStarted(true); };
  const submit = () => {
    const fullAnswers = Array(QUIZ.length).fill(-1) as number[];
    questions.forEach((question, pos) => { fullAnswers[question.originalIndex] = answers[pos] ?? -1; });
    const correct = questions.reduce((sum, question, pos) => sum + (answers[pos] === question.answer ? 1 : 0), 0);
    const score = Math.round((correct / questions.length) * 100);
    setSavedLevel(level);
    setQuiz({ score, total: 100, passed: score >= 60, answers: fullAnswers, date: new Date().toISOString() });
    nav('/results');
  };
  if (!started) return <div className="mx-auto max-w-5xl px-4 py-8">
    <section className="academy-hero rounded-[2rem] border border-white/10 p-7 md:p-10"><div className="flex items-center gap-2 text-sm font-bold text-cyan-200"><Sparkles size={17}/> SKILL CHECK</div><h1 className="mt-3 text-4xl font-black">Choose your quiz level</h1><p className="mt-3 max-w-2xl text-slate-300">Practice at your own pace. Start with basics, improve your knowledge, and challenge yourself with advanced questions.</p><p className="mt-3 text-xs text-slate-400">Previous result: {previous ? `${previous.score}% · ${previous.passed ? 'Passed' : 'Keep practising'}` : 'No quiz attempted yet'}</p></section>
    <div className="mt-6 grid gap-4 md:grid-cols-3">{(Object.keys(QUIZ_LEVELS) as QuizLevel[]).map((key, idx) => { const item = QUIZ_LEVELS[key]; return <button key={key} onClick={() => setLevel(key)} className={`glass rounded-2xl border p-5 text-left transition hover:-translate-y-1 ${level === key ? 'border-cyan-300 bg-cyan-300/10' : 'border-white/10'}`}><div className="flex items-center justify-between"><span className="text-3xl">{['🌱','⚡','🚀'][idx]}</span><span className="rounded-full bg-white/10 px-2 py-1 text-xs">{item.indices.length} questions</span></div><h2 className="mt-4 text-2xl font-black">{item.title}</h2><p className="mt-2 min-h-12 text-sm text-slate-300">{item.description}</p><p className="mt-3 text-xs font-bold text-cyan-200">{item.duration} · 60% to pass</p><div className={`mt-4 rounded-xl px-3 py-2 text-center text-sm font-bold ${level === key ? 'bg-cyan-300 text-slate-950' : 'bg-white/10'}`}>{level === key ? 'Selected' : 'Choose level'}</div></button>; })}</div>
    <button onClick={() => start(level)} className="btn-primary mt-6"><BookOpen size={17}/> Start {QUIZ_LEVELS[level].title} quiz <ArrowRight size={17}/></button>
  </div>;
  return <div className="mx-auto max-w-3xl px-4 py-8"><button onClick={() => setStarted(false)} className="mb-4 text-sm font-bold text-cyan-200">← Change quiz level</button><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-widest text-cyan-200">{QUIZ_LEVELS[level].title} level</p><h1 className="text-3xl font-black">Question {i + 1} of {questions.length}</h1></div><span className="rounded-full bg-violet-400/10 px-3 py-2 text-xs font-bold text-violet-200">{answered} answered · Pass 60%</span></div>
    <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gradient-to-r from-violet-500 to-sky-400 transition-all" style={{width:`${((i+1)/questions.length)*100}%`}}/></div>
    <section className="glass p-5 md:p-7"><h2 className="mb-5 text-xl font-extrabold">{q.q}</h2><div className="space-y-3">{q.options.map((option,k)=><button key={option} onClick={()=>setAnswers(a=>a.map((v,j)=>j===i?k:v))} className={`block w-full rounded-xl border px-4 py-3 text-left text-sm transition ${answers[i]===k?'border-cyan-300 bg-cyan-300/15':'border-white/10 bg-white/5 hover:bg-white/10'}`}><b className="mr-2">{'ABCD'[k]}.</b>{option}</button>)}</div></section>
    <div className="mt-4 flex items-center justify-between"><button className="btn-ghost" disabled={i===0} onClick={()=>setI(x=>x-1)}><ChevronLeft size={16}/> Previous</button>{i<questions.length-1?<button className="btn-primary" onClick={()=>setI(x=>x+1)}>Next <ChevronRight size={16}/></button>:<button className="btn-primary" onClick={submit}><Send size={16}/> Submit quiz</button>}</div>
    <div className="mt-5 flex flex-wrap gap-2">{questions.map((_,k)=><button key={k} aria-label={`Go to question ${k+1}`} onClick={()=>setI(k)} className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-bold ${k===i?'bg-violet-600':answers[k]>=0?'bg-cyan-500/40':'bg-white/10'}`}>{k+1}</button>)}</div>
  </div>;
}
