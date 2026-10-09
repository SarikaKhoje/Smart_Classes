import test from 'node:test';
import assert from 'node:assert/strict';
import Attendance from '../models/Attendance.js';
import Course from '../models/Course.js';
import Fee from '../models/Fee.js';
import FeedbackForm from '../models/FeedbackForm.js';
import Homework from '../models/Homework.js';
import OnlineClass from '../models/OnlineClass.js';
import Report from '../models/Report.js';
import StudyPlan from '../models/StudyPlan.js';
import StudentCheckIn from '../models/StudentCheckIn.js';
import TestModel from '../models/Test.js';
import Timetable from '../models/Timetable.js';
import User from '../models/User.js';
import validateAcademicClass from '../middleware/validateAcademicClass.js';
import { ACADEMIC_CLASSES, isAcademicClass } from '../utils/academicClass.js';
import { evaluateStudentAnswers, toStudentTest } from '../utils/studentTest.js';

test('only grades 7, 8, 9, and 10 are valid classes', () => {
  assert.deepEqual(ACADEMIC_CLASSES, ['7', '8', '9', '10']);
  for (const grade of ACADEMIC_CLASSES) assert.equal(isAcademicClass(grade), true);
  for (const grade of ['6', '11', '10-A', '9B', '', 10, null]) {
    assert.equal(isAcademicClass(grade), false, `Expected ${String(grade)} to be rejected`);
  }
});

test('class middleware rejects sections and accepts the four supported grades', () => {
  const validate = (body) => {
    const req = { body, query: {} };
    let status;
    let response;
    const res = {
      status(code) { status = code; return this; },
      json(payload) { response = payload; return this; }
    };
    let advanced = false;
    validateAcademicClass(req, res, () => { advanced = true; });
    return { req, status, response, advanced };
  };

  for (const grade of ACADEMIC_CLASSES) assert.equal(validate({ class: grade }).advanced, true);
  const section = validate({ class: '10-A' });
  assert.equal(section.status, 400);
  assert.equal(section.advanced, false);
  assert.equal(validate({ assignedClasses: ['7', '10'] }).advanced, true);
  assert.equal(validate({ assignedClasses: ['10-A'] }).status, 400);
});

test('class-bearing schemas reject grades outside 7 to 10', async () => {
  const classModels = [
    Attendance,
    Course,
    Fee,
    FeedbackForm,
    Homework,
    OnlineClass,
    Report,
    StudyPlan,
    StudentCheckIn,
    TestModel,
    Timetable
  ];

  for (const Model of classModels) {
    const error = new Model({ class: '10-A' }).validateSync();
    assert.ok(error?.errors?.class, `${Model.modelName} should reject a class section`);
  }

  const invalidStudentGrade = new User({ name: 'Test', email: 'test@example.com', password: 'password', role: 'student', class: '10-A' }).validateSync();
  assert.ok(invalidStudentGrade?.errors?.class);
  const invalidTeacherGrade = new User({
    name: 'Test',
    email: 'teacher@example.com',
    password: 'password',
    role: 'teacher',
    assignedClasses: ['9-B']
  }).validateSync();
  assert.ok(invalidTeacherGrade?.errors?.assignedClasses);

  const linkedTeacher = new User({
    name: 'Linked Teacher',
    email: 'linked-teacher@example.com',
    password: 'password',
    role: 'teacher',
    assignedClasses: ['9'],
    linkedStudents: ['665f1f77bcf86cd799439011']
  });

  test('student test payload hides answer keys and other students’ attempts', () => {
    const testId = '665f1f77bcf86cd799439013';
    const studentId = '665f1f77bcf86cd799439014';
    const payload = toStudentTest({
      _id: testId,
      title: 'Math test',
      subject: 'Mathematics',
      class: '9',
      duration: 30,
      totalMarks: 5,
      passingMarks: 2,
      status: 'published',
      questions: [{ question: '2 + 2?', options: ['3', '4'], correctAnswer: '4', marks: 5 }],
      attempts: [{ studentId: '665f1f77bcf86cd799439015', score: 5 }]
    }, studentId);
    assert.equal(payload.questions[0].question, '2 + 2?');
    assert.equal('correctAnswer' in payload.questions[0], false);
    assert.equal('attempts' in payload, false);
    assert.equal(payload.submitted, false);
  });

  test('test answer evaluation validates indices and scores only exact correct answers', () => {
    const questions = [
      { correctAnswer: '4', marks: 2 },
      { correctAnswer: 'true', marks: 3 }
    ];
    assert.deepEqual(evaluateStudentAnswers(questions, { 0: '4', 1: 'false' }), { score: 2 });
    assert.match(evaluateStudentAnswers(questions, ['4']).error, /question-indexed object/);
    assert.match(evaluateStudentAnswers(questions, { 2: 'answer' }).error, /valid question/);
    assert.match(evaluateStudentAnswers(questions, { 0: 4 }).error, /1,000 characters/);
  });
  assert.equal(linkedTeacher.validateSync()?.errors?.linkedStudents, undefined);
  assert.equal(linkedTeacher.linkedStudents[0].toString(), '665f1f77bcf86cd799439011');

  const linkedStudent = new User({
    name: 'Linked Student',
    email: 'linked-student@example.com',
    password: 'password',
    role: 'student',
    class: '9',
    parents: ['665f1f77bcf86cd799439012']
  });
  assert.equal(linkedStudent.validateSync()?.errors?.parents, undefined);
  assert.equal(linkedStudent.parents[0].toString(), '665f1f77bcf86cd799439012');

  for (const grade of ACADEMIC_CLASSES) {
    const validStudent = new User({ name: 'Test', email: `${grade}@example.com`, password: 'password', role: 'student', class: grade });
    assert.equal(validStudent.validateSync()?.errors?.class, undefined);
  }
});
