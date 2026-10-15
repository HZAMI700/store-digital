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
  HelpCircle,
  Gamepad2,
  Tv,
  Cpu,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  const categories = [
    { id: 'all', name: 'All Categories', icon: Layers },
    { id: 'gaming', name: 'Gaming & Steam', icon: Gamepad2 },
    { id: 'ai-tools', name: 'AI & Productivity', icon: Cpu },
    { id: 'streaming', name: 'Streaming & Video', icon: Tv },
    { id: 'security', name: 'Security & VPN', icon: Lock },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-16 pb-16">
      {/* 21ST-INSPIRED HERO SECTION IN PURE LIGHT MODE */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-border bg-gradient-to-b from-white via-surface-secondary/40 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(#4563EB_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-bold shadow-subtle">
            <Sparkles className="w-3.5 h-3.5 text-primary-500 animate-pulse" />
            <span>Direct WhatsApp & Email Manual Delivery • Safe & Verified</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-content-primary max-w-4xl mx-auto leading-tight">
            Premium Digital Accounts <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500">
              Without Online Payment Risks
            </span>
          </h1>

          <p className="text-sm sm:text-base text-content-secondary max-w-2xl mx-auto leading-relaxed">
            Steam accounts, GTA V / FiveM ready, Game Pass, AI tools, and streaming subscriptions.
            Our store administrator contacts you directly on WhatsApp or Email to verify details, agree on payment, and arrange guaranteed delivery.
          </p>

          {/* Quick Search in Hero */}
          <div className="max-w-xl mx-auto pt-2">
            <div className="relative flex items-center shadow-card rounded-2xl bg-white border border-border p-1.5 transition-all focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100">
              <Search className="w-4 h-4 text-content-muted ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Search Steam, GTA V, ChatGPT, Netflix, Game Pass..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-transparent text-content-primary placeholder-content-muted focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-2 text-xs text-content-muted hover:text-content-primary"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Trust Guarantees Bar (Light pastel cards) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-content-secondary font-semibold">
            <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-border shadow-subtle">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero Online Card Charges</span>
            </span>
            <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-border shadow-subtle">
              <MessageSquare className="w-4 h-4 text-primary-500" />
              <span>WhatsApp Admin Confirmation</span>
            </span>
            <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-border shadow-subtle">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>100% Replacement Warranty</span>
            </span>
          </div>
        </div>
      </section>

      {/* HOW MANUAL ORDERING WORKS WORKFLOW (4-Step Flow) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-border shadow-card">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
            <h2 className="text-lg sm:text-2xl font-black text-content-primary tracking-tight">
              Simple 4-Step Ordering Process
            </h2>
            <p className="text-xs text-content-secondary">
              Transparent, human-operated service designed for your safety and peace of mind
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-surface-secondary border border-border relative space-y-2">
              <div className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-200 text-primary-600 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-sm text-content-primary">Submit Request</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Click <strong>Order Now</strong> and enter your contact name, email, and WhatsApp phone number.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-secondary border border-border relative space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-sm text-content-primary">Admin Contacts You</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Our store administrator reaches out on WhatsApp or Email to verify details and answer questions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-secondary border border-border relative space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-bold text-sm text-content-primary">Agree on Payment</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Choose your preferred manual payment method (Bank Transfer, PayPal, Wise, local transfer).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-secondary border border-border relative space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="font-bold text-sm text-content-primary">Account Delivered</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Receive your verified digital credentials directly with step-by-step guidance & warranty support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG SECTION (Y7X & Nu8th inspired Product Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" id="catalog">
        {/* Category Pills and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-secondary border border-border rounded-2xl overflow-x-auto w-full sm:w-auto">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-white text-primary-600 shadow-subtle border border-border'
                      : 'text-content-secondary hover:text-content-primary hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-primary-500' : 'text-content-muted'}`} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-semibold text-content-secondary">
            Showing <span className="font-bold text-content-primary">{filteredProducts.length}</span> digital products
          </div>
        </div>

        {/* Product Cards Grid in Pure Light Mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const discountPercent = product.compareAtPrice
              ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
              : null;

            return (
              <div
                key={product.id}
                className="card-light rounded-3xl overflow-hidden flex flex-col justify-between group"
              >
                {/* Product Image & Badges */}
                <div className="relative h-52 bg-surface-tertiary overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                  {/* Badge & Discount Ratio (Nu8th style) */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {product.badge && (
                      <div className="px-2.5 py-1 rounded-full bg-primary-500 text-white font-extrabold text-[10px] tracking-wide uppercase shadow-subtle flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-current" />
                        <span>{product.badge}</span>
                      </div>
                    )}
                    {discountPercent && (
                      <div className="px-2 py-1 rounded-full bg-rose-500 text-white font-extrabold text-[10px] shadow-subtle">
                        -{discountPercent}%
                      </div>
                    )}
                  </div>

                  {/* Category label */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-white/40 text-content-primary text-[10px] font-bold shadow-subtle">
                    {product.categoryName}
                  </div>

                  {/* Warranty overlay tag */}
                  <div className="absolute bottom-3 left-3 text-[11px] font-semibold text-white flex items-center gap-1 drop-shadow-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{product.warranty}</span>
                  </div>
                </div>

                {/* Product Content */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-content-primary group-hover:text-primary-600 transition-colors leading-snug">
                      {product.title}
                    </h3>
                    <p className="text-xs text-content-secondary leading-relaxed line-clamp-2">
                      {product.shortDescription}
                    </p>

                    {/* Features List */}
                    <ul className="space-y-1.5 pt-2">
                      {product.features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-content-primary">
                          <Check className="w-3.5 h-3.5 text-primary-500 shrink-0 stroke-[2.5]" />
                          <span className="truncate">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-4 border-t border-border space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-2xl font-black text-content-primary">
                          {formatPrice(product.price)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="ml-2 text-xs text-content-muted line-through font-medium">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        In Vault
                      </span>
                    </div>

                    {/* Buttons: Detail & Order Now (Requirement 1) */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href={`/products/${product.slug}`}
                        className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-surface-secondary hover:bg-surface-tertiary text-content-primary border border-border text-xs font-bold transition-all shadow-subtle"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setActiveModalProduct(product)}
                        className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white font-bold text-xs shadow-subtle border border-primary-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Order Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-border shadow-card space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-lg sm:text-2xl font-black text-content-primary tracking-tight flex items-center justify-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary-500" />
              <span>Frequently Asked Questions</span>
            </h2>
            <p className="text-xs text-content-secondary">
              Everything you need to know about our manual ordering model
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-xs">
            <div className="p-5 rounded-2xl bg-surface-secondary border border-border space-y-2">
              <h4 className="font-bold text-sm text-content-primary">Why don't you accept credit cards online?</h4>
              <p className="text-content-secondary leading-relaxed">
                By processing orders manually, you never risk having your credit card compromised or incurring unexpected recurring subscription fees. You only pay after verifying the order with our human administrator.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-secondary border border-border space-y-2">
              <h4 className="font-bold text-sm text-content-primary">How fast will the administrator contact me?</h4>
              <p className="text-content-secondary leading-relaxed">
                Our administrators monitor the queue continuously. Typical response time on WhatsApp is between 5 to 30 minutes during active hours.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-secondary border border-border space-y-2">
              <h4 className="font-bold text-sm text-content-primary">What happens if my digital account stops working?</h4>
              <p className="text-content-secondary leading-relaxed">
                All digital accounts and licenses carry a full replacement warranty. Simply message our WhatsApp support with your Order Reference number for an immediate replacement.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-secondary border border-border space-y-2">
              <h4 className="font-bold text-sm text-content-primary">Can I use local transfer or PayPal to pay?</h4>
              <p className="text-content-secondary leading-relaxed">
                Yes! We accept flexible payment methods including PayPal, Wise, Bank Transfer, and local mobile payment options. The admin will provide you with the most convenient method for your country.
              </p>
            </div>
          </div>
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
