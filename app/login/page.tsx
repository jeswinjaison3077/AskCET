'use client';

import { useState, useEffect, Suspense, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import BorderGlow from '@/components/animations/BorderGlow';
import { Lock, Mail, User as UserIcon, ShieldCheck, ArrowRight, Loader2, GraduationCap } from 'lucide-react';
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
  const [googleLoading, setGoogleLoading] = useState(false);
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

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || 'CET Student',
          email: email || 'student@cet.ac.in',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google Sign-In failed');

      router.push('/chat');
      router.refresh();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Google authentication failed.';
      setError(errorMsg);
    } finally {
      setGoogleLoading(false);
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

          {/* Header without diamond icon */}
          <div className="text-center mb-6">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3.5 shadow-xl shadow-cyan-500/30 border border-cyan-400/40">
              <GraduationCap className="w-7 h-7 text-cyan-200" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {isSignUp ? 'Create AskCET Account' : 'Sign in to AskCET'}
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 font-medium leading-relaxed">
              {isSignUp ? 'Join College of Engineering Trivandrum Knowledge Portal' : 'Enter your student or admin credentials to continue'}
            </p>
          </div>

          {/* Google Sign-In / Sign-Up Button */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={googleLoading}
              className="w-full py-3 px-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white text-xs font-black flex items-center justify-center gap-3 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isSignUp ? 'Sign Up with Google' : 'Continue with Google'}</span>
                </>
              )}
            </button>

            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-[#080d1a] px-3 text-[10px] uppercase font-bold text-slate-400 absolute">or email</span>
            </div>
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
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
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

      <main className="flex-1 flex items-center justify-center p-4 relative py-12">
        <Suspense fallback={<Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />}>
          <AuthForm />
        </Suspense>
      </main>
    </div>
  );
}
