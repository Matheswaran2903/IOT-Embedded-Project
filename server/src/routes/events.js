import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { z } from 'zod';
import { EVENT, settings } from '../config.js';
import { requireJudge, requireStudent } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import Certificate from '../models/Certificate.js';
import Slot from '../models/Slot.js';
import Student from '../models/Student.js';
import { makeCertificateId } from '../services/certificates.js';
import { queueMails, recentMails, sendRegistrationMails } from '../services/mailer.js';
import { topics } from '../utils/dataLoader.js';
import { todayStr, windowStatus } from '../utils/dates.js';
import { HttpError, asyncHandler } from '../utils/http.js';

const router = Router();
const registrationStatus = () => windowStatus(EVENT.registration_opens, EVENT.registration_closes, settings.timezone);
const mailsOf = (s) => [s.email, s.parentEmail];
const isRegistered = (s) => !!s.event?.registeredAt;
const needRegistered = (s) => { if (!isRegistered(s)) throw new HttpError(409, 'Register for the event first.'); };

// ------------------------------------------------------------------ public
/** Public event settings (no secrets). */
router.get('/config', (_req, res) => {
  const { meeting_link, ...pub } = EVENT;            // the meeting link is only given to students who booked a slot
  res.json({ ...pub, registration_status: registrationStatus(), slot_capacity: settings.slotCapacity });
});

router.get('/registration-count', asyncHandler(async (_req, res) => {
  const count = await Student.countDocuments({ 'event.registeredAt': { $exists: true, $ne: null } });
  res.json({ count });
}));

router.get('/slots', asyncHandler(async (_req, res) => {
  const docs = await Slot.find().lean();
  const booked = new Map(docs.map((d) => [`${d.date}|${d.time}`, d.bookedBy.length]));
  res.json(EVENT.presentation_dates.map((date) => ({
    date,
    times: EVENT.presentation_times.map((time) => {
      const n = booked.get(`${date}|${time}`) ?? 0;
      return { time, booked: n, available: settings.slotCapacity - n };
    }),
  })));
}));

// ------------------------------------------------------------------ student steps
const registerIn = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  school: z.string().trim().min(2).max(120).optional(),
  class_name: z.string().trim().min(1).max(10).optional(),
  parent_email: z.string().trim().toLowerCase().max(120).refine((v) => v === '' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), 'invalid e-mail').default(''),
  city: z.string().trim().min(2).max(80),
  team: z.string().trim().max(80).default(''),
});

router.post('/register', requireStudent, validate(registerIn), asyncHandler(async (req, res) => {
  const s = req.student;
  const status = registrationStatus();
  if (status !== 'Open now') throw new HttpError(409, `Registration is ${status.toLowerCase()}.`);
  if (isRegistered(s)) throw new HttpError(409, 'You are already registered for this event.');
  const parent = req.body.parent_email || s.parentEmail;
  const set = { parentEmail: parent, city: req.body.city, team: req.body.team, 'event.registeredAt': new Date() };
  if (req.body.name) set.name = req.body.name;
  if (req.body.school) set.school = req.body.school;          // the form's school / class are now saved on the account
  if (req.body.class_name) set.className = req.body.class_name;
  await Student.updateOne({ _id: s._id }, { $set: set });
  // The confirmation goes to the e-mail of the signed-in account (and the parent / teacher, if given).
  const mail = await sendRegistrationMails([s.email, parent], `Registration confirmed - ${EVENT.name}`,
    `Hi ${req.body.name || s.name}, you are registered for ${EVENT.name}.\nEvent starts: ${EVENT.event_start}\nEvent ends: ${EVENT.event_end}\nNext step: choose your online presentation slot on the Events page.`);
  res.status(201).json({ registered: true, email_status: mail });
}));

const slotIn = z.object({
  date: z.enum(EVENT.presentation_dates), time: z.enum(EVENT.presentation_times), mode: z.enum(EVENT.presentation_modes),
});

router.post('/slot', requireStudent, validate(slotIn), asyncHandler(async (req, res) => {
  const s = req.student;
  needRegistered(s);
  const { date, time, mode } = req.body;
  const cur = s.event.slot;
  if (cur?.date === date && cur?.time === time) {
    await Student.updateOne({ _id: s._id }, { $set: { 'event.slot.mode': mode } });
  } else {
    // Atomic: only succeeds while the slot still has a free seat, so two students cannot take the last one.
    const taken = await Slot.findOneAndUpdate(
      { date, time, bookedBy: { $ne: s._id }, $expr: { $lt: [{ $size: '$bookedBy' }, settings.slotCapacity] } },
      { $addToSet: { bookedBy: s._id } }, { new: true });
    if (!taken) throw new HttpError(409, 'That slot is full. Please choose another time.');
    if (cur?.date) await Slot.updateOne({ date: cur.date, time: cur.time }, { $pull: { bookedBy: s._id } });
    await Student.updateOne({ _id: s._id }, { $set: { 'event.slot': { date, time, mode, at: new Date() } } });
  }
  queueMails(mailsOf(s), 'Presentation slot booked', `Your presentation: ${date} at ${time} (${mode}).\nJoin link: ${EVENT.meeting_link}`);
  res.json({ booked: true, meeting_link: EVENT.meeting_link });
}));

