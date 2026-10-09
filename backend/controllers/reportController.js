import Report from '../models/Report.js';
import { notifyLinkedParents } from '../utils/userNotifications.js';
import User from '../models/User.js';
import { verifyParentChildAccess } from '../utils/parentAuth.js';

// @desc    Get reports based on role
// @route   GET /api/reports
export const getReports = async (req, res, next) => {
  try {
    const { studentId, class: className } = req.query;
    let query = {};

    if (req.user.role === 'admin') {
      if (studentId) query.studentId = studentId;
      if (className) query.class = className;
    } else if (req.user.role === 'teacher') {
      const assignedClasses = req.user.assignedClasses || [];
      if (className && !assignedClasses.includes(className)) {
        return res.status(403).json({ success: false, message: 'You are not authorized to view reports for this class' });
      }
      if (studentId) {
        const isLinkedStudent = req.user.linkedStudents?.some(id => id.toString() === studentId.toString());
        if (!isLinkedStudent) {
          return res.status(403).json({ success: false, message: 'You are not authorized to view this student report' });
        }
        const student = await User.findOne({
          _id: studentId,
          role: 'student',
          class: className ? className : { $in: assignedClasses }
        }).select('_id');
        if (!student) {
          return res.status(403).json({ success: false, message: 'You are not authorized to view this student report' });
        }
        query.studentId = student._id;
      } else if (className) {
        query.class = className;
        query.studentId = { $in: req.user.linkedStudents || [] };
      } else {
        query.class = { $in: assignedClasses };
        query.studentId = { $in: req.user.linkedStudents || [] };
      }
    } else if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'parent') {
      const allChildIds = (req.user.children || []).map(child => child.studentId).filter(Boolean);

      if (studentId) {
        const isChild = allChildIds.some(id => id.toString() === studentId.toString());
        if (!isChild) {
          return res.status(403).json({ success: false, message: 'Access denied to reports for this student' });
        }
        query.studentId = studentId;
      } else {
        query.studentId = { $in: allChildIds };
      }
    }

    const reports = await Report.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (error) {
    next(error);
  }
};

// @desc    Create/generate report card (Admin & Teachers only)
// @route   POST /api/reports
export const createReport = async (req, res, next) => {
  try {
    const { studentId, subjects, term, academicYear, teacherRemarks, attendancePercentage } = req.body;
    const student = await User.findOne({ _id: studentId, role: 'student' }).select('name class rollNumber');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student account not found' });
    }
    if (req.user.role === 'teacher' && (
      !req.user.assignedClasses?.includes(student.class) ||
      !req.user.linkedStudents?.some(id => id.toString() === student._id.toString())
    )) {
      return res.status(403).json({ success: false, message: 'You are not linked to this student' });
    }

    let totalMarks = 0;
    let maxTotal = 0;

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one subject score is required' });
    }
    if (subjects && subjects.length > 0) {
      subjects.forEach(s => {
        totalMarks += Number(s.marks || 0);
        maxTotal += Number(s.maxMarks || 100);
      });
    }

    const percentage = maxTotal > 0 ? Number(((totalMarks / maxTotal) * 100).toFixed(1)) : 0;
    let overallGrade = 'F';
    if (percentage >= 90) overallGrade = 'A+';
    else if (percentage >= 80) overallGrade = 'A';
    else if (percentage >= 70) overallGrade = 'B';
    else if (percentage >= 60) overallGrade = 'C';
    else if (percentage >= 50) overallGrade = 'D';

    const report = await Report.create({
      studentId: student._id,
      studentName: student.name,
      class: student.class,
      rollNumber: student.rollNumber,
      academicYear: academicYear || '2024-2025',
      term: term || 'Term 1',
      subjects,
      totalMarks,
      percentage,
      overallGrade,
      teacherRemarks,
      attendancePercentage: attendancePercentage ?? 0
    });

    await notifyLinkedParents(student._id, {
      type: 'report',
      title: 'New report card available',
      message: `${term || 'Term 1'} report card for ${student.name} is available in the parent portal.`,
      dedupeKey: `report:${report._id}`
    });
    res.status(201).json({ success: true, message: 'Report card generated successfully', report });
  } catch (error) {
    next(error);
  }
};
