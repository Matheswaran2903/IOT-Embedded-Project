import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  to: { type: String, index: true }, subject: String, body: String,
  status: { type: String, enum: ['sent', 'simulated', 'failed'] },
}, { timestamps: true });

export default mongoose.model('MailOutbox', schema);
