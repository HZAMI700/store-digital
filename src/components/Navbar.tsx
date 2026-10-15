'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  ShieldCheck,
  Search,
  User,
  Shield,
  Menu,
  X,
  ExternalLink,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnnouncementBanner } from './AnnouncementBanner';

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Products Catalog', href: '/' },
    { name: 'Track Order', href: '/track-order' },
    { name: 'My Orders', href: '/my-orders' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-border shadow-subtle">
      {/* 21st-style Announcement Ticker */}
      <AnnouncementBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-subtle group-hover:scale-105 transition-all">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-content-primary flex items-center gap-1.5">
              <span>APEX</span>
              <span className="text-primary-500">DIGITAL</span>
            </div>
            <div className="text-[10px] text-content-secondary font-semibold tracking-wide uppercase">
              Verified Digital Store
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-secondary p-1 rounded-xl border border-border">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-white text-primary-600 shadow-subtle border border-border font-bold'
                    : 'text-content-secondary hover:text-content-primary hover:bg-white/70'
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons & Admin Toggle */}
        <div className="flex items-center gap-3">
          {/* Admin Dashboard Quick Access Button */}
          <Link
            href="/admin"
            className={cn(
              'hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border',
              pathname.startsWith('/admin')
                ? 'bg-primary-500 text-white border-primary-600 shadow-sm'
                : 'bg-surface-secondary hover:bg-white text-primary-600 hover:text-primary-700 border-border hover:border-primary-200 shadow-subtle'
            )}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </Link>

          {/* Customer Profile Icon */}
          <Link
            href="/my-orders"
            className="p-2 rounded-xl bg-surface-secondary border border-border text-content-secondary hover:text-content-primary hover:bg-white hover:border-border-strong transition-all shadow-subtle"
            title="My Orders & Profile"
          >
            <User className="w-4 h-4" />
          </Link>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-surface-secondary border border-border text-content-secondary hover:text-content-primary"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-white px-4 py-4 space-y-2 animate-in slide-in-from-top duration-150 shadow-dropdown">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                pathname === link.href
                  ? 'bg-primary-50 text-primary-600 border border-primary-200'
                  : 'text-content-secondary hover:bg-surface-secondary'
              )}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold bg-primary-50 border border-primary-200 text-primary-700 hover:bg-primary-100"
          >
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary-500" />
              <span>Admin Management Portal</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </Link>
        </div>
      )}
    </header>
  );
};
