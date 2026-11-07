import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getReport8ColumnData,
  formatExportTimestamp,
} from "@/lib/services/pimpinan";

function escapeCsvField(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return `"${val}"`;
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "pimpinan" && user.role !== "admin_l1")) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "all";
  const categoryCode = searchParams.get("kategori") || "all";
  const format = searchParams.get("format") || "csv";

  const rows = await getReport8ColumnData({ range, categoryCode });

  if (format === "json") {
    return NextResponse.json({ rows });
  }

  const exportTimestamp = formatExportTimestamp();

  // Build CSV content with UTF-8 BOM (\uFEFF) for Excel compatibility
  const csvLines: string[] = [
    "\uFEFFLAPORAN KINERJA PELAYANAN PUBLIK - PINTU JAWARA BRMP BANTEN",
    `Waktu Ekspor: ${exportTimestamp}`,
    `Filter Rentang: ${range.toUpperCase()} | Kategori: ${categoryCode.toUpperCase()}`,
    "",
    [
      "Tanggal Pengajuan",
      "Tanggal Penyelesaian",
      "Nomor E-tiket",
      "Jenis Layanan",
      "Nama Pemohon / Kelompok",
      "Nomor Whatsapp",
      "Perihal",
      "Tim Penanganan",
    ]
      .map(escapeCsvField)
      .join(","),
  ];

  rows.forEach((r) => {
    const line = [
      escapeCsvField(r.tanggal_pengajuan),
      escapeCsvField(r.tanggal_penyelesaian),
      escapeCsvField(r.nomor_e_tiket),
      escapeCsvField(r.jenis_layanan),
      escapeCsvField(r.nama_pemohon),
      escapeCsvField(r.nomor_whatsapp),
      escapeCsvField(r.perihal),
      escapeCsvField(r.tim_penanganan),
    ].join(",");
    csvLines.push(line);
  });

  const csvString = csvLines.join("\r\n");
  const fileName = `laporan_pintu_jawara_${Date.now()}.csv`;

  return new NextResponse(csvString, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
