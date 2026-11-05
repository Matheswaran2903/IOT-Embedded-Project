# IoT Explorer – MERN backend (Node.js + Express + MongoDB)

API for the React/Vite **IoT Explorer** frontend. It serves the 30 topics with **Tamil + English YouTube links**,
quizzes (graded on the server), student progress, feedback, the hackathon event flow, judge scoring and certificates.

## Run it

```bash
cd server
npm install
cp .env.example .env          # set MONGODB_URI and JUDGE_PIN
npm run dev                   # http://localhost:8000
```

MongoDB: install it locally, **or** run `docker compose up -d` (uses `docker-compose.yml`), **or** paste a free
MongoDB Atlas connection string into `MONGODB_URI`.

* Health check: http://localhost:8000/api/health
* Offline checks (no database needed): `npm test` and `npm run check-data`

## Folder layout

```
src/server.js          connects to MongoDB, seeds presentation slots, starts Express
src/app.js             Express app: helmet, CORS, rate limits, routes, error handler
src/config.js          settings (.env) + event dates / rubric (same values as eventConfig.ts)
src/models/            Student (progress, feedback, event stages), Slot, Certificate, MailOutbox
src/routes/            topics, quiz, students, feedback, events, certificates
src/middleware/        auth (student token + judge PIN), zod validation, error handling
src/services/          mailer (nodemailer / simulated), certificate ids
src/utils/             data loader, seeded shuffle, date helpers
src/data/              topics.json (30 topics, notes, channels, quizzes) + quiz_bank.json  <- exported from the frontend
```

## Endpoints (same URLs and JSON as the earlier Python version, so `frontend/src/services/api.ts` works unchanged)

| Method & path | Auth | What it does |
|---|---|---|
| GET `/api/topics?q=&category=` | – | 30 topics, each with Tamil + English video links |
| GET `/api/topics/:id` | – | Topic + study notes + key points |
| GET `/api/topics/:id/videos` | – | `{tamil:{channel,url}, english:{channel,url}}` |
| GET `/api/videos` | – | Video links for all topics |
| GET/POST `/api/topics/:id/quiz` | optional | Get shuffled questions / grade answers (best score saved if logged in) |
| GET `/api/quiz/levels`, `/api/quiz/:level` | – | Level quizzes (answers are NOT sent) |
| POST `/api/quiz/:level/submit` | optional | Grade a level quiz |
| POST `/api/students` | – | Create student → returns `token` **once** |
| GET/PATCH/DELETE `/api/me` | token | Profile / update / delete account |
| GET `/api/me/progress` | token | Learned topics, results, sims, games |
| POST `/api/me/topics/:id/learned` | token | Mark topic learned |
| PUT `/api/me/sims/:simId`, `/api/me/games/:level` | token | Save simulator / game progress |
| POST/GET `/api/feedback`, `/api/feedback/me` | token | Feedback form (after a quiz) |
| POST `/api/certificates/course` | token | Course certificate (needs passed quiz + feedback) |
| GET `/api/certificates/:id` | – | Public certificate verification |
| GET `/api/events/config`, `/api/events/slots` | – | Dates, rubric, slot availability |
| POST `/api/events/register`, `/slot`; PUT `/project`; POST `/submission` | token | Hackathon steps |
| GET `/api/events/me` | token | All event stages for the student |
| GET `/api/events/admin/submissions`, `/…/:id/file`; POST `/…/evaluate/:id`; GET `/api/feedback/admin/all` | `X-Judge-Pin` | Judge tools |

Send the token as `Authorization: Bearer <token>`. Errors are JSON: `{ "detail": "message" }`.

## Security notes

* Student tokens are random and stored only as SHA-256 hashes (`tokenHash` is never returned by queries). The judge PIN lives in `.env` on the server (admin routes stay disabled until it is set) – unlike the frontend `judgePin`, which anyone can read.
* All input is validated with zod before it reaches MongoDB (blocks operator-injection such as `{"$ne": ...}`); quiz answers are graded on the server.
* Slot booking is atomic (`findOneAndUpdate` with a seat-count check), so two students cannot take the last seat.
* Uploads: 25 MB limit, extension allow-list, sanitized names, checks run before the file is saved, path guard on download.
* helmet, CORS allow-list and rate limits are enabled. Behind a reverse proxy, uncomment `trust proxy` in `src/app.js`.
* Students are school children: keep `.env` and the database private, use HTTPS in production, and use `DELETE /api/me` for removal requests.
## Email/password authentication

The API also provides `POST /api/auth/register` (`{ name, email, password }`) and `POST /api/auth/login` (`{ email, password }`). Both return `{ user, token }`; send the token as `Authorization: Bearer <token>` for protected `/api/me` and progress endpoints. Passwords are stored as salted scrypt hashes. The original student registration endpoint and existing token-based routes remain available for compatibility.
