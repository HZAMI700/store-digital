'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { CountryCodeSelector } from './CountryCodeSelector';
import { POPULAR_COUNTRIES } from '@/lib/countries';
import { CountryCode } from '@/lib/types';
import { formatPrice, isValidEmail, isValidPhone, sanitizePhoneNumber } from '@/lib/utils';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Info,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const { cart, removeFromCart, updateQty, clearCart, isCartOpen, setIsCartOpen, totalPrice } =
    useCart();

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [localPhone, setLocalPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(POPULAR_COUNTRIES[0]);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isCartOpen) return null;

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
    if (!consent) {
      errs.consent = 'يجب الموافقة على التواصل معك لمتابعة الطلب';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (cart.length === 0) return;
    if (!validate()) return;

    setIsSubmittingOrder(true);

    try {
      const fullPhone = sanitizePhoneNumber(selectedCountry.dialCode, localPhone);
      // For multi-item cart, summarize products in order
      const primaryProduct = cart[0];
      const itemsSummary = cart.map((i) => `${i.title} (x${i.qty})`).join(' + ');

      const payload = {
        productId: primaryProduct.id,
        productName: cart.length === 1 ? primaryProduct.title : `سلة مشتريات: ${itemsSummary}`,
        quantity: cart.reduce((sum, item) => sum + item.qty, 0),
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerWhatsapp: fullPhone,
        countryCode: selectedCountry.dialCode,
        customerMessage: message.trim()
          ? `${message.trim()} [سلة مشتريات: ${itemsSummary}]`
          : `سلة مشتريات: ${itemsSummary}`,
        consentGiven: consent,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'تعذر إرسال الطلب، يرجى المحاولة لاحقاً');
      }

      clearCart();
      setIsCartOpen(false);
      setShowOrderForm(false);
      router.push(`/order-success/${data.order.orderReference}?token=${data.order.guestLookupToken}`);
    } catch (err: any) {
      setServerError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-start animate-in fade-in duration-200">
      <div className="h-full w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between p-6 overflow-hidden">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="font-extrabold text-lg flex items-center gap-2 text-slate-900">
            <i className="fa-solid fa-bag-shopping text-indigo-600"></i>
            <span>سلة المشتريات</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
              {cart.reduce((s, i) => s + i.qty, 0)} منتجات
            </span>
          </h3>
          <button
            onClick={() => {
              setIsCartOpen(false);
              setShowOrderForm(false);
            }}
            className="text-slate-400 hover:text-slate-700 text-lg p-1 transition"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto text-2xl">
                <i className="fa-solid fa-cart-shopping"></i>
              </div>
              <p className="text-slate-500 text-sm font-medium">السلة فارغة حالياً</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-bold"
              >
                تصفح المنتجات والعروض ←
              </button>
            </div>
          ) : !showOrderForm ? (
            /* Items List View */
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{item.title}</h4>
                    <div className="text-xs text-indigo-600 font-extrabold">
                      {formatPrice(item.price)}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shrink-0 shadow-sm">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-slate-900 font-mono">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-rose-500 hover:text-rose-700 text-sm p-1.5 transition"
                    title="حذف من السلة"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Fast Manual Order Contact Form */
            <form id="cartCheckoutForm" onSubmit={handleCheckoutSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setShowOrderForm(false)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1.5 mb-2"
              >
                <i className="fa-solid fa-arrow-right"></i>
                <span>العودة لتعديل السلة</span>
              </button>

              {serverError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{serverError}</span>
                </div>
              )}

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
                  placeholder="مثال: عبدالله العتيبي"
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
                {errors.name && <p className="text-rose-600 text-[11px] font-semibold">{errors.name}</p>}
              </div>

              {/* Email */}
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
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-left"
                  dir="ltr"
                />
                {errors.email && <p className="text-rose-600 text-[11px] font-semibold">{errors.email}</p>}
              </div>

              {/* WhatsApp Number with Country Code */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  رقم الواتساب <span className="text-rose-500">*</span>
                </label>
                <div className="flex" dir="ltr">
                  <CountryCodeSelector
                    selectedCode={selectedCountry.dialCode}
                    onSelect={(c) => setSelectedCountry(c)}
                  />
                  <input
                    type="tel"
                    required
                    value={localPhone}
                    onChange={(e) => setLocalPhone(e.target.value)}
                    placeholder="50 123 4567"
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-l-0 border-slate-200 rounded-r-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                {errors.phone && <p className="text-rose-600 text-[11px] font-semibold">{errors.phone}</p>}
              </div>

              {/* Optional message */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  ملاحظات أو طلب خاص <span className="text-slate-400 font-normal">(اختياري)</span>
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="أي تفاصيل ترغب في توضيحها..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none"
                />
              </div>

              {/* MANDATORY NOTICE (Requirement 1) */}
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
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
                    className="mt-0.5 w-4 h-4 rounded text-indigo-600 bg-white border-slate-300 focus:ring-indigo-600"
                  />
                  <span className="text-[11px] text-slate-700 leading-snug">
                    أوافق على التواصل معي عبر الواتساب أو البريد بخصوص هذا الطلب.
                    <span className="text-rose-500"> *</span>
                  </span>
                </label>
                {errors.consent && <p className="text-rose-600 text-[11px] font-semibold">{errors.consent}</p>}
              </div>
            </form>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="flex items-center justify-between font-bold text-sm">
              <span className="text-slate-600">الإجمالي التقديري:</span>
              <span id="cartDrawerTotal" className="text-indigo-600 text-lg font-black font-mono">
                {formatPrice(totalPrice)}
              </span>
            </div>

            {!showOrderForm ? (
              <button
                type="button"
                onClick={() => setShowOrderForm(true)}
                className="w-full bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-95 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 text-sm"
              >
                <span>إتمام الطلب الآن</span>
                <i className="fa-solid fa-arrow-left text-xs"></i>
              </button>
            ) : (
              <button
                type="submit"
                form="cartCheckoutForm"
                disabled={isSubmittingOrder}
                className="w-full bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-95 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isSubmittingOrder ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>إرسال طلب الشراء للتواصل</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
