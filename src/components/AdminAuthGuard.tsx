'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { Shield, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  adminUser: string | null;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAuthenticated: false,
  adminUser: null,
  logout: async () => {},
  checkSession: async () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Verify server session on load
  const checkSession = async () => {
    try {
      const res = await fetch(`/api/admin/me?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setAdminUser(data.username || 'Administrator');
          return;
        }
      }
      setIsAuthenticated(false);
      setAdminUser(null);
    } catch {
      setIsAuthenticated(false);
      setAdminUser(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى المحاولة مجدداً.');
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setAdminUser(data.username || username.trim());
      setError(null);
      setPassword('');
    } catch (err: any) {
      setError('حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    setIsAuthenticated(false);
    setAdminUser(null);
    setUsername('');
    setPassword('');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-200 border-t-[#0284c7] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-bold">جاري التحقق الآمن من صلاحيات الإدارة...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50/70 flex items-center justify-center p-4 sm:p-6" dir="rtl">
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header & Velto Logo */}
          <div className="text-center space-y-2">
            <div className="relative w-16 h-16 mx-auto rounded-2xl overflow-hidden shadow-lg shadow-cyan-500/20 mb-2 border border-slate-100 bg-white p-1">
              <img src="/logo.png" alt="Velto Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-sky-50 text-[#0284c7] border border-sky-200 font-black">
                VELTO STORE ADMIN
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">تسجيل دخول الإدارة</h1>
            <p className="text-xs text-slate-500 font-medium">
              منطقة آمنة ومحمية خاصة بمدير متجر فيلترو لإدارة الطلبات وتسليم الحسابات
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
                  placeholder="ادخل اسم المستخدم"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 text-slate-900 text-xs font-medium outline-none transition"
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
                  className="w-full px-4 py-2.5 pr-10 pl-10 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 text-slate-900 text-xs font-medium outline-none transition"
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
              className="w-full py-3 px-4 rounded-xl velto-gradient-btn text-white font-black text-xs shadow-lg shadow-cyan-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري التحقق والاتصال الآمن...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>دخول لوحة التحكم</span>
                </>
              )}
            </button>
          </form>

          {/* Secure System Badge (Secret, Zero plaintext credentials in frontend) */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-center gap-2 text-center">
            <Shield className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
            <span>نظام تسجيل دخول مشفر عبر خادم معتمد وحماية ضد الهجمات</span>
          </div>

          {/* Return to storefront */}
          <div className="text-center pt-2 border-t border-slate-100">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0284c7] transition"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة لمتجر فيلترو الرئيسي</span>
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
        adminUser,
        logout: handleLogout,
        checkSession,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}
