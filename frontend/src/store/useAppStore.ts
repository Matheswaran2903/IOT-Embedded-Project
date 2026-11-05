import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ComponentId, FeedbackData, QuizResult } from '../types';

export interface TopicResult { score: number; total: number; passed: boolean; date: string }
export interface Mail { id: string; to: string; subject: string; body: string; at: string; status: 'sent' | 'simulated' | 'failed' }
export interface EventState {
  profile: { name: string; email: string; parentEmail: string; school: string; className: string; city: string; team: string; at: string } | null;
  slot: { date: string; time: string; mode: string } | null;
  project: { title: string; problem: string; topics: number[]; description: string; code: string; simId: string } | null;
  submission: { fileName: string; fileSize: number; link: string; at: string } | null;
  evaluation: { scores: number[]; total: number; remark: string; award?: string; at: string } | null;
  certId: string | null;
}
const emptyEvent: EventState = { profile: null, slot: null, project: null, submission: null, evaluation: null, certId: null };

interface AppState {
  topicResults: Record<number, TopicResult>;
  learnedTopics: number[];
  quizLevel: 'beginner' | 'intermediate' | 'advanced';
  markTopicLearned: (id: number) => void;
  setQuizLevel: (level: 'beginner' | 'intermediate' | 'advanced') => void;
  sims: string[];
  event: EventState;
  outbox: Mail[];
  gameBest: Record<string, { score: number; stars: number }>;
  gamesWon: number;
  setGameResult: (level: string, score: number, stars: number) => void;
  setTopicResult: (id: number, r: TopicResult) => void;
  completeSim: (id: string) => void;
  patchEvent: (p: Partial<EventState>) => void;
  addMail: (m: Mail) => void;
  resetEvent: () => void;
  studentName: string;
  schoolName: string;
  className: string;
  explored: ComponentId[];
  lessons: ComponentId[];
  experiments: string[];
  challenges: string[];
  quiz: QuizResult | null;
  feedback: FeedbackData | null;
  certificateId: string | null;
  certificateDownloaded: boolean;
  setStudent: (p: { studentName?: string; schoolName?: string; className?: string }) => void;
  markExplored: (id: ComponentId) => void;
  completeLesson: (id: ComponentId) => void;
  completeExperiment: (id: string) => void;
  completeChallenge: (id: string) => void;
  setQuiz: (r: QuizResult | null) => void;
  setFeedback: (f: FeedbackData) => void;
  setCertificate: (id: string) => void;
  markCertificateDownloaded: () => void;
  resetAll: () => void;
}

const add = <T,>(list: T[], v: T) => (list.includes(v) ? list : [...list, v]);

const initial = {
  gameBest: {} as Record<string, { score: number; stars: number }>, gamesWon: 0,
  topicResults: {} as Record<number, TopicResult>, learnedTopics: [] as number[], quizLevel: 'beginner' as const, sims: [] as string[], event: emptyEvent, outbox: [] as Mail[],
  studentName: '', schoolName: '', className: '',
  explored: [] as ComponentId[], lessons: [] as ComponentId[],
  experiments: [] as string[], challenges: [] as string[],
  quiz: null as QuizResult | null, feedback: null as FeedbackData | null,
  certificateId: null as string | null, certificateDownloaded: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initial,
      setStudent: (p) => set(p),
      markExplored: (id) => set((s) => ({ explored: add(s.explored, id) })),
      completeLesson: (id) => set((s) => ({ lessons: add(s.lessons, id) })),
      completeExperiment: (id) => set((s) => ({ experiments: add(s.experiments, id) })),
      completeChallenge: (id) => set((s) => ({ challenges: add(s.challenges, id) })),
      setQuiz: (quiz) => set({ quiz }),
      setFeedback: (feedback) => set({ feedback }),
      setCertificate: (certificateId) => set({ certificateId }),
      markCertificateDownloaded: () => set({ certificateDownloaded: true }),
      setGameResult: (level, score, stars) => set((s) => {
        const old = s.gameBest[level];
        const best = !old || score > old.score ? { score, stars: Math.max(stars, old?.stars ?? 0) } : { score: old.score, stars: Math.max(stars, old.stars) };
        return { gameBest: { ...s.gameBest, [level]: best }, gamesWon: s.gamesWon + 1 };
      }),
      setTopicResult: (id, r) => set((s) => ({ topicResults: { ...s.topicResults, [id]: r } })),
      markTopicLearned: (id) => set((s) => ({ learnedTopics: add(s.learnedTopics, id) })),
      setQuizLevel: (quizLevel) => set({ quizLevel }),
      completeSim: (id) => set((s) => ({ sims: add(s.sims, id) })),
      patchEvent: (p) => set((s) => ({ event: { ...s.event, ...p } })),
      addMail: (m) => set((s) => ({ outbox: [m, ...s.outbox].slice(0, 50) })),
      resetEvent: () => set({ event: emptyEvent, outbox: [] }),
      resetAll: () => set({ ...initial }),
    }),
    { name: 'iot-simulator-progress', partialize: (state) => Object.fromEntries(Object.entries(state).filter(([, value]) => typeof value !== 'function')) as AppState }
  )
);

// The legacy shared browser key is never used for a signed-in student.
// Persist separate snapshots per authenticated account, including when accounts
// share the same computer/browser. Server-side syncing is a separate concern.
let activeStudent: string | null = null;
const snapshot = () => Object.fromEntries(Object.entries(useAppStore.getState()).filter(([,v]) => typeof v !== 'function'));
export function switchStudentProgress(id: string | null) {
  if (activeStudent === id) return;
  if (activeStudent) localStorage.setItem(`iot-progress-user-${activeStudent}`, JSON.stringify(snapshot()));
  activeStudent = id;
  const raw = id ? localStorage.getItem(`iot-progress-user-${id}`) : null;
  let saved: Record<string, unknown> = {};
  try { saved = raw ? JSON.parse(raw) : {}; } catch { saved = {}; }
  useAppStore.setState({ ...initial, ...saved });
}
useAppStore.subscribe(() => {
  if (activeStudent) localStorage.setItem(`iot-progress-user-${activeStudent}`, JSON.stringify(snapshot()));
});
