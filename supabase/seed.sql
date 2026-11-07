-- ============================================================================
-- PINTU JAWARA BRMP BANTEN — DATA SEED
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. 8 Tim Penanganan
-- ----------------------------------------------------------------------------
INSERT INTO teams (code, name, description) VALUES
    ('sdm_aparatur', 'Pengelolaan SDM Aparatur', 'Tim penanganan layanan kepegawaian, magang, dan PKL'),
    ('pendampingan_modernisasi', 'Pendampingan Modernisasi Pertanian', 'Tim fasilitasi dan pendampingan teknologi spesifik lokasi'),
    ('penerapan_diseminasi', 'Penerapan dan Diseminasi', 'Tim diseminasi inovasi pertanian dan perpustakaan'),
    ('kerjasama_kesesuaian', 'Pengelolaan Kerjasama dan Penilaian Kesesuaian', 'Tim pengujian laboratorium mutu dan kerjasama kelembagaan'),
    ('pengujian_teknologi', 'Pengujian Teknologi Spesifik Lokasi', 'Tim pengujian teknologi terapan dan taman agromodern'),
    ('upbs_padi', 'Unit Pengelola Benih Sumber Padi', 'Unit produksi dan distribusi benih sumber padi'),
    ('upbs_ayam', 'Unit Pengelola Benih Sumber Ayam', 'Unit pembibitan dan distribusi bibit ayam KUB'),
    ('pengaduan_masyarakat', 'Pengaduan Masyarakat', 'Tim tindak lanjut aspirasi dan pengaduan publik')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- ----------------------------------------------------------------------------
-- 2. 8 Kategori Layanan Utama
-- ----------------------------------------------------------------------------
INSERT INTO service_categories (code, name, sla_days, is_commercial) VALUES
    ('BS', 'Penyediaan Benih & Bibit Sumber', 5, TRUE),
    ('IP', 'Informasi Publik (PPID)', 10, FALSE),
    ('MP', 'Magang / PKL', 7, FALSE),
    ('KE', 'Kunjungan Edukasi', 5, FALSE),
    ('PK', 'Pengujian dan Penilaian Kesesuaian', 14, TRUE),
    ('KT', 'Pendampingan Modernisasi (Konsultasi Teknologi)', 3, FALSE),
    ('PA', 'Pengaduan & Aspirasi', 5, FALSE),
    ('PB', 'Pelatihan & Bimtek', 7, FALSE)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    sla_days = EXCLUDED.sla_days,
    is_commercial = EXCLUDED.is_commercial;

-- ----------------------------------------------------------------------------
-- 3. Sub-Layanan
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    cat_bs UUID;
    cat_ip UUID;
    cat_mp UUID;
    cat_ke UUID;
    cat_pk UUID;
    cat_kt UUID;
    cat_pa UUID;
    cat_pb UUID;
