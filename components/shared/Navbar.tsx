'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MessageSquare, Shield, LogOut, Sun, Moon, HelpCircle } from 'lucide-react';
import { useTheme } from '@/components/shared/ThemeProvider';

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

  const handleNavClick = (href: string) => {
    if (pathname !== href) {
      router.push(href);
    }
  };

  const navLinks = [
    { href: '/chat', label: 'AI Assistant', icon: MessageSquare },
    { href: '/faq', label: 'Campus FAQs', icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Logo & Name */}
          <Link href="/chat" onClick={() => handleNavClick('/chat')} className="flex items-center gap-2.5 group">
            <img
              src="/logo.jpg"
              alt="AskCET Logo"
              className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-800 group-hover:opacity-90 transition-opacity"
            />
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                AskCET
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                AI Portal
              </span>
            </div>
          </Link>

          {/* Minimalist Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => handleNavClick(link.href)}
                  className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}

            {user?.role === 'ADMIN' && (
              <button
                type="button"
                onClick={() => handleNavClick('/admin')}
                className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  pathname === '/admin'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-900/50'
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span>Admin Portal</span>
              </button>
            )}
          </nav>

          {/* User & Theme Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleNavClick('/login')}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
