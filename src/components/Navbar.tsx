'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/utils';

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, totalPrice, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNoticeIndex, setActiveNoticeIndex] = useState(0);
  const [bannerVisible, setBannerVisible] = useState(true);

  // Velto Rotating Announcement Ticker
  const announcements = [
    {
      text: 'مرحباً بك في متجر فيلترو (Velto) – تسليم فوري وضمان ذهبي كامل المدة لجميع الاشتراكات!',
      icon: 'fa-solid fa-bolt text-cyan-300 animate-pulse',
    },
    {
      text: 'خصم خاص حتى 50% على اشتراكات Netflix 4K، CapCut Pro، Canva Pro، ExpressVPN و Gemini!',
      icon: 'fa-solid fa-tag text-emerald-300',
    },
    {
      text: 'تفعيل يدوي مباشر وخدمة عملاء على مدار الساعة عبر الواتساب: 21650022767+',
      icon: 'fa-brands fa-whatsapp text-emerald-300',
    },
    {
      text: 'حسابات شخصية وخاصة 100% بدون انقطاع مع دعم فني مستمر',
      icon: 'fa-solid fa-shield-halved text-cyan-300',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveNoticeIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const term = searchQuery.trim().toLowerCase();
    const found = navProducts.find((p) => p.title.toLowerCase().includes(term));
    if (found) {
      router.push(`/products/${found.slug}`);
      setSearchModalOpen(false);
      setMobileMenuOpen(false);
    } else {
      router.push(`/#products`);
      setSearchModalOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const navProducts = [
    {
      id: 'prod-gemini-advanced',
      slug: 'google-gemini-advanced-1-month',
      title: 'جيميناي برو (3.8 & 4 Argon)',
      price: '30 د.ت',
      icon: 'fa-solid fa-brain text-indigo-600',
      tag: 'سنة كاملة • 3.8 & 4 Argon',
      tagColor: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    },
    {
      id: 'prod-shahid',
      slug: 'shahid-vip-subscription',
      title: 'شاهد VIP شامل',
      price: '15 د.ت',
      icon: 'fa-solid fa-tv text-emerald-600',
      tag: 'شهر واحد',
      tagColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    {
      id: 'prod-ufc',
      slug: 'ufc-fight-pass-subscription',
      title: 'UFC Fight Pass',
      price: '15 د.ت',
      icon: 'fa-solid fa-trophy text-rose-600',
      tag: 'شهر واحد',
      tagColor: 'bg-rose-50 text-rose-700 border border-rose-200',
    },
    {
      id: 'prod-disney',
      slug: 'disney-plus-subscription',
      title: 'ديزني بلس Disney+',
      price: '15 د.ت',
      icon: 'fa-solid fa-wand-magic-sparkles text-blue-600',
      tag: 'شهر واحد',
      tagColor: 'bg-blue-50 text-blue-700 border border-blue-200',
    },
    {
      id: 'prod-storytel',
      slug: 'storytel-subscription',
      title: 'ستوريتل Storytel',
      price: '15 د.ت',
      icon: 'fa-solid fa-book-open text-amber-600',
      tag: 'شهر واحد',
      tagColor: 'bg-amber-50 text-amber-700 border border-amber-200',
    },
    {
      id: 'prod-capcut-pro-1m',
      slug: 'capcut-pro-subscription',
      title: 'كاب كت CapCut Pro',
      price: '15 د.ت',
      icon: 'fa-solid fa-scissors text-cyan-600',
      tag: 'شهر واحد',
      tagColor: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
    },
    {
      id: 'prod-netflix-4k',
      slug: 'netflix-premium-4k-1-month',
      title: 'نتفلكس Netflix 4K',
      price: '18 د.ت',
      icon: 'fa-solid fa-film text-red-600',
      tag: 'شهر واحد',
      tagColor: 'bg-red-50 text-red-600 border border-red-200',
    },
    {
      id: 'prod-canva-pro',
      slug: 'canva-pro-1-month',
      title: 'كانفا Canva Pro',
      price: '10 د.ت',
      icon: 'fa-solid fa-palette text-sky-600',
      tag: 'سنة كاملة',
      tagColor: 'bg-sky-50 text-sky-700 border border-sky-200',
    },
    {
      id: 'prod-express-vpn',
      slug: 'expressvpn-premium-1-month',
      title: 'ExpressVPN',
      price: '15 د.ت',
      icon: 'fa-solid fa-shield-halved text-emerald-600',
      tag: 'شهر واحد',
      tagColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
  ];

  return (
    <>
      {/* 1. Velto Top Announcement Bar */}
      {bannerVisible && (
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0a192f] via-[#0369a1] to-[#0a192f] text-white text-xs sm:text-sm py-2 px-4 shadow-sm transition-all duration-300 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex-1 flex items-center justify-center gap-2.5 overflow-hidden h-5 text-center">
              <i className={`${announcements[activeNoticeIndex].icon} text-sm transition-all duration-300`}></i>
              <span className="truncate font-semibold tracking-wide animate-fade-in">
                {announcements[activeNoticeIndex].text}
              </span>
            </div>
            <button
              onClick={() => setBannerVisible(false)}
              className="text-white/70 hover:text-white text-sm p-1 transition shrink-0"
              aria-label="إغلاق الإعلان"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Store Header (Velto Sticky Glass Nav) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Right Section: Mobile Menu Trigger & Language/Currency */}
          <div className="flex items-center gap-3 sm:gap-4 w-1/3 justify-start">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-2 p-2 rounded-xl text-slate-800 hover:text-[#0284c7] hover:bg-slate-50 transition"
              aria-label="القائمة"
            >
              <i className="fa-solid fa-bars text-xl text-[#0284c7]"></i>
              <span className="hidden md:inline-block font-bold text-sm text-slate-900">القائمة</span>
            </button>

            {/* Language & Currency on Desktop */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-600 border-r border-slate-200 pr-3">
              <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold">AR</span>
              <span className="px-2 py-1 rounded-lg bg-sky-50 text-[#0284c7] font-bold border border-sky-100">🇹🇳 د.ت TND</span>
            </div>
          </div>

          {/* Center Section: Velto Official Brand Logo */}
          <div className="flex flex-col items-center justify-center">
            <Link href="/" className="flex items-center gap-3 group text-center">
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300 border border-slate-100 bg-white flex items-center justify-center p-0.5">
                <img
                  src="/logo.png"
                  alt="Velto Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
                  <span>متجر</span>
                  <span className="velto-gradient-text">فيلترو</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-cyan-50 text-[#0284c7] border border-cyan-200 font-mono font-black tracking-wider">
                    VELTO
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-1">الاشتراكات الرقمية والخدمات السحابية</div>
              </div>
            </Link>
          </div>

          {/* Left Section: Search, Tracking, My Orders, Admin, Cart */}
          <div className="flex items-center justify-end gap-2 sm:gap-2.5 w-1/3">
            {/* Search Button */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-[#0284c7] transition"
              title="بحث في الاشتراكات"
              aria-label="بحث"
            >
              <i className="fa-solid fa-magnifying-glass text-base"></i>
            </button>

            {/* Tracking Link */}
            <Link
              href="/track-order"
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-[#0284c7] transition hidden sm:inline-flex"
              title="تتبع الطلب"
            >
              <i className="fa-solid fa-box-archive text-base"></i>
            </Link>

            {/* My Orders Link (Zero login needed) */}
            <Link
              href="/my-orders"
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-[#0284c7] transition"
              title="سجل طلباتي"
            >
              <i className="fa-solid fa-clipboard-list text-base"></i>
            </Link>

            {/* Shopping Cart Button with Shimmer */}
            <button
              id="cartBtn"
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 uiverse-galaxy-btn text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-md shadow-cyan-500/25 transition-all relative overflow-hidden"
            >
              <div className="relative">
                <i className="fa-solid fa-bag-shopping text-base"></i>
                {totalItems > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-scale-up">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline-block font-mono">{formatPrice(totalPrice)}</span>
            </button>
          </div>
        </div>

        {/* Infinite Moving Laser Line Directly Under Top Header / Logo */}
        <div className="relative h-[3px] w-full overflow-hidden bg-slate-100/80">
          <div className="animate-infinite-line" />
        </div>

        {/* 3. Category Horizontal Pills Sub-bar with Live Highlights */}
        <div className="border-t border-[#e2e8f0] bg-slate-50/80 overflow-x-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2.5 py-2.5 text-xs font-semibold whitespace-nowrap">
            <Link
              href="/#products"
              className="px-3.5 py-1.5 rounded-xl uiverse-galaxy-btn text-white font-bold flex items-center gap-1.5 shadow-xs"
            >
              <i className="fa-solid fa-border-all"></i>
              <span>جميع الاشتراكات (9)</span>
            </Link>

            {navProducts.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.slug}`}
                className="px-3 py-1.5 rounded-xl text-slate-700 hover:text-slate-900 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 transition-all flex items-center gap-2 shadow-2xs group"
              >
                <i className={`${item.icon} group-hover:scale-110 transition-transform`}></i>
                <span className="font-bold">{item.title}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${item.tagColor}`}>
                  {item.tag}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* 4. Velto Mobile Slide-out Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200" dir="rtl">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">
              
              {/* Drawer Top Header */}
              <div className="p-5 bg-gradient-to-r from-[#0a192f] to-[#0369a1] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-md">
                    <img src="/logo.png" alt="Velto" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-1">
                      <span>متجر فيلترو</span>
                      <span className="text-[10px] font-mono bg-cyan-400 text-slate-900 px-1 rounded font-black">VELTO</span>
                    </h3>
                    <p className="text-[11px] text-cyan-200">الاشتراكات الرقمية المعتمدة</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                  aria-label="إغلاق"
                >
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar text-right">
                
                {/* Search Bar inside Drawer */}
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن اشتراكك..."
                    className="w-full h-11 px-4 pr-10 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                  />
                  <i className="fa-solid fa-magnifying-glass absolute right-3.5 top-3.5 text-slate-400 text-xs"></i>
                </form>

                {/* Subscriptions Categories */}
                <div className="space-y-2">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                    الاشتراكات المعتمدة (9)
                  </div>

                  {navProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg shadow-2xs group-hover:scale-105 transition">
                          <i className={p.icon}></i>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-[#0284c7] transition">
                            {p.title}
                          </div>
                          <div className="text-[11px] text-slate-500 font-semibold">{p.price}</div>
                        </div>
                      </div>

                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${p.tagColor}`}>
                        {p.tag}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Important Links */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                    روابط تهمك
                  </div>

                  <Link
                    href="/track-order"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50 transition"
                  >
                    <i className="fa-solid fa-box-archive text-[#0284c7] text-sm"></i>
                    <span>تتبع حالة طلبك</span>
                  </Link>

                  <Link
                    href="/my-orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50 transition"
                  >
                    <i className="fa-solid fa-clipboard-list text-[#0284c7] text-sm"></i>
                    <span>سجل طلباتي</span>
                  </Link>
                </div>

                {/* Customer Support WhatsApp Card */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                  <div className="font-bold flex items-center gap-2 text-emerald-800">
                    <i className="fa-brands fa-whatsapp text-lg text-emerald-600"></i>
                    <span>خدمة عملاء فيلترو</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    متواجدون على مدار الساعة للرد على استفساراتكم وترتيب تسليم الحسابات.
                  </p>
                  <a
                    href="https://wa.me/21650022767"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                  >
                    <span>محادثة واتساب (+216 50 022 767)</span>
                  </a>
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 text-center text-[11px] text-slate-500">
                متجر فيلترو الرقمي Velto Store © 2026 • جميع الحقوق محفوظة
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-magnifying-glass text-[#0284c7]"></i>
                <span>البحث في متجر فيلترو</span>
              </h3>
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 transition"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن: نتفلكس، كاب كت، كانفا، ExpressVPN، جيميناي..."
                  className="w-full h-12 px-4 pr-11 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] focus:bg-white focus:ring-2 focus:ring-[#0284c7]/10"
                />
                <i className="fa-solid fa-magnifying-glass absolute right-4 top-4 text-slate-400"></i>
              </div>
            </form>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-500 block">الاشتراكات الأكثر بحثاً:</span>
              <div className="flex flex-wrap gap-2">
                {navProducts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      router.push(`/products/${p.slug}`);
                      setSearchModalOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-800 hover:text-[#0284c7] text-xs font-bold border border-slate-200 transition"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Velto Mobile Sticky Bottom Header */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-1" dir="rtl">
        <ul className="grid grid-cols-5 items-center justify-between text-center">
          <li>
            <Link
              href="/"
              className={`flex flex-col items-center py-1.5 text-[11px] font-bold ${
                pathname === '/' ? 'text-[#0284c7]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-house text-lg mb-0.5"></i>
              <span>الرئيسية</span>
            </Link>
          </li>

          <li>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="w-full flex flex-col items-center py-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900"
            >
              <i className="fa-solid fa-table-cells-large text-lg mb-0.5 text-[#0284c7]"></i>
              <span>الأقسام</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="w-full flex flex-col items-center py-1.5 text-[11px] font-bold text-slate-600 hover:text-[#0284c7] relative"
            >
              <div className="relative">
                <i className="fa-solid fa-bag-shopping text-lg mb-0.5"></i>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black">
                    {totalItems}
                  </span>
                )}
              </div>
              <span>السلة</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="w-full flex flex-col items-center py-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900"
            >
              <i className="fa-solid fa-magnifying-glass text-lg mb-0.5"></i>
              <span>بحث</span>
            </button>
          </li>

          <li>
            <Link
              href="/track-order"
              className={`flex flex-col items-center py-1.5 text-[11px] font-bold ${
                pathname === '/track-order' ? 'text-[#0284c7]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-box-archive text-lg mb-0.5"></i>
              <span>تتبع طلبي</span>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};
