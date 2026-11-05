import { Router } from 'express';
import { promisify } from 'node:util';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { newToken } from '../middleware/auth.js';
import Student from '../models/Student.js';
import { HttpError, asyncHandler } from '../utils/http.js';
import { loginMail, queueMails, welcomeMail } from '../services/mailer.js';

const router = Router();
const scrypt = promisify(scryptCallback);
const email = z.string().trim().email().max(120).transform((v) => v.toLowerCase());
const registerIn = z.object({
  name: z.string().trim().min(2).max(80),
  email,
  password: z.string().min(8, 'Use at least 8 characters').max(128).regex(/[a-z]/, 'Add a lowercase letter').regex(/[A-Z]/, 'Add an uppercase letter').regex(/[0-9]/, 'Add a number').regex(/[^A-Za-z0-9]/, 'Add special characters'),
});
const loginIn = z.object({ email, password: z.string().min(1).max(128) });

async function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const derived = await scrypt(password, salt, 64);
  return { salt, hash: derived.toString('hex') };
}
async function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string') return false;
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const derived = await scrypt(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}
const publicUser = (s) => ({ id: s.id, name: s.name, email: s.email, school: s.school, class_name: s.className, city: s.city, quiz_level: s.quizLevel });

router.post('/register', validate(registerIn), asyncHandler(async (req, res) => {
  const { name, email: address, password } = req.body;
  if (await Student.exists({ email: address })) throw new HttpError(409, 'An account with this email already exists. Please sign in.');
  const credentials = await hashPassword(password);
  const { token, tokenHash } = newToken();
  const student = await Student.create({
    name, email: address, school: 'Independent learner', className: 'Open',
    passwordHash: `${credentials.salt}:${credentials.hash}`, tokenHash,
  });
  const welcome = welcomeMail(student.name);
  queueMails([student.email], welcome.subject, welcome.body);   // account-created mail goes to the e-mail used to sign up
  res.status(201).json({ user: publicUser(student), token });
}));

router.post('/login', validate(loginIn), asyncHandler(async (req, res) => {
  const student = await Student.findOne({ email: req.body.email }).select('+passwordHash');
  if (!student || !(await verifyPassword(req.body.password, student.passwordHash))) {
    throw new HttpError(401, 'Email or password is incorrect.');
  }
  const { token, tokenHash } = newToken();
  student.tokenHash = tokenHash;
  await student.save();
  const note = loginMail(student.name);
  queueMails([student.email], note.subject, note.body);          // sign-in alert goes to that account's e-mail
  res.json({ user: publicUser(student), token });
}));

export default router;
