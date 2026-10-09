import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LanguageSelector from '../components/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const ForgotPassword = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestCode = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setCodeSent(true);
      toast.success('If an account exists, a reset code will be sent to its email address');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not request a reset code');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    if (password !== confirmation) return toast.error(t('Passwords do not match'));
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword: password });
      toast.success(t('Password reset. Sign in using your new password.'));
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not reset the password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-slate-100">
      <div className="mb-3 w-full max-w-md text-right"><LanguageSelector /></div>
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <h1 className="text-2xl font-black text-white">{t('Reset your password')}</h1>
        <p className="mt-2 text-sm text-slate-400">
          {codeSent ? t('Enter the six-digit code emailed to your account.') : t('Request a one-time reset code using your account email.')}
        </p>
        <form onSubmit={codeSent ? resetPassword : requestCode} className="mt-6 space-y-4">
          <label className="block text-xs font-semibold text-slate-300">
            {t('Email')}
            <input type="email" required maxLength={254} autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} disabled={codeSent} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white disabled:opacity-70" />
          </label>
          {codeSent && (
            <>
              <label className="block text-xs font-semibold text-slate-300">
                {t('Reset code')}
                <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required autoComplete="one-time-code" value={otp} onChange={event => setOtp(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-center font-mono text-lg tracking-[0.3em] text-white" />
              </label>
              <label className="block text-xs font-semibold text-slate-300">
                {t('New password')}
                <input type="password" minLength={8} maxLength={128} required autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white" />
              </label>
              <label className="block text-xs font-semibold text-slate-300">
                {t('Confirm new password')}
                <input type="password" minLength={8} maxLength={128} required autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white" />
              </label>
            </>
          )}
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50">
            {loading ? t('Please wait…') : codeSent ? t('Reset password') : t('Send reset code')}
          </button>
        </form>
        <Link to="/login" className="mt-5 block text-center text-xs font-semibold text-indigo-300 hover:text-indigo-200">{t('Back to sign in')}</Link>
      </section>
    </main>
  );
};

export default ForgotPassword;
