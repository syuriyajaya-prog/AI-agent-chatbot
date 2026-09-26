'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/toast';
import {
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Loader2,
  Mail,
  Lock,
  User,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  // Active view: 'signin' | 'signup' | 'forgot'
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'HR User' | 'Administrator'>('HR User');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [demoCodeHelper, setDemoCodeHelper] = useState('');

  // Loading & Alert State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both your work email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      toastSuccess('Welcome to HireSense', 'Authentication successful.');
      router.push('/dashboard');
    } else {
      setErrorMessage(res.error || 'Invalid credentials. Please verify and try again.');
      toastError('Login Failed', res.error || 'Please check your email and password');
    }
  };

  // 2. Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword) {
      setErrorMessage('All fields are required to create an account.');
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          role: signupRole,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        toastSuccess('Account Created', 'Welcome to HireSense! Your workspace is ready.');
        router.push('/dashboard');
      } else {
        setErrorMessage(data.error || 'Failed to create account.');
        toastError('Registration Error', data.error);
      }
    } catch (err) {
      setLoading(false);
      setErrorMessage('Network connection error during sign up.');
    }
  };

  // 3. Handle Forgot Password
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setErrorMessage('Please provide your registered work email.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', email: forgotEmail }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        setForgotStep(2);
        setDemoCodeHelper(data.demoCode || '849201');
        setResetCode(data.demoCode || '');
        setSuccessMessage('A 6-digit verification code has been dispatched to your email.');
        toastSuccess('Code Dispatched', 'Check your email for the password verification code.');
      } else {
        setErrorMessage(data.error || 'Failed to request reset code.');
      }
    } catch {
      setLoading(false);
      setErrorMessage('Network connection error.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode || !newPassword) {
      setErrorMessage('Please enter the verification code and your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          email: forgotEmail,
          code: resetCode,
          newPassword,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        toastSuccess('Password Reset', 'Your password has been updated. Please sign in.');
        setEmail(forgotEmail);
        setPassword(newPassword);
        setActiveTab('signin');
        setForgotStep(1);
        setSuccessMessage('Password reset complete. You may now sign in.');
      } else {
        setErrorMessage(data.error || 'Failed to reset password.');
      }
    } catch {
      setLoading(false);
      setErrorMessage('Network error occurred during password reset.');
    }
  };

  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setActiveTab('signin');
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0B0F19] flex items-center justify-center text-white shadow-sm font-bold text-lg">
            H
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-[#0F172A]">HireSense</span>
            <span className="ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-200">
              Enterprise v1.0
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-medium">AI Screening Engine Online</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md w-full mx-auto my-auto">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-7 sm:p-9 shadow-sm">
          {/* Tab Selector: Sign In / Create Account */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl mb-7">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
              {activeTab === 'signin' && 'Sign in with Email'}
              {activeTab === 'signup' && 'Create your HireSense Account'}
              {activeTab === 'forgot' && 'Reset Your Password'}
            </h1>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              {activeTab === 'signin' && 'Access candidate screening pipelines, rankings, and AI match insights.'}
              {activeTab === 'signup' && 'Register your work email to start screening and ranking candidate resumes.'}
              {activeTab === 'forgot' && 'Enter your registered work email to receive a password reset code.'}
            </p>
          </div>

          {/* Status Banners */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-slide-up">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2 animate-slide-up">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    id="login-email-input"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('forgot');
                      setForgotEmail(email);
                      setErrorMessage('');
                    }}
                    className="text-xs text-[#4F46E5] hover:underline font-semibold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    id="login-password-input"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="login-submit-button"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-70 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Platform</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. SIGN UP FORM (CREATE ACCOUNT) */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Sarah Miller"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="sarah@company.com"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  Set Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  Platform Role
                </label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] cursor-pointer"
                >
                  <option value="HR User">HR Recruiter (Screen Resumes & View Rankings)</option>
                  <option value="Administrator">Administrator (Manage Users & System Logs)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-70 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FLOW */}
          {activeTab === 'forgot' && (
            <div className="space-y-4">
              {forgotStep === 1 ? (
                <form onSubmit={handleRequestCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Your Registered Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-70 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending code...</span>
                      </>
                    ) : (
                      <span>Send 6-Digit Verification Code</span>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('signin')}
                      className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                    >
                      &larr; Back to Sign In
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      6-Digit Verification Code
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="849201"
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs font-mono font-bold tracking-widest bg-slate-50 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
                      />
                    </div>
                    {demoCodeHelper && (
                      <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                        Demo verification code auto-filled: {demoCodeHelper}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-70 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating password...</span>
                      </>
                    ) : (
                      <span>Save New Password & Sign In</span>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                    >
                      &larr; Resend or change email
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Quick Demo Credentials */}
          <div className="mt-7 pt-5 border-t border-[#E2E8F0]">
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2.5">
              Quick One-Click Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="demo-admin-button"
                onClick={() => fillCredentials('admin@hiresense.ai', 'Admin@2026')}
                className="flex items-center gap-2 p-2 rounded-lg border border-[#E2E8F0] hover:border-[#4F46E5] hover:bg-indigo-50/50 text-left transition-all group cursor-pointer"
              >
                <div className="w-6 h-6 rounded bg-[#0B0F19] text-white flex items-center justify-center flex-shrink-0 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#4F46E5] truncate">
                    Admin
                  </div>
                  <div className="text-[10px] text-[#64748B] truncate">Full Access</div>
                </div>
              </button>

              <button
                type="button"
                id="demo-hr-button"
                onClick={() => fillCredentials('hr@hiresense.ai', 'HRUser@2026')}
                className="flex items-center gap-2 p-2 rounded-lg border border-[#E2E8F0] hover:border-[#4F46E5] hover:bg-indigo-50/50 text-left transition-all group cursor-pointer"
              >
                <div className="w-6 h-6 rounded bg-indigo-100 text-[#4F46E5] flex items-center justify-center flex-shrink-0 text-xs">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#4F46E5] truncate">
                    HR Recruiter
                  </div>
                  <div className="text-[10px] text-[#64748B] truncate">Screening</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Commercial Footer */}
      <footer className="max-w-md mx-auto w-full text-center py-3 text-xs text-[#94A3B8]">
        <p>&copy; HireSense AI &bull; Enterprise Resume Screening & Candidate Ranking System</p>
      </footer>
    </div>
  );
}
