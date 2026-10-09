import mongoose from 'mongoose';
import UserNotification from '../models/UserNotification.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const [notifications, unreadCount] = await Promise.all([
      UserNotification.find({ recipientId: req.user._id }).sort({ createdAt: -1 }).limit(limit),
      UserNotification.countDocuments({ recipientId: req.user._id, readAt: null })
    ]);
    res.status(200).json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    const notification = await UserNotification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id },
      { $set: { readAt: new Date() } },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.status(200).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const result = await UserNotification.updateMany(
      { recipientId: req.user._id, readAt: null },
      { $set: { readAt: new Date() } }
    );
    res.status(200).json({ success: true, updatedCount: result.modifiedCount });
  } catch (error) {
    next(error);
  }
};
