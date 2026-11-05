import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  certId: { type: String, required: true, unique: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  kind: { type: String, enum: ['course', 'event'], required: true },
  title: { type: String, required: true },
  score: Number,
}, { timestamps: true });

export default mongoose.model('Certificate', certificateSchema);
