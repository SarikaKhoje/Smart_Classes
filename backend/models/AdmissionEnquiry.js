import mongoose from 'mongoose';

const admissionEnquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  desiredClass: { type: String, required: true, trim: true, maxlength: 60 },
  message: { type: String, trim: true, maxlength: 2000, default: '' },
  status: { type: String, enum: ['new', 'contacted', 'enrolled', 'closed'], default: 'new' }
}, { timestamps: true });

admissionEnquirySchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('AdmissionEnquiry', admissionEnquirySchema);
