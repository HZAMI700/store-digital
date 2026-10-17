'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Order, AdminStats, DigitalAccountInventory } from '@/lib/types';
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
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<DigitalAccountInventory[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. First load from clientStore (instant local persistence)
      const localOrders = clientStore.getOrders();
      const localInv = clientStore.getInventory();
      setOrders(localOrders);
      setInventory(localInv);
      setStats(clientStore.computeStats(localOrders));

      // 2. Fetch from API if running in server mode
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.orders) {
          // Merge with any new local orders
          const merged = [...data.orders];
          localOrders.forEach((lo) => {
            if (!merged.some((mo) => mo.id === lo.id || mo.orderReference === lo.orderReference)) {
              merged.unshift(lo);
            }
          });
          setOrders(merged);
          clientStore.saveOrders(merged);
          setInventory(data.inventory || localInv);
          setStats(clientStore.computeStats(merged));
        }
      }
    } catch {
      // Offline / purely frontend fallback
      const localOrders = clientStore.getOrders();
      setOrders(localOrders);
      setInventory(clientStore.getInventory());
      setStats(clientStore.computeStats(localOrders));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to local storage updates from other tabs
    const handleUpdate = () => {
      const localOrders = clientStore.getOrders();
      setOrders(localOrders);
      setInventory(clientStore.getInventory());
      setStats(clientStore.computeStats(localOrders));
    };

    window.addEventListener('y7x_orders_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
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

  return (
    <div className="space-y-8 animate-in fade-in duration-200" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">نظرة عامة على الإدارة</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
              مباشر ومحدث
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            متابعة الطلبات اللحظية، التواصل المباشر مع العملاء عبر الواتساب، وإدارة تسليم الاشتراكات
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0284c7]" />
            <span>تحديث البيانات</span>
          </button>

          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2 velto-gradient-btn text-white rounded-xl text-xs font-black shadow-md shadow-cyan-500/20 transition cursor-pointer"
          >
            <span>جدول الطلبات الكامل</span>
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
        ) : orders.filter((o) => o.status === 'new_order' || o.status === 'contacting_customer').length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
            رائع! تم التواصل مع جميع العملاء ومعالجة كافة الطلبات الواردة.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders
              .filter((o) => o.status === 'new_order' || o.status === 'contacting_customer')
              .slice(0, 6)
              .map((order) => (
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
                      <span className="text-slate-600 font-bold text-xs">{order.productName} (x{order.quantity})</span>
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
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
