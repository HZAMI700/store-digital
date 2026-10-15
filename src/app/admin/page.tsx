'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Order, AdminStats, DigitalAccountInventory } from '@/lib/types';
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
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<DigitalAccountInventory[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
        setInventory(data.inventory || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOrderUpdated = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    if (selectedOrder && selectedOrder.id === updated.id) {
      setSelectedOrder(updated);
    }
    // Recompute stats
    fetchData();
  };

  const statCards = [
    {
      title: 'New Orders',
      value: stats?.newOrders ?? 0,
      description: 'Submitted, awaiting review',
      icon: Sparkles,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
    },
    {
      title: 'Awaiting Contact',
      value: stats?.awaitingContact ?? 0,
      description: 'Pending admin WhatsApp/Email outreach',
      icon: PhoneCall,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/30',
    },
    {
      title: 'Awaiting Customer Reply',
      value: stats?.awaitingCustomerResponse ?? 0,
      description: 'Contacted / Payment info sent',
      icon: Clock,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
    },
    {
      title: 'Payment Confirmed',
      value: stats?.paymentConfirmed ?? 0,
      description: 'Verified, ready for delivery',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
    },
    {
      title: 'Completed Orders',
      value: stats?.completed ?? 0,
      description: 'Fulfilled & accounts delivered',
      icon: PackageCheck,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/30',
    },
    {
      title: 'Total Order Value',
      value: formatPrice(stats?.totalOrderValue ?? 0),
      description: 'Gross value of all active requests',
      icon: DollarSign,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Overview</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real-time incoming manual order requests, customer outreach, and manual fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dark-850 hover:bg-dark-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>

          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-950/40 transition-colors"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 6 REQUIRED DASHBOARD STAT CARDS (Requirement 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-3xl bg-dark-900 border border-slate-800 shadow-xl space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-2xl ${card.bg} ${card.border} border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {card.value}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">{card.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PRIORITY ACTION QUEUE: NEW & PENDING ORDERS */}
      <div className="p-6 rounded-3xl bg-dark-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Pending Attention: New & Uncontacted Orders</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customers waiting for you to reach out via WhatsApp or Email
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
          >
            Manage in Table →
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading orders...</div>
        ) : orders.filter((o) => o.status === 'new_order' || o.status === 'contacting_customer').length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-dark-950/60 rounded-2xl border border-slate-800/80">
            All current orders have been contacted or responded to! Good job.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {orders
              .filter((o) => o.status === 'new_order' || o.status === 'contacting_customer')
              .slice(0, 5)
              .map((order) => (
                <div
                  key={order.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-dark-850/40 p-3 rounded-2xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-sky-400">
                        #{order.orderReference}
                      </span>
                      <StatusBadge status={order.status} />
                      <span className="text-xs text-slate-400">
                        {formatDateTime(order.createdAt)}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-slate-200">
                      {order.customerName} • <span className="text-slate-400">{order.productName} (x{order.quantity})</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="font-mono text-emerald-400">{order.customerWhatsapp}</span>
                      <span>•</span>
                      <span className="font-mono">{order.customerEmail}</span>
                      <span>•</span>
                      <span className="font-bold text-white">{formatPrice(order.totalAmount)}</span>
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
                      onContactRecorded={fetchData}
                    />

                    <EmailButton
                      customerName={order.customerName}
                      orderReference={order.orderReference}
                      productName={order.productName}
                      customerEmail={order.customerEmail}
                      orderId={order.id}
                      size="sm"
                      onContactRecorded={fetchData}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDrawerOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-700 text-xs font-medium text-slate-200"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* INSPECTOR DRAWER */}
      {selectedOrder && (
        <AdminOrderDrawer
          order={selectedOrder}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedOrder(null);
          }}
          onOrderUpdated={handleOrderUpdated}
          inventory={inventory}
        />
      )}
    </div>
  );
}
