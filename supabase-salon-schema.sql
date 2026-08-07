-- =============================================================================
-- WhatsApp-First Salon Management System SaaS - Production Database Schema
-- Run this SINGLE SQL script in Supabase SQL Editor (Idempotent & Safe to Re-run)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- Helper trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 1. Salons (Multi-Tenant SaaS Support)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS salons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    phone_number TEXT NOT NULL UNIQUE,
    whatsapp_origin TEXT,
    whatsapp_auth_token TEXT,
    address TEXT,
    city TEXT,
    logo_url TEXT,
    currency TEXT NOT NULL DEFAULT 'INR',
    opening_time TIME NOT NULL DEFAULT '09:00:00',
    closing_time TIME NOT NULL DEFAULT '21:00:00',
    slot_interval_minutes INTEGER NOT NULL DEFAULT 15,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_salons_updated_at ON salons;
CREATE TRIGGER trg_salons_updated_at
BEFORE UPDATE ON salons
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- 2. Customers CRM
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    email TEXT,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'unspecified')),
    birthday DATE,
    notes TEXT,
    loyalty_points INTEGER NOT NULL DEFAULT 0,
    total_visits INTEGER NOT NULL DEFAULT 0,
    total_spend NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    last_visit_at TIMESTAMPTZ,
    favourite_barber_id UUID,
    preferred_services UUID[] DEFAULT '{}',
    is_vip BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (salon_id, whatsapp_number)
);

DROP TRIGGER IF EXISTS trg_customers_updated_at ON customers;
CREATE TRIGGER trg_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_customers_salon_phone ON customers(salon_id, whatsapp_number);

-- -----------------------------------------------------------------------------
-- 3. Barbers & Staff
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS barbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone_number TEXT,
    avatar_url TEXT,
    experience_years NUMERIC(3,1) NOT NULL DEFAULT 2.0,
    rating NUMERIC(2,1) NOT NULL DEFAULT 4.8,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_break', 'off', 'inactive')),
    weekly_off_day INTEGER NOT NULL DEFAULT 0 CHECK (weekly_off_day BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday...
    start_time TIME NOT NULL DEFAULT '09:30:00',
    end_time TIME NOT NULL DEFAULT '20:30:00',
    skills TEXT[] DEFAULT '{}',
    bio TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_barbers_updated_at ON barbers;
CREATE TRIGGER trg_barbers_updated_at
BEFORE UPDATE ON barbers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_barbers_salon ON barbers(salon_id, status);

-- Add Foreign key back to customers
ALTER TABLE customers 
DROP CONSTRAINT IF EXISTS fk_customers_favourite_barber;

ALTER TABLE customers 
ADD CONSTRAINT fk_customers_favourite_barber 
FOREIGN KEY (favourite_barber_id) REFERENCES barbers(id) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- 4. Services Catalog
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Hair', -- Hair, Beard, Facial, Spa, Massage, Combo
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    price NUMERIC(10,2) NOT NULL,
    discount_price NUMERIC(10,2),
    image_url TEXT,
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_services_updated_at ON services;
CREATE TRIGGER trg_services_updated_at
BEFORE UPDATE ON services
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Service to Barber Mapping
CREATE TABLE IF NOT EXISTS barber_services (
    barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (barber_id, service_id)
);

-- -----------------------------------------------------------------------------
-- 5. Appointments & Bookings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    booking_code TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_duration_minutes INTEGER NOT NULL DEFAULT 30,
    total_price NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    source TEXT NOT NULL DEFAULT 'whatsapp' CHECK (source IN ('whatsapp', 'walk_in', 'phone', 'web')),
    cancellation_reason TEXT,
    whatsapp_message_id TEXT,
    reminder_24h_sent BOOLEAN NOT NULL DEFAULT FALSE,
    reminder_2h_sent BOOLEAN NOT NULL DEFAULT FALSE,
    reminder_30m_sent BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_bookings_updated_at ON bookings;
CREATE TRIGGER trg_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_bookings_barber_date ON bookings(barber_id, booking_date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);

-- Booking Services (Multi-service per appointment)
CREATE TABLE IF NOT EXISTS booking_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL
);

-- -----------------------------------------------------------------------------
-- 6. Barber Leave Management
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS barber_leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
    leave_date DATE NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (barber_id, leave_date)
);

-- -----------------------------------------------------------------------------
-- 7. WhatsApp Live Log & Persistent Conversation Memory Engine
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    message_id TEXT NOT NULL UNIQUE,
    channel TEXT NOT NULL DEFAULT 'whatsapp',
    from_number TEXT NOT NULL,
    to_number TEXT NOT NULL,
    sender_name TEXT,
    content_type TEXT NOT NULL DEFAULT 'text',
    content_text TEXT,
    raw_transcript TEXT,
    transcript_language TEXT,
    event_type TEXT NOT NULL DEFAULT 'MoMessage',
    is_in_24_window BOOLEAN NOT NULL DEFAULT TRUE,
    is_responded BOOLEAN NOT NULL DEFAULT FALSE,
    auto_respond_sent BOOLEAN NOT NULL DEFAULT FALSE,
    response_sent_at TIMESTAMPTZ,
    raw_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_from_to ON whatsapp_messages(from_number, to_number);

