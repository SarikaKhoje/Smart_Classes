import mongoose from 'mongoose';
import { ACADEMIC_CLASSES } from '../utils/academicClass.js';

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  testCode: { type: String, index: true }, // e.g. TST-MATH-101
  mode: { type: String, enum: ['online', 'offline'], default: 'online' },
  subject: { type: String, required: true },
  class: { type: String, enum: ACADEMIC_CLASSES, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  duration: { type: Number, default: 30 }, // in minutes
  totalMarks: { type: Number, default: 20 },
  passingMarks: { type: Number, default: 8 },
  testDate: { type: Date, default: Date.now },
  questions: [{
    question: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'truefalse', 'short'], default: 'mcq' },
    options: [{ type: String }],
    correctAnswer: { type: String, required: true },
    marks: { type: Number, default: 1 }
  }],
  status: { type: String, enum: ['draft', 'published', 'completed'], default: 'published' },
  attempts: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentName: String,
    score: Number,
    percentage: Number,
    mode: { type: String, enum: ['online', 'offline'], default: 'online' },
    remarks: String,
    submittedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Pre-save hook to generate human-readable testCode if not provided
testSchema.pre('save', function (next) {
  if (!this.testCode) {
    const subjPrefix = (this.subject || 'TST').slice(0, 3).toUpperCase();
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    this.testCode = `TC-${subjPrefix}-${this.class || 'GEN'}-${randSuffix}`;
  }
  next();
});

export default mongoose.model('Test', testSchema);
