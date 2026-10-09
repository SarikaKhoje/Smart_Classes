import mongoose from 'mongoose';
import ParentTeacherMeeting from '../models/ParentTeacherMeeting.js';
import User from '../models/User.js';
import { verifyParentChildAccess } from '../utils/parentAuth.js';
import { notifyUsers } from '../utils/userNotifications.js';

const canParentAccessStudent = (user, studentId) => verifyParentChildAccess(user, studentId);

export const createMeetingAvailability = async (req, res, next) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Only teachers can publish meeting availability' });
    }
    const { className, startAt, endAt, meetingLink = '' } = req.body;
    const start = new Date(startAt);
    const end = new Date(endAt);
    if (!req.user.assignedClasses?.includes(className)) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this class' });
    }
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) ||
        start <= new Date() || end <= start || end - start > 60 * 60 * 1000) {
      return res.status(400).json({ success: false, message: 'Provide a future one-hour-or-shorter meeting window' });
    }
    if (typeof meetingLink !== 'string' || meetingLink.length > 500) {
      return res.status(400).json({ success: false, message: 'Meeting link must be 500 characters or fewer' });
    }
    if (meetingLink.trim()) {
      let parsedLink;
      try {
        parsedLink = new URL(meetingLink.trim());
      } catch {
        return res.status(400).json({ success: false, message: 'Meeting link must be a valid HTTPS URL' });
      }
      if (parsedLink.protocol !== 'https:') {
        return res.status(400).json({ success: false, message: 'Meeting link must be a valid HTTPS URL' });
      }
    }
    const overlap = await ParentTeacherMeeting.exists({
      teacherId: req.user._id,
      status: { $ne: 'cancelled' },
      startAt: { $lt: end },
      endAt: { $gt: start }
    });
    if (overlap) {
      return res.status(409).json({ success: false, message: 'Meeting availability cannot overlap an existing appointment' });
    }
    const meeting = await ParentTeacherMeeting.create({
      teacherId: req.user._id,
      className,
      startAt: start,
      endAt: end,
      meetingLink: meetingLink.trim()
    });
    res.status(201).json({ success: true, meeting });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'This teacher already has an appointment starting at that time' });
    }
    next(error);
  }
};

export const listParentTeacherMeetings = async (req, res, next) => {
  try {
    if (req.user.role === 'teacher') {
      const meetings = await ParentTeacherMeeting.find({ teacherId: req.user._id, status: { $ne: 'cancelled' } })
        .populate('studentId', 'name class')
        .populate('parentId', 'name email')
        .sort({ startAt: 1 });
      return res.status(200).json({ success: true, meetings });
    }
    if (req.user.role !== 'parent' || !mongoose.isValidObjectId(req.params.studentId) ||
        !canParentAccessStudent(req.user, req.params.studentId)) {
      return res.status(404).json({ success: false, message: 'Student or appointment not found' });
    }
    const student = await User.findOne({ _id: req.params.studentId, role: 'student' }).select('class');
    if (!student) return res.status(404).json({ success: false, message: 'Student or appointment not found' });
    const teachers = await User.find({ role: 'teacher', linkedStudents: student._id, isActive: true }).select('_id');
    const meetings = await ParentTeacherMeeting.find({
      teacherId: { $in: teachers.map(teacher => teacher._id) },
      className: student.class,
      $or: [
        { status: 'available', startAt: { $gt: new Date() } },
        { status: 'booked', parentId: req.user._id, studentId: student._id }
      ]
    }).populate('teacherId', 'name subject')
      .sort({ startAt: 1 });
    const parentMeetings = meetings.map(meeting => {
      const record = meeting.toObject();
      if (record.status === 'available') record.meetingLink = '';
      return record;
    });
    res.status(200).json({ success: true, meetings: parentMeetings });
  } catch (error) {
    next(error);
  }
};

export const bookParentTeacherMeeting = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    if (req.user.role !== 'parent' || !mongoose.isValidObjectId(studentId) ||
        !canParentAccessStudent(req.user, studentId) || !mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    const student = await User.findOne({ _id: studentId, role: 'student' }).select('name class');
    if (!student) return res.status(404).json({ success: false, message: 'Appointment not found' });
    const meeting = await ParentTeacherMeeting.findOneAndUpdate(
      {
        _id: req.params.id,
        className: student.class,
        status: 'available',
        startAt: { $gt: new Date() },
        teacherId: { $in: await User.find({ role: 'teacher', linkedStudents: student._id, isActive: true }).distinct('_id') }
      },
      { $set: { status: 'booked', studentId, parentId: req.user._id } },
      { new: true, runValidators: true }
    ).populate('teacherId', 'name subject');
    if (!meeting) return res.status(409).json({ success: false, message: 'Appointment is no longer available' });
    await notifyUsers([meeting.teacherId._id], {
      type: 'meeting',
      title: 'Parent-teacher meeting booked',
      message: `A meeting for ${student.name} was booked for ${meeting.startAt.toLocaleString()}.`,
      relatedStudentId: student._id
    });
    res.status(200).json({ success: true, meeting });
  } catch (error) {
    next(error);
  }
};

export const cancelParentTeacherMeeting = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    const filter = req.user.role === 'teacher'
      ? { _id: req.params.id, teacherId: req.user._id, status: { $in: ['available', 'booked'] } }
      : req.user.role === 'parent'
        ? { _id: req.params.id, parentId: req.user._id, status: 'booked', startAt: { $gt: new Date() } }
        : null;
    if (!filter) return res.status(403).json({ success: false, message: 'Only meeting participants can cancel an appointment' });
    const meeting = await ParentTeacherMeeting.findOneAndUpdate(filter, { $set: { status: 'cancelled' } }, { new: true })
      .populate('studentId', 'name');
    if (!meeting) return res.status(404).json({ success: false, message: 'Appointment not found or cannot be cancelled' });
    const recipientId = req.user.role === 'teacher' ? meeting.parentId : meeting.teacherId;
    if (recipientId) {
      await notifyUsers([recipientId], {
        type: 'meeting',
        title: 'Parent-teacher meeting cancelled',
        message: `The meeting${meeting.studentId?.name ? ` for ${meeting.studentId.name}` : ''} on ${meeting.startAt.toLocaleString()} was cancelled.`,
        relatedStudentId: meeting.studentId?._id
      });
    }
    res.status(200).json({ success: true, meeting });
  } catch (error) {
    next(error);
  }
};
