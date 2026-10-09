import mongoose from 'mongoose';
import { ACADEMIC_CLASSES } from '../utils/academicClass.js';

const timetableSchema = new mongoose.Schema({
  class: {
    type: String,
    enum: ACADEMIC_CLASSES,
    required: [true, 'Class grade is required (7, 8, 9, or 10)']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned teacher is required']
  },
  teacherName: {
    type: String,
    required: true
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required (e.g. 09:00)']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required (e.g. 10:00)']
  },
  room: {
    type: String,
    default: 'Room 101'
  }
}, {
  timestamps: true
});

timetableSchema.index({ class: 1, day: 1, startTime: 1 });
timetableSchema.index({ teacher: 1, day: 1, startTime: 1 });

export default mongoose.model('Timetable', timetableSchema);
