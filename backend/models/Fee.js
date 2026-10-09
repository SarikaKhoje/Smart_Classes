import mongoose from 'mongoose';
import { ACADEMIC_CLASSES } from '../utils/academicClass.js';

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentName: { type: String, required: true },
  class: { type: String, enum: ACADEMIC_CLASSES, required: true },
  month: { type: String, required: true },
  year: { type: Number, default: () => new Date().getFullYear() },
  amount: { type: Number, required: true, min: [0.01, 'Fee amount must be greater than zero'] },
  dueDate: { type: Date, required: true },
  paidDate: { type: Date },
  status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
  paymentMethod: { type: String, default: 'online' },
  transactionId: { type: String },
  receiptNumber: { type: String },
  razorpayOrderId: { type: String, index: true },
  razorpayPaymentId: { type: String, unique: true, sparse: true },
  razorpaySignature: { type: String },
  remarks: { type: String }
}, { timestamps: true });

export default mongoose.model('Fee', feeSchema);
