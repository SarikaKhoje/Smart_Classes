import mongoose from 'mongoose';
import { ACADEMIC_CLASSES } from '../utils/academicClass.js';

const studentCheckInSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  class: {
    type: String,
    enum: ACADEMIC_CLASSES,
    required: true
  },
  eventType: {
    type: String,
    enum: ['arrival', 'departure'],
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  recordedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recordingMethod: {
    type: String,
    enum: ['teacher-recorded'],
    default: 'teacher-recorded',
    required: true
  },
  note: {
    type: String,
    trim: true,
    maxlength: 300,
    default: ''
  }
}, { timestamps: true });

studentCheckInSchema.index({ studentId: 1, eventDate: 1, eventType: 1 }, { unique: true });
studentCheckInSchema.index({ class: 1, eventDate: -1 });

export default mongoose.model('StudentCheckIn', studentCheckInSchema);
