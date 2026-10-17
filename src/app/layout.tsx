import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/lib/cart-context';
import { CartDrawer } from '@/components/CartDrawer';

export const metadata: Metadata = {
  title: 'متجر الاشتراكات الرقمية | Y7X Store',
  description:
    'أفضل متجر معتمد للاشتراكات الرقمية: Netflix 4K، CapCut Pro، Canva Pro، ExpressVPN، و Google Gemini بأفضل الأسعار وضمان ذهبي كامل المدة.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="light">
      <body className="min-h-screen flex flex-col selection:bg-indigo-600 selection:text-white bg-slate-50 text-slate-900 font-sans overflow-x-hidden">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />

          {/* Floating WhatsApp Support Button */}
          <a
            href="https://wa.me/966532137759"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/25 hover:scale-110 transition duration-300 group"
            title="تواصل معنا واتساب"
          >
            <i className="fa-brands fa-whatsapp text-3xl"></i>
            <span className="absolute right-16 bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none">
              تواصل معنا واتساب
            </span>
          </a>
        </CartProvider>
      </body>
    </html>
  );
}
