import mongoose from 'mongoose';
import { ACADEMIC_CLASSES } from '../utils/academicClass.js';

const homeworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subject: { type: String, required: true },
  class: { type: String, enum: ACADEMIC_CLASSES, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teacherName: { type: String },
  dueDate: { type: Date, required: true },
  attachments: [{
    fileName:  String,
    fileUrl: String
  }],
  status: { type: String, enum: ['active', 'submitted', 'graded', 'expired'], default: 'active' },
  submissions: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentName: String,
    submittedAt: { type: Date, default: Date.now },
    fileUrl: String,
    grade: Number,
    feedback: String
  }]
}, { timestamps: true });

export default mongoose.model('Homework', homeworkSchema);
