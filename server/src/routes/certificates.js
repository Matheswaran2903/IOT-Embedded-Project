import { Router } from 'express';
import { requireStudent } from '../middleware/auth.js';
import Certificate from '../models/Certificate.js';
import { makeCertificateId } from '../services/certificates.js';
import { HttpError, asyncHandler } from '../utils/http.js';

const router = Router();

/** Course certificate: needs a passed quiz and submitted feedback. Calling again returns the same one. */
router.post('/course', requireStudent, asyncHandler(async (req, res) => {
  const s = req.student;
  const old = await Certificate.findOne({ studentId: s._id, kind: 'course' });
  if (old) return res.status(201).json(shape(old));
  const best = Math.max(-1, ...s.quizResults.filter((r) => r.passed).map((r) => r.score));
  if (best < 0) throw new HttpError(409, 'Pass a quiz first.');
  if (!s.feedback?.name) throw new HttpError(409, 'Submit the feedback form first.');
  const cert = await Certificate.create({ certId: await makeCertificateId(), studentId: s._id, kind: 'course', title: 'Certificate of Completion', score: best });
  res.status(201).json(shape(cert));
}));

/** Public: anyone can verify a certificate id. */
router.get('/:certId', asyncHandler(async (req, res) => {
  const c = await Certificate.findOne({ certId: req.params.certId.toUpperCase() }).populate('studentId', 'name school className');
  if (!c) throw new HttpError(404, 'Certificate not found.');
  res.json({ valid: true, ...shape(c), name: c.studentId.name, school: c.studentId.school, class_name: c.studentId.className });
}));

const shape = (c) => ({ cert_id: c.certId, kind: c.kind, title: c.title, score: c.score, issued_on: c.createdAt });

export default router;
