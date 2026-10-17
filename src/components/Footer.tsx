'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-slate-100 border-t border-[#e2e8f0] pt-12 pb-24 lg:pb-12 text-slate-600 text-sm mt-auto" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Back to Top Button */}
        <div className="flex justify-center border-b border-[#e2e8f0] pb-6">
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#0284c7] px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition shadow-2xs group cursor-pointer"
          >
            <span>العودة إلى أعلى</span>
            <i className="fa-solid fa-arrow-up group-hover:-translate-y-0.5 transition"></i>
          </button>
        </div>

        {/* Newsletter Box (Velto Style) */}
        <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1 text-center md:text-right">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center justify-center md:justify-start gap-2">
              <i className="fa-solid fa-envelope-open-text text-[#0284c7]"></i>
              <span>كن أول من يعرف بجديد العروض والخصومات في متجر فيلترو!</span>
            </h3>
            <p className="text-xs text-slate-500">
              اشترك بنشرتنا البريدية لتصلك أحدث أكواد الخصم لاشتراكات Netflix، CapCut، Canva، ExpressVPN، و Gemini.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex-1 max-w-md">
            <div className="flex rounded-2xl overflow-hidden border border-[#e2e8f0] focus-within:border-[#0284c7] focus-within:ring-2 focus-within:ring-[#0284c7]/10 transition">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="ادخل بريدك الإلكتروني"
                className="bg-slate-50 px-4 py-3 text-xs text-slate-900 placeholder-slate-400 flex-1 focus:outline-none focus:bg-white"
              />
              <button
                type="submit"
                className="px-6 py-3 velto-gradient-btn text-white font-bold text-xs transition shrink-0 cursor-pointer"
              >
                {subscribed ? 'تم الاشتراك!' : 'اشترك الآن'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-8 border-b border-[#e2e8f0] text-right">
          
          {/* Column 1 & 2: Store Identity & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 p-0.5 shadow-md">
                <img src="/logo.png" alt="Velto" className="w-full h-full object-contain" />
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-slate-900 flex items-center gap-1.5 leading-none">
                  <span>متجر</span>
                  <span className="velto-gradient-text">فيلترو</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-50 text-[#0284c7] border border-cyan-200 font-mono font-bold">
                    VELTO
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 font-semibold block mt-1">الاشتراكات الرقمية والخدمات السحابية</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              متجر فيلترو (Velto) متخصص في تقديم أرقى الاشتراكات الرقمية والبرامج المعتمدة بأفضل الأسعار المنافسة. تفعيل مباشر، خصوصية تامة، وضمان ذهبي كامل المدة مع دعم فني متميز على مدار الساعة.
            </p>

            {/* Social & Contact Channels */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://wa.me/21650022767"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition shadow-2xs"
                title="واتساب الدعم الفني: +216 50 022 767"
              >
                <i className="fa-brands fa-whatsapp text-base"></i>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-pink-600 hover:bg-pink-50 hover:border-pink-300 transition shadow-2xs"
                title="انستقرام فيلترو"
              >
                <i className="fa-brands fa-instagram text-base"></i>
              </a>
              <a
                href="mailto:support@velto.store"
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#0284c7] hover:bg-sky-50 hover:border-sky-300 transition shadow-2xs"
                title="البريد الإلكتروني"
              >
                <i className="fa-regular fa-envelope text-base"></i>
              </a>
            </div>
          </div>

          {/* Column 3: The 5 Subscriptions (الاشتراكات المعتمدة) */}
          <div className="space-y-3">
            <h4 className="text-slate-900 font-bold text-sm">الاشتراكات المعتمدة</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#prod-netflix-4k" className="hover:text-[#0284c7] transition">
                  اشتراك نتفلكس 4K Ultra HD
                </Link>
              </li>
              <li>
                <Link href="/#prod-capcut-pro-1m" className="hover:text-[#0284c7] transition">
                  اشتراك كاب كت برو CapCut Pro
                </Link>
              </li>
              <li>
                <Link href="/#prod-canva-pro" className="hover:text-[#0284c7] transition">
                  اشتراك كانفا برو Canva Pro
                </Link>
              </li>
              <li>
                <Link href="/#prod-express-vpn" className="hover:text-[#0284c7] transition">
                  اشتراك اكسبريس في بي ان ExpressVPN
                </Link>
              </li>
              <li>
                <Link href="/#prod-gemini-advanced" className="hover:text-[#0284c7] transition">
                  اشتراك جوجل Gemini Advanced AI
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Links That Matter (روابط تهمك) */}
          <div className="space-y-3">
            <h4 className="text-slate-900 font-bold text-sm">روابط تهمك</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/track-order" className="hover:text-[#0284c7] transition">
                  تتبع حالة طلبك
                </Link>
              </li>
              <li>
                <Link href="/my-orders" className="hover:text-[#0284c7] transition">
                  سجل طلباتي (بدون تسجيل دخول)
                </Link>
              </li>
              <li>
                <a href="#guarantees" className="hover:text-[#0284c7] transition">
                  سياسة الضمان الذهبي والاستبدال
                </a>
              </li>
              <li>
                <a href="#guarantees" className="hover:text-[#0284c7] transition">
                  أوقات العمل والتسليم
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Business Trust & SBC Verification */}
          <div className="space-y-3">
            <h4 className="text-slate-900 font-bold text-sm">التوثيق والموثوقية</h4>
            <div className="space-y-2.5">
              <div className="p-3 bg-white border border-[#e2e8f0] rounded-2xl shadow-2xs space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                  <i className="fa-solid fa-certificate"></i>
                  <span>متجر رقمي موثق ومعتمد 100%</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono" dir="ltr">
                  VELTO-DIGITAL-TUNISIA
                </div>
              </div>

              <div className="p-3 bg-white border border-[#e2e8f0] rounded-2xl shadow-2xs space-y-1">
                <div className="flex items-center gap-2 text-[#0284c7] font-bold text-xs">
                  <i className="fa-solid fa-shield-halved"></i>
                  <span>ضمان ذهبي 100% كامل المدة</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  استبدال فوري أو استرجاع في حال وجود أي عطل
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>جميع الحقوق محفوظة لـ</span>
            <strong className="text-slate-900 font-bold">متجر فيلترو الرقمي (Velto Store)</strong>
            <span>© 2026</span>
          </div>

          {/* Secure Payment icons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-slate-400">طرق التحويل والسداد المعتمدة:</span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-sky-700">Flouci</span>
              <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-emerald-700">D17 البريد التونسي</span>
              <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700">تحويل بنكي</span>
              <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-purple-700">دفع مباشر بالدينار (د.ت)</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
