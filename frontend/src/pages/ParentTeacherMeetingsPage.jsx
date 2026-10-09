import React, { useCallback, useEffect, useState } from 'react';
import { CalendarCheck, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const ParentTeacherMeetingsPage = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const isParent = user?.role === 'parent';
  const [children, setChildren] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ className: user?.assignedClasses?.[0] || '', startAt: '', endAt: '', meetingLink: '' });

  const loadMeetings = useCallback(async () => {
    if (isParent && !studentId) {
      setMeetings([]);
      return;
    }
    try {
      const response = await api.get(isParent ? `/meetings/children/${studentId}` : '/meetings');
      setMeetings(response.data?.meetings || []);
    } catch (error) {
      toast.error(t(error.response?.data?.message || 'Could not load appointments'));
    } finally {
      setLoading(false);
    }
  }, [isParent, studentId]);

  useEffect(() => {
    if (!isParent) return;
    api.get('/parent/children')
      .then(response => {
        const records = response.data?.children || [];
        setChildren(records);
        setStudentId(records[0]?._id || '');
      })
      .catch(error => toast.error(error.response?.data?.message || 'Could not load linked students'))
      .finally(() => setLoading(false));
  }, [isParent]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  const publishAvailability = async (event) => {
    event.preventDefault();
    try {
      await api.post('/meetings/availability', form);
      toast.success(t('Meeting availability published'));
      setForm(current => ({ ...current, startAt: '', endAt: '', meetingLink: '' }));
      loadMeetings();
    } catch (error) {
      toast.error(t(error.response?.data?.message || 'Could not publish availability'));
    }
  };

  const updateMeeting = async (meeting, action) => {
    try {
      if (action === 'book') {
        await api.post(`/meetings/${meeting._id}/book`, { studentId });
        toast.success(t('Appointment booked'));
      } else {
        await api.put(`/meetings/${meeting._id}/cancel`);
        toast.success(t('Appointment cancelled'));
      }
      loadMeetings();
    } catch (error) {
      toast.error(t(error.response?.data?.message || 'Could not update appointment'));
    }
  };

  return (
    <Layout>
      <section className="mx-auto max-w-5xl space-y-5">
        <header>
          <h2 className="text-2xl font-bold text-white">{t('Parent–Teacher Meetings')}</h2>
          <p className="mt-1 text-sm text-slate-400">{t('Teachers publish appointment windows; parents can book available times for linked students.')}</p>
        </header>
        {isParent ? (
          <label className="block max-w-sm text-xs font-semibold text-slate-400">
            {t('Student')}
            <select value={studentId} onChange={event => setStudentId(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white">
              {children.map(child => <option key={child._id} value={child._id}>{child.name} — {child.class}</option>)}
            </select>
          </label>
        ) : (
          <form onSubmit={publishAvailability} className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-2">
            <label className="text-xs font-semibold text-slate-400">{t('Class')}
              <select value={form.className} onChange={event => setForm({ ...form, className: event.target.value })} required className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-white">
                {(user?.assignedClasses || []).map(className => <option key={className} value={className}>{className}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-400">{t('Optional meeting link')}
              <input type="url" value={form.meetingLink} onChange={event => setForm({ ...form, meetingLink: event.target.value })} placeholder="https://…" className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-white" />
            </label>
            <label className="text-xs font-semibold text-slate-400">{t('Starts')}
              <input type="datetime-local" value={form.startAt} onChange={event => setForm({ ...form, startAt: event.target.value })} required className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-white" />
            </label>
            <label className="text-xs font-semibold text-slate-400">{t('Ends')}
              <input type="datetime-local" value={form.endAt} onChange={event => setForm({ ...form, endAt: event.target.value })} required className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-white" />
            </label>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white md:col-span-2"><Plus className="h-4 w-4" /> {t('Publish availability')}</button>
          </form>
        )}
        <div className="space-y-3">
          {loading ? <p className="text-sm text-slate-400">{t('Loading appointments…')}</p> : meetings.length ? meetings.map(meeting => (
            <article key={meeting._id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="flex items-start gap-3">
                <CalendarCheck className="mt-1 h-5 w-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-semibold text-white">{new Date(meeting.startAt).toLocaleString(language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN')} – {new Date(meeting.endAt).toLocaleTimeString(language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN')}</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {t('Class')} {meeting.className} · {isParent ? `${t('Teacher')}: ${meeting.teacherId?.name || t('Teacher')}` : meeting.studentId ? `${t('Student')}: ${meeting.studentId.name} · ${t('Parent')}: ${meeting.parentId?.name || t('Parent')}` : t('Available for booking')}
                  </p>
                  {meeting.meetingLink && meeting.status === 'booked' && <a href={meeting.meetingLink} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-indigo-300 underline">{t('Open meeting link')}</a>}
                </div>
              </div>
              {isParent ? meeting.status === 'available' ? (
                <button onClick={() => updateMeeting(meeting, 'book')} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">{t('Book')}</button>
              ) : (
                <button onClick={() => updateMeeting(meeting, 'cancel')} className="rounded-lg border border-rose-500/40 px-3 py-2 text-xs font-semibold text-rose-300">{t('Cancel')}</button>
              ) : (
                <button onClick={() => updateMeeting(meeting, 'cancel')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300">{t('Cancel')}</button>
              )}
            </article>
          )) : <p className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">{t('No appointments or available meeting times yet.')}</p>}
        </div>
      </section>
    </Layout>
  );
};

export default ParentTeacherMeetingsPage;
