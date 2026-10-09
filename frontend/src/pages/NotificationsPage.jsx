import React, { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const NotificationsPage = () => {
  const { language, t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await api.get('/user-notifications');
      setNotifications(response.data?.notifications || []);
    } catch (error) {
      toast.error(t(error.response?.data?.message || 'Could not load notifications'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markRead = async (id) => {
    try {
      await api.put(`/user-notifications/${id}/read`);
      setNotifications(current => current.map(item => item._id === id ? { ...item, readAt: new Date().toISOString() } : item));
    } catch (error) {
      toast.error(t(error.response?.data?.message || 'Could not update notification'));
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/user-notifications/read-all');
      setNotifications(current => current.map(item => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
    } catch (error) {
      toast.error(t(error.response?.data?.message || 'Could not update notifications'));
    }
  };

  return (
    <Layout>
      <section className="mx-auto max-w-4xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{t('Notifications')}</h2>
            <p className="mt-1 text-sm text-slate-400">{t('Private updates for your account.')}</p>
          </div>
          <button onClick={markAllRead} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800">
            <CheckCheck className="h-4 w-4" /> {t('Mark all read')}
          </button>
        </div>
        {loading ? (
          <p className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">{t('Loading notifications…')}</p>
        ) : notifications.length ? (
          <div className="space-y-3">
            {notifications.map(item => (
              <article key={item._id} className={`rounded-xl border p-4 ${item.readAt ? 'border-slate-800 bg-slate-900/60' : 'border-indigo-500/40 bg-indigo-500/10'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <Bell className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                    <div>
                      <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-300">{item.message}</p>
                      <time className="mt-2 block text-xs text-slate-500">{new Date(item.createdAt).toLocaleString(language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN')}</time>
                    </div>
                  </div>
                  {!item.readAt && <button onClick={() => markRead(item._id)} className="shrink-0 text-xs font-semibold text-indigo-300 hover:text-white">{t('Mark read')}</button>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">{t('You have no notifications.')}</p>
        )}
      </section>
    </Layout>
  );
};

export default NotificationsPage;