BEGIN
    SELECT id INTO cat_bs FROM service_categories WHERE code = 'BS';
    SELECT id INTO cat_ip FROM service_categories WHERE code = 'IP';
    SELECT id INTO cat_mp FROM service_categories WHERE code = 'MP';
    SELECT id INTO cat_ke FROM service_categories WHERE code = 'KE';
    SELECT id INTO cat_pk FROM service_categories WHERE code = 'PK';
    SELECT id INTO cat_kt FROM service_categories WHERE code = 'KT';
    SELECT id INTO cat_pa FROM service_categories WHERE code = 'PA';
    SELECT id INTO cat_pb FROM service_categories WHERE code = 'PB';

    -- Sub-layanan BS
    IF NOT EXISTS (SELECT 1 FROM sub_services WHERE category_id = cat_bs AND name = 'Benih Padi') THEN
        INSERT INTO sub_services (category_id, name) VALUES (cat_bs, 'Benih Padi');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM sub_services WHERE category_id = cat_bs AND name = 'Bibit Ayam KUB') THEN
        INSERT INTO sub_services (category_id, name) VALUES (cat_bs, 'Bibit Ayam KUB');
    END IF;

    -- Sub-layanan IP (PPID)
    IF NOT EXISTS (SELECT 1 FROM sub_services WHERE category_id = cat_ip AND name = 'Informasi Berkala') THEN
        INSERT INTO sub_services (category_id, name) VALUES (cat_ip, 'Informasi Berkala');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM sub_services WHERE category_id = cat_ip AND name = 'Informasi Serta Merta') THEN
        INSERT INTO sub_services (category_id, name) VALUES (cat_ip, 'Informasi Serta Merta');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM sub_services WHERE category_id = cat_ip AND name = 'Informasi Setiap Saat') THEN
        INSERT INTO sub_services (category_id, name) VALUES (cat_ip, 'Informasi Setiap Saat');
    END IF;

    -- Sub-layanan MP
    IF NOT EXISTS (SELECT 1 FROM sub_services WHERE category_id = cat_mp AND name = 'Permohonan Magang Perguruan Tinggi') THEN
        INSERT INTO sub_services (category_id, name) VALUES (cat_mp, 'Permohonan Magang Perguruan Tinggi');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM sub_services WHERE category_id = cat_mp AND name = 'Permohonan PKL SLTA') THEN
        INSERT INTO sub_services (category_id, name) VALUES (cat_mp, 'Permohonan PKL SLTA');
    END IF;

    -- Sub-layanan KE
    IF NOT EXISTS (SELECT 1 FROM sub_services WHERE category_id = cat_ke AND name = 'Kunjungan Edukasi Taman Agromodern') THEN
        INSERT INTO sub_services (category_id, name) VALUES (cat_ke, 'Kunjungan Edukasi Taman Agromodern');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM sub_services WHERE category_id = cat_ke AND name = 'Perpustakaan') THEN
        INSERT INTO sub_services (category_id, name) VALUES (cat_ke, 'Perpustakaan');
    END IF;

    -- Sub-layanan PK
    IF NOT EXISTS (SELECT 1 FROM sub_services WHERE category_id = cat_pk AND name = 'Pengujian Laboratorium Mutu Beras') THEN
        INSERT INTO sub_services (category_id, name) VALUES (cat_pk, 'Pengujian Laboratorium Mutu Beras');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM sub_services WHERE category_id = cat_pk AND name = 'Pengujian Unsur Hara Tanah') THEN
        INSERT INTO sub_services (category_id, name) VALUES (cat_pk, 'Pengujian Unsur Hara Tanah');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM sub_services WHERE category_id = cat_pk AND name = 'Pendampingan Teknis Pengujian') THEN
        INSERT INTO sub_services (category_id, name) VALUES (cat_pk, 'Pendampingan Teknis Pengujian');
    END IF;

    -- Sub-layanan KT
    IF NOT EXISTS (SELECT 1 FROM sub_services WHERE category_id = cat_kt AND name = 'Konsultasi Teknologi Spesifik Lokasi') THEN
        INSERT INTO sub_services (category_id, name) VALUES (cat_kt, 'Konsultasi Teknologi Spesifik Lokasi');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM sub_services WHERE category_id = cat_kt AND name = 'Konsultasi Budidaya dan Perbenihan') THEN
        INSERT INTO sub_services (category_id, name) VALUES (cat_kt, 'Konsultasi Budidaya dan Perbenihan');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM sub_services WHERE category_id = cat_kt AND name = 'Fasilitasi Penerapan') THEN
        INSERT INTO sub_services (category_id, name) VALUES (cat_kt, 'Fasilitasi Penerapan');
    END IF;

    -- Sub-layanan PA
    IF NOT EXISTS (SELECT 1 FROM sub_services WHERE category_id = cat_pa AND name = 'Pengaduan') THEN
        INSERT INTO sub_services (category_id, name) VALUES (cat_pa, 'Pengaduan');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM sub_services WHERE category_id = cat_pa AND name = 'Aspirasi') THEN
        INSERT INTO sub_services (category_id, name) VALUES (cat_pa, 'Aspirasi');
    END IF;

    -- Sub-layanan PB
    IF NOT EXISTS (SELECT 1 FROM sub_services WHERE category_id = cat_pb AND name = 'Fasilitasi Pendampingan Perencanaan') THEN
        INSERT INTO sub_services (category_id, name) VALUES (cat_pb, 'Fasilitasi Pendampingan Perencanaan');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM sub_services WHERE category_id = cat_pb AND name = 'Pelatihan Peningkatan Kapasitas') THEN
        INSERT INTO sub_services (category_id, name) VALUES (cat_pb, 'Pelatihan Peningkatan Kapasitas');
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 4. Hari Libur Nasional & Cuti Bersama 2026
-- ----------------------------------------------------------------------------
INSERT INTO holidays (date, name, is_joint_leave, year) VALUES
    ('2026-01-01', 'Tahun Baru 2026 Masehi', FALSE, 2026),
    ('2026-01-16', 'Isra Mikraj Nabi Muhammad SAW', FALSE, 2026),
    ('2026-02-17', 'Tahun Baru Imlek 2577 Kongzili', FALSE, 2026),
    ('2026-03-20', 'Hari Suci Nyepi Tahun Baru Saka 1948', FALSE, 2026),
    ('2026-03-21', 'Hari Raya Idul Fitri 1447 Hijriah (Hari 1)', FALSE, 2026),
    ('2026-03-22', 'Hari Raya Idul Fitri 1447 Hijriah (Hari 2)', FALSE, 2026),
    ('2026-03-23', 'Cuti Bersama Idul Fitri 1447 Hijriah', TRUE, 2026),
    ('2026-03-24', 'Cuti Bersama Idul Fitri 1447 Hijriah', TRUE, 2026),
    ('2026-04-03', 'Wafat Yesus Kristus', FALSE, 2026),
    ('2026-05-01', 'Hari Buruh Internasional', FALSE, 2026),
    ('2026-05-14', 'Kenaikan Yesus Kristus', FALSE, 2026),
    ('2026-05-27', 'Hari Raya Idul Adha 1447 Hijriah', FALSE, 2026),
    ('2026-06-01', 'Hari Lahir Pancasila', FALSE, 2026),
    ('2026-06-16', 'Tahun Baru Islam 1448 Hijriah', FALSE, 2026),
    ('2026-08-17', 'Hari Kemerdekaan Republik Indonesia ke-81', FALSE, 2026),
    ('2026-08-25', 'Maulid Nabi Muhammad SAW', FALSE, 2026),
    ('2026-12-25', 'Hari Raya Natal', FALSE, 2026),
    ('2026-12-26', 'Cuti Bersama Hari Raya Natal', TRUE, 2026)
