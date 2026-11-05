import mongoose from 'mongoose';
import { EVENT } from '../config.js';

const slotSchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
  bookedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
});
slotSchema.index({ date: 1, time: 1 }, { unique: true });

const Slot = mongoose.model('Slot', slotSchema);
export default Slot;

/** Create one document per presentation date + time (idempotent). */
export async function seedSlots() {
  const ops = EVENT.presentation_dates.flatMap((date) => EVENT.presentation_times.map((time) => ({
    updateOne: { filter: { date, time }, update: { $setOnInsert: { date, time, bookedBy: [] } }, upsert: true },
  })));
  await Slot.bulkWrite(ops);
}
