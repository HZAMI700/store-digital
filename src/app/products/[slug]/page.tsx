'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { INITIAL_PRODUCTS } from '@/lib/store';
import { ProductPlan, CountryCode } from '@/lib/types';
import { clientStore } from '@/lib/client-store';
import { useCart } from '@/lib/cart-context';
import { CountryCodeSelector } from '@/components/CountryCodeSelector';
import { POPULAR_COUNTRIES } from '@/lib/countries';
import { formatPrice, isValidEmail, isValidPhone, sanitizePhoneNumber } from '@/lib/utils';
import {
  ShieldCheck,
  ShoppingBag,
  Check,
  Flame,
  MessageSquare,
  RefreshCw,
  HelpCircle,
  Zap,
  Clock,
  Sparkles,
  ArrowRight,
  User,
  Mail,
  Phone,
  Lock,
  Star,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const product = INITIAL_PRODUCTS.find((p) => p.slug === slug);
  const formRef = useRef<HTMLDivElement>(null);

  const availablePlans = product?.plans || [
    {
      id: 'default-plan',
      name: 'اشتراك رسمي كامل',
      duration: 'كامل المدة',
      price: product?.price || 0,
      compareAtPrice: product?.compareAtPrice,
    },
  ];

  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    availablePlans[0]?.id || 'default-plan'
  );

  // Direct Order Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [localPhone, setLocalPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(POPULAR_COUNTRIES[0]);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { addToCart, setIsCartOpen } = useCart();

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4" dir="rtl">
        <h1 className="text-2xl font-black text-slate-900">المنتج غير موجود</h1>
        <p className="text-slate-500 text-sm">عذراً، لم نتمكن من العثور على هذا المنتج في متجر فيلترو.</p>
        <Link
          href="/"
          className="uiverse-galaxy-btn px-6 py-3 rounded-2xl text-xs font-black shadow-lg"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          <span>العودة لكتالوج المنتجات</span>
        </Link>
      </div>
    );
  }

  const selectedPlan: ProductPlan =
    availablePlans.find((p) => p.id === selectedPlanId) || availablePlans[0];

  const currentPrice = selectedPlan ? selectedPlan.price : product.price;
  const comparePrice = selectedPlan ? selectedPlan.compareAtPrice : product.compareAtPrice;

  const discountPercent = comparePrice
    ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
    : null;

  // Related products
  const relatedProducts = INITIAL_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, 1);
    setIsCartOpen(true);
  };

  const scrollToOrderForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'يرجى إدخال الاسم الكريم';
    if (!email.trim() || !isValidEmail(email)) errs.email = 'يرجى إدخال بريد إلكتروني صحيح';
    if (!localPhone.trim() || !isValidPhone(localPhone)) {
      errs.phone = 'يرجى إدخال رقم واتساب صحيح لتسليم الحساب';
    }
    if (!consent) errs.consent = 'يجب الموافقة على شروط الخدمة وتأكيد الطلب';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleDirectOrderSubmit = async (e: React.FormEvent) => {
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
        quantity: 1,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerWhatsapp: fullPhone,
        countryCode: selectedCountry.dialCode,
        customerMessage: message.trim() || null,
        consentGiven: consent,
        planId: selectedPlan.id,
        unitPrice: currentPrice,
      };

      // 1. Save in clientStore for instant offline/zero-backend handling
      const localOrder = clientStore.createOrder({
        productId: product.id,
        productName: `${product.title} (${selectedPlan.name})`,
        quantity: 1,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerWhatsapp: fullPhone,
        countryCode: selectedCountry.dialCode,
        customerMessage: message.trim() || null,
        unitPrice: currentPrice,
        selectedPlan: selectedPlan.name,
      });

      let orderRef = localOrder.orderReference;
      let token = localOrder.guestLookupToken;

      // 2. Also record on backend if available
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

      router.push(`/order-success/${orderRef}?token=${token}`);
    } catch (err: any) {
      console.error(err);
      setServerError(err.message || 'حدث خطأ أثناء معالجة الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp Pre-filled message
  const whatsappPreFilled = `مرحباً متجر فيلترو، أرغب في طلب اشتراك ${product.title} - مدة: ${selectedPlan.duration} بسعر ${formatPrice(currentPrice)}. يرجى تزويدي بطرق الدفع والتسليم.`;
  const whatsappLink = `https://wa.me/21650022767?text=${encodeURIComponent(whatsappPreFilled)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 animate-in fade-in duration-200 pb-28 sm:pb-12" dir="rtl">
      
      {/* 1. Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/#products"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0284c7] transition group"
        >
          <i className="fa-solid fa-arrow-right group-hover:-translate-x-1 transition-transform"></i>
          <span>العودة إلى كتالوج المنتجات الرئيسي</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span>متجر فيلترو</span>
          <span>/</span>
          <span>{product.categoryName}</span>
          <span>/</span>
          <span className="text-slate-800 font-bold">{product.title}</span>
        </div>
      </div>

      {/* 2. Main Product Showcase & Interactive Checkout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Visual Media Card (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="uiverse-galaxy-card p-4 sm:p-5 shadow-xl overflow-hidden bg-white border border-slate-200">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

              {/* Badges */}
              <div className="absolute top-3.5 right-3.5 flex items-center gap-2 z-10">
                {product.badge && (
                  <span className="uiverse-galaxy-badge bg-white/95 backdrop-blur-md text-slate-900 border-slate-200 shadow-md">
                    <span className="uiverse-galaxy-pulse" />
                    <span>{product.badge}</span>
                  </span>
                )}
                {discountPercent && (
                  <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white font-black text-xs shadow-md">
                    -{discountPercent}%
                  </span>
                )}
              </div>

              <div className="absolute bottom-3.5 right-3.5 z-10">
                <span className="px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/20 text-xs text-white font-bold shadow">
                  {product.categoryName}
                </span>
              </div>
            </div>

            {/* Quick Guarantees Under Media */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-[#0284c7] shrink-0" />
                <span>{product.warranty}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>تسليم وتفعيل فوري عبر الواتساب</span>
              </div>
            </div>
          </div>

          {/* Golden Guarantee Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-300/40 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-black text-xs sm:text-sm">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <span>الضمان الذهبي الرسمي من متجر فيلترو Veltro</span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
              جميع الحسابات والاشتراكات مفعلة رسمياً ومشمولة بضمان استبدال مباشر أو دعم فني فوري طوال مدة الاشتراك دون أي انقطاع.
            </p>
          </div>
        </div>

        {/* Product Details, Plans & Order Form (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Header Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="uiverse-galaxy-badge">
                <i className={product.icon}></i>
                <span>{product.categoryName}</span>
              </span>

              <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-slate-900 font-black">{product.rating}</span>
                <span className="text-slate-400 font-normal">({product.reviewsCount} تقييم موثق)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug">
              {product.title}
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              {product.fullDescription}
            </p>
          </div>

          {/* Subscription Duration Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0284c7]" />
              <span>مدة الاشتراك المعتمدة:</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availablePlans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 relative ${
                      isSelected
                        ? 'border-[#0284c7] bg-cyan-50/50 shadow-md ring-2 ring-[#0284c7]/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0284c7] text-white shadow-xs">
                        {plan.badge}
                      </span>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900 block">
                          {plan.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          المدة: <strong className="text-slate-800 font-bold">{plan.duration}</strong>
                        </span>
                      </div>

                      <div className="text-left">
                        <div className="text-lg font-black text-[#0284c7] font-mono">
                          {formatPrice(plan.price)}
                        </div>
                        {plan.compareAtPrice && (
                          <div className="text-[11px] text-slate-400 line-through font-mono">
                            {formatPrice(plan.compareAtPrice)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price Highlight Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#0a192f] text-white flex items-center justify-between shadow-xl border border-cyan-500/20">
            <div>
              <span className="text-xs text-cyan-200 block font-semibold mb-1">
                سعر الاشتراك المباشر ({selectedPlan.duration}):
              </span>
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-black text-cyan-300 font-mono">
                  {formatPrice(currentPrice)}
                </span>
                {comparePrice && (
                  <span className="text-sm sm:text-base text-slate-400 line-through font-mono">
                    {formatPrice(comparePrice)}
                  </span>
                )}
              </div>
            </div>

            <div className="text-left space-y-1">
              <span className="text-[11px] font-bold text-emerald-300 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 inline-flex items-center gap-1.5 shadow">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                تفعيل رسمي فوري
              </span>
              <span className="block text-[10px] text-slate-400 font-medium">
                بالدينار التونسي (TND)
              </span>
            </div>
          </div>

          {/* Fast WhatsApp & Cart Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="uiverse-emerald-btn py-3.5 px-5 rounded-2xl font-black text-xs sm:text-sm gap-2 shadow-lg"
            >
              <i className="fa-brands fa-whatsapp text-lg"></i>
              <span>اطلب فوراً عبر الواتساب (+216)</span>
            </a>

            <button
              type="button"
              onClick={handleAddToCart}
              className="uiverse-glass-btn py-3.5 px-5 rounded-2xl font-black text-xs sm:text-sm gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-[#0284c7]" />
              <span>إضافة إلى سلة المشتريات</span>
            </button>
          </div>

          {/* 3. Direct In-Page Order Form (Uiverse Galaxy Styled) */}
          <div
            ref={formRef}
            id="order-form"
            className="uiverse-galaxy-card p-5 sm:p-7 shadow-xl border border-slate-200/90 space-y-5 bg-white"
          >
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span>نموذج الطلب المباشر الفوري</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  أدخل بياناتك وسيتم تسجيل طلبك فوراً وتوجيهك لصفحة المتابعة وتأكيد التسليم
                </p>
              </div>
              <span className="hidden sm:inline-flex uiverse-galaxy-badge">
                خطوة واحدة فقط
              </span>
            </div>

            {serverError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {serverError}
              </div>
            )}

            <form onSubmit={handleDirectOrderSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>الاسم الكامل *</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  placeholder="مثال: محمد علي"
                  className={`uiverse-galaxy-input ${errors.name ? 'border-rose-400 ring-1 ring-rose-300' : ''}`}
                />
                {errors.name && <p className="text-[11px] text-rose-500 font-semibold">{errors.name}</p>}
              </div>

              {/* WhatsApp Number with Country Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>رقم الواتساب للتواصل والتسليم *</span>
                </label>
                <div className="flex gap-2">
                  <div className="w-32 shrink-0">
                    <CountryCodeSelector
                      selectedCode={selectedCountry.dialCode}
                      onSelect={setSelectedCountry}
                    />
                  </div>
                  <input
                    type="tel"
                    value={localPhone}
                    onChange={(e) => {
                      setLocalPhone(e.target.value);
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    placeholder="مثال: 50 022 767"
                    className={`uiverse-galaxy-input ${errors.phone ? 'border-rose-400 ring-1 ring-rose-300' : ''}`}
                    dir="ltr"
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-rose-500 font-semibold">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>البريد الإلكتروني *</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  placeholder="name@example.com"
                  className={`uiverse-galaxy-input ${errors.email ? 'border-rose-400 ring-1 ring-rose-300' : ''}`}
                  dir="ltr"
                />
                {errors.email && <p className="text-[11px] text-rose-500 font-semibold">{errors.email}</p>}
              </div>

              {/* Notes / Special Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                  <span>ملاحظات إضافية (اختياري)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="أي تفاصيل خاصة أو وقت تفضله للتواصل..."
                  rows={2}
                  className="uiverse-galaxy-input resize-none"
                />
              </div>

              {/* Terms and Golden Guarantee Consent */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 font-medium select-none">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#0284c7] focus:ring-[#0284c7] w-4 h-4 cursor-pointer"
                  />
                  <span>
                    أوافق على استلام تفاصيل الحساب والدفع بالدينار التونسي عبر الواتساب والإيميل مع الضمان الذهبي لمتجر فيلترو.
                  </span>
                </label>
                {errors.consent && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.consent}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full uiverse-galaxy-btn py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جارٍ معالجة وتأكيد الطلب...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-yellow-300" />
                    <span>تأكيد الطلب الفوري الآن ({formatPrice(currentPrice)})</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>طلب آمن 100% • بدون خصم بطاقة أونلاين • السداد محلياً بعد التأكيد</span>
                </span>
              </div>
            </form>
          </div>

          {/* Features Checklist */}
          <div className="uiverse-galaxy-card p-5 sm:p-6 bg-white border border-slate-200/90 shadow-sm space-y-3.5">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0284c7]" />
              <span>مميزات ومواصفات هذا الاشتراك:</span>
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {product.features.map((feat, index) => (
                <li key={index} className="flex items-center gap-2.5 text-xs text-slate-700 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 4. How Delivery Works (3-Step Modern Guide) */}
      <div className="uiverse-galaxy-card p-6 sm:p-8 bg-white border border-slate-200 shadow-md space-y-6">
        <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#0284c7]" />
          <span>كيف يتم استلام وتفعيل اشتراك {product.title}؟</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="space-y-2 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 relative overflow-hidden">
            <div className="w-7 h-7 rounded-xl bg-cyan-100 text-[#0284c7] font-black flex items-center justify-center text-xs">
              1
            </div>
            <div className="font-extrabold text-sm text-slate-900">تسجيل الطلب المباشر</div>
            <p className="text-slate-600 leading-relaxed text-xs">
              تقوم بتسجيل اسمك ورقم الواتساب وسيتم إدراج طلبك فوراً في لوحة تحكم المتجر مع إنشاء رقم مرجعي خاص.
            </p>
          </div>

          <div className="space-y-2 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 relative overflow-hidden">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 font-black flex items-center justify-center text-xs">
              2
            </div>
            <div className="font-extrabold text-sm text-slate-900">تواصل المشرف الفوري</div>
            <p className="text-slate-600 leading-relaxed text-xs">
              يتواصل معك مسؤول المتجر عبر الواتساب لتأكيد بياناتك وتوفير خيارات السداد المتاحة بالدينار التونسي (Flouci، D17، تحويل بريدي/بنكي).
            </p>
          </div>

          <div className="space-y-2 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 relative overflow-hidden">
            <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-xs">
              3
            </div>
            <div className="font-extrabold text-sm text-slate-900">تسليم الحساب والضمان</div>
            <p className="text-slate-600 leading-relaxed text-xs">
              يتم تفعيل وإرسال بيانات اشتراكك فوراً مع شرح كامل لطريقة الاستخدام وتفعيل الضمان الذهبي طوال المدة.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Related Products Section (Clicking any opens its dedicated product page) */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0284c7]" />
            <span>اشتراكات رقمية أخرى قد تهمك في متجر فيلترو:</span>
          </h3>
          <Link
            href="/#products"
            className="text-xs font-bold text-[#0284c7] hover:underline"
          >
            مشاهدة جميع الاشتراكات
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {relatedProducts.map((rel) => (
            <Link
              key={rel.id}
              href={`/products/${rel.slug}`}
              className="uiverse-galaxy-card p-3 sm:p-4 text-center group flex flex-col justify-between"
            >
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 mb-2.5 shadow-inner">
                <img
                  src={rel.imageUrl}
                  alt={rel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#0284c7] transition line-clamp-2 min-h-[2.4rem] flex items-center justify-center">
                {rel.title}
              </h4>

              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs sm:text-base font-black text-[#0284c7] font-mono">
                  {formatPrice(rel.price)}
                </span>
                <span className="text-[10px] text-slate-400 font-bold group-hover:text-[#0284c7] transition flex items-center gap-1">
                  <span>تفاصيل</span>
                  <ChevronLeft className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 6. Mobile Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 sm:hidden shadow-2xl flex items-center justify-between gap-3">
        <div className="leading-tight">
          <span className="text-[10px] text-slate-400 font-bold block">{selectedPlan.duration}</span>
          <span className="text-lg font-black text-[#0284c7] font-mono">
            {formatPrice(currentPrice)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg shadow-md active:scale-95"
            aria-label="طلب عبر الواتساب"
          >
            <i className="fa-brands fa-whatsapp"></i>
          </a>

          <button
            type="button"
            onClick={scrollToOrderForm}
            className="uiverse-galaxy-btn px-4 py-2.5 rounded-xl font-black text-xs shadow-md active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300 ml-1" />
            <span>طلب فوري</span>
          </button>
        </div>
      </div>

    </div>
  );
}