ON CONFLICT (date) DO UPDATE SET
    name = EXCLUDED.name,
    is_joint_leave = EXCLUDED.is_joint_leave,
    year = EXCLUDED.year;

-- ----------------------------------------------------------------------------
-- 5. Seed Admin Level 1 Pertama (Password default: AdminJAWARA2026!)
-- Hash bcrypt 10 rounds: $2a$10$7Z8VqYc95V7fKx0W8k2z.u1G1K8zYq9d5W8k2z.u1G1K8zYq9d5W8
-- Catatan: Password dapat diubah setelah login
-- ----------------------------------------------------------------------------
INSERT INTO users (email, password_hash, full_name, phone_number, role, is_active)
VALUES (
    'admin@brmpbanten.pertanian.go.id',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'Admin Front-Office BRMP Banten',
    '081322114567',
    'admin_l1',
    TRUE
)
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = TRUE;

-- ----------------------------------------------------------------------------
-- 6. Katalog Benih & Bibit UPBS
-- ----------------------------------------------------------------------------
INSERT INTO varieties (code, name, seed_class, commodity_type, description, price_per_unit, unit, is_active) VALUES
    ('VAR-CKB-FS', 'Cakrabuana (FS)', 'FS', 'padi', 'Varietas unggul baru dengan potensi hasil 10,2 ton/ha. Umur tanaman genjah ±104 hari. Tahan penyakit hawar daun bakteri (HDB) patotipe III.', 13000, 'kg', TRUE),
    ('VAR-CKB-SS', 'Cakrabuana (SS)', 'SS', 'padi', 'Benih pokok bersertifikat resmi. Rasa nasi pulen, anakan produktif tinggi, cocok untuk lahan sawah irigasi dataran rendah hingga sedang.', 12000, 'kg', TRUE),
    ('VAR-INP32-SS', 'Inpari 32 HDB (SS)', 'SS', 'padi', 'Varietas primadona petani Banten. Tahan hawar daun bakteri dan tahan blas ras 033. Potensi hasil mencapai 10,6 ton/ha.', 12000, 'kg', TRUE),
    ('VAR-PAJ-SS', 'Pajajaran Agritan (SS)', 'SS', 'padi', 'Umur sangat genjah ±105 hari setelah sebar. Potensi hasil 11 ton/ha dengan tekstur nasi sangat pulen.', 12500, 'kg', TRUE),
    ('VAR-AYAM-KUB1', 'Bibit Ayam KUB-1 (DOC)', 'NONE', 'ayam', 'Day Old Chick (DOC) Ayam Kampung Unggul Balitbangtan-1. Produksi telur tinggi mencapai 160-180 butir/ekor/tahun, tahan penyakit dan pertumbuhan lebih cepat.', 10000, 'ekor', TRUE),
    ('VAR-AYAM-DARA', 'Ayam KUB Siap Telur (Pullet)', 'NONE', 'ayam', 'Dara siap produksi telur umur 16-18 minggu dengan bobot ideal dan riwayat vaksinasi lengkap.', 65000, 'ekor', TRUE)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    seed_class = EXCLUDED.seed_class,
    commodity_type = EXCLUDED.commodity_type,
    description = EXCLUDED.description,
    price_per_unit = EXCLUDED.price_per_unit,
    unit = EXCLUDED.unit,
    is_active = EXCLUDED.is_active;

