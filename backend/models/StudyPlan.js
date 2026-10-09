import mongoose from 'mongoose';
import { ACADEMIC_CLASSES } from '../utils/academicClass.js';

const studyPlanSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  studentName: { type: String, required: true },
  class: { type: String, enum: ACADEMIC_CLASSES, required: true },
  targetGoal: { type: String, default: 'Term Academic Excellence' },
  targetExam: { type: String, default: 'Board / Annual Exam' },
  studyHoursDaily: { type: Number, default: 2.5 },
  weakSubjects: [{ type: String }],
  weeklySchedule: [{
    day: { type: String, required: true },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    duration: { type: String, required: true },
    priority: { type: String, enum: ['High', 'Medium', 'Low', 'Urgent'], default: 'High' }
  }],
  recommendations: [{ type: String }],
  provider: { type: String, default: 'Kashvi SmartAI Engine' }
}, {
  timestamps: true
 });

export default mongoose.model('StudyPlan', studyPlanSchema);
