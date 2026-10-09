import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const AuditLogPage = () => {
  const { language, t } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get(`/admin/audit-logs?page=${page}&limit=25`)
      .then(response => {
        if (active) {
          setLogs(response.data?.logs || []);
          setTotalPages(response.data?.totalPages || 1);
        }
      })
      .catch(error => toast.error(t(error.response?.data?.message || 'Could not load audit history')))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [page]);

  return (
    <Layout>
      <section className="space-y-5">
        <header>
          <h2 className="text-2xl font-black text-white">{t('Audit history')}</h2>
          <p className="mt-1 text-xs text-slate-400">{t('Recent account and relationship changes performed by institutional staff.')}</p>
        </header>
        {loading ? (
          <p className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-400">{t('Loading audit history…')}</p>
        ) : logs.length === 0 ? (
          <p className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-400">{t('No audit events have been recorded yet.')}</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t('When')}</th>
                  <th className="px-4 py-3 font-semibold">{t('Actor')}</th>
                  <th className="px-4 py-3 font-semibold">{t('Action')}</th>
                  <th className="px-4 py-3 font-semibold">{t('Target')}</th>
                  <th className="px-4 py-3 font-semibold">{t('Summary')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {logs.map(log => (
                  <tr key={log._id} className="align-top text-slate-300">
                    <td className="whitespace-nowrap px-4 py-3">{new Date(log.createdAt).toLocaleString(language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN')}</td>
                    <td className="px-4 py-3">{log.actorName} <span className="text-slate-500">({t(log.actorRole)})</span></td>
                    <td className="px-4 py-3 font-mono text-indigo-300">{t(log.action)}</td>
                    <td className="px-4 py-3">{t(log.targetType)}</td>
                    <td className="px-4 py-3">{t(log.summary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{t('Page {{page}} of {{total}}', { page, total: totalPages })}</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage(current => current - 1)}
              className="rounded-lg border border-slate-700 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('Previous')}
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage(current => current + 1)}
              className="rounded-lg border border-slate-700 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('Next')}
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AuditLogPage;
