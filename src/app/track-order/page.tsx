'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Order } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { OrderTimeline } from '@/components/OrderTimeline';
import { formatPrice, formatDateTime } from '@/lib/utils';
import {
  Search,
  Key,
  ShieldCheck,
  Clock,
  Check,
  Copy,
  AlertCircle,
  ShoppingBag,
  User,
  Info,
} from 'lucide-react';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  const initialEmail = searchParams.get('email') || '';

  const [orderReference, setOrderReference] = useState(initialRef);
  const [email, setEmail] = useState(initialEmail);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchOrder = async (ref: string, em: string) => {
    if (!ref.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderReference: ref.trim(),
          email: em.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to find matching order');
      }

      setOrder(data.order);
    } catch (err: any) {
      setError(err.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef && initialEmail) {
      fetchOrder(initialRef, initialEmail);
    }
  }, [initialRef, initialEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderReference, email);
  };

  const handleCopyCredentials = () => {
    if (order?.deliveredCredentials) {
      navigator.clipboard.writeText(order.deliveredCredentials);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Track Your Order
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Enter your Order Reference number and the Email used during checkout to inspect live order status and contact progress.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="p-6 rounded-3xl bg-dark-900 border border-slate-800 shadow-xl max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Order Reference Number
            </label>
            <input
              type="text"
              required
              value={orderReference}
              onChange={(e) => setOrderReference(e.target.value)}
              placeholder="e.g. ORD-20261015-8491"
              className="w-full h-11 px-4 text-xs font-mono bg-dark-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full h-11 px-4 text-xs bg-dark-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              For security, email verification is required to access your order.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-sky-500 hover:bg-sky-400 text-dark-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-950/40 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Lookup Order</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Order Result Card */}
      {order && (
        <div className="p-6 sm:p-8 rounded-3xl bg-dark-900 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs text-slate-400">Order Reference</span>
              <div className="text-xl font-mono font-black text-sky-400">
                #{order.orderReference}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Submitted on {formatDateTime(order.createdAt)}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 block sm:text-right">Order Status</span>
              <div>
                <StatusBadge status={order.status} className="text-sm px-3 py-1" />
              </div>
            </div>
          </div>

          {/* DELIVERED CREDENTIALS VAULT (If approved & revealed) */}
          {order.credentialsRevealed && order.deliveredCredentials ? (
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Key className="w-4 h-4" />
                  <span>Your Digital Account Credentials</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied!' : 'Copy Credentials'}</span>
                </button>
              </div>

              <div className="bg-dark-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-100 select-all whitespace-pre-wrap break-all">
                {order.deliveredCredentials}
              </div>

              <div className="text-[11px] text-slate-400">
                Keep these details safe. If you need any assistance or have warranty questions, reach out to our WhatsApp support.
              </div>
            </div>
          ) : (
            /* Reassurance Notice */
            <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-800/60 text-xs text-slate-300 flex items-start gap-3">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Please wait for admin contact:</strong>
                Our administrator will reach out to you via WhatsApp or Email to verify details and complete fulfillment. You do not need to take any action right now.
              </div>
            </div>
          )}

          {/* Product & Total */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-dark-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">Product</span>
              <div className="font-bold text-sm text-slate-100">{order.productName}</div>
              <div className="text-slate-400">Quantity: {order.quantity}</div>
            </div>

            <div className="p-4 rounded-2xl bg-dark-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">Total Amount</span>
              <div className="font-bold text-base text-white">{formatPrice(order.totalAmount)}</div>
              <div className="text-emerald-400 font-medium">Payment arranged via Admin</div>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Order Progress
            </h3>
            <OrderTimeline
              status={order.status}
              createdAt={order.createdAt}
              contactedAt={order.contactedAt}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto px-4 py-24 text-center text-xs text-slate-400">
          Loading order lookup...
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
