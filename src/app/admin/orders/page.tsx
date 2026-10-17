'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, ORDER_STATUSES, DigitalAccountInventory } from '@/lib/types';
import { clientStore } from '@/lib/client-store';
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
  Phone,
  Copy,
  Check,
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const localOrders = clientStore.getOrders();
      const localInv = clientStore.getInventory();
      setOrders(localOrders);
      setInventory(localInv);

      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.orders) {
          const merged = [...data.orders];
          localOrders.forEach((lo) => {
            if (!merged.some((mo) => mo.id === lo.id || mo.orderReference === lo.orderReference)) {
              merged.unshift(lo);
            }
          });
          setOrders(merged);
          clientStore.saveOrders(merged);
          setInventory(data.inventory || localInv);
        }
      }
    } catch {
      const localOrders = clientStore.getOrders();
      setOrders(localOrders);
      setInventory(clientStore.getInventory());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleUpdate = () => {
      setOrders(clientStore.getOrders());
      setInventory(clientStore.getInventory());
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
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Distinct products for filter dropdown
  const distinctProducts = Array.from(new Set(orders.map((o) => o.productName)));

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.orderReference.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerEmail.toLowerCase().includes(q) ||
      order.customerWhatsapp.includes(q) ||
      order.productName.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesProduct = productFilter === 'all' || order.productName === productFilter;

    return matchesSearch && matchesStatus && matchesProduct;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">إدارة طلبات واشتراكات العملاء</h1>
          <p className="text-xs text-slate-500 mt-1">
            مراجعة الطلبات، التواصل الفوري مع العميل عبر الواتساب، وتأكيد السداد وتسليم بيانات الحسابات
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#0284c7]" />
          <span>تحديث الطلبات</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full md:flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث برقم الطلب، اسم العميل، رقم الواتساب، أو الإيميل..."
              className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 text-slate-900 text-xs font-medium outline-none transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3 pointer-events-none" />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute top-2.5 left-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                مسح
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-auto flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 shrink-0">الحالة:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0284c7] text-slate-900 text-xs font-bold outline-none transition cursor-pointer"
            >
              <option value="all">جميع الحالات ({orders.length})</option>
              <option value="new_order">طلب جديد</option>
              <option value="contacting_customer">جاري التواصل</option>
              <option value="awaiting_customer_response">بانتظار رد العميل</option>
              <option value="payment_confirmed">تم تأكيد الدفع</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>

          {/* Product Filter */}
          <div className="w-full md:w-auto flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 shrink-0">المنتج:</span>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full md:w-48 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0284c7] text-slate-900 text-xs font-bold outline-none transition cursor-pointer"
            >
              <option value="all">جميع الاشتراكات</option>
              {distinctProducts.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results summary tag */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            يتم عرض <strong className="text-slate-900 font-bold">{filteredOrders.length}</strong> من إجمالي {orders.length} طلب
          </span>
          {(statusFilter !== 'all' || productFilter !== 'all' || search) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setProductFilter('all');
                setSearch('');
              }}
              className="text-[#0284c7] hover:underline font-bold cursor-pointer"
            >
              إلغاء الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Orders List / Table */}
      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8">
          <div className="w-10 h-10 border-4 border-sky-200 border-t-[#0284c7] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">جاري تحميل سجل الطلبات...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0284c7] flex items-center justify-center mx-auto text-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">لا توجد طلبات مطابقة للبحث</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            جرب تعديل شروط البحث أو الفلترة لعرض نتائج أخرى.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4">رقم المرجع والوقت</th>
                  <th className="py-3.5 px-4">العميل والتواصل</th>
                  <th className="py-3.5 px-4">الاشتراك والكمية</th>
                  <th className="py-3.5 px-4">الإجمالي</th>
                  <th className="py-3.5 px-4">الحالة الحالية</th>
                  <th className="py-3.5 px-4 text-center">إجراءات سريعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/70 transition cursor-pointer"
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsDrawerOpen(true);
                    }}
                  >
                    {/* Order Ref & Time */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#0284c7] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                          #{order.orderReference}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(order.id, order.orderReference);
                          }}
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
                      <div className="text-[11px] text-slate-400 mt-1 font-medium">
                        {formatDateTime(order.createdAt)}
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{order.customerName}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-emerald-700 font-bold" dir="ltr">
                          {order.customerWhatsapp}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-slate-500 truncate max-w-[150px]">
                          {order.customerEmail}
                        </span>
                      </div>
                    </td>

                    {/* Product & Quantity */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{order.productName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        الكمية: <strong className="text-slate-800">{order.quantity}</strong> × {formatPrice(order.unitPrice)}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-black text-slate-900 text-sm font-mono">
                        {formatPrice(order.totalAmount)}
                      </div>
                      {order.internalNotes && (
                        <div className="text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded mt-1 inline-block border border-sky-200">
                          يوجد ملاحظات داخلية
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                      {order.contactMethod && (
                        <div className="text-[10px] text-slate-400 mt-1">
                          تواصل عبر: {order.contactMethod}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td
                      className="py-4 px-4 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1.5">
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
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="عرض التفاصيل ومعالجة الطلب"
                        >
                          <Eye className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="lg:hidden divide-y divide-slate-100 p-3 space-y-3">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => {
                  setSelectedOrder(order);
                  setIsDrawerOpen(true);
                }}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 cursor-pointer hover:bg-slate-50/60 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#0284c7] bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                    #{order.orderReference}
                  </span>
                  <StatusBadge status={order.status} />
                </div>

                <div>
                  <h4 className="font-black text-slate-900 text-sm">{order.productName} (x{order.quantity})</h4>
                  <div className="text-xs text-slate-600 mt-1 flex items-center justify-between">
                    <span>العميل: <strong>{order.customerName}</strong></span>
                    <span className="font-mono font-black text-slate-900">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>

                <div className="text-xs font-mono text-emerald-700 bg-emerald-50/70 p-2 rounded-xl border border-emerald-100 flex items-center justify-between" dir="ltr">
                  <span>{order.customerWhatsapp}</span>
                  <span className="text-[11px] text-slate-500 font-sans">{formatDateTime(order.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                  <div className="flex-1">
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
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsDrawerOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                  >
                    معالجة
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Admin Order Drawer */}
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
