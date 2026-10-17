'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Order } from '@/lib/types';
import { clientStore } from '@/lib/client-store';
import { StatusBadge } from '@/components/StatusBadge';
import { OrderTimeline } from '@/components/OrderTimeline';
import { formatPrice, formatDateTime } from '@/lib/utils';
import {
  ShoppingBag,
  Key,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Search,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Quick lookup state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchIdentifier, setSearchIdentifier] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const loadMyOrders = () => {
    setLoading(true);
    try {
      const myLocalOrders = clientStore.getMyOrders();
      setOrders(myLocalOrders);
      if (myLocalOrders.length > 0 && !expandedOrderId) {
        setExpandedOrderId(myLocalOrders[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyOrders();

    const handleUpdate = () => {
      loadMyOrders();
    };

    window.addEventListener('y7x_orders_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('y7x_orders_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleCopyCredentials = (id: string, credentials: string) => {
    navigator.clipboard.writeText(credentials);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleQuickLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchError(null);
    setIsSearching(true);

    try {
      // 1. Try local lookup first
      const foundLocal = clientStore.lookupOrder(searchQuery.trim(), searchIdentifier.trim() || searchQuery.trim());
      if (foundLocal) {
        // Add to view if not already there
        if (!orders.some((o) => o.id === foundLocal.id)) {
          setOrders((prev) => [foundLocal, ...prev]);
        }
        setExpandedOrderId(foundLocal.id);
        setIsSearching(false);
        return;
      }

      // 2. Try API lookup if running
      const res = await fetch(
        `/api/lookup?reference=${encodeURIComponent(searchQuery.trim())}&identifier=${encodeURIComponent(
          searchIdentifier.trim() || searchQuery.trim()
        )}`
      );

      const data = await res.json();
      if (res.ok && data.order) {
        clientStore.saveToMyOrders(data.order);
        if (!orders.some((o) => o.id === data.order.id)) {
          setOrders((prev) => [data.order, ...prev]);
        }
        setExpandedOrderId(data.order.id);
      } else {
        setSearchError('لم نتمكن من العثور على طلب بهذا الرقم. تأكد من صحة رقم الطلب والبيانات المدخلة.');
      }
    } catch {
      setSearchError('تعذر البحث عن الطلب حالياً. يرجى التأكد من رقم المرجع.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-200" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              سجل طلباتي
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-brand-primary text-xs font-bold border border-sky-200">
              وصول فوري بدون تسجيل دخول
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            متابعة حالة الاشتراكات التي تم طلبها من هذا المتصفح واستلام بيانات الحسابات المعتمدة
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/track-order"
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5 text-brand-primary" />
            <span>تتبع طلب برقم المرجع</span>
          </Link>

          <Link
            href="/"
            className="px-4 py-2 velto-gradient-btn text-white text-xs font-black rounded-xl transition shadow-md shadow-cyan-500/20"
          >
            تصفح الكتالوج
          </Link>
        </div>
      </div>

      {/* Reminder Banner */}
      <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 text-xs text-sky-950 flex items-start gap-3 shadow-xs">
        <Info className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-sky-950 font-bold">تواصل الإدارة اليدوي:</strong> يتم التحقق من جميع الطلبات وتفعيلها بواسطة المشرفين عبر الواتساب. بعد تقديم الطلب يرجى إبقاء الواتساب متاحاً لتلقي تفاصيل السداد واستلام بيانات حسابك.
        </div>
      </div>

      {/* Search Another Order Box */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <span className="text-xs font-bold text-slate-800 block">
          هل قدمت طلباً من جهاز آخر وتريد متابعته هنا؟
        </span>
        <form onSubmit={handleQuickLookup} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            required
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="أدخل رقم الطلب (مثال: ORD-12345-6789)"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:bg-white focus:border-brand-primary"
            dir="ltr"
          />
          <input
            type="text"
            value={searchIdentifier}
            onChange={(e) => setSearchIdentifier(e.target.value)}
            placeholder="البريد أو رقم الواتساب المسجل"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:bg-white focus:border-brand-primary"
            dir="ltr"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isSearching ? 'جاري البحث...' : 'بحث وعرض'}
          </button>
        </form>
        {searchError && (
          <p className="text-xs text-rose-600 font-bold">{searchError}</p>
        )}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8">
          <div className="w-10 h-10 border-4 border-sky-200 border-t-brand-primary rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-bold">جاري استرجاع طلباتك...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto text-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">لا توجد طلبات محفوظة في هذا المتصفح</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            لم تقم بتقديم أي طلبات حتى الآن، أو يمكنك إدخال رقم مرجع طلبك في الحقل أعلاه لعرضه ومتابعته فوراً.
          </p>
          <div className="pt-2">
            <Link
              href="/#products"
              className="inline-flex items-center gap-2 px-5 py-2.5 velto-gradient-btn text-white font-black text-xs rounded-xl shadow-md shadow-cyan-500/20 transition"
            >
              <span>تصفح أحدث عروض الاشتراكات</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden transition"
              >
                {/* Order Top Bar */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200/60 flex items-center justify-center text-brand-primary shrink-0 text-xl font-bold">
                      <ShoppingBag className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-brand-primary bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200">
                          #{order.orderReference}
                        </span>
                        <StatusBadge status={order.status} />
                        <span className="text-[11px] text-slate-400">
                          {formatDateTime(order.createdAt)}
                        </span>
                      </div>

                      <h3 className="font-black text-slate-900 text-sm mt-1">
                        {order.productName}{' '}
                        <span className="text-slate-500 text-xs font-normal">
                          (الكمية: {order.quantity})
                        </span>
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-medium">المبلغ الإجمالي</div>
                      <div className="text-base font-black text-slate-900 font-mono">
                        {formatPrice(order.totalAmount)}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                      aria-label="تبديل عرض التفاصيل"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50/40 space-y-6">
                    {/* Order Status Timeline */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-900 mb-4">
                        مراحل معالجة الطلب والتواصل
                      </h4>
                      <OrderTimeline
                        status={order.status}
                        createdAt={order.createdAt}
                        contactedAt={order.contactedAt}
                      />
                    </div>

                    {/* Account Delivery / Credentials Vault Card */}
                    {order.deliveredCredentials && order.credentialsRevealed ? (
                      <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                            <Key className="w-4 h-4 text-emerald-600" />
                            <span>بيانات الحساب المسلمة (جاهز للاستخدام)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyCredentials(order.id, order.deliveredCredentials!)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                          >
                            {copiedKeyId === order.id ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>تم النسخ بنجاح!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>نسخ البيانات</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div
                          className="bg-white p-3.5 rounded-xl border border-emerald-200 text-slate-800 font-mono text-xs select-all whitespace-pre-wrap leading-relaxed"
                          dir="ltr"
                        >
                          {order.deliveredCredentials}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">حالة تسليم بيانات الحساب:</strong> جاري مراجعة الطلب من المشرف. سيتم تسليم بيانات الحساب وتفعيل الاشتراك فور التواصل وتأكيد السداد.
                        </div>
                      </div>
                    )}

                    {/* Customer Information Snapshot */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">الاسم المسجل</span>
                        <strong className="text-slate-900">{order.customerName}</strong>
                      </div>
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">رقم الواتساب</span>
                        <strong className="font-mono text-emerald-700 font-bold" dir="ltr">{order.customerWhatsapp}</strong>
                      </div>
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">البريد الإلكتروني</span>
                        <strong className="font-mono text-slate-800 truncate block">{order.customerEmail}</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2">
                      <Link
                        href={`/track-order?ref=${order.orderReference}&email=${encodeURIComponent(order.customerEmail)}`}
                        className="text-brand-primary hover:underline font-bold flex items-center gap-1"
                      >
                        <span>فتح صفحة التتبع المستقلة</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <span className="text-slate-400 font-mono text-[11px]">
                        رقم المرجع: {order.orderReference}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
