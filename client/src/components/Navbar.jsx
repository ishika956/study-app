import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, Sun, Moon, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  // Initialize theme status
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') || 
                   localStorage.getItem('theme') === 'dark';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <nav className="glass sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/20 dark:shadow-brand-500/10">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-brand-500 to-indigo-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400">
              Study App
            </span>
          </div>

          {/* User profile & controls */}
          <div className="flex items-center gap-4">
            {/* User identity badge (desktop only) */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 py-1.5 px-3.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <User className="h-3.5 w-3.5 text-brand-500" />
                <span className="truncate max-w-[150px]">{user.email}</span>
              </div>
            )}

            {/* Dark Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm hover:scale-105 active:scale-95 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 transition-all duration-200 cursor-pointer"
              title="Toggle Theme"
              type="button"
            >
              {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5 text-slate-600" />}
            </button>

            {/* Logout Trigger */}
            <button
              onClick={logout}
              className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-3 text-xs font-bold text-rose-600 shadow-sm hover:bg-rose-500 hover:text-white hover:border-transparent hover:scale-102 active:scale-98 dark:border-rose-950 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-900 dark:hover:text-white transition-all duration-200 cursor-pointer"
              title="Logout"
              type="button"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
