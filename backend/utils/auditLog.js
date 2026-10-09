import AuditLog from '../models/AuditLog.js';

export const recordAuditEvent = (req, event) => AuditLog.create({
  actorId: req.user?._id,
  actorName: req.user?.name || 'System',
  actorRole: req.user?.role || 'system',
  action: event.action,
  targetType: event.targetType,
  targetId: event.targetId?.toString() || '',
  summary: event.summary
});
