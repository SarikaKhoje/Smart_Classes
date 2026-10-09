import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, Eye, EyeOff, KeyRound, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import LanguageSelector from '../components/LanguageSelector';
import ThemeToggle from '../components/ThemeToggle';
import { useLanguage } from '../context/LanguageContext';

export const Login = () => {
  const { login, verify2FA } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [is2FA, setIs2FA] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);
  const [otpCode, setOtpCode] = useState('');

  const quickFill = (r) => {
    setRole(r);
    if (r === 'admin') {
      setEmail('admin@kashvi.com');
      setPassword('Admin@2024');
    } else if (r === 'teacher') {
      setEmail('teacher@kashvi.com');
      setPassword('Teacher@123');
    } else if (r === 'student') {
      setEmail('student@kashvi.com');
      setPassword('Student@123');
    } else if (r === 'parent') {
      setEmail('parent@kashvi.com');
      setPassword('Parent@123');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await login(email, password, role);
    setLoading(false);

    if (res?.requires2FA) {
      setIs2FA(true);
      setPendingUserId(res.userId);
      toast('2FA Required: Enter your authentication code', { icon: '🔐' });
      return;
    }

    if (res?.success) {
      navigate(`/dashboard/${res.user.role}`);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await verify2FA(pendingUserId, otpCode);
    setLoading(false);

    if (res?.success) {
      navigate(`/dashboard/${res.user.role}`);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030712] p-6 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background ambient glowing mesh & orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl filter" />
      <div className="pointer-events-none absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl filter" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-cyan-600/15 blur-3xl filter" />

      {/* Subtle grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
          backgroundSize: '28px 28px'
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Top Header / Language Switcher */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-white"
          >
            <span className="transition group-hover:-translate-x-0.5">←</span>
            <span>{t('Public Home')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <LanguageSelector compact />
          </div>
        </div>

        {/* Card Container */}
        <div className="relative rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-indigo-950/60 backdrop-blur-2xl">
          {/* Top glowing bar */}
          <div className="absolute inset-x-8 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

          {/* Header */}
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/30">
              <Sparkles className="h-7 w-7 text-white" />
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-40 blur-sm -z-10" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Kashvi <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">SmartClass</span>
            </h2>
            <p className="mt-1.5 text-xs font-medium text-slate-400">
              {t('Institutional School & Academic Management')}
            </p>
          </div>

          {/* Demo Role Selector Tabs */}
          <div className="mb-6 grid grid-cols-4 gap-1.5 rounded-2xl border border-slate-800 bg-slate-950/80 p-1.5 shadow-inner">
            {['admin', 'teacher', 'student', 'parent'].map((r) => {
              const active = role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => quickFill(r)}
                  className={`relative rounded-xl py-2 text-xs font-bold capitalize transition-all ${
                    active
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  {t(r)}
                </button>
              );
            })}
          </div>

          {is2FA ? (
            /* 2FA Verification Form */
            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-center">
                <KeyRound className="mx-auto mb-2 h-7 w-7 text-indigo-400" />
                <p className="text-xs font-bold text-indigo-300">{t('Two-Factor Authentication')}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{t('Enter your 6-digit verification code')}</p>
              </div>

              <div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder={t('Enter 6-digit OTP')}
                  className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/90 px-4 py-3.5 text-center text-xl font-mono tracking-widest text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition hover:from-indigo-500 hover:to-indigo-400 hover:shadow-indigo-500/40 disabled:opacity-50"
              >
                <span>{loading ? t('Verifying...') : t('Verify & Continue')}</span>
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>
            </form>
          ) : (
            /* Primary Login Form */
            <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  {t('Institutional Email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="name@kashvi.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  {t('Password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/40 disabled:opacity-50"
              >
                <span>{loading ? t('Authenticating...') : t('Enter {{role}} Dashboard', { role: t(role) })}</span>
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  {t('RBAC Verified')}
                </span>
                <Link to="/forgot-password" className="font-semibold text-indigo-400 hover:text-indigo-300 transition">
                  {t('Forgot password?')}
                </Link>
              </div>
            </form>
          )}

          <div className="mt-6 border-t border-slate-800/80 pt-4 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <Shield className="h-3 w-3 text-indigo-400" />
              {t('Kashvi SmartClass Security Protected • JWT Encrypted')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
