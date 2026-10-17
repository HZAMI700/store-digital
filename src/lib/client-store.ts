import { Order, OrderStatus, DigitalAccountInventory, AdminStats, Product } from './types';
import { INITIAL_ORDERS, INITIAL_INVENTORY, INITIAL_PRODUCTS } from './store';
import { generateOrderReference, generateSecureToken } from './utils';

const ORDERS_KEY = 'velto_store_orders_v5';
const MY_ORDERS_KEY = 'velto_customer_my_orders_v5';
const INVENTORY_KEY = 'velto_store_inventory_v5';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export const clientStore = {
  // --- ORDERS ---
  getOrders(): Order[] {
    if (!isBrowser()) return [];
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      if (stored) {
        const parsed: Order[] = JSON.parse(stored);
        // Exclude legacy mock orders
        return parsed.filter(
          (o) => !o.id.startsWith('ord-10') && o.orderReference !== 'ORD-20261015-8491' && o.orderReference !== 'ORD-20261015-7721'
        );
      }
      return [];
    } catch {
      return [];
    }
  },

  saveOrders(orders: Order[]) {
    if (!isBrowser()) return;
    try {
      const cleanOrders = orders.filter(
        (o) => !o.id.startsWith('ord-10') && o.orderReference !== 'ORD-20261015-8491' && o.orderReference !== 'ORD-20261015-7721'
      );
      localStorage.setItem(ORDERS_KEY, JSON.stringify(cleanOrders));
      window.dispatchEvent(new Event('velto_orders_updated'));
      window.dispatchEvent(new Event('y7x_orders_updated'));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  },

  createOrder(data: {
    productId: string;
    productName: string;
    quantity: number;
    customerName: string;
    customerEmail: string;
    customerWhatsapp: string;
    countryCode: string;
    customerMessage?: string | null;
    unitPrice: number;
    selectedPlan?: string;
  }): Order {
    const totalAmount = Number((data.unitPrice * data.quantity).toFixed(2));
    const now = new Date().toISOString();
    const orderReference = generateOrderReference();
    const guestLookupToken = generateSecureToken();

    const product = INITIAL_PRODUCTS.find((p) => p.id === data.productId);

    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderReference,
      customerId: null,
      guestLookupToken,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerWhatsapp: data.customerWhatsapp,
      countryCode: data.countryCode,
      productId: data.productId,
      productName: data.productName,
      productImage: product?.imageUrl || '',
      selectedPlan: data.selectedPlan,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      totalAmount,
      customerMessage: data.customerMessage || undefined,
      consentGiven: true,
      consentTimestamp: now,
      status: 'new_order',
      internalNotes: null,
      contactMethod: null,
      contactedAt: null,
      credentialsRevealed: false,
      createdAt: now,
      updatedAt: now,
    };

    const currentOrders = this.getOrders();
    const updated = [newOrder, ...currentOrders];
    this.saveOrders(updated);
    this.saveToMyOrders(newOrder);

    return newOrder;
  },

  replaceOrAddOrder(order: Order, tempId?: string) {
    if (!isBrowser()) return;
    try {
      const orders = this.getOrders();
      let updated: Order[];
      if (tempId) {
        const withoutTemp = orders.filter((o) => o.id !== tempId);
        updated = [order, ...withoutTemp.filter((o) => o.id !== order.id && o.orderReference !== order.orderReference)];
      } else {
        const withoutSame = orders.filter((o) => o.id !== order.id && o.orderReference !== order.orderReference);
        updated = [order, ...withoutSame];
      }
      this.saveOrders(updated);
      this.saveToMyOrders(order);
    } catch (e) {
      console.error('Failed to replace/add order', e);
    }
  },

  // --- MY ORDERS (Customer Browser Local History - No login needed) ---
  getMyOrders(): Order[] {
    if (!isBrowser()) return [];
    try {
      const stored = localStorage.getItem(MY_ORDERS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch {
      return [];
    }
  },

  saveToMyOrders(order: Order) {
    if (!isBrowser()) return;
    try {
      const myOrders = this.getMyOrders();
      const filtered = myOrders.filter((o) => o.id !== order.id && o.orderReference !== order.orderReference);
      const updated = [order, ...filtered];
      localStorage.setItem(MY_ORDERS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to my orders', e);
    }
  },

  // --- ORDER LOOKUP (No login needed) ---
  lookupOrder(orderReference: string, identifier: string): Order | null {
    const orders = this.getOrders();
    const cleanRef = orderReference.trim().toUpperCase();
    const cleanId = identifier.trim().toLowerCase();

    return (
      orders.find((o) => {
        const matchesRef = o.orderReference.toUpperCase() === cleanRef;
        const matchesEmail = o.customerEmail.toLowerCase() === cleanId;
        const matchesPhone = o.customerWhatsapp.replace(/\D/g, '').endsWith(cleanId.replace(/\D/g, ''));
        return matchesRef && (matchesEmail || matchesPhone);
      }) || null
    );
  },

  // --- INVENTORY ---
  getInventory(): DigitalAccountInventory[] {
    if (!isBrowser()) return INITIAL_INVENTORY;
    try {
      const stored = localStorage.getItem(INVENTORY_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(INVENTORY_KEY, JSON.stringify(INITIAL_INVENTORY));
      return INITIAL_INVENTORY;
    } catch {
      return INITIAL_INVENTORY;
    }
  },

  saveInventory(inventory: DigitalAccountInventory[]) {
    if (!isBrowser()) return;
    try {
      localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
      window.dispatchEvent(new Event('y7x_inventory_updated'));
    } catch (e) {
      console.error('Failed to save inventory to localStorage', e);
    }
  },

  addInventoryItem(productId: string, accountData: string): DigitalAccountInventory {
    const product = INITIAL_PRODUCTS.find((p) => p.id === productId);
    const item: DigitalAccountInventory = {
      id: `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId,
      productName: product?.title || productId,
      accountData,
      isAssigned: false,
      assignedOrderId: null,
      assignedAt: null,
      createdAt: new Date().toISOString(),
    };

    const current = this.getInventory();
    const updated = [item, ...current];
    this.saveInventory(updated);
    return item;
  },

  // --- ADMIN ACTIONS ---
  updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;

    const updatedOrder: Order = {
      ...orders[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    orders[index] = updatedOrder;
    this.saveOrders(orders);
    return updatedOrder;
  },

  updateOrderNotes(orderId: string, notes: string): Order | null {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;

    const updatedOrder: Order = {
      ...orders[index],
      internalNotes: notes,
      updatedAt: new Date().toISOString(),
    };
    orders[index] = updatedOrder;
    this.saveOrders(orders);
    return updatedOrder;
  },

  recordContact(orderId: string, method: 'whatsapp' | 'email'): Order | null {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;

    const order = orders[index];
    const newStatus: OrderStatus = order.status === 'new_order' ? 'contacting_customer' : order.status;

    const updatedOrder: Order = {
      ...order,
      contactMethod: method,
      contactedAt: new Date().toISOString(),
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    orders[index] = updatedOrder;
    this.saveOrders(orders);
    return updatedOrder;
  },

  assignInventory(orderId: string, inventoryId: string): { order: Order; item: DigitalAccountInventory } | null {
    const orders = this.getOrders();
    const inventory = this.getInventory();

    const orderIndex = orders.findIndex((o) => o.id === orderId);
    const itemIndex = inventory.findIndex((i) => i.id === inventoryId);

    if (orderIndex === -1 || itemIndex === -1) return null;

    const now = new Date().toISOString();
    const item = {
      ...inventory[itemIndex],
      isAssigned: true,
      assignedOrderId: orderId,
      assignedAt: now,
    };
    inventory[itemIndex] = item;

    const order: Order = {
      ...orders[orderIndex],
      assignedInventoryId: inventoryId,
      deliveredCredentials: item.accountData,
      status: 'completed',
      credentialsRevealed: true,
      updatedAt: now,
    };
    orders[orderIndex] = order;

    this.saveInventory(inventory);
    this.saveOrders(orders);

    return { order, item };
  },

  toggleCredentialsReveal(orderId: string, reveal: boolean): Order | null {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;

    const order: Order = {
      ...orders[index],
      credentialsRevealed: reveal,
      updatedAt: new Date().toISOString(),
    };
    orders[index] = order;
    this.saveOrders(orders);
    return order;
  },

  computeStats(orders: Order[]): AdminStats {
    const totalOrderValue = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.totalAmount : sum), 0);

    return {
      totalOrders: orders.length,
      newOrders: orders.filter((o) => o.status === 'new_order').length,
      awaitingContact: orders.filter((o) => o.status === 'new_order' || !o.contactedAt).length,
      awaitingCustomerResponse: orders.filter((o) => o.status === 'contacting_customer').length,
      paymentConfirmed: orders.filter((o) => o.status === 'payment_confirmed').length,
      completed: orders.filter((o) => o.status === 'completed').length,
      totalOrderValue: Number(totalOrderValue.toFixed(2)),
    };
  },
};
