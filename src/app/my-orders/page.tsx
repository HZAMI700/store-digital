'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Order } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { OrderTimeline } from '@/components/OrderTimeline';
import { formatPrice, formatDateTime } from '@/lib/utils';
import {
  ShoppingBag,
  Clock,
  Key,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  User,
  Info,
} from 'lucide-react';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState('yassine.bensalem@gmail.com');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders?email=${encodeURIComponent(customerEmail)}`);
        const data = await res.json();
        if (res.ok && data.orders) {
          setOrders(data.orders);
          if (data.orders.length > 0) {
            setExpandedOrderId(data.orders[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load customer orders', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customerEmail]);

  const handleCopyCredentials = (id: string, credentials: string) => {
    navigator.clipboard.writeText(credentials);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-content-primary tracking-tight">
            My Orders History
          </h1>
          <p className="text-xs text-content-secondary mt-1">
            Tracking customer requests for: <span className="font-mono text-primary-600 font-bold">{customerEmail}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="px-4 py-2 bg-white hover:bg-surface-secondary border border-border text-xs font-bold text-content-primary rounded-xl transition-colors shadow-subtle"
          >
            Browse Store Catalog
          </Link>
        </div>
      </div>

      {/* Reminder Banner */}
      <div className="p-4 rounded-2xl bg-primary-50 border border-primary-200 text-xs text-primary-950 flex items-start gap-3 shadow-subtle">
        <Info className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-primary-900">Direct Admin Contact in Progress:</strong> Orders are verified and fulfilled manually. After submitting, please keep your WhatsApp and Email accessible. The administrator will contact you with payment instructions and delivery details.
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-content-secondary">Loading your order requests...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-border shadow-card text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-secondary text-content-secondary flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-content-primary">No Order Requests Found</h3>
          <p className="text-xs text-content-secondary max-w-sm mx-auto">
            You haven't submitted any account order requests under this profile yet.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-xs shadow-subtle"
            >
              <span>Explore Products</span>
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
                className="rounded-3xl bg-white border border-border overflow-hidden shadow-subtle transition-all hover:border-primary-200"
              >
                {/* Order Summary Header Bar */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-5 sm:p-6 cursor-pointer hover:bg-surface-secondary/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface-secondary border border-border flex items-center justify-center shrink-0 text-primary-600 font-mono font-bold text-sm">
                      #{order.orderReference.slice(-4)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-content-primary">
                          #{order.orderReference}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="text-xs text-content-primary font-semibold mt-1">
                        {order.productName} • <span className="text-content-secondary font-normal">Qty: {order.quantity}</span>
                      </div>
                      <div className="text-[11px] text-content-muted mt-0.5">
                        Submitted: {formatDateTime(order.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-border">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-content-secondary block font-medium">Total</span>
                      <span className="text-base font-black text-content-primary">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="p-2 rounded-xl bg-surface-secondary border border-border text-content-secondary"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details & Timeline */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-border space-y-6 animate-in fade-in duration-150">
                    {/* DELIVERED CREDENTIALS (If approved) */}
                    {order.credentialsRevealed && order.deliveredCredentials && (
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 shadow-subtle">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                            <Key className="w-4 h-4 text-emerald-600" />
                            <span>Your Delivered Account Credentials</span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyCredentials(order.id, order.deliveredCredentials!)
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            {copiedKeyId === order.id ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedKeyId === order.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="bg-white p-3.5 rounded-xl border border-border font-mono text-xs text-content-primary select-all whitespace-pre-wrap break-all shadow-subtle">
                          {order.deliveredCredentials}
                        </div>
                      </div>
                    )}

                    {/* Submitted Contact Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-surface-secondary border border-border text-xs">
                      <div>
                        <span className="text-content-secondary block">Name</span>
                        <span className="font-bold text-content-primary">{order.customerName}</span>
                      </div>
                      <div>
                        <span className="text-content-secondary block">WhatsApp Phone</span>
                        <span className="font-mono text-emerald-700 font-bold">{order.customerWhatsapp}</span>
                      </div>
                      <div>
                        <span className="text-content-secondary block">Email Address</span>
                        <span className="font-mono text-content-primary">{order.customerEmail}</span>
                      </div>
                    </div>

                    {/* Progress Timeline */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold text-content-primary uppercase tracking-wider">
                        Order Progress & Verification Timeline
                      </h4>
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
          })}
        </div>
      )}
    </div>
  );
}
