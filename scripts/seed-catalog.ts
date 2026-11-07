import { Client } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function seedCatalog() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Terhubung ke database. Memulai seed katalog UPBS...");

    // 1. Varietas Padi & Ayam
    const varieties = [
      {
        code: "VAR-CKB-FS",
        name: "Cakrabuana (FS)",
        seed_class: "FS",
        commodity_type: "padi",
        description:
          "Varietas unggul baru dengan potensi hasil 10,2 ton/ha. Umur tanaman genjah ±104 hari. Tahan terhadap penyakit hawar daun bakteri (HDB) patotipe III.",
        price_per_unit: 13000,
        unit: "kg",
        is_active: true,
        batches: [
          {
            batch_number: "B-CKB-2026-01",
            initial_stock: 500,
            current_stock: 450,
            reserved_stock: 0,
            expiry_date: "2026-11-30",
          },
        ],
      },
      {
        code: "VAR-CKB-SS",
        name: "Cakrabuana (SS)",
        seed_class: "SS",
        commodity_type: "padi",
        description:
          "Benih pokok bersertifikat resmi. Rasa nasi pulen, anakan produktif tinggi, cocok untuk lahan sawah irigasi dataran rendah hingga sedang.",
        price_per_unit: 12000,
        unit: "kg",
        is_active: true,
        batches: [
          {
            batch_number: "B-CKB-2026-02",
            initial_stock: 1200,
            current_stock: 1000,
            reserved_stock: 0,
            expiry_date: "2026-12-15",
          },
        ],
      },
      {
        code: "VAR-INP32-SS",
        name: "Inpari 32 HDB (SS)",
        seed_class: "SS",
        commodity_type: "padi",
        description:
          "Varietas primadona petani Banten. Tahan hawar daun bakteri dan tahan blas ras 033. Potensi hasil mencapai 10,6 ton/ha.",
        price_per_unit: 12000,
        unit: "kg",
        is_active: true,
        batches: [
          {
            batch_number: "B-INP-2026-01",
            initial_stock: 800,
            current_stock: 650,
            reserved_stock: 0,
            expiry_date: "2026-10-31",
          },
        ],
      },
      {
        code: "VAR-PAJ-SS",
        name: "Pajajaran Agritan (SS)",
        seed_class: "SS",
        commodity_type: "padi",
        description:
          "Umur sangat genjah ±105 hari setelah sebar. Potensi hasil 11 ton/ha dengan tekstur nasi sangat pulen.",
        price_per_unit: 12500,
        unit: "kg",
        is_active: true,
        batches: [
          {
            batch_number: "B-PAJ-2026-01",
            initial_stock: 200,
            current_stock: 45,
            reserved_stock: 0,
            expiry_date: "2026-09-30",
          },
        ],
      },
      {
        code: "VAR-AYAM-KUB1",
        name: "Bibit Ayam KUB-1 (DOC)",
        seed_class: "NONE",
        commodity_type: "ayam",
        description:
          "Day Old Chick (DOC) Ayam Kampung Unggul Balitbangtan-1. Produksi telur tinggi mencapai 160-180 butir/ekor/tahun, tahan penyakit dan pertumbuhan lebih cepat.",
        price_per_unit: 10000,
        unit: "ekor",
        is_active: true,
        batches: [
          {
            batch_number: "B-DOC-2026-W1",
            initial_stock: 300,
            current_stock: 150,
            reserved_stock: 0,
            expiry_date: "2026-12-31",
          },
        ],
      },
      {
        code: "VAR-AYAM-DARA",
        name: "Ayam KUB Siap Telur (Pullet)",
        seed_class: "NONE",
        commodity_type: "ayam",
        description:
          "Dara siap produksi telur umur 16-18 minggu dengan bobot ideal dan riwayat vaksinasi lengkap.",
        price_per_unit: 65000,
        unit: "ekor",
        is_active: true,
        batches: [], // Stok 0 -> status "Tanyakan Stok"
      },
    ];

    for (const v of varieties) {
      const varRes = await client.query(
        `INSERT INTO varieties (code, name, seed_class, commodity_type, description, price_per_unit, unit, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (code) DO UPDATE SET
           name = EXCLUDED.name,
           seed_class = EXCLUDED.seed_class,
           commodity_type = EXCLUDED.commodity_type,
           description = EXCLUDED.description,
           price_per_unit = EXCLUDED.price_per_unit,
           unit = EXCLUDED.unit,
           is_active = EXCLUDED.is_active
         RETURNING id;`,
        [
          v.code,
          v.name,
          v.seed_class,
          v.commodity_type,
          v.description,
          v.price_per_unit,
          v.unit,
          v.is_active,
        ]
      );

      const varietyId = varRes.rows[0].id;

      for (const b of v.batches) {
        await client.query(
          `INSERT INTO variety_batches (variety_id, batch_number, initial_stock, current_stock, reserved_stock, expiry_date)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING;`,
          [
            varietyId,
            b.batch_number,
            b.initial_stock,
            b.current_stock,
            b.reserved_stock,
            b.expiry_date,
          ]
        );
      }
    }

    console.log("Data varietas & batch UPBS berhasil dimasukkan!");
  } finally {
    await client.end();
  }
}

seedCatalog().catch((err) => {
  console.error("Gagal seed katalog:", err);
  process.exit(1);
});
