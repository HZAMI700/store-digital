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
} from 'lucide-react';

export default function HomePage() {
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  const { addToCart, setIsCartOpen } = useCart();

  // Hero Slider State
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const heroSlides = [
    {
      title: 'اشتراك جوجل جيميناي أدفانسد Gemini 1.5 Pro',
      subtitle: 'أقوى نموذج ذكاء اصطناعي لتحليل البيانات وبرمجة المشاريع مع نافذة 1M Tokens',
      badge: 'العرض الأقوى هذا الشهر 🔥',
      price: '35 ر.س',
      originalPrice: '80 ر.س',
      discount: 'خصم 56%',
      productId: 'prod-gemini-advanced',
      icon: 'fa-solid fa-brain',
      bgGradient: 'from-[#2b0b6b] via-[#41129b] to-[#5e17eb]',
    },
    {
      title: 'اشتراك نتفلكس بريميوم 4K Ultra HD',
      subtitle: 'ملف خاص مقفل برقم سري PIN وجودة سينمائية فائقة بدون انقطاع',
      badge: 'الأكثر طلباً ومبيعاً ⭐',
      price: '19 ر.س',
      originalPrice: '45 ر.س',
      discount: 'خصم 60%',
      productId: 'prod-netflix-4k',
      icon: 'fa-solid fa-film',
      bgGradient: 'from-[#1a0538] via-[#350d75] to-[#5e17eb]',
    },
    {
      title: 'باقة صناعة المحتوى: كاب كت برو + كانفا برو',
      subtitle: 'أدوات الذكاء الاصطناعي وتصدير 4K وإزالة الخلفيات وتصاميم غير محدودة',
      badge: 'تفعيل رسمي ومباشر ⚡',
      price: '19 ر.س',
      originalPrice: '55 ر.س',
      discount: 'خصم 65%',
      productId: 'prod-capcut-pro-1m',
      icon: 'fa-solid fa-wand-magic-sparkles',
      bgGradient: 'from-[#2b0b6b] via-[#5e17eb] to-[#843dff]',
    },
  ];

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, [heroSlides.length]);

  // Deal of the week countdown timer
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 14,
    minutes: 25,
    seconds: 40,
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

  // Spotlight active tab state
  const [spotlightTab, setSpotlightTab] = useState(0);

  const categories = [
    { id: 'all', name: 'جميع الاشتراكات (5)', icon: 'fa-solid fa-border-all' },
    { id: 'streaming', name: 'المشاهدة (Netflix 4K)', icon: 'fa-solid fa-film' },
    { id: 'design', name: 'التصميم (CapCut & Canva)', icon: 'fa-solid fa-palette' },
    { id: 'security', name: 'الحماية (ExpressVPN)', icon: 'fa-solid fa-shield-halved' },
    { id: 'ai', name: 'الذكاء الاصطناعي (Gemini Pro)', icon: 'fa-solid fa-brain' },
  ];

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }
    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setIsCartOpen(true);
  };

  const spotlightProduct = products.find((p) => p.id === 'prod-gemini-advanced') || products[0];

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      
      {/* 1. Y7X Hero Banner Carousel (s-block--hero-slider) */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-[#2b0b6b] via-[#41129b] to-[#5e17eb] text-white">
          <div className="relative min-h-[380px] sm:min-h-[420px] flex items-center p-6 sm:p-12 lg:p-16">
            
            {/* Slide Content */}
            <div className="max-w-2xl space-y-4 sm:space-y-6 text-right z-10 animate-in fade-in duration-300">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-black text-purple-100 shadow-sm">
                <i className="fa-solid fa-bolt text-yellow-300"></i>
                <span>{heroSlides[activeHeroSlide].badge}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {heroSlides[activeHeroSlide].title}
              </h1>

              <p className="text-xs sm:text-sm text-purple-100 leading-relaxed max-w-xl">
                {heroSlides[activeHeroSlide].subtitle}
              </p>

              {/* Price & CTA row */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-baseline gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                  <span className="text-2xl sm:text-3xl font-black text-yellow-300 font-mono">
                    {heroSlides[activeHeroSlide].price}
                  </span>
                  <span className="text-xs text-white/60 line-through font-mono">
                    {heroSlides[activeHeroSlide].originalPrice}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-black">
                    {heroSlides[activeHeroSlide].discount}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const found = products.find((p) => p.id === heroSlides[activeHeroSlide].productId);
                    if (found) setActiveModalProduct(found);
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-white text-[#5e17eb] hover:bg-purple-50 font-black text-xs sm:text-sm shadow-xl transition flex items-center gap-2 active:scale-95"
                >
                  <i className="fa-solid fa-bolt text-yellow-500"></i>
                  <span>طلب مباشر الآن</span>
                </button>

                <a
                  href="#products"
                  className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2"
                >
                  <span>استعراض الـ 5 باقات</span>
                  <i className="fa-solid fa-arrow-left text-xs"></i>
                </a>
              </div>
            </div>

            {/* Background Graphic Watermark */}
            <div className="absolute left-6 lg:left-16 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center opacity-20 pointer-events-none">
              <i className={`${heroSlides[activeHeroSlide].icon} text-[220px] text-white`}></i>
            </div>
          </div>

          {/* Slider Pagination Controls */}
          <div className="absolute bottom-4 left-6 flex items-center gap-2 z-20">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveHeroSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeHeroSlide === idx ? 'w-8 bg-yellow-300' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`الشريحة ${idx + 1}`}
              />
            ))}
          </div>

          {/* Slider Prev/Next Arrows */}
          <div className="absolute bottom-4 right-6 flex items-center gap-2 z-20">
            <button
              onClick={() =>
                setActiveHeroSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))
              }
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
              aria-label="السابق"
            >
              <i className="fa-solid fa-chevron-right text-xs"></i>
            </button>
            <button
              onClick={() => setActiveHeroSlide((prev) => (prev + 1) % heroSlides.length)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
              aria-label="التالي"
            >
              <i className="fa-solid fa-chevron-left text-xs"></i>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Iconic Y7X Section Divider (s-angel--divider) */}
      <section className="s-angel--divider max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center w-full">
          <span className="inline-block h-[1px] flex-1 bg-[#e8e8e8]"></span>

          <div className="flex flex-col items-center justify-center px-6 sm:px-10 gap-1.5 text-center">
            {/* Spinning/Glowing Icon */}
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 text-[#5e17eb] flex items-center justify-center shadow-sm">
              <i className="fa-solid fa-fire text-lg text-rose-500 animate-pulse"></i>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight whitespace-nowrap">
              الترند الأن
            </h2>
            <p className="text-xs text-slate-500 whitespace-nowrap font-medium">
              تصفح أحدث الاشتراكات الرقمية والذكاء الاصطناعي الآن
            </p>
          </div>

          <span className="inline-block h-[1px] flex-1 bg-[#e8e8e8]"></span>
        </div>
      </section>

      {/* 3. Category Filter Navigation Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shadow-2xs ${
                selectedCategory === cat.id
                  ? 'bg-[#5e17eb] text-white shadow-md shadow-[#5e17eb]/20'
                  : 'bg-white hover:bg-purple-50 text-slate-700 border border-[#e8e8e8] hover:border-purple-200'
              }`}
            >
              <i className={cat.icon}></i>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Products Grid Section (s-block container) */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Header with Sort & Search stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e8e8e8]">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-6 rounded-full bg-[#5e17eb]"></div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                أحدث الاشتراكات الرقمية (الـ 5 باقات المعتمدة)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                تسليم فوري ومباشر 100% مع ضمان ذهبي طوال مدة الاشتراك
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-xs text-slate-500 font-semibold">ترتيب حسب:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-[#e8e8e8] rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#5e17eb]"
            >
              <option value="popular">الأكثر طلباً وتفضيلاً</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
            </select>
          </div>
        </div>

        {/* 5 Product Cards in Exact Y7X UI/UX Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {filteredAndSortedProducts.map((product) => (
            <div
              key={product.id}
              id={product.id}
              className="product-card group relative rounded-2xl bg-white border border-[#e8e8e8] overflow-hidden flex flex-col justify-between shadow-sm transition-all duration-300"
            >
              {/* Card Image Thumbnail */}
              <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Floating Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-1 items-start z-10">
                  {product.badge && (
                    <span className="px-2.5 py-1 rounded-lg bg-[#5e17eb] text-white font-bold text-[10px] shadow-sm">
                      {product.badge}
                    </span>
                  )}
                  {product.discount && (
                    <span className="px-2 py-0.5 rounded-lg bg-rose-500 text-white font-black text-[10px] shadow-sm">
                      {product.discount}
                    </span>
                  )}
                </div>

                {/* Instant Delivery Badge */}
                <div className="absolute bottom-2.5 right-2.5 z-10">
                  <span className="px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-slate-800 font-bold text-[10px] border border-slate-200 shadow-2xs flex items-center gap-1">
                    <i className="fa-solid fa-bolt text-yellow-500 text-[10px]"></i>
                    <span>تسليم فوري</span>
                  </span>
                </div>
              </div>

              {/* Card Info Body */}
              <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between text-right">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[#5e17eb] block">
                    {product.categoryName}
                  </span>

                  <Link
                    href={`/products/${product.slug}`}
                    className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#5e17eb] transition line-clamp-2 leading-snug"
                  >
                    {product.title}
                  </Link>

                  {/* Stars Rating */}
                  <div className="flex items-center gap-1 text-[11px] text-amber-500">
                    <i className="fa-solid fa-star"></i>
                    <span className="font-bold text-slate-700">{product.rating}</span>
                    <span className="text-slate-400 text-[10px]">({product.reviewsCount}+ تقييم)</span>
                  </div>
                </div>

                {/* Pricing Box */}
                <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base sm:text-lg font-black text-[#5e17eb] font-mono">
                      {formatPrice(product.price)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-xs text-slate-400 line-through font-mono">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    متوفر
                  </span>
                </div>

                {/* Action Buttons: Direct Order & Add to Cart */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalProduct(product)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#5e17eb] hover:bg-[#4f0ecf] text-white font-bold text-xs shadow-md shadow-[#5e17eb]/20 transition flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <i className="fa-solid fa-bolt text-yellow-300 text-[11px]"></i>
                    <span>طلب مباشر</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-[#5e17eb] border border-slate-200 transition shrink-0"
                    title="إضافة إلى السلة"
                  >
                    <i className="fa-solid fa-bag-shopping text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Special Spotlight Offer (Y7X s-block--special-product "عرض الأسبوع") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-[#e8e8e8] shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            
            {/* Visual Media Column */}
            <div className="lg:col-span-6 relative aspect-video lg:aspect-auto lg:h-full bg-slate-100 overflow-hidden">
              <img
                src={spotlightProduct.imageUrl}
                alt={spotlightProduct.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1.5 rounded-xl bg-[#5e17eb] text-white font-black text-xs shadow-lg flex items-center gap-1.5">
                  <i className="fa-solid fa-fire text-yellow-300"></i>
                  <span>عرض الأسبوع الحصري</span>
                </span>
              </div>
            </div>

            {/* Info & Countdown Column */}
            <div className="lg:col-span-6 p-6 sm:p-10 space-y-6 text-right">
              <div>
                <span className="text-xs font-black text-[#5e17eb] uppercase tracking-wider block mb-1">
                  عرض خاص ومحدود
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                  {spotlightProduct.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {spotlightProduct.shortDescription}
                </p>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 pb-4 border-b border-slate-100">
                <span className="text-3xl font-black text-[#5e17eb] font-mono">
                  {formatPrice(spotlightProduct.price)}
                </span>
                <span className="text-sm text-slate-500">بدلاً من</span>
                <span className="text-base text-slate-400 line-through font-mono">
                  {formatPrice(spotlightProduct.compareAtPrice || 80)}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-black text-xs">
                  وفر 56%
                </span>
              </div>

              {/* Y7X Countdown Timer Box */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#5e17eb]">
                  <i className="fa-solid fa-clock"></i>
                  <span>متبقي على انتهاء هذا الخصم:</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center" dir="ltr">
                  <div className="p-2.5 rounded-2xl bg-purple-50 border border-purple-200">
                    <span className="block text-lg font-black text-[#5e17eb] font-mono">{timeLeft.seconds}</span>
                    <span className="text-[10px] text-slate-500 font-bold">ثانية</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-purple-50 border border-purple-200">
                    <span className="block text-lg font-black text-[#5e17eb] font-mono">{timeLeft.minutes}</span>
                    <span className="text-[10px] text-slate-500 font-bold">دقيقة</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-purple-50 border border-purple-200">
                    <span className="block text-lg font-black text-[#5e17eb] font-mono">{timeLeft.hours}</span>
                    <span className="text-[10px] text-slate-500 font-bold">ساعة</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-purple-50 border border-purple-200">
                    <span className="block text-lg font-black text-[#5e17eb] font-mono">{timeLeft.days}</span>
                    <span className="text-[10px] text-slate-500 font-bold">أيام</span>
                  </div>
                </div>
              </div>

              {/* Y7X Feature Tabs */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs font-bold">
                  <button
                    onClick={() => setSpotlightTab(0)}
                    className={`pb-1 px-1 transition border-b-2 ${
                      spotlightTab === 0 ? 'border-[#5e17eb] text-[#5e17eb]' : 'border-transparent text-slate-500'
                    }`}
                  >
                    مميزات الحساب
                  </button>
                  <button
                    onClick={() => setSpotlightTab(1)}
                    className={`pb-1 px-1 transition border-b-2 ${
                      spotlightTab === 1 ? 'border-[#5e17eb] text-[#5e17eb]' : 'border-transparent text-slate-500'
                    }`}
                  >
                    طريقة التسليم
                  </button>
                  <button
                    onClick={() => setSpotlightTab(2)}
                    className={`pb-1 px-1 transition border-b-2 ${
                      spotlightTab === 2 ? 'border-[#5e17eb] text-[#5e17eb]' : 'border-transparent text-slate-500'
                    }`}
                  >
                    الضمان الذهبي
                  </button>
                </div>

                <div className="text-xs text-slate-700 min-h-[48px] flex items-center leading-relaxed">
                  {spotlightTab === 0 && (
                    <span>🚀 وصول غير محدود لأقوى نموذج ذكاء اصطناعي Gemini 1.5 Pro مع نافذة 1M Tokens وأولوية قصوى.</span>
                  )}
                  {spotlightTab === 1 && (
                    <span>💬 تواصل فوري ومباشر عبر الواتساب لتأكيد بياناتك وتسليم الحساب وشرح طريقة الاستخدام خطوة بخطوة.</span>
                  )}
                  {spotlightTab === 2 && (
                    <span>🛡️ ضمان ذهبي كامل المدة مع تعويض فوري واستبدال عند حدوث أي خلل دون أي تكلفة إضافية.</span>
                  )}
                </div>
              </div>

              {/* Spotlight CTA */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalProduct(spotlightProduct)}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-[#5e17eb] hover:bg-[#4f0ecf] text-white font-black text-xs sm:text-sm shadow-xl shadow-[#5e17eb]/25 transition flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-bolt text-yellow-300"></i>
                  <span>طلب هذا العرض الآن</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddToCart(spotlightProduct)}
                  className="py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition flex items-center gap-2"
                >
                  <i className="fa-solid fa-bag-shopping text-[#5e17eb]"></i>
                  <span className="hidden sm:inline">أضف للسلة</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Why Choose Y7X Store (Guarantees & Values) */}
      <section id="guarantees" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            لماذا يختار آلاف العملاء متجر يوكس Y7X؟
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            نلتزم بأعلى معايير المصداقية والجودة لضمان تجربة شراء مريحة وموثوقة بنسبة 100%.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-[#e8e8e8] shadow-sm space-y-3 text-right hover:border-purple-300 transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5e17eb] flex items-center justify-center text-xl shadow-2xs">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">تسليم فوري ومباشر</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              بمجرد تقديم طلبك يتم مراجعته والتواصل معك عبر الواتساب فوراً لتسليم بيانات الحساب.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#e8e8e8] shadow-sm space-y-3 text-right hover:border-purple-300 transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5e17eb] flex items-center justify-center text-xl shadow-2xs">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">ضمان ذهبي كامل المدة</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              جميع الاشتراكات مشمولة بضمان ذهبي طوال الفترة المحددة مع استبدال فوري عند أي مشكلة.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#e8e8e8] shadow-sm space-y-3 text-right hover:border-purple-300 transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5e17eb] flex items-center justify-center text-xl shadow-2xs">
              <i className="fa-brands fa-whatsapp text-emerald-600"></i>
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">دعم متواصل عبر الواتساب</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              فريق دعم فني متمرس جاهز للإجابة على استفساراتك وتوفير خيارات الدفع المناسبة.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#e8e8e8] shadow-sm space-y-3 text-right hover:border-purple-300 transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5e17eb] flex items-center justify-center text-xl shadow-2xs">
              <i className="fa-solid fa-certificate text-amber-500"></i>
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">موثق ومعتمد رسمياً</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              متجر مسجل في المركز السعودي للأعمال برقم 0000170796 لضمان حماية حقوقك.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Customer Reviews / Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
            <i className="fa-solid fa-star text-amber-500"></i>
            <span>تقييمات ممتازة 4.9/5 من أكثر من 1,200 عميل</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ماذا يقول عملاء متجر يوكس؟
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-[#e8e8e8] shadow-sm space-y-3 text-right">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400 text-xs">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
              <span className="text-[11px] text-slate-400">قبل يومين</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              &quot;أفضل تجربة شراء اشتراك نتفلكس 4K، تم التواصل معي عبر الواتساب في أقل من 5 دقائق واستلمت الملف برقم سري خاص وشغال زي العسل.&quot;
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">سعود الشمري</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                مشتري موثق ✓
              </span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#e8e8e8] shadow-sm space-y-3 text-right">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400 text-xs">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
              <span className="text-[11px] text-slate-400">قبل 4 أيام</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              &quot;اشتراك كاب كت برو يفتح كل ميزات الذكاء الاصطناعي والتصدير بدون لوقو، ممتاز جداً لصناع المحتوى وسعرهم أرخص سعر في السوق.&quot;
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">عبدالله المالكي</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                مشتري موثق ✓
              </span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#e8e8e8] shadow-sm space-y-3 text-right">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400 text-xs">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
              <span className="text-[11px] text-slate-400">قبل أسبوع</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              &quot;جوجل جيميناي أدفانسد رائع في تحليل الملفات والأكواد وسرعة خارقة. التعامل راقي جداً وخدمة عملاء على الواتساب قمة في الاحترام.&quot;
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">محمد العتيبي</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                مشتري موثق ✓
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Direct WhatsApp Contact CTA Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#2b0b6b] via-[#3f1196] to-[#5e17eb] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-right">
            <span className="text-xs font-bold text-yellow-300 flex items-center justify-center md:justify-start gap-1.5">
              <i className="fa-solid fa-headphones"></i>
              <span>فريق متجر يوكس جاهز لخدمتك 24/7</span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              هل لديك استفسار أو ترغب في باقة مخصصة؟
            </h3>
            <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
              تواصل معنا مباشرة عبر الواتساب وسنقوم بالرد عليك في غضون دقائق مع توضيح كامل التفاصيل.
            </p>
          </div>

          <a
            href="https://api.whatsapp.com/send/?phone=%2B966532137759&text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85+%D8%B9%D9%84%D9%8A%D9%83%D9%85%2C+%D8%AD%D8%A7%D8%A8+%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%B1%0A&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/30 flex items-center gap-2.5 transition active:scale-95 shrink-0"
          >
            <i className="fa-brands fa-whatsapp text-xl"></i>
            <span>محادثة واتساب: 0532137759</span>
          </a>
        </div>
      </section>

      {/* Order Modal Component */}
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
