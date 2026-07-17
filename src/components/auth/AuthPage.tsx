import React, { useState } from 'react';
import { Eye, EyeOff, Lock, UserPlus } from 'lucide-react';
import BetzLogo from '../brand/BetzLogo';
import Alert from '../ui/Alert';
import Spinner from '../ui/Spinner';
import TextInput from '../ui/TextInput';

interface AuthPageProps {
  onLogin: (form: { usernameOrEmail: string; password: string }) => Promise<void>;
  onRegister: (form: { username: string; email: string; password: string }) => Promise<void>;
}

export default function AuthPage({ onLogin, onRegister }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [signInErrors, setSignInErrors] = useState<{ usernameOrEmail?: string; password?: string }>({});
  const [signUpErrors, setSignUpErrors] = useState<{ username?: string; email?: string; password?: string; confirmPassword?: string }>({});

  const [signInForm, setSignInForm] = useState({
    usernameOrEmail: '',
    password: '',
  });

  const [signUpForm, setSignUpForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const validateSignIn = () => {
    const nextErrors: { usernameOrEmail?: string; password?: string } = {};
    if (!signInForm.usernameOrEmail.trim()) nextErrors.usernameOrEmail = 'Enter your username or email.';
    if (!signInForm.password) nextErrors.password = 'Enter your password.';
    setSignInErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateSignUp = () => {
    const nextErrors: { username?: string; email?: string; password?: string; confirmPassword?: string } = {};
    if (!signUpForm.username.trim()) nextErrors.username = 'Choose a username.';
    else if (signUpForm.username.trim().length < 3) nextErrors.username = 'Username must be at least 3 characters.';

    if (!signUpForm.email.trim()) nextErrors.email = 'Enter your email address.';
    else if (!signUpForm.email.includes('@')) nextErrors.email = 'Please enter a valid email address.';

    if (!signUpForm.password) nextErrors.password = 'Create a password.';
    else if (signUpForm.password.length < 6) nextErrors.password = 'Password must be at least 6 characters.';

    if (!signUpForm.confirmPassword) nextErrors.confirmPassword = 'Confirm your password.';
    else if (signUpForm.password !== signUpForm.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';

    setSignUpErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignIn()) {
      setErrorMsg('Please fix the highlighted fields.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      await onLogin({
        usernameOrEmail: signInForm.usernameOrEmail.trim(),
        password: signInForm.password,
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Login failed. Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!validateSignUp()) {
      setErrorMsg('Please fix the highlighted fields.');
      return;
    }

    setLoading(true);
    try {
      await onRegister({
        username: signUpForm.username.trim().toLowerCase(),
        email: signUpForm.email.trim().toLowerCase(),
        password: signUpForm.password,
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Registration failed. Username or email may already be taken.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm placeholder-slate-400 transition-all';

  return (
    <div className="w-full max-w-sm mx-auto">

      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="p-3 bg-slate-900 rounded-2xl shadow-lg">
          <BetzLogo className="w-6 h-6 text-teal-400" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black text-white tracking-tight">BETZ</h1>
          <p className="text-xs text-slate-400 mt-1">Gamified Social Challenge App</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-xl p-8">

        {/* Tabs */}
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 mb-6">
          <button
            onClick={() => { setActiveTab('signin'); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('signup'); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Sign In Form */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-4">
            <TextInput
              label="Username or Email"
              type="text"
              placeholder="e.g. yannick"
              value={signInForm.usernameOrEmail}
              onChange={e => {
                setSignInForm({ ...signInForm, usernameOrEmail: e.target.value });
                setSignInErrors((prev) => ({ ...prev, usernameOrEmail: undefined }));
              }}
              required
            />
            {signInErrors.usernameOrEmail && <p className="text-xs text-rose-500 mt-1">{signInErrors.usernameOrEmail}</p>}

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`${inputClass} pr-10`}
                  placeholder="Enter your password"
                  value={signInForm.password}
                  onChange={e => {
                    setSignInForm({ ...signInForm, password: e.target.value });
                    setSignInErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {signInErrors.password && <p className="text-xs text-rose-500 mt-1">{signInErrors.password}</p>}
            </div>

            {errorMsg && <Alert type="error" message={errorMsg} />}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-55 text-white rounded-xl py-2.5 text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? <Spinner /> : <><Lock className="w-4 h-4" /> Sign In</>}
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-4">
            <TextInput
              label="Username"
              type="text"
              placeholder="e.g. ryan_adams"
              value={signUpForm.username}
              onChange={e => {
                setSignUpForm({ ...signUpForm, username: e.target.value });
                setSignUpErrors((prev) => ({ ...prev, username: undefined }));
              }}
              required
            />
            {signUpErrors.username && <p className="text-xs text-rose-500 mt-1">{signUpErrors.username}</p>}

            <TextInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={signUpForm.email}
              onChange={e => {
                setSignUpForm({ ...signUpForm, email: e.target.value });
                setSignUpErrors((prev) => ({ ...prev, email: undefined }));
              }}
              required
            />
            {signUpErrors.email && <p className="text-xs text-rose-500 mt-1">{signUpErrors.email}</p>}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <TextInput
                  label="Password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={signUpForm.password}
                  onChange={e => {
                    setSignUpForm({ ...signUpForm, password: e.target.value });
                    setSignUpErrors((prev) => ({ ...prev, password: undefined, confirmPassword: undefined }));
                  }}
                  required
                />
                {signUpErrors.password && <p className="text-xs text-rose-500 mt-1">{signUpErrors.password}</p>}
              </div>
              <div>
                <TextInput
                  label="Confirm"
                  type="password"
                  placeholder="Repeat password"
                  value={signUpForm.confirmPassword}
                  onChange={e => {
                    setSignUpForm({ ...signUpForm, confirmPassword: e.target.value });
                    setSignUpErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  required
                />
                {signUpErrors.confirmPassword && <p className="text-xs text-rose-500 mt-1">{signUpErrors.confirmPassword}</p>}
              </div>
            </div>

            {errorMsg && <Alert type="error" message={errorMsg} />}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-55 text-white rounded-xl py-2.5 text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? <Spinner /> : <><UserPlus className="w-4 h-4" /> Create Account</>}
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
