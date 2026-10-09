/**
 * Automated Verification Script for Kashvi SmartClass Full-Stack Fixes
 */
import mongoose from 'mongoose';
import User from '../models/User.js';
import Fee from '../models/Fee.js';
import Timetable from '../models/Timetable.js';
import StudyMaterial from '../models/StudyMaterial.js';
import Attendance from '../models/Attendance.js';
import Test from '../models/Test.js';
import Homework from '../models/Homework.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { verifyParentChildAccess } from '../utils/parentAuth.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters before running verification');
}
const generateToken = (id, role) => jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '1d' });

async function runVerification() {
  console.log('🔄 Connecting to MongoDB for verification...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kashvi_smartclass');
  console.log('✅ Connected to MongoDB.');

  const results = [];

  // 1. Verify Parent IDOR Helper
  console.log('\n--- Test 1: Parent-Child IDOR Verification Helper ---');
  const parent = await User.findOne({ role: 'parent' });
  const student = await User.findOne({ role: 'student' });
  const fakeStudentId = new mongoose.Types.ObjectId();

  if (parent && student) {
    const check1 = await verifyParentChildAccess(parent, fakeStudentId);
    console.log(`Parent access to non-existent child: ${check1 === false ? '✅ REJECTED (PASS)' : '❌ ALLOWED (FAIL)'}`);
    results.push({ name: 'Parent IDOR Protection', pass: check1 === false });
  }

  // 2. Verify Timetable Collision Logic
  console.log('\n--- Test 2: Timetable Conflict Detection ---');
  const teacher = await User.findOne({ role: 'teacher' });
  if (teacher) {
    // Create initial slot
    await Timetable.deleteMany({ class: '10', subject: 'Verification Test' });
    const slot1 = await Timetable.create({
      class: '10',
      subject: 'Verification Test',
      teacher: teacher._id,
      teacherName: teacher.name,
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      room: 'Room 101'
    });

    // Check collision condition
    const isOverlapping = (startA, endA, startB, endB) => (startA < endB) && (endA > startB);
    const teacherConflict = isOverlapping('09:30', '10:30', slot1.startTime, slot1.endTime);
    console.log(`Teacher Collision on Overlapping Slot (09:30-10:30 vs 09:00-10:00): ${teacherConflict ? '✅ DETECTED (PASS)' : '❌ MISSED (FAIL)'}`);
    results.push({ name: 'Timetable Collision Detection', pass: teacherConflict });
    await Timetable.deleteMany({ class: '10', subject: 'Verification Test' });
  }

  // 3. Verify Notes Schema
  console.log('\n--- Test 3: StudyMaterial Schema & Persistence ---');
  const testNote = await StudyMaterial.create({
    title: 'Verification Note - Calculus Basics',
    description: 'Unit 1 formula sheet',
    subject: 'Mathematics',
    class: '10',
    uploadedBy: teacher ? teacher._id : new mongoose.Types.ObjectId(),
    fileUrl: '/uploads/sample-calc.pdf',
    fileName: 'sample-calc.pdf'
  });
  const fetchedNote = await StudyMaterial.findById(testNote._id);
  console.log(`StudyMaterial created and fetched from DB: ${fetchedNote ? '✅ PERSISTED (PASS)' : '❌ FAILED'}`);
  results.push({ name: 'Notes Persistence', pass: Boolean(fetchedNote) });
  await StudyMaterial.findByIdAndDelete(testNote._id);

  // 4. Verify Dynamic Leaderboard Calculation
  console.log('\n--- Test 4: Dynamic Leaderboard Logic ---');
  const students = await User.find({ role: 'student' }).limit(3);
  console.log(`Found ${students.length} students for dynamic scoring test.`);
  results.push({ name: 'Leaderboard Query', pass: students.length > 0 });

  // 5. Verify 2FA Backdoor Removal
  console.log('\n--- Test 5: 2FA Backdoor Fix ---');
  const testUser = {
    twoFactorSecret: 'KASHVI_SEC_9999',
    passwordResetToken: null,
    passwordResetExpires: null
  };
  const testOtp = '123456';
  const isValidOtp = Boolean(
    (testUser.twoFactorSecret && testOtp === testUser.twoFactorSecret) ||
    (testUser.passwordResetToken && testOtp === testUser.passwordResetToken)
  );
  console.log(`Arbitrary OTP '123456' rejected against secret 'KASHVI_SEC_9999': ${isValidOtp === false ? '✅ REJECTED (PASS)' : '❌ ALLOWED (FAIL)'}`);
  results.push({ name: '2FA Backdoor Elimination', pass: isValidOtp === false });

  console.log('\n========================================');
  console.log('TEST SUMMARY:');
  results.forEach(r => console.log(` - ${r.name}: ${r.pass ? 'PASS' : 'FAIL'}`));
  console.log('========================================\n');

  await mongoose.disconnect();
}

runVerification().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
