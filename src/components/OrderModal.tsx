'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, CountryCode } from '@/lib/types';
import { CountryCodeSelector } from './CountryCodeSelector';
import { POPULAR_COUNTRIES } from '@/lib/countries';
import { formatPrice, isValidEmail, isValidPhone, sanitizePhoneNumber } from '@/lib/utils';
import {
  X,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  Info,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Lock,
} from 'lucide-react';

interface OrderModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  userProfile?: {
    name?: string;
    email?: string;
    whatsapp?: string;
    countryCode?: string;
  } | null;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  product,
  isOpen,
  onClose,
  userProfile,
}) => {
  const router = useRouter();

  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [localPhone, setLocalPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(POPULAR_COUNTRIES[0]);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Update when userProfile arrives
  useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setName(userProfile.name);
      if (userProfile.email) setEmail(userProfile.email);
      if (userProfile.whatsapp) setLocalPhone(userProfile.whatsapp);
      if (userProfile.countryCode) {
        const found = POPULAR_COUNTRIES.find((c) => c.dialCode === userProfile.countryCode);
        if (found) setSelectedCountry(found);
      }
    }
  }, [userProfile]);

  if (!isOpen) return null;

  const unitPrice = product.price;
  const totalPrice = unitPrice * quantity;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      errs.name = 'Please provide your full name (minimum 2 characters)';
    }
    if (!email.trim() || !isValidEmail(email)) {
      errs.email = 'Please provide a valid email address';
    }
    if (!localPhone.trim() || !isValidPhone(localPhone)) {
      errs.phone = 'Please provide a valid WhatsApp number (minimum 6 digits)';
    }
    if (quantity < 1 || quantity > 10) {
      errs.quantity = 'Quantity must be between 1 and 10';
    }
    if (!consent) {
      errs.consent = 'You must consent to being contacted to proceed with your order';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const fullPhone = sanitizePhoneNumber(selectedCountry.dialCode, localPhone);

      const payload = {
        productId: product.id,
        productName: product.title,
        quantity,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerWhatsapp: fullPhone,
        countryCode: selectedCountry.dialCode,
        customerMessage: message.trim() || null,
        consentGiven: consent,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit order request');
      }

      // Close modal and redirect to polished confirmation page
      onClose();
      router.push(`/order-success/${data.order.orderReference}?token=${data.order.guestLookupToken}`);
    } catch (err: any) {
      console.error(err);
      setServerError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-dark-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Glow Header */}
        <div className="relative px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-sky-950/40 via-dark-900 to-indigo-950/40">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Submit Order Request
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manual order facilitation — No upfront payment required
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {serverError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Selected Product Summary Card */}
          <div className="p-3.5 rounded-2xl bg-dark-950/80 border border-slate-800/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                    Img
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-slate-100 truncate">
                  {product.title}
                </div>
                <div className="text-xs text-sky-400 font-medium">
                  {formatPrice(product.price)} <span className="text-slate-500">/ unit</span>
                </div>
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center gap-2 bg-dark-850 border border-slate-700/60 rounded-xl p-1 shrink-0">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-750 transition-colors"
                disabled={quantity <= 1}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-xs font-bold text-slate-100 font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-750 transition-colors"
                disabled={quantity >= 10}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Customer Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Full Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full h-11 px-4 text-sm bg-dark-850 border border-slate-700/70 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
            />
            {errors.name && <p className="text-rose-400 text-[11px]">{errors.name}</p>}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Email Address <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full h-11 px-4 text-sm bg-dark-850 border border-slate-700/70 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
            />
            {errors.email && <p className="text-rose-400 text-[11px]">{errors.email}</p>}
          </div>

          {/* WhatsApp Number with Country Code */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              WhatsApp Phone Number <span className="text-rose-400">*</span>
            </label>
            <div className="flex">
              <CountryCodeSelector
                selectedCode={selectedCountry.dialCode}
                onSelect={(country) => setSelectedCountry(country)}
              />
              <input
                type="tel"
                required
                value={localPhone}
                onChange={(e) => setLocalPhone(e.target.value)}
                placeholder="29 482 109 or 555 1234"
                className="w-full h-11 px-4 text-sm bg-dark-850 border border-l-0 border-slate-700/70 rounded-r-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
              />
            </div>
            {errors.phone ? (
              <p className="text-rose-400 text-[11px]">{errors.phone}</p>
            ) : (
              <p className="text-[11px] text-slate-500">
                Format: Selected country code ({selectedCountry.dialCode}) + your local mobile number.
              </p>
            )}
          </div>

          {/* Optional Message */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Special Request or Notes <span className="text-slate-500 text-[11px]">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Preferred language, time to contact, or specific device..."
              className="w-full px-4 py-2.5 text-xs bg-dark-850 border border-slate-700/70 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all resize-none"
            />
          </div>

          {/* Total & Transparency */}
          <div className="p-3.5 rounded-2xl bg-dark-950 border border-slate-800/90 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Total Order Amount</span>
              <div className="text-lg font-bold text-white tracking-tight">
                {formatPrice(totalPrice)}
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <span>{quantity} × {formatPrice(unitPrice)}</span>
              <div className="text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Pay only after confirmation</span>
              </div>
            </div>
          </div>

          {/* MANDATORY NOTICE (As specified in requirement 1) */}
          <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-800/60 text-xs text-sky-200/90 flex items-start gap-3">
            <Info className="w-4 h-4 shrink-0 text-sky-400 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Notice:</strong> We'll contact you through WhatsApp or email to confirm your order, explain the payment process, and arrange delivery. Your order is not confirmed until we contact you.
            </div>
          </div>

          {/* Required Consent Checkbox */}
          <div className="space-y-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-sky-500 bg-dark-850 border-slate-700 focus:ring-sky-500 focus:ring-offset-dark-900"
              />
              <span className="text-xs text-slate-300 leading-snug">
                I agree to be contacted via WhatsApp or email regarding this order request.
                <span className="text-rose-400"> *</span>
              </span>
            </label>
            {errors.consent && <p className="text-rose-400 text-[11px] pl-6">{errors.consent}</p>}
          </div>

          {/* Final Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-950/50 border border-sky-400/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Order Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
