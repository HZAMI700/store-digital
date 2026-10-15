'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ShieldCheck, MessageSquare, Mail, RefreshCw, Lock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-white mt-20">
      {/* Guarantees Grid (Y7X & Nu8th inspired trust badges) */}
      <div className="border-b border-border bg-surface-secondary/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-border shadow-subtle">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-content-primary uppercase tracking-wider">Direct WhatsApp Contact</h4>
              <p className="text-xs text-content-secondary mt-1 leading-relaxed">
                Connect directly with store admins via WhatsApp or Email. No bots or generic forms.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-border shadow-subtle">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-content-primary uppercase tracking-wider">Zero Risk Ordering</h4>
              <p className="text-xs text-content-secondary mt-1 leading-relaxed">
                Never enter credit cards online. Pay only after speaking to admin and confirming order.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-border shadow-subtle">
            <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-content-primary uppercase tracking-wider">Warranty Guarantee</h4>
              <p className="text-xs text-content-secondary mt-1 leading-relaxed">
                All accounts backed by our replacement guarantee for the full duration of your subscription.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-border shadow-subtle">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-content-primary uppercase tracking-wider">Single-Use Inventory</h4>
              <p className="text-xs text-content-secondary mt-1 leading-relaxed">
                Never shared or re-sold. Each credential is dedicated and locked to one authorized customer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Links & Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-black text-sm">
                A
              </div>
              <span className="text-base font-extrabold text-content-primary">APEX DIGITAL STORE</span>
            </div>
            <p className="text-xs text-content-secondary max-w-md leading-relaxed">
              Premium digital accounts, gaming licenses, and subscription facilitator inspired by leading digital storefronts.
              Operating strictly on a manual order and direct customer contact workflow for utmost customer transparency.
            </p>
            <div className="text-[11px] text-content-muted pt-2">
              Verified Digital Accounts • Direct WhatsApp & Email Fulfillment
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-content-primary uppercase tracking-wider mb-3">Customer Support</h5>
            <ul className="space-y-2 text-xs text-content-secondary">
              <li>
                <Link href="/track-order" className="hover:text-primary-500 transition-colors">
                  Track Existing Order
                </Link>
              </li>
              <li>
                <Link href="/my-orders" className="hover:text-primary-500 transition-colors">
                  My Orders History
                </Link>
              </li>
              <li>
                <span className="text-content-secondary font-mono">WhatsApp: +216 29 482 109</span>
              </li>
              <li>
                <span className="text-content-secondary font-mono">Email: support@apexaccounts.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-content-primary uppercase tracking-wider mb-3">Administration</h5>
            <ul className="space-y-2 text-xs text-content-secondary">
              <li>
                <Link href="/admin" className="hover:text-primary-500 transition-colors flex items-center gap-1.5">
                  <span>Admin Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/orders" className="hover:text-primary-500 transition-colors">
                  Manage Orders & Inquiries
                </Link>
              </li>
              <li>
                <Link href="/admin/inventory" className="hover:text-primary-500 transition-colors">
                  Inventory Vault
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-content-muted gap-4">
          <div>© {new Date().getFullYear()} Apex Digital Accounts. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>Manual Order Fulfillment</span>
            <span>•</span>
            <span>Direct WhatsApp & Email Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
