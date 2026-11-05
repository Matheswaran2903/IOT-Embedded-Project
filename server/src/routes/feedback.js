import { Router } from 'express';
import { z } from 'zod';
import { requireJudge, requireStudent } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import Student from '../models/Student.js';
import { HttpError, asyncHandler } from '../utils/http.js';

const router = Router();

const rating = z.number().int().min(1).max(5);
const feedbackIn = z.object({
  name: z.string().trim().min(2).max(80), cls: z.string().trim().min(1).max(10), school: z.string().trim().min(2).max(120),
  overall: rating, usability: rating, learning: rating,
  favorite: z.string().trim().min(1).max(60), suggestions: z.string().trim().max(1000).default(''),
});

router.post('/', requireStudent, validate(feedbackIn), asyncHandler(async (req, res) => {
  if (!req.student.quizResults.length) throw new HttpError(409, 'Finish a quiz first - feedback opens after the quiz.');
  await Student.updateOne({ _id: req.student._id }, { $set: { feedback: { ...req.body, at: new Date() } } });
  res.status(201).json({ saved: true });
}));

router.get('/me', requireStudent, (req, res) => {
  if (!req.student.feedback?.name) throw new HttpError(404, 'No feedback saved yet.');
  res.json(req.student.feedback.toObject());
});

router.get('/admin/all', requireJudge, asyncHandler(async (_req, res) => {
  const rows = (await Student.find({ 'feedback.overall': { $exists: true } }).select('feedback').lean()).map((r) => r.feedback);
  const n = rows.length || 1;
  const avg = (k) => Math.round((rows.reduce((a, r) => a + r[k], 0) / n) * 100) / 100;
  res.json({ count: rows.length, average: { overall: avg('overall'), usability: avg('usability'), learning: avg('learning') }, items: rows });
}));

export default router;
