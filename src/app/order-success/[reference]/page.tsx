'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Order } from '@/lib/types';
import { clientStore } from '@/lib/client-store';
import { StatusBadge } from '@/components/StatusBadge';
import { OrderTimeline } from '@/components/OrderTimeline';
import { formatPrice, formatDateTime } from '@/lib/utils';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Copy,
  Check,
  ShoppingBag,
  Clock,
  User,
  ArrowLeft,
  Info,
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
        colors: ['#0284c7', '#06b6d4', '#10b981'],
      });
    } catch {}

    const fetchOrder = async () => {
      // 1. Check local clientStore first
      try {
        const localOrders = clientStore.getOrders();
        const found = localOrders.find(
          (o) => o.orderReference.toLowerCase() === reference.toLowerCase()
        );
        if (found) {
          setOrder(found);
          setLoading(false);
          return;
        }
      } catch {}

      // 2. Fallback to API lookup
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
          throw new Error(data.error || 'تعذر استرجاع بيانات الطلب');
        }

        setOrder(data.order);
      } catch (err: any) {
        setError(err.message || 'تعذر استرجاع تفاصيل الطلب');
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
        <div className="w-12 h-12 border-4 border-sky-200 border-t-brand-primary rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">جاري تحميل تفاصيل طلبك...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-3">
          <h2 className="text-xl font-bold text-slate-900">تنبيه بخصوص رقم الطلب</h2>
          <p className="text-xs text-slate-500">
            {error || 'تعذر تحميل بيانات الطلب في الوقت الحالي.'}
          </p>
          <div className="pt-2">
            <Link
              href="/track-order"
              className="inline-flex items-center gap-2 px-5 py-2.5 velto-gradient-btn text-white font-bold rounded-xl text-xs shadow-lg transition"
            >
              <span>تتبع الطلب بالبريد ورقم المرجع</span>
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
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          تم استلام طلبك بنجاح!
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          شكراً لك، <span className="text-slate-900 font-bold">{order.customerName}</span>.
          تم تسجيل طلبك في قائمة انتظار الإدارة وسنتواصل معك قريباً.
        </p>
      </div>

      {/* Main Order Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
        {/* Reference & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <span className="text-xs text-slate-500 block font-semibold">رقم مرجع الطلب (احتفظ به)</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xl sm:text-2xl font-black text-brand-primary tracking-wider">
                {order.orderReference}
              </span>
              <button
                type="button"
                onClick={handleCopyReference}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                title="نسخ رقم المرجع"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="text-right space-y-1">
            <span className="text-xs text-slate-500 block font-semibold">الحالة الحالية:</span>
            <div>
              <StatusBadge status={order.status} className="text-sm px-3.5 py-1.5" />
            </div>
          </div>
        </div>

        {/* PRIMARY NOTICE (Requirement 1) */}
        <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-brand-primary font-bold text-sm">
            <Clock className="w-4 h-4 shrink-0 text-brand-primary" />
            <span>بانتظار تواصل مسؤول المتجر</span>
          </div>
          <p className="leading-relaxed text-slate-700">
            سيتواصل معك فريق المتجر مباشرة عبر <strong className="text-emerald-700 font-mono">الواتساب ({order.customerWhatsapp})</strong> أو <strong className="text-brand-primary font-mono">البريد ({order.customerEmail})</strong> لتأكيد طلبك وتوضيح طرق الدفع وترتيب الاستلام.
          </p>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-sky-100 font-medium">
            لا داعي للدفع عبر الإنترنت الآن. طلبك لا يعتبر مؤكداً حتى نتواصل معك.
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-brand-primary" />
            <span>المنتج المطلوب</span>
          </h3>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div>
              <div className="font-extrabold text-sm text-slate-900">{order.productName}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                الكمية: <span className="font-bold text-slate-900">{order.quantity}</span> × {formatPrice(order.unitPrice)}
              </div>
            </div>

            <div className="text-left">
              <span className="text-[11px] text-slate-500 block font-medium">الإجمالي التقديري</span>
              <span className="text-lg font-black text-brand-primary font-mono">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-brand-primary" />
            <span>بيانات التواصل المسجلة</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">اسم العميل:</span>
              <span className="font-bold text-slate-900">{order.customerName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">البريد الإلكتروني:</span>
              <span className="font-mono text-slate-900" dir="ltr">{order.customerEmail}</span>
            </div>
            <div>
              <span className="text-slate-500 block">رقم الواتساب:</span>
              <span className="font-mono text-emerald-700 font-bold" dir="ltr">{order.customerWhatsapp}</span>
            </div>
            <div>
              <span className="text-slate-500 block">تاريخ ووقت الطلب:</span>
              <span className="text-slate-700">{formatDateTime(order.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="pt-4 border-t border-slate-200 space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            المسار الزمني لمتابعة الطلب
          </h3>
          <OrderTimeline status={order.status} createdAt={order.createdAt} />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-colors text-center shadow-sm"
        >
          العودة للمتجر وكتالوج العروض
        </Link>

        <Link
          href={`/track-order?ref=${order.orderReference}&email=${encodeURIComponent(order.customerEmail)}`}
          className="w-full sm:w-auto px-6 py-3 rounded-xl velto-gradient-btn hover:opacity-95 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition"
        >
          <span>حفظ صفحة متابعة الطلب</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto px-4 py-24 text-center text-xs text-gray-400">
          جاري تحميل بيانات الطلب...
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
