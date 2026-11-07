-- ============================================================================
-- PINTU JAWARA BRMP BANTEN — DATABASE SCHEMA (PostgreSQL / Supabase)
-- ============================================================================

-- Ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Tim Penanganan (8 Tim Disposisi)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- ----------------------------------------------------------------------------
-- 2. Kategori Layanan (8 Kategori Utama + Standar SLA)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL, -- 'BS', 'IP', 'MP', 'KE', 'PK', 'KT', 'PA', 'PB'
    name VARCHAR(255) NOT NULL,
    sla_days INTEGER NOT NULL,
    is_commercial BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- ----------------------------------------------------------------------------
-- 3. Sub-Layanan
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sub_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- ----------------------------------------------------------------------------
-- 4. Hari Libur Nasional & Cuti Bersama
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_joint_leave BOOLEAN NOT NULL DEFAULT FALSE,
    year INTEGER NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- ----------------------------------------------------------------------------
-- 5. Pengguna Internal (Admin L1, Admin L2 per Tim, Pimpinan)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin_l1', 'admin_l2', 'pimpinan')),
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- ----------------------------------------------------------------------------
-- 6. Sesi Pengguna Internal (HttpOnly Session)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. Katalog Varietas Benih & Bibit (Modul UPBS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS varieties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    seed_class VARCHAR(20) CHECK (seed_class IN ('BS', 'FS', 'SS', 'ES', 'NONE')),
    commodity_type VARCHAR(20) NOT NULL CHECK (commodity_type IN ('padi', 'ayam')),
    description TEXT,
    price_per_unit NUMERIC(15, 2) NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- ----------------------------------------------------------------------------
-- 8. Batch Stok Varietas (FEFO: First Expired, First Out)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS variety_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variety_id UUID NOT NULL REFERENCES varieties(id) ON DELETE CASCADE,
    batch_number VARCHAR(100) NOT NULL,
    initial_stock NUMERIC(10, 2) NOT NULL CHECK (initial_stock >= 0),
    current_stock NUMERIC(10, 2) NOT NULL CHECK (current_stock >= 0),
    reserved_stock NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
    expiry_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    CONSTRAINT stock_check CHECK (current_stock >= reserved_stock)
);

-- ----------------------------------------------------------------------------
-- 9. Tiket Permohonan Layanan
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    category_id UUID NOT NULL REFERENCES service_categories(id),
    sub_service_id UUID NOT NULL REFERENCES sub_services(id),
    team_id UUID REFERENCES teams(id),
    
    status VARCHAR(30) NOT NULL DEFAULT 'diajukan' CHECK (
        status IN (
            'diajukan',
            'diverifikasi',
            'perlu_perbaikan',
            'disposisi',
            'diproses',
            'selesai'
        )
    ),
    
    applicant_name VARCHAR(255) NOT NULL,
    whatsapp_number VARCHAR(50) NOT NULL,
    whatsapp_pin_last4 CHAR(4) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    mechanism VARCHAR(30) CHECK (mechanism IN ('komersial', 'bantuan', NULL)),
    variety_id UUID REFERENCES varieties(id),
    requested_quantity NUMERIC(10, 2),
    estimated_cost NUMERIC(15, 2),
    
    sla_days INTEGER NOT NULL,
    sla_started_at TIMESTAMPTZ,
    sla_paused_at TIMESTAMPTZ,
    sla_total_paused_seconds BIGINT NOT NULL DEFAULT 0,
    sla_deadline TIMESTAMPTZ,
    is_sla_extended BOOLEAN NOT NULL DEFAULT FALSE,
    sla_extension_reason TEXT,
    sla_extended_by UUID REFERENCES users(id),
    
    verified_by UUID REFERENCES users(id),
    disposed_by UUID REFERENCES users(id),
    disposed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES users(id),
    completed_at TIMESTAMPTZ,
    completion_note TEXT,
    
    version INTEGER NOT NULL DEFAULT 1,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- ----------------------------------------------------------------------------
-- 10. Dokumen Pendukung & Hasil Layanan
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    document_type VARCHAR(30) NOT NULL CHECK (
        document_type IN (
            'persyaratan_awal',
            'perbaikan_berkas',
            'bukti_bayar',
            'surat_tagihan',
            'hasil_layanan'
        )
    ),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    uploaded_by_role VARCHAR(20) NOT NULL CHECK (uploaded_by_role IN ('pemohon', 'admin_l1', 'admin_l2')),
    uploaded_by_user UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- ----------------------------------------------------------------------------
