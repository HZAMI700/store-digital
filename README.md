# Apex Digital Store — Manual Orders & Direct Customer Contact System

A premium digital account and subscription store built with **Next.js (App Router)**, **Tailwind CSS**, and **Supabase**, inspired by the visual aesthetics of **7lle.com**.

## 🛡️ Business Model & Core Rule
Customers **do not pay online** through automated gateways, and digital accounts are **not delivered automatically**. Customers submit a formal order request, and the store administrator contacts them directly via **WhatsApp** or **Email** to verify details, arrange manual payment, and deliver verified credentials.

---

## ✨ Features Implemented

### 1. Customer Ordering Workflow
- **"Order Now" Action**: Prominently displayed across product cards and dedicated product detail pages (`/products/[slug]`).
- **Responsive Order Request Modal**:
  - Full Customer Name (validated, min 2 characters).
  - Validated RFC Email Address.
  - WhatsApp Phone Number with integrated searchable **Country-Code Selector** (+1, +44, +33, +216, +966, +971, +20, etc.) with flags and clean international formatting.
  - Selected Product summary with dynamic **Quantity Stepper** (1–10).
  - Optional message / customer preferences (e.g. language, device, preferred contact hours).
  - Live calculated order total with unit price breakdown.
  - Required consent checkbox for contact authorization.
  - Prominent mandatory notice:
    > *"We'll contact you through WhatsApp or email to confirm your order, explain the payment process, and arrange delivery. Your order is not confirmed until we contact you."*
  - Server-side validation against tampering, invalid quantities, and duplicate submissions (30-second cooldown).
- **Polished Order Confirmation Screen** (`/order-success/[reference]`):
  - Order reference number with copy-to-clipboard button.
  - Ordered product, quantity, unit price, and total amount.
  - Submitted contact details.
  - Status badge: **Waiting for Admin Contact** (`new_order`).
  - Explanation card reassuring the customer that the administrator will contact them.
  - Visual 5-step order progress timeline.
  - **Zero redirection to payment gateways.**

### 2. Supabase Order System & Migrations
- Migration file located at `supabase/migrations/20261015000000_manual_orders_schema.sql`.
- **Database Tables**:
  - `orders`: Unique reference, customer ID, guest lookup token, name, email, WhatsApp, product, quantity, unit price snapshot, total amount, customer message, consent timestamp, order status (8 statuses), internal admin notes, contact method & timestamp, assigned inventory ID, delivered credentials, and reveal status.
  - `products`: Product catalog, pricing, category, badges, features, stock status.
  - `digital_inventory`: Vaulted single-use digital credentials with unique constraint preventing duplicate assignment across orders.
  - `order_activity_logs`: Full audit trail of admin status updates and contact attempts.
  - `profiles`: Customer and admin user profiles with role-based access.
- **Row Level Security (RLS)**:
  - Customers view only their own orders (`customer_id = auth.uid()`).
  - Admins (`role = 'admin'`) can inspect all orders and access the inventory vault.
  - View `customer_orders_safe`: Excludes `internal_notes` to guarantee customer queries never leak private admin notes.
  - Secure RPC `lookup_guest_order(order_reference, email, token)` enforces dual authorization so order numbers cannot be enumerated or viewed without matching credentials.

### 3. Administrator Dashboard
- **Admin Overview** (`/admin`):
  - 6 real-time metrics cards:
    1. **New Orders** (newly submitted, awaiting review).
    2. **Awaiting Contact** (pending outreach).
    3. **Awaiting Customer Response** (outreach made).
    4. **Payment Confirmed** (manually verified).
    5. **Completed Orders** (fulfilled & delivered).
    6. **Total Order Value** (gross value in USD).
  - Priority action queue of new and uncontacted orders.
- **Dedicated Orders Management** (`/admin/orders`):
  - Searchable by Reference, Customer Name, Email, WhatsApp, or Product.
  - Filterable by all **8 Order Statuses** and Products.
  - Responsive desktop table + touch-optimized mobile card view.
  - **Admin Order Drawer Inspector**:
    - Complete customer & order details.
    - Status changer for all 8 stages:
      1. *New Order*
      2. *Contacting Customer*
      3. *Awaiting Customer Response*
      4. *Payment Instructions Sent*
      5. *Payment Confirmed*
      6. *Completed*
      7. *Cancelled*
      8. *Unable to Contact*
    - **Private Internal Notes** (autosave/save button, strictly admin only).
    - **Inventory Allocation Tool**: Links a single-use account from vault to order, enforcing collision prevention.
    - **Credential Reveal Toggle**: Controls visibility on the customer dashboard.

### 4. Quick Contact Actions
- **Contact via WhatsApp**:
  - Automatically generates a sanitized, properly URL-encoded WhatsApp link:
    `https://wa.me/<cleaned_phone>?text=Hello%20[Name],%20we're%20contacting%20you%20regarding%20order%20%23[Ref]...`
  - Never exposes passwords or credentials in the URL.
  - Prompts administrator to confirm contact attempt and automatically logs timestamp & method in order history.
- **Contact via Email**:
  - `mailto:...` generator with pre-filled subject and message body.
  - Server-side transactional email trigger (`/api/admin/orders/[id]/contact`).
  - Confirms and records contact date.

### 5. Customer Dashboard & Order Tracking
- **My Orders** (`/my-orders`):
  - View list of past and active order requests.
  - Status badges, submitted contact information, and interactive 5-step timeline.
  - Reassurance banner reminding the customer to wait for admin outreach.
  - Delivered credentials vault with copy button once approved by admin.
- **Guest Order Tracking** (`/track-order`):
  - Dual-authorization lookup by Order Reference + Email.
  - Displays order progress without exposing internal admin notes.

### 6. Inventory Vault
- **Digital Account Inventory Vault** (`/admin/inventory`):
  - Add single-use credentials, license keys, or invitation links to vault.
  - Tracks Available vs Assigned & Locked accounts.
  - Enforces strict collision prevention: an account assigned to Order A cannot be assigned to Order B.

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
pnpm install

# 2. Build for production
pnpm build

# 3. Start production server
pnpm start -p 3000

# Or start development server
pnpm dev
```

Visit:
- **Storefront**: [http://localhost:3000](http://localhost:3000)
- **Track Order**: [http://localhost:3000/track-order](http://localhost:3000/track-order)
- **Customer Orders**: [http://localhost:3000/my-orders](http://localhost:3000/my-orders)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Admin Orders**: [http://localhost:3000/admin/orders](http://localhost:3000/admin/orders)
- **Admin Inventory**: [http://localhost:3000/admin/inventory](http://localhost:3000/admin/inventory)

---

## 🧪 Automated Testing
Run the comprehensive test suite verifying all 32 end-to-end criteria:
```bash
node test-workflow.mjs
```
All 32 tests pass including validation, pricing, duplicate blocking, guest lookup privacy, admin contact logs, status progressions, collision prevention, and credential release approval.
