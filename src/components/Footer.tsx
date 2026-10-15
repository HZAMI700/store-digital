import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ShieldCheck, MessageSquare, Mail, RefreshCw, Lock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-dark-950 mt-20">
      {/* Guarantees Grid */}
      <div className="border-b border-slate-850 bg-dark-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Direct Human Contact</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Connect directly with store admins via WhatsApp or Email. No bots or generic forms.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Zero Risk Ordering</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                You never enter credit cards online. Pay only after speaking to admin and confirming order.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Warranty Guarantee</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                All accounts backed by our replacement guarantee for the full duration of your subscription.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Single-Use Inventory</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Never shared or re-sold. Each credential is dedicated and locked to one authorized customer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Links & Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-black text-sm">
                A
              </div>
              <span className="text-sm font-extrabold text-white">APEX DIGITAL STORE</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Premium digital accounts, subscriptions, and licenses facilitator.
              Operating strictly on a manual order and direct customer contact workflow for utmost customer security and transparency.
            </p>
            <div className="text-[11px] text-slate-500 pt-2">
              Inspired by premium dark aesthetics • Built with Next.js & Supabase
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Customer Support</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/track-order" className="hover:text-sky-400 transition-colors">
                  Track Existing Order
                </Link>
              </li>
              <li>
                <Link href="/my-orders" className="hover:text-sky-400 transition-colors">
                  My Orders History
                </Link>
              </li>
              <li>
                <span className="text-slate-500">WhatsApp Admin: +216 29 482 109</span>
              </li>
              <li>
                <span className="text-slate-500">Email: support@apexaccounts.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Administration</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/admin" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <span>Admin Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/orders" className="hover:text-indigo-400 transition-colors">
                  Manage Orders & Inquiries
                </Link>
              </li>
              <li>
                <Link href="/admin/inventory" className="hover:text-indigo-400 transition-colors">
                  Inventory & Accounts Vault
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
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
