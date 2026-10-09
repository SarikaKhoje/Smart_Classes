import Timetable from '../models/Timetable.js';
import User from '../models/User.js';

// Helper to check if two time ranges overlap (format 'HH:MM')
const isTimeOverlapping = (startA, endA, startB, endB) => {
  return (startA < endB) && (endA > startB);
};

// @desc    Get timetable entries with filters
// @route   GET /api/timetable
export const getTimetable = async (req, res, next) => {
  try {
    const { class: className, teacherId, day } = req.query;
    let query = {};

    if (req.user.role === 'student') {
      query.class = req.user.class;
    } else if (req.user.role === 'parent') {
      const childIds = (req.user.children || []).map(child => child.studentId).filter(Boolean);
      const children = await User.find({ _id: { $in: childIds }, role: 'student' }).select('class');
      const linkedClasses = [...new Set(children.map(child => child.class).filter(Boolean))];
      if (className && !linkedClasses.includes(className)) {
        return res.status(403).json({ success: false, message: 'You are not authorized to view this class timetable' });
      }
      query.class = className || { $in: linkedClasses };
    } else if (req.user.role === 'teacher') {
      const assignedClasses = req.user.assignedClasses || [];
      if (className && !assignedClasses.includes(className)) {
        return res.status(403).json({ success: false, message: 'You are not authorized to view this class timetable' });
      }
      query.teacher = req.user._id;
      if (className) query.class = className;
      else if (assignedClasses.length > 0) query.class = { $in: assignedClasses };
    } else if (className) {
      query.class = className;
    }

    if (teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only administrators can filter timetable by teacher ID' });
    }
    if (teacherId) query.teacher = teacherId;
    if (day) query.day = day;

    const entries = await Timetable.find(query).sort({ day: 1, startTime: 1 });
    res.status(200).json({ success: true, count: entries.length, timetable: entries });
  } catch (error) {
    next(error);
  }
};

// @desc    Create timetable entry with full conflict detection (Admin only)
// @route   POST /api/timetable
export const createTimetableEntry = async (req, res, next) => {
  try {
    const { class: className, subject, teacher: teacherId, day, startTime, endTime, room } = req.body;

    const teacherObj = await User.findById(teacherId);
    if (!teacherObj) {
      return res.status(404).json({ success: false, message: 'Assigned teacher not found' });
    }

    // 1. Conflict Check: Same Teacher at same day/time in another class
    const existingTeacherSlots = await Timetable.find({ teacher: teacherId, day });
    for (const slot of existingTeacherSlots) {
      if (isTimeOverlapping(startTime, endTime, slot.startTime, slot.endTime)) {
        return res.status(400).json({
          success: false,
          conflictType: 'TEACHER_COLLISION',
          message: `Schedule Conflict: Teacher ${teacherObj.name} is already assigned to Class ${slot.class} (${slot.subject}) from ${slot.startTime} to ${slot.endTime} on ${day}.`
        });
      }
    }

    // 2. Conflict Check: Same Class assigned to two subjects at same day/time
    const existingClassSlots = await Timetable.find({ class: className, day });
    for (const slot of existingClassSlots) {
      if (isTimeOverlapping(startTime, endTime, slot.startTime, slot.endTime)) {
        return res.status(400).json({
          success: false,
          conflictType: 'CLASS_COLLISION',
          message: `Schedule Conflict: Class ${className} already has subject '${slot.subject}' scheduled from ${slot.startTime} to ${slot.endTime} on ${day}.`
        });
      }
    }

    // 3. Conflict Check: Same Room assigned to two different classes
    if (room) {
      const existingRoomSlots = await Timetable.find({ room, day });
      for (const slot of existingRoomSlots) {
        if (slot.class !== className && isTimeOverlapping(startTime, endTime, slot.startTime, slot.endTime)) {
          return res.status(400).json({
            success: false,
            conflictType: 'ROOM_COLLISION',
            message: `Schedule Conflict: Room '${room}' is already occupied by Class ${slot.class} from ${slot.startTime} to ${slot.endTime} on ${day}.`
          });
        }
      }
    }

    const entry = await Timetable.create({
      class: className,
      subject,
      teacher: teacherId,
      teacherName: teacherObj.name,
      day,
      startTime,
      endTime,
      room: room || 'Room 101'
    });

    res.status(201).json({ success: true, message: 'Timetable entry created without conflicts', entry });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete timetable entry
// @route   DELETE /api/timetable/:id
export const deleteTimetableEntry = async (req, res, next) => {
  try {
    const entry = await Timetable.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    }
    res.status(200).json({ success: true, message: 'Timetable entry deleted successfully' });
  } catch (error) {
    next(error);
  }
};
