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
    <div className="min-h-screen bg-background pb-16">
      {/* Admin Subheader Navigation in Pure Light Mode */}
      <div className="border-b border-border bg-white/90 backdrop-blur sticky top-16 z-30 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-primary-600 font-extrabold text-xs tracking-wider uppercase">
              <Shield className="w-4 h-4 text-primary-500" />
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
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                      isActive
                        ? 'bg-primary-500 text-white shadow-subtle'
                        : 'text-content-secondary hover:text-content-primary hover:bg-surface-secondary'
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
              className="text-xs text-content-secondary hover:text-content-primary font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-secondary hover:bg-surface-tertiary border border-border shadow-subtle"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Customer Storefront</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">{children}</div>
    </div>
  );
}
