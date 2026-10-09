import Attendance from '../models/Attendance.js';
import Homework from '../models/Homework.js';
import Test from '../models/Test.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { notifyLinkedParents, notifyUsers } from '../utils/userNotifications.js';

const teacherCanAccessClass = (user, className) =>
  user.role === 'admin' || Boolean(className && user.assignedClasses?.includes(className));
const teacherCanAccessStudent = (user, studentId) =>
  user.role === 'admin' || Boolean(user.linkedStudents?.some(id => id.toString() === studentId.toString()));

// @desc    Mark attendance for a batch/class
// @route   POST /api/teacher/attendance/mark
export const markAttendance = async (req, res, next) => {
  try {
    const { class: className, date, records, subject } = req.body;
    if (!teacherCanAccessClass(req.user, className)) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this class' });
    }
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'Attendance records are required' });
    }
    const validStatuses = ['present', 'absent', 'leave', 'holiday'];
    if (records.some(record => !validStatuses.includes(record.status || 'present'))) {
      return res.status(400).json({ success: false, message: 'Attendance status is invalid' });
    }
    const studentIds = [...new Set(records.map(record => record.studentId?.toString()).filter(Boolean))];
    if (req.user.role === 'teacher' && studentIds.some(studentId => !teacherCanAccessStudent(req.user, studentId))) {
      return res.status(403).json({ success: false, message: 'You are not linked to every student in this attendance request' });
    }
    const students = await User.find({ _id: { $in: studentIds }, role: 'student', class: className }).select('name');
    if (students.length !== studentIds.length || studentIds.length !== records.length) {
      return res.status(400).json({ success: false, message: 'Every attendance record must refer to a unique student in the assigned class' });
    }
    const studentsById = new Map(students.map(student => [student._id.toString(), student]));

    const formattedDate = date ? new Date(date) : new Date();
    if (Number.isNaN(formattedDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Attendance date is invalid' });
    }
    const startOfDay = new Date(formattedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(formattedDate.setHours(23, 59, 59, 999));

    const operations = records.map((rec) => {
      const student = studentsById.get(rec.studentId.toString());
      return {
        updateOne: {
          filter: {
            studentId: rec.studentId,
            date: { $gte: startOfDay, $lte: endOfDay }
          },
          update: {
            $set: {
              studentName: student.name,
              class: className,
              date: startOfDay,
              status: rec.status || 'present',
              markedBy: req.user._id,
              subject: subject || 'General',
              remark: rec.remark || ''
            }
          },
          upsert: true
        }
      };
    });

    await Attendance.bulkWrite(operations);
    const absentRecords = records.filter(record => ['absent', 'leave'].includes(record.status || 'present'));
    await Promise.all(absentRecords.map(record => {
      const student = studentsById.get(record.studentId.toString());
      return notifyLinkedParents(student._id, {
        type: 'attendance',
        title: `Attendance recorded: ${record.status || 'present'}`,
        message: `${student.name} was marked ${record.status || 'present'} on ${startOfDay.toISOString().slice(0, 10)}.`,
        dedupeKey: `attendance:${student._id}:${startOfDay.toISOString().slice(0, 10)}`
      });
    }));

    res.status(200).json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    next(error);
  }
};
// @desc    Get attendance records
// @route   GET /api/teacher/attendance
export const getAttendance = async (req, res, next) => {
  try {
    const { class: className, date } = req.query;
    let query = {};
    if (req.user.role === 'teacher') {
      if (className && !teacherCanAccessClass(req.user, className)) {
        return res.status(403).json({ success: false, message: 'You are not assigned to this class' });
      }
      query.class = className || { $in: req.user.assignedClasses || [] };
      query.studentId = { $in: req.user.linkedStudents || [] };
    } else if (className) query.class = className;
    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      query.date = { $gte: start, $lte: end };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, count: attendance.length, attendance });
  } catch (error) {
    next(error);
  }
};

// @desc    Get students assigned to this teacher
// @route   GET /api/teacher/my-students
export const getMyStudents = async (req, res, next) => {
  try {
    let query = { role: 'student' };
    if (req.user.role === 'teacher') {
      query._id = { $in: req.user.linkedStudents || [] };
    }

    const students = await User.find(query).select('-password').sort({ class: 1, rollNumber: 1 });
    res.status(200).json({ success: true, count: students.length, students });
  } catch (error) {
    next(error);
  }
};

// Homework operations
export const createHomework = async (req, res, next) => {
  try {
    const { title, class: className, subject, dueDate } = req.body;
    if (!teacherCanAccessClass(req.user, className)) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this class' });
    }

    // Check for duplicate active homework
    const duplicate = await Homework.findOne({
      title: title?.trim(),
      class: className,
      subject: subject
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `An assignment with the title "${title}" already exists for class ${className}`
      });
    }

    const homework = await Homework.create({
      description: req.body.description,
      subject,
      class: className,
      dueDate,
      attachments: req.body.attachments || [],
      title: title?.trim(),
      teacherId: req.user._id,
      teacherName: req.user.name
    });
    const students = await User.find({ role: 'student', class: className }).select('_id');
    await Promise.all(students.map(async student => {
      const notification = {
        type: 'homework',
        title: 'New homework assigned',
        message: `${title.trim()} for ${subject} is due ${new Date(dueDate).toLocaleDateString()}.`,
        relatedStudentId: student._id,
        dedupeKey: `homework:${homework._id}`
      };
      await notifyUsers([student._id], notification);
      await notifyLinkedParents(student._id, notification);
    }));
    res.status(201).json({ success: true, message: 'Homework created successfully', homework });
  } catch (error) {
    next(error);
  }
};

