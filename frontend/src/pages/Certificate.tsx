import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Download } from 'lucide-react';
import { generateCertificate, makeCertificateId } from '../components/certificate/generateCertificate';
import { useAppStore } from '../store/useAppStore';

const Row = ({ ok, text, to }: { ok: boolean; text: string; to: string }) => (
  <li className="flex items-center gap-2">{ok ? <CheckCircle2 className="text-emerald-300" size={18} /> : <Circle className="text-slate-500" size={18} />}<span className={ok ? '' : 'text-slate-300'}>{text}</span>{!ok && <Link className="ml-auto text-sm text-sky-300 underline" to={to}>Do this</Link>}</li>
);

export default function Certificate() {
  const { quiz, feedback, certificateId, setCertificate, markCertificateDownloaded, certificateDownloaded } = useAppStore();
  const passed = !!quiz?.passed;
  const ready = passed && !!feedback;
  const date = quiz ? new Date(quiz.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
  const download = async () => {
    if (!ready || !quiz || !feedback) return;
    const id = certificateId ?? makeCertificateId();
    if (!certificateId) setCertificate(id);
    try {
      await generateCertificate({ name: feedback.name, school: feedback.school, cls: feedback.cls, score: quiz.score, date, id });
      markCertificateDownloaded();
    } catch {
      window.alert('Sorry, the certificate could not be created. Please try again.');
    }
  };
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-3xl font-extrabold">Certificate</h1>
      <p className="mb-4 text-slate-300">Pass the quiz and submit feedback to download your certificate (PDF).</p>
      <ul className="glass mb-4 space-y-3 p-5">
        <Row ok={passed} text={quiz ? `Quiz passed (score ${quiz.score} / 100, need 60)` : 'Pass the quiz (60 out of 100)'} to="/quiz" />
        <Row ok={!!feedback} text="Feedback submitted" to="/feedback" />
      </ul>
      {ready && quiz && feedback && (
        <div className="mb-4 rounded-2xl border-4 border-violet-500 bg-white p-6 text-center text-slate-800">
          <p className="text-xl font-extrabold text-violet-800">Embedded IoT-Simulator</p>
          <p className="font-semibold text-blue-700">Certificate of Completion</p>
          <p className="mt-3 text-sm">This is to certify that</p>
          <p className="text-3xl font-bold italic">{feedback.name}</p>
          <p className="mt-2 text-sm">of {feedback.school}, Class {feedback.cls}, scored {quiz.score} / 100 · {date}</p>
          <p className="mt-2 text-xs text-slate-500">ID: {certificateId ?? 'assigned when you download'}</p>
        </div>
      )}
      <button className="btn-primary" disabled={!ready} onClick={download}><Download size={16} />Download PDF certificate</button>
      {certificateDownloaded && <p className="mt-2 text-sm text-emerald-300">Certificate downloaded.</p>}
    </div>
  );
}
