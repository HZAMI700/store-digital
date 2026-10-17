'use client';

import React, { useState, useEffect } from 'react';
import {
  Order,
  OrderStatus,
  ORDER_STATUSES,
  DigitalAccountInventory,
} from '@/lib/types';
import { clientStore } from '@/lib/client-store';
import { StatusBadge } from './StatusBadge';
import { WhatsAppButton } from './WhatsAppButton';
import { EmailButton } from './EmailButton';
import { formatPrice, formatDateTime } from '@/lib/utils';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  FileText,
  Key,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  Save,
  Lock,
  Copy,
  Check,
} from 'lucide-react';

interface AdminOrderDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated: (updatedOrder: Order) => void;
  inventory: DigitalAccountInventory[];
}

export const AdminOrderDrawer: React.FC<AdminOrderDrawerProps> = ({
  order,
  isOpen,
  onClose,
  onOrderUpdated,
  inventory,
}) => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(order);
  const [internalNotes, setInternalNotes] = useState(order?.internalNotes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSavedNotice, setNotesSavedNotice] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isTogglingReveal, setIsTogglingReveal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setCurrentOrder(order);
    setInternalNotes(order?.internalNotes || '');
    setSelectedInventoryId('');
    setActionError(null);
  }, [order]);

  if (!isOpen || !currentOrder) return null;

  const availableInventory = inventory.filter(
    (item) => item.productId === currentOrder.productId && !item.isAssigned
  );

  const copyToClipboard = (field: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  // Status Change Handler
  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdatingStatus(true);
    setActionError(null);
    try {
      // 1. Update clientStore immediately
      const clientUpdated = clientStore.updateOrderStatus(currentOrder.id, newStatus);
      if (clientUpdated) {
        setCurrentOrder(clientUpdated);
        onOrderUpdated(clientUpdated);
      }

      // 2. Sync to API if running
      const res = await fetch(`/api/admin/orders/${currentOrder.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setCurrentOrder(data.order);
          onOrderUpdated(data.order);
        }
      }
    } catch (err: any) {
      // If API fails but local succeeded, it still works
      console.warn('API sync warning:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save Internal Notes
  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    setActionError(null);
    try {
      // 1. Update clientStore immediately
      const clientUpdated = clientStore.updateOrderNotes(currentOrder.id, internalNotes);
      if (clientUpdated) {
        setCurrentOrder(clientUpdated);
        onOrderUpdated(clientUpdated);
      }

      // 2. Sync to API if running
      const res = await fetch(`/api/admin/orders/${currentOrder.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: internalNotes }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setCurrentOrder(data.order);
          onOrderUpdated(data.order);
        }
      }

      setNotesSavedNotice(true);
      setTimeout(() => setNotesSavedNotice(false), 2500);
    } catch (err: any) {
      console.warn('API sync warning:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Assign Inventory to Order
  const handleAssignInventory = async () => {
    if (!selectedInventoryId) return;
    setIsAssigning(true);
    setActionError(null);
    try {
      // 1. Update clientStore
      const result = clientStore.assignInventory(currentOrder.id, selectedInventoryId);
      if (result) {
        setCurrentOrder(result.order);
        onOrderUpdated(result.order);
      }

      // 2. Sync to API
      const res = await fetch(`/api/admin/orders/${currentOrder.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventoryId: selectedInventoryId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setCurrentOrder(data.order);
          onOrderUpdated(data.order);
        }
      }
    } catch (err: any) {
      console.warn('API sync warning:', err);
    } finally {
      setIsAssigning(false);
    }
  };

  // Toggle Reveal Credentials
  const handleToggleReveal = async () => {
    setIsTogglingReveal(true);
    setActionError(null);
    const targetState = !currentOrder.credentialsRevealed;
    try {
      // 1. Update clientStore
      const clientUpdated = clientStore.toggleCredentialsReveal(currentOrder.id, targetState);
      if (clientUpdated) {
        setCurrentOrder(clientUpdated);
        onOrderUpdated(clientUpdated);
      }

      // 2. Sync to API
      const res = await fetch(`/api/admin/orders/${currentOrder.id}/reveal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reveal: targetState }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setCurrentOrder(data.order);
          onOrderUpdated(data.order);
        }
      }
    } catch (err: any) {
      console.warn('API sync warning:', err);
    } finally {
      setIsTogglingReveal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col justify-between border-r border-slate-200">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black text-[#5e17eb] bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                  #{currentOrder.orderReference}
                </span>
                <StatusBadge status={currentOrder.status} />
              </div>
              <h2 className="text-lg font-black text-slate-900 mt-1">
                تفاصيل الطلب والتسليم اليدوي
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {actionError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            {/* 1. Quick Customer Contact Card */}
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#5e17eb]" />
                  <span className="text-xs font-bold text-slate-800">بيانات العميل والتواصل</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <WhatsAppButton
                    customerName={currentOrder.customerName}
                    orderReference={currentOrder.orderReference}
                    productName={currentOrder.productName}
                    whatsappNumber={currentOrder.customerWhatsapp}
                    orderId={currentOrder.id}
                    size="sm"
                    onContactRecorded={() => {
                      const updated = clientStore.recordContact(currentOrder.id, 'whatsapp');
                      if (updated) {
                        setCurrentOrder(updated);
                        onOrderUpdated(updated);
                      }
                    }}
                  />
                  <EmailButton
                    customerEmail={currentOrder.customerEmail}
                    customerName={currentOrder.customerName}
                    orderReference={currentOrder.orderReference}
                    productName={currentOrder.productName}
                    orderId={currentOrder.id}
                    size="sm"
                    onContactRecorded={() => {
                      const updated = clientStore.recordContact(currentOrder.id, 'email');
                      if (updated) {
                        setCurrentOrder(updated);
                        onOrderUpdated(updated);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[10px]">اسم العميل</span>
                    <strong className="text-slate-900">{currentOrder.customerName}</strong>
                  </div>
                  <button
                    onClick={() => copyToClipboard('name', currentOrder.customerName)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    {copiedField === 'name' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[10px]">رقم الواتساب</span>
                    <strong className="font-mono text-emerald-700 font-bold" dir="ltr">
                      {currentOrder.customerWhatsapp}
                    </strong>
                  </div>
                  <button
                    onClick={() => copyToClipboard('phone', currentOrder.customerWhatsapp)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between sm:col-span-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">البريد الإلكتروني</span>
                    <strong className="font-mono text-slate-800">{currentOrder.customerEmail}</strong>
                  </div>
                  <button
                    onClick={() => copyToClipboard('email', currentOrder.customerEmail)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {currentOrder.customerMessage && (
                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold block text-[10px] text-amber-700">رسالة / طلب خاص من العميل:</span>
                  <p className="mt-0.5">{currentOrder.customerMessage}</p>
                </div>
              )}
            </div>

            {/* 2. Order Summary & Price */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <span className="text-xs font-bold text-slate-800 block">تفاصيل الاشتراك والمبلغ</span>
              <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{currentOrder.productName}</span>
                  <span className="text-slate-500 text-[11px]">الكمية: {currentOrder.quantity} حساب</span>
                </div>
                <div className="text-left font-mono">
                  <span className="text-base font-black text-[#5e17eb]">{formatPrice(currentOrder.totalAmount)}</span>
                  <span className="text-[10px] text-slate-400 block">{formatPrice(currentOrder.unitPrice)} لكل حساب</span>
                </div>
              </div>
            </div>

            {/* 3. Status Transition Picker */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <span className="text-xs font-bold text-slate-800 block">تحديث حالة الطلب</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.values(ORDER_STATUSES).map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    disabled={isUpdatingStatus || currentOrder.status === s.key}
                    onClick={() => handleStatusChange(s.key)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      currentOrder.status === s.key
                        ? 'bg-[#5e17eb] text-white border-[#5e17eb] shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Inventory Fulfillment Vault Section */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#5e17eb]" />
                <span className="text-xs font-bold text-slate-800">بيانات الحساب والتسليم المشفر</span>
              </div>

              {currentOrder.assignedInventoryId || currentOrder.deliveredCredentials ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>تم ربط بيانات الحساب بهذا الطلب</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleToggleReveal}
                        disabled={isTogglingReveal}
                        className="text-xs font-bold text-slate-700 hover:text-slate-900 underline flex items-center gap-1"
                      >
                        {currentOrder.credentialsRevealed ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>إخفاء عن صفحة التتبع</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>كشف للعميل في التتبع</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-emerald-200 font-mono text-xs text-slate-800 select-all" dir="ltr">
                      {currentOrder.deliveredCredentials || 'تم إسناد المعرف: ' + currentOrder.assignedInventoryId}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    اختر حساباً جاهزاً من البنك المشفر لإسناده وتسليمه لهذا العميل:
                  </p>
                  {availableInventory.length === 0 ? (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                      لا تتوفر حسابات غير مسندة لهذا المنتج في المخزون حالياً. يمكنك إيداع حسابات من صفحة بنك الحسابات.
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedInventoryId}
                        onChange={(e) => setSelectedInventoryId(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none"
                      >
                        <option value="">-- اختر حساباً متوفراً من البنك --</option>
                        {availableInventory.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.id} - {item.accountData.substring(0, 30)}...
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAssignInventory}
                        disabled={!selectedInventoryId || isAssigning}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition"
                      >
                        إسناد وتسليم
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 5. Internal Admin Notes (Hidden from customer) */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-slate-800">ملاحظات الإدارة الداخلية (سرية)</span>
                </div>
                {notesSavedNotice && (
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>تم الحفظ</span>
                  </span>
                )}
              </div>
              <textarea
                rows={3}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="أضف ملاحظات إدارية، رقم التحويل البنكي، أو أي تدوينات خاصة بالمشرف..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:bg-white focus:border-[#5e17eb]"
              />
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="px-4 py-2 bg-[#5e17eb] hover:bg-[#4f0ecf] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>حفظ الملاحظة</span>
              </button>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              معرف النظام: {currentOrder.id}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition"
            >
              إغلاق
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
