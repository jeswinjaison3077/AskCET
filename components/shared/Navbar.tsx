'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MessageSquare, Shield, LogOut, Sun, Moon, HelpCircle } from 'lucide-react';
import { useTheme } from '@/components/shared/ThemeProvider';
import { motion } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navLinks = [
    { href: '/chat', label: 'AI Assistant', icon: MessageSquare },
    { href: '/faq', label: 'Campus FAQs', icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/75 dark:bg-[#060810]/80 backdrop-blur-2xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo with Glowing Squircle Frame */}
          <Link href="/chat" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 blur-md group-hover:bg-cyan-500/40 transition-all duration-300" />
              <img
                src="/logo.jpg"
                alt="AskCET Logo"
                className="relative w-10 h-10 rounded-2xl object-cover shadow-lg shadow-cyan-500/25 border border-white/40 dark:border-slate-700/80 group-hover:scale-105 group-hover:rotate-2 transition-all duration-300"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#060810] shadow-xs" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                Ask<span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">CET</span>
              </span>
              <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 -mt-1 tracking-widest uppercase">
                COLLEGE AI RAG
              </span>
            </div>
          </Link>

          {/* iOS Floating Navigation Bar */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-inner text-xs font-bold">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 font-extrabold shadow-sm border border-slate-200/80 dark:border-slate-700/80'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-500' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className={`px-4 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                  pathname === '/admin'
                    ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 font-extrabold shadow-sm border border-amber-200/80 dark:border-amber-700/80'
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-500/10'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-500" />
                <span>Admin Portal</span>
              </Link>
            )}
          </nav>

          {/* User Status & Controls */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-xs backdrop-blur-md"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </motion.button>

            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{user.role}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="p-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shadow-xs"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all duration-300"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