-- 11. Penagihan & Pembayaran (Layanan Berbayar UPBS / Lab)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_billings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL UNIQUE REFERENCES tickets(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    account_holder VARCHAR(255) NOT NULL,
    notes TEXT,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'menunggu_pembayaran' CHECK (
        payment_status IN ('menunggu_pembayaran', 'menunggu_verifikasi', 'lunas', 'ditolak')
    ),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- ----------------------------------------------------------------------------
-- 12. Survei Kepuasan Masyarakat (SKM 16 Instrumen)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL UNIQUE REFERENCES tickets(id) ON DELETE CASCADE,
    
    contact_number VARCHAR(50),
    service_type VARCHAR(100) NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Laki-Laki', 'Perempuan')),
    education VARCHAR(50) NOT NULL,
    age_range VARCHAR(50) NOT NULL,
    occupation VARCHAR(50) NOT NULL,
    is_disabled BOOLEAN NOT NULL DEFAULT FALSE,
    disability_type VARCHAR(100),
    
    q1 INTEGER NOT NULL CHECK (q1 BETWEEN 1 AND 4),
    q2 INTEGER NOT NULL CHECK (q2 BETWEEN 1 AND 4),
    q3 INTEGER NOT NULL CHECK (q3 BETWEEN 1 AND 4),
    q4 INTEGER NOT NULL CHECK (q4 BETWEEN 1 AND 4),
    q5 INTEGER NOT NULL CHECK (q5 BETWEEN 1 AND 4),
    q6 INTEGER NOT NULL CHECK (q6 BETWEEN 1 AND 4),
    q7 INTEGER NOT NULL CHECK (q7 BETWEEN 1 AND 4),
    q8 INTEGER NOT NULL CHECK (q8 BETWEEN 1 AND 4),
    q9 INTEGER NOT NULL CHECK (q9 BETWEEN 1 AND 4),
    q10 INTEGER NOT NULL CHECK (q10 BETWEEN 1 AND 4),
    q11 INTEGER NOT NULL CHECK (q11 BETWEEN 1 AND 4),
    q12 INTEGER NOT NULL CHECK (q12 BETWEEN 1 AND 4),
    q13 INTEGER NOT NULL CHECK (q13 BETWEEN 1 AND 4),
    q14 INTEGER NOT NULL CHECK (q14 BETWEEN 1 AND 4),
    q15 INTEGER NOT NULL CHECK (q15 BETWEEN 1 AND 4),
    q16 INTEGER NOT NULL CHECK (q16 BETWEEN 1 AND 4),
    
    feedback TEXT,
    
    average_score NUMERIC(5, 4) NOT NULL,
    ikm_score NUMERIC(6, 2) NOT NULL,
    service_grade CHAR(1) NOT NULL CHECK (service_grade IN ('A', 'B', 'C', 'D')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- ----------------------------------------------------------------------------
-- 13. Audit Log Jejak Sistem (IMMUTABLE — TANPA deleted_at)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    old_status VARCHAR(30),
    new_status VARCHAR(30),
    actor_type VARCHAR(20) NOT NULL CHECK (actor_type IN ('pemohon', 'admin_l1', 'admin_l2', 'pimpinan', 'system')),
    actor_id UUID REFERENCES users(id),
    actor_name VARCHAR(255),
    notes TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Aturan Ketat: Blokir UPDATE dan DELETE pada Audit Log
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_rules WHERE rulename = 'no_update_ticket_audit_logs') THEN
        CREATE RULE no_update_ticket_audit_logs AS ON UPDATE TO ticket_audit_logs DO INSTEAD NOTHING;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_rules WHERE rulename = 'no_delete_ticket_audit_logs') THEN
        CREATE RULE no_delete_ticket_audit_logs AS ON DELETE TO ticket_audit_logs DO INSTEAD NOTHING;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- INDEXING UNTUK PERFORMA QUERY
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_team_id ON tickets(team_id);
CREATE INDEX IF NOT EXISTS idx_tickets_category_id ON tickets(category_id);
CREATE INDEX IF NOT EXISTS idx_tickets_whatsapp_pin ON tickets(whatsapp_number, whatsapp_pin_last4);
CREATE INDEX IF NOT EXISTS idx_tickets_active ON tickets(status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_variety_batches_fefo ON variety_batches(variety_id, expiry_date ASC);
CREATE INDEX IF NOT EXISTS idx_variety_batches_active ON variety_batches(variety_id, expiry_date ASC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_varieties_active ON varieties(commodity_type) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_audit_logs_ticket_id ON ticket_audit_logs(ticket_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_surveys_ticket_id ON surveys(ticket_id);
CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(date);
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token_hash);
