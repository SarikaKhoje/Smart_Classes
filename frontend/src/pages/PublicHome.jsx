import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Users,
  Video,
  Award
} from 'lucide-react';
import api from '../services/api';
import { ACADEMIC_CLASSES } from '../constants/academicClasses';
import LanguageSelector from '../components/LanguageSelector';
import ThemeToggle from '../components/ThemeToggle';
import { useLanguage } from '../context/LanguageContext';

const PublicHome = () => {
  const { t } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [catalogError, setCatalogError] = useState('');
  const [enquiry, setEnquiry] = useState({ name: '', email: '', phone: '', desiredClass: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  useEffect(() => {
    Promise.all([api.get('/public/courses'), api.get('/public/teachers')])
      .then(([courseResponse, teacherResponse]) => {
        setCourses(courseResponse.data?.courses || []);
        setTeachers(teacherResponse.data?.teachers || []);
      })
      .catch(() => setCatalogError('The course directory is temporarily unavailable. Please try again later.'));
  }, []);

  const submitEnquiry = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormMessage('');
    try {
      await api.post('/public/admission-enquiries', enquiry);
      setEnquiry({ name: '', email: '', phone: '', desiredClass: '', message: '' });
      setFormMessage('Thank you. Your admission enquiry has been received by the institute.');
    } catch (error) {
      setFormMessage(error.response?.data?.message || 'We could not submit the enquiry. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
      <div className="pointer-events-none fixed top-1/3 right-10 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[100px]" />

      {/* Navigation Header */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 font-extrabold text-white shadow-lg shadow-indigo-500/30 transition group-hover:scale-105">
              K
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white">
                Kashvi <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">SmartClass</span>
              </span>
              <p className="text-[10px] text-slate-400 -mt-0.5">Academic Excellence Platform</p>
            </div>
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <a href="#courses" className="hidden text-xs font-semibold text-slate-300 hover:text-white transition sm:inline">{t('Courses')}</a>
            <a href="#admission" className="hidden text-xs font-semibold text-slate-300 hover:text-white transition sm:inline">{t('Admission')}</a>
            <ThemeToggle compact />
            <LanguageSelector compact />
            <Link
              to="/login"
              className="group flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-indigo-400 hover:shadow-indigo-500/40"
            >
              <span>{t('Portal sign in')}</span>
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>{t('Learning, organized')}</span>
            </div>
            <h1 className="text-4xl font-black leading-[1.15] tracking-tight text-white sm:text-6xl">
              A connected classroom for <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">every learner.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300">
              {t('Explore classes, stay informed about learning, and connect with the institute through one secure portal.')}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#admission"
                className="rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/30 transition hover:from-indigo-500 hover:to-indigo-400 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
              >
                {t('Enquire about admission')}
              </a>
              <Link
                to="/login"
                className="rounded-2xl border border-white/10 bg-slate-900/60 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-xl transition hover:bg-slate-800 hover:border-white/20 hover:-translate-y-0.5"
              >
                {t('Open student portal')}
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="mt-12 flex items-center gap-6 border-t border-white/10 pt-8 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Verified Faculty</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>AI Study Guidance</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Live Interactive LMS</span>
              </div>
            </div>
          </div>

          {/* Feature Grid cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [BookOpen, t('Homework & materials'), t('Assignments and learning resources in one place.'), 'text-indigo-400', 'from-indigo-500/10 to-indigo-500/5'],
              [GraduationCap, t('Progress & attendance'), t('Authorized students and parents can review records.'), 'text-cyan-400', 'from-cyan-500/10 to-cyan-500/5'],
              [MessageSquareText, t('Feedback & communication'), t('Share lecture feedback and contact assigned teachers.'), 'text-purple-400', 'from-purple-500/10 to-purple-500/5'],
              [ShieldCheck, t('Parent access controls'), t('Parent accounts see only institute-verified linked students.'), 'text-emerald-400', 'from-emerald-500/10 to-emerald-500/5']
            ].map(([Icon, title, text, iconColor, bgGrad]) => (
              <article
                key={title}
                className={`group rounded-2xl border border-white/10 bg-gradient-to-br ${bgGrad} p-6 backdrop-blur-xl transition hover:border-indigo-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10`}
              >
                <div className="mb-4 inline-flex rounded-xl bg-slate-900/80 p-3 border border-white/10 shadow-sm">
                  <Icon className={`h-6 w-6 ${iconColor} transition group-hover:scale-110`} />
                </div>
                <h2 className="text-sm font-bold text-white">{title}</h2>
                <p className="mt-2 text-xs leading-5 text-slate-400">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Courses & Curriculum Section */}
      <section id="courses" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">{t('Explore')}</p>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">{t('Courses & faculty')}</h2>
            <p className="mt-1 text-sm text-slate-400">Standardized CBSE / State board curriculum for Classes 7 through 10</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-semibold text-indigo-300">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Active Curriculum Directory</span>
          </div>
        </div>

        {catalogError && (
          <p className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-medium text-amber-200">
            {t(catalogError)}
          </p>
        )}

        {courses.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
              <article
                key={course._id}
                className="group relative rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl transition hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-bold text-indigo-400 border border-indigo-500/20">
                    Class {course.class}
                  </span>
                  {course.code && <span className="font-mono text-xs text-slate-400">{course.code}</span>}
                </div>
                <h3 className="mt-4 text-lg font-bold text-white group-hover:text-indigo-300 transition">{course.name}</h3>
                {course.description && (
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{course.description}</p>
                )}
                {course.teacherName && (
                  <div className="mt-6 flex items-center gap-2 border-t border-white/5 pt-4 text-xs text-slate-400">
                    <Users className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Faculty: <strong className="text-slate-200">{course.teacherName}</strong></span>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : !catalogError ? (
          <p className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 text-sm text-slate-400">
            {t('Course information will appear here when it is published by the institute.')}
          </p>
        ) : null}

        {/* Faculty Roster */}
        {teachers.length > 0 && (
          <div className="mt-12">
            <h3 className="mb-4 text-base font-bold text-white">Distinguished Academic Faculty</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {teachers.map(teacher => (
                <div
                  key={teacher._id}
                  className="rounded-2xl border border-white/5 bg-slate-900/40 p-4 backdrop-blur-md transition hover:border-white/15"
                >
                  <p className="text-sm font-bold text-white">{teacher.name}</p>
                  <p className="mt-0.5 text-xs text-indigo-400 font-semibold">{teacher.subject || t('Faculty')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Admission Enquiry Section */}
      <section id="admission" className="border-t border-white/10 bg-slate-900/40 px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-300">
              {t('Admissions')}
            </div>
            <h2 className="text-3xl font-black text-white sm:text-4xl">{t('Start with an enquiry')}</h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-400">
              {t('Send your class and contact details to the institute. An administrator can review and update the enquiry status from the admin portal.')}
            </p>
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Prompt evaluation by academic counseling team</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Instant confirmation tracking ID</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-2xl">
            <form onSubmit={submitEnquiry} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">{t('Name')}</label>
                <input
                  aria-label={t('Name')}
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder={t('Student or parent name')}
                  value={enquiry.name}
                  onChange={event => setEnquiry({ ...enquiry, name: event.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">{t('Email')}</label>
                <input
                  aria-label={t('Email')}
                  type="email"
                  required
                  maxLength={254}
                  placeholder="name@example.com"
                  value={enquiry.email}
                  onChange={event => setEnquiry({ ...enquiry, email: event.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">{t('Phone')}</label>
                <input
                  aria-label={t('Phone')}
                  required
                  maxLength={30}
                  placeholder="+91 9876543210"
                  value={enquiry.phone}
                  onChange={event => setEnquiry({ ...enquiry, phone: event.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">{t('Class')}</label>
                <select
                  aria-label={t('Class')}
                  required
                  value={enquiry.desiredClass}
                  onChange={event => setEnquiry({ ...enquiry, desiredClass: event.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">{t('Select class')}</option>
                  {ACADEMIC_CLASSES.map(grade => (
                    <option key={grade} value={grade} className="bg-slate-900 text-white">
                      Class {grade}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-300">{t('Message (optional)')}</label>
                <textarea
                  aria-label={t('Message')}
                  maxLength={2000}
                  rows={3}
                  placeholder={t('Tell us about your learning goals or question…')}
                  value={enquiry.message}
                  onChange={event => setEnquiry({ ...enquiry, message: event.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {formMessage && (
                <div role="status" className="sm:col-span-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-xs font-semibold text-indigo-300">
                  {t(formMessage)}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="sm:col-span-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50"
              >
                <span>{submitting ? t('Submitting…') : t('Submit admission enquiry')}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-slate-500 bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p>© {new Date().getFullYear()} Kashvi SmartClass. Institutional Academic Management Platform.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-white transition">
              {t('Portal sign in')}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default PublicHome;
