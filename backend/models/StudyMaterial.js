import mongoose from 'mongoose';
import { ACADEMIC_CLASSES } from '../utils/academicClass.js';

const studyMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide material title'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    required: [true, 'Please specify subject']
  },
  class: {
    type: String,
    enum: ACADEMIC_CLASSES,
    required: [true, 'Please specify target class']
  },
  section: {
    type: String,
    default: 'A'
  },
  visibility: {
    type: String,
    enum: ['all', 'class', 'private'],
    default: 'class'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploaderName: {
    type: String,
    default: 'Faculty'
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  storageName: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    default: 'pdf'
  },
  fileSize: {
    type: String,
    default: '2.4 MB'
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

studyMaterialSchema.index({ class: 1, subject: 1 });

export default mongoose.model('StudyMaterial', studyMaterialSchema);
