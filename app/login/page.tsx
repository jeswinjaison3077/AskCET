'use client';

import { useState, useEffect, Suspense, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import { Sparkles, Lock, Mail, User as UserIcon, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'ADMIN'>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsSignUp(mode === 'signup');
  }, [mode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
    const body = isSignUp ? { name, email, password, role } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      if (data.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/chat');
      }
      router.refresh();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error processing request.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fillAdminDemo = () => {
    setIsSignUp(false);
    setEmail('admin@college.edu');
    setPassword('admin123');
  };

  const fillStudentDemo = () => {
    setIsSignUp(false);
    setEmail('student@college.edu');
    setPassword('student123');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md bg-white dark:bg-slate-900/90 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors duration-300"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {isSignUp ? 'Create AskCET Account' : 'Sign in to AskCET'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          {isSignUp ? 'Join the college RAG knowledge platform' : 'Enter your student or admin credentials to continue'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs text-center font-semibold">
          {error}
        </div>
      )}

      {/* Quick Judge 1-Click Fill Buttons */}
      {!isSignUp && (
        <div className="mb-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={fillAdminDemo}
            className="py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>Judge / Admin Demo</span>
          </button>
          <button
            type="button"
            onClick={fillStudentDemo}
            className="py-2 px-3 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 border border-cyan-200 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <UserIcon className="w-3.5 h-3.5 text-cyan-500" />
            <span>Student Demo</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-semibold"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@college.edu"
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-semibold"
            />
          </div>
        </div>

        {isSignUp && (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Account Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                  role === 'STUDENT'
                    ? 'bg-cyan-50 dark:bg-cyan-500/20 border-cyan-500 text-cyan-700 dark:text-cyan-300 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" /> Student
              </button>
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                  role === 'ADMIN'
                    ? 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Admin
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.01]"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Toggle Auth Mode */}
      <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
        {isSignUp ? (
          <>
            Already have an account?{' '}
            <button onClick={() => setIsSignUp(false)} className="text-cyan-600 dark:text-cyan-400 font-extrabold hover:underline">
              Sign In
            </button>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <button onClick={() => setIsSignUp(true)} className="text-cyan-600 dark:text-cyan-400 font-extrabold hover:underline">
              Sign Up
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 dark:bg-[#070a12] transition-colors duration-300">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-cyan-500" />}>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}
