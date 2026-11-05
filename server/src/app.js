import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { settings } from './config.js';
import { errorHandler, notFound } from './middleware/errors.js';
import certificates from './routes/certificates.js';
import auth from './routes/auth.js';
import events from './routes/events.js';
import feedback from './routes/feedback.js';
import quiz from './routes/quiz.js';
import students from './routes/students.js';
import topics from './routes/topics.js';

export function createApp() {
  const app = express();
  // app.set('trust proxy', 1);   // uncomment when deployed behind a reverse proxy (Render, Nginx, ...)
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: settings.corsOrigins }));
  app.use(express.json({ limit: '200kb' }));
  app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: 'draft-7', legacyHeaders: false }));
  // Stricter limit on account creation (stops bulk sign-ups)
  app.use('/api/students', rateLimit({ windowMs: 60 * 60 * 1000, limit: 30, skip: (req) => req.method !== 'POST', standardHeaders: 'draft-7', legacyHeaders: false }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false }));
  app.use('/api/auth', auth);
  app.use('/api/quiz', quiz);
  app.use('/api/feedback', feedback);
  app.use('/api/events', events);
  app.use('/api/certificates', certificates);
  app.use('/api', topics);
  app.use('/api', students);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