-- Batch Stok Awal
DO $$
DECLARE
    v_ckb_fs UUID;
    v_ckb_ss UUID;
    v_inp_ss UUID;
    v_paj_ss UUID;
    v_ayam_kub UUID;
BEGIN
    SELECT id INTO v_ckb_fs FROM varieties WHERE code = 'VAR-CKB-FS';
    SELECT id INTO v_ckb_ss FROM varieties WHERE code = 'VAR-CKB-SS';
    SELECT id INTO v_inp_ss FROM varieties WHERE code = 'VAR-INP32-SS';
    SELECT id INTO v_paj_ss FROM varieties WHERE code = 'VAR-PAJ-SS';
    SELECT id INTO v_ayam_kub FROM varieties WHERE code = 'VAR-AYAM-KUB1';

    IF v_ckb_fs IS NOT NULL AND NOT EXISTS (SELECT 1 FROM variety_batches WHERE variety_id = v_ckb_fs) THEN
        INSERT INTO variety_batches (variety_id, batch_number, initial_stock, current_stock, reserved_stock, expiry_date)
        VALUES (v_ckb_fs, 'B-CKB-2026-01', 500, 450, 0, '2026-11-30');
    END IF;

    IF v_ckb_ss IS NOT NULL AND NOT EXISTS (SELECT 1 FROM variety_batches WHERE variety_id = v_ckb_ss) THEN
        INSERT INTO variety_batches (variety_id, batch_number, initial_stock, current_stock, reserved_stock, expiry_date)
        VALUES (v_ckb_ss, 'B-CKB-2026-02', 1200, 1000, 0, '2026-12-15');
    END IF;

    IF v_inp_ss IS NOT NULL AND NOT EXISTS (SELECT 1 FROM variety_batches WHERE variety_id = v_inp_ss) THEN
        INSERT INTO variety_batches (variety_id, batch_number, initial_stock, current_stock, reserved_stock, expiry_date)
        VALUES (v_inp_ss, 'B-INP-2026-01', 800, 650, 0, '2026-10-31');
    END IF;

    IF v_paj_ss IS NOT NULL AND NOT EXISTS (SELECT 1 FROM variety_batches WHERE variety_id = v_paj_ss) THEN
        INSERT INTO variety_batches (variety_id, batch_number, initial_stock, current_stock, reserved_stock, expiry_date)
        VALUES (v_paj_ss, 'B-PAJ-2026-01', 200, 45, 0, '2026-09-30');
    END IF;

    IF v_ayam_kub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM variety_batches WHERE variety_id = v_ayam_kub) THEN
        INSERT INTO variety_batches (variety_id, batch_number, initial_stock, current_stock, reserved_stock, expiry_date)
        VALUES (v_ayam_kub, 'B-DOC-2026-W1', 300, 150, 0, '2026-12-31');
    END IF;
END $$;