-- Persistent Conversation Memory Engine State
CREATE TABLE IF NOT EXISTS user_conversation_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_number TEXT NOT NULL,
    to_number TEXT NOT NULL,
    conversation_id TEXT,
    active_flow TEXT NOT NULL DEFAULT 'WELCOME',
    current_step TEXT NOT NULL DEFAULT 'MAIN_MENU',
    previous_step TEXT,
    draft_booking JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_user_message TEXT,
    last_bot_message TEXT,
    flow_status TEXT NOT NULL DEFAULT 'active',
    current_stage TEXT NOT NULL DEFAULT 'DISCOVERY',
    collected_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    first_message_sent BOOLEAN NOT NULL DEFAULT FALSE,
    last_interaction_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (from_number, to_number)
);

-- Safely add missing columns to user_conversation_data if table already exists
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE user_conversation_data ADD COLUMN conversation_id TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE user_conversation_data ADD COLUMN active_flow TEXT NOT NULL DEFAULT 'WELCOME';
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE user_conversation_data ADD COLUMN current_step TEXT NOT NULL DEFAULT 'MAIN_MENU';
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE user_conversation_data ADD COLUMN previous_step TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE user_conversation_data ADD COLUMN draft_booking JSONB NOT NULL DEFAULT '{}'::jsonb;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE user_conversation_data ADD COLUMN last_user_message TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE user_conversation_data ADD COLUMN last_bot_message TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE user_conversation_data ADD COLUMN flow_status TEXT NOT NULL DEFAULT 'active';
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE user_conversation_data ADD COLUMN last_interaction_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

-- Phone to Document & Auth Token Mapping (With Dynamic Webhook Support)
CREATE TABLE IF NOT EXISTS phone_document_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    webhook_id TEXT,
    webhook_secret TEXT,
    webhook_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    phone_number TEXT NOT NULL UNIQUE,
    file_id UUID,
    file_ids UUID[] DEFAULT '{}',
    system_prompt TEXT,
    auth_token TEXT,
    origin TEXT,
    gemini_api_key TEXT,
    groq_api_key TEXT,
    mistral_api_key TEXT,
    webhook_last_verified_at TIMESTAMPTZ,
    webhook_last_received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safely add missing columns to phone_document_mapping if table already exists
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE phone_document_mapping ADD COLUMN webhook_id TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE phone_document_mapping ADD COLUMN webhook_secret TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE phone_document_mapping ADD COLUMN webhook_enabled BOOLEAN NOT NULL DEFAULT TRUE;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE phone_document_mapping ADD COLUMN user_id UUID;
    EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

-- -----------------------------------------------------------------------------
-- 8. Knowledge Base & Vector Documents (RAG)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    file_type TEXT,
    content TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    chunk TEXT NOT NULL,
    embedding VECTOR(1024), -- Mistral Embedding 1024 dimensions
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vector Search Helper Function for WhatsApp Phone Numbers
CREATE OR REPLACE FUNCTION match_document_chunks_by_phone(
    query_embedding VECTOR(1024),
    p_phone_number TEXT,
    match_threshold FLOAT DEFAULT 0.2,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    file_id UUID,
    chunk TEXT,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.file_id,
        dc.chunk,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM document_chunks dc
    JOIN phone_document_mapping pdm ON dc.file_id = ANY(pdm.file_ids)
    WHERE pdm.phone_number = p_phone_number
      AND 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 9. Notifications & Audit Logs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'booking', 'cancellation', 'reschedule', 'alert')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Function to automatically check slot collision
CREATE OR REPLACE FUNCTION check_barber_slot_collision(
    p_barber_id UUID,
    p_booking_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_conflict_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_conflict_count
    FROM bookings
    WHERE barber_id = p_barber_id
      AND booking_date = p_booking_date
      AND status IN ('confirmed', 'in_progress', 'pending')
      AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
      AND (
          (p_start_time >= start_time AND p_start_time < end_time) OR
          (p_end_time > start_time AND p_end_time <= end_time) OR
          (p_start_time <= start_time AND p_end_time >= end_time)
      );

    RETURN v_conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 10. Disable RLS & Grant Access to Anon and Authenticated Roles
-- -----------------------------------------------------------------------------
ALTER TABLE salons DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE barbers DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE barber_services DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE booking_services DISABLE ROW LEVEL SECURITY;
ALTER TABLE barber_leaves DISABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_conversation_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE phone_document_mapping DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
