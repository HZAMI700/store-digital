import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Apex Digital Accounts | Premium Subscriptions & Digital Keys',
  description:
    'Exclusive digital accounts and subscriptions. Direct manual contact via WhatsApp or Email. No automatic online charges.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-content-primary min-h-screen flex flex-col antialiased selection:bg-primary-100 selection:text-primary-800">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
