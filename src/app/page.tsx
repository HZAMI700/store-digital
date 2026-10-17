'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { INITIAL_PRODUCTS } from '@/lib/store';
import { Product } from '@/lib/types';
import { OrderModal } from '@/components/OrderModal';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/utils';
import {
  Film,
  Scissors,
  Palette,
  ShieldCheck,
  Brain,
  Zap,
  Clock,
  Sparkles,
  ShoppingBag,
  Star,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Check,
  Flame,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function HomePage() {
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  const { addToCart, setIsCartOpen } = useCart();

  // Velto Hero Slider
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const heroSlides = [
    {
      title: 'اشتراك جوجل جيميناي أدفانسد Gemini 1.5 Pro',
      subtitle: 'أحدث نموذج ذكاء اصطناعي فائق لتحليل المستندات، البرمجة، والبحث مع سياق مليون رمز',
      badge: 'الذكاء الاصطناعي الأقوى 🤖',
      price: '29.00 ر.س',
      originalPrice: '79.00 ر.س',
      discount: 'خصم 63%',
      productId: 'prod-gemini-advanced',
      icon: 'fa-solid fa-brain',
      color: 'from-[#06b6d4] via-[#0284c7] to-[#1e40af]',
    },
    {
      title: 'اشتراك نتفلكس بريميوم 4K Ultra HD',
      subtitle: 'شاشة خاصة برمز سري PIN، جودة سينمائية فائقة 4K HDR، وضمان ذهبي كامل المدة',
      badge: 'الأكثر طلباً ومبيعاً ⭐',
      price: '15.00 ر.س',
      originalPrice: '35.00 ر.س',
      discount: 'خصم 57%',
      productId: 'prod-netflix-4k',
      icon: 'fa-solid fa-tv',
      color: 'from-[#0f172a] via-[#1e293b] to-[#0284c7]',
    },
    {
      title: 'باقة صناع المحتوى: كاب كت برو + كانفا برو',
      subtitle: 'تصدير 4K 60fps، إزالة خلفية الفيديو بالذكاء الاصطناعي، وملايين القوالب الاحترافية',
      badge: 'تفعيل فوري على إيميلك ⚡',
      price: '19.99 ر.س',
      originalPrice: '49.00 ر.س',
      discount: 'خصم 60%',
      productId: 'prod-capcut-pro-1m',
      icon: 'fa-solid fa-wand-magic-sparkles',
      color: 'from-[#00d2c4] via-[#0284c7] to-[#2563eb]',
    },
  ];

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, [heroSlides.length]);

  // Deal of the week countdown
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 18,
    minutes: 42,
    seconds: 30,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter products by category, search & sort
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory =
          selectedCategory === 'all' || product.categoryId === selectedCategory;
        const matchesSearch =
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const categories = [
    { id: 'all', name: 'الكل', count: products.length, icon: 'fa-solid fa-border-all' },
    {
      id: 'cat-streaming',
      name: 'بث وترفيه',
      count: products.filter((p) => p.categoryId === 'cat-streaming').length,
      icon: 'fa-solid fa-film',
    },
    {
      id: 'cat-editing',
      name: 'تصميم ومونتاج',
      count: products.filter((p) => p.categoryId === 'cat-editing').length,
      icon: 'fa-solid fa-wand-magic-sparkles',
    },
    {
      id: 'cat-security',
      name: 'حماية وأمان',
      count: products.filter((p) => p.categoryId === 'cat-security').length,
      icon: 'fa-solid fa-shield-halved',
    },
    {
      id: 'cat-ai',
      name: 'ذكاء اصطناعي',
      count: products.filter((p) => p.categoryId === 'cat-ai').length,
      icon: 'fa-solid fa-brain',
    },
  ];

  return (
    <div className="space-y-16 pb-20 selection:bg-[#0284c7] selection:text-white" dir="rtl">
      
      {/* 1. Velto Hero Section with Ambient Cyan-Blue Glow & Slider */}
      <section className="relative overflow-hidden velto-hero-mesh pt-8 pb-14 border-b border-slate-200/80">
        
        {/* Ambient Animated Glow Spheres */}
        <div className="absolute top-10 left-1/4 w-80 h-80 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none animate-pulseGlow" />
        <div className="absolute top-20 right-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none animate-float-delayed" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
          
          {/* Hero Header & Value Statement */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            
            {/* Shimmer Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-cyan-200/80 shadow-sm text-xs font-bold text-[#0284c7] relative overflow-hidden animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
              <span>متجر فيلترو المعتمد | تسليم فوري وضمان ذهبي كامل المدة</span>
              <div className="absolute inset-0 shimmer-badge pointer-events-none" />
            </div>

            {/* Main Gradient Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              أرقى الاشتراكات الرقمية <br className="hidden sm:inline" />
              <span className="velto-gradient-text">بأفضل الأسعار وضمان فوري</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              استمتع باشتراكات رسمية معتمدة: Netflix 4K، CapCut Pro، Canva Pro، ExpressVPN، و Gemini Advanced. تفعيل مباشر عبر الواتساب بدون تعقيدات وبأعلى معايير الخصوصية.
            </p>

            {/* Benefit Pills with Float Animation */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-slate-700">
              <div className="px-3.5 py-2 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs flex items-center gap-2 animate-float">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ضمان ذهبي كامل المدة</span>
              </div>

              <div className="px-3.5 py-2 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs flex items-center gap-2 animate-float-delayed">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>تسليم سريع وتواصل فوري</span>
              </div>

              <div className="px-3.5 py-2 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs flex items-center gap-2 animate-float">
                <Lock className="w-4 h-4 text-[#0284c7]" />
                <span>خصوصية تامة وحسابات خاصة</span>
              </div>
            </div>
          </div>

          {/* Interactive Hero Slider Carousel */}
          <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 bg-white">
            <div className="relative h-[320px] sm:h-[360px] overflow-hidden">
              {heroSlides.map((slide, index) => {
                const isActive = index === activeHeroSlide;
                return (
                  <div
                    key={slide.productId}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex flex-col justify-between p-6 sm:p-10 ${
                      isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    } bg-gradient-to-r ${slide.color} text-white`}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Top Row: Badge & Discount */}
                    <div className="relative flex items-center justify-between z-10">
                      <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black text-white border border-white/30 flex items-center gap-1.5 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                        <span>{slide.badge}</span>
                      </span>

                      <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-black shadow-md">
                        {slide.discount}
                      </span>
                    </div>

                    {/* Middle: Title & Subtitle */}
                    <div className="relative space-y-2 z-10 max-w-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-2xl border border-white/20 shadow-inner">
                          <i className={slide.icon}></i>
                        </div>
                        <h2 className="text-xl sm:text-3xl font-black text-white leading-snug">
                          {slide.title}
                        </h2>
                      </div>
                      <p className="text-xs sm:text-sm text-cyan-100/90 font-medium leading-relaxed">
                        {slide.subtitle}
                      </p>
                    </div>

                    {/* Bottom: Pricing & Action Buttons */}
                    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 border-t border-white/20 pt-4">
                      <div className="flex items-baseline gap-3">
                        <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                          {slide.price}
                        </span>
                        <span className="text-sm font-mono text-white/60 line-through">
                          {slide.originalPrice}
                        </span>
                        <span className="text-xs text-white/80 font-semibold">شامل الضمان الكامل</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            const found = products.find((p) => p.id === slide.productId);
                            if (found) setActiveModalProduct(found);
                          }}
                          className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#0f172a] font-black text-xs shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
                        >
                          <Zap className="w-4 h-4 text-[#0284c7]" />
                          <span>طلب مباشر الآن</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const found = products.find((p) => p.id === slide.productId);
                            if (found) {
                              addToCart(found, 1);
                              setIsCartOpen(true);
                            }
                          }}
                          className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs border border-white/30 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>أضف للسلة</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Slider Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveHeroSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === activeHeroSlide ? 'w-7 bg-white shadow' : 'w-2 bg-white/50'
                  }`}
                  aria-label={`شريحة ${i + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 2. Signature Section Divider: الترند الحالي في فيلترو */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative py-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          
          <div className="relative bg-white px-6 py-2.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-cyan-50 border border-cyan-200 text-[#0284c7] flex items-center justify-center text-sm spinning-icon">
              <i className="fa-solid fa-sparkles"></i>
            </div>
            <div className="text-right">
              <div className="text-xs font-black text-slate-900 flex items-center gap-1">
                <span>الترند الحالي في</span>
                <span className="velto-gradient-text font-black">فيلترو</span>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold">تصفح أحدث الاشتراكات الرقمية الأعلى تقييماً</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Filter Tabs & Search Bar */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          
          {/* Horizontal Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-[#06b6d4] to-[#0284c7] text-white shadow-md shadow-cyan-500/20'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                }`}
              >
                <i className={cat.icon}></i>
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs text-slate-500 font-bold shrink-0">الترتيب:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#0284c7] cursor-pointer"
            >
              <option value="popular">الأكثر تقييماً</option>
              <option value="price-asc">الأقل سعراً</option>
              <option value="price-desc">الأعلى سعراً</option>
            </select>
          </div>
        </div>

        {/* 4. Product Cards Grid (3D Hover & Motion) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredProducts.map((product) => {
            const discountPercent = product.compareAtPrice
              ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
              : null;

            return (
              <div
                key={product.id}
                id={product.id}
                className="product-card group rounded-3xl overflow-hidden border border-slate-200/90 bg-white flex flex-col justify-between shadow-xs hover:shadow-xl transition-all duration-300"
              >
                {/* Visual Thumbnail */}
                <div className="relative p-3">
                  <div
                    className={`relative h-44 sm:h-48 rounded-2xl overflow-hidden bg-gradient-to-tr ${
                      product.color || 'from-[#06b6d4] to-[#0284c7]'
                    } flex items-center justify-center p-4 border border-slate-100 shadow-inner`}
                  >
                    <i
                      className={`${product.icon || 'fa-solid fa-gem'} text-6xl text-white/35 group-hover:scale-110 transition-transform duration-500`}
                    ></i>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end z-10">
                      {product.badge && (
                        <span className="px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-md text-slate-900 font-black text-[10px] shadow-sm flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-500 fill-current" />
                          <span>{product.badge}</span>
                        </span>
                      )}
                      {discountPercent && (
                        <span className="px-2 py-0.5 rounded-lg bg-rose-500 text-white font-black text-[10px] shadow-sm">
                          -{discountPercent}%
                        </span>
                      )}
                    </div>

                    {/* Category Pill on bottom */}
                    <div className="absolute bottom-2.5 right-2.5 z-10">
                      <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-800">
                        {product.categoryName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-4 pt-1 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Rating */}
                    <div className="flex items-center gap-1.5 text-xs text-amber-500 mb-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-bold text-slate-800">{product.rating}</span>
                      <span className="text-slate-400 text-[10px]">({product.reviewsCount})</span>
                    </div>

                    {/* Title */}
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#0284c7] transition-colors leading-snug line-clamp-2">
                        {product.title}
                      </h3>
                    </Link>

                    {/* Short Description */}
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {product.shortDescription}
                    </p>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-base sm:text-lg font-black text-[#0284c7] font-mono">
                          {formatPrice(product.price)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-[11px] text-slate-400 line-through mr-1.5 font-mono">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                        ضمان كامل
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveModalProduct(product)}
                        className="col-span-2 py-2 px-2 rounded-xl velto-gradient-btn text-white font-black text-[11px] shadow-sm transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Zap className="w-3 h-3" />
                        <span>طلب مباشر</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          addToCart(product, 1);
                          setIsCartOpen(true);
                        }}
                        className="col-span-1 py-2 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-[#0284c7] border border-slate-200 transition flex items-center justify-center cursor-pointer"
                        title="أضف إلى السلة"
                        aria-label="أضف إلى السلة"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Exclusive Deal of the Week (عرض الأسبوع الحصري) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0a192f] via-[#0369a1] to-[#0f172a] text-white p-6 sm:p-10 shadow-2xl border border-cyan-500/20">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-200 text-xs font-bold border border-cyan-400/30">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>عرض الأسبوع الخاطف في فيلترو</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                اشتراك نتفلكس بريميوم 4K <br />
                <span className="text-cyan-300 font-mono">15.00 ر.س</span> فقط بدلاً من 35.00 ر.س
              </h2>

              <p className="text-xs sm:text-sm text-cyan-100/90 leading-relaxed max-w-lg">
                شاشة مستقلة خاصة بك برقم سري PIN، تدعم دقة 4K Ultra HD والصوت المكاني Spatial Audio بدون أي توقف، مع الضمان الذهبي لاسترداد القيمة أو استبدال الحساب.
              </p>

              {/* Progress Indicator */}
              <div className="space-y-1.5 max-w-sm">
                <div className="flex justify-between text-xs text-cyan-200 font-bold">
                  <span>تم حجز 85% من الباقة</span>
                  <span>متبقي 6 حسابات فقط</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full w-[85%] animate-pulse" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const netflix = products.find((p) => p.id === 'prod-netflix-4k');
                    if (netflix) setActiveModalProduct(netflix);
                  }}
                  className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs shadow-xl transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-[#0284c7]" />
                  <span>اطلب العرض الآن بـ 15.00 ر.س</span>
                </button>
              </div>
            </div>

            {/* Countdown Clock Display */}
            <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 text-center space-y-4">
              <span className="text-xs font-bold text-cyan-200">ينتهي العرض الخاص خلال:</span>
              
              <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
                <div className="p-3 sm:p-4 rounded-2xl bg-black/30 border border-white/10 min-w-[65px] sm:min-w-[80px]">
                  <div className="text-xl sm:text-3xl font-black font-mono text-white">{timeLeft.days}</div>
                  <div className="text-[10px] text-cyan-200 font-bold mt-1">أيام</div>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-black/30 border border-white/10 min-w-[65px] sm:min-w-[80px]">
                  <div className="text-xl sm:text-3xl font-black font-mono text-white">{timeLeft.hours}</div>
                  <div className="text-[10px] text-cyan-200 font-bold mt-1">ساعات</div>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-black/30 border border-white/10 min-w-[65px] sm:min-w-[80px]">
                  <div className="text-xl sm:text-3xl font-black font-mono text-white">{timeLeft.minutes}</div>
                  <div className="text-[10px] text-cyan-200 font-bold mt-1">دقائق</div>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-black/30 border border-white/10 min-w-[65px] sm:min-w-[80px]">
                  <div className="text-xl sm:text-3xl font-black font-mono text-cyan-300 animate-pulse">{timeLeft.seconds}</div>
                  <div className="text-[10px] text-cyan-200 font-bold mt-1">ثواني</div>
                </div>
              </div>

              <div className="text-[11px] text-white/70">
                تسليم فوري بعد الطلب عبر خدمة عملاء فيلترو بالواتساب
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Why Choose Velto? (لماذا تختار متجر فيلترو؟) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold text-[#0284c7] uppercase tracking-wider">
            المعايير والقيم
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            لماذا يثق آلاف العملاء في متجر فيلترو؟
          </h2>
          <p className="text-xs text-slate-500">
            نضمن لك تجربة شراء رقمية استثنائية من لحظة الطلب وحتى نهاية مدة الاشتراك.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-[#0284c7] flex items-center justify-center text-xl shadow-xs group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-sm">ضمان ذهبي كامل المدة</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              جميع اشتراكاتنا تخضع لضمان استبدال فوري أو حل أي استفسار طوال فترة الاشتراك بدون أي انقطاع.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-xl shadow-xs group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-sm">تسليم وتواصل مباشر</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              فريق خدمة عملاء فيلترو يتواصل معك فور إرسال الطلب عبر الواتساب لإكمال تسليم حسابك في دقائق.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center text-xl shadow-xs group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-sm">توفير حقيقي يصل 70%</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              نوفر لك نفس ميزات الاشتراكات الأصلية بأقل من ربع التكلفة الرسمية، بجودة كاملة وبشكل رسمي.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-xl shadow-xs group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-sm">أمان وخصوصية تامة</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              معلوماتك مشفرة ولا نشارك بياناتك مطلقاً. ملفات مستقلة وحسابات مخصصة تضمن راحة بالك.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Customer Testimonials (قالوا عن فيلترو) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
            تقييمات موثقة
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            تجارب عملاء متجر فيلترو
          </h2>
          <p className="text-xs text-slate-500">
            أكثر من 2,400+ تقييم 5 نجوم من عملائنا الراضين في المملكة والخليج.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-[11px] text-slate-400">قبل يومين</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              &quot;اشتراك نتفلكس شغال زي الحلاوة 4K بدون أي لاق أو مشاكل، وتواصل الواتساب سريع ومحترم جداً. شكراً فيلترو!&quot;
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-cyan-100 text-[#0284c7] font-black text-xs flex items-center justify-center">
                ف. ع
              </div>
              <div>
                <strong className="text-xs text-slate-900 block">فيصل العتيبي</strong>
                <span className="text-[10px] text-emerald-600 font-bold">مشتري موثق ✓</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-[11px] text-slate-400">قبل 4 أيام</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              &quot;كاب كت برو اتفعل مباشرة وتصدير 4K شغال 100%. السعر ممتاز جداً مقارنة بالسعر الرسمي، استمروا يا أبطال.&quot;
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 font-black text-xs flex items-center justify-center">
                م. ش
              </div>
              <div>
                <strong className="text-xs text-slate-900 block">محمد الشهراني</strong>
                <span className="text-[10px] text-emerald-600 font-bold">مشتري موثق ✓</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-[11px] text-slate-400">قبل أسبوع</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              &quot;حساب جيميناي أدفانسد شغال معي بأعلى نموذج، وخدمة العملاء متعاونين جداً وردوا علي في أقل من 5 دقائق.&quot;
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                س. ح
              </div>
              <div>
                <strong className="text-xs text-slate-900 block">سارة الحربي</strong>
                <span className="text-[10px] text-emerald-600 font-bold">مشترية موثقة ✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Direct WhatsApp CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          
          <div className="space-y-2 text-center md:text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
              <Headphones className="w-3.5 h-3.5" />
              <span>فريق دعم فيلترو متاح الآن</span>
            </div>
            <h3 className="text-xl sm:text-3xl font-black text-white">
              هل لديك استفسار أو طلب خاص؟ تواصل معنا مباشرة!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              جاهزون للرد الفوري على كل ما يخص الاشتراكات، طرق السداد، وتفعيل الحسابات عبر الواتساب.
            </p>
          </div>

          <a
            href="https://wa.me/966532137759"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-emerald-800 font-black text-xs sm:text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-2.5 shrink-0"
          >
            <i className="fa-brands fa-whatsapp text-xl text-emerald-600"></i>
            <span>تواصل عبر الواتساب (0532137759)</span>
          </a>
        </div>
      </section>

      {/* Order Modal (Direct Checkout) */}
      {activeModalProduct && (
        <OrderModal
          product={activeModalProduct}
          isOpen={!!activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
        />
      )}

    </div>
  );
}
