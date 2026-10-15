'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { INITIAL_PRODUCTS } from '@/lib/store';
import { OrderModal } from '@/components/OrderModal';
import { formatPrice } from '@/lib/utils';
import {
  ShieldCheck,
  ShoppingBag,
  Check,
  ArrowLeft,
  Flame,
  MessageSquare,
  Clock,
  RefreshCw,
  HelpCircle,
  Zap,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const product = INITIAL_PRODUCTS.find((p) => p.slug === slug);

  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-white">Product Not Found</h1>
        <p className="text-slate-400 text-sm">The requested product could not be located in our catalog.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-dark-950 font-bold rounded-xl text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-sky-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Products</span>
        </Link>
      </div>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left: Product Media Card */}
        <div className="relative rounded-3xl overflow-hidden bg-dark-900 border border-slate-800 shadow-2xl p-4">
          <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-dark-950">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent" />

            {product.badge && (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-sky-500 text-dark-950 font-extrabold text-xs tracking-wide uppercase shadow-lg shadow-sky-950/70 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{product.badge}</span>
              </div>
            )}
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-dark-950/70 border border-slate-800/80 grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <RefreshCw className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{product.warranty}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <MessageSquare className="w-4 h-4 text-sky-400 shrink-0" />
              <span>WhatsApp / Email Delivery</span>
            </div>
          </div>
        </div>

        {/* Right: Product Details & Order Trigger */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-semibold">
              {product.categoryName}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {product.title}
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              {product.fullDescription}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm text-slate-500 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Available in Vault
              </span>
            </div>
          </div>

          {/* PROMINENT ORDER NOW BUTTON (Requirement 1) */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl shadow-sky-950/60 border border-sky-400/40 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Order Now — Request Contact</span>
            </button>

            <div className="p-3 rounded-xl bg-dark-950 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero-risk ordering • Administrator confirms with you before payment</span>
            </div>
          </div>

          {/* Features Checklist */}
          <div className="p-5 rounded-2xl bg-dark-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Included Account Features:
            </h3>
            <ul className="space-y-2">
              {product.features.map((feat, index) => (
                <li key={index} className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Delivery FAQ Accordion */}
      <div className="p-6 sm:p-8 rounded-3xl bg-dark-900 border border-slate-800 space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-sky-400" />
          <span>How will I receive my {product.title}?</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-1.5 p-4 rounded-2xl bg-dark-950 border border-slate-800">
            <div className="font-bold text-slate-200">1. Order Submission</div>
            <p className="text-slate-400 leading-relaxed">
              When you submit your request, our system logs your details and notifies our store team.
            </p>
          </div>
          <div className="space-y-1.5 p-4 rounded-2xl bg-dark-950 border border-slate-800">
            <div className="font-bold text-slate-200">2. Admin Verification</div>
            <p className="text-slate-400 leading-relaxed">
              The administrator opens a WhatsApp chat or sends an email to verify your order and arrange your convenient payment method.
            </p>
          </div>
          <div className="space-y-1.5 p-4 rounded-2xl bg-dark-950 border border-slate-800">
            <div className="font-bold text-slate-200">3. Handover & Warranty</div>
            <p className="text-slate-400 leading-relaxed">
              Account credentials or activation invites are securely delivered with step-by-step guidance and full replacement coverage.
            </p>
          </div>
        </div>
      </div>

      {/* Order Modal Triggered by Order Now button */}
      <OrderModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
