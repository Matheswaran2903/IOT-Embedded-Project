import fs from 'node:fs';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { settings } from './config.js';
import { seedSlots } from './models/Slot.js';
import { verifyMailer } from './services/mailer.js';

async function main() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(settings.mongoUri);
  console.log('MongoDB connected');
  await mongoose.syncIndexes();          // make sure unique indexes exist
  await seedSlots();
  fs.mkdirSync(settings.uploadDir, { recursive: true });

  const server = createApp().listen(settings.port, () => console.log(`IoT Explorer API: http://localhost:${settings.port}  (health: /api/health)`));
  await verifyMailer();
  if (!settings.judgePin) console.warn('JUDGE_PIN is not set: judge/admin endpoints are disabled.');

  const stop = () => server.close(() => mongoose.disconnect().then(() => process.exit(0)));
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

main().catch((err) => { console.error('Startup failed:', err.message); process.exit(1); });
