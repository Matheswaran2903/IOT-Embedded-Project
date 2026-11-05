import { useAppStore } from '../store/useAppStore';
import { LEARNING_TOPICS } from '../data/learningTopics';
import { SIM_PROJECTS } from '../data/simProjects';
import { KIT_COMPONENTS } from '../data/kitComponents';
import { EXPERIMENTS } from '../data/experiments';
import { CHALLENGES } from '../data/challenges';

export const LEVEL_TITLES = ['Spark', 'Wire Wizard', 'Circuit Maker', 'Sensor Scout', 'Robo Builder', 'IoT Hero', 'Master Inventor'];
export const LEVEL_AVATARS = ['🐣', '⚡', '🔧', '📡', '🤖', '🚀', '👑'];
export const XP_PER_LEVEL = 250;
export const GAME_LEVEL_IDS = ['easy', 'medium', 'hard'];

export interface ProgressItem { key: string; emoji: string; label: string; done: number; total: number; to: string; color: string; cta: string; text?: string }
export interface Badge { id: string; emoji: string; name: string; hint: string; earned: boolean }

/** One place that turns saved student data into progress numbers, XP, level and badges. */
export function useProgress() {
  const s = useAppStore();
  const topicsPassed = Object.values(s.topicResults).filter((r) => r.passed).length;
  const gameLevels = Object.keys(s.gameBest).length;
  const quizPassed = !!s.quiz?.passed;

  const items: ProgressItem[] = [
    { key: 'topics', emoji: '📘', label: 'Topic quizzes passed', done: topicsPassed, total: LEARNING_TOPICS.length, to: '/academy', color: '#a78bfa', cta: 'Pass a topic quiz' },
    { key: 'sims', emoji: '🔌', label: 'Circuits wired', done: s.sims.length, total: SIM_PROJECTS.length, to: '/simulator', color: '#2de2e6', cta: 'Wire a circuit in the Lab' },
    { key: 'explored', emoji: '🧭', label: 'Parts explored in 3D', done: s.explored.length, total: KIT_COMPONENTS.length, to: '/explore', color: '#6ee7a8', cta: 'Explore a part in the 3D kit' },
    { key: 'lessons', emoji: '📖', label: 'Component lessons', done: s.lessons.length, total: KIT_COMPONENTS.length, to: '/learn', color: '#ffd23f', cta: 'Finish a component lesson' },
    { key: 'experiments', emoji: '🧪', label: 'Experiments done', done: s.experiments.length, total: EXPERIMENTS.length, to: '/lab', color: '#ff9f6b', cta: 'Run a virtual experiment' },
    { key: 'challenges', emoji: '🎯', label: 'Challenges solved', done: s.challenges.length, total: CHALLENGES.length, to: '/challenges', color: '#ff6b81', cta: 'Try a practice challenge' },
    { key: 'quiz', emoji: '🏆', label: 'Final quiz', done: quizPassed ? 1 : 0, total: 1, to: '/quiz', color: '#f9a8d4', cta: 'Take the final quiz', text: s.quiz ? `${s.quiz.score} / ${s.quiz.total}` : 'Not taken' },
    { key: 'game', emoji: '🎮', label: 'Part Match levels won', done: gameLevels, total: GAME_LEVEL_IDS.length, to: '/game', color: '#7dd3fc', cta: 'Play Part Match' },
  ];

  const fractions = items.map((i) => (i.total ? Math.min(1, i.done / i.total) : 0));
  const pct = Math.round((fractions.reduce((a, b) => a + b, 0) / items.length) * 100);

  const bestStars = Object.values(s.gameBest).reduce((a, g) => a + g.stars, 0);
  const xp = topicsPassed * 100 + s.sims.length * 80 + s.explored.length * 10 + s.lessons.length * 20 + s.experiments.length * 40 + s.challenges.length * 30 + (quizPassed ? 150 : 0) + bestStars * 25 + s.gamesWon * 10;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const idx = Math.min(level - 1, LEVEL_TITLES.length - 1);

  const badges: Badge[] = [
    { id: 'spark', emoji: '⚡', name: 'First Spark', hint: 'Explore any part in 3D', earned: s.explored.length >= 1 },
    { id: 'topic', emoji: '📘', name: 'Topic Starter', hint: 'Pass a topic quiz', earned: topicsPassed >= 1 },
    { id: 'wire', emoji: '🔌', name: 'Wire Wizard', hint: 'Wire a circuit correctly', earned: s.sims.length >= 1 },
    { id: 'lab', emoji: '🧪', name: 'Lab Pro', hint: 'Finish 5 experiments', earned: s.experiments.length >= 5 },
    { id: 'game', emoji: '🎮', name: 'Game On', hint: 'Win a Part Match game', earned: s.gamesWon >= 1 },
    { id: 'memory', emoji: '🧠', name: 'Memory Master', hint: 'Get 3 stars on Hard', earned: (s.gameBest.hard?.stars ?? 0) >= 3 },
    { id: 'quiz', emoji: '🏆', name: 'Quiz Champ', hint: 'Pass the final quiz', earned: quizPassed },
    { id: 'cert', emoji: '🎓', name: 'Certified', hint: 'Download your certificate', earned: s.certificateDownloaded },
  ];

  const next = items.filter((i) => i.done < i.total).sort((a, b) => a.done / a.total - b.done / b.total)[0] ?? null;

  return { s, items, pct, xp, level, title: LEVEL_TITLES[idx], avatar: LEVEL_AVATARS[idx], into: xp % XP_PER_LEVEL, need: XP_PER_LEVEL, badges, next };
}
