'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { INITIAL_PRODUCTS } from '@/lib/store';
import { ProductPlan } from '@/lib/types';
import { OrderModal } from '@/components/OrderModal';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/utils';
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
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const product = INITIAL_PRODUCTS.find((p) => p.slug === slug);

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart, setIsCartOpen } = useCart();

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-2xl font-black text-slate-900">المنتج غير موجود</h1>
        <p className="text-slate-500 text-sm">عذراً، لم نتمكن من العثور على هذا المنتج في المتجر.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 velto-gradient-btn text-white font-bold rounded-xl text-xs shadow-lg transition"
        >
          <ArrowRight className="w-4 h-4" />
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

  const handleAddToCart = () => {
    addToCart(product, 1);
    setIsCartOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-in fade-in duration-200" dir="rtl">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/#products"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0284c7] transition"
        >
          <i className="fa-solid fa-arrow-right"></i>
          <span>العودة إلى جميع العروض والمنتجات</span>
        </Link>
      </div>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Visual Card / Media */}
        <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200 p-5 shadow-xl">
          <div className="relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner group">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

            {/* Badges */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {product.badge && (
                <div className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-slate-900 font-black text-xs shadow-lg flex items-center gap-1.5 border border-slate-200">
                  <Flame className="w-3.5 h-3.5 fill-current text-amber-500" />
                  <span>{product.badge}</span>
                </div>
              )}
              {discountPercent && (
                <div className="px-2.5 py-1.5 rounded-full bg-rose-500 text-white font-black text-xs shadow-lg">
                  -{discountPercent}%
                </div>
              )}
            </div>

            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-xs text-slate-800 font-bold shadow">
                {product.categoryName}
              </span>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#0284c7] shrink-0" />
              <span>{product.warranty}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>تسليم مباشر وتواصل واتساب</span>
            </div>
          </div>
        </div>

        {/* Product Details & Action Buttons */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-sky-50 text-[#0284c7] border border-sky-200 text-xs font-bold">
              {product.categoryName}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {product.title}
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              {product.fullDescription}
            </p>
          </div>

          {/* Duration Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0284c7]" />
              <span>اختر مدة الاشتراك:</span>
            </label>

            <div className={`grid gap-3 ${availablePlans.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              {availablePlans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 relative ${
                      isSelected
                        ? 'border-[#0284c7] bg-sky-50/60 shadow-md ring-2 ring-[#0284c7]/20'
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
                        <span className="font-extrabold text-xs text-slate-900 block">
                          {plan.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          المدة: <strong className="text-slate-700">{plan.duration}</strong>
                        </span>
                      </div>

                      <div className="text-left">
                        <div className="text-base font-black text-[#0284c7] font-mono">
                          {formatPrice(plan.price)}
                        </div>
                        {plan.compareAtPrice && (
                          <div className="text-[10px] text-slate-400 line-through font-mono">
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

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs text-slate-500 block font-semibold">سعر الباقة المختارة ({selectedPlan.duration})</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 font-mono">
                  {formatPrice(currentPrice)}
                </span>
                {comparePrice && (
                  <span className="text-sm text-slate-400 line-through font-mono">
                    {formatPrice(comparePrice)}
                  </span>
                )}
              </div>
            </div>

            <div className="text-left">
              <span className="text-xs font-bold text-emerald-700 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                متوفر للتسليم الفوري
              </span>
            </div>
          </div>

          {/* Action Buttons: Add to Cart & Direct Order */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="py-4 px-6 rounded-2xl velto-gradient-btn hover:opacity-95 text-white font-black text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition active:scale-95"
              >
                <Zap className="w-4 h-4 text-yellow-300" />
                <span>طلب مباشر الآن</span>
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                className="py-4 px-6 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-black text-sm shadow-sm flex items-center justify-center gap-2.5 transition active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 text-[#0284c7]" />
                <span>إضافة إلى السلة</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>طلب آمن بدون خصم بطاقة أونلاين • يتواصل معك المشرف لتوضيح طرق الدفع والاستلام بالدينار التونسي</span>
            </div>
          </div>

          {/* Features Checklist */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              مميزات ومواصفات هذا الاشتراك:
            </h3>
            <ul className="space-y-2">
              {product.features.map((feat, index) => (
                <li key={index} className="flex items-center gap-3 text-xs text-slate-700">
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

      {/* Delivery FAQ Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-lg space-y-6">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#0284c7]" />
          <span>كيف يتم استلام {product.title}؟</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="font-extrabold text-slate-900">1. تسجيل الطلب المباشر</div>
            <p className="text-slate-600 leading-relaxed">
              تقوم بتسجيل اسمك ورقم الواتساب وسيتم إدراج طلبك فوراً في لوحة تحكم المتجر.
            </p>
          </div>
          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="font-extrabold text-slate-900">2. تواصل المشرف الفوري</div>
            <p className="text-slate-600 leading-relaxed">
              يتواصل معك مسؤول المتجر عبر الواتساب لتأكيد بياناتك وتوفير خيارات السداد المتاحة (Flouci، D17، تحويل بنكي أو بريدي).
            </p>
          </div>
          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="font-extrabold text-slate-900">3. تسليم الحساب والضمان الذهبي</div>
            <p className="text-slate-600 leading-relaxed">
              يتم تفعيل وإرسال بيانات اشتراكك فوراً مع شرح كامل لطريقة الاستخدام وضمان كامل المدة.
            </p>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      <OrderModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
