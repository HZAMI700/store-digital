'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Key,
  Shield,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const adminNav = [
    { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Orders & Inquiries', href: '/admin/orders', icon: ClipboardList },
    { name: 'Inventory Vault', href: '/admin/inventory', icon: Key },
  ];

  return (
    <div className="min-h-screen bg-dark-950 pb-16">
      {/* Admin Subheader Navigation */}
      <div className="border-b border-slate-800 bg-dark-900/90 backdrop-blur sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs tracking-wider uppercase">
              <Shield className="w-4 h-4" />
              <span>Admin Management</span>
            </div>

            <nav className="flex items-center gap-1">
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
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      isActive
                        ? 'bg-indigo-600 text-white shadow-glow-purple'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-dark-850'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-850 border border-slate-700/60"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Customer Storefront</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">{children}</div>
    </div>
  );
}
