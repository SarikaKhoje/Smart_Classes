import mongoose from 'mongoose';
import ParentTeacherConversation from '../models/ParentTeacherConversation.js';
import User from '../models/User.js';
import { notifyUsers } from '../utils/userNotifications.js';

const resolveParticipants = async (req) => {
  if (!mongoose.isValidObjectId(req.params.studentId)) return null;
  const student = await User.findOne({ _id: req.params.studentId, role: 'student' }).select('name class');
  if (!student) return null;

  let parent;
  let teacher;
  if (req.user.role === 'parent') {
    if (!req.user.children?.some(child => child.studentId?.toString() === student._id.toString())) return null;
    if (!mongoose.isValidObjectId(req.query.teacherId)) {
      const teachers = await User.find({
        role: 'teacher',
        linkedStudents: student._id,
        isActive: true
      }).select('name subject');
      return { student, teachers, parents: [] };
    }
    teacher = await User.findOne({
      _id: req.query.teacherId,
      role: 'teacher',
      linkedStudents: student._id,
      isActive: true
    }).select('name subject');
    parent = req.user;
  } else if (req.user.role === 'teacher') {
    if (!req.user.assignedClasses?.includes(student.class) ||
        !req.user.linkedStudents?.some(id => id.toString() === student._id.toString())) return null;
    if (!mongoose.isValidObjectId(req.query.parentId)) {
      const parents = await User.find({
        role: 'parent',
        'children.studentId': student._id,
        isActive: true
      }).select('name');
      return { student, teachers: [], parents };
    }
    parent = await User.findOne({
      _id: req.query.parentId,
      role: 'parent',
      'children.studentId': student._id,
      isActive: true
    }).select('name');
    teacher = req.user;
  } else {
    return null;
  }

  if (!parent || !teacher) return null;
  return { student, parent, teacher, teachers: [], parents: [] };
};

export const getParentTeacherConversation = async (req, res, next) => {
  try {
    const participants = await resolveParticipants(req);
    if (!participants) return res.status(404).json({ success: false, message: 'Conversation not found' });
    if (!participants.parent || !participants.teacher) {
      return res.status(200).json({
        success: true,
        conversation: null,
        student: { _id: participants.student._id, name: participants.student.name },
        teachers: participants.teachers,
        parents: participants.parents
      });
    }
    const conversation = await ParentTeacherConversation.findOne({
      studentId: participants.student._id,
      parentId: participants.parent._id,
      teacherId: participants.teacher._id
    });
    res.status(200).json({
      success: true,
      conversation,
      student: { _id: participants.student._id, name: participants.student.name },
      counterpart: req.user.role === 'parent' ? participants.teacher : participants.parent,
      teachers: [],
      parents: []
    });
  } catch (error) {
    next(error);
  }
};

export const sendParentTeacherMessage = async (req, res, next) => {
  try {
    const body = typeof req.body.body === 'string' ? req.body.body.trim() : '';
    if (!body || body.length > 2000) {
      return res.status(400).json({ success: false, message: 'Message must contain 1 to 2,000 characters' });
    }
    const participants = await resolveParticipants(req);
    if (!participants?.parent || !participants?.teacher) {
      return res.status(404).json({ success: false, message: 'Conversation participants were not found' });
    }
    const filter = {
      studentId: participants.student._id,
      parentId: participants.parent._id,
      teacherId: participants.teacher._id
    };
    const conversation = await ParentTeacherConversation.findOneAndUpdate(
      filter,
      {
        $setOnInsert: filter,
        $push: { messages: { senderId: req.user._id, senderRole: req.user.role, body } }
      },
      { upsert: true, new: true, runValidators: true }
    );
    const recipientId = req.user.role === 'parent' ? participants.teacher._id : participants.parent._id;
    await notifyUsers([recipientId], {
      type: 'message',
      title: `New message about ${participants.student.name}`,
      message: body.slice(0, 300),
      relatedStudentId: participants.student._id
    });
    res.status(201).json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
};
