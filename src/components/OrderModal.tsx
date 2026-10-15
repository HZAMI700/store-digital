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
  ShoppingBag,
  Info,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white border border-border rounded-3xl shadow-dropdown overflow-hidden my-8">
        {/* Light Header */}
        <div className="relative px-6 py-5 border-b border-border bg-surface-secondary/70">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-1.5 rounded-full text-content-secondary hover:text-content-primary bg-white hover:bg-surface-tertiary border border-border transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary-50 border border-primary-200 text-primary-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-content-primary tracking-tight">
                Submit Order Request
              </h2>
              <p className="text-xs text-content-secondary mt-0.5">
                Manual order facilitation — No upfront payment required
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {serverError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Selected Product Summary Card */}
          <div className="p-3.5 rounded-2xl bg-surface-secondary border border-border flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-surface-tertiary overflow-hidden shrink-0 border border-border">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-content-muted text-xs">
                    Img
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-content-primary truncate">
                  {product.title}
                </div>
                <div className="text-xs text-primary-600 font-semibold">
                  {formatPrice(product.price)} <span className="text-content-muted font-normal">/ unit</span>
                </div>
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center gap-2 bg-white border border-border rounded-xl p-1 shrink-0 shadow-subtle">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-content-secondary hover:text-content-primary hover:bg-surface-secondary transition-colors"
                disabled={quantity <= 1}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-xs font-bold text-content-primary font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-content-secondary hover:text-content-primary hover:bg-surface-secondary transition-colors"
                disabled={quantity >= 10}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Customer Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-content-primary">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full h-11 px-4 text-sm bg-white border border-border rounded-xl text-content-primary placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all shadow-subtle"
            />
            {errors.name && <p className="text-rose-600 text-[11px] font-medium">{errors.name}</p>}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-content-primary">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full h-11 px-4 text-sm bg-white border border-border rounded-xl text-content-primary placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all shadow-subtle"
            />
            {errors.email && <p className="text-rose-600 text-[11px] font-medium">{errors.email}</p>}
          </div>

          {/* WhatsApp Number with Country Code */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-content-primary">
              WhatsApp Phone Number <span className="text-rose-500">*</span>
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
                className="w-full h-11 px-4 text-sm bg-white border border-l-0 border-border rounded-r-xl text-content-primary placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all shadow-subtle"
              />
            </div>
            {errors.phone ? (
              <p className="text-rose-600 text-[11px] font-medium">{errors.phone}</p>
            ) : (
              <p className="text-[11px] text-content-secondary">
                Format: Selected country code ({selectedCountry.dialCode}) + your local mobile number.
              </p>
            )}
          </div>

          {/* Optional Message */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-content-primary">
              Special Request or Notes <span className="text-content-muted font-normal text-[11px]">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Preferred language, time to contact, or specific device..."
              className="w-full px-4 py-2.5 text-xs bg-white border border-border rounded-xl text-content-primary placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all resize-none shadow-subtle"
            />
          </div>

          {/* Total & Transparency */}
          <div className="p-4 rounded-2xl bg-surface-secondary border border-border flex items-center justify-between">
            <div>
              <span className="text-xs text-content-secondary font-medium">Total Order Amount</span>
              <div className="text-xl font-extrabold text-content-primary tracking-tight">
                {formatPrice(totalPrice)}
              </div>
            </div>
            <div className="text-right text-[11px] text-content-secondary">
              <span>{quantity} × {formatPrice(unitPrice)}</span>
              <div className="text-emerald-700 font-bold flex items-center gap-1 justify-end mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pay only after confirmation</span>
              </div>
            </div>
          </div>

          {/* MANDATORY NOTICE (Requirement 1) */}
          <div className="p-4 rounded-2xl bg-primary-50 border border-primary-200 text-xs text-primary-950 flex items-start gap-3 shadow-subtle">
            <Info className="w-4 h-4 shrink-0 text-primary-600 mt-0.5" />
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
                className="mt-0.5 w-4 h-4 rounded text-primary-500 border-border focus:ring-primary-500"
              />
              <span className="text-xs text-content-primary font-medium leading-snug">
                I agree to be contacted via WhatsApp or email regarding this order request.
                <span className="text-rose-500"> *</span>
              </span>
            </label>
            {errors.consent && <p className="text-rose-600 text-[11px] font-medium pl-6">{errors.consent}</p>}
          </div>

          {/* Final Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white font-bold text-sm shadow-subtle border border-primary-600 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
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
