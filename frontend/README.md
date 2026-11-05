# Embedded IoT Simulator

A browser-based educational IoT learning platform for Classes 10–12, built with React, TypeScript/JSX (TSX), Vite, Tailwind CSS, Three.js (React Three Fiber + Drei), Framer Motion, Zustand, React Router, and jsPDF. This is a frontend-only application; it does not require a backend.

## Requirements

- Node.js 20 or newer (Node.js 22 recommended)
- npm
- Internet access during the first install so npm can download dependencies

## Run locally in VS Code

1. Extract this ZIP.
2. Open the `embedded-iot-simulator` folder in VS Code.
3. Open **Terminal → New Terminal**.
4. Install dependencies:

   ```bash
   npm install
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open the local URL printed by Vite (usually `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

## Included pages and features

- Home
- Explore 3D Kit
- Learn Components (18 lessons)
- Virtual Lab (15 simulated experiments with wiring checks)
- Practice Challenges (10)
- Quiz (20 questions; pass mark 60/100)
- Quiz Results
- Student Feedback
- Certificate (PDF generation)
- Student Dashboard

Progress is stored in the browser using local storage. Lab readings and experiments are simulated; they do not connect to real hardware.

## Notes

- The existing lesson text, experiment data, quiz questions, challenges, pages, and navigation have been retained.
- The source uses React TSX, which is JSX with TypeScript type annotations, and keeps Tailwind CSS enabled.
- `node_modules` is intentionally not included in the ZIP. Run `npm install` on your machine to install the exact dependency versions recorded in `package-lock.json`.

## Student learning, quiz and online event platform (v3)

| Route | What it does |
|---|---|
| `/academy` | 30-topic learning dashboard with search, category filters and learned progress. |
| `/academy/:id` | Topic notes: principle, how it works, applications, advantages, disadvantages and safety notes. Generate a topic-specific PDF and mark the topic as learned. No topic quiz is embedded here. |
| `/quiz` | Separate Beginner, Intermediate and Advanced quiz tracks with question navigation and a 60% pass mark. |
| `/events` | Event dashboard: dates, online presentation slots, project creation, submission, evaluation rounds, award decision and certificate. |
| `/events/register` | Dedicated student/team registration page. |
| `/simulator` | Simulation Lab: wiring lessons, practice connections and simulated outputs. |
| `/explore` | Interactive 3D component kit. |
| `/dashboard` | Student progress, XP and learning overview. |

### Topic study PDFs

Each of the 30 component topics has a structured study sheet. The PDF is generated in the browser with jsPDF and downloaded to the student's device. Learned-topic status is saved in browser local storage.

### Online event timeline

Edit `src/data/eventConfig.ts` to set the registration open/close dates, event start/end dates, presentation dates, upload deadline, evaluation rounds, result date, online meeting URL and judging rubric. The judge award dropdown supports finalist and first/second/third-place winning-team certificates.

### Honest limits before a real public launch

This ZIP is a frontend prototype. Student progress and event registration are stored in the current browser only. The project upload currently records the file name and size or a demo link; it does not upload file bytes to a server. The judge PIN is visible in frontend source and is only a demonstration. Email notifications may be simulated. To run a real online competition where students register from different devices, upload files, judges evaluate securely, and all teams see a shared leaderboard, connect Firebase or Supabase authentication, database and storage, and move judging to protected server functions. Replace the placeholder Google Meet URL before the event.

### Where to edit things
- Event dates, judge PIN, pass score, meeting link: `src/data/eventConfig.ts`
- Topic notes: `src/data/topicStudy.ts`; question bank: `src/data/quizQuestions.ts`; quiz level mapping: `src/data/quizLevels.ts`
- Simulator projects, wires, code, behaviour: `src/data/simProjects.ts`
- Circuit images from your Word file: `public/images/circuits/cNN.jpg`

### Real e-mail
Copy `.env.example` to `.env`, create a free EmailJS service + template with `{{to_email}}`, `{{subject}}`, `{{message}}`, paste the three keys, restart `npm run dev`. Without keys, emails are shown as *simulated* in the on-page outbox.

### Honest limits (frontend-only)
- Progress, registrations and results are stored in the browser (localStorage). Different students/judges on different computers will NOT see each other's data until you add a backend (e.g. Firebase/Supabase).
- Uploaded files are not stored anywhere (only name/size are recorded). The judge PIN is a demo; use real login on a backend.
- YouTube buttons open a search restricted to a recommended channel name; they do not link to one fixed video.
- The simulator checks pin-to-pin connections and models the behaviour of each project; it is not a full electronics (SPICE) simulator.
- IR project code now follows the diagram (LED = D3, Buzzer = D8). The original Word code had a missing `;`/`}` and different pins.

## v7 redesign: "Pocket Lab" (student edition)
- **Theme**: `src/styles/v7.css` (loaded after `index.css`). Colours live in the `:root` variables at the top.
- **Home**: 3D board with orbiting parts (`components/three/HeroScene.tsx`), adventure cards, parts strip, live progress panel.
- **Dashboard** (`pages/Dashboard.tsx`): level + XP, overall progress ring, quick actions, 8 progress cards, 8 badges, editable profile. All numbers come from `hooks/useProgress.ts`.
- **New game** (`/game`, `pages/PartMatch.tsx`): 3D flip-card matching of a part picture with its job; 3 levels, stars, best score saved. Parts and clues: `data/gameParts.ts`.
- **Navbar** shows the student's level and XP. A CSS-only 3D backdrop (`components/ui/Backdrop3D.tsx`) sits behind every page.
