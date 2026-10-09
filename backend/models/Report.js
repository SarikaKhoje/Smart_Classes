import mongoose from 'mongoose';
import { ACADEMIC_CLASSES } from '../utils/academicClass.js';

const reportSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentName: { type: String, required: true },
  class: { type: String, enum: ACADEMIC_CLASSES, required: true },
  rollNumber: { type: String, required: true },
  academicYear: { type: String, default: '2024-2025' },
  term: { type: String, default: 'Term 1' },
  subjects: [{
    name: String,
    marks: Number,
    maxMarks: { type: Number, default: 100 },
    grade: String,
    remarks: String
  }],
  totalMarks: { type: Number },
  percentage: { type: Number },
  overallGrade: { type: String },
  teacherRemarks: { type: String },
  attendancePercentage: { type: Number, default: 87.5 }
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);
