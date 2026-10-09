import React from 'react';
import { Languages } from 'lucide-react';
import { LANGUAGE_OPTIONS, useLanguage } from '../context/LanguageContext';

const LanguageSelector = ({ compact = false }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label className={`inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 shadow-lg shadow-slate-950/10 ${compact ? 'max-w-full' : ''}`}>
      <Languages className="h-4 w-4 shrink-0 text-indigo-300" aria-hidden="true" />
      <span className="sr-only">{t('Language')}</span>
      <select
        aria-label={t('Language')}
        value={language}
        onChange={event => setLanguage(event.target.value)}
        className="min-w-24 cursor-pointer appearance-none bg-transparent font-semibold text-inherit outline-none"
      >
        {LANGUAGE_OPTIONS.map(option => (
          <option key={option.code} value={option.code} className="bg-slate-900 text-white">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default LanguageSelector;
