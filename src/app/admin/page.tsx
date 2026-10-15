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
      color: 'text-amber-800',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    {
      title: 'Awaiting Contact',
      value: stats?.awaitingContact ?? 0,
      description: 'Pending admin WhatsApp/Email outreach',
      icon: PhoneCall,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    {
      title: 'Awaiting Customer Reply',
      value: stats?.awaitingCustomerResponse ?? 0,
      description: 'Contacted / Payment info sent',
      icon: Clock,
      color: 'text-purple-700',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
    },
    {
      title: 'Payment Confirmed',
      value: stats?.paymentConfirmed ?? 0,
      description: 'Verified, ready for delivery',
      icon: CheckCircle2,
      color: 'text-teal-700',
      bg: 'bg-teal-50',
      border: 'border-teal-200',
    },
    {
      title: 'Completed Orders',
      value: stats?.completed ?? 0,
      description: 'Fulfilled & accounts delivered',
      icon: PackageCheck,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    {
      title: 'Total Order Value',
      value: formatPrice(stats?.totalOrderValue ?? 0),
      description: 'Gross value of all active requests',
      icon: DollarSign,
      color: 'text-indigo-700',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-content-primary tracking-tight">Admin Overview</h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Monitor real-time incoming manual order requests, customer outreach, and manual fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-surface-secondary border border-border rounded-xl text-xs font-bold text-content-primary transition-colors shadow-subtle"
          >
            <RefreshCw className="w-3.5 h-3.5 text-primary-500" />
            <span>Refresh Data</span>
          </button>

          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold shadow-subtle transition-colors"
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
              className="p-5 rounded-3xl bg-white border border-border shadow-card space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-content-secondary uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-2xl ${card.bg} ${card.border} border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-content-primary tracking-tight">
                  {card.value}
                </div>
                <div className="text-[11px] text-content-muted mt-1 font-medium">{card.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PRIORITY ACTION QUEUE: NEW & PENDING ORDERS */}
      <div className="p-6 rounded-3xl bg-white border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-base font-bold text-content-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Pending Attention: New & Uncontacted Orders</span>
            </h2>
            <p className="text-xs text-content-secondary mt-0.5">
              Customers waiting for you to reach out via WhatsApp or Email
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="text-xs text-primary-600 hover:text-primary-700 font-bold"
          >
            Manage in Table →
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-content-secondary">Loading orders...</div>
        ) : orders.filter((o) => o.status === 'new_order' || o.status === 'contacting_customer').length === 0 ? (
          <div className="p-8 text-center text-xs text-content-secondary bg-surface-secondary rounded-2xl border border-border">
            All current orders have been contacted or responded to! Good job.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {orders
              .filter((o) => o.status === 'new_order' || o.status === 'contacting_customer')
              .slice(0, 5)
              .map((order) => (
                <div
                  key={order.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-secondary/50 p-3 rounded-2xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-primary-600">
                        #{order.orderReference}
                      </span>
                      <StatusBadge status={order.status} />
                      <span className="text-xs text-content-secondary">
                        {formatDateTime(order.createdAt)}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-content-primary">
                      {order.customerName} • <span className="text-content-secondary font-normal">{order.productName} (x{order.quantity})</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-content-secondary">
                      <span className="font-mono text-emerald-700 font-bold">{order.customerWhatsapp}</span>
                      <span>•</span>
                      <span className="font-mono">{order.customerEmail}</span>
                      <span>•</span>
                      <span className="font-black text-content-primary">{formatPrice(order.totalAmount)}</span>
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
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-surface-secondary border border-border text-xs font-bold text-content-primary shadow-subtle transition-colors"
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
