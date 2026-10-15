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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white border-l border-border h-full overflow-y-auto flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="sticky top-0 z-20 px-6 py-4 bg-white/95 backdrop-blur-md border-b border-border flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-extrabold text-primary-600">
                #{currentOrder.orderReference}
              </span>
              <StatusBadge status={currentOrder.status} />
            </div>
            <div className="text-xs text-content-secondary mt-0.5">
              Submitted: {formatDateTime(currentOrder.createdAt)}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-content-secondary hover:text-content-primary bg-surface-secondary hover:bg-surface-tertiary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {actionError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{actionError}</span>
            </div>
          )}

          {/* QUICK CONTACT ACTIONS (Requirement 4) */}
          <div className="p-4 rounded-3xl bg-surface-secondary border border-border space-y-3 shadow-subtle">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-content-primary uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-primary-500" />
                <span>Direct Customer Contact Actions</span>
              </h3>
              {currentOrder.contactedAt && (
                <span className="text-[11px] text-emerald-700 font-semibold">
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
          <div className="p-4 rounded-3xl bg-surface-secondary border border-border space-y-2.5 shadow-subtle">
            <label className="block text-xs font-bold text-content-primary uppercase tracking-wider">
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
                        ? `${conf.badgeBg} ${conf.badgeBorder} ${conf.badgeText} font-bold ring-2 ring-primary-500/30 shadow-subtle`
                        : 'bg-white border-border text-content-secondary hover:text-content-primary hover:border-border-strong'
                    }`}
                  >
                    <span>{conf.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0 text-primary-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CUSTOMER CONTACT INFORMATION */}
          <div className="p-4 rounded-3xl bg-surface-secondary border border-border space-y-3 shadow-subtle">
            <h3 className="text-xs font-bold text-content-primary uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary-500" />
              <span>Customer Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-content-secondary block">Name</span>
                <span className="font-bold text-content-primary">{currentOrder.customerName}</span>
              </div>
              <div>
                <span className="text-content-secondary block">Email Address</span>
                <span className="font-mono text-content-primary">{currentOrder.customerEmail}</span>
              </div>
              <div>
                <span className="text-content-secondary block">WhatsApp Phone</span>
                <span className="font-mono text-emerald-700 font-bold">
                  {currentOrder.customerWhatsapp}
                </span>
              </div>
              <div>
                <span className="text-content-secondary block">Account Status</span>
                <span className="text-content-primary font-medium">
                  {currentOrder.customerId ? 'Registered Customer' : 'Guest Request'}
                </span>
              </div>
            </div>

            {currentOrder.customerMessage && (
              <div className="mt-3 p-3 rounded-2xl bg-white border border-border text-xs">
                <span className="text-content-secondary font-semibold block mb-1">Customer Note:</span>
                <p className="text-content-primary italic">"{currentOrder.customerMessage}"</p>
              </div>
            )}
          </div>

          {/* ORDERED PRODUCT & FINANCIALS */}
          <div className="p-4 rounded-3xl bg-surface-secondary border border-border space-y-3 shadow-subtle">
            <h3 className="text-xs font-bold text-content-primary uppercase tracking-wider">
              Product & Financial Snapshot
            </h3>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-border">
              <div>
                <div className="font-bold text-sm text-content-primary">{currentOrder.productName}</div>
                <div className="text-xs text-content-secondary">
                  Quantity: <span className="font-bold text-content-primary">{currentOrder.quantity}</span> × {formatPrice(currentOrder.unitPrice)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-content-secondary uppercase tracking-wider block">Total Amount</span>
                <span className="text-base font-black text-content-primary">
                  {formatPrice(currentOrder.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* INVENTORY ALLOCATION & SAFE DELIVERY (Requirement 6) */}
          <div className="p-4 rounded-3xl bg-surface-secondary border border-border space-y-3 shadow-subtle">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-content-primary uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-500" />
                <span>Digital Account Delivery Vault</span>
              </h3>
              <span className="text-[10px] text-content-secondary font-medium">Single-use Protection</span>
            </div>

            {currentOrder.deliveredCredentials ? (
              <div className="p-3.5 rounded-2xl bg-white border border-emerald-300 space-y-3 shadow-subtle">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Credentials Assigned to Order</span>
                  </div>

                  {/* Reveal to Customer Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleReveal(!currentOrder.credentialsRevealed)}
                    disabled={isTogglingReveal}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                      currentOrder.credentialsRevealed
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-surface-secondary border-border text-content-secondary hover:text-content-primary'
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

                <div className="bg-surface-secondary p-3 rounded-xl border border-border font-mono text-xs text-content-primary select-all whitespace-pre-wrap break-all">
                  {currentOrder.deliveredCredentials}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-content-secondary leading-relaxed">
                  Assign available stock credentials to this order once payment is confirmed.
                  Single-use safety locks guarantee an account cannot be assigned twice.
                </p>

                {availableInventory.length === 0 ? (
                  <div className="p-3 rounded-2xl bg-white border border-border text-xs text-content-secondary flex items-center justify-between">
                    <span>No unassigned stock available for this product in vault.</span>
                    <span className="text-amber-700 font-semibold text-[11px]">Deliver manually via WhatsApp</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedInventoryId}
                      onChange={(e) => setSelectedInventoryId(e.target.value)}
                      className="flex-1 h-10 px-3 bg-white border border-border rounded-xl text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-subtle"
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
                      className="h-10 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-colors shadow-subtle"
                    >
                      {isAssigning ? 'Assigning...' : 'Assign Account'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* INTERNAL ADMIN NOTES (Strictly Administrator Only) */}
          <div className="p-4 rounded-3xl bg-surface-secondary border border-border space-y-2 shadow-subtle">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-content-primary uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary-500" />
                <span>Internal Admin Notes (Private)</span>
              </label>
              {notesSavedNotice && (
                <span className="text-[11px] text-emerald-700 font-bold animate-in fade-in">
                  Saved successfully!
                </span>
              )}
            </div>

            <textarea
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Private notes (payment transaction ID, customer preferences, follow-up schedule). Never visible to customers."
              className="w-full p-3 text-xs bg-white border border-border rounded-xl text-content-primary placeholder-content-muted focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none shadow-subtle"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-surface-secondary border border-border text-xs font-bold text-content-primary rounded-xl transition-colors shadow-subtle"
              >
                <Save className="w-3.5 h-3.5 text-primary-500" />
                <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
