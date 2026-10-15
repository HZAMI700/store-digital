import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function generateOrderReference(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let random = '';
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ORD-${dateStr}-${random}`;
}

export function generateSecureToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  // Allow digits, spaces, hyphens, parentheses, min 6 digits
  const cleaned = phone.replace(/[^\d]/g, '');
  return cleaned.length >= 6 && cleaned.length <= 15;
}

export function sanitizePhoneNumber(countryCode: string, localNumber: string): string {
  const cleanCode = countryCode.replace(/[^\d+]/g, '');
  const cleanLocal = localNumber.replace(/^[0]+/, '').replace(/[^\d]/g, '');
  return `${cleanCode} ${cleanLocal}`.trim();
}

export function getCleanInternationalNumber(fullNumber: string): string {
  // Returns numbers only with no spaces or symbols, e.g. 1234567890
  return fullNumber.replace(/[^\d]/g, '');
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return isoString;
  }
}
