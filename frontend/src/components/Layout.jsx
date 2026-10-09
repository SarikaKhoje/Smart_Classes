import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  TrendingUp,
  FileText,
  BookOpen,
  Trophy,
  Video,
  Sparkles,
  DollarSign,
  LogOut,
  Bell,
  Menu,
  X,
  ShieldCheck,
  MessageSquareText,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { useLanguage } from '../context/LanguageContext';

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { t } = useLanguage();

  const role = user?.role || 'student';

  const roleNavItems = {
    admin: [
      { label: 'Admin Dashboard', path: '/dashboard/admin', icon: LayoutDashboard },
      { label: 'User Directory', path: '/dashboard/admin/users', icon: Users },
      { label: 'Timetable', path: '/dashboard/admin/timetable', icon: CalendarCheck },
      { label: 'Fee Invoices', path: '/dashboard/admin/fees', icon: DollarSign },
      { label: 'Study Notes', path: '/dashboard/admin/notes', icon: BookOpen },
      { label: 'Admissions', path: '/dashboard/admin/admissions', icon: MessageSquareText },
      { label: 'Courses', path: '/dashboard/admin/courses', icon: BookOpen },
      { label: 'Audit History', path: '/dashboard/admin/audit', icon: ShieldCheck }
    ],
    teacher: [
      { label: 'Teacher Dashboard', path: '/dashboard/teacher', icon: LayoutDashboard },
      { label: 'Take Attendance', path: '/dashboard/teacher/attendance', icon: CalendarCheck },
      { label: 'Arrival / Departure', path: '/dashboard/teacher/check-ins', icon: ShieldCheck },
      { label: 'Homework Hub', path: '/dashboard/teacher/homework', icon: FileText },
      { label: 'Live Classes', path: '/dashboard/teacher/classes', icon: Video },
      { label: 'Study Materials', path: '/dashboard/teacher/notes', icon: BookOpen },
      { label: 'Lecture Feedback', path: '/dashboard/teacher/feedback', icon: MessageSquareText },
      { label: 'Tests & Results', path: '/dashboard/teacher/tests', icon: FileText },
      { label: 'Parent Messages', path: '/dashboard/teacher/messages', icon: MessageSquareText },
      { label: 'Parent Meetings', path: '/dashboard/teacher/meetings', icon: CalendarCheck }
    ],
    student: [
      { label: 'Student Dashboard', path: '/dashboard/student', icon: LayoutDashboard },
      { label: 'My Attendance', path: '/dashboard/student/attendance', icon: CalendarCheck },
      { label: 'Homework', path: '/dashboard/student/homework', icon: FileText },
      { label: 'Leaderboard', path: '/dashboard/student/leaderboard', icon: Trophy },
      { label: 'AI Study Plan', path: '/dashboard/student/ai-plan', icon: Sparkles },
      { label: 'Online Classes', path: '/dashboard/student/classes', icon: Video },
      { label: 'Assessments', path: '/dashboard/student/tests', icon: FileText },
      { label: 'Study Materials', path: '/dashboard/student/notes', icon: BookOpen },
      { label: 'Lecture Feedback', path: '/dashboard/student/feedback', icon: MessageSquareText }
    ],
    parent: [
      { label: 'Parent Dashboard', path: '/dashboard/parent', icon: LayoutDashboard },
      { label: 'Child Attendance', path: '/dashboard/parent/attendance', icon: CalendarCheck },
      { label: 'Arrival / Departure', path: '/dashboard/parent/check-ins', icon: ShieldCheck },
      { label: 'Homework', path: '/dashboard/parent/homework', icon: FileText },
      { label: 'Study Materials', path: '/dashboard/parent/notes', icon: BookOpen },
      { label: 'Timetable', path: '/dashboard/parent/timetable', icon: CalendarCheck },
      { label: 'Fee Receipts', path: '/dashboard/parent/fees', icon: DollarSign },
      { label: 'Test Codes & Marks', path: '/dashboard/parent/reports', icon: FileText },
      { label: 'Teacher Messages', path: '/dashboard/parent/messages', icon: MessageSquareText },
      { label: 'Meetings', path: '/dashboard/parent/meetings', icon: CalendarCheck }
    ]
  };

  const currentNav = roleNavItems[role] || roleNavItems.student;

  useEffect(() => {
    let active = true;
    api.get('/user-notifications?limit=1')
      .then(response => {
        if (active) setUnreadNotifications(response.data?.unreadCount || 0);
      })
      .catch(error => console.error('Could not load notification count:', error.message));
    return () => {
      active = false;
    };
  }, [user?._id, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#030712] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-slate-900/80 backdrop-blur-2xl lg:flex z-20">
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 font-extrabold text-white shadow-lg shadow-indigo-500/30">
            K
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-sm font-black tracking-tight text-white leading-tight">
              Kashvi <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">SmartClass</span>
            </h1>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{t(role)} {t('Portal')}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                  <span>{t(item.label)}</span>
                </div>
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-indigo-200" />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Sign Out Footer */}
        <div className="border-t border-white/10 p-3 bg-slate-950/40">
          <div className="mb-2.5 flex items-center gap-3 rounded-xl border border-white/5 bg-slate-800/50 p-2.5 backdrop-blur-md">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 font-bold text-xs text-indigo-300 ring-1 ring-white/10">
              {user?.name?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-bold text-white">{user?.name}</p>
              <p className="truncate text-[10px] text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{t('Sign Out')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex w-72 flex-1 flex-col bg-slate-900 border-r border-white/10 p-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">K</span>
                <span className="text-sm font-bold text-white">Kashvi SmartClass</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto py-4">
              {currentNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold ${
                      isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{t(item.label)}</span>
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={handleLogout}
              className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2.5 text-xs font-semibold text-rose-300"
            >
              <LogOut className="h-4 w-4" />
              <span>{t('Sign Out')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-slate-900/60 px-6 backdrop-blur-2xl z-10">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 text-slate-300 hover:bg-slate-800 border border-white/10 transition"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="font-extrabold text-sm text-white">Kashvi SmartClass</span>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 shadow-sm shadow-emerald-500/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {t('Institutional Session Active')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle compact />
            <LanguageSelector compact />

            <Link
              to={`/dashboard/${role}/notifications`}
              aria-label={t('Open notifications')}
              className="relative rounded-xl p-2.5 text-slate-300 transition hover:bg-slate-800/80 hover:text-white border border-white/5"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
              )}
            </Link>

            <div className="flex items-center gap-2 rounded-xl bg-slate-800/60 px-3.5 py-1.5 border border-white/10 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-mono font-bold text-slate-200">
                {user?.uniqueId || user?.role?.toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#030712] p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
