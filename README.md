# IoT Explorer – MERN stack

```
iot-explorer-mern/
├── frontend/   React + Vite + TypeScript  (R)  – Tamil + English YouTube links on every topic page
└── server/     Node.js + Express (E, N) + MongoDB via Mongoose (M)
```

## 1. Start MongoDB
Local install, **or** `cd server && docker compose up -d`, **or** a free MongoDB Atlas connection string.

## 2. Start the server (terminal 1)
```bash
cd server
npm install
cp .env.example .env        # set MONGODB_URI and a long random JUDGE_PIN
npm run dev                 # http://localhost:8000/api/health
```

## 3. Start the frontend (terminal 2)
```bash
cd frontend
npm install
cp .env.example .env        # keeps VITE_API_URL=http://localhost:8000
npm run dev                 # http://localhost:5173
```
Open Academy → any topic → **Watch & Learn** (Tamil + English YouTube).

## How they connect
* The frontend still works on its own (progress saved in the browser).
* `frontend/src/services/api.ts` is the ready-made client for the MERN server (`api.topicVideos`, `api.register`,
  `api.progress`, `api.gradeTopicQuiz`, …). Switch pages over to it one at a time.
* Server details, endpoint table and security notes: `server/README.md`.
