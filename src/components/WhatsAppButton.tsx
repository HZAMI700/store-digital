'use client';

import React, { useState } from 'react';
import { MessageSquare, ExternalLink, Check, Clock } from 'lucide-react';
import { getCleanInternationalNumber, cn } from '@/lib/utils';

interface WhatsAppButtonProps {
  customerName: string;
  orderReference: string;
  productName: string;
  whatsappNumber: string;
  orderId: string;
  onContactRecorded?: (timestamp: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  customerName,
  orderReference,
  productName,
  whatsappNumber,
  orderId,
  onContactRecorded,
  className,
  size = 'md',
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Clean phone number (only digits, no plus or spaces)
  const cleanPhone = getCleanInternationalNumber(whatsappNumber);

  // Safe greeting message - STRICTLY NO PASSWORDS OR SENSITIVE CREDENTIALS IN URL
  const defaultText = `Hello ${customerName}, we're contacting you regarding order #${orderReference} for ${productName}. Let's confirm the details of your order.`;
  const encodedText = encodeURIComponent(defaultText);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

  const handleOpenWhatsApp = () => {
    // Open in new tab
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    // Prompt administrator to confirm whether contact attempt should be logged
    setShowConfirmModal(true);
  };

  const handleConfirmLogged = async () => {
    setIsRecording(true);
    try {
      const now = new Date().toISOString();
      const res = await fetch(`/api/admin/orders/${orderId}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'whatsapp',
          timestamp: now,
          note: `WhatsApp message initiated: "${defaultText}"`,
        }),
      });

      if (res.ok) {
        onContactRecorded?.(now);
      }
    } catch (err) {
      console.error('Failed to log WhatsApp contact', err);
    } finally {
      setIsRecording(false);
      setShowConfirmModal(false);
    }
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-2.5',
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenWhatsApp}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]',
          sizeClasses[size],
          className
        )}
      >
        <MessageSquare className="w-4 h-4 shrink-0 fill-current" />
        <span>Contact via WhatsApp</span>
        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
      </button>

      {/* Confirmation Dialog to guarantee accurate logging */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-dark-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-400">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">WhatsApp Window Opened</h3>
                <p className="text-xs text-slate-400">Did you establish contact with the customer?</p>
              </div>
            </div>

            <div className="bg-dark-950/70 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="text-slate-400 font-medium">Prepared Message:</div>
              <p className="italic text-slate-200">"{defaultText}"</p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Recording this action updates the order status timeline and logs the contact timestamp.
              If the message could not be sent, do not mark as contacted.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-colors"
              >
                No, Skip Recording
              </button>
              <button
                type="button"
                onClick={handleConfirmLogged}
                disabled={isRecording}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow transition-colors"
              >
                {isRecording ? (
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Yes, Record Contact Attempt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
