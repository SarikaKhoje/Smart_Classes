import Course from '../models/Course.js';
import User from '../models/User.js';
import AdmissionEnquiry from '../models/AdmissionEnquiry.js';

export const getPublicCourses = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .select('name code class teacherName description schedule')
      .sort({ class: 1, name: 1 })
      .limit(100);
    res.status(200).json({ success: true, courses });
  } catch (error) {
    next(error);
  }
};

export const getPublicTeachers = async (req, res, next) => {
  try {
    const teachers = await User.find({ role: 'teacher', isActive: true })
      .select('name subject')
      .sort({ name: 1 })
      .limit(100);
    res.status(200).json({ success: true, teachers });
  } catch (error) {
    next(error);
  }
};

export const createAdmissionEnquiry = async (req, res, next) => {
  try {
    const { name, email, phone, desiredClass, message = '' } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
        typeof phone !== 'string' || !/^[+()\d\s.-]{7,30}$/.test(phone.trim()) ||
        typeof desiredClass !== 'string' || !desiredClass.trim() || desiredClass.trim().length > 60 ||
        typeof message !== 'string' || message.length > 2000) {
      return res.status(400).json({ success: false, message: 'Please provide a valid name, email, phone, class, and message' });
    }
    const enquiry = await AdmissionEnquiry.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      desiredClass: desiredClass.trim(),
      message: message.trim()
    });
    res.status(201).json({ success: true, message: 'Your admission enquiry has been received', enquiryId: enquiry._id });
  } catch (error) {
    next(error);
  }
};

export const getAdmissionEnquiries = async (req, res, next) => {
  try {
    const enquiries = await AdmissionEnquiry.find()
      .sort({ createdAt: -1 })
      .limit(300);
    res.status(200).json({ success: true, enquiries });
  } catch (error) {
    next(error);
  }
};

export const updateAdmissionEnquiry = async (req, res, next) => {
  try {
    if (!['new', 'contacted', 'enrolled', 'closed'].includes(req.body.status)) {
      return res.status(400).json({ success: false, message: 'Invalid enquiry status' });
    }
    const enquiry = await AdmissionEnquiry.findByIdAndUpdate(
      req.params.id,
      { $set: { status: req.body.status } },
      { new: true, runValidators: true }
    );
    if (!enquiry) return res.status(404).json({ success: false, message: 'Admission enquiry not found' });
    res.status(200).json({ success: true, enquiry });
  } catch (error) {
    next(error);
  }
};
