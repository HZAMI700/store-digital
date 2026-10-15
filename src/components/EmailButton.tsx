'use client';

import React, { useState } from 'react';
import { Mail, ExternalLink, Send, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailButtonProps {
  customerName: string;
  orderReference: string;
  productName: string;
  customerEmail: string;
  orderId: string;
  onContactRecorded?: (timestamp: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EmailButton: React.FC<EmailButtonProps> = ({
  customerName,
  orderReference,
  productName,
  customerEmail,
  orderId,
  onContactRecorded,
  className,
  size = 'md',
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSendingServer, setIsSendingServer] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [serverEmailStatus, setServerEmailStatus] = useState<string | null>(null);

  const subject = `Update on Order #${orderReference} - ${productName}`;
  const body = `Hello ${customerName},

Thank you for your order request (#${orderReference}) for ${productName}.

We are reaching out to verify your request and explain the available payment methods so we can prepare your digital account.

Please reply to this email or reach us on WhatsApp at your earliest convenience.

Best regards,
Apex Store Administration Team`;

  const mailtoUrl = `mailto:${encodeURIComponent(customerEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  const handleOpenClient = () => {
    window.location.href = mailtoUrl;
    setShowConfirmModal(true);
  };

  const handleSendServerEmail = async () => {
    setIsSendingServer(true);
    setServerEmailStatus(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'email',
          sendDirect: true,
          subject,
          body,
          timestamp: new Date().toISOString(),
          note: `Transactional email sent to ${customerEmail}`,
        }),
      });

      if (res.ok) {
        setServerEmailStatus('Email sent successfully!');
        const now = new Date().toISOString();
        onContactRecorded?.(now);
        setTimeout(() => setShowConfirmModal(false), 1200);
      } else {
        setServerEmailStatus('Failed to send transactional email.');
      }
    } catch (err) {
      setServerEmailStatus('Error connecting to email service.');
    } finally {
      setIsSendingServer(false);
    }
  };

  const handleConfirmLogged = async () => {
    setIsRecording(true);
    try {
      const now = new Date().toISOString();
      const res = await fetch(`/api/admin/orders/${orderId}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'email',
          timestamp: now,
          note: `Email client opened for ${customerEmail}`,
        }),
      });

      if (res.ok) {
        onContactRecorded?.(now);
      }
    } catch (err) {
      console.error('Failed to log email contact', err);
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
        onClick={handleOpenClient}
        className={cn(
          'inline-flex items-center justify-center font-bold rounded-xl bg-primary-500 hover:bg-primary-600 text-white shadow-subtle border border-primary-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]',
          sizeClasses[size],
          className
        )}
      >
        <Mail className="w-4 h-4 shrink-0" />
        <span>Contact via Email</span>
        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
      </button>

      {/* Confirmation & Server Email Modal in Pure Light Mode */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-border rounded-3xl p-6 shadow-dropdown space-y-4">
            <div className="flex items-center gap-3 text-primary-600">
              <div className="p-2.5 rounded-2xl bg-primary-50 border border-primary-200">
                <Mail className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-content-primary">Contact via Email</h3>
                <p className="text-xs text-content-secondary font-mono">To: {customerEmail}</p>
              </div>
            </div>

            <div className="bg-surface-secondary p-3.5 rounded-2xl border border-border text-xs text-content-primary space-y-1.5">
              <div className="text-content-secondary font-semibold">Subject: <span className="text-content-primary">{subject}</span></div>
              <div className="text-content-secondary font-semibold">Prepared Message:</div>
              <p className="text-content-primary whitespace-pre-line text-[11px] leading-relaxed max-h-32 overflow-y-auto pr-1">
                {body}
              </p>
            </div>

            {serverEmailStatus && (
              <div className="p-2.5 rounded-xl text-xs font-semibold bg-primary-50 border border-primary-200 text-primary-700">
                {serverEmailStatus}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSendServerEmail}
                disabled={isSendingServer}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 rounded-xl shadow-subtle transition-colors"
              >
                {isSendingServer ? (
                  <Clock className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Send Directly via Server Email (Resend/SMTP)</span>
              </button>

              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-content-secondary hover:text-content-primary bg-surface-secondary hover:bg-surface-tertiary rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLogged}
                  disabled={isRecording}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-content-primary hover:text-primary-600 bg-white hover:bg-surface-secondary border border-border rounded-xl transition-colors"
                >
                  {isRecording ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>Record Client Sent</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