const projectIn = z.object({
  title: z.string().trim().min(3).max(120), problem: z.string().trim().min(3).max(1000),
  description: z.string().max(5000).default(''), code: z.string().max(20000).default(''),
  sim_id: z.string().max(64).default(''),
  topics: z.array(z.number().int()).min(1).max(30),
});

router.put('/project', requireStudent, validate(projectIn), asyncHandler(async (req, res) => {
  const s = req.student;
  needRegistered(s);
  const b = req.body;
  const valid = new Set(topics().map((t) => t.id));
  if (!b.topics.every((t) => valid.has(t))) throw new HttpError(422, 'Topic ids must be between 1 and 30.');
  await Student.updateOne({ _id: s._id }, { $set: { 'event.project': {
    title: b.title, problem: b.problem, description: b.description, code: b.code, simId: b.sim_id,
    topics: [...new Set(b.topics)].sort((a, c) => a - c), at: new Date() } } });
  queueMails(mailsOf(s), 'Project created', `Your project "${b.title}" is saved. Next: upload it before ${EVENT.upload_deadline}.`);
  res.json({ saved: true });
}));

// ---- file upload (multer). The checks run BEFORE the file is written to disk.
const ALLOWED_EXT = new Set(['.zip', '.pdf', '.ino', '.py', '.png', '.jpg', '.jpeg', '.mp4', '.doc', '.docx', '.ppt', '.pptx', '.txt']);
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const dir = path.join(settings.uploadDir, String(req.student._id));
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => cb(null, `${Date.now()}_${path.basename(file.originalname).replace(/[^A-Za-z0-9._-]/g, '_').slice(-80)}`),
  }),
  limits: { fileSize: settings.maxUploadMb * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => (ALLOWED_EXT.has(path.extname(file.originalname).toLowerCase())
    ? cb(null, true)
    : cb(new HttpError(422, `File type not allowed. Allowed: ${[...ALLOWED_EXT].sort().join(', ')}`))),
});

const submissionPrechecks = (req, _res, next) => {
  const s = req.student;
  if (!isRegistered(s)) return next(new HttpError(409, 'Register for the event first.'));
  if (!s.event.project?.title) return next(new HttpError(409, 'Create your project first.'));
  if (todayStr(settings.timezone) > EVENT.upload_deadline) return next(new HttpError(409, 'The project upload deadline has passed.'));
  next();
};

const inUploads = (p) => !!p && path.resolve(p).startsWith(settings.uploadDir + path.sep);

router.post('/submission', requireStudent, submissionPrechecks, upload.single('file'), asyncHandler(async (req, res) => {
  const s = req.student;
  const file = req.file;
  const link = String(req.body?.link ?? '').trim();
  const discard = () => (file ? fs.promises.unlink(file.path).catch(() => {}) : null);
  if (link && !/^https?:\/\/\S+$/.test(link)) { await discard(); throw new HttpError(422, 'The demo link must start with http:// or https://'); }
  if (!file && !link) throw new HttpError(422, 'Upload a file or paste a demo link.');

  const old = s.event.submission;
  const next = file
    ? { fileName: file.filename.replace(/^\d+_/, ''), filePath: file.path, fileSize: file.size }
    : { fileName: old?.fileName ?? '', filePath: old?.filePath ?? '', fileSize: old?.fileSize ?? 0 };   // keep an earlier upload
  if (file && inUploads(old?.filePath)) fs.promises.unlink(old.filePath).catch(() => {});             // replace the old file
  await Student.updateOne({ _id: s._id }, { $set: { 'event.submission': { ...next, link, at: new Date() } } });
  queueMails(mailsOf(s), 'Project submitted', `We received your project "${s.event.project.title}". Evaluation: ${EVENT.evaluation_dates}.`);
  res.json({ submitted: true, file_name: next.fileName, file_size: next.fileSize, link });
}));

router.get('/mails', requireStudent, asyncHandler(async (req, res) => {
  const rows = await recentMails([req.student.email, req.student.parentEmail]);
  res.json(rows.map((m) => ({ id: String(m._id), to: m.to, subject: m.subject, body: m.body, status: m.status, at: m.createdAt })));
}));

