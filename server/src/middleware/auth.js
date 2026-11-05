import crypto from 'node:crypto';
import { settings } from '../config.js';
import Student from '../models/Student.js';
import { HttpError, asyncHandler } from '../utils/http.js';

export const hashToken = (t) => crypto.createHash('sha256').update(t).digest('hex');

/** Returns the plain token (shown to the student once) and the hash that is stored. */
export function newToken() {
  const token = crypto.randomBytes(32).toString('base64url');
  return { token, tokenHash: hashToken(token) };
}

async function load(req) {
  const h = req.get('authorization') ?? '';
  if (!/^bearer /i.test(h)) return null;
  const token = h.slice(7).trim();
  return token ? Student.findOne({ tokenHash: hashToken(token) }) : null;
}

export const requireStudent = asyncHandler(async (req, _res, next) => {
  const s = await load(req);
  if (!s) throw new HttpError(401, "Missing or invalid token. Send 'Authorization: Bearer <token>'.");
  req.student = s;
  next();
});

export const optionalStudent = asyncHandler(async (req, _res, next) => {
  req.student = await load(req);
  next();
});

export function requireJudge(req, _res, next) {
  if (!settings.judgePin) return next(new HttpError(503, 'Judge endpoints are disabled: set JUDGE_PIN in the server .env file.'));
  const given = Buffer.from(req.get('x-judge-pin') ?? '');
  const want = Buffer.from(settings.judgePin);
  if (given.length !== want.length || !crypto.timingSafeEqual(given, want)) return next(new HttpError(403, 'Wrong judge PIN.'));
  next();
}
