// Loads the topic / quiz data exported from the frontend (src/data/*.json).
import fs from 'node:fs';

const read = (name) => JSON.parse(fs.readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'));
const TOPICS = read('topics.json');
const QUIZ_BANK = read('quiz_bank.json');

export const topics = () => TOPICS;
export const quizBank = () => QUIZ_BANK;
export const getTopic = (id) => TOPICS.find((t) => t.id === id) ?? null;

/** Same format as ytLink() in the frontend (src/data/topicContent.ts). */
export const youtubeSearchUrl = (channel, query) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${channel} ${query}`)}`;

export function videosFor(topic) {
  const out = {};
  for (const [lang, label] of [['tamil', 'தமிழ் · Tamil'], ['english', 'English']]) {
    const y = topic.youtube[lang];
    out[lang] = { label, channel: y.channel, query: y.query, url: youtubeSearchUrl(y.channel, y.query) };
  }
  return out;
}
