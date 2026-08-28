import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Chrome, KeyRound, Mail, Package, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

type AuthMode = 'sign-in' | 'sign-up';

const MIN_PASSWORD_LENGTH = 6;

function messageFor(errorMessage: string) {
  const message = errorMessage.toLowerCase();
  if (message.includes('invalid login credentials')) return 'Invalid email or password.';
  if (message.includes('already registered') || message.includes('already been registered')) {
    return 'This email is already registered. Try signing in instead.';
  }
  return errorMessage;
}

export function LoginScreen() {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const clearFeedback = () => {
    setError('');
    setNotice('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearFeedback();

    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (mode === 'sign-up' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const credentials = { email: email.trim(), password };
    const { data, error: authError } = mode === 'sign-in'
      ? await supabase.auth.signInWithPassword(credentials)
      : await supabase.auth.signUp({
          ...credentials,
          options: { emailRedirectTo: window.location.origin },
        });
    setSubmitting(false);

    if (authError) {
      setError(messageFor(authError.message));
      return;
    }
    if (mode === 'sign-up' && !data.session) {
      setNotice('Account created. Check your email to confirm the account, then sign in.');
    }
  };

  const handleGoogleSignIn = async () => {
    clearFeedback();
    setSubmitting(true);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    setSubmitting(false);
    if (authError) setError(messageFor(authError.message));
  };

  const handlePasswordReset = async () => {
    clearFeedback();
    if (!email.trim()) {
      setError('Enter your email first, then request a password reset.');
      return;
    }
    setSubmitting(true);
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    setSubmitting(false);
    if (authError) {
      setError(messageFor(authError.message));
      return;
    }
    setNotice('If that account exists, a password-reset email has been sent.');
  };

  const switchMode = () => {
    setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
    setConfirmPassword('');
    clearFeedback();
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">StockFlow</h1>
            <p className="text-sm text-slate-500">Sign in to your workspace</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <Chrome className="w-4 h-4" />
          Sign in with Google
        </button>

        <div className="flex items-center gap-3 my-6 text-xs text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          <span>or continue with email</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <div className="relative mt-1">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" minLength={MIN_PASSWORD_LENGTH} autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
          </label>
          {mode === 'sign-up' && (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Confirm password</span>
              <input className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
            </label>
          )}
          {mode === 'sign-in' && (
            <button type="button" onClick={handlePasswordReset} disabled={submitting} className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-60">
              Forgot password?
            </button>
          )}
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {notice && <p className="rounded-lg bg-green-100 px-3 py-2 text-sm text-green-700">{notice}</p>}
          <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
            {mode === 'sign-in' ? <KeyRound className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {submitting ? 'Please wait...' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {mode === 'sign-in' ? 'New to StockFlow?' : 'Already have an account?'}{' '}
          <button type="button" onClick={switchMode} className="font-semibold text-blue-600 hover:text-blue-700">
            {mode === 'sign-in' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </motion.section>
    </main>
  );
}

