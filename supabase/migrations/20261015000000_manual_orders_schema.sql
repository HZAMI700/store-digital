-- ==============================================================================
-- DIGITAL STORE: MANUAL ORDERS & DIRECT CUSTOMER CONTACT SCHEMA
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    whatsapp TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    display_order INT DEFAULT 0
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    short_description TEXT,
    full_description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    compare_at_price NUMERIC(10,2),
    image_url TEXT,
    badge TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
    warranty TEXT DEFAULT '30-Day Replacement Guarantee',
    delivery_note TEXT DEFAULT 'Delivered manually via WhatsApp or Email after payment confirmation',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. DIGITAL ACCOUNTS / INVENTORY TABLE (Single-use credentials)
CREATE TABLE IF NOT EXISTS public.digital_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    account_data TEXT NOT NULL, -- Sensitive account info (login/password/license code)
    is_assigned BOOLEAN NOT NULL DEFAULT false,
    assigned_order_id UUID UNIQUE, -- UNIQUE ensures an account can NEVER be assigned to multiple orders
    assigned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. ORDERS TABLE (Core Manual Order System)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_reference TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    guest_lookup_token TEXT NOT NULL, -- Secret random token generated for guest checkout verification
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_whatsapp TEXT NOT NULL,
    country_code TEXT NOT NULL DEFAULT '+1',
    product_id UUID NOT NULL REFERENCES public.products(id),
    product_name TEXT NOT NULL, -- Snapshot at submission
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 20),
    unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0), -- Snapshot at submission
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0), -- Calculated on server
    customer_message TEXT,
    consent_given BOOLEAN NOT NULL DEFAULT true,
    consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    status TEXT NOT NULL DEFAULT 'new_order' CHECK (
        status IN (
            'new_order',
            'contacting_customer',
            'awaiting_customer_response',
            'payment_instructions_sent',
            'payment_confirmed',
            'completed',
            'cancelled',
            'unable_to_contact'
        )
    ),
    internal_notes TEXT, -- ADMIN ONLY: Never exposed to customer queries
    contact_method TEXT CHECK (contact_method IN ('whatsapp', 'email', 'phone', NULL)),
    contacted_at TIMESTAMPTZ,
    assigned_inventory_id UUID REFERENCES public.digital_inventory(id) ON DELETE SET NULL,
    delivered_credentials TEXT, -- Populated if admin chooses to deliver via dashboard
    credentials_revealed BOOLEAN NOT NULL DEFAULT false, -- Reveal to customer only after explicit approval
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. ORDER ACTIVITY / CONTACT AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.order_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    actor_type TEXT NOT NULL CHECK (actor_type IN ('customer', 'admin', 'system')),
    actor_name TEXT,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_orders_reference ON public.orders(order_reference);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_digital_inventory_product ON public.digital_inventory(product_id, is_assigned);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- CATEGORIES & PRODUCTS POLICIES (Public Read)
CREATE POLICY "Categories are viewable by everyone"
    ON public.categories FOR SELECT
    USING (true);

CREATE POLICY "Products are viewable by everyone"
    ON public.products FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Only admins can modify products"
    ON public.products FOR ALL
    USING (public.is_admin());

-- DIGITAL INVENTORY POLICIES (Strict Admin Only)
CREATE POLICY "Only admins can access digital inventory"
    ON public.digital_inventory FOR ALL
    USING (public.is_admin());

-- ORDERS POLICIES
-- 1. Insert: Anyone can submit a manual order request (authenticated or anon guest)
CREATE POLICY "Anyone can submit an order request"
    ON public.orders FOR INSERT
    WITH CHECK (
        status = 'new_order' AND
        consent_given = true AND
        (auth.uid() IS NULL OR customer_id = auth.uid())
    );

-- 2. Select: Authenticated customers can view their own orders; Admins can view all orders
CREATE POLICY "Customers view own orders, admins view all"
    ON public.orders FOR SELECT
    USING (
        (auth.uid() IS NOT NULL AND customer_id = auth.uid()) OR
        public.is_admin()
    );

-- 3. Update: Strictly Admin Only (Status, Notes, Inventory, Contact time)
CREATE POLICY "Only admins can update orders"
    ON public.orders FOR UPDATE
    USING (public.is_admin());

-- ORDER ACTIVITY LOGS POLICIES
CREATE POLICY "Activity logs visible to order owners and admins"
    ON public.order_activity_logs FOR SELECT
    USING (
        public.is_admin() OR
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_activity_logs.order_id AND orders.customer_id = auth.uid()
        )
    );

-- ==============================================================================
-- SECURE CUSTOMER SAFE VIEW (Strips internal admin notes)
-- ==============================================================================
CREATE OR REPLACE VIEW public.customer_orders_safe AS
SELECT
    id,
    order_reference,
    customer_id,
    customer_name,
    customer_email,
    customer_whatsapp,
    country_code,
    product_id,
    product_name,
    quantity,
    unit_price,
    total_amount,
    customer_message,
    consent_timestamp,
    status,
    contact_method,
    contacted_at,
    CASE WHEN credentials_revealed = true THEN delivered_credentials ELSE NULL END AS delivered_credentials,
    credentials_revealed,
    created_at,
    updated_at
FROM public.orders;

-- ==============================================================================
-- SECURE GUEST ORDER LOOKUP FUNCTION (Dual authorization)
-- Requires matching order reference + secret token or email verification
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.lookup_guest_order(
    p_order_reference TEXT,
    p_email TEXT,
    p_token TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    order_reference TEXT,
    customer_name TEXT,
    customer_email TEXT,
    customer_whatsapp TEXT,
    product_name TEXT,
    quantity INTEGER,
    unit_price NUMERIC,
    total_amount NUMERIC,
    status TEXT,
    created_at TIMESTAMPTZ,
    credentials_revealed BOOLEAN,
    delivered_credentials TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id,
        o.order_reference,
        o.customer_name,
        o.customer_email,
        o.customer_whatsapp,
        o.product_name,
        o.quantity,
        o.unit_price,
        o.total_amount,
        o.status,
        o.created_at,
        o.credentials_revealed,
        CASE WHEN o.credentials_revealed = true THEN o.delivered_credentials ELSE NULL END
    FROM public.orders o
    WHERE LOWER(o.order_reference) = LOWER(p_order_reference)
      AND (
          LOWER(o.customer_email) = LOWER(p_email)
          OR (p_token IS NOT NULL AND o.guest_lookup_token = p_token)
      );
END;
$$;
