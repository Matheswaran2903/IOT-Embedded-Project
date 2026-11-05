// Runs offline:  npm test   (pure helpers only - no MongoDB needed)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getTopic, quizBank, topics, videosFor, youtubeSearchUrl } from '../src/utils/dataLoader.js';
import { todayStr, windowStatus } from '../src/utils/dates.js';
import { seededShuffle } from '../src/utils/shuffle.js';

test('30 topics, each with Tamil and English YouTube links', () => {
  assert.equal(topics().length, 30);
  for (const t of topics()) {
    const v = videosFor(t);
    assert.match(v.tamil.url, /^https:\/\/www\.youtube\.com\/results\?search_query=/);
    assert.match(v.english.url, /^https:\/\/www\.youtube\.com\/results\?search_query=/);
  }
});

test('youtube url is encoded like the frontend ytLink()', () => {
  assert.equal(youtubeSearchUrl('Lost Tech Tamil', 'HC-SR04 sensor'),
    'https://www.youtube.com/results?search_query=Lost%20Tech%20Tamil%20HC-SR04%20sensor');
  assert.equal(getTopic(2).youtube.tamil.channel, 'Lost Tech Tamil');
});

test('every quiz answer is one of its options; level indices exist', () => {
  for (const t of topics()) for (const q of t.quiz) assert.ok(q.options.includes(q.answer));
  const { questions, levels } = quizBank();
  for (const m of Object.values(levels)) for (const i of m.indices) assert.ok(questions[i]);
});

test('seeded shuffle is stable and keeps all options', () => {
  const opts = ['a', 'b', 'c', 'd'];
  assert.deepEqual(seededShuffle(opts, 42), seededShuffle(opts, 42));
  assert.deepEqual([...seededShuffle(opts, 7)].sort(), opts);
});

test('event windows use the school time zone', () => {
  const now = new Date('2026-11-01T10:00:00Z');
  assert.equal(todayStr('Asia/Kolkata', now), '2026-11-01');
  assert.equal(windowStatus('2026-10-30', '2026-11-25', 'Asia/Kolkata', now), 'Open now');
  assert.equal(windowStatus('2026-12-01', '2026-12-20', 'Asia/Kolkata', now), 'Not open yet');
  assert.equal(windowStatus('2026-10-01', '2026-10-20', 'Asia/Kolkata', now), 'Closed');
  // 23:00 UTC on the 31st is already 1 Nov in India
  assert.equal(todayStr('Asia/Kolkata', new Date('2026-10-31T23:00:00Z')), '2026-11-01');
});
