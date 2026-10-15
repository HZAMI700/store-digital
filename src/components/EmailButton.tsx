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
Store Administration Team`;

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
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-2.5',
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenClient}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-950/40 border border-sky-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]',
          sizeClasses[size],
          className
        )}
      >
        <Mail className="w-4 h-4 shrink-0" />
        <span>Contact via Email</span>
        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
      </button>

      {/* Confirmation & Server Email Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-dark-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-sky-400">
              <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Contact Customer via Email</h3>
                <p className="text-xs text-slate-400">Recipient: {customerEmail}</p>
              </div>
            </div>

            <div className="bg-dark-950/70 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <div className="text-slate-400 font-medium">Subject: <span className="text-slate-200">{subject}</span></div>
              <div className="text-slate-400 font-medium">Prepared Message:</div>
              <p className="text-slate-300 whitespace-pre-line text-[11px] leading-relaxed max-h-32 overflow-y-auto pr-1">
                {body}
              </p>
            </div>

            {serverEmailStatus && (
              <div className="p-2.5 rounded-lg text-xs font-medium bg-sky-950/50 border border-sky-800 text-sky-300">
                {serverEmailStatus}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSendServerEmail}
                disabled={isSendingServer}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow transition-colors"
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
                  className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLogged}
                  disabled={isRecording}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-dark-800 hover:bg-dark-700 border border-slate-700 rounded-xl transition-colors"
                >
                  {isRecording ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>I Sent via Email App (Record Date)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
