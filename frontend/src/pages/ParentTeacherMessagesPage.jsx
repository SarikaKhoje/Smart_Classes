import React, { useEffect, useState } from 'react';
import { MessageSquareText, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const ParentTeacherMessagesPage = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const isParent = user?.role === 'parent';
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [counterparts, setCounterparts] = useState([]);
  const [counterpartId, setCounterpartId] = useState('');
  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const response = await api.get(isParent ? '/parent/children' : '/teacher/my-students');
        const records = response.data?.children || response.data?.students || [];
        setStudents(records);
        if (records.length) setStudentId(records[0]._id);
      } catch (error) {
        toast.error(t(error.response?.data?.message || 'Could not load students'));
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, [isParent]);

  useEffect(() => {
    if (!studentId) {
      setCounterparts([]);
      setCounterpartId('');
      setConversation(null);
      return;
    }
    let active = true;
    const loadOptions = async () => {
      setCounterpartId('');
      setConversation(null);
      try {
        const response = await api.get(`/messages/children/${studentId}`);
        if (!active) return;
        const options = isParent ? response.data?.teachers || [] : response.data?.parents || [];
        setCounterparts(options);
        setCounterpartId(options[0]?._id || '');
      } catch (error) {
        if (active) toast.error(t(error.response?.data?.message || 'Could not load conversation participants'));
      }
    };
    loadOptions();
    return () => {
      active = false;
    };
  }, [studentId, isParent]);

  useEffect(() => {
    if (!studentId || !counterpartId) {
      setConversation(null);
      return;
    }
    let active = true;
    const loadConversation = async () => {
      try {
        const parameter = isParent ? 'teacherId' : 'parentId';
        const response = await api.get(`/messages/children/${studentId}?${parameter}=${counterpartId}`);
        if (active) setConversation(response.data?.conversation || { messages: [] });
      } catch (error) {
        if (active) toast.error(t(error.response?.data?.message || 'Could not load messages'));
      }
    };
    loadConversation();
    return () => {
      active = false;
    };
  }, [studentId, counterpartId, isParent]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!message.trim() || !studentId || !counterpartId) return;
    const parameter = isParent ? 'teacherId' : 'parentId';
    try {
      const response = await api.post(`/messages/children/${studentId}?${parameter}=${counterpartId}`, { body: message });
      setConversation(response.data.conversation);
      setMessage('');
    } catch (error) {
      toast.error(t(error.response?.data?.message || 'Could not send message'));
    }
  };

  const selectedStudent = students.find(item => item._id === studentId);

  return (
    <Layout>
      <section className="mx-auto max-w-4xl space-y-5">
        <header>
          <h2 className="text-2xl font-bold text-white">{t('Parent–Teacher Messages')}</h2>
          <p className="mt-1 text-sm text-slate-400">{t('Private conversations are limited to a linked child and their assigned teachers.')}</p>
        </header>
        <div className="flex flex-wrap gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
          <label className="min-w-52 flex-1 text-xs font-semibold text-slate-400">
            {t('Student')}
            <select value={studentId} onChange={event => setStudentId(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-white">
              {students.map(student => <option key={student._id} value={student._id}>{student.name} — {student.class}</option>)}
            </select>
          </label>
          <label className="min-w-52 flex-1 text-xs font-semibold text-slate-400">
            {t(isParent ? 'Teacher' : 'Parent')}
            <select value={counterpartId} onChange={event => setCounterpartId(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-white">
              {counterparts.map(person => <option key={person._id} value={person._id}>{person.name}{person.subject ? ` — ${person.subject}` : ''}</option>)}
            </select>
          </label>
        </div>
        {loading ? <p className="text-sm text-slate-400">{t('Loading conversations…')}</p> : !selectedStudent ? (
          <p className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">{t('No linked or assigned students are available.')}</p>
        ) : !counterpartId ? (
          <p className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">{t(isParent ? 'No assigned teacher is available for this student.' : 'No verified parent link is available for this student.')}</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-800 p-4 text-sm font-semibold text-white">
              <MessageSquareText className="h-4 w-4 text-indigo-400" /> {t('Conversation about {{name}}', { name: selectedStudent.name })}
            </div>
            <div className="max-h-[55vh] min-h-48 space-y-3 overflow-y-auto p-4">
              {(conversation?.messages || []).map(item => (
                <div key={item._id} className={`max-w-[85%] rounded-xl p-3 ${item.senderId === user?._id ? 'ml-auto bg-indigo-600/30 text-indigo-50' : 'bg-slate-800 text-slate-200'}`}>
                  <p className="text-sm">{item.body}</p>
                  <time className="mt-1 block text-[10px] opacity-60">{new Date(item.createdAt).toLocaleString(language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN')}</time>
                </div>
              ))}
              {!conversation?.messages?.length && <p className="py-12 text-center text-sm text-slate-500">{t('Start the conversation with a message.')}</p>}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-800 p-3">
              <input value={message} onChange={event => setMessage(event.target.value)} maxLength={2000} placeholder={t('Write a message…')} className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" />
              <button disabled={!message.trim()} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Send className="h-4 w-4" /> {t('Send')}</button>
            </form>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default ParentTeacherMessagesPage;
