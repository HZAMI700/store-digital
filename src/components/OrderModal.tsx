'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductPlan, CountryCode } from '@/lib/types';
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
  Check,
  Clock,
  Sparkles,
  User,
  Mail,
  Zap,
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

  // Plans state
  const availablePlans = product.plans || [
    {
      id: 'default-plan',
      name: 'اشتراك رسمي كامل',
      duration: 'كامل المدة',
      price: product.price,
      compareAtPrice: product.compareAtPrice,
    },
  ];

  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    availablePlans[0]?.id || 'default-plan'
  );

  const selectedPlan: ProductPlan =
    availablePlans.find((p) => p.id === selectedPlanId) || availablePlans[0];

  const unitPrice = selectedPlan ? selectedPlan.price : product.price;

  // Form fields
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
    if (product.plans && product.plans.length > 0) {
      setSelectedPlanId(product.plans[0].id);
    }
  }, [product]);

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
        productName: `${product.title} (${selectedPlan.name})`,
        quantity,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerWhatsapp: fullPhone,
        countryCode: selectedCountry.dialCode,
        customerMessage: message.trim() || null,
        consentGiven: consent,
        planId: selectedPlan.id,
        unitPrice,
      };

      // 1. Create in clientStore for instant frontend offline / zero-backend support
      const localOrder = clientStore.createOrder({
        productId: product.id,
        productName: `${product.title} (${selectedPlan.name})`,
        quantity,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerWhatsapp: fullPhone,
        countryCode: selectedCountry.dialCode,
        customerMessage: message.trim() || null,
        unitPrice,
        selectedPlan: selectedPlan.name,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="relative px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 text-brand-primary flex items-center justify-center font-bold shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                تفاصيل الاشتراك وطلب الشراء المباشر
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                تواصل فوري عبر الواتساب لتأكيد طلبك وتفعيل الحساب
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors shadow-xs"
            aria-label="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="max-h-[80vh] overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* 1. Product Showcase Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-tr from-slate-900 to-slate-950 p-5 text-white shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-white/10 shrink-0 border border-white/20 shadow-md">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1.5 flex-1 text-center sm:text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[11px] font-bold">
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                  <span>{product.categoryName}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                  {product.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                  {product.shortDescription}
                </p>
              </div>
            </div>
          </div>

          {/* 2. DURATION / PLAN SELECTOR (Requirements) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-primary" />
                <span>اختر مدة الاشتراك المطلوبة:</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                جميع الباقات تشمل الضمان الكامل
              </span>
            </div>

            <div className={`grid gap-3 ${availablePlans.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              {availablePlans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 relative ${
                      isSelected
                        ? 'border-brand-primary bg-sky-50/50 shadow-md shadow-cyan-500/10 ring-2 ring-brand-primary/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary text-white shadow-xs">
                        {plan.badge}
                      </span>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-xs text-slate-900 block">
                          {plan.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          المدة: <strong className="text-slate-700">{plan.duration}</strong>
                        </span>
                      </div>

                      <div className="text-left">
                        <div className="text-base font-black text-brand-primary font-mono">
                          {formatPrice(plan.price)}
                        </div>
                        {plan.compareAtPrice && (
                          <div className="text-[10px] text-slate-400 line-through font-mono">
                            {formatPrice(plan.compareAtPrice)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>تسليم فوري وضمان ذهبي</span>
                      </span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-brand-primary bg-brand-primary text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Features & Full Info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800">
              ما الذي يتضمنه هذا الاشتراك:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              {product.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-[10px]">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Customer Information Form Fields */}
          <form id="orderModalForm" onSubmit={handleSubmit} className="space-y-4 pt-1">
            <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
              بيانات التواصل لاستلام الحساب:
            </h4>

            {serverError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{serverError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>الاسم الكامل <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: محمد بن علي"
                  className="w-full h-11 px-4 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
                />
                {errors.name && <p className="text-rose-600 text-[11px] font-semibold">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>البريد الإلكتروني <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full h-11 px-4 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-left transition"
                  dir="ltr"
                />
                {errors.email && <p className="text-rose-600 text-[11px] font-semibold">{errors.email}</p>}
              </div>
            </div>

            {/* WhatsApp Phone Number */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <i className="fa-brands fa-whatsapp text-emerald-600 text-sm"></i>
                  <span>رقم الواتساب للتواصل وتأكيد الطلب <span className="text-rose-500">*</span></span>
                </span>
                <span className="text-[11px] text-slate-400">تونس (+216) بشكل افتراضي</span>
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
                  placeholder="98 123 456"
                  className="w-full h-11 px-4 text-xs bg-slate-50 border border-l-0 border-slate-200 rounded-r-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
                />
              </div>
              {errors.phone && <p className="text-rose-600 text-[11px] font-semibold">{errors.phone}</p>}
            </div>

            {/* Quantity Stepper & Optional Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  الكمية المطلوبة
                </label>
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-1 h-11">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 transition"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-black text-slate-900 font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 transition"
                    disabled={quantity >= 10}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  ملاحظات أو جهاز مفضل <span className="text-slate-400 font-normal">(اختياري)</span>
                </label>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="مثال: يرجى التفعيل لجهاز ويندوز أو شاشة..."
                  className="w-full h-11 px-4 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
                />
              </div>
            </div>

            {/* Transparency Note */}
            <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200 text-xs text-sky-950 flex items-start gap-2.5 shadow-xs">
              <Info className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
              <div className="leading-relaxed text-[11px]">
                <strong className="text-slate-900 font-bold">تسليم يدوي آمن:</strong> يتواصل معك مشرف المتجر فوراً عبر الواتساب لتأكيد الاشتراك وتسليم بيانات الحساب مع الضمان، دون الحاجة لدفع إلكتروني مسبق.
              </div>
            </div>

            {/* Consent Checkbox */}
            <div className="space-y-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-brand-primary bg-white border-slate-300 focus:ring-brand-primary"
                />
                <span className="text-xs text-slate-700 leading-snug">
                  أوافق على التواصل معي عبر الواتساب أو البريد الإلكتروني بخصوص هذا الطلب.
                  <span className="text-rose-500 font-bold"> *</span>
                </span>
              </label>
              {errors.consent && <p className="text-rose-600 text-[11px] font-semibold">{errors.consent}</p>}
            </div>
          </form>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-right w-full sm:w-auto">
            <span className="text-[11px] text-slate-500 font-medium block">
              المبلغ الإجمالي ({selectedPlan.duration}):
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-brand-primary font-mono">
                {formatPrice(totalPrice)}
              </span>
              {selectedPlan.compareAtPrice && (
                <span className="text-xs text-slate-400 line-through font-mono">
                  {formatPrice(selectedPlan.compareAtPrice * quantity)}
                </span>
              )}
            </div>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition shadow-xs"
            >
              إلغاء
            </button>

            <button
              type="submit"
              form="orderModalForm"
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial px-7 py-3 rounded-xl velto-gradient-btn hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span>تأكيد الطلب المباشر الآن</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
