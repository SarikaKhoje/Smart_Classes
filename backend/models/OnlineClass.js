import mongoose from 'mongoose';
import { ACADEMIC_CLASSES } from '../utils/academicClass.js';

const onlineClassSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Class title is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required']
  },
  class: {
    type: String,
    enum: ACADEMIC_CLASSES,
    required: [true, 'Target grade is required (7, 8, 9, or 10)']
  },
  section: {
    type: String,
    default: 'A'
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
  date: {
    type: Date,
    default: Date.now
  },
  startTime: {
    type: String,
    default: '10:00 AM'
  },
  endTime: {
    type: String,
    default: '10:45 AM'
  },
  scheduledAt: {
    type: Date,
    required: [true, 'Scheduled date and time is required']
  },
  duration: {
    type: Number,
    default: 45 // minutes
  },
  meetingUrl: {
    type: String,
    required: [true, 'Meeting URL is required (Zoom, Google Meet, or WebRTC link)']
  },
  platform: {
    type: String,
    default: 'Google Meet'
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed', 'cancelled'],
    default: 'upcoming'
  }
}, {
  timestamps: true
});

onlineClassSchema.index({ class: 1, scheduledAt: 1 });

export default mongoose.model('OnlineClass', onlineClassSchema);
