import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import NotificationsPage from './pages/NotificationsPage';
import ParentTeacherMessagesPage from './pages/ParentTeacherMessagesPage';
import ParentTeacherMeetingsPage from './pages/ParentTeacherMeetingsPage';
import PublicHome from './pages/PublicHome';
import CourseManagementPage from './pages/CourseManagementPage';
import AuditLogPage from './pages/AuditLogPage';
import StudyMaterialsPage from './pages/StudyMaterialsPage';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="font-semibold text-slate-300">Loading Kashvi SmartClass...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <PublicHome />;
  }

  return <Navigate to={`/dashboard/${user.role}`} replace />;
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
        <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/home" element={<PublicHome />} />
        <Route path="/admission" element={<PublicHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/users" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/timetable" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/fees" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/notes" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/admissions" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/courses" element={<CourseManagementPage />} />
          <Route path="/dashboard/admin/notifications" element={<NotificationsPage />} />
          <Route path="/dashboard/admin/audit" element={<AuditLogPage />} />
        </Route>

        {/* Protected Teacher Routes */}
        <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin']} />}>
          <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
          <Route path="/dashboard/teacher/attendance" element={<TeacherDashboard />} />
          <Route path="/dashboard/teacher/check-ins" element={<TeacherDashboard />} />
          <Route path="/dashboard/teacher/homework" element={<TeacherDashboard />} />
          <Route path="/dashboard/teacher/classes" element={<TeacherDashboard />} />
          <Route path="/dashboard/teacher/notes" element={<TeacherDashboard />} />
          <Route path="/dashboard/teacher/feedback" element={<TeacherDashboard />} />
          <Route path="/dashboard/teacher/tests" element={<TeacherDashboard />} />
          <Route path="/dashboard/teacher/notifications" element={<NotificationsPage />} />
          <Route path="/dashboard/teacher/messages" element={<ParentTeacherMessagesPage />} />
          <Route path="/dashboard/teacher/meetings" element={<ParentTeacherMeetingsPage />} />
        </Route>

        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student', 'admin']} />}>
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/dashboard/student/attendance" element={<StudentDashboard />} />
          <Route path="/dashboard/student/homework" element={<StudentDashboard />} />
          <Route path="/dashboard/student/leaderboard" element={<StudentDashboard />} />
          <Route path="/dashboard/student/ai-plan" element={<StudentDashboard />} />
          <Route path="/dashboard/student/classes" element={<StudentDashboard />} />
          <Route path="/dashboard/student/feedback" element={<StudentDashboard />} />
          <Route path="/dashboard/student/tests" element={<StudentDashboard />} />
          <Route path="/dashboard/student/notes" element={<StudyMaterialsPage />} />
          <Route path="/dashboard/student/notifications" element={<NotificationsPage />} />
        </Route>

        {/* Protected Parent Routes */}
        <Route element={<ProtectedRoute allowedRoles={['parent', 'admin']} />}>
          <Route path="/dashboard/parent" element={<ParentDashboard />} />
          <Route path="/dashboard/parent/attendance" element={<ParentDashboard />} />
          <Route path="/dashboard/parent/check-ins" element={<ParentDashboard />} />
          <Route path="/dashboard/parent/homework" element={<ParentDashboard />} />
          <Route path="/dashboard/parent/notes" element={<StudyMaterialsPage />} />
          <Route path="/dashboard/parent/timetable" element={<ParentDashboard />} />
          <Route path="/dashboard/parent/fees" element={<ParentDashboard />} />
          <Route path="/dashboard/parent/reports" element={<ParentDashboard />} />
          <Route path="/dashboard/parent/notifications" element={<NotificationsPage />} />
          <Route path="/dashboard/parent/messages" element={<ParentTeacherMessagesPage />} />
          <Route path="/dashboard/parent/meetings" element={<ParentTeacherMeetingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
