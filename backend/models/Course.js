import mongoose from 'mongoose';
import { ACADEMIC_CLASSES } from '../utils/academicClass.js';

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  class: {
    type: String,
    enum: ACADEMIC_CLASSES,
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  teacherName: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  schedule: [{
    day: String,
    time: String,
    room: String
  }],
  materials: [{
    title: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model('Course', courseSchema);
