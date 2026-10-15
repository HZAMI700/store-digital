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
        <h1 className="text-2xl font-bold text-content-primary">Product Not Found</h1>
        <p className="text-content-secondary text-sm">The requested product could not be located in our catalog.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-bold rounded-xl text-xs shadow-subtle"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-in fade-in duration-200">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-content-secondary hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Products</span>
        </Link>
      </div>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left: Product Media Card */}
        <div className="relative rounded-3xl overflow-hidden bg-white border border-border shadow-card p-4">
          <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-surface-tertiary">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            <div className="absolute top-4 left-4 flex items-center gap-2">
              {product.badge && (
                <div className="px-3 py-1.5 rounded-full bg-primary-500 text-white font-black text-xs tracking-wide uppercase shadow-subtle flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{product.badge}</span>
                </div>
              )}
              {discountPercent && (
                <div className="px-2.5 py-1.5 rounded-full bg-rose-500 text-white font-black text-xs shadow-subtle">
                  -{discountPercent}%
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-surface-secondary border border-border grid grid-cols-2 gap-4 text-xs font-semibold text-content-primary">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-purple-600 shrink-0" />
              <span>{product.warranty}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary-500 shrink-0" />
              <span>WhatsApp / Email Delivery</span>
            </div>
          </div>
        </div>

        {/* Right: Product Details & Order Trigger */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200 text-xs font-bold">
              {product.categoryName}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-content-primary tracking-tight">
              {product.title}
            </h1>
            <p className="text-content-secondary text-sm leading-relaxed">
              {product.fullDescription}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-3xl bg-white border border-border shadow-subtle flex items-center justify-between">
            <div>
              <span className="text-xs text-content-secondary block font-semibold">Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-content-primary">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm text-content-muted line-through font-medium">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-emerald-700 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Available in Vault
              </span>
            </div>
          </div>

          {/* PROMINENT ORDER NOW BUTTON (Requirement 1) */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-extrabold text-base shadow-card border border-primary-600 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Order Now — Request Contact</span>
            </button>

            <div className="p-3.5 rounded-xl bg-surface-secondary border border-border text-[11px] text-content-secondary font-medium flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero-risk ordering • Administrator confirms with you before payment</span>
            </div>
          </div>

          {/* Features Checklist */}
          <div className="p-5 rounded-3xl bg-white border border-border shadow-subtle space-y-3">
            <h3 className="text-xs font-bold text-content-primary uppercase tracking-wider">
              Included Account Features:
            </h3>
            <ul className="space-y-2">
              {product.features.map((feat, index) => (
                <li key={index} className="flex items-center gap-3 text-xs text-content-primary">
                  <div className="w-5 h-5 rounded-full bg-primary-50 border border-primary-200 text-primary-600 flex items-center justify-center shrink-0">
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
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-card space-y-6">
        <h3 className="text-base font-bold text-content-primary flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary-500" />
          <span>How will I receive my {product.title}?</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-1.5 p-4 rounded-2xl bg-surface-secondary border border-border">
            <div className="font-bold text-content-primary">1. Order Submission</div>
            <p className="text-content-secondary leading-relaxed">
              When you submit your request, our system logs your details and queues it for administrator attention.
            </p>
          </div>
          <div className="space-y-1.5 p-4 rounded-2xl bg-surface-secondary border border-border">
            <div className="font-bold text-content-primary">2. Admin Verification</div>
            <p className="text-content-secondary leading-relaxed">
              The administrator opens a WhatsApp chat or sends an email to verify your order and arrange your convenient payment method.
            </p>
          </div>
          <div className="space-y-1.5 p-4 rounded-2xl bg-surface-secondary border border-border">
            <div className="font-bold text-content-primary">3. Handover & Warranty</div>
            <p className="text-content-secondary leading-relaxed">
              Account credentials or activation invites are securely delivered with step-by-step guidance and ongoing replacement coverage.
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
