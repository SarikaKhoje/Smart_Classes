import mongoose from 'mongoose';

const parentTeacherMeetingSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  className: { type: String, required: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  meetingLink: { type: String, trim: true, maxlength: 500, default: '' },
  status: { type: String, enum: ['available', 'booked', 'cancelled'], default: 'available' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  topic: { type: String, trim: true, maxlength: 200, default: '' }
}, { timestamps: true });

parentTeacherMeetingSchema.index({ teacherId: 1, startAt: 1 }, { unique: true });
parentTeacherMeetingSchema.index({ parentId: 1, startAt: 1, status: 1 });

export default mongoose.model('ParentTeacherMeeting', parentTeacherMeetingSchema);
