'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Key,
  Shield,
  ArrowRight,
  LogOut,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminAuthGuard, useAdminAuth } from '@/components/AdminAuthGuard';

function AdminNavContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, adminUser } = useAdminAuth();

  const adminNav = [
    { name: 'نظرة عامة', href: '/admin', icon: LayoutDashboard },
    { name: 'إدارة الطلبات', href: '/admin/orders', icon: ClipboardList },
    { name: 'بنك الحسابات والمخزون', href: '/admin/inventory', icon: Key },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 selection:bg-[#5e17eb] selection:text-white" dir="rtl">
      {/* Top Admin Bar */}
      <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Right Section: Brand & Nav Tabs */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5e17eb] to-[#843dff] flex items-center justify-center text-white shadow-md shadow-purple-500/25">
                <Shield className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <div className="font-black text-sm text-slate-900 leading-tight flex items-center gap-1.5">
                  <span>لوحة تحكم</span>
                  <span className="text-[#5e17eb]">يوكس Y7X</span>
                </div>
                <div className="text-[10px] text-slate-400 font-semibold">إدارة المتجر ومعالجة الطلبات</div>
              </div>
            </Link>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 sm:gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
              {adminNav.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                      isActive
                        ? 'bg-white text-[#5e17eb] shadow-sm border border-slate-200/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Left Section: User Status, Storefront link, Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Badge */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-purple-50 border border-purple-200/80 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-500 text-[11px]">المسؤول:</span>
              <span className="font-mono font-bold text-[#5e17eb]">{adminUser || 'yassine700'}</span>
            </div>

            {/* View Storefront */}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-xs font-bold text-slate-700 transition"
              title="معاينة المتجر"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">واجهة المتجر</span>
            </Link>

            {/* Logout Button */}
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 transition"
              title="تسجيل الخروج من لوحة التحكم"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Admin Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <AdminNavContent>{children}</AdminNavContent>
    </AdminAuthGuard>
  );
}
