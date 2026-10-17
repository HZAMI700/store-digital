'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, CountryCode } from '@/lib/types';
import { clientStore } from '@/lib/client-store';
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
      errs.name = 'يرجى كتابة اسمك الكامل (حرفين على الأقل)';
    }
    if (!email.trim() || !isValidEmail(email)) {
      errs.email = 'يرجى إدخال بريد إلكتروني صحيح';
    }
    if (!localPhone.trim() || !isValidPhone(localPhone)) {
      errs.phone = 'يرجى إدخال رقم واتساب صحيح (6 أرقام على الأقل)';
    }
    if (quantity < 1 || quantity > 10) {
      errs.quantity = 'يجب أن تكون الكمية بين 1 و 10';
    }
    if (!consent) {
      errs.consent = 'يجب الموافقة على التواصل معك لمتابعة الطلب';
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

      // 1. Create in clientStore for instant frontend offline / zero-backend support
      const localOrder = clientStore.createOrder({
        productId: product.id,
        productName: product.title,
        quantity,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerWhatsapp: fullPhone,
        countryCode: selectedCountry.dialCode,
        customerMessage: message.trim() || null,
        unitPrice: product.price,
      });

      let orderRef = localOrder.orderReference;
      let token = localOrder.guestLookupToken;

      // 2. Also send to API if backend server is available
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.order) {
            orderRef = data.order.orderReference;
            token = data.order.guestLookupToken;
            clientStore.saveToMyOrders(data.order);
          }
        }
      } catch (apiErr) {
        // Backend offline / purely frontend mode
        console.info('Backend API skipped or offline, proceeding with client order', apiErr);
      }

      onClose();
      router.push(`/order-success/${orderRef}?token=${token}`);
    } catch (err: any) {
      console.error(err);
      setServerError(err.message || 'حدث خطأ أثناء معالجة الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-slate-100 bg-slate-50/80">
          <button
            onClick={onClose}
            className="absolute left-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-50 border border-sky-100 text-brand-primary">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                تقديم طلب شراء مباشر
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                طلب بدون دفع إلكتروني مسبق — سنتواصل معك لتأكيد البيانات
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {serverError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Product Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-primary text-lg shrink-0 shadow-sm">
                <i className={product.icon || 'fa-solid fa-gem'}></i>
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                  {product.title}
                </div>
                <div className="text-xs text-brand-primary font-bold font-mono">
                  {formatPrice(product.price)} <span className="text-slate-400 font-normal">/ وحدة</span>
                </div>
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shrink-0 shadow-sm">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30"
                disabled={quantity <= 1}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-xs font-bold text-slate-900 font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30"
                disabled={quantity >= 10}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Customer Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              الاسم الكامل <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: تركي الشمري"
              className="w-full h-11 px-4 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            />
            {errors.name && <p className="text-rose-600 text-[11px] font-semibold">{errors.name}</p>}
          </div>

          {/* Customer Email */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              البريد الإلكتروني <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full h-11 px-4 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-left"
              dir="ltr"
            />
            {errors.email && <p className="text-rose-600 text-[11px] font-semibold">{errors.email}</p>}
          </div>

          {/* WhatsApp Phone Number */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              رقم الواتساب <span className="text-rose-500">*</span>
            </label>
            <div className="flex" dir="ltr">
              <CountryCodeSelector
                selectedCode={selectedCountry.dialCode}
                onSelect={(country) => setSelectedCountry(country)}
              />
              <input
                type="tel"
                required
                value={localPhone}
                onChange={(e) => setLocalPhone(e.target.value)}
                placeholder="50 123 4567"
                className="w-full h-11 px-4 text-xs bg-slate-50 border border-l-0 border-slate-200 rounded-r-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>
            {errors.phone && <p className="text-rose-600 text-[11px] font-semibold">{errors.phone}</p>}
          </div>

          {/* Optional Message */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              ملاحظات أو طلب خاص <span className="text-slate-400 font-normal">(اختياري)</span>
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="أي تفاصيل أو رغبة في جهاز محدد..."
              className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary resize-none"
            />
          </div>

          {/* Total & Transparency */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block font-medium">إجمالي الطلب التقديري:</span>
              <div className="text-lg font-black text-brand-primary font-mono">
                {formatPrice(totalPrice)}
              </div>
            </div>
            <div className="text-left text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>الدفع بعد تواصل الإدارة</span>
            </div>
          </div>

          {/* MANDATORY NOTICE (Requirement 1) */}
          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 shrink-0 text-brand-primary mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <strong>ملاحظة هامة:</strong> سنتواصل معك مباشرة عبر الواتساب أو البريد الإلكتروني لتأكيد طلبك وتوضيح طرق الدفع وترتيب الاستلام. طلبك لا يعتبر مؤكداً حتى نتواصل معك.
            </div>
          </div>

          {/* Required Consent Checkbox */}
          <div className="space-y-1">
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-brand-primary bg-white border-slate-300 focus:ring-brand-primary"
              />
              <span className="text-xs text-slate-700 leading-snug">
                أوافق على التواصل معي عبر الواتساب أو البريد بخصوص هذا الطلب.
                <span className="text-rose-500"> *</span>
              </span>
            </label>
            {errors.consent && <p className="text-rose-600 text-[11px] font-semibold">{errors.consent}</p>}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl velto-gradient-btn hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>إرسال طلب الشراء للتواصل</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
