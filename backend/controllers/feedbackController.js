import mongoose from 'mongoose';
import FeedbackForm from '../models/FeedbackForm.js';

export const createFeedbackForm = async (req, res, next) => {
  try {
    const { title, subject, class: className, lectureDate, question } = req.body;

    if (!title?.trim() || !subject?.trim() || !className?.trim() || !lectureDate) {
      return res.status(400).json({
        success: false,
        message: 'Lecture title, subject, class, and lecture date are required'
      });
    }

    const parsedLectureDate = new Date(lectureDate);
    if (Number.isNaN(parsedLectureDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid lecture date' });
    }

    if (req.user.role === 'teacher' && req.user.assignedClasses?.length > 0 &&
        !req.user.assignedClasses.includes(className.trim())) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this class' });
    }

    const form = await FeedbackForm.create({
      title: title.trim(),
      subject: subject.trim(),
      class: className.trim(),
      lectureDate: parsedLectureDate,
      question: question?.trim() || 'How helpful was this lesson?',
      teacherId: req.user._id,
      teacherName: req.user.name
    });

    res.status(201).json({ success: true, message: 'Feedback form created', form });
  } catch (error) {
    next(error);
  }
};

export const getTeacherFeedbackForms = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { teacherId: req.user._id };
    const forms = await FeedbackForm.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, forms });
  } catch (error) {
    next(error);
  }
};

export const getStudentFeedbackForms = async (req, res, next) => {
  try {
    const forms = await FeedbackForm.find({ class: req.user.class })
      .select('title subject class lectureDate question teacherName responses.studentId')
      .sort({ lectureDate: -1 });
    const studentId = req.user._id.toString();
    const studentForms = forms.map((form) => {
      const data = form.toObject();
      data.hasSubmitted = data.responses.some((response) => response.studentId.toString() === studentId);
      delete data.responses;
      return data;
    });

    res.status(200).json({ success: true, forms: studentForms });
  } catch (error) {
    next(error);
  }
};

export const submitFeedback = async (req, res, next) => {
  try {
    const { rating, comment = '' } = req.body;
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be a whole number from 1 to 5' });
    }
    if (typeof comment !== 'string' || comment.length > 1000) {
      return res.status(400).json({ success: false, message: 'Comment must be 1000 characters or fewer' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Feedback form not found' });
    }

    const formFilter = { _id: req.params.id, class: req.user.class };
    const updatedForm = await FeedbackForm.findOneAndUpdate(
      { ...formFilter, 'responses.studentId': { $ne: req.user._id } },
      {
        $push: {
          responses: {
            studentId: req.user._id,
            studentName: req.user.name,
            rating: numericRating,
            comment: comment.trim()
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedForm) {
      const form = await FeedbackForm.findOne(formFilter).select('_id responses.studentId');
      if (!form) {
        return res.status(404).json({ success: false, message: 'Feedback form not found for your class' });
      }
      return res.status(409).json({ success: false, message: 'You have already submitted feedback for this lecture' });
    }

    res.status(201).json({ success: true, message: 'Feedback submitted successfully' });
  } catch (error) {
    next(error);
  }
};
