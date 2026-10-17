'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Order, AdminStats, DigitalAccountInventory, ORDER_STATUSES, OrderStatus } from '@/lib/types';
import { clientStore } from '@/lib/client-store';
import { StatusBadge } from '@/components/StatusBadge';
import { AdminOrderDrawer } from '@/components/AdminOrderDrawer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { EmailButton } from '@/components/EmailButton';
import { formatPrice, formatDateTime } from '@/lib/utils';
import {
  Sparkles,
  PhoneCall,
  Clock,
  CheckCircle2,
  PackageCheck,
  DollarSign,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Mail,
  User,
  ExternalLink,
  RefreshCw,
  Eye,
  ShieldCheck,
  ShoppingBag,
  Search,
  Copy,
  Check,
  Filter,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<DigitalAccountInventory[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setIsRefreshing(true);
    try {
      // 1. Load from clientStore immediately
      const localOrders = clientStore.getOrders();
      const localInv = clientStore.getInventory();
      setOrders(localOrders);
      setInventory(localInv);
      setStats(clientStore.computeStats(localOrders));

      // 2. Fetch from API with cache-busting timestamp
      const res = await fetch(`/api/admin/orders?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.orders) {
          // Check if client has local orders that server lacks, and sync them if needed
          const serverIds = new Set(data.orders.map((o: Order) => o.id));
          const missingOnServer = localOrders.filter((lo) => !serverIds.has(lo.id));

          let finalOrders = [...data.orders];

          if (missingOnServer.length > 0) {
            // Push missing client orders to server
            try {
              const syncRes = await fetch('/api/admin/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ syncOrders: missingOnServer }),
              });
              if (syncRes.ok) {
                const syncData = await syncRes.json();
                if (syncData.orders) {
                  finalOrders = syncData.orders;
                }
              }
            } catch (syncErr) {
              console.warn('Sync to server failed', syncErr);
            }
          }

          // Merge any remaining local
          localOrders.forEach((lo) => {
            if (!finalOrders.some((mo) => mo.id === lo.id || mo.orderReference === lo.orderReference)) {
              finalOrders.unshift(lo);
            }
          });

          setOrders(finalOrders);
          clientStore.saveOrders(finalOrders);
          setInventory(data.inventory || localInv);
          setStats(data.stats || clientStore.computeStats(finalOrders));
        }
      }
      setLastSyncTime(new Date().toLocaleTimeString('ar-TN'));
    } catch {
      const localOrders = clientStore.getOrders();
      setOrders(localOrders);
      setInventory(clientStore.getInventory());
      setStats(clientStore.computeStats(localOrders));
    } finally {
      if (showLoading) setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(true);

    const handleUpdate = () => {
      const localOrders = clientStore.getOrders();
      setOrders(localOrders);
      setInventory(clientStore.getInventory());
      setStats(clientStore.computeStats(localOrders));
    };

    window.addEventListener('velto_orders_updated', handleUpdate);
    window.addEventListener('y7x_orders_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Auto-poll silently every 3 seconds for instant real-time live sync
    const interval = setInterval(() => {
      loadData(false);
    }, 3000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('velto_orders_updated', handleUpdate);
      window.removeEventListener('y7x_orders_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleOrderUpdated = (updated: Order) => {
    clientStore.updateOrderStatus(updated.id, updated.status);
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    if (selectedOrder && selectedOrder.id === updated.id) {
      setSelectedOrder(updated);
    }
    const current = clientStore.getOrders();
    setStats(clientStore.computeStats(current));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const statCards = [
    {
      title: 'طلبات جديدة',
      value: stats?.newOrders ?? 0,
      description: 'بانتظار المراجعة والتواصل الأولي',
      icon: Sparkles,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    {
      title: 'بانتظار التواصل',
      value: stats?.awaitingContact ?? 0,
      description: 'عملاء في قائمة انتظار رسالة الواتساب',
      icon: PhoneCall,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    {
      title: 'جاري التواصل',
      value: stats?.awaitingCustomerResponse ?? 0,
      description: 'تم إرسال بيانات وتفاصيل السداد',
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
    },
    {
      title: 'تم تأكيد الدفع',
      value: stats?.paymentConfirmed ?? 0,
      description: 'تم التحقق من السداد، جاهز للتسليم',
      icon: CheckCircle2,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-200',
    },
    {
      title: 'طلبات مكتملة',
      value: stats?.completed ?? 0,
      description: 'تم تسليم الحساب بنجاح وإتمام الطلب',
      icon: PackageCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    {
      title: 'إجمالي المبيعات النشطة',
      value: formatPrice(stats?.totalOrderValue ?? 0),
      description: 'القيمة الإجمالية للطلبات المعتمدة',
      icon: DollarSign,
      color: 'text-[#0284c7]',
      bg: 'bg-sky-50',
      border: 'border-sky-200',
    },
  ];

  // Filtered orders for full table
  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.orderReference.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerEmail.toLowerCase().includes(q) ||
      order.customerWhatsapp.includes(q) ||
      order.productName.toLowerCase().includes(q);

    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'new'
        ? order.status === 'new_order'
        : activeTab === 'contacting'
        ? order.status === 'contacting_customer' || order.status === 'awaiting_customer_response'
        : activeTab === 'paid'
        ? order.status === 'payment_confirmed'
        : activeTab === 'completed'
        ? order.status === 'completed'
        : true;

    return matchesSearch && matchesTab;
  });

  const priorityOrders = orders.filter(
    (o) => o.status === 'new_order' || o.status === 'contacting_customer'
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">نظرة عامة على الإدارة</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>مباشر ولحظي</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            متابعة الطلبات اللحظية، التواصل المباشر مع العملاء عبر الواتساب، وإدارة تسليم الاشتراكات
            {lastSyncTime && <span className="text-slate-400 mr-2">(آخر تحديث: {lastSyncTime})</span>}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0284c7] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'جاري التحديث...' : 'تحديث فوري'}</span>
          </button>

          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 velto-gradient-btn text-white rounded-xl text-xs font-black shadow-md shadow-cyan-500/20 transition cursor-pointer"
          >
            <span>جدول الطلبات الكامل ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </Link>
        </div>
      </div>

      {/* 6 Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-2xl ${card.bg} ${card.border} border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                  {card.value}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">{card.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Priority Action Queue: New & Uncontacted Orders */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>طلبات بحاجة للتواصل الفوري (أولوية)</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                {priorityOrders.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              عملاء مسجلون ينتظرون رسالة تأكيد عبر الواتساب أو الإيميل
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="text-xs text-[#0284c7] hover:text-[#0369a1] font-bold flex items-center gap-1"
          >
            <span>عرض كل الطلبات</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">جاري تحميل أحدث الطلبات...</div>
        ) : priorityOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
            {orders.length === 0
              ? 'نظام الاستقبال الفوري جاهز ومباشر • بانتظار وصول طلبات العملاء من المتجر الرقمي'
              : 'رائع! تم التواصل مع جميع العملاء في قائمة الانتظار. تفقد السجل الكامل أدناه.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {priorityOrders.slice(0, 6).map((order) => (
              <div
                key={order.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 p-3 rounded-2xl transition"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#0284c7] bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                      #{order.orderReference}
                    </span>
                    <StatusBadge status={order.status} />
                    <span className="text-[11px] text-slate-400">
                      {formatDateTime(order.createdAt)}
                    </span>
                  </div>

                  <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>{order.customerName}</span>
                    <span className="text-slate-400 font-normal">•</span>
                    <span className="text-slate-700 font-bold text-xs">{order.productName} (x{order.quantity})</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span className="font-mono text-emerald-700 font-bold" dir="ltr">{order.customerWhatsapp}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-600">{order.customerEmail}</span>
                    <span>•</span>
                    <span className="font-black text-slate-900">{formatPrice(order.totalAmount)}</span>
                    {order.customerMessage && (
                      <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        ملاحظة: {order.customerMessage}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <WhatsAppButton
                    customerName={order.customerName}
                    orderReference={order.orderReference}
                    productName={order.productName}
                    whatsappNumber={order.customerWhatsapp}
                    orderId={order.id}
                    size="sm"
                    onContactRecorded={() => {
                      const updated = clientStore.recordContact(order.id, 'whatsapp');
                      if (updated) handleOrderUpdated(updated);
                    }}
                  />

                  <EmailButton
                    customerEmail={order.customerEmail}
                    customerName={order.customerName}
                    orderReference={order.orderReference}
                    productName={order.productName}
                    orderId={order.id}
                    size="sm"
                    onContactRecorded={() => {
                      const updated = clientStore.recordContact(order.id, 'email');
                      if (updated) handleOrderUpdated(updated);
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsDrawerOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>تفاصيل ومعالجة</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FULL REGISTERED ORDERS TABLE (Shows EVERY order in the database) */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#0284c7]" />
              <span>سجل كافة الطلبات المسجلة في المتجر</span>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-[#0284c7] text-xs font-black border border-sky-200">
                {orders.length} طلب
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              كل طلب يتم إرساله من الموقع يظهر هنا فوراً وبشكل دائم ومحفوظ
            </p>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeTab === 'new'
                  ? 'bg-white text-amber-700 shadow-xs border border-amber-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              جديدة ({stats?.newOrders ?? 0})
            </button>
            <button
              onClick={() => setActiveTab('contacting')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeTab === 'contacting'
                  ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              جاري التواصل ({stats?.awaitingCustomerResponse ?? 0})
            </button>
            <button
              onClick={() => setActiveTab('paid')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeTab === 'paid'
                  ? 'bg-white text-teal-700 shadow-xs border border-teal-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              تم الدفع ({stats?.paymentConfirmed ?? 0})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeTab === 'completed'
                  ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مكتملة ({stats?.completed ?? 0})
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برقم المرجع، اسم العميل، رقم الواتساب، الإيميل أو المنتج..."
            className="w-full px-4 py-2.5 pr-10 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0284c7] text-slate-900 text-xs font-medium outline-none transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute top-2.5 left-3 text-xs text-slate-400 hover:text-slate-700 font-bold"
            >
              مسح
            </button>
          )}
        </div>

        {/* Table View */}
        {orders.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-slate-50/70 rounded-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0284c7] flex items-center justify-center mx-auto text-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-900">لا توجد طلبات مسجلة حتى الآن</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              قم بزيارة أي صفحة منتج في المتجر وقدم طلب تجربة، وسيتم تسجيله فوراً على الخادم والقرص الصلب ويظهر هنا تلقائياً.
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
            لا توجد طلبات مطابقة للبحث أو الفلتر المحدد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold">
                  <th className="pb-3 pr-2">رقم المرجع والوقت</th>
                  <th className="pb-3">العميل</th>
                  <th className="pb-3">الاشتراك</th>
                  <th className="pb-3">المبلغ</th>
                  <th className="pb-3">حالة الطلب</th>
                  <th className="pb-3 pl-2 text-left">الإجراءات السريعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                          #{order.orderReference}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(order.id, order.orderReference)}
                          className="text-slate-400 hover:text-slate-600 p-1"
                          title="نسخ رقم المرجع"
                        >
                          {copiedId === order.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        {formatDateTime(order.createdAt)}
                      </div>
                    </td>

                    <td className="py-3.5">
                      <div className="font-black text-slate-900">{order.customerName}</div>
                      <div className="text-[11px] font-mono text-emerald-700 font-bold" dir="ltr">
                        {order.customerWhatsapp}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{order.customerEmail}</div>
                    </td>

                    <td className="py-3.5">
                      <div className="font-bold text-slate-800 line-clamp-1">{order.productName}</div>
                      <div className="text-[10px] text-slate-500">الكمية: {order.quantity}</div>
                      {order.selectedPlan && (
                        <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.2 rounded bg-sky-50 text-[#0284c7] font-semibold border border-sky-100">
                          {order.selectedPlan}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 font-black text-slate-900 font-mono">
                      {formatPrice(order.totalAmount)}
                    </td>

                    <td className="py-3.5">
                      <StatusBadge status={order.status} />
                    </td>

                    <td className="py-3.5 pl-2 text-left">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <WhatsAppButton
                          customerName={order.customerName}
                          orderReference={order.orderReference}
                          productName={order.productName}
                          whatsappNumber={order.customerWhatsapp}
                          orderId={order.id}
                          size="sm"
                          onContactRecorded={() => {
                            const updated = clientStore.recordContact(order.id, 'whatsapp');
                            if (updated) handleOrderUpdated(updated);
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDrawerOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>معالجة</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Order Drawer Modal */}
      <AdminOrderDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOrderUpdated={handleOrderUpdated}
        inventory={inventory}
      />
    </div>
  );
}
