import mongoose from 'mongoose';
import StudentCheckIn from '../models/StudentCheckIn.js';
import User from '../models/User.js';
import { verifyParentChildAccess } from '../utils/parentAuth.js';
import { notifyLinkedParents } from '../utils/userNotifications.js';
import { recordAuditEvent } from '../utils/auditLog.js';

const parseEventDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
};

export const recordStudentCheckIn = async (req, res, next) => {
  try {
    const { studentId, eventType, date, note = '' } = req.body;
    if (!mongoose.isValidObjectId(studentId) || !['arrival', 'departure'].includes(eventType)) {
      return res.status(400).json({ success: false, message: 'A valid student and arrival/departure event are required' });
    }
    const eventDate = parseEventDate(date);
    if (!eventDate) {
      return res.status(400).json({ success: false, message: 'Date must use YYYY-MM-DD format' });
    }
    if (typeof note !== 'string' || note.length > 300) {
      return res.status(400).json({ success: false, message: 'Note must be 300 characters or fewer' });
    }

    const student = await User.findOne({ _id: studentId, role: 'student' }).select('name class');
    if (!student) return res.status(404).json({ success: false, message: 'Student account not found' });
    if (req.user.role === 'teacher' && (
      !req.user.assignedClasses?.includes(student.class) ||
      !req.user.linkedStudents?.some(id => id.toString() === student._id.toString())
    )) {
      return res.status(403).json({ success: false, message: 'You are not linked to this student' });
    }

    if (eventType === 'departure') {
      const arrival = await StudentCheckIn.findOne({ studentId, eventDate, eventType: 'arrival' });
      if (!arrival) {
        return res.status(409).json({ success: false, message: 'Record arrival before recording departure' });
      }
    }

    const existing = await StudentCheckIn.findOne({ studentId, eventDate, eventType });
    if (existing) {
      return res.status(409).json({ success: false, message: `Student already has an ${eventType} record for this date` });
    }

    const checkIn = await StudentCheckIn.create({
      studentId: student._id,
      studentName: student.name,
      class: student.class,
      eventType,
      eventDate,
      recordedBy: req.user._id,
      note: note.trim()
    });
    await recordAuditEvent(req, {
      action: 'student.check_in',
      targetType: 'student_check_in',
      targetId: checkIn._id,
      summary: `Recorded student ${eventType}`
    });
    await notifyLinkedParents(student._id, {
      type: 'check-in',
      title: `Student ${eventType} recorded`,
      message: `${student.name} was recorded as ${eventType} on ${eventDate.toISOString().slice(0, 10)}.`,
      dedupeKey: `check-in:${checkIn._id}`
    });
    res.status(201).json({ success: true, message: `${eventType} recorded`, checkIn });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'This arrival/departure event was already recorded for the student' });
    }
    next(error);
  }
};

export const getTeacherCheckIns = async (req, res, next) => {
  try {
    const { date, class: className } = req.query;
    let query = {};
    if (req.user.role === 'teacher') {
      const assignedClasses = req.user.assignedClasses || [];
      if (className && !assignedClasses.includes(className)) {
        return res.status(403).json({ success: false, message: 'You are not assigned to this class' });
      }
      query.class = className || { $in: assignedClasses };
      query.studentId = { $in: req.user.linkedStudents || [] };
    } else if (className) {
      query.class = className;
    }
    const eventDate = date ? parseEventDate(date) : null;
    if (date && !eventDate) return res.status(400).json({ success: false, message: 'Date must use YYYY-MM-DD format' });
    if (eventDate) query.eventDate = eventDate;

    const checkIns = await StudentCheckIn.find(query).sort({ recordedAt: -1 });
    res.status(200).json({ success: true, checkIns });
  } catch (error) {
    next(error);
  }
};

export const getChildCheckIns = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Linked student not found' });
    }
    if (req.user.role !== 'admin' && !verifyParentChildAccess(req.user, req.params.id)) {
      return res.status(404).json({ success: false, message: 'Linked student not found' });
    }
    const checkIns = await StudentCheckIn.find({ studentId: req.params.id }).sort({ recordedAt: -1 }).limit(100);
    res.status(200).json({ success: true, checkIns });
  } catch (error) {
    next(error);
  }
};
