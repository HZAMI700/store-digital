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
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-2.5',
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenWhatsApp}
        className={cn(
          'inline-flex items-center justify-center font-bold rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-subtle border border-[#20BD5A]/30 transition-all hover:scale-[1.02] active:scale-[0.98]',
          sizeClasses[size],
          className
        )}
      >
        <MessageSquare className="w-4 h-4 shrink-0 fill-current" />
        <span>Contact via WhatsApp</span>
        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
      </button>

      {/* Confirmation Dialog in Pure Light Mode */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-border rounded-3xl p-6 shadow-dropdown space-y-4">
            <div className="flex items-center gap-3 text-[#20BD5A]">
              <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <MessageSquare className="w-6 h-6 text-[#20BD5A]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-content-primary">WhatsApp Opened</h3>
                <p className="text-xs text-content-secondary">Did you connect with the customer?</p>
              </div>
            </div>

            <div className="bg-surface-secondary p-3.5 rounded-2xl border border-border text-xs text-content-primary space-y-1">
              <div className="text-content-secondary font-semibold">Prepared Message:</div>
              <p className="italic text-content-primary">"{defaultText}"</p>
            </div>

            <p className="text-xs text-content-secondary leading-relaxed">
              Recording this action updates the order status timeline to <strong>Contacting Customer</strong> and logs the exact contact timestamp.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-content-secondary hover:text-content-primary bg-surface-secondary hover:bg-surface-tertiary rounded-xl transition-colors"
              >
                Skip Recording
              </button>
              <button
                type="button"
                onClick={handleConfirmLogged}
                disabled={isRecording}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20BD5A] rounded-xl shadow-subtle transition-colors"
              >
                {isRecording ? (
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Record Contact Attempt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
