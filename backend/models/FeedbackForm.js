import mongoose from 'mongoose';
import { ACADEMIC_CLASSES } from '../utils/academicClass.js';

const feedbackResponseSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const feedbackFormSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lecture title is required'],
    trim: true,
    maxlength: 120
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: 80
  },
  class: {
    type: String,
    enum: ACADEMIC_CLASSES,
    required: [true, 'Class is required'],
    trim: true
  },
  lectureDate: {
    type: Date,
    required: [true, 'Lecture date is required']
  },
  question: {
    type: String,
    trim: true,
    maxlength: 300,
    default: 'How helpful was this lesson?'
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherName: {
    type: String,
    required: true
  },
  responses: {
    type: [feedbackResponseSchema],
    default: []
  }
}, { timestamps: true });

feedbackFormSchema.index({ class: 1, lectureDate: -1 });
feedbackFormSchema.index({ teacherId: 1, createdAt: -1 });

export default mongoose.model('FeedbackForm', feedbackFormSchema);
