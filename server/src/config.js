import 'dotenv/config';
import path from 'node:path';

const csv = (v) => v.split(',').map((s) => s.trim()).filter(Boolean);

export const settings = {
  port: Number(process.env.PORT ?? 8000),
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/iot_explorer',
  uploadDir: path.resolve(process.env.UPLOAD_DIR ?? './uploads'),
  corsOrigins: csv(process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173'),
  timezone: process.env.TIMEZONE ?? 'Asia/Kolkata',
  judgePin: process.env.JUDGE_PIN ?? '',
  slotCapacity: Number(process.env.SLOT_CAPACITY ?? 5),
  smtp: {
    host: process.env.SMTP_HOST ?? '', port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? '', password: process.env.SMTP_PASSWORD ?? '',
    from: process.env.MAIL_FROM ?? '',
  },
  maxUploadMb: 25,
  passPercent: 60, // topic and level quizzes (same as PASS_PERCENT in the frontend)
};

// Mirrors src/data/eventConfig.ts of the frontend
export const EVENT = {
  name: 'IoT Young Innovators Hackathon 2026',
  registration_opens: '2026-10-30', registration_closes: '2026-11-25',
  event_start: '2026-12-01', event_end: '2026-12-20',
  presentation_dates: ['2026-12-01', '2026-12-02', '2026-12-03', '2026-12-04', '2026-12-05'],
  presentation_times: ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'],
  presentation_modes: ['Online (Google Meet)', 'Pre-recorded video'],
  upload_deadline: '2026-12-10',
  evaluation_dates: '11 – 14 Dec 2026', results_on: '2026-12-20',
  evaluation_rounds: [
    { name: 'Round 1 · Project screening', date: '11 – 12 Dec 2026', detail: 'Idea, problem statement, documentation and safety review.' },
    { name: 'Round 2 · Online presentation', date: '13 – 14 Dec 2026', detail: 'Live demo, questions from judges and technical evaluation.' },
    { name: 'Final results & winning teams', date: '20 Dec 2026', detail: 'Final scores, award announcements and certificate release.' },
  ],
  meeting_link: process.env.MEETING_LINK ?? 'https://meet.google.com/your-event-room',
  pass_score: 50,
  awards: ['Participant', 'Finalist', '1st Place – Winning Team', '2nd Place – Winning Team', '3rd Place – Winning Team'],
  rubric: [['Problem & idea', 20], ['Working circuit / simulation', 25], ['Creativity', 20], ['Safety & responsible design', 15], ['Presentation & documentation', 20]],
};
