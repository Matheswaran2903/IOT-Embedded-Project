import mongoose from 'mongoose';

const { Schema } = mongoose;
const sub = (def) => new Schema(def, { _id: false });

const eventSchema = sub({
  registeredAt: Date,
  slot: sub({ date: String, time: String, mode: String, at: Date }),
  project: sub({ title: String, problem: String, description: String, code: String, simId: String, topics: [Number], at: Date }),
  submission: sub({ fileName: String, filePath: String, fileSize: Number, link: String, at: Date }),
  evaluation: sub({ scores: [Number], total: Number, remark: String, award: String, certId: String, at: Date }),
});

const studentSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 120 },
  parentEmail: { type: String, default: '', lowercase: true, trim: true, maxlength: 120 },
  school: { type: String, required: true, trim: true, maxlength: 120 },
  className: { type: String, required: true, trim: true, maxlength: 10 },
  city: { type: String, default: '', trim: true, maxlength: 80 },
  team: { type: String, default: '', trim: true, maxlength: 80 },
  tokenHash: { type: String, required: true, unique: true, select: false },   // never returned by queries
  passwordHash: { type: String, default: undefined, select: false }, // optional for compatibility with legacy token-only accounts
  gamesWon: { type: Number, default: 0 },
  quizLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },

  learnedTopics: [sub({ topicId: Number, at: Date })],
  topicResults: [sub({ topicId: Number, score: Number, total: Number, passed: Boolean, at: Date })],
  quizResults: [sub({ level: String, score: Number, passed: Boolean, answers: [Number], at: Date })],
  sims: [sub({ simId: String, at: Date })],
  gameBest: [sub({ level: String, score: Number, stars: Number })],
  feedback: sub({
    name: String, cls: String, school: String, overall: Number, usability: Number, learning: Number,
    favorite: String, suggestions: String, at: Date,
  }),
  event: { type: eventSchema, default: () => ({}) },
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);
