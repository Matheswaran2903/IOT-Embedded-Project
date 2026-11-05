import fs from 'node:fs/promises';
import path from 'node:path';
import { Router } from 'express';
import { z } from 'zod';
import { settings } from '../config.js';
import { newToken, requireStudent } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import Certificate from '../models/Certificate.js';
import Slot from '../models/Slot.js';
import Student from '../models/Student.js';
import { queueMails } from '../services/mailer.js';
import { getTopic, topics } from '../utils/dataLoader.js';
import { HttpError, asyncHandler } from '../utils/http.js';

const router = Router();

const emailOk = (v) => v === '' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
const optEmail = z.string().trim().toLowerCase().max(120).refine(emailOk, 'invalid e-mail').default('');
const studentIn = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().max(120).refine((v) => v !== '' && emailOk(v), 'invalid e-mail'),
  parent_email: optEmail,
  school: z.string().trim().min(2).max(120),
  class_name: z.string().trim().min(1).max(10),
  city: z.string().trim().max(80).default(''),
});
const patchIn = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  school: z.string().trim().min(2).max(120).optional(),
  class_name: z.string().trim().min(1).max(10).optional(),
  quiz_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});
const gameIn = z.object({ score: z.number().int().min(0).max(1_000_000), stars: z.number().int().min(0).max(3) });

const publicStudent = (s) => ({
  id: s.id, name: s.name, email: s.email, parent_email: s.parentEmail, school: s.school, class_name: s.className,
  city: s.city, team: s.team, quiz_level: s.quizLevel, created_at: s.createdAt,
});

/** Create a student. The token is shown ONCE - the frontend must store it (e.g. localStorage). */
router.post('/students', validate(studentIn), asyncHandler(async (req, res) => {
  const b = req.body;
  if (await Student.exists({ email: b.email })) throw new HttpError(409, 'This e-mail is already registered. Use the token saved in your browser.');
  const { token, tokenHash } = newToken();
  const s = await Student.create({ name: b.name, email: b.email, parentEmail: b.parent_email, school: b.school, className: b.class_name, city: b.city, tokenHash });
  queueMails([b.email], 'Welcome to IoT Explorer', `Hi ${b.name}, your IoT Explorer account is ready. Happy learning!`);
  res.status(201).json({ student_id: s.id, token });
}));

router.get('/me', requireStudent, (req, res) => res.json(publicStudent(req.student)));

router.patch('/me', requireStudent, validate(patchIn), asyncHandler(async (req, res) => {
  const b = req.body;
  const set = {};
  if (b.name) set.name = b.name;
  if (b.school) set.school = b.school;
  if (b.class_name) set.className = b.class_name;
  if (b.quiz_level) set.quizLevel = b.quiz_level;
  const s = await Student.findByIdAndUpdate(req.student._id, { $set: set }, { new: true });
  res.json(publicStudent(s));
}));

/** Delete the account and everything linked to it (children's data: allow easy removal). */
router.delete('/me', requireStudent, asyncHandler(async (req, res) => {
  const s = req.student;
  const slot = s.event?.slot;
  if (slot?.date) await Slot.updateOne({ date: slot.date, time: slot.time }, { $pull: { bookedBy: s._id } });
  await Certificate.deleteMany({ studentId: s._id });
  await fs.rm(path.join(settings.uploadDir, String(s._id)), { recursive: true, force: true });
  await Student.deleteOne({ _id: s._id });
  res.status(204).end();
}));

router.get('/me/progress', requireStudent, (req, res) => {
  const s = req.student;
  const learned = s.learnedTopics.map((x) => x.topicId).sort((a, b) => a - b);
  const quizzes = [...s.quizResults].reverse().map((r) => ({ level: r.level, score: r.score, passed: r.passed, date: r.at }));
  res.json({
    learned_topics: learned,
    course_percent: Math.round((learned.length / topics().length) * 100),
    topic_results: Object.fromEntries(s.topicResults.map((r) => [r.topicId, { score: r.score, total: r.total, passed: r.passed, date: r.at }])),
    quiz_results: quizzes,
    best_quiz_score: Math.max(0, ...quizzes.map((q) => q.score)),
    sims_completed: s.sims.map((x) => x.simId),
    game_best: Object.fromEntries(s.gameBest.map((g) => [g.level, { score: g.score, stars: g.stars }])),
    games_won: s.gamesWon,
    quiz_level: s.quizLevel,
  });
});

router.post('/me/topics/:id/learned', requireStudent, asyncHandler(async (req, res) => {
  const id = /^\d+$/.test(req.params.id) ? Number(req.params.id) : NaN;
  if (!getTopic(id)) throw new HttpError(404, 'Topic not found.');
  await Student.updateOne({ _id: req.student._id, 'learnedTopics.topicId': { $ne: id } },
    { $push: { learnedTopics: { topicId: id, at: new Date() } } });
  const fresh = await Student.findById(req.student._id).select('learnedTopics');
  res.json({ learned: fresh.learnedTopics.length, total: topics().length });
}));

router.put('/me/sims/:simId', requireStudent, asyncHandler(async (req, res) => {
  const simId = req.params.simId;
  if (simId.length < 1 || simId.length > 64) throw new HttpError(422, 'Invalid simulation id.');
  await Student.updateOne({ _id: req.student._id, 'sims.simId': { $ne: simId } }, { $push: { sims: { simId, at: new Date() } } });
  res.json({ ok: true });
}));

router.put('/me/games/:level', requireStudent, validate(gameIn), asyncHandler(async (req, res) => {
  const level = req.params.level;
  if (level.length < 1 || level.length > 32) throw new HttpError(422, 'Invalid game level.');
  const old = req.student.gameBest.find((g) => g.level === level);
  const score = old ? Math.max(old.score, req.body.score) : req.body.score;
  const stars = old ? Math.max(old.stars, req.body.stars) : req.body.stars;
  await Student.updateOne({ _id: req.student._id }, { $pull: { gameBest: { level } } });
  await Student.updateOne({ _id: req.student._id }, { $push: { gameBest: { level, score, stars } }, $inc: { gamesWon: 1 } });
  res.json({ level, best_score: score, best_stars: stars });
}));

router.delete('/me/progress', requireStudent, asyncHandler(async (req, res) => {
  await Student.updateOne({ _id: req.student._id }, {
    $set: { learnedTopics: [], topicResults: [], quizResults: [], sims: [], gameBest: [], gamesWon: 0 },
    $unset: { feedback: '' },
  });
  res.status(204).end();
}));

export default router;
