'use client';

import React, { useState, useEffect } from 'react';
import {
  Order,
  OrderStatus,
  ORDER_STATUSES,
  DigitalAccountInventory,
} from '@/lib/types';
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

  useEffect(() => {
    setCurrentOrder(order);
    setInternalNotes(order?.internalNotes || '');
    setSelectedInventoryId('');
    setActionError(null);
  }, [order]);

  if (!isOpen || !currentOrder) return null;

  // Filter available inventory for this product
  const availableInventory = inventory.filter(
    (item) => item.productId === currentOrder.productId && !item.isAssigned
  );

  // Status Change Handler
  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdatingStatus(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/orders/${currentOrder.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCurrentOrder(data.order);
      onOrderUpdated(data.order);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save Internal Notes
  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/orders/${currentOrder.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: internalNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCurrentOrder(data.order);
      onOrderUpdated(data.order);
      setNotesSavedNotice(true);
      setTimeout(() => setNotesSavedNotice(false), 2500);
    } catch (err: any) {
      setActionError(err.message || 'Failed to save notes');
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
      const res = await fetch(`/api/admin/orders/${currentOrder.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventoryId: selectedInventoryId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCurrentOrder(data.order);
      onOrderUpdated(data.order);
    } catch (err: any) {
      setActionError(err.message || 'Failed to assign inventory');
    } finally {
      setIsAssigning(false);
    }
  };

  // Toggle Reveal Credentials
  const handleToggleReveal = async (revealed: boolean) => {
    setIsTogglingReveal(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/orders/${currentOrder.id}/reveal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revealed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCurrentOrder(data.order);
      onOrderUpdated(data.order);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update credential visibility');
    } finally {
      setIsTogglingReveal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-dark-900 border-l border-slate-700/80 h-full overflow-y-auto flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="sticky top-0 z-20 px-6 py-4 bg-dark-900/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-extrabold text-sky-400">
                #{currentOrder.orderReference}
              </span>
              <StatusBadge status={currentOrder.status} />
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Submitted: {formatDateTime(currentOrder.createdAt)}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {actionError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{actionError}</span>
            </div>
          )}

          {/* QUICK CONTACT ACTIONS (Requirement 4) */}
          <div className="p-4 rounded-2xl bg-dark-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <span>Direct Customer Contact Actions</span>
              </h3>
              {currentOrder.contactedAt && (
                <span className="text-[11px] text-emerald-400 font-medium">
                  Last contacted via {currentOrder.contactMethod?.toUpperCase()}:{' '}
                  {formatDateTime(currentOrder.contactedAt)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <WhatsAppButton
                customerName={currentOrder.customerName}
                orderReference={currentOrder.orderReference}
                productName={currentOrder.productName}
                whatsappNumber={currentOrder.customerWhatsapp}
                orderId={currentOrder.id}
                onContactRecorded={(ts) => {
                  const updated: Order = {
                    ...currentOrder,
                    contactMethod: 'whatsapp',
                    contactedAt: ts,
                    status:
                      currentOrder.status === 'new_order'
                        ? 'contacting_customer'
                        : currentOrder.status,
                  };
                  setCurrentOrder(updated);
                  onOrderUpdated(updated);
                }}
              />

              <EmailButton
                customerName={currentOrder.customerName}
                orderReference={currentOrder.orderReference}
                productName={currentOrder.productName}
                customerEmail={currentOrder.customerEmail}
                orderId={currentOrder.id}
                onContactRecorded={(ts) => {
                  const updated: Order = {
                    ...currentOrder,
                    contactMethod: 'email',
                    contactedAt: ts,
                    status:
                      currentOrder.status === 'new_order'
                        ? 'contacting_customer'
                        : currentOrder.status,
                  };
                  setCurrentOrder(updated);
                  onOrderUpdated(updated);
                }}
              />
            </div>
          </div>

          {/* STATUS SELECTOR (All 8 Statuses) */}
          <div className="p-4 rounded-2xl bg-dark-950 border border-slate-800 space-y-2.5">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              Change Order Status
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.keys(ORDER_STATUSES) as OrderStatus[]).map((key) => {
                const conf = ORDER_STATUSES[key];
                const isSelected = currentOrder.status === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleStatusChange(key)}
                    disabled={isUpdatingStatus}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-all ${
                      isSelected
                        ? `${conf.badgeBg} ${conf.badgeBorder} ${conf.badgeText} font-bold ring-1 ring-sky-500/40`
                        : 'bg-dark-900 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span>{conf.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CUSTOMER CONTACT INFORMATION */}
          <div className="p-4 rounded-2xl bg-dark-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-sky-400" />
              <span>Customer Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Name</span>
                <span className="font-semibold text-slate-100">{currentOrder.customerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Email Address</span>
                <span className="font-mono text-slate-200">{currentOrder.customerEmail}</span>
              </div>
              <div>
                <span className="text-slate-500 block">WhatsApp Phone</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {currentOrder.customerWhatsapp}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Account Status</span>
                <span className="text-slate-300">
                  {currentOrder.customerId ? 'Registered Customer' : 'Guest Request'}
                </span>
              </div>
            </div>

            {currentOrder.customerMessage && (
              <div className="mt-3 p-3 rounded-xl bg-dark-900 border border-slate-800 text-xs">
                <span className="text-slate-400 font-medium block mb-1">Customer Note:</span>
                <p className="text-slate-200 italic">"{currentOrder.customerMessage}"</p>
              </div>
            )}
          </div>

          {/* ORDERED PRODUCT & FINANCIALS */}
          <div className="p-4 rounded-2xl bg-dark-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Product & Financial Snapshot
            </h3>

            <div className="flex items-center justify-between p-3 rounded-xl bg-dark-900 border border-slate-800">
              <div>
                <div className="font-bold text-sm text-slate-100">{currentOrder.productName}</div>
                <div className="text-xs text-slate-400">
                  Quantity: <span className="font-bold text-slate-200">{currentOrder.quantity}</span> × {formatPrice(currentOrder.unitPrice)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Total Amount</span>
                <span className="text-base font-extrabold text-white">
                  {formatPrice(currentOrder.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* INVENTORY ALLOCATION & SAFE DELIVERY (Requirement 6) */}
          <div className="p-4 rounded-2xl bg-dark-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Digital Account Delivery Vault</span>
              </h3>
              <span className="text-[10px] text-slate-500">Single-use Protection</span>
            </div>

            {currentOrder.deliveredCredentials ? (
              <div className="p-3.5 rounded-xl bg-dark-900 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Credentials Assigned to Order</span>
                  </div>

                  {/* Reveal to Customer Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleReveal(!currentOrder.credentialsRevealed)}
                    disabled={isTogglingReveal}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      currentOrder.credentialsRevealed
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : 'bg-dark-850 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {currentOrder.credentialsRevealed ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Revealed to Customer</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hidden (Click to Reveal)</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-dark-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-slate-200 select-all whitespace-pre-wrap break-all">
                  {currentOrder.deliveredCredentials}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Assign available stock credentials to this order once payment is confirmed.
                  Single-use safety locks guarantee an account cannot be assigned twice.
                </p>

                {availableInventory.length === 0 ? (
                  <div className="p-3 rounded-xl bg-dark-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                    <span>No unassigned stock available for this product in vault.</span>
                    <span className="text-amber-400 text-[11px]">Deliver manually via WhatsApp</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedInventoryId}
                      onChange={(e) => setSelectedInventoryId(e.target.value)}
                      className="flex-1 h-10 px-3 bg-dark-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="">Select an available account from vault...</option>
                      {availableInventory.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.accountData.slice(0, 45)}...
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleAssignInventory}
                      disabled={!selectedInventoryId || isAssigning}
                      className="h-10 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors"
                    >
                      {isAssigning ? 'Assigning...' : 'Assign Account'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* INTERNAL ADMIN NOTES (Strictly Administrator Only) */}
          <div className="p-4 rounded-2xl bg-dark-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Internal Admin Notes (Private)</span>
              </label>
              {notesSavedNotice && (
                <span className="text-[11px] text-emerald-400 font-semibold animate-in fade-in">
                  Saved successfully!
                </span>
              )}
            </div>

            <textarea
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Private notes (payment transaction ID, customer preferences, follow-up schedule). Never visible to customers."
              className="w-full p-3 text-xs bg-dark-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dark-850 hover:bg-dark-800 border border-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
