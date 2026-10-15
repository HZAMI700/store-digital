export type OrderStatus =
  | 'new_order'
  | 'contacting_customer'
  | 'awaiting_customer_response'
  | 'payment_instructions_sent'
  | 'payment_confirmed'
  | 'completed'
  | 'cancelled'
  | 'unable_to_contact';

export interface OrderStatusConfig {
  key: OrderStatus;
  label: string;
  description: string;
  colorClass: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  stepIndex: number;
}

export const ORDER_STATUSES: Record<OrderStatus, OrderStatusConfig> = {
  new_order: {
    key: 'new_order',
    label: 'New Order',
    description: 'Newly submitted request, waiting for administrator review and contact.',
    colorClass: 'text-amber-400',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-400',
    stepIndex: 1,
  },
  contacting_customer: {
    key: 'contacting_customer',
    label: 'Contacting Customer',
    description: 'The administrator is currently reaching out via WhatsApp or email.',
    colorClass: 'text-sky-400',
    badgeBg: 'bg-sky-500/10',
    badgeBorder: 'border-sky-500/30',
    badgeText: 'text-sky-400',
    stepIndex: 2,
  },
  awaiting_customer_response: {
    key: 'awaiting_customer_response',
    label: 'Awaiting Customer Response',
    description: 'Contact message sent. Waiting for customer to reply.',
    colorClass: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10',
    badgeBorder: 'border-indigo-500/30',
    badgeText: 'text-indigo-400',
    stepIndex: 2,
  },
  payment_instructions_sent: {
    key: 'payment_instructions_sent',
    label: 'Payment Instructions Sent',
    description: 'Customer informed how to pay via manual payment methods.',
    colorClass: 'text-purple-400',
    badgeBg: 'bg-purple-500/10',
    badgeBorder: 'border-purple-500/30',
    badgeText: 'text-purple-400',
    stepIndex: 3,
  },
  payment_confirmed: {
    key: 'payment_confirmed',
    label: 'Payment Confirmed',
    description: 'Administrator has manually verified customer payment. Preparing delivery.',
    colorClass: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/30',
    badgeText: 'text-emerald-400',
    stepIndex: 4,
  },
  completed: {
    key: 'completed',
    label: 'Completed',
    description: 'Order fulfilled and digital account delivered to customer.',
    colorClass: 'text-teal-400',
    badgeBg: 'bg-teal-500/10',
    badgeBorder: 'border-teal-500/30',
    badgeText: 'text-teal-400',
    stepIndex: 5,
  },
  cancelled: {
    key: 'cancelled',
    label: 'Cancelled',
    description: 'Order request was cancelled by customer or admin.',
    colorClass: 'text-rose-400',
    badgeBg: 'bg-rose-500/10',
    badgeBorder: 'border-rose-500/30',
    badgeText: 'text-rose-400',
    stepIndex: -1,
  },
  unable_to_contact: {
    key: 'unable_to_contact',
    label: 'Unable to Contact',
    description: 'Administrator could not reach customer after multiple attempts.',
    colorClass: 'text-zinc-400',
    badgeBg: 'bg-zinc-500/10',
    badgeBorder: 'border-zinc-500/30',
    badgeText: 'text-zinc-400',
    stepIndex: -1,
  },
};

export interface Product {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  compareAtPrice?: number;
  imageUrl: string;
  badge?: string;
  features: string[];
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  warranty: string;
  deliveryNote: string;
}

export interface Order {
  id: string;
  orderReference: string;
  customerId?: string | null;
  guestLookupToken?: string;
  customerName: string;
  customerEmail: string;
  customerWhatsapp: string;
  countryCode: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerMessage?: string | null;
  consentGiven: boolean;
  consentTimestamp: string;
  status: OrderStatus;
  internalNotes?: string | null;
  contactMethod?: 'whatsapp' | 'email' | 'phone' | null;
  contactedAt?: string | null;
  assignedInventoryId?: string | null;
  deliveredCredentials?: string | null;
  credentialsRevealed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderActivityLog {
  id: string;
  orderId: string;
  actorType: 'customer' | 'admin' | 'system';
  actorName: string;
  action: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface DigitalAccountInventory {
  id: string;
  productId: string;
  productName: string;
  accountData: string; // e.g. login credentials or activation license
  isAssigned: boolean;
  assignedOrderId?: string | null;
  assignedAt?: string | null;
  createdAt: string;
}

export interface CountryCode {
  name: string;
  dialCode: string;
  code: string;
  flag: string;
}

export interface AdminStats {
  newOrders: number;
  awaitingContact: number;
  awaitingCustomerResponse: number;
  paymentConfirmed: number;
  completed: number;
  totalOrders: number;
  totalOrderValue: number;
}
