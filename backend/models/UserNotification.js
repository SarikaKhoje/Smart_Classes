import mongoose from 'mongoose';

const userNotificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['attendance', 'homework', 'fee', 'report', 'announcement', 'message', 'meeting', 'check-in', 'general'],
    default: 'general'
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  relatedStudentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dedupeKey: {
    type: String,
    sparse: true,
    unique: true
  },
  readAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

userNotificationSchema.index({ recipientId: 1, createdAt: -1 });

export default mongoose.model('UserNotification', userNotificationSchema);
