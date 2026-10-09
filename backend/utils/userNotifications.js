import UserNotification from '../models/UserNotification.js';
import User from '../models/User.js';

export const notifyUsers = async (recipientIds, notification) => {
  const uniqueRecipientIds = [...new Set(recipientIds.filter(Boolean).map(id => id.toString()))];
  if (!uniqueRecipientIds.length) return;
  const title = notification.title.slice(0, 120);
  const message = notification.message.slice(0, 500);

  if (!notification.dedupeKey) {
    await UserNotification.insertMany(uniqueRecipientIds.map(recipientId => ({
      recipientId,
      type: notification.type || 'general',
      title,
      message,
      relatedStudentId: notification.relatedStudentId
    })));
    return;
  }

  await UserNotification.bulkWrite(uniqueRecipientIds.map((recipientId) => ({
    updateOne: {
      filter: { recipientId, dedupeKey: `${notification.dedupeKey}:${recipientId}` },
      update: {
        $setOnInsert: {
          recipientId,
          type: notification.type || 'general',
          title,
          message,
          relatedStudentId: notification.relatedStudentId,
          dedupeKey: `${notification.dedupeKey}:${recipientId}`
        }
      },
      upsert: true
    }
  })));
};

export const notifyLinkedParents = async (studentId, notification) => {
  const parents = await User.find({
    role: 'parent',
    'children.studentId': studentId
  }).select('_id');
  await notifyUsers(parents.map(parent => parent._id), {
    ...notification,
    relatedStudentId: studentId
  });
};
