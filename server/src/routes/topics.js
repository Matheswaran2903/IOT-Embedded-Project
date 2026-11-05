import { Router } from 'express';
import { z } from 'zod';
import { settings } from '../config.js';
import { optionalStudent } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import Student from '../models/Student.js';
import { getTopic, topics, videosFor } from '../utils/dataLoader.js';
import { HttpError, asyncHandler } from '../utils/http.js';
import { seededShuffle } from '../utils/shuffle.js';

const router = Router();

const summary = (t) => ({ id: t.id, title: t.title, category: t.category, icon: t.icon, summary: t.summary, videos: videosFor(t) });
const needTopic = (raw) => {
  const t = /^\d+$/.test(raw) ? getTopic(Number(raw)) : null;
  if (!t) throw new HttpError(404, 'Topic not found (valid ids are 1 to 30).');
  return t;
};
const quizQuestions = (t) => t.quiz.map((q, i) => ({
  index: i, question: q.question,
  options: seededShuffle(q.options, t.id * 100 + i),     // stable order, correct answer not always first
}));

router.get('/topics', (req, res) => {
  const q = String(req.query.q ?? '').trim().toLowerCase();
  const category = String(req.query.category ?? 'All');
  const items = topics().filter((t) => (category === 'All' || t.category === category)
    && `${t.title} ${t.category}`.toLowerCase().includes(q));
  res.json({ count: items.length, topics: items.map(summary) });
});

router.get('/topics/categories', (_req, res) => res.json(['All', ...new Set(topics().map((t) => t.category))]));

/** Tamil + English YouTube links for every topic (handy for the Learn dashboard). */
router.get('/videos', (_req, res) => res.json(topics().map((t) => ({ id: t.id, title: t.title, videos: videosFor(t) }))));

router.get('/topics/:id', (req, res) => {
  const t = needTopic(req.params.id);
  res.json({ ...summary(t), key_points: t.key_points, notes: t.notes });
});

router.get('/topics/:id/videos', (req, res) => {
  const t = needTopic(req.params.id);
  res.json({ id: t.id, title: t.title, videos: videosFor(t) });
});

router.get('/topics/:id/quiz', (req, res) => {
  const t = needTopic(req.params.id);
  res.json({ topic_id: t.id, pass_percent: settings.passPercent, questions: quizQuestions(t) });   // no answers sent
});

const gradeIn = z.object({ answers: z.array(z.string().max(300)).max(50) });

router.post('/topics/:id/quiz', optionalStudent, validate(gradeIn), asyncHandler(async (req, res) => {
  const t = needTopic(req.params.id);
  const { answers } = req.body;
  if (answers.length !== t.quiz.length) throw new HttpError(422, `Send exactly ${t.quiz.length} answers.`);
  const review = t.quiz.map((q, i) => ({ question: q.question, your_answer: answers[i], correct_answer: q.answer, correct: answers[i] === q.answer }));
  const correct = review.filter((r) => r.correct).length;
  const total = t.quiz.length;
  const score = Math.round((correct / total) * 100);
  const passed = score >= settings.passPercent;
  let saved = false;
  const s = req.student;
  if (s) {                                              // keep the student's best score for this topic
    const old = s.topicResults.find((r) => r.topicId === t.id);
    if (!old || score >= old.score) {
      await Student.updateOne({ _id: s._id }, { $pull: { topicResults: { topicId: t.id } } });
      await Student.updateOne({ _id: s._id }, { $push: { topicResults: { topicId: t.id, score, total, passed, at: new Date() } } });
    }
    saved = true;
  }
  res.json({ score, correct, total, passed, saved, review });
}));

export default router;
