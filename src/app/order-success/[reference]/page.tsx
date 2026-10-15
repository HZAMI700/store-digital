'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Order } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { OrderTimeline } from '@/components/OrderTimeline';
import { formatPrice, formatDateTime } from '@/lib/utils';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Copy,
  Check,
  MessageSquare,
  Mail,
  User,
  ShoppingBag,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

function OrderSuccessContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const reference = params?.reference as string;
  const token = searchParams.get('token');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#818cf8', '#10b981'],
      });
    } catch {}

    const fetchOrder = async () => {
      try {
        const res = await fetch('/api/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderReference: reference,
            token: token || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Unable to retrieve order details');
        }

        setOrder(data.order);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (reference) {
      fetchOrder();
    }
  }, [reference, token]);

  const handleCopyReference = () => {
    if (order?.orderReference) {
      navigator.clipboard.writeText(order.orderReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading your order confirmation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="p-6 rounded-3xl bg-dark-900 border border-slate-800 space-y-3">
          <h2 className="text-xl font-bold text-white">Order Reference Notice</h2>
          <p className="text-xs text-slate-400">
            {error || 'Unable to load order details at this moment.'}
          </p>
          <div className="pt-2">
            <Link
              href="/track-order"
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-dark-950 font-bold rounded-xl text-xs"
            >
              <span>Track with Email & Reference</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      {/* Success Hero Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-sky-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-emerald">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Order Request Received!
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Thank you, <span className="text-slate-200 font-semibold">{order.customerName}</span>.
          Your request has been registered in our queue.
        </p>
      </div>

      {/* REFERENCE NUMBER & STATUS BADGE */}
      <div className="p-6 rounded-3xl bg-dark-900 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Order Reference</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xl sm:text-2xl font-black text-sky-400 tracking-wider">
                {order.orderReference}
              </span>
              <button
                type="button"
                onClick={handleCopyReference}
                className="p-1.5 rounded-lg bg-dark-850 hover:bg-dark-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Copy Reference"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Current Status</span>
            <div>
              <StatusBadge status={order.status} className="text-sm px-3 py-1" />
            </div>
          </div>
        </div>

        {/* PRIMARY NOTICE (Requirement 1) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/60 via-dark-950 to-indigo-950/60 border border-sky-500/30 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-sky-400 font-bold">
            <Clock className="w-4 h-4 shrink-0" />
            <span>Waiting for Store Administrator Contact</span>
          </div>
          <p className="leading-relaxed text-slate-300">
            Our team will reach out directly through <strong className="text-emerald-400">WhatsApp ({order.customerWhatsapp})</strong> or <strong className="text-sky-400">Email ({order.customerEmail})</strong> to verify your order details, explain the convenient payment process, and arrange account delivery.
          </p>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
            You do NOT need to pay online right now. Your order will be confirmed only after we speak with you.
          </div>
        </div>

        {/* Ordered Product Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-sky-400" />
            <span>Requested Product</span>
          </h3>

          <div className="p-4 rounded-2xl bg-dark-950 border border-slate-800/90 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-sm text-white">{order.productName}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Quantity: <span className="font-semibold text-slate-200">{order.quantity}</span> × {formatPrice(order.unitPrice)}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Total Price</span>
              <span className="text-lg font-black text-white">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Submitted Contact Info Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-sky-400" />
            <span>Submitted Contact Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-dark-950 border border-slate-800/90 text-xs">
            <div>
              <span className="text-slate-500 block">Customer Name</span>
              <span className="font-semibold text-slate-200">{order.customerName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Email Address</span>
              <span className="font-mono text-slate-200">{order.customerEmail}</span>
            </div>
            <div>
              <span className="text-slate-500 block">WhatsApp Number</span>
              <span className="font-mono text-emerald-400 font-semibold">{order.customerWhatsapp}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Date of Request</span>
              <span className="text-slate-300">{formatDateTime(order.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Order Progress Timeline */}
        <div className="pt-4 border-t border-slate-800/80 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Order Progress Timeline
          </h3>
          <OrderTimeline status={order.status} createdAt={order.createdAt} />
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors text-center"
        >
          Return to Products Catalog
        </Link>

        <Link
          href={`/track-order?ref=${order.orderReference}&email=${encodeURIComponent(order.customerEmail)}`}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-dark-950 text-xs font-bold shadow-lg shadow-sky-950/40 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
        >
          <span>Bookmark Tracking Page</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto px-4 py-24 text-center text-xs text-slate-400">
          Loading order details...
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
