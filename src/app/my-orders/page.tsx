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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Orders History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracking customer requests for: <span className="font-mono text-sky-400">{customerEmail}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="px-4 py-2 bg-dark-850 hover:bg-dark-800 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition-colors"
          >
            Browse Store Catalog
          </Link>
        </div>
      </div>

      {/* Reminder Banner */}
      <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-800/60 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">Direct Admin Contact in Progress:</strong> Orders are verified and fulfilled manually. After submitting, please keep your WhatsApp and Email accessible. The administrator will contact you with payment instructions and delivery details.
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading your order requests...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 rounded-3xl bg-dark-900 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-dark-850 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Order Requests Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't submitted any account order requests under this profile yet.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-dark-950 font-bold rounded-xl text-xs shadow-lg shadow-sky-950/50"
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
                className="rounded-3xl bg-dark-900 border border-slate-800/90 overflow-hidden shadow-xl transition-all"
              >
                {/* Order Summary Header Bar */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-5 sm:p-6 cursor-pointer hover:bg-dark-850/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-dark-950 border border-slate-800 flex items-center justify-center shrink-0 text-sky-400 font-mono font-bold text-sm">
                      #{order.orderReference.slice(-4)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-white">
                          #{order.orderReference}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="text-xs text-slate-300 font-medium mt-1">
                        {order.productName} • <span className="text-slate-400">Qty: {order.quantity}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Submitted: {formatDateTime(order.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-slate-800/60">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-slate-500 block">Total</span>
                      <span className="text-base font-extrabold text-white">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="p-2 rounded-xl bg-dark-950 border border-slate-800 text-slate-400"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details & Timeline */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-800/60 space-y-6 animate-in fade-in duration-150">
                    {/* DELIVERED CREDENTIALS (If approved) */}
                    {order.credentialsRevealed && order.deliveredCredentials && (
                      <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                            <Key className="w-4 h-4" />
                            <span>Your Delivered Account Credentials</span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyCredentials(order.id, order.deliveredCredentials!)
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
                          >
                            {copiedKeyId === order.id ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedKeyId === order.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="bg-dark-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 select-all whitespace-pre-wrap break-all">
                          {order.deliveredCredentials}
                        </div>
                      </div>
                    )}

                    {/* Submitted Contact Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-dark-950/70 border border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-500 block">Name</span>
                        <span className="font-semibold text-slate-200">{order.customerName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">WhatsApp Phone</span>
                        <span className="font-mono text-emerald-400 font-semibold">{order.customerWhatsapp}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Email Address</span>
                        <span className="font-mono text-slate-300">{order.customerEmail}</span>
                      </div>
                    </div>

                    {/* Progress Timeline */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
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
