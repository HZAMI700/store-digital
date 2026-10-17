'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/utils';

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bannerVisible, setBannerVisible] = useState(true);
  const { totalItems, totalPrice, setIsCartOpen } = useCart();

  const announcements = [
    { icon: 'fa-solid fa-tag text-yellow-300', text: 'خصم 10% لأول عملية شراء – استخدم كود WELCOME10' },
    { icon: 'fa-brands fa-instagram text-pink-300', text: 'تابعنا على منصة انستقرام لمعرفة أجدد العروض Yox7_Store' },
    { icon: 'fa-brands fa-whatsapp text-emerald-300', text: 'للتواصل مع الدعم الفني عبر الواتس اب 0532137759' },
    { icon: 'fa-solid fa-bolt text-yellow-300', text: 'تسليم فوري ومباشر 100% لجميع الاشتراكات مع ضمان ذهبي كامل المدة' },
  ];

  const [activeNoticeIndex, setActiveNoticeIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveNoticeIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}#products`;
      setSearchModalOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const navProducts = [
    {
      id: 'prod-netflix-4k',
      title: 'اشتراك نتفلكس بريميوم 4K',
      price: '19 ر.س',
      icon: 'fa-solid fa-film text-rose-500',
      tag: 'حسابات خاصة',
      tagColor: 'bg-red-500 text-white',
    },
    {
      id: 'prod-capcut-pro-1m',
      title: 'اشتراك كاب كت برو CapCut',
      price: '19 ر.س',
      icon: 'fa-solid fa-scissors text-purple-600',
      tag: 'الارخص',
      tagColor: 'bg-purple-600 text-white',
    },
    {
      id: 'prod-canva-pro',
      title: 'اشتراك كانفا برو Canva Pro',
      price: '25 ر.س',
      icon: 'fa-solid fa-palette text-sky-500',
      tag: 'أصلي 100%',
      tagColor: 'bg-sky-500 text-white',
    },
    {
      id: 'prod-express-vpn',
      title: 'اشتراك اكسبريس في بي ان ExpressVPN',
      price: '49 ر.س',
      icon: 'fa-solid fa-shield-halved text-emerald-600',
      tag: 'الأكثر أماناً',
      tagColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'prod-gemini-advanced',
      title: 'اشتراك جوجل جيميناي Gemini Advanced',
      price: '35 ر.س',
      icon: 'fa-solid fa-brain text-indigo-600',
      tag: 'جديد AI',
      tagColor: 'bg-indigo-600 text-white',
    },
  ];

  return (
    <>
      {/* 1. Y7X Top Announcement Bar (angel-ad) */}
      {bannerVisible && (
        <div className="angel-ad relative overflow-hidden bg-[#2b0b6b] text-white text-xs sm:text-sm py-2 px-4 shadow-sm transition-all duration-300 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex-1 flex items-center justify-center gap-2.5 overflow-hidden h-5 text-center">
              <i className={`${announcements[activeNoticeIndex].icon} text-sm transition-all`}></i>
              <span className="truncate font-semibold tracking-wide">
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

      {/* 2. Main Store Header (store-header) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e8e8e8] shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Right Section: Mobile Menu Trigger & Navigation */}
          <div className="flex items-center gap-3 sm:gap-4 w-1/3 justify-start">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="mburger flex items-center gap-2 p-2 rounded-xl text-slate-800 hover:text-[#5e17eb] hover:bg-slate-50 transition"
              aria-label="القائمة"
            >
              <i className="fa-solid fa-bars text-xl text-[#5e17eb]"></i>
              <span className="hidden md:inline-block font-bold text-sm text-slate-900">القائمة</span>
            </button>

            {/* Language & Currency on Desktop */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-600 border-r border-slate-200 pr-3">
              <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold">AR</span>
              <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold">🇸🇦 ر.س</span>
            </div>
          </div>

          {/* Center Section: Y7X Store Logo */}
          <div className="flex flex-col items-center justify-center">
            <Link href="/" className="flex items-center gap-3 group text-center">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#5e17eb] to-[#843dff] flex items-center justify-center shadow-md shadow-[#5e17eb]/25 group-hover:scale-105 transition">
                <span className="text-white font-black text-2xl tracking-tighter">Y7X</span>
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
                  <span>متجر</span>
                  <span className="text-[#5e17eb]">يوكس</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-[#5e17eb] border border-purple-200 font-mono font-bold">Y7X</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">متجر المنتجات الرقمية والاشتراكات</div>
              </div>
            </Link>
          </div>

          {/* Left Section: Search, User/Tracking, Admin, Cart */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 w-1/3">
            {/* Search Button */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-[#5e17eb] transition"
              title="بحث في المتجر"
              aria-label="بحث"
            >
              <i className="fa-solid fa-magnifying-glass text-base"></i>
            </button>

            {/* Tracking / My Orders */}
            <Link
              href="/track-order"
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-[#5e17eb] transition hidden sm:inline-flex"
              title="تتبع الطلب"
            >
              <i className="fa-solid fa-box-archive text-base"></i>
            </Link>

            {/* Customer Orders */}
            <Link
              href="/my-orders"
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-[#5e17eb] transition"
              title="سجل طلباتي"
            >
              <i className="fa-solid fa-clipboard-list text-base"></i>
            </Link>

            {/* Admin Panel Access */}
            <Link
              href="/admin"
              className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[#5e17eb] transition"
              title="لوحة تحكم الإدارة (خاص بالمسؤول)"
            >
              <i className="fa-solid fa-shield-halved text-base"></i>
            </Link>

            {/* Shopping Cart Button */}
            <button
              id="cartBtn"
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-[#5e17eb] hover:bg-[#4f0ecf] text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#5e17eb]/25 transition relative"
            >
              <div className="relative">
                <i className="fa-solid fa-bag-shopping text-base"></i>
                {totalItems > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-scale-in">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline-block font-mono">{formatPrice(totalPrice)}</span>
            </button>
          </div>
        </div>

        {/* 3. Category Horizontal Pills (Y7X Nav Header) */}
        <div className="border-t border-[#e8e8e8] bg-slate-50/80 overflow-x-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2.5 py-2.5 text-xs font-semibold whitespace-nowrap">
            <Link
              href="/#products"
              className="px-3.5 py-1.5 rounded-xl bg-[#5e17eb] text-white font-bold flex items-center gap-1.5 shadow-sm"
            >
              <i className="fa-solid fa-border-all"></i>
              <span>جميع الاشتراكات (5)</span>
            </Link>

            {navProducts.map((item) => (
              <Link
                key={item.id}
                href={`/#${item.id}`}
                className="px-3.5 py-1.5 rounded-xl text-slate-700 hover:text-slate-900 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 transition flex items-center gap-2 shadow-2xs"
              >
                <i className={item.icon}></i>
                <span>{item.title}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${item.tagColor}`}>
                  {item.tag}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* 4. Y7X Mobile Slide-out Menu Drawer (#mobile-menu) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer container */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col justify-between overflow-hidden">
              
              {/* Drawer Header */}
              <div className="p-5 bg-gradient-to-r from-[#2b0b6b] to-[#1f074d] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-black text-white">
                    Y7X
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">متجر يوكس | Y7X</h3>
                    <p className="text-[11px] text-purple-200">الاشتراكات الرقمية المعتمدة</p>
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
                    className="w-full h-11 px-4 pr-10 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#5e17eb] focus:bg-white"
                  />
                  <i className="fa-solid fa-magnifying-glass absolute right-3.5 top-3.5 text-slate-400 text-xs"></i>
                </form>

                {/* Subscriptions Categories */}
                <div className="space-y-2">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                    الاشتراكات المتاحة (5)
                  </div>

                  {navProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/#${p.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg shadow-2xs group-hover:scale-105 transition">
                          <i className={p.icon}></i>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-[#5e17eb] transition">
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
                    <i className="fa-solid fa-box-archive text-[#5e17eb] text-sm"></i>
                    <span>تتبع حالة طلبك</span>
                  </Link>

                  <Link
                    href="/my-orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50 transition"
                  >
                    <i className="fa-solid fa-user text-[#5e17eb] text-sm"></i>
                    <span>سجل طلباتي</span>
                  </Link>

                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 transition"
                  >
                    <i className="fa-solid fa-shield-halved text-sm"></i>
                    <span>لوحة تحكم الإدارة</span>
                  </Link>
                </div>

                {/* Customer Support WhatsApp */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                  <div className="font-bold flex items-center gap-2 text-emerald-800">
                    <i className="fa-brands fa-whatsapp text-lg text-emerald-600"></i>
                    <span>خدمة العملاء والدعم الفني</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    متواجدون على مدار الساعة للرد على استفساراتكم وترتيب الطلبات.
                  </p>
                  <a
                    href="https://api.whatsapp.com/send/?phone=%2B966532137759&text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85+%D8%B9%D9%84%D9%8A%D9%83%D9%85%2C+%D8%AD%D8%A7%D8%A8+%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%B1%0A&type=phone_number&app_absent=0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 transition"
                  >
                    <span>مراسلة عبر الواتساب</span>
                    <i className="fa-solid fa-arrow-left text-[10px]"></i>
                  </a>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 text-center text-[11px] text-slate-500">
                متجر يوكس Y7X Store © 2026 • جميع الحقوق محفوظة
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-magnifying-glass text-[#5e17eb]"></i>
                <span>البحث في متجر يوكس</span>
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
                  className="w-full h-12 px-4 pr-11 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#5e17eb] focus:bg-white focus:ring-2 focus:ring-[#5e17eb]/10"
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
                      window.location.href = `/#${p.id}`;
                      setSearchModalOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-800 hover:text-[#5e17eb] text-xs font-semibold border border-slate-200 transition"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Y7X Mobile Sticky Bottom Header (bottom-header) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1">
        <ul className="grid grid-cols-5 items-center justify-between text-center">
          <li>
            <Link
              href="/"
              className={`flex flex-col items-center py-1.5 text-[11px] font-bold ${
                pathname === '/' ? 'text-[#5e17eb]' : 'text-slate-600 hover:text-slate-900'
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
              <i className="fa-solid fa-table-cells-large text-lg mb-0.5 text-[#5e17eb]"></i>
              <span>الأقسام</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="w-full flex flex-col items-center py-1.5 text-[11px] font-bold text-slate-600 hover:text-[#5e17eb] relative"
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
                pathname === '/track-order' ? 'text-[#5e17eb]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-user text-lg mb-0.5"></i>
              <span>تتبع/حسابي</span>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};
