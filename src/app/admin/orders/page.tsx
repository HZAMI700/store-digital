'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, ORDER_STATUSES, DigitalAccountInventory } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { AdminOrderDrawer } from '@/components/AdminOrderDrawer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { EmailButton } from '@/components/EmailButton';
import { formatPrice, formatDateTime } from '@/lib/utils';
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  MessageSquare,
  Mail,
  User,
  ShoppingBag,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<DigitalAccountInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
        setInventory(data.inventory || []);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderUpdated = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    if (selectedOrder && selectedOrder.id === updated.id) {
      setSelectedOrder(updated);
    }
  };

  // Distinct products for filter dropdown
  const distinctProducts = Array.from(new Set(orders.map((o) => o.productName)));

  // Filtered orders list
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderReference.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      order.customerWhatsapp.includes(search) ||
      order.productName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;

    const matchesProduct =
      productFilter === 'all' || order.productName === productFilter;

    return matchesSearch && matchesStatus && matchesProduct;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Orders Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review submitted customer requests, initiate WhatsApp/Email contact, and fulfill orders.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dark-850 hover:bg-dark-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* FILTER AND SEARCH BAR */}
      <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ref, customer, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-dark-950 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-dark-950 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 appearance-none"
          >
            <option value="all">All Statuses ({orders.length})</option>
            {(Object.keys(ORDER_STATUSES) as OrderStatus[]).map((key) => {
              const count = orders.filter((o) => o.status === key).length;
              return (
                <option key={key} value={key}>
                  {ORDER_STATUSES[key].label} ({count})
                </option>
              );
            })}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Product Filter */}
        <div className="relative">
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-dark-950 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 appearance-none"
          >
            <option value="all">All Products</option>
            {distinctProducts.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ORDERS DATA DISPLAY */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading orders database...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-dark-900 border border-slate-800 space-y-2">
          <div className="text-base font-bold text-white">No Matching Orders Found</div>
          <p className="text-xs text-slate-400">
            Try adjusting your search criteria or status filter.
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden lg:block rounded-3xl bg-dark-900 border border-slate-800 overflow-hidden shadow-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Product & Qty</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Contact Info (WhatsApp / Email)</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsDrawerOpen(true);
                    }}
                    className="hover:bg-dark-850/60 cursor-pointer transition-colors group"
                  >
                    {/* Order Reference */}
                    <td className="py-4 px-4 font-mono font-bold text-sky-400 whitespace-nowrap">
                      #{order.orderReference}
                    </td>

                    {/* Customer Name */}
                    <td className="py-4 px-4 font-semibold text-slate-200">
                      {order.customerName}
                    </td>

                    {/* Product & Qty */}
                    <td className="py-4 px-4 text-slate-300">
                      <div className="font-medium text-white">{order.productName}</div>
                      <div className="text-[11px] text-slate-400">Qty: {order.quantity}</div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-4 font-black text-white whitespace-nowrap">
                      {formatPrice(order.totalAmount)}
                    </td>

                    {/* Contact Info */}
                    <td className="py-4 px-4 space-y-0.5">
                      <div className="font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3 shrink-0" />
                        <span>{order.customerWhatsapp}</span>
                      </div>
                      <div className="font-mono text-slate-400 text-[11px] flex items-center gap-1.5">
                        <Mail className="w-3 h-3 shrink-0 text-slate-500" />
                        <span className="truncate max-w-[180px]">{order.customerEmail}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                      {formatDateTime(order.createdAt)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>

                    {/* Actions */}
                    <td
                      className="py-4 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <WhatsAppButton
                          customerName={order.customerName}
                          orderReference={order.orderReference}
                          productName={order.productName}
                          whatsappNumber={order.customerWhatsapp}
                          orderId={order.id}
                          size="sm"
                          onContactRecorded={fetchOrders}
                        />

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDrawerOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-dark-850 hover:bg-dark-800 border border-slate-700 text-slate-300 hover:text-white"
                          title="Open Details Drawer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RESPONSIVE MOBILE CARDS VIEW */}
          <div className="lg:hidden space-y-3">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => {
                  setSelectedOrder(order);
                  setIsDrawerOpen(true);
                }}
                className="p-4 rounded-2xl bg-dark-900 border border-slate-800 space-y-3 cursor-pointer hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-sky-400">
                    #{order.orderReference}
                  </span>
                  <StatusBadge status={order.status} />
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-sm text-white">{order.customerName}</div>
                  <div className="text-xs text-slate-300">
                    {order.productName} • <span className="text-slate-400">Qty: {order.quantity}</span>
                  </div>
                  <div className="font-black text-sm text-white pt-1">
                    {formatPrice(order.totalAmount)}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">WhatsApp</span>
                    <span className="font-mono text-emerald-400 font-semibold">{order.customerWhatsapp}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Submitted</span>
                    <span className="text-slate-400 text-[11px]">{formatDateTime(order.createdAt)}</span>
                  </div>
                </div>

                <div
                  className="pt-2 flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex-1">
                    <WhatsAppButton
                      customerName={order.customerName}
                      orderReference={order.orderReference}
                      productName={order.productName}
                      whatsappNumber={order.customerWhatsapp}
                      orderId={order.id}
                      size="sm"
                      className="w-full"
                      onContactRecorded={fetchOrders}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsDrawerOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-700 text-xs text-slate-200"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

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
