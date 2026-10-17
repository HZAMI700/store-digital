'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { INITIAL_PRODUCTS } from '@/lib/store';
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
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const product = INITIAL_PRODUCTS.find((p) => p.slug === slug);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart, setIsCartOpen } = useCart();

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-2xl font-black text-slate-900">المنتج غير موجود</h1>
        <p className="text-slate-500 text-sm">عذراً، لم نتمكن من العثور على هذا المنتج في المتجر.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-lg transition"
        >
          <i className="fa-solid fa-arrow-right"></i>
          <span>العودة لكتالوج المنتجات</span>
        </Link>
      </div>
    );
  }

  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  const handleAddToCart = () => {
    addToCart(product, 1);
    setIsCartOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-in fade-in duration-200">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/#products"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
        >
          <i className="fa-solid fa-arrow-right"></i>
          <span>العودة إلى جميع العروض والمنتجات</span>
        </Link>
      </div>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Visual Card / Media */}
        <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200 p-5 shadow-xl">
          <div
            className={`relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-gradient-to-tr ${
              product.color || 'from-indigo-900 to-indigo-950'
            } flex items-center justify-center p-6 border border-slate-200 shadow-inner`}
          >
            <i className={`${product.icon || 'fa-solid fa-gem'} text-8xl text-white/30`}></i>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Badges */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {product.badge && (
                <div className="px-3 py-1.5 rounded-full bg-indigo-600 text-white font-black text-xs shadow-lg flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-current text-yellow-300" />
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
              <span className="px-3 py-1 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 text-xs text-slate-800 font-bold shadow">
                {product.categoryName}
              </span>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-600 shrink-0" />
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
            <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
              {product.categoryName}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
              {product.title}
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              {product.fullDescription}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs text-slate-500 block font-semibold">سعر العرض</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 font-mono">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm text-slate-400 line-through font-mono">
                    {formatPrice(product.compareAtPrice)}
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
                className="py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-95 text-white font-black text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2.5 transition active:scale-95"
              >
                <Zap className="w-4 h-4 text-yellow-300" />
                <span>طلب مباشر الآن</span>
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                className="py-4 px-6 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-black text-sm shadow-sm flex items-center justify-center gap-2.5 transition active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 text-indigo-600" />
                <span>إضافة إلى السلة</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>طلب آمن بدون خصم بطاقة أونلاين • يتواصل معك المشرف لتوضيح طرق الدفع والاستلام</span>
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
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <span>كيف يتم استلام {product.title}؟</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="font-extrabold text-slate-900">1. تسجيل الطلب</div>
            <p className="text-slate-600 leading-relaxed">
              تقوم بتسجيل اسمك ورقم الواتساب وسيتم إدراج طلبك فوراً في لوحة تحكم الإدارة.
            </p>
          </div>
          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="font-extrabold text-slate-900">2. تواصل المشرف</div>
            <p className="text-slate-600 leading-relaxed">
              يتواصل معك مسؤول المتجر عبر الواتساب لتأكيد بياناتك وتوفير خيارات السداد المتاحة (مدى، تحويل، STC Pay).
            </p>
          </div>
          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="font-extrabold text-slate-900">3. تسليم الحساب والضمان</div>
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
