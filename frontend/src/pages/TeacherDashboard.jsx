import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  CalendarCheck,
  FileText,
  Video,
  Plus,
  CheckCircle,
  Clock,
  BookOpen,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquareText,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ACADEMIC_CLASSES } from '../constants/academicClasses';
import { useLanguage } from '../context/LanguageContext';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const location = useLocation();
  const path = location.pathname;
  const availableClasses = user?.role === 'teacher'
    ? (user.assignedClasses || []).filter(grade => ACADEMIC_CLASSES.includes(grade))
    : ACADEMIC_CLASSES;
  const initialClass = availableClasses[0] || '';

  const [students, setStudents] = useState([]);
  const [homeworkList, setHomeworkList] = useState([]);
  const [onlineClasses, setOnlineClasses] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [feedbackForms, setFeedbackForms] = useState([]);
  const [tests, setTests] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Attendance State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState(initialClass);
  const classStudents = students.filter(student => student.class === selectedClass);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [selectedCheckInStudentId, setSelectedCheckInStudentId] = useState('');
  const [checkInEventType, setCheckInEventType] = useState('arrival');

  // Homework modal
  const [showHwModal, setShowHwModal] = useState(false);
  const [newHw, setNewHw] = useState({
    title: '',
    description: '',
    subject: 'Mathematics',
    class: initialClass,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Online class modal
  const [showClassModal, setShowClassModal] = useState(false);
  const [newClass, setNewClass] = useState({
    title: 'Trigonometry Deep Dive & Numerical Problem Solving',
    subject: 'Mathematics',
    class: initialClass,
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
    duration: 45,
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    description: 'Class 10 Board exam question sets discussion'
  });

  // Study note modal
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    description: '',
    subject: 'Mathematics',
    class: initialClass
  });
  const [noteFile, setNoteFile] = useState(null);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [newTest, setNewTest] = useState({
    title: '',
    subject: 'Mathematics',
    class: initialClass,
    duration: 30,
    totalMarks: 10,
    passingMarks: 4,
    status: 'published'
  });
  const [testQuestions, setTestQuestions] = useState([]);
  const [questionDraft, setQuestionDraft] = useState({ question: '', options: '', correctAnswer: '', marks: 1 });
  const [newFeedbackForm, setNewFeedbackForm] = useState({
    title: '',
    subject: 'Mathematics',
    class: initialClass,
    lectureDate: new Date().toISOString().split('T')[0],
    question: 'How helpful was this lesson?'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stuRes, hwRes, classRes, noteRes, feedbackRes, testsRes] = await Promise.all([
        api.get('/teacher/my-students'),
        api.get('/teacher/homework'),
        api.get('/online-classes'),
        api.get('/notes'),
        api.get('/feedback/teacher'),
        api.get('/teacher/tests')
      ]);
      const stuList = stuRes.data?.students || [];
      setStudents(stuList);
      setHomeworkList(hwRes.data?.homework || []);
      setOnlineClasses(classRes.data?.onlineClasses || []);
      setStudyMaterials(noteRes.data?.materials || []);
      setFeedbackForms(feedbackRes.data?.forms || []);
      setTests(testsRes.data?.tests || []);

    } catch (err) {
      toast.error(t('Failed to load teacher workspace'));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [t]);

  useEffect(() => {
    if (!selectedClass || !path.includes('/attendance')) return undefined;
    let active = true;
    const loadAttendanceForSelection = async () => {
      const initialAttendance = {};
      classStudents.forEach(student => {
        initialAttendance[student._id] = 'present';
      });
      setAttendanceRecords(initialAttendance);
      try {
        const response = await api.get('/teacher/attendance', {
          params: { class: selectedClass, date: attendanceDate }
        });
        if (!active) return;
        const currentRecords = { ...initialAttendance };
        (response.data?.attendance || []).forEach(record => {
          if (Object.prototype.hasOwnProperty.call(currentRecords, record.studentId)) {
            currentRecords[record.studentId] = record.status;
          }
        });
        setAttendanceRecords(currentRecords);
      } catch (err) {
        if (active) toast.error(err.response?.data?.message || t('Could not load attendance for this class and date'));
      }
    };
    loadAttendanceForSelection();
    return () => { active = false; };
  }, [selectedClass, attendanceDate, students, path, t]);

  const fetchCheckIns = async () => {
    try {
      const response = await api.get('/check-ins', {
        params: { class: selectedClass, date: attendanceDate }
      });
      setCheckIns(response.data?.checkIns || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load arrival/departure records');
    }
  };

  useEffect(() => {
    if (path.includes('/check-ins')) fetchCheckIns();
  }, [path, selectedClass, attendanceDate]);

  const handleRecordCheckIn = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/check-ins', {
        studentId: selectedCheckInStudentId,
        eventType: checkInEventType,
        date: attendanceDate
      });
      toast.success(response.data?.message || 'Check-in event recorded');
      setSelectedCheckInStudentId('');
      fetchCheckIns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record student event');
    }
  };

  const handleMarkAllPresent = () => {
    const updated = {};
    classStudents.forEach((s) => {
      updated[s._id] = 'present';
    });
    setAttendanceRecords(updated);
    toast.success('Marked all students as Present');
  };

  const handleAttendanceStatusChange = (studentId, status) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmitAttendance = async () => {
    if (!selectedClass) {
      toast.error(t('Select a class before taking attendance'));
      return;
    }
    if (!classStudents.length) {
      toast.error(t('No linked students are available in this class'));
      return;
    }
    try {
      const records = classStudents.map((s) => ({
        studentId: s._id,
        studentName: s.name,
        status: attendanceRecords[s._id] || 'present'
      }));

      const res = await api.post('/teacher/attendance/mark', {
        class: selectedClass,
        date: attendanceDate,
        records,
        subject: 'Mathematics'
      });

      if (res.data?.success) {
        toast.success(t('Attendance marked successfully for {{count}} students!', { count: records.length }));
      }
    } catch (err) {
      toast.error(t(err.response?.data?.message || 'Failed to submit attendance'));
    }
  };

  const handleCreateHomework = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/teacher/homework', newHw);
      if (res.data?.success) {
        toast.success('Homework assigned successfully!');
        setShowHwModal(false);
        setNewHw({
          title: '',
          description: '',
          subject: 'Mathematics',
          class: initialClass,
          dueDate: new Date().toISOString().split('T')[0]
        });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create homework');
    }
  };

  const handleScheduleClass = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/online-classes', newClass);
      if (res.data?.success) {
        toast.success('Live class scheduled!');
        setShowClassModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule class');
    }
  };

  const handleUploadNote = async (e) => {
    e.preventDefault();
    if (!noteFile) return toast.error('Choose a PDF, PNG, JPEG, or text file to upload');
    try {
      const formData = new FormData();
      Object.entries(newNote).forEach(([key, value]) => formData.append(key, value));
      formData.append('file', noteFile);
      const res = await api.post('/notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success) {
        toast.success('Study material published successfully!');
        setShowNoteModal(false);
        setNewNote({
          title: '',
          description: '',
          subject: 'Mathematics',
          class: initialClass
        });
        setNoteFile(null);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload study note');
    }
  };

  const downloadMaterial = async (material) => {
    if (!material.fileUrl?.startsWith('/api/notes/')) {
      window.open(material.fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    try {
      const response = await api.get(material.fileUrl.slice(4), { responseType: 'blob' });
      const objectUrl = URL.createObjectURL(response.data);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = material.fileName || 'study-material';
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not download this material');
    }
  };

  const handleCreateFeedbackForm = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/feedback/teacher', newFeedbackForm);
      if (res.data?.success) {
        toast.success('Lecture feedback form created!');
        setShowFeedbackModal(false);
        setNewFeedbackForm({
          title: '',
          subject: 'Mathematics',
          class: initialClass,
          lectureDate: new Date().toISOString().split('T')[0],
          question: 'How helpful was this lesson?'
        });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create feedback form');
    }
  };

  const handleAddTestQuestion = () => {
    const options = questionDraft.options.split(/\r?\n/).map(option => option.trim()).filter(Boolean);
    if (!questionDraft.question.trim() || options.length < 2 || !options.includes(questionDraft.correctAnswer.trim())) {
      return toast.error('Add a question, at least two options (one per line), and choose a correct option exactly');
    }
    setTestQuestions(current => [...current, {
      question: questionDraft.question.trim(),
      type: 'mcq',
      options,
      correctAnswer: questionDraft.correctAnswer.trim(),
      marks: Number(questionDraft.marks)
    }]);
    setQuestionDraft({ question: '', options: '', correctAnswer: '', marks: 1 });
  };

  const handleCreateTest = async (event) => {
    event.preventDefault();
    if (!testQuestions.length) return toast.error('Add at least one question before publishing');
    const maxMarks = testQuestions.reduce((total, question) => total + question.marks, 0);
    try {
      const response = await api.post('/teacher/tests', {
        ...newTest,
        totalMarks: maxMarks,
        questions: testQuestions
      });
      if (response.data?.success) {
        toast.success('Assessment published');
        setShowTestModal(false);
        setTestQuestions([]);
        setNewTest({ title: '', subject: 'Mathematics', class: initialClass, duration: 30, totalMarks: 10, passingMarks: 4, status: 'published' });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not publish assessment');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-black text-white">
              {path.includes('/attendance')
                ? t('Daily Attendance Register')
                : path.includes('/homework')
                ? t('Homework Hub & Submissions')
                : path.includes('/classes')
                ? t('Live Virtual Classrooms')
                : path.includes('/notes')
                ? t('Curriculum Study Materials')
                : path.includes('/feedback')
                ? t('Lecture Feedback & Responses')
                : path.includes('/tests')
                ? t('Tests & Assessments')
                : path.includes('/check-ins')
                ? t('Student Arrival & Departure Register')
                : t('Faculty Dashboard')}
            </h2>
            <p className="text-xs text-slate-400">{t('Classroom Management & Instruction Console')}</p>
          </div>

          <div className="flex gap-2">
            {path.includes('/homework') && (
              <button
                onClick={() => setShowHwModal(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" />
                <span>{t('Assign Homework')}</span>
              </button>
            )}
            {path.includes('/classes') && (
              <button
                onClick={() => setShowClassModal(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
              >
                <Video className="h-4 w-4" />
                <span>{t('Schedule Live Class')}</span>
              </button>
            )}
            {path.includes('/notes') && (
              <button
                onClick={() => setShowNoteModal(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" />
                <span>{t('Upload Material')}</span>
              </button>
            )}
            {path.includes('/feedback') && (
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" />
                <span>{t('Create Feedback Form')}</span>
              </button>
            )}
            {path.includes('/tests') && (
              <button
                onClick={() => setShowTestModal(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" />
                <span>{t('Create Assessment')}</span>
              </button>
            )}

            {path.includes('/check-ins') && (
              <div className="space-y-5">
                <form onSubmit={handleRecordCheckIn} className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 md:grid-cols-4">
                  <label className="text-[11px] font-semibold text-slate-300">
                    {t('Class')}
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white"
                    >
                      {[...new Set(students.map((student) => student.class).filter(Boolean))].map((className) => (
                        <option key={className} value={className}>{className}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-[11px] font-semibold text-slate-300">
                    {t('Student')}
                    <select
                      required
                      value={selectedCheckInStudentId}
                      onChange={(e) => setSelectedCheckInStudentId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white"
                    >
                      <option value="">{t('Select a student')}</option>
                      {students.filter((student) => student.class === selectedClass).map((student) => (
                        <option key={student._id} value={student._id}>{student.name} · {student.rollNumber}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-[11px] font-semibold text-slate-300">
                    {t('Event')}
                    <select
                      value={checkInEventType}
                      onChange={(e) => setCheckInEventType(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white"
                    >
                      <option value="arrival">{t('Arrival')}</option>
                      <option value="departure">{t('Departure')}</option>
                    </select>
                  </label>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                    >
                      {t('Record event')}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 md:col-span-4">
                    {t('Records are created by institute staff. No GPS or continuous location tracking is used; duplicate arrival or departure events for the same date are rejected.')}
                  </p>
                </form>
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">{t('Recorded Events')} · {attendanceDate}</h3>
                  </div>
                  {checkIns.length ? (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="pb-3 font-semibold">{t('Student')}</th>
                          <th className="pb-3 font-semibold">{t('Event')}</th>
                          <th className="pb-3 font-semibold">{t('Time recorded')}</th>
                          <th className="pb-3 font-semibold">{t('Recorded by')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {checkIns.map((entry) => (
                          <tr key={entry._id}>
                            <td className="py-3 font-semibold text-white">{entry.studentName}</td>
                            <td className="py-3 capitalize text-slate-300">{entry.eventType}</td>
                            <td className="py-3 text-slate-300">{new Date(entry.recordedAt).toLocaleTimeString(language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN')}</td>
                            <td className="py-3 text-slate-400">{entry.recordingMethod.replace('-', ' ')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-xs text-slate-500">{t('No arrival or departure events recorded for this date and class.')}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 1. OVERVIEW (Default) */}
        {(path === '/dashboard/teacher' || path === '/dashboard/teacher/') && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">{t('Assigned Students')}</span>
                  <Users className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="mt-3 text-2xl font-black text-white">{students.length}</h3>
                <p className="mt-1 text-[11px] text-indigo-400">
                  {t('Grades')}: {availableClasses.length ? availableClasses.join(', ') : t('None assigned')}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">{t('Active Homework')}</span>
                  <FileText className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="mt-3 text-2xl font-black text-white">{homeworkList.length}</h3>
                <p className="mt-1 text-[11px] text-emerald-400">{t('Open for Submissions')}</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">{t('Live Sessions')}</span>
                  <Video className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="mt-3 text-2xl font-black text-white">{onlineClasses.length}</h3>
                <p className="mt-1 text-[11px] text-indigo-400">{t('Scheduled Sessions')}</p>
              </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
                <h3 className="mb-4 text-sm font-bold text-white">Recent Homework Tasks</h3>
                <div className="space-y-3">
                  {homeworkList.slice(0, 4).map((h) => (
                    <div key={h._id} className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">{h.title}</p>
                        <p className="text-[11px] text-slate-400">Class {h.class} • Due {new Date(h.dueDate).toLocaleDateString()}</p>
                      </div>
                      <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400">
                        {h.submissions?.length || 0} Submitted
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
                <h3 className="mb-4 text-sm font-bold text-white">Upcoming Live Classes</h3>
                <div className="space-y-3">
                  {onlineClasses.slice(0, 4).map((c) => (
                    <div key={c._id} className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">{c.title}</p>
                        <p className="text-[11px] text-slate-400">Class {c.class} • {new Date(c.scheduledAt).toLocaleString()}</p>
                      </div>
                      <a
                        href={c.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-500"
                      >
                        Launch
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ATTENDANCE VIEW (Bug B5) */}
        {(path.includes('/attendance') || path === '/dashboard/teacher/attendance') && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400">{t('Class Batch')}</label>
                  <select
                    aria-label="Attendance class"
                    disabled={availableClasses.length === 0}
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="mt-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    {availableClasses.map((c) => (
                      <option key={c} value={c}>Class {c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400">{t('Date')}</label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="mt-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20"
                >
                  {t('Mark All Present')}
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAttendance}
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
                >
                  {t('Save & Submit Register')}
                </button>
              </div>
            </div>

            {/* Students Attendance Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">{t('Student Name')}</th>
                    <th className="pb-3 font-semibold">{t('Roll No. / ID')}</th>
                    <th className="pb-3 font-semibold">{t('Class')}</th>
                    <th className="pb-3 text-right font-semibold">{t('Status Selection')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {classStudents.map((s) => {
                    const status = attendanceRecords[s._id] || 'present';
                    return (
                      <tr key={s._id} className="hover:bg-slate-800/30">
                        <td className="py-3 font-bold text-white">{s.name}</td>
                        <td className="py-3 font-mono text-slate-400">{s.uniqueId || s.rollNumber || 'STU-100'}</td>
                        <td className="py-3 text-slate-300">{s.class || selectedClass}</td>
                        <td className="py-3 text-right">
                          <div className="inline-flex gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800">
                            {['present', 'absent', 'leave', 'holiday'].map((st) => (
                              <button
                                key={st}
                                onClick={() => handleAttendanceStatusChange(s._id, st)}
                                className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase transition-all ${
                                  status === st
                                    ? st === 'present'
                                      ? 'bg-emerald-600 text-white'
                                      : st === 'absent'
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-amber-600 text-white'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {t(st)}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {classStudents.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">
                  {selectedClass
                    ? t('No students linked to this teacher in Class {{class}}.', { class: selectedClass })
                    : t('No classes are assigned to this teacher.')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 3. HOMEWORK HUB (Bug B5 & C5) */}
        {path.includes('/homework') && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {homeworkList.map((h) => (
                <div key={h._id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 uppercase">
                        Class {h.class} • {h.subject}
                      </span>
                      <span className="text-[10px] text-rose-400 font-semibold">
                        Due {new Date(h.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="mt-3 text-sm font-bold text-white">{h.title}</h4>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-3">{h.description}</p>
                  </div>

                  <div className="mt-4 border-t border-slate-800 pt-3 flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-400">
                      {h.submissions?.length || 0} Submissions
                    </span>
                    <span className="text-[11px] text-slate-500">Active Task</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. LIVE CLASSES (Bug B6 & G1-G2) */}
        {path.includes('/classes') && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {onlineClasses.map((c) => (
              <div key={c._id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 uppercase">
                    Class {c.class} • {c.subject}
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    {c.duration} mins
                  </span>
                </div>
                <h4 className="mt-3 text-sm font-bold text-white">{c.title}</h4>
                <p className="mt-1 text-xs text-slate-400">{c.description || 'Live interactive session.'}</p>
                <div className="mt-4 border-t border-slate-800 pt-3 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    {new Date(c.scheduledAt).toLocaleString()}
                  </span>
                  <a
                    href={c.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
                  >
                    Start Class →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. STUDY MATERIALS (Bug B7 & F1) */}
        {path.includes('/notes') && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {studyMaterials.map((n) => (
              <div key={n._id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 uppercase">
                    Class {n.class} • {n.subject}
                  </span>
                  <span className="text-[10px] text-slate-500">{n.fileSize || '1.5 MB'}</span>
                </div>
                <h4 className="mt-3 text-sm font-bold text-white">{n.title}</h4>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">{n.description}</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-xs">
                  <span className="text-slate-500">By {n.uploaderName}</span>
                  <button
                    type="button"
                    onClick={() => downloadMaterial(n)}
                    className="font-bold text-indigo-400 hover:text-indigo-300"
                  >
                    Open Document →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {path.includes('/feedback') && (
          <div className="space-y-4">
            {feedbackForms.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
                <MessageSquareText className="mx-auto mb-3 h-8 w-8 text-slate-600" />
                <p className="text-sm font-semibold text-white">No feedback forms yet</p>
                <p className="mt-1 text-xs text-slate-400">Create one after a lecture to collect student feedback.</p>
              </div>
            ) : feedbackForms.map((form) => (
              <section key={form._id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{form.title}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Class {form.class} · {form.subject} · {new Date(form.lectureDate).toLocaleDateString()}
                    </p>
                    <p className="mt-2 text-xs text-slate-300">{form.question}</p>
                  </div>
                  <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300">
                    {form.responses?.length || 0} responses
                  </span>
                </div>
                <div className="mt-4 space-y-2 border-t border-slate-800 pt-3">
                  {(form.responses || []).length === 0 ? (
                    <p className="text-xs text-slate-500">No students have responded yet.</p>
                  ) : form.responses.map((response, index) => (
                    <div key={`${response.studentId}-${index}`} className="rounded-xl bg-slate-950 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-white">{response.studentName}</p>
                        <p className="text-xs font-bold text-amber-300">{response.rating}/5</p>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-xs text-slate-400">
                        {response.comment || 'No additional comment'}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Create Lecture Feedback</h3>
              <p className="mt-0.5 text-xs text-slate-400">Students in the selected class can rate this lesson and comment.</p>
              <form onSubmit={handleCreateFeedbackForm} className="mt-4 space-y-3">
                <label className="block text-[11px] font-semibold text-slate-300">
                  Lecture title
                  <input
                    required
                    maxLength={120}
                    value={newFeedbackForm.title}
                    onChange={(e) => setNewFeedbackForm({ ...newFeedbackForm, title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="e.g. Introduction to Trigonometry"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-[11px] font-semibold text-slate-300">
                    Class
                    <select
                      required
                      value={newFeedbackForm.class}
                      onChange={(e) => setNewFeedbackForm({ ...newFeedbackForm, class: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      {availableClasses.map(grade => <option key={grade} value={grade}>Class {grade}</option>)}
                    </select>
                  </label>
                  <label className="block text-[11px] font-semibold text-slate-300">
                    Subject
                    <input
                      required
                      value={newFeedbackForm.subject}
                      onChange={(e) => setNewFeedbackForm({ ...newFeedbackForm, subject: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </label>
                </div>
                <label className="block text-[11px] font-semibold text-slate-300">
                  Lecture date
                  <input
                    type="date"
                    required
                    value={newFeedbackForm.lectureDate}
                    onChange={(e) => setNewFeedbackForm({ ...newFeedbackForm, lectureDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </label>
                <label className="block text-[11px] font-semibold text-slate-300">
                  Feedback prompt
                  <input
                    maxLength={300}
                    value={newFeedbackForm.question}
                    onChange={(e) => setNewFeedbackForm({ ...newFeedbackForm, question: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </label>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-800/60 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500"
                  >
                    Create Form
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CREATE HOMEWORK */}
        {showHwModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Assign Homework</h3>
              <p className="mt-0.5 text-xs text-slate-400">Post assignments with instructions and deadline</p>

              <form onSubmit={handleCreateHomework} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Assignment Title</label>
                  <input
                    type="text"
                    required
                    value={newHw.title}
                    onChange={(e) => setNewHw({ ...newHw, title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="e.g. Chapter 4 Quadratic Equations Problem Set"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300">Class</label>
                    <select
                      value={newHw.class}
                      onChange={(e) => setNewHw({ ...newHw, class: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      {availableClasses.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300">Due Date</label>
                    <input
                      type="date"
                      required
                      value={newHw.dueDate}
                      onChange={(e) => setNewHw({ ...newHw, dueDate: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Instructions / Questions</label>
                  <textarea
                    rows={3}
                    required
                    value={newHw.description}
                    onChange={(e) => setNewHw({ ...newHw, description: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="Complete questions 1 to 12 from textbook page 84..."
                  />
                </div>

                <div className="mt-5 flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowHwModal(false)}
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-800/60 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
                  >
                    Publish Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: SCHEDULE ONLINE CLASS */}
        {showClassModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Schedule Live Classroom</h3>
              <p className="mt-0.5 text-xs text-slate-400">Add meeting link for interactive lecture</p>

              <form onSubmit={handleScheduleClass} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Session Topic</label>
                  <input
                    type="text"
                    required
                    value={newClass.title}
                    onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300">Class</label>
                    <select
                      value={newClass.class}
                      onChange={(e) => setNewClass({ ...newClass, class: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      {availableClasses.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300">Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={newClass.scheduledAt}
                      onChange={(e) => setNewClass({ ...newClass, scheduledAt: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Google Meet / Zoom URL</label>
                  <input
                    type="url"
                    required
                    value={newClass.meetingUrl}
                    onChange={(e) => setNewClass({ ...newClass, meetingUrl: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="mt-5 flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowClassModal(false)}
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-800/60 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
                  >
                    Schedule Class
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {path.includes('/tests') && (
          <div className="space-y-3">
            {tests.length === 0 ? (
              <p className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center text-sm text-slate-400">No assessments have been created for your classes.</p>
            ) : tests.map(test => (
              <article key={test._id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{test.title}</h3>
                    <p className="mt-1 text-xs text-slate-400">Class {test.class} · {test.subject} · {test.questions.length} questions · {test.totalMarks} marks</p>
                  </div>
                  <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold capitalize text-indigo-300">{test.status}</span>
                </div>
                {test.attempts?.length > 0 && (
                  <div className="mt-4 border-t border-slate-800 pt-3">
                    <h4 className="text-xs font-semibold text-slate-300">Submitted results</h4>
                    <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                      {test.attempts.map(attempt => (
                        <li key={attempt.studentId} className="rounded-lg bg-slate-950 px-3 py-2 text-xs text-slate-300">
                          {attempt.studentName}: {attempt.score} marks ({attempt.percentage}%)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        {/* MODAL: UPLOAD STUDY NOTE */}
        {showNoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Upload Study Material</h3>
              <p className="mt-0.5 text-xs text-slate-400">Share lecture notes and revision guides</p>

              <form onSubmit={handleUploadNote} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Document Title</label>
                  <input
                    type="text"
                    required
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="e.g. Trigonometry Formula Cheat Sheet"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300">Class</label>
                    <select
                      value={newNote.class}
                      onChange={(e) => setNewNote({ ...newNote, class: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      {availableClasses.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300">Subject</label>
                    <input
                      type="text"
                      required
                      value={newNote.subject}
                      onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Description</label>
                  <textarea
                    rows={2}
                    value={newNote.description}
                    onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="Comprehensive formula sheet and derivations..."
                  />
                </div>

                <label className="block text-[11px] font-semibold text-slate-300">
                  File (PDF, PNG, JPEG, or TXT · up to 10 MB)
                  <input
                    type="file"
                    required
                    accept=".pdf,.png,.jpg,.jpeg,.txt,application/pdf,image/png,image/jpeg,text/plain"
                    onChange={event => setNoteFile(event.target.files?.[0] || null)}
                    className="mt-1 block w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
                  />
                </label>

                <div className="mt-5 flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNoteModal(false)}
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-800/60 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
                  >
                    Upload & Publish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showTestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
            <div className="my-auto w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Create class assessment</h3>
              <form onSubmit={handleCreateTest} className="mt-4 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-slate-300">Title
                    <input required maxLength={120} value={newTest.title} onChange={event => setNewTest({ ...newTest, title: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-white" />
                  </label>
                  <label className="text-xs font-semibold text-slate-300">Subject
                    <input required maxLength={80} value={newTest.subject} onChange={event => setNewTest({ ...newTest, subject: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-white" />
                  </label>
                  <label className="text-xs font-semibold text-slate-300">Class
                    <select required value={newTest.class} onChange={event => setNewTest({ ...newTest, class: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-white">
                      {availableClasses.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-slate-300">Duration (minutes)
                    <input required type="number" min="1" max="300" value={newTest.duration} onChange={event => setNewTest({ ...newTest, duration: Number(event.target.value) })} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-white" />
                  </label>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <h4 className="text-sm font-semibold text-white">Add multiple-choice question</h4>
                  <label className="mt-3 block text-xs text-slate-300">Question
                    <input value={questionDraft.question} onChange={event => setQuestionDraft({ ...questionDraft, question: event.target.value })} maxLength={1000} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white" />
                  </label>
                  <label className="mt-3 block text-xs text-slate-300">Options (one per line)
                    <textarea rows={3} value={questionDraft.options} onChange={event => setQuestionDraft({ ...questionDraft, options: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white" />
                  </label>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <label className="text-xs text-slate-300">Correct option (must match one option)
                      <input value={questionDraft.correctAnswer} onChange={event => setQuestionDraft({ ...questionDraft, correctAnswer: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white" />
                    </label>
                    <label className="text-xs text-slate-300">Marks
                      <input type="number" min="1" max="100" value={questionDraft.marks} onChange={event => setQuestionDraft({ ...questionDraft, marks: Number(event.target.value) })} className="mt-1 w-24 rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white" />
                    </label>
                  </div>
                  <button type="button" onClick={handleAddTestQuestion} className="mt-3 rounded-lg border border-indigo-500/40 px-3 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/10">Add question ({testQuestions.length})</button>
                  {testQuestions.length > 0 && <p className="mt-2 text-xs text-slate-400">{testQuestions.length} question(s) · {testQuestions.reduce((sum, question) => sum + question.marks, 0)} marks total</p>}
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowTestModal(false)} className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300">Cancel</button>
                  <button type="submit" disabled={!testQuestions.length} className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Publish assessment</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
