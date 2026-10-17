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
    <footer className="bg-slate-100 border-t border-[#e8e8e8] pt-12 pb-24 lg:pb-12 text-slate-600 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Back to Top Button */}
        <div className="flex justify-center border-b border-[#e8e8e8] pb-6">
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#5e17eb] px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition shadow-2xs group"
          >
            <span>العودة إلى أعلى</span>
            <i className="fa-solid fa-arrow-up group-hover:-translate-y-0.5 transition"></i>
          </button>
        </div>

        {/* Newsletter Box (Y7X Style) */}
        <div className="bg-white border border-[#e8e8e8] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center md:text-right">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center justify-center md:justify-start gap-2">
              <i className="fa-solid fa-envelope-open-text text-[#5e17eb]"></i>
              <span>كن أول من يعرف بجديد العروض والخصومات في متجر يوكس!</span>
            </h3>
            <p className="text-xs text-slate-500">
              اشترك بنشرتنا البريدية لتصلك أحدث أكواد الخصم لاشتراكات Netflix، CapCut، Canva، ExpressVPN، و Gemini.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex-1 max-w-md">
            <div className="flex rounded-2xl overflow-hidden border border-[#e8e8e8] focus-within:border-[#5e17eb] focus-within:ring-2 focus-within:ring-[#5e17eb]/10 transition">
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
                className="px-6 py-3 bg-[#5e17eb] hover:bg-[#4f0ecf] text-white font-bold text-xs transition shrink-0"
              >
                {subscribed ? 'تم الاشتراك!' : 'اشترك الآن'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-8 border-b border-[#e8e8e8] text-right">
          
          {/* Column 1 & 2: Store Identity & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#5e17eb] to-[#843dff] flex items-center justify-center shadow-md shadow-[#5e17eb]/25">
                <span className="text-white font-black text-xl">Y7X</span>
              </div>
              <span className="text-xl font-black text-slate-900">متجر يوكس | Y7X Store</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              متجر يوكس متخصص في تقديم أرقى الاشتراكات الرقمية والبرامج المعتمدة بأفضل الأسعار المنافسة. تفعيل مباشر، خصوصية تامة، وضمان ذهبي كامل المدة مع دعم فني متميز.
            </p>

            {/* Social Channels */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://api.whatsapp.com/send/?phone=%2B966532137759&text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85+%D8%B9%D9%84%D9%8A%D9%83%D9%85%2C+%D8%AD%D8%A7%D8%A8+%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%B1%0A&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition shadow-2xs"
                title="واتساب الدعم الفني: 0532137759"
              >
                <i className="fa-brands fa-whatsapp text-base"></i>
              </a>
              <a
                href="https://www.instagram.com/yox7_store/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-pink-600 hover:bg-pink-50 hover:border-pink-300 transition shadow-2xs"
                title="انستقرام Yox7_Store"
              >
                <i className="fa-brands fa-instagram text-base"></i>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#5e17eb] hover:bg-slate-50 transition shadow-2xs"
                title="منصة إكس / تويتر"
              >
                <i className="fa-brands fa-x-twitter text-base"></i>
              </a>
            </div>
          </div>

          {/* Column 3: The 5 Subscriptions */}
          <div className="space-y-3">
            <h4 className="text-slate-900 font-bold text-sm">الاشتراكات المتاحة (5)</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#prod-netflix-4k" className="hover:text-[#5e17eb] transition">
                  اشتراك نتفلكس بريميوم 4K UHD
                </Link>
              </li>
              <li>
                <Link href="/#prod-capcut-pro-1m" className="hover:text-[#5e17eb] transition">
                  اشتراك كاب كت برو CapCut Pro
                </Link>
              </li>
              <li>
                <Link href="/#prod-canva-pro" className="hover:text-[#5e17eb] transition">
                  اشتراك كانفا برو Canva Pro
                </Link>
              </li>
              <li>
                <Link href="/#prod-express-vpn" className="hover:text-[#5e17eb] transition">
                  اشتراك اكسبريس في بي ان ExpressVPN
                </Link>
              </li>
              <li>
                <Link href="/#prod-gemini-advanced" className="hover:text-[#5e17eb] transition">
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
                <Link href="/track-order" className="hover:text-[#5e17eb] transition">
                  تتبع حالة طلبك
                </Link>
              </li>
              <li>
                <Link href="/my-orders" className="hover:text-[#5e17eb] transition">
                  سجل طلباتي السابقة
                </Link>
              </li>
              <li>
                <a href="#guarantees" className="hover:text-[#5e17eb] transition">
                  سياسة الضمان الذهبي والاستبدال
                </a>
              </li>
              <li>
                <a href="#guarantees" className="hover:text-[#5e17eb] transition">
                  أوقات العمل والتسليم
                </a>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#5e17eb] transition text-purple-700 font-bold">
                  لوحة تحكم المشرف
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Accreditation & Verification */}
          <div className="space-y-3">
            <h4 className="text-slate-900 font-bold text-sm">التوثيق والأمان</h4>
            <div className="space-y-2 text-xs">
              <a
                href="https://e-services.mc.gov.sa"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-white border border-[#e8e8e8] flex items-center gap-3 hover:border-emerald-300 transition shadow-2xs block"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
                <div>
                  <div className="font-bold text-slate-900">موثق بالمركز السعودي للأعمال</div>
                  <div className="text-[10px] text-slate-500 font-mono">رقم التوثيق: 0000170796</div>
                </div>
              </a>

              <div className="p-3 rounded-2xl bg-white border border-[#e8e8e8] space-y-1.5 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-700 block">طرق الدفع المتوفرة بالتنسيق:</span>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-slate-600">
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">مدى Mada</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">Apple Pay</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">STC Pay</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">تحويل بنكي</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">Visa / MC</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 pt-2">
          <div>
            جميع الحقوق محفوظة © 2026 <strong className="text-slate-800">متجر يوكس | Y7X Store</strong>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>تصميم وتطوير متجر المنتجات الرقمية</span>
            <span>•</span>
            <span>تسليم فوري ومباشر 100%</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
