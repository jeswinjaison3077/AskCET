'use client';

import { useState, useEffect, Suspense, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import BorderGlow from '@/components/animations/BorderGlow';
import SpecularButton from '@/components/animations/SpecularButton';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md relative z-10"
    >
      <BorderGlow
        edgeSensitivity={30}
        glowColor="190 90 60"
        backgroundColor="rgba(8, 13, 26, 0.88)"
        borderRadius={32}
        glowRadius={35}
        glowIntensity={1.2}
        colors={['#38bdf8', '#818cf8', '#c084fc']}
        className="w-full shadow-2xl shadow-cyan-950/40"
      >
        <div className="p-8 relative overflow-hidden backdrop-blur-2xl">
          {/* Subtle Corner Ambient Gradient */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-cyan-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Header */}
          <div className="text-center mb-7">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3.5 shadow-xl shadow-cyan-500/30 border border-cyan-400/40">
              <Sparkles className="w-7 h-7 text-cyan-200 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {isSignUp ? 'Create AskCET Account' : 'Sign in to AskCET'}
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 font-medium leading-relaxed">
              {isSignUp ? 'Join the grounded college AI knowledge assistant' : 'Enter your student or admin credentials to continue'}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs text-center font-bold shadow-lg"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {isSignUp && (
              <div>
                <label className="block text-xs font-extrabold text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Johnson"
                    required
                    className="w-full bg-[#060a17] border border-cyan-500/30 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  required
                  className="w-full bg-[#060a17] border border-cyan-500/30 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#060a17] border border-cyan-500/30 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs font-extrabold text-slate-300 mb-1.5">Account Role</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole('STUDENT')}
                    className={`py-2.5 rounded-2xl text-xs font-extrabold border flex items-center justify-center gap-1.5 transition-all ${
                      role === 'STUDENT'
                        ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10'
                        : 'bg-[#060a17] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5 text-cyan-400" /> Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={`py-2.5 rounded-2xl text-xs font-extrabold border flex items-center justify-center gap-1.5 transition-all ${
                      role === 'ADMIN'
                        ? 'bg-indigo-500/25 border-indigo-400 text-indigo-200 shadow-md shadow-indigo-500/10'
                        : 'bg-[#060a17] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Admin
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2">
              <SpecularButton
                radius={20}
                lineColor="#38bdf8"
                baseColor="#0284c7"
                intensity={1.2}
                onClick={() => {}}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </SpecularButton>
            </div>
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center text-xs text-slate-300 font-medium">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button onClick={() => setIsSignUp(false)} className="text-cyan-400 font-extrabold hover:underline">
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button onClick={() => setIsSignUp(true)} className="text-cyan-400 font-extrabold hover:underline">
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 bg-[#040711] p-3.5 rounded-2xl border border-slate-800/60 leading-relaxed text-left">
            <p className="font-extrabold text-slate-200 mb-1">Demo Credentials:</p>
            <div>Student: <code className="text-cyan-300 font-extrabold">student@college.edu</code> / <code className="text-cyan-300 font-extrabold">student123</code></div>
            <div>Admin: <code className="text-indigo-300 font-extrabold">admin@college.edu</code> / <code className="text-indigo-300 font-extrabold">admin123</code></div>
          </div>
        </div>
      </BorderGlow>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#060810] relative overflow-hidden">
      <Navbar />

      {/* Ambient Backdrop Spotlights matching site theme */}
      <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-cyan-400" />}>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}
