import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { QUIZ } from '../data/quizQuestions';
import { QUIZ_LEVELS } from '../data/quizLevels';
import { useAppStore } from '../store/useAppStore';

export default function QuizResults() {
  const quiz = useAppStore((s) => s.quiz);
  const feedback = useAppStore((s) => s.feedback);
  const quizLevel = useAppStore((s) => s.quizLevel);
  const review = QUIZ_LEVELS[quizLevel].indices.map(index => ({ ...QUIZ[index], originalIndex: index }));
  if (!quiz) return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center"><div className="glass p-8"><h1 className="mb-2 text-2xl font-extrabold">No quiz result yet</h1><p className="mb-4 text-slate-300">Take the quiz to see your score and review.</p><Link className="btn-primary" to="/quiz">Start quiz</Link></div></div>
  );
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="glass mb-5 p-6 text-center">
        <p className="text-sm text-slate-400">{QUIZ_LEVELS[quizLevel].title} quiz · Your score</p>
        <p className="text-5xl font-extrabold">{quiz.score}<span className="text-2xl text-slate-400"> / {quiz.total}</span></p>
        <p className={`mt-1 font-bold ${quiz.passed ? 'text-emerald-300' : 'text-red-300'}`}>{quiz.passed ? 'Passed. Well done!' : 'Not passed yet. You need 60 to pass.'}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link to="/quiz" className="btn-ghost"><RotateCcw size={15} />Retake quiz</Link>
          {!feedback && <Link to="/feedback" className="btn-primary">Give feedback</Link>}
          {quiz.passed && feedback && <Link to="/certificate" className="btn-primary">Get certificate</Link>}
        </div>
      </div>
      <h2 className="mb-2 text-lg font-bold">Review</h2>
      <div className="space-y-3">
        {review.map((q, k) => {
          const mine = quiz.answers[q.originalIndex]; const ok = mine === q.answer;
          return (
            <div key={k} className="glass p-4">
              <p className="mb-2 flex gap-2 font-semibold">{ok ? <CheckCircle2 className="shrink-0 text-emerald-300" size={18} /> : <XCircle className="shrink-0 text-red-300" size={18} />}{k + 1}. {q.q}</p>
              <p className="text-sm text-slate-300">Your answer: <b className={ok ? 'text-emerald-300' : 'text-red-300'}>{mine >= 0 ? q.options[mine] : 'Not answered'}</b></p>
              {!ok && <p className="text-sm text-slate-300">Correct answer: <b className="text-emerald-300">{q.options[q.answer]}</b></p>}
              <p className="mt-1 text-sm text-sky-200">{q.why}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
