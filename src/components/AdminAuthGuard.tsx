'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { Shield, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  adminUser: string | null;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAuthenticated: false,
  adminUser: null,
  logout: () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

const ADMIN_STORAGE_KEY = 'y7x_admin_session_auth_v2';
const VALID_USERNAME = 'yassine700';
const VALID_PASSWORD = 'yassine700';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const session = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed?.username === VALID_USERNAME && parsed?.token) {
          setIsAuthenticated(true);
        }
      }
    } catch {
      // Ignored
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      if (username.trim() === VALID_USERNAME && password === VALID_PASSWORD) {
        const sessionData = {
          username: VALID_USERNAME,
          token: 'token_' + Date.now(),
          loginTime: new Date().toISOString(),
        };
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(sessionData));
        setIsAuthenticated(true);
        setError(null);
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التأكد والمحاولة مجدداً.');
      }
      setIsLoading(false);
    }, 400);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch {}
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-[#5e17eb] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-bold">جاري التحقق من صلاحيات الدخول...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50/70 flex items-center justify-center p-4 sm:p-6" dir="rtl">
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header & Logo */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-[#5e17eb] to-[#843dff] text-white shadow-lg shadow-purple-500/20 mb-2">
              <Shield className="w-8 h-8" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-purple-100 text-[#5e17eb] font-bold">
                Y7X STORE ADMIN
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">تسجيل دخول الإدارة</h1>
            <p className="text-xs text-slate-500 font-medium">
              لوحة التحكم الخاصة بمدير المتجر لمعالجة طلبات العملاء وإدارة المخزون
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5 animate-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم المستخدم (Username)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yassine700"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb]/20 text-slate-900 text-xs font-medium outline-none transition"
                  dir="ltr"
                  autoComplete="username"
                  autoFocus
                />
                <User className="w-4 h-4 text-slate-400 absolute top-3 right-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                كلمة المرور (Password)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full px-4 py-2.5 pr-10 pl-10 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb]/20 text-slate-900 text-xs font-medium outline-none transition"
                  dir="ltr"
                  autoComplete="current-password"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute top-3 right-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-2.5 left-3 text-slate-400 hover:text-slate-600 p-1"
                  aria-label="إظهار كلمة المرور"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#5e17eb] hover:bg-[#4f0ecf] active:scale-[0.99] text-white font-black text-xs shadow-lg shadow-purple-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>دخول لوحة التحكم</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Notice */}
          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-[11px] text-purple-900 flex items-center justify-center gap-2 text-center">
            <span className="font-semibold">صلاحية الدخول مخصصة فقط لمشرف المتجر:</span>
            <code className="bg-white px-1.5 py-0.5 rounded border border-purple-200 font-mono font-bold text-[#5e17eb]">
              yassine700
            </code>
          </div>

          {/* Return to storefront */}
          <div className="text-center pt-2 border-t border-slate-100">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#5e17eb] transition"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة لمتجر يوكس الرئيسي</span>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        adminUser: VALID_USERNAME,
        logout: handleLogout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}
