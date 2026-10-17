import fs from 'fs';
import path from 'path';
import { Order, OrderStatus, DigitalAccountInventory, OrderActivityLog, Product } from './types';
import { INITIAL_ORDERS, INITIAL_PRODUCTS, INITIAL_INVENTORY, INITIAL_ACTIVITY_LOGS } from './store';
import { generateOrderReference, generateSecureToken } from './utils';

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.json');
const ACTIVITY_FILE = path.join(DATA_DIR, 'activity.json');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

function loadOrdersFromDisk(): Order[] {
  try {
    ensureDataDir();
    if (fs.existsSync(ORDERS_FILE)) {
      const content = fs.readFileSync(ORDERS_FILE, 'utf-8');
      if (content && content.trim()) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading orders from disk:', err);
  }
  return [...INITIAL_ORDERS];
}

function saveOrdersToDisk(orders: Order[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving orders to disk:', err);
  }
}

function loadInventoryFromDisk(): DigitalAccountInventory[] {
  try {
    ensureDataDir();
    if (fs.existsSync(INVENTORY_FILE)) {
      const content = fs.readFileSync(INVENTORY_FILE, 'utf-8');
      if (content && content.trim()) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading inventory from disk:', err);
  }
  return [...INITIAL_INVENTORY];
}

function saveInventoryToDisk(inventory: DigitalAccountInventory[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(INVENTORY_FILE, JSON.stringify(inventory, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving inventory to disk:', err);
  }
}

function loadActivityFromDisk(): OrderActivityLog[] {
  try {
    ensureDataDir();
    if (fs.existsSync(ACTIVITY_FILE)) {
      const content = fs.readFileSync(ACTIVITY_FILE, 'utf-8');
      if (content && content.trim()) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading activity from disk:', err);
  }
  return [...INITIAL_ACTIVITY_LOGS];
}

function saveActivityToDisk(logs: OrderActivityLog[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving activity to disk:', err);
  }
}

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
    orders: loadOrdersFromDisk(),
    products: [...INITIAL_PRODUCTS],
    inventory: loadInventoryFromDisk(),
    activityLogs: loadActivityFromDisk(),
  };
}

export const serverDb = {
  getOrders: (): Order[] => {
    // Reload from disk to guarantee multi-process / worker sync
    const diskOrders = loadOrdersFromDisk();
    global.__globalStore!.orders = diskOrders;
    return global.__globalStore!.orders;
  },
  
  getOrderById: (id: string): Order | undefined => {
    const orders = serverDb.getOrders();
    return orders.find((o) => o.id === id);
  },
  
  getOrderByReference: (ref: string): Order | undefined => {
    const orders = serverDb.getOrders();
    return orders.find((o) => o.orderReference.toLowerCase() === ref.toLowerCase());
  },

  getProducts: (): Product[] => {
    return global.__globalStore!.products;
  },

  getProductById: (id: string): Product | undefined => {
    return global.__globalStore!.products.find((p) => p.id === id || p.slug === id);
  },

  getProductBySlug: (slug: string): Product | undefined => {
    return global.__globalStore!.products.find((p) => p.slug === slug || p.id === slug);
  },

  getInventory: (): DigitalAccountInventory[] => {
    const diskInv = loadInventoryFromDisk();
    global.__globalStore!.inventory = diskInv;
    return global.__globalStore!.inventory;
  },

  getActivityLogs: (orderId?: string): OrderActivityLog[] => {
    const diskLogs = loadActivityFromDisk();
    global.__globalStore!.activityLogs = diskLogs;
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
    planId?: string | null;
    unitPrice?: number | null;
  }): Order => {
    // Find product by either ID or slug for maximum resilience
    const product = global.__globalStore!.products.find(
      (p) => p.id === data.productId || p.slug === data.productId
    );
    if (!product) {
      throw new Error('Product not found or unavailable');
    }

    // SERVER-SIDE CALCULATION & PRICE SNAPSHOT
    let unitPrice = product.price;
    let selectedPlan: string | undefined = undefined;

    if (data.planId && product.plans) {
      const matchedPlan = product.plans.find((p) => p.id === data.planId);
      if (matchedPlan) {
        unitPrice = matchedPlan.price;
        selectedPlan = matchedPlan.name;
      }
    } else if (data.unitPrice && data.unitPrice > 0) {
      unitPrice = data.unitPrice;
    }

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
      selectedPlan,
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
    const currentOrders = serverDb.getOrders();
    const updatedOrders = [newOrder, ...currentOrders];
    global.__globalStore!.orders = updatedOrders;
    saveOrdersToDisk(updatedOrders);

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
    const currentLogs = serverDb.getActivityLogs();
    const updatedLogs = [log, ...currentLogs];
    global.__globalStore!.activityLogs = updatedLogs;
    saveActivityToDisk(updatedLogs);

    return newOrder;
  },

  syncOrdersFromClient: (clientOrders: Order[]): Order[] => {
    if (!Array.isArray(clientOrders) || clientOrders.length === 0) {
      return serverDb.getOrders();
    }

    const currentOrders = serverDb.getOrders();
    let hasNew = false;
    const merged = [...currentOrders];

    for (const co of clientOrders) {
      if (!co || !co.id) continue;
      const exists = merged.some(
        (o) => o.id === co.id || o.orderReference.toLowerCase() === co.orderReference.toLowerCase()
      );
      if (!exists) {
        merged.unshift(co);
        hasNew = true;
      }
    }

    if (hasNew) {
      global.__globalStore!.orders = merged;
      saveOrdersToDisk(merged);
    }

    return merged;
  },

  updateOrderStatus: (orderId: string, status: OrderStatus, adminName: string = 'Admin'): Order => {
    const orders = serverDb.getOrders();
    const order = orders.find((o) => o.id === orderId);
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
    
    global.__globalStore!.orders = orders;
    saveOrdersToDisk(orders);

    const logs = [log, ...serverDb.getActivityLogs()];
    global.__globalStore!.activityLogs = logs;
    saveActivityToDisk(logs);

    return order;
  },

  updateOrderNotes: (orderId: string, notes: string): Order => {
    const orders = serverDb.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    order.internalNotes = notes;
    order.updatedAt = new Date().toISOString();
    
    global.__globalStore!.orders = orders;
    saveOrdersToDisk(orders);
    
    return order;
  },

  recordContactAttempt: (
    orderId: string,
    method: 'whatsapp' | 'email' | 'phone',
    timestamp: string,
    note?: string
  ): Order => {
    const orders = serverDb.getOrders();
    const order = orders.find((o) => o.id === orderId);
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

    global.__globalStore!.orders = orders;
    saveOrdersToDisk(orders);

    const logs = [log, ...serverDb.getActivityLogs()];
    global.__globalStore!.activityLogs = logs;
    saveActivityToDisk(logs);

    return order;
  },

  assignInventoryToOrder: (orderId: string, inventoryId: string): Order => {
    const orders = serverDb.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const invList = serverDb.getInventory();
    const inv = invList.find((i) => i.id === inventoryId);
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

    global.__globalStore!.orders = orders;
    saveOrdersToDisk(orders);

    global.__globalStore!.inventory = invList;
    saveInventoryToDisk(invList);

    const logs = [log, ...serverDb.getActivityLogs()];
    global.__globalStore!.activityLogs = logs;
    saveActivityToDisk(logs);

    return order;
  },

  toggleCredentialsRevealed: (orderId: string, revealed: boolean): Order => {
    const orders = serverDb.getOrders();
    const order = orders.find((o) => o.id === orderId);
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

    global.__globalStore!.orders = orders;
    saveOrdersToDisk(orders);

    const logs = [log, ...serverDb.getActivityLogs()];
    global.__globalStore!.activityLogs = logs;
    saveActivityToDisk(logs);

    return order;
  },

  addInventoryItem: (productId: string, accountData: string): DigitalAccountInventory => {
    const product = global.__globalStore!.products.find((p) => p.id === productId || p.slug === productId);
    if (!product) throw new Error('Product not found');

    const invList = serverDb.getInventory();
    const newItem: DigitalAccountInventory = {
      id: `inv-${Date.now()}`,
      productId: product.id,
      productName: product.title,
      accountData: accountData.trim(),
      isAssigned: false,
      createdAt: new Date().toISOString(),
    };

    invList.unshift(newItem);
    global.__globalStore!.inventory = invList;
    saveInventoryToDisk(invList);
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
