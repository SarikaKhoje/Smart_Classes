import React, { useCallback, useEffect, useState } from 'react';
import { Download, ExternalLink, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const StudyMaterialsPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [children, setChildren] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'parent') return;
    api.get('/parent/children')
      .then(response => {
        const linkedChildren = response.data?.children || [];
        setChildren(linkedChildren);
        if (linkedChildren.length) setStudentId(linkedChildren[0]._id);
      })
      .catch(error => toast.error(t(error.response?.data?.message || 'Could not load linked children')));
  }, [user?.role]);

  const loadMaterials = useCallback(async () => {
    if (user?.role === 'parent' && !studentId) {
      setMaterials([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = user?.role === 'parent' ? { studentId } : {};
      const response = await api.get('/notes', { params });
      setMaterials(response.data?.materials || []);
    } catch (error) {
      toast.error(t(error.response?.data?.message || 'Could not load study materials'));
    } finally {
      setLoading(false);
    }
  }, [studentId, user?.role]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  const downloadMaterial = async material => {
    try {
      const response = await api.get(`/notes/${material._id}/file`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = material.fileName || material.title;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(t(error.response?.data?.message || 'Could not download this material'));
    }
  };

  return (
    <Layout>
      <section className="mx-auto max-w-5xl space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{t('Study materials')}</h2>
            <p className="mt-1 text-sm text-slate-400">{t('Class notes and learning resources shared by your teachers.')}</p>
          </div>
          {user?.role === 'parent' && children.length > 0 && (
            <label className="space-y-1 text-xs text-slate-400">
              <span>{t('Student')}</span>
              <select
                value={studentId}
                onChange={event => setStudentId(event.target.value)}
                className="block min-w-48 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              >
                {children.map(child => <option key={child._id} value={child._id}>{child.name} · Class {child.class}</option>)}
              </select>
            </label>
          )}
        </header>
        {loading ? (
          <p className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">{t('Loading study materials…')}</p>
        ) : materials.length === 0 ? (
          <p className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">{t('No study materials are available yet.')}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {materials.map(material => (
              <article key={material._id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="flex items-start gap-3">
                  <FileText className="mt-1 h-5 w-5 shrink-0 text-indigo-400" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white">{material.title}</h3>
                    <p className="mt-1 text-xs text-slate-400">{material.subject} · {t('Class')} {material.class} · {material.uploaderName}</p>
                    {material.description && <p className="mt-3 text-sm text-slate-300">{material.description}</p>}
                    <p className="mt-2 truncate text-xs text-slate-500">{material.fileName}</p>
                    {material.storageName || material.fileUrl.startsWith('/uploads/') ? (
                      <button
                        type="button"
                        onClick={() => downloadMaterial(material)}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                      >
                        <Download className="h-4 w-4" /> {t('Download file')}
                      </button>
                    ) : (
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                      >
                        <ExternalLink className="h-4 w-4" /> {t('Open resource')}
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default StudyMaterialsPage;
