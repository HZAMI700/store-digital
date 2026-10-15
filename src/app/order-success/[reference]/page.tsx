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
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#4563EB', '#16A6A1', '#10B981'],
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
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-content-secondary">Loading your order confirmation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="p-6 rounded-3xl bg-white border border-border shadow-card space-y-3">
          <h2 className="text-xl font-bold text-content-primary">Order Reference Notice</h2>
          <p className="text-xs text-content-secondary">
            {error || 'Unable to load order details at this moment.'}
          </p>
          <div className="pt-2">
            <Link
              href="/track-order"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-bold rounded-xl text-xs shadow-subtle"
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
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-subtle">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-content-primary tracking-tight">
          Order Request Received!
        </h1>

        <p className="text-xs sm:text-sm text-content-secondary max-w-md mx-auto leading-relaxed">
          Thank you, <span className="text-content-primary font-bold">{order.customerName}</span>.
          Your request has been registered in our queue.
        </p>
      </div>

      {/* REFERENCE NUMBER & STATUS BADGE */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <span className="text-xs text-content-secondary block font-semibold">Order Reference</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xl sm:text-2xl font-black text-primary-600 tracking-wider">
                {order.orderReference}
              </span>
              <button
                type="button"
                onClick={handleCopyReference}
                className="p-1.5 rounded-lg bg-surface-secondary hover:bg-surface-tertiary border border-border text-content-secondary hover:text-content-primary transition-colors"
                title="Copy Reference"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="text-xs text-content-secondary block font-semibold">Current Status</span>
            <div>
              <StatusBadge status={order.status} className="text-sm px-3.5 py-1.5" />
            </div>
          </div>
        </div>

        {/* PRIMARY NOTICE (Requirement 1) */}
        <div className="p-5 rounded-2xl bg-primary-50 border border-primary-200 text-xs text-primary-950 space-y-2 shadow-subtle">
          <div className="flex items-center gap-2 text-primary-700 font-bold text-sm">
            <Clock className="w-4 h-4 shrink-0 text-primary-600" />
            <span>Waiting for Store Administrator Contact</span>
          </div>
          <p className="leading-relaxed text-content-primary">
            Our team will reach out directly through <strong className="text-emerald-700">WhatsApp ({order.customerWhatsapp})</strong> or <strong className="text-primary-700">Email ({order.customerEmail})</strong> to verify your order details, explain the convenient payment process, and arrange account delivery.
          </p>
          <div className="text-[11px] text-content-secondary pt-2 border-t border-primary-200/60 font-medium">
            You do NOT need to pay online right now. Your order will be confirmed only after we speak with you.
          </div>
        </div>

        {/* Ordered Product Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-content-primary uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-primary-500" />
            <span>Requested Product</span>
          </h3>

          <div className="p-4 rounded-2xl bg-surface-secondary border border-border flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-sm text-content-primary">{order.productName}</div>
              <div className="text-xs text-content-secondary mt-0.5">
                Quantity: <span className="font-bold text-content-primary">{order.quantity}</span> × {formatPrice(order.unitPrice)}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-content-secondary block font-medium">Total Price</span>
              <span className="text-lg font-black text-content-primary">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Submitted Contact Info Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-content-primary uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-primary-500" />
            <span>Submitted Contact Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-surface-secondary border border-border text-xs">
            <div>
              <span className="text-content-secondary block">Customer Name</span>
              <span className="font-bold text-content-primary">{order.customerName}</span>
            </div>
            <div>
              <span className="text-content-secondary block">Email Address</span>
              <span className="font-mono text-content-primary">{order.customerEmail}</span>
            </div>
            <div>
              <span className="text-content-secondary block">WhatsApp Number</span>
              <span className="font-mono text-emerald-700 font-bold">{order.customerWhatsapp}</span>
            </div>
            <div>
              <span className="text-content-secondary block">Date of Request</span>
              <span className="text-content-primary">{formatDateTime(order.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Order Progress Timeline */}
        <div className="pt-4 border-t border-border space-y-4">
          <h3 className="text-xs font-bold text-content-primary uppercase tracking-wider">
            Order Progress Timeline
          </h3>
          <OrderTimeline status={order.status} createdAt={order.createdAt} />
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-surface-secondary border border-border text-xs font-bold text-content-primary transition-colors text-center shadow-subtle"
        >
          Return to Products Catalog
        </Link>

        <Link
          href={`/track-order?ref=${order.orderReference}&email=${encodeURIComponent(order.customerEmail)}`}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold shadow-subtle flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
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
        <div className="max-w-xl mx-auto px-4 py-24 text-center text-xs text-content-secondary">
          Loading order details...
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
