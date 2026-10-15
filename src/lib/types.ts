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
    colorClass: 'text-amber-800',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    badgeText: 'text-amber-800',
    stepIndex: 1,
  },
  contacting_customer: {
    key: 'contacting_customer',
    label: 'Contacting Customer',
    description: 'The administrator is currently reaching out via WhatsApp or email.',
    colorClass: 'text-blue-700',
    badgeBg: 'bg-blue-50',
    badgeBorder: 'border-blue-200',
    badgeText: 'text-blue-700',
    stepIndex: 2,
  },
  awaiting_customer_response: {
    key: 'awaiting_customer_response',
    label: 'Awaiting Customer Response',
    description: 'Contact message sent. Waiting for customer to reply.',
    colorClass: 'text-purple-700',
    badgeBg: 'bg-purple-50',
    badgeBorder: 'border-purple-200',
    badgeText: 'text-purple-700',
    stepIndex: 2,
  },
  payment_instructions_sent: {
    key: 'payment_instructions_sent',
    label: 'Payment Instructions Sent',
    description: 'Customer informed how to pay via manual payment methods.',
    colorClass: 'text-indigo-700',
    badgeBg: 'bg-indigo-50',
    badgeBorder: 'border-indigo-200',
    badgeText: 'text-indigo-700',
    stepIndex: 3,
  },
  payment_confirmed: {
    key: 'payment_confirmed',
    label: 'Payment Confirmed',
    description: 'Administrator has manually verified customer payment. Preparing delivery.',
    colorClass: 'text-teal-700',
    badgeBg: 'bg-teal-50',
    badgeBorder: 'border-teal-200',
    badgeText: 'text-teal-700',
    stepIndex: 4,
  },
  completed: {
    key: 'completed',
    label: 'Completed',
    description: 'Order fulfilled and digital account delivered to customer.',
    colorClass: 'text-emerald-700',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    badgeText: 'text-emerald-700',
    stepIndex: 5,
  },
  cancelled: {
    key: 'cancelled',
    label: 'Cancelled',
    description: 'Order request was cancelled by customer or admin.',
    colorClass: 'text-rose-700',
    badgeBg: 'bg-rose-50',
    badgeBorder: 'border-rose-200',
    badgeText: 'text-rose-700',
    stepIndex: -1,
  },
  unable_to_contact: {
    key: 'unable_to_contact',
    label: 'Unable to Contact',
    description: 'Administrator could not reach customer after multiple attempts.',
    colorClass: 'text-slate-700',
    badgeBg: 'bg-slate-100',
    badgeBorder: 'border-slate-300',
    badgeText: 'text-slate-700',
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
