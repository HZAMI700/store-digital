'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    // Check if user is on admin route or has admin flag in localStorage
    if (pathname.startsWith('/admin')) {
      setIsAdminMode(true);
    }
  }, [pathname]);

  const navLinks = [
    { name: 'Products Catalog', href: '/' },
    { name: 'Track Order', href: '/track-order' },
    { name: 'My Orders', href: '/my-orders' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-dark-950/80 backdrop-blur-xl">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-sky-950/70 via-dark-900 to-indigo-950/70 border-b border-sky-500/20 px-4 py-1.5 text-center text-xs text-sky-300 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0 animate-pulse" />
        <span>
          <strong>Direct Manual Service:</strong> No online card payments. Submit your request & our admin contacts you via WhatsApp or Email.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-all">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>APEX</span>
              <span className="text-sky-400">DIGITAL</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              Premium Accounts Store
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-dark-900/60 p-1 rounded-xl border border-slate-800">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800'
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
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-glow-purple'
                : 'bg-dark-850 hover:bg-dark-800 text-indigo-400 hover:text-indigo-300 border-indigo-500/30'
            )}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </Link>

          {/* Customer Profile Icon */}
          <Link
            href="/my-orders"
            className="p-2 rounded-xl bg-dark-850 border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
            title="My Orders & Profile"
          >
            <User className="w-4 h-4" />
          </Link>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-dark-850 border border-slate-700/60 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-dark-900/95 backdrop-blur-xl px-4 py-4 space-y-2 animate-in slide-in-from-top duration-150">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                  : 'text-slate-300 hover:bg-dark-800'
              )}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-950/40 border border-indigo-800 text-indigo-300 hover:bg-indigo-900/40"
          >
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Admin Management Portal</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </Link>
        </div>
      )}
    </header>
  );
};
