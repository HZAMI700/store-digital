import { Order, OrderStatus, DigitalAccountInventory, OrderActivityLog, Product } from './types';
import { INITIAL_ORDERS, INITIAL_PRODUCTS, INITIAL_INVENTORY, INITIAL_ACTIVITY_LOGS } from './store';
import { generateOrderReference, generateSecureToken } from './utils';

// Global singleton in Node environment so state persists across hot-reloads and API calls
declare global {
  var __globalStore: {
    orders: Order[];
    products: Product[];
    inventory: DigitalAccountInventory[];
    activityLogs: OrderActivityLog[];
  } | undefined;
}

if (!global.__globalStore) {
  global.__globalStore = {
    orders: [...INITIAL_ORDERS],
    products: [...INITIAL_PRODUCTS],
    inventory: [...INITIAL_INVENTORY],
    activityLogs: [...INITIAL_ACTIVITY_LOGS],
  };
}

export const serverDb = {
  getOrders: () => global.__globalStore!.orders,
  
  getOrderById: (id: string) => global.__globalStore!.orders.find((o) => o.id === id),
  
  getOrderByReference: (ref: string) =>
    global.__globalStore!.orders.find((o) => o.orderReference.toLowerCase() === ref.toLowerCase()),

  getProducts: () => global.__globalStore!.products,

  getProductById: (id: string) => global.__globalStore!.products.find((p) => p.id === id),

  getProductBySlug: (slug: string) => global.__globalStore!.products.find((p) => p.slug === slug),

  getInventory: () => global.__globalStore!.inventory,

  getActivityLogs: (orderId?: string) => {
    if (!orderId) return global.__globalStore!.activityLogs;
    return global.__globalStore!.activityLogs.filter((l) => l.orderId === orderId);
  },

  createOrder: (data: {
    productId: string;
    productName: string;
    quantity: number;
    customerName: string;
    customerEmail: string;
    customerWhatsapp: string;
    countryCode: string;
    customerMessage?: string | null;
    consentGiven: boolean;
    customerId?: string | null;
  }): Order => {
    const product = global.__globalStore!.products.find((p) => p.id === data.productId);
    if (!product) {
      throw new Error('Product not found or unavailable');
    }

    // SERVER-SIDE CALCULATION & PRICE SNAPSHOT
    const unitPrice = product.price;
    const totalAmount = Number((unitPrice * data.quantity).toFixed(2));
    const now = new Date().toISOString();
    const orderReference = generateOrderReference();
    const guestLookupToken = generateSecureToken();

    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderReference,
      customerId: data.customerId || null,
      guestLookupToken,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerWhatsapp: data.customerWhatsapp,
      countryCode: data.countryCode,
      productId: product.id,
      productName: product.title,
      productImage: product.imageUrl,
      quantity: data.quantity,
      unitPrice,
      totalAmount,
      customerMessage: data.customerMessage || undefined,
      consentGiven: data.consentGiven,
      consentTimestamp: now,
      status: 'new_order',
      internalNotes: null,
      contactMethod: null,
      contactedAt: null,
      credentialsRevealed: false,
      createdAt: now,
      updatedAt: now,
    };

    // Prepend to orders list
    global.__globalStore!.orders.unshift(newOrder);

    // Record activity log
    const log: OrderActivityLog = {
      id: `log-${Date.now()}`,
      orderId: newOrder.id,
      actorType: 'customer',
      actorName: newOrder.customerName,
      action: 'Order Request Submitted',
      details: {
        reference: newOrder.orderReference,
        product: newOrder.productName,
        quantity: newOrder.quantity,
        total: newOrder.totalAmount,
      },
      createdAt: now,
    };
    global.__globalStore!.activityLogs.unshift(log);

    return newOrder;
  },

  updateOrderStatus: (orderId: string, status: OrderStatus, adminName: string = 'Admin'): Order => {
    const order = global.__globalStore!.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const oldStatus = order.status;
    order.status = status;
    order.updatedAt = new Date().toISOString();

    // Log status change
    const log: OrderActivityLog = {
      id: `log-${Date.now()}`,
      orderId: order.id,
      actorType: 'admin',
      actorName: adminName,
      action: `Status updated from "${oldStatus}" to "${status}"`,
      details: { oldStatus, newStatus: status },
      createdAt: order.updatedAt,
    };
    global.__globalStore!.activityLogs.unshift(log);

    return order;
  },

  updateOrderNotes: (orderId: string, notes: string): Order => {
    const order = global.__globalStore!.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    order.internalNotes = notes;
    order.updatedAt = new Date().toISOString();
    return order;
  },

  recordContactAttempt: (
    orderId: string,
    method: 'whatsapp' | 'email' | 'phone',
    timestamp: string,
    note?: string
  ): Order => {
    const order = global.__globalStore!.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    order.contactMethod = method;
    order.contactedAt = timestamp;
    // If order was in 'new_order', automatically progress to 'contacting_customer'
    if (order.status === 'new_order') {
      order.status = 'contacting_customer';
    }
    order.updatedAt = new Date().toISOString();

    const log: OrderActivityLog = {
      id: `log-${Date.now()}`,
      orderId: order.id,
      actorType: 'admin',
      actorName: 'Store Administrator',
      action: `Contact via ${method.toUpperCase()} recorded`,
      details: { method, timestamp, note },
      createdAt: timestamp,
    };
    global.__globalStore!.activityLogs.unshift(log);

    return order;
  },

  assignInventoryToOrder: (orderId: string, inventoryId: string): Order => {
    const order = global.__globalStore!.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const inv = global.__globalStore!.inventory.find((i) => i.id === inventoryId);
    if (!inv) throw new Error('Inventory item not found');

    if (inv.isAssigned && inv.assignedOrderId !== orderId) {
      throw new Error('This single-use account has already been assigned to another customer');
    }

    inv.isAssigned = true;
    inv.assignedOrderId = order.id;
    inv.assignedAt = new Date().toISOString();

    order.assignedInventoryId = inv.id;
    order.deliveredCredentials = inv.accountData;
    order.updatedAt = new Date().toISOString();

    const log: OrderActivityLog = {
      id: `log-${Date.now()}`,
      orderId: order.id,
      actorType: 'admin',
      actorName: 'Store Administrator',
      action: 'Account inventory assigned to order',
      details: { inventoryId: inv.id, productName: inv.productName },
      createdAt: order.updatedAt,
    };
    global.__globalStore!.activityLogs.unshift(log);

    return order;
  },

  toggleCredentialsRevealed: (orderId: string, revealed: boolean): Order => {
    const order = global.__globalStore!.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    order.credentialsRevealed = revealed;
    if (revealed && order.status === 'payment_confirmed') {
      order.status = 'completed';
    }
    order.updatedAt = new Date().toISOString();

    const log: OrderActivityLog = {
      id: `log-${Date.now()}`,
      orderId: order.id,
      actorType: 'admin',
      actorName: 'Store Administrator',
      action: revealed
        ? 'Digital account credentials released to customer dashboard'
        : 'Credentials hidden from customer dashboard',
      details: { revealed },
      createdAt: order.updatedAt,
    };
    global.__globalStore!.activityLogs.unshift(log);

    return order;
  },

  addInventoryItem: (productId: string, accountData: string): DigitalAccountInventory => {
    const product = global.__globalStore!.products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found');

    const newItem: DigitalAccountInventory = {
      id: `inv-${Date.now()}`,
      productId: product.id,
      productName: product.title,
      accountData: accountData.trim(),
      isAssigned: false,
      createdAt: new Date().toISOString(),
    };

    global.__globalStore!.inventory.unshift(newItem);
    return newItem;
  },

  // Strip internal notes and hidden credentials for public / customer endpoints
  sanitizeForCustomer: (order: Order) => {
    const { internalNotes, ...safeOrder } = order;
    if (!safeOrder.credentialsRevealed) {
      safeOrder.deliveredCredentials = null;
    }
    return safeOrder;
  },
};
