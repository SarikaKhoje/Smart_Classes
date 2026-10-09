import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorName: { type: String, required: true },
  actorRole: { type: String, enum: ['admin', 'teacher', 'student', 'parent', 'system'], required: true },
  action: { type: String, required: true, trim: true, maxlength: 80 },
  targetType: { type: String, required: true, trim: true, maxlength: 80 },
  targetId: { type: String, default: '', maxlength: 100 },
  summary: { type: String, required: true, trim: true, maxlength: 240 }
}, { timestamps: { createdAt: true, updatedAt: false } });

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
