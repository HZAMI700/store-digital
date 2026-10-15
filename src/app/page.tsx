'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { INITIAL_PRODUCTS } from '@/lib/store';
import { Product } from '@/lib/types';
import { OrderModal } from '@/components/OrderModal';
import { formatPrice } from '@/lib/utils';
import {
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Search,
  Check,
  ArrowRight,
  Zap,
  ShoppingBag,
  ExternalLink,
  Flame,
  Clock,
  Layers,
} from 'lucide-react';

export default function HomePage() {
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'streaming', name: 'Streaming & Video' },
    { id: 'ai-tools', name: 'AI & Productivity' },
    { id: 'gaming', name: 'Gaming' },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-slate-800/80 bg-gradient-to-b from-dark-900/60 via-dark-950 to-dark-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.15),rgba(255,255,255,0))]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Direct WhatsApp & Email Manual Delivery • Safe & Verified</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Premium Digital Accounts <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400">
              Without Online Payment Risks
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Order your favorite streaming, AI tools, and gaming subscriptions.
            Our store administrator will contact you directly on WhatsApp or Email to confirm details, agree on payment, and arrange delivery.
          </p>

          {/* Trust Guarantees Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-900 border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>No Automatic Online Card Charges</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-900 border border-slate-800">
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>Direct WhatsApp Admin Confirmation</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-900 border border-slate-800">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Full Replacement Warranty</span>
            </span>
          </div>
        </div>
      </section>

      {/* HOW MANUAL ORDERING WORKS WORKFLOW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-dark-900 via-dark-950 to-dark-900 border border-slate-800">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Simple 4-Step Ordering Process
            </h2>
            <p className="text-xs text-slate-400">
              Transparent, human-operated service designed for maximum security
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-2xl bg-dark-950/70 border border-slate-800/80 relative space-y-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="font-bold text-sm text-slate-100">Submit Request</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click <strong>Order Now</strong> and enter your contact name, email, and WhatsApp number.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-dark-950/70 border border-slate-800/80 relative space-y-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="font-bold text-sm text-slate-100">Admin Contacts You</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our administrator reaches out on WhatsApp or Email to confirm details and answer questions.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-dark-950/70 border border-slate-800/80 relative space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-100">Agree on Payment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose your preferred manual payment method (Bank, PayPal, Wise, local transfer, etc.).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-dark-950/70 border border-slate-800/80 relative space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h3 className="font-bold text-sm text-slate-100">Account Delivered</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive your verified digital account credentials directly with ongoing warranty support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" id="catalog">
        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-dark-900 border border-slate-800 rounded-2xl overflow-x-auto w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-sky-500 text-dark-950 shadow-glow font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-850'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search accounts or tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-dark-900 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="glow-card rounded-3xl overflow-hidden flex flex-col justify-between group"
            >
              {/* Product Image & Badges */}
              <div className="relative h-48 bg-dark-950 overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />

                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-sky-500 text-dark-950 font-bold text-[10px] tracking-wide uppercase shadow-lg shadow-sky-950/60 flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-current" />
                    <span>{product.badge}</span>
                  </div>
                )}

                {/* Category label */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-dark-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 text-[10px] font-medium">
                  {product.categoryName}
                </div>
              </div>

              {/* Product Content */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {product.shortDescription}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-1.5 pt-2">
                    {product.features.slice(0, 3).map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price & Action */}
                <div className="pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-extrabold text-white">
                        {formatPrice(product.price)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="ml-2 text-xs text-slate-500 line-through">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      In Stock
                    </span>
                  </div>

                  {/* Buttons: Detail & Order Now */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href={`/products/${product.slug}`}
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-dark-850 hover:bg-dark-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </Link>

                    {/* Order Now Trigger (Requirement 1) */}
                    <button
                      type="button"
                      onClick={() => setActiveModalProduct(product)}
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-950/40 border border-sky-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Order Now</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RENDER ORDER MODAL IF ACTIVE */}
      {activeModalProduct && (
        <OrderModal
          product={activeModalProduct}
          isOpen={Boolean(activeModalProduct)}
          onClose={() => setActiveModalProduct(null)}
        />
      )}
    </div>
  );
}
