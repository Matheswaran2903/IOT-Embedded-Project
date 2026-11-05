import { Router } from 'express';
import { z } from 'zod';
import { settings } from '../config.js';
import { optionalStudent } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import Student from '../models/Student.js';
import { quizBank } from '../utils/dataLoader.js';
import { HttpError, asyncHandler } from '../utils/http.js';

const router = Router();

function level(name) {
  const bank = quizBank();
  const meta = Object.hasOwn(bank.levels, name) ? bank.levels[name] : null;
  if (!meta) throw new HttpError(404, 'Level must be beginner, intermediate or advanced.');
  return { meta, qs: meta.indices.map((i) => bank.questions[i]) };
}

router.get('/levels', (_req, res) => res.json(Object.entries(quizBank().levels).map(([k, v]) => ({
  level: k, title: v.title, description: v.description, duration: v.duration, questions: v.indices.length,
}))));

router.get('/:level', (req, res) => {
  const { meta, qs } = level(req.params.level);
  res.json({
    level: req.params.level, title: meta.title, duration: meta.duration, pass_percent: settings.passPercent,
    questions: qs.map((q) => ({ id: q.id, q: q.q, options: q.options })),          // no answers!
  });
});

const submitIn = z.object({ answers: z.array(z.number().int().min(-1).max(3)).max(50) });

router.post('/:level/submit', optionalStudent, validate(submitIn), asyncHandler(async (req, res) => {
  const name = req.params.level;
  const { qs } = level(name);
  const { answers } = req.body;
  if (answers.length !== qs.length) throw new HttpError(422, `Send exactly ${qs.length} answers (use -1 for skipped).`);
  const review = qs.map((q, i) => ({ id: q.id, q: q.q, your_answer: answers[i], correct_answer: q.answer, correct: answers[i] === q.answer, why: q.why }));
  const correct = review.filter((r) => r.correct).length;
  const score = Math.round((correct / qs.length) * 100);
  const passed = score >= settings.passPercent;
  if (req.student) {
    await Student.updateOne({ _id: req.student._id }, {
      $push: { quizResults: { level: name, score, passed, answers, at: new Date() } }, $set: { quizLevel: name },
    });
  }
  res.json({ level: name, score, correct, total: qs.length, passed, saved: !!req.student, review });
}));

export default router;
