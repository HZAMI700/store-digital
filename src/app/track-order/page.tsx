'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Order } from '@/lib/types';
import { clientStore } from '@/lib/client-store';
import { StatusBadge } from '@/components/StatusBadge';
import { OrderTimeline } from '@/components/OrderTimeline';
import { formatPrice, formatDateTime } from '@/lib/utils';
import {
  Search,
  Key,
  Check,
  Copy,
  AlertCircle,
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

    // 1. Check local clientStore first
    const localOrder = clientStore.lookupOrder(ref.trim(), em.trim());
    if (localOrder) {
      setOrder(localOrder);
      setLoading(false);
      return;
    }

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
        throw new Error(data.error || 'لم يتم العثور على طلب مطابق للبيانات المدخلة');
      }

      setOrder(data.order);
      clientStore.saveToMyOrders(data.order);
    } catch (err: any) {
      setError(err.message || 'تعذر استرجاع الطلب');
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
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          تتبع حالة طلبك
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          أدخل رقم مرجع الطلب وبريدك الإلكتروني للاطلاع على تقدم التواصل واستلام بيانات الحساب.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              رقم مرجع الطلب
            </label>
            <input
              type="text"
              required
              value={orderReference}
              onChange={(e) => setOrderReference(e.target.value)}
              placeholder="مثال: ORD-20261015-8491"
              className="w-full h-11 px-4 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              البريد الإلكتروني المسجل في الطلب
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full h-11 px-4 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              dir="ltr"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              للأمان وحماية الخصوصية، يلزم تطابق البريد الإلكتروني مع رقم الطلب.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>البحث عن الطلب</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Order Result Card */}
      {order && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <span className="text-xs text-slate-500 font-medium">مرجع الطلب</span>
              <div className="text-xl font-mono font-black text-indigo-600">
                #{order.orderReference}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                تاريخ التسجيل: {formatDateTime(order.createdAt)}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 block sm:text-left font-medium">حالة الطلب</span>
              <div>
                <StatusBadge status={order.status} className="text-sm px-3.5 py-1.5" />
              </div>
            </div>
          </div>

          {/* DELIVERED CREDENTIALS (If revealed) */}
          {order.credentialsRevealed && order.deliveredCredentials ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <Key className="w-4 h-4 text-emerald-600" />
                  <span>بيانات الحساب الرقمي المستلم</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'تم النسخ' : 'نسخ البيانات'}</span>
                </button>
              </div>

              <div className="bg-white p-4 rounded-xl border border-emerald-200 font-mono text-xs text-emerald-900 select-all whitespace-pre-wrap break-all shadow-inner" dir="ltr">
                {order.deliveredCredentials}
              </div>

              <div className="text-[11px] text-emerald-800 font-medium">
                يرجى حفظ البيانات وعدم مشاركتها مع أطراف خارجية. الحساب مشمول بالضمان الذهبي لكامل المدة.
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-3 shadow-sm">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block mb-0.5 text-indigo-950 font-bold">بانتظار تواصل الإدارة:</strong>
                سيتواصل معك المشرف قريباً عبر الواتساب لتأكيد تفاصيل الطلب وتسليم الحساب. لا يلزمك اتخاذ أي إجراء حالياً.
              </div>
            </div>
          )}

          {/* Product & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 block font-semibold">المنتج</span>
              <div className="font-extrabold text-sm text-slate-900">{order.productName}</div>
              <div className="text-slate-500">الكمية: {order.quantity}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 block font-semibold">الإجمالي التقديري</span>
              <div className="font-black text-base text-indigo-600 font-mono">{formatPrice(order.totalAmount)}</div>
              <div className="text-emerald-700 font-semibold">يتم السداد بالتنسيق مع المشرف</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              المسار الزمني
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
        <div className="max-w-xl mx-auto px-4 py-24 text-center text-xs text-gray-400">
          جاري تحميل البحث عن الطلب...
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
