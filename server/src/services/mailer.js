// E-mail sending. Uses SMTP when configured; otherwise records the message as "simulated".
import nodemailer from 'nodemailer';
import { settings } from '../config.js';
import MailOutbox from '../models/MailOutbox.js';

const { host, port, user, password, from } = settings.smtp;
export const smtpConfigured = !!(host && from && user && password);
const transport = smtpConfigured
  ? nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass: password } })
  : null;

/** Called once at server start so a wrong SMTP password is visible immediately in the console. */
export async function verifyMailer() {
  if (!transport) {
    console.warn('E-mail: SMTP is NOT configured (set SMTP_HOST, SMTP_USER, SMTP_PASSWORD, MAIL_FROM in server/.env). Mails are only recorded as "simulated" and are NOT delivered.');
    return false;
  }
  try { await transport.verify(); console.log(`E-mail: SMTP ready (${host}:${port} as ${user}). Real mails will be delivered.`); return true; }
  catch (err) { console.error(`E-mail: SMTP login FAILED - ${err.message}. Mails will be marked "failed". Check SMTP_USER / SMTP_PASSWORD (Gmail needs an App Password).`); return false; }
}

async function deliver(to, subject, text) {
  if (!transport || !to) return 'simulated';
  try { await transport.sendMail({ from, to, subject, text }); return 'sent'; }
  catch (err) { console.warn(`mail to ${to} failed: ${err.message}`); return 'failed'; }
}

async function sendMail(to, subject, body) {
  const status = await deliver(to, subject, body);
  await MailOutbox.create({ to, subject, body, status });
  return status;
}

/** Fire-and-forget: a mail problem must never break an API call. */
export function queueMails(recipients, subject, body) {
  for (const to of new Set(recipients.filter(Boolean))) {
    setImmediate(() => sendMail(to, subject, body).catch((e) => console.warn('mail log failed:', e.message)));
  }
}

/** Await delivery (used for registration so the client can report SMTP problems). */
export async function sendRegistrationMails(recipients, subject, body) {
  const statuses = await Promise.all([...new Set(recipients.filter(Boolean))].map(async (to) => {
    try { return { to, status: await sendMail(to, subject, body) }; }
    catch (error) { console.warn('Mail tracking error:', error.message); return { to, status: 'failed' }; }
  }));
  return statuses;
}

/** Recent mails sent to the given addresses (shown on the student's event page). */
export const recentMails = (addresses, limit = 20) =>
  MailOutbox.find({ to: { $in: addresses.filter(Boolean) } }).sort({ createdAt: -1 }).limit(limit).lean();

// ---------------------------------------------------------------- message templates
const stamp = () => new Date().toLocaleString('en-IN', { timeZone: settings.timezone, dateStyle: 'medium', timeStyle: 'short' }) + ' IST';

export const welcomeMail = (name) => ({
  subject: 'Welcome to IoT Explorer - your account is ready',
  body: `Hi ${name},\n\nYour IoT Explorer account has been created successfully on ${stamp()}.\n\nYou can now learn IoT topics, run the simulator, take quizzes and join the IoT Young Innovators Hackathon from the Events page.\n\nIf you did not create this account, please ignore this email.\n\n- IoT Explorer Team`,
});

export const loginMail = (name) => ({
  subject: 'New sign-in to your IoT Explorer account',
  body: `Hi ${name},\n\nYou signed in to IoT Explorer on ${stamp()}.\n\nIf this was you, no action is needed. If it was not you, please change your password.\n\n- IoT Explorer Team`,
});