router.get('/me', requireStudent, (req, res) => {
  const e = req.student.event ?? {};
  const sub = e.submission, ev = e.evaluation, proj = e.project, slot = e.slot;
  res.json({
    registered: !!e.registeredAt,
    profile: e.registeredAt ? { name: req.student.name, email: req.student.email, parent_email: req.student.parentEmail, school: req.student.school, class_name: req.student.className, city: req.student.city, team: req.student.team, at: e.registeredAt } : null,
    slot: slot?.date ? { date: slot.date, time: slot.time, mode: slot.mode, at: slot.at } : null,
    meeting_link: slot?.date ? EVENT.meeting_link : null,
    project: proj?.title ? { title: proj.title, problem: proj.problem, description: proj.description, code: proj.code, sim_id: proj.simId, topics: proj.topics, at: proj.at } : null,
    submission: sub?.at ? { file_name: sub.fileName, file_size: sub.fileSize, link: sub.link, at: sub.at } : null,   // file path is never exposed
    evaluation: ev?.at ? { scores: ev.scores, total: ev.total, remark: ev.remark, award: ev.award, at: ev.at } : null,
    cert_id: ev?.certId ?? null,
    stages_done: [!!e.registeredAt, !!slot?.date, !!proj?.title, !!sub?.at, !!ev?.at, !!ev?.certId],
  });
});

// ------------------------------------------------------------------ judge / admin (needs X-Judge-Pin header)
const needStudentId = (id) => { if (!mongoose.isValidObjectId(id)) throw new HttpError(404, 'Student not found.'); return id; };

router.get('/admin/submissions', requireJudge, asyncHandler(async (_req, res) => {
  const rows = await Student.find({ 'event.registeredAt': { $exists: true } }).sort({ _id: 1 }).lean();
  res.json(rows.map((s) => ({
    id: String(s._id), name: s.name, email: s.email, school: s.school, class_name: s.className, team: s.team,
    title: s.event.project?.title ?? null, problem: s.event.project?.problem ?? null, topics: s.event.project?.topics ?? [],
    file_name: s.event.submission?.fileName ?? null, link: s.event.submission?.link ?? null, submitted_at: s.event.submission?.at ?? null,
    total: s.event.evaluation?.total ?? null, award: s.event.evaluation?.award ?? null,
  })));
}));

router.get('/admin/submissions/:id/file', requireJudge, asyncHandler(async (req, res) => {
  const s = await Student.findById(needStudentId(req.params.id)).lean();
  const sub = s?.event?.submission;
  if (!sub?.filePath || !inUploads(sub.filePath) || !fs.existsSync(sub.filePath)) throw new HttpError(404, 'No uploaded file for this student.');   // also blocks path traversal
  res.download(sub.filePath, sub.fileName);
}));

const evaluationIn = z.object({
  scores: z.array(z.number().int()).length(EVENT.rubric.length),
  remark: z.string().trim().max(500).default(''),
  award: z.enum(EVENT.awards).default('Participant'),
});

router.post('/admin/evaluate/:id', requireJudge, validate(evaluationIn), asyncHandler(async (req, res) => {
  const s = await Student.findById(needStudentId(req.params.id));
  if (!s || !isRegistered(s)) throw new HttpError(404, 'Registered student not found.');
  if (!s.event.submission?.at) throw new HttpError(409, 'This student has not submitted a project yet.');
  const { scores, remark, award } = req.body;
  if (scores.some((sc, i) => sc < 0 || sc > EVENT.rubric[i][1])) {
    throw new HttpError(422, `Scores must match the rubric: ${EVENT.rubric.map(([n, m]) => `${n} (0-${m})`).join(', ')}`);
  }
  const total = scores.reduce((a, b) => a + b, 0);
  const certId = s.event.evaluation?.certId || await makeCertificateId();
  const winner = award !== 'Participant' && award !== 'Finalist';
  const title = winner ? `${award} · Winner Certificate` : total >= EVENT.pass_score ? 'Certificate of Achievement' : 'Certificate of Participation';
  await Student.updateOne({ _id: s._id }, { $set: { 'event.evaluation': { scores, total, remark, award, certId, at: new Date() } } });
  await Certificate.findOneAndUpdate({ certId }, { certId, studentId: s._id, kind: 'event', title, score: total }, { upsert: true });
  queueMails(mailsOf(s), 'Your evaluation result',
    `Score: ${total}/100.\nAward: ${award}\nJudge remark: ${remark}\nYour certificate (${title}, ID ${certId}) is ready on the event page.`);
  res.json({ student_id: s.id, total, award, certificate_id: certId, title });
}));

export default router;
