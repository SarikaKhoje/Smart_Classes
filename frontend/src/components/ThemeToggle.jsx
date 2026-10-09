import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle = ({ compact = false }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative inline-flex items-center justify-center rounded-xl p-2.5 transition-all duration-200 ${
        isDark
          ? 'bg-slate-800/80 hover:bg-slate-700/80 text-amber-400 border border-white/10 hover:shadow-lg hover:shadow-amber-500/10'
          : 'bg-white hover:bg-slate-100 text-indigo-600 border border-slate-200 shadow-sm hover:shadow'
      } ${compact ? 'h-9 w-9 p-2' : ''}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
};

export default ThemeToggle;
