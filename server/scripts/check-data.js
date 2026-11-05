import { topics, quizBank, videosFor } from '../src/utils/dataLoader.js';
let bad = 0;
const fail = (m) => { console.error('✗', m); bad++; };
if (topics().length !== 30) fail(`expected 30 topics, found ${topics().length}`);
for (const t of topics()) {
  const v = videosFor(t);
  if (!v.tamil.url.startsWith('https://www.youtube.com/') || !v.english.url.startsWith('https://www.youtube.com/')) fail(`topic ${t.id}: bad video url`);
  if (!t.notes) fail(`topic ${t.id}: missing study notes`);
  for (const q of t.quiz) if (!q.options.includes(q.answer)) fail(`topic ${t.id}: answer not in options`);
}
const { questions, levels } = quizBank();
for (const [lvl, m] of Object.entries(levels)) for (const i of m.indices) if (!questions[i]) fail(`level ${lvl}: missing question ${i}`);
console.log(bad ? `${bad} problem(s)` : `OK: ${topics().length} topics, ${questions.length} level questions, ${Object.keys(levels).length} levels`);
process.exit(bad ? 1 : 0);
