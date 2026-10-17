'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { INITIAL_PRODUCTS } from '@/lib/store';
import { Product } from '@/lib/types';
import { OrderModal } from '@/components/OrderModal';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/utils';
import {
  ShieldCheck,
  Zap,
  Sparkles,
  ShoppingBag,
  Star,
  Lock,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Flame,
  TrendingUp,
} from 'lucide-react';

export default function HomePage() {
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  const { addToCart, setIsCartOpen } = useCart();

  // Velto Top Hero Slider spanning full width edge-to-edge
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const heroSlides = [
    {
      id: 'slide-gemini',
      title: 'سنة كاملة بدون انقطاع Gemini Pro',
      subtitle: 'اشتراك سنوي كامل • حساب رسمي مع نموذج 1.5 Pro ونافذة استيعاب 1M رمز وضمان ذهبي طوال السنة',
      badge: '30 د.ت سنة كاملة 🤖',
      price: '30 د.ت (سنة كاملة)',
      originalPrice: '60 د.ت',
      discount: 'سنة كاملة',
      duration: 'سنة كاملة',
      productId: 'prod-gemini-advanced',
      imageUrl: '/images/card-gemini.jpg',
      icon: 'fa-solid fa-brain',
      accentColor: '#38bdf8',
    },
    {
      id: 'slide-shahid',
      title: 'شهر كامل بدون انقطاع Shahid VIP شامل',
      subtitle: 'اشتراك شهر واحد • حساب خاص رسمي مع متابعة كافة المسلسلات والأفلام بدقة Full HD وبدون أي إعلانات',
      badge: '15 د.ت شهر واحد 🎬',
      price: '15 د.ت (شهر)',
      originalPrice: '35 د.ت',
      discount: 'خصم 55%',
      duration: 'شهر واحد',
      productId: 'prod-shahid',
      imageUrl: '/images/card-shahid.jpg',
      icon: 'fa-solid fa-tv',
      accentColor: '#10b981',
    },
    {
      id: 'slide-disney',
      title: 'شهر كامل بدون انقطاع ديزني بلس Disney+',
      subtitle: 'اشتراك شهر واحد • حساب خاص رسمي يفتح عوالم ديزني، مارفل، بيكسار، وستار وورز بدقة 4K HDR مع ترجمة عربية',
      badge: '15 د.ت شهر واحد ✨',
      price: '15 د.ت (شهر)',
      originalPrice: '35 د.ت',
      discount: 'خصم 55%',
      duration: 'شهر واحد',
      productId: 'prod-disney',
      imageUrl: '/images/card-disney.jpg',
      icon: 'fa-solid fa-wand-magic-sparkles',
      accentColor: '#3b82f6',
    },
    {
      id: 'slide-ufc',
      title: 'شهر كامل بدون انقطاع UFC Fight Pass',
      subtitle: 'اشتراك شهر واحد • حساب خاص رسمي لمشاهدة جميع نزالات الفنون القتالية وبث الفعاليات الحصرية وأرشيف النزالات',
      badge: '15 د.ت شهر واحد 🥊',
      price: '15 د.ت (شهر)',
      originalPrice: '40 د.ت',
      discount: 'خصم 60%',
      duration: 'شهر واحد',
      productId: 'prod-ufc',
      imageUrl: '/images/card-ufc.jpg',
      icon: 'fa-solid fa-trophy',
      accentColor: '#ef4444',
    },
    {
      id: 'slide-storytel',
      title: 'شهر كامل بدون انقطاع ستوريتل Storytel',
      subtitle: 'اشتراك شهر واحد • حساب خاص رسمي لأضخم مكتبة للكتب الصوتية والإلكترونية والكورسات مع ميزة الاستماع بدون إنترنت',
      badge: '15 د.ت شهر واحد 📚',
      price: '15 د.ت (شهر)',
      originalPrice: '35 د.ت',
      discount: 'خصم 55%',
      duration: 'شهر واحد',
      productId: 'prod-storytel',
      imageUrl: '/images/card-storytel.jpg',
      icon: 'fa-solid fa-book-open',
      accentColor: '#f59e0b',
    },
    {
      id: 'slide-capcut',
      title: 'شهر كامل بدون انقطاع CapCut Pro',
      subtitle: 'اشتراك شهر واحد • حساب خاص مع فتح جميع أدوات الذكاء الاصطناعي وتصدير 4K بدون علامة مائية',
      badge: '15 د.ت شهر واحد 🔥',
      price: '15 د.ت (شهر)',
      originalPrice: '30 د.ت',
      discount: 'خصم 50%',
      duration: 'شهر واحد',
      productId: 'prod-capcut-pro-1m',
      imageUrl: '/images/card-capcut.jpg',
      icon: 'fa-solid fa-scissors',
      accentColor: '#06b6d4',
    },
    {
      id: 'slide-canva',
      title: 'شهر كامل بدون انقطاع Canva Pro',
      subtitle: 'اشتراك شهر واحد • ترقية حسابك الرسمي مع ملايين القوالب وإزالة الخلفيات وتنزيل التصاميم بجودة فائقة',
      badge: '25 د.ت شهر واحد ✨',
      price: '25 د.ت (شهر)',
      originalPrice: '50 د.ت',
      discount: 'خصم 50%',
      duration: 'شهر واحد',
      productId: 'prod-canva-pro',
      imageUrl: '/images/card-canva.jpg',
      icon: 'fa-solid fa-palette',
      accentColor: '#8b5cf6',
    },
    {
      id: 'slide-expressvpn',
      title: 'شهر كامل بدون انقطاع ExpressVPN',
      subtitle: 'اشتراك شهر واحد • حساب خاص بأعلى حماية وتشفير وسيرفرات فائقة لفك الحجب وحماية البيانات',
      badge: 'حماية وتشفير قصوى 🛡️',
      price: '45 د.ت (شهر)',
      originalPrice: '90 د.ت',
      discount: 'أعلى حماية',
      duration: 'شهر واحد',
      productId: 'prod-express-vpn',
      imageUrl: '/images/card-expressvpn.jpg',
      icon: 'fa-solid fa-shield-halved',
      accentColor: '#ef4444',
    },
    {
      id: 'slide-netflix',
      title: 'اشتراك نتفلكس بريميوم 4K Ultra HD',
      subtitle: 'شاشة خاصة برقم سري PIN وجودة سينمائية 4K HDR وصوت محيطي وضمان ذهبي شهر كامل',
      badge: 'الأكثر طلباً ومبيعاً ⭐',
      price: '18 د.ت (شهر)',
      originalPrice: '35 د.ت',
      discount: 'خصم 50%',
      duration: 'شهر واحد',
      productId: 'prod-netflix-4k',
      imageUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200&auto=format&fit=crop&q=80',
      icon: 'fa-solid fa-film',
      accentColor: '#e11d48',
    },
  ];

  useEffect(() => {
    if (isPaused) return;
    const slideTimer = setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(slideTimer);
  }, [heroSlides.length, isPaused]);

  const handlePrevSlide = () => {
    setActiveHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNextSlide = () => {
    setActiveHeroSlide((prev) => (prev + 1) % heroSlides.length);
  };

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
      id: 'ai',
      name: 'الذكاء الاصطناعي',
      count: products.filter((p) => p.categoryId === 'ai').length,
      icon: 'fa-solid fa-brain',
    },
    {
      id: 'entertainment',
      name: 'المشاهدة والترفيه',
      count: products.filter((p) => p.categoryId === 'entertainment').length,
      icon: 'fa-solid fa-tv',
    },
    {
      id: 'study',
      name: 'الدراسة والكورسات',
      count: products.filter((p) => p.categoryId === 'study').length,
      icon: 'fa-solid fa-graduation-cap',
    },
    {
      id: 'design',
      name: 'التصميم والمونتاج',
      count: products.filter((p) => p.categoryId === 'design').length,
      icon: 'fa-solid fa-wand-magic-sparkles',
    },
    {
      id: 'security',
      name: 'الحماية والأمان',
      count: products.filter((p) => p.categoryId === 'security').length,
      icon: 'fa-solid fa-shield-halved',
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-20 selection:bg-[#0284c7] selection:text-white" dir="rtl">
      
      {/* 1. Full-Width Edge-to-Edge Flagship Banner Slider (From Left to Right) */}
      <section
        className="w-full relative overflow-hidden bg-slate-950 group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative w-full h-[400px] sm:h-[460px] md:h-[500px] lg:h-[540px]">
          {heroSlides.map((slide, index) => {
            const isActive = index === activeHeroSlide;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background Artwork Layer with Subtle Overlay */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                  {/* Premium Multi-Layer Dark Gradient for High Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />
                </div>

                {/* Content Overlay - Fully Mobile Responsive */}
                <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-between py-6 sm:py-10">
                  
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-black text-white border border-white/20 shadow-sm animate-fade-in">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                      <span>{slide.badge}</span>
                    </span>

                    <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-black shadow-md">
                      {slide.discount}
                    </span>
                  </div>

                  {/* Middle Content */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-auto">
                    <div className="md:col-span-8 space-y-3 sm:space-y-4 text-right">
                      <div className="inline-flex items-center gap-2 text-cyan-300 text-xs font-extrabold">
                        <i className={slide.icon}></i>
                        <span>متجر فيلترو Veltro • اشتراك رسمي مضمون</span>
                      </div>

                      <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                        {slide.title}
                      </h2>

                      <p className="text-xs sm:text-sm lg:text-base text-slate-200/90 leading-relaxed max-w-2xl font-medium">
                        {slide.subtitle}
                      </p>

                      {/* WhatsApp Verification Pill */}
                      <div className="flex items-center gap-2 pt-1 text-xs text-emerald-400 font-bold">
                        <i className="fa-brands fa-whatsapp text-base"></i>
                        <span>تواصل مباشر وتفعيل فوري: +216 50 022 767</span>
                      </div>
                    </div>

                    {/* Desktop Card Preview Floater */}
                    <div className="hidden md:flex md:col-span-4 justify-center items-center">
                      <div className="relative w-48 sm:w-56 aspect-square rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300 animate-float bg-white/10 p-1.5">
                        <img
                          src={slide.imageUrl}
                          alt={slide.title}
                          className="w-full h-full object-cover rounded-2xl"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions & Price */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/15 pt-4">
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-300">
                        {slide.price}
                      </span>
                      {slide.originalPrice && (
                        <span className="text-sm font-mono text-white/50 line-through">
                          {slide.originalPrice}
                        </span>
                      )}
                      <span className="text-xs text-emerald-300 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                        تسليم فوري 100%
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          const found = products.find((p) => p.id === slide.productId);
                          if (found) setActiveModalProduct(found);
                        }}
                        className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl velto-gradient-btn hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-xl shadow-cyan-500/30 transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Zap className="w-4 h-4 text-yellow-300" />
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
                        className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/25 transition flex items-center justify-center gap-1.5 cursor-pointer"
                        title="أضف إلى السلة"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span className="hidden sm:inline">أضف للسلة</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrevSlide}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/20 flex items-center justify-center transition opacity-80 hover:opacity-100 cursor-pointer"
          aria-label="السابق"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={handleNextSlide}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/20 flex items-center justify-center transition opacity-80 hover:opacity-100 cursor-pointer"
          aria-label="التالي"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Slider Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveHeroSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeHeroSlide ? 'w-8 bg-cyan-400 shadow-md shadow-cyan-400/50' : 'w-2 bg-white/50'
              }`}
              aria-label={`شريحة ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. Floating Value Statement Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-bold text-slate-700">
          <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-2 animate-float">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ضمان ذهبي كامل المدة</span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-2 animate-float-delayed">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>تفعيل فوري عبر الواتساب: 21650022767+</span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-2 animate-float">
            <Lock className="w-4 h-4 text-[#0284c7]" />
            <span>حسابات خاصة بإيميل وباسورد من عندنا</span>
          </div>
        </div>
      </section>

      {/* 3. Products Section Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative py-2 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          
          <div className="relative bg-white px-6 py-2.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-cyan-50 border border-cyan-200 text-[#0284c7] flex items-center justify-center text-sm spinning-icon">
              <i className="fa-solid fa-sparkles"></i>
            </div>
            <div className="text-right">
              <div className="text-xs font-black text-slate-900 flex items-center gap-1">
                <span>اشتراكات متجر</span>
                <span className="velto-gradient-text font-black">فيلترو Veltro</span>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold">انقر على أي بطاقة لاختيار المدة وإتمام الطلب المباشر فوراً</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Category Filter Tabs */}
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
              <option value="popular">الأكثر طلباً</option>
              <option value="price-asc">الأقل سعراً</option>
              <option value="price-desc">الأعلى سعراً</option>
            </select>
          </div>
        </div>

        {/* 5. Minimalist Product Cards Grid: ONLY Image, Name, and Price */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-6">
          {filteredProducts.map((product) => {
            return (
              <div
                key={product.id}
                id={product.id}
                onClick={() => setActiveModalProduct(product)}
                className="product-card group cursor-pointer rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-xs hover:border-[#0284c7]/50 transition-all duration-200 flex flex-col justify-between p-3 sm:p-4 text-center select-none active:scale-[0.98]"
              >
                {/* 1. Image (Uploaded Official Veltro Product Card) */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 mb-2.5 sm:mb-3 shadow-inner">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-[#0284c7]/0 group-hover:bg-[#0284c7]/5 transition-colors duration-200 pointer-events-none" />
                </div>

                {/* 2. Product Name */}
                <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#0284c7] transition-colors leading-snug line-clamp-2 min-h-[2.4rem] flex items-center justify-center">
                  {product.title}
                </h3>

                {/* 3. Price in TND */}
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-center">
                  <span className="text-sm sm:text-lg font-black text-[#0284c7] font-mono">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Exclusive Deal of the Week */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0a192f] via-[#0369a1] to-[#0f172a] text-white p-6 sm:p-10 shadow-2xl border border-cyan-500/20">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-200 text-xs font-bold border border-cyan-400/30">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>عرض الأسبوع الخاطف في فيلترو Veltro</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                اشتراك كاب كت برو CapCut Pro <br />
                <span className="text-cyan-300 font-mono">15 د.ت</span> للشهر الواحد (1 Month)
              </h2>

              <p className="text-xs sm:text-sm text-cyan-100/90 leading-relaxed max-w-lg">
                تصدير بدقة 4K 60fps بدون علامة مائية مع فتح جميع أدوات الذكاء الاصطناعي على حسابك الشخصي مع الضمان الذهبي لاستبدال الحساب طوال المدة.
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
                    const capcut = products.find((p) => p.id === 'prod-capcut-pro-1m');
                    if (capcut) setActiveModalProduct(capcut);
                  }}
                  className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs shadow-xl transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-[#0284c7]" />
                  <span>اطلب العرض الآن بـ 15 د.ت</span>
                </button>
              </div>
            </div>

            {/* Countdown Clock Display */}
            <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/10 border border-white/20 text-center space-y-4">
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
                تسليم فوري بعد الطلب عبر خدمة عملاء فيلترو بالواتساب (+216 50 022 767)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Why Choose Velto? */}
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
              نوفر لك نفس ميزات الاشتراكات الأصلية بأقل من ربع التكلفة الرسمية بالدينار التونسي وبشكل رسمي.
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

      {/* 8. Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
            تقييمات موثقة
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            تجارب عملاء متجر فيلترو Veltro
          </h2>
          <p className="text-xs text-slate-500">
            أكثر من 2,400+ تقييم 5 نجوم من عملائنا في تونس والعالم العربي.
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
              &quot;اشتراك كاب كت برو اشتريته بـ 15 د.ت شغال بأعلى سرعة وتصدير 4K بدون لاق، والدعم بالواتساب سريع ومحترم جداً.&quot;
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-cyan-100 text-[#0284c7] font-black text-xs flex items-center justify-center">
                ف. ب
              </div>
              <div>
                <strong className="text-xs text-slate-900 block">فارس بن سالم</strong>
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
              &quot;جيميناي برو بـ 30 د.ت سنة كاملة عرض لا يقاوم! شغال مع نافذة مليون رمز وكل شيء رسمي 100%.&quot;
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 font-black text-xs flex items-center justify-center">
                م. ط
              </div>
              <div>
                <strong className="text-xs text-slate-900 block">مهدي الطرابلسي</strong>
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
              &quot;نتفلكس وكانفا واكسبريس شغالين بروعة. التعامل راقي جداً والتفعيل تم خلال 3 دقائق فقط عبر الواتساب. شكراً فيلترو!&quot;
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                س. ع
              </div>
              <div>
                <strong className="text-xs text-slate-900 block">سيرين العبيدي</strong>
                <span className="text-[10px] text-emerald-600 font-bold">مشترية موثقة ✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Direct WhatsApp CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          
          <div className="space-y-2 text-center md:text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
              <Headphones className="w-3.5 h-3.5" />
              <span>فريق دعم فيلترو متاح الآن</span>
            </div>
            <h3 className="text-xl sm:text-3xl font-black text-white">
              هل لديك استفسار أو طلب اشتراك خاص؟ تواصل معنا مباشرة!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              جاهزون للرد الفوري على كل ما يخص الاشتراكات، تفعيل الحسابات، والدعم الفني عبر الواتساب.
            </p>
          </div>

          <a
            href="https://wa.me/21650022767"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-emerald-800 font-black text-xs sm:text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-2.5 shrink-0"
          >
            <i className="fa-brands fa-whatsapp text-xl text-emerald-600"></i>
            <span>تواصل عبر الواتساب (+216 50 022 767)</span>
          </a>
        </div>
      </section>

      {/* 10. Interactive Order Modal */}
      {activeModalProduct && (
        <OrderModal
          product={activeModalProduct}
          isOpen={!!activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
        />
      )}

      {/* 11. Mobile Floating WhatsApp Quick Action Button */}
      <div className="fixed bottom-5 left-5 z-40 sm:hidden">
        <a
          href="https://wa.me/21650022767"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-emerald-500 text-white shadow-2xl flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-transform border-2 border-white"
          aria-label="تواصل واتساب مباشر"
        >
          <i className="fa-brands fa-whatsapp"></i>
        </a>
      </div>

    </div>
  );
}
