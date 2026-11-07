-- ============================================================================
-- PINTU JAWARA BRMP BANTEN — STORAGE BUCKETS SETUP
-- ============================================================================

-- Bucket 1: documents (Persyaratan, Perbaikan, Bukti Bayar, Tagihan, Hasil Layanan)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    FALSE,
    10485760, -- 10MB
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket 2: catalog (Foto Varietas Benih & Bibit UPBS)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'catalog',
    'catalog',
    TRUE, -- Public agar bisa di-cache CDN dan diakses publik
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
