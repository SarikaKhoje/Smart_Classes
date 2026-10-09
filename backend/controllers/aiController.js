import axios from 'axios';
import Attendance from '../models/Attendance.js';
import Test from '../models/Test.js';
import Report from '../models/Report.js';
import User from '../models/User.js';
import StudyPlan from '../models/StudyPlan.js';

// @desc    Get latest active AI study plan for student
// @route   GET /api/student/study-plan or GET /api/ai/study-plan/latest
export const getLatestStudyPlan = async (req, res, next) => {
  try {
    const studentId = req.query.studentId || req.user._id;

    if (req.user.role === 'student' && studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const plan = await StudyPlan.findOne({ studentId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, plan });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate personalized AI study plan
// @route   POST /api/student/study-plan or POST /api/ai/study-plan
export const generateAIStudyPlan = async (req, res, next) => {
  try {
    const { targetExam, studyHoursDaily, weakSubjects, targetStudentId } = req.body;

    // Input Validation
    if (studyHoursDaily !== undefined && (typeof studyHoursDaily !== 'number' || studyHoursDaily <= 0 || studyHoursDaily > 24)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid studyHoursDaily: must be a positive number between 0.5 and 24 hours'
      });
    }

    let student = req.user;

    // If Admin is requesting on behalf of a specific student
    if (targetStudentId && targetStudentId.toString() !== req.user._id.toString()) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You cannot generate study plans for another student'
        });
      }
      student = await User.findById(targetStudentId);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Target student not found' });
      }
    }

    // Role verification
    if (student.role !== 'student' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Study plans are only available for enrolled students' });
    }

    // Gather academic background to contextualize the prompt
    const [recentTests, attendanceRecords] = await Promise.all([
      Test.find({ class: student.class, 'attempts.studentId': student._id }),
      Attendance.find({ studentId: student._id })
    ]);

    const testSummaries = recentTests.map(t => {
      const att = t.attempts.find(a => a.studentId.toString() === student._id.toString());
      return `${t.subject} (${t.title}): ${att ? att.percentage + '%' : 'Not Attempted'}`;
    });

    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    let finalPlan = null;
    let provider = 'Kashvi SmartAI Academic Engine';

    if (apiKey) {
      try {
        const prompt = `You are an expert academic tutor for student ${student.name} in grade ${student.class}.
Target Exam: ${targetExam || 'Mid-Term Board Examination'}
Daily Study Availability: ${studyHoursDaily || 2.5} hours
Focus / Weak Subjects: ${weakSubjects ? weakSubjects.join(', ') : 'Mathematics and Science'}
Recent Performance: ${testSummaries.join(', ') || 'Average score 82%'}

Generate a structured 7-day academic study plan in strict JSON format with this exact JSON structure:
{
  "studentName": "${student.name}",
  "class": "${student.class}",
  "targetGoal": "${targetExam || 'Comprehensive Exam Mastery'}",
  "weeklySchedule": [
    { "day": "Monday", "subject": "Mathematics", "topic": "Core Problem Solving & Formulas", "duration": "${studyHoursDaily || 2.5} hours", "priority": "High" },
    { "day": "Tuesday", "subject": "Science / Physics", "topic": "Concepts & Numerical Analysis", "duration": "${studyHoursDaily || 2.5} hours", "priority": "Medium" },
    { "day": "Wednesday", "subject": "Chemistry", "topic": "Reactions, Equations & Lab Notes", "duration": "${studyHoursDaily || 2.5} hours", "priority": "High" },
    { "day": "Thursday", "subject": "English / Social Studies", "topic": "Case Studies & Creative Revision", "duration": "${studyHoursDaily || 2.5} hours", "priority": "Medium" },
    { "day": "Friday", "subject": "${weakSubjects?.[0] || 'Mathematics'}", "topic": "Past Year Questions Deep Dive", "duration": "${studyHoursDaily || 2.5} hours", "priority": "High" },
    { "day": "Saturday", "subject": "Full-Length Mock Test", "topic": "Timed Assessment & Gap Analysis", "duration": "3 hours", "priority": "Urgent" },
    { "day": "Sunday", "subject": "Strategic Recovery", "topic": "Error Log Review & Weekly Reset", "duration": "1.5 hours", "priority": "Low" }
  ],
  "recommendations": [
    "Prioritize tough analytical concepts during the first 45 minutes of maximum cognitive alertness.",
    "Use active recall flashcards rather than passive re-reading.",
    "Review mistake logs every 48 hours to prevent repeat calculation errors."
  ]
}`;

        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          },
          { timeout: 12000 }
        );

        const rawText = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text;
        finalPlan = JSON.parse(rawText);
        provider = 'Gemini 1.5 Flash';
      } catch (err) {
        console.warn('Gemini API call failed, falling back to built-in academic intelligence engine:', err.message);
      }
    }

    // High quality dynamic fallback plan if AI key not configured or API call timed out
    if (!finalPlan) {
      finalPlan = {
        studentName: student.name,
        class: student.class || '10',
        targetGoal: targetExam || 'Term Final Examination Preparation',
        weeklySchedule: [
          { day: 'Monday', subject: weakSubjects?.[0] || 'Mathematics', topic: 'Core Problem Solving & Formula Revision', duration: `${studyHoursDaily || 2.5} hours`, priority: 'High' },
          { day: 'Tuesday', subject: 'Science / Physics', topic: 'Conceptual Review & Practice Diagrams', duration: `${studyHoursDaily || 2.5} hours`, priority: 'Medium' },
          { day: 'Wednesday', subject: 'Chemistry', topic: 'Equations, Reactions & Problem Sets', duration: `${studyHoursDaily || 2.5} hours`, priority: 'High' },
          { day: 'Thursday', subject: 'Social Science / English', topic: 'Case Studies, Comprehension & Terminology', duration: `${studyHoursDaily || 2.5} hours`, priority: 'Medium' },
          { day: 'Friday', subject: weakSubjects?.[0] || 'Mathematics', topic: 'Previous Year Question Analysis', duration: `${studyHoursDaily || 2.5} hours`, priority: 'High' },
          { day: 'Saturday', subject: 'Comprehensive Revision', topic: 'Mock Test Preparation & Self Assessment', duration: '3 hours', priority: 'Urgent' },
          { day: 'Sunday', subject: 'Rest & Strategic Review', topic: 'Review Weak Test Areas and Plan Ahead', duration: '1.5 hours', priority: 'Low' }
        ],
        recommendations: [
          'Dedicate the first 45 minutes to high-difficulty topics when mental focus is highest.',
          'Practice active recall and formula revision rather than passive reading.',
          'Take a 5-minute breather every 25 minutes of continuous study.'
        ]
      };
    }

    // Persist into MongoDB StudyPlan collection
    const savedPlan = await StudyPlan.create({
      studentId: student._id,
      studentName: student.name,
      class: student.class || '10',
      targetGoal: finalPlan.targetGoal || targetExam || 'Board Exam Mastery',
      targetExam: targetExam || 'Term Exams',
      studyHoursDaily: studyHoursDaily || 2.5,
      weakSubjects: weakSubjects || ['Mathematics', 'Science'],
      weeklySchedule: finalPlan.weeklySchedule,
      recommendations: finalPlan.recommendations,
      provider
    });

    return res.status(200).json({
      success: true,
      message: 'AI Study Plan generated and saved successfully!',
      aiConfigured: Boolean(apiKey),
      plan: savedPlan
    });

  } catch (error) {
    next(error);
  }
};
