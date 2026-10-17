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
    label: 'طلب جديد (قيد المراجعة)',
    description: 'طلب جديد تم استلامه، بانتظار مراجعة الإدارة والتواصل المباشر.',
    colorClass: 'text-amber-700',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    badgeText: 'text-amber-800 font-bold',
    stepIndex: 1,
  },
  contacting_customer: {
    key: 'contacting_customer',
    label: 'جارِ التواصل مع العميل',
    description: 'يقوم مدير المتجر حالياً بالتواصل مع العميل عبر الواتساب أو البريد الإلكتروني.',
    colorClass: 'text-indigo-700',
    badgeBg: 'bg-indigo-50',
    badgeBorder: 'border-indigo-200',
    badgeText: 'text-indigo-800 font-bold',
    stepIndex: 2,
  },
  awaiting_customer_response: {
    key: 'awaiting_customer_response',
    label: 'بانتظار رد العميل',
    description: 'تم إرسال رسالة التأكيد عبر الواتساب، بانتظار رد العميل.',
    colorClass: 'text-purple-700',
    badgeBg: 'bg-purple-50',
    badgeBorder: 'border-purple-200',
    badgeText: 'text-purple-800 font-bold',
    stepIndex: 2,
  },
  payment_instructions_sent: {
    key: 'payment_instructions_sent',
    label: 'تم إرسال بيانات الدفع',
    description: 'تم تزويد العميل بتعليمات وطرق الدفع اليدوية المتفق عليها.',
    colorClass: 'text-sky-700',
    badgeBg: 'bg-sky-50',
    badgeBorder: 'border-sky-200',
    badgeText: 'text-sky-800 font-bold',
    stepIndex: 3,
  },
  payment_confirmed: {
    key: 'payment_confirmed',
    label: 'تم تأكيد الدفع',
    description: 'تم التحقق من استلام الدفع بنجاح، وجارِ تجهيز الحساب من الخزينة.',
    colorClass: 'text-teal-700',
    badgeBg: 'bg-teal-50',
    badgeBorder: 'border-teal-200',
    badgeText: 'text-teal-800 font-bold',
    stepIndex: 4,
  },
  completed: {
    key: 'completed',
    label: 'مكتمل وتم التسليم',
    description: 'تم تسليم بيانات الحساب للعميل بنجاح مع الضمان الذهبي.',
    colorClass: 'text-emerald-700',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    badgeText: 'text-emerald-800 font-bold',
    stepIndex: 5,
  },
  cancelled: {
    key: 'cancelled',
    label: 'تم الإلغاء',
    description: 'تم إلغاء الطلب من قبل العميل أو الإدارة.',
    colorClass: 'text-rose-700',
    badgeBg: 'bg-rose-50',
    badgeBorder: 'border-rose-200',
    badgeText: 'text-rose-800 font-bold',
    stepIndex: -1,
  },
  unable_to_contact: {
    key: 'unable_to_contact',
    label: 'تعذر التواصل',
    description: 'تعذر الوصول إلى العميل عبر الواتساب أو البريد بعد عدة محاولات.',
    colorClass: 'text-slate-600',
    badgeBg: 'bg-slate-100',
    badgeBorder: 'border-slate-300',
    badgeText: 'text-slate-700 font-bold',
    stepIndex: -1,
  },
};

export interface ProductPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  compareAtPrice?: number;
  badge?: string;
  isPopular?: boolean;
}

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
  discount?: string;
  icon?: string;
  color?: string;
  rating?: string;
  reviewsCount?: number;
  features: string[];
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  warranty: string;
  deliveryNote: string;
  plans?: ProductPlan[];
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
  selectedPlan?: string;
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
