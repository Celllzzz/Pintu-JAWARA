import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getReport8ColumnData,
  formatExportTimestamp,
} from "@/lib/services/pimpinan";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "pimpinan" && user.role !== "admin_l1")) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "all";
  const categoryCode = searchParams.get("kategori") || "all";
  const format = searchParams.get("format") || "xlsx";

  const rows = await getReport8ColumnData({ range, categoryCode });

  if (format === "json") {
    return NextResponse.json({ rows });
  }

  const exportTimestamp = formatExportTimestamp();

  if (format === "csv") {
    function escapeCsvField(val: string): string {
      if (val.includes(";") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return `"${val}"`;
    }

    const csvLines: string[] = [
      "\uFEFFLAPORAN KINERJA PELAYANAN PUBLIK - PINTU JAWARA BRMP BANTEN",
      `Waktu Ekspor: ${exportTimestamp}`,
      `Filter Rentang: ${range.toUpperCase()} | Kategori: ${categoryCode.toUpperCase()}`,
      "",
      [
        "No",
        "Tanggal Pengajuan",
        "Tanggal Penyelesaian",
        "Nomor E-tiket",
        "Jenis Layanan",
        "Nama Pemohon / Kelompok",
        "Nomor WhatsApp",
        "Perihal",
        "Tim Penanganan",
      ]
        .map(escapeCsvField)
        .join(";"),
    ];

    rows.forEach((r, idx) => {
      const line = [
        String(idx + 1),
        escapeCsvField(r.tanggal_pengajuan),
        escapeCsvField(r.tanggal_penyelesaian),
        escapeCsvField(r.nomor_e_tiket),
        escapeCsvField(r.jenis_layanan),
        escapeCsvField(r.nama_pemohon),
        escapeCsvField(r.nomor_whatsapp),
        escapeCsvField(r.perihal),
        escapeCsvField(r.tim_penanganan),
      ].join(";");
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

  // Native styled Excel (.xlsx)
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Pintu JAWARA - BRMP Banten";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Laporan Kinerja", {
    views: [{ showGridLines: true }],
  });

  // Title rows
  const titleRow1 = worksheet.addRow([
    "LAPORAN KINERJA PELAYANAN PUBLIK - PINTU JAWARA BRMP BANTEN",
  ]);
  titleRow1.font = { name: "Arial", size: 12, bold: true, color: { argb: "FF1E4F28" } };

  const titleRow2 = worksheet.addRow([`Waktu Ekspor: ${exportTimestamp}`]);
  titleRow2.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF475447" } };

  const titleRow3 = worksheet.addRow([
    `Filter Rentang: ${range.toUpperCase()} | Kategori: ${categoryCode.toUpperCase()}`,
  ]);
  titleRow3.font = { name: "Arial", size: 9, bold: true, color: { argb: "FF52792B" } };

  worksheet.addRow([]); // Blank separator row

  // Table header
  const headers = [
    "No",
    "Tanggal Pengajuan",
    "Tanggal Penyelesaian",
    "Nomor E-tiket",
    "Jenis Layanan",
    "Nama Pemohon / Kelompok",
    "Nomor WhatsApp",
    "Perihal",
    "Tim Penanganan",
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.height = 26;

  headerRow.eachCell((cell) => {
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E4F28" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FF163C1E" } },
      left: { style: "thin", color: { argb: "FF163C1E" } },
      bottom: { style: "medium", color: { argb: "FF163C1E" } },
      right: { style: "thin", color: { argb: "FF163C1E" } },
    };
  });

  // Data rows
  rows.forEach((r, idx) => {
    const dataRow = worksheet.addRow([
      idx + 1,
      r.tanggal_pengajuan,
      r.tanggal_penyelesaian,
      r.nomor_e_tiket,
      r.jenis_layanan,
      r.nama_pemohon,
      r.nomor_whatsapp,
      r.perihal,
      r.tim_penanganan,
    ]);
    dataRow.height = 20;

    dataRow.eachCell((cell, colNumber) => {
      cell.font = { name: "Arial", size: 9, color: { argb: "FF191C19" } };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };

      if (colNumber === 1 || colNumber === 2 || colNumber === 3 || colNumber === 4) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
      } else if (colNumber === 7) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.numFmt = "@";
      } else {
        cell.alignment = { vertical: "middle", horizontal: "left" };
      }
    });
  });

  // Column widths: follow header length with extra comfortable margin
  headers.forEach((h, i) => {
    const col = worksheet.getColumn(i + 1);
    if (i === 0) {
      col.width = 6;
    } else {
      // Header length + 6 padding for comfort
      col.width = Math.max(h.length + 6, 16);
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `laporan_kinerja_pelayanan_${Date.now()}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