export const getHomeworkList = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'teacher') {
      if (req.query.class && !teacherCanAccessClass(req.user, req.query.class)) {
        return res.status(403).json({ success: false, message: 'You are not assigned to this class' });
      }
      query = req.query.class
        ? { class: req.query.class, teacherId: req.user._id }
        : { class: { $in: req.user.assignedClasses || [] }, teacherId: req.user._id };
    } else if (req.query.class) {
      query.class = req.query.class;
    }

    const homework = await Homework.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: homework.length, homework });
  } catch (error) {
    next(error);
  }
};

export const updateHomework = async (req, res, next) => {
  try {
    const homework = await Homework.findById(req.params.id);
    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework task not found' });
    }
    if (req.user.role !== 'admin' && (
      homework.teacherId?.toString() !== req.user._id.toString() ||
      !teacherCanAccessClass(req.user, homework.class)
    )) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this homework' });
    }
    const { title, description, subject, class: className, dueDate, attachments, status } = req.body;
    if (className && !teacherCanAccessClass(req.user, className)) {
      return res.status(403).json({ success: false, message: 'You are not assigned to the target class' });
    }
    if (title !== undefined) homework.title = title;
    if (description !== undefined) homework.description = description;
    if (subject !== undefined) homework.subject = subject;
    if (className !== undefined) homework.class = className;
    if (dueDate !== undefined) homework.dueDate = dueDate;
    if (attachments !== undefined) homework.attachments = attachments;
    if (status !== undefined) homework.status = status;
    await homework.save();
    res.status(200).json({ success: true, homework });
  } catch (error) {
    next(error);
  }
};

export const deleteHomework = async (req, res, next) => {
  try {
    const homework = await Homework.findById(req.params.id);
    if (!homework) return res.status(404).json({ success: false, message: 'Homework task not found' });
    if (req.user.role !== 'admin' && (
      homework.teacherId?.toString() !== req.user._id.toString() ||
      !teacherCanAccessClass(req.user, homework.class)
    )) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this homework' });
    }
    await homework.deleteOne();
    res.status(200).json({ success: true, message: 'Homework deleted' });
  } catch (error) {
    next(error);
  }
};

// Tests operations
export const createTest = async (req, res, next) => {
  try {
    if (!teacherCanAccessClass(req.user, req.body.class)) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this class' });
    }
    const { title, subject, class: className, duration, totalMarks, passingMarks, questions, status, testCode, mode = 'online', testDate } = req.body;
    const test = await Test.create({
      title,
      testCode,
      mode,
      subject,
      class: className,
      duration,
      totalMarks,
      passingMarks,
      questions: questions || [],
      status: status || 'published',
      testDate: testDate || new Date(),
      teacherId: req.user._id
    });
    res.status(201).json({ success: true, test });
  } catch (error) {
    next(error);
  }
};

export const getTests = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin'
      ? {}
      : { teacherId: req.user._id, class: { $in: req.user.assignedClasses || [] } };
    const tests = await Test.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, tests });
  } catch (error) {
    next(error);
  }
};

export const updateTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    if (req.user.role !== 'admin' && (
      test.teacherId?.toString() !== req.user._id.toString() ||
      !teacherCanAccessClass(req.user, test.class)
    )) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this test' });
    }
    const { title, subject, class: className, duration, totalMarks, passingMarks, questions, status } = req.body;
    if (className && !teacherCanAccessClass(req.user, className)) {
      return res.status(403).json({ success: false, message: 'You are not assigned to the target class' });
    }
    if (title !== undefined) test.title = title;
    if (subject !== undefined) test.subject = subject;
    if (className !== undefined) test.class = className;
    if (duration !== undefined) test.duration = duration;
    if (totalMarks !== undefined) test.totalMarks = totalMarks;
    if (passingMarks !== undefined) test.passingMarks = passingMarks;
    if (questions !== undefined) test.questions = questions;
    if (status !== undefined) test.status = status;
    await test.save();
    res.status(200).json({ success: true, test });
  } catch (error) {
    next(error);
  }
};

// @desc    Record offline or manual online student test marks (Teacher)
// @route   POST /api/teacher/tests/:id/marks
export const recordStudentTestMarks = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    if (req.user.role !== 'admin' && (
      test.teacherId?.toString() !== req.user._id.toString() ||
      !teacherCanAccessClass(req.user, test.class)
    )) {
      return res.status(403).json({ success: false, message: 'You are not authorized to grade this test' });
    }

    const { studentId, score, mode = test.mode || 'offline', remarks = '' } = req.body;
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0 || numScore > test.totalMarks) {
      return res.status(400).json({ success: false, message: `Score must be between 0 and ${test.totalMarks}` });
    }

    const percentage = Math.round((numScore / test.totalMarks) * 100);

    // Update existing attempt or push new one
    const existingIndex = test.attempts.findIndex(a => a.studentId?.toString() === studentId.toString());
    const attemptRecord = {
      studentId: student._id,
      studentName: student.name,
      score: numScore,
      percentage,
      mode,
      remarks,
      submittedAt: new Date()
    };

    if (existingIndex >= 0) {
      test.attempts[existingIndex] = attemptRecord;
    } else {
      test.attempts.push(attemptRecord);
    }

    await test.save();
    res.status(200).json({ success: true, message: `Marks recorded for ${student.name}`, test });
  } catch (error) {
    next(error);
  }
};
