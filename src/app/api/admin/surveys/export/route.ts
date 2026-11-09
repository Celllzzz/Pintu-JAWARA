import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatExportTimestamp } from "@/lib/services/pimpinan";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin_l1" && user.role !== "pimpinan")) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "all";
  const serviceType = searchParams.get("layanan") || searchParams.get("kategori") || "all";
  const mutu = searchParams.get("mutu") || "all";
  const format = searchParams.get("format") || "xlsx";

  const supabase = createAdminClient();

  let query = supabase
    .from("surveys")
    .select(`
      id,
      created_at,
      contact_number,
      service_type,
      gender,
      education,
      age_range,
      occupation,
      is_disabled,
      disability_type,
      q1,
      q2,
      q3,
      q4,
      q5,
      q6,
      q7,
      q8,
      q9,
      q10,
      q11,
      q12,
      q13,
      q14,
      q15,
      q16,
      feedback,
      average_score,
      ikm_score,
      service_grade,
      tickets (
        ticket_number,
        applicant_name,
        whatsapp_number
      )
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (serviceType && serviceType !== "all") {
    query = query.eq("service_type", serviceType);
  }

  if (mutu === "A" || mutu === "B" || mutu === "C" || mutu === "D") {
    query = query.eq("service_grade", mutu);
  }

  if (range && range !== "all") {
    const now = new Date();
    let startDate: Date | null = null;
    if (range === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === "quarter") {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), qMonth, 1);
    } else if (range === "year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    }
    if (startDate) {
      query = query.gte("created_at", startDate.toISOString());
    }
  }

  const { data: surveys, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: `Gagal memuat data survei: ${error.message}` },
      { status: 500 }
    );
  }

  const rows = surveys || [];

  if (format === "json") {
    const total = rows.length;
    const avgScore =
      total > 0
        ? Number(
            (
              rows.reduce((acc, s) => acc + Number(s.ikm_score), 0) / total
            ).toFixed(2)
          )
        : null;

    let overallGrade = "—";
    if (avgScore !== null) {
      if (avgScore >= 88.31) overallGrade = "A (Sangat Baik)";
      else if (avgScore >= 76.61) overallGrade = "B (Baik)";
      else if (avgScore >= 65.0) overallGrade = "C (Kurang Baik)";
      else overallGrade = "D (Tidak Baik)";
    }

    return NextResponse.json({
      surveys: rows,
      total,
      averageIkm: avgScore,
      overallGrade,
    });
  }

  const exportTimestamp = formatExportTimestamp();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Pintu JAWARA - BRMP Banten";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Hasil Survei SKM", {
    views: [{ showGridLines: true }],
  });

  // Title block
  const title1 = worksheet.addRow([
    "REKAPITULASI HASIL SURVEI KEPUASAN MASYARAKAT (SKM) - PINTU JAWARA BRMP BANTEN",
  ]);
  title1.font = { name: "Arial", size: 12, bold: true, color: { argb: "FF1E4F28" } };

  const title2 = worksheet.addRow([`Waktu Ekspor: ${exportTimestamp}`]);
  title2.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF475447" } };

  const title3 = worksheet.addRow([`Total Responden Survei: ${rows.length} Responden`]);
  title3.font = { name: "Arial", size: 9, bold: true, color: { argb: "FF52792B" } };

  worksheet.addRow([]); // Blank separator

  // Table headers
  const headers = [
    "No",
    "Waktu Pengisian",
    "Nomor E-Tiket",
    "Nama Pemohon",
    "No. WhatsApp Pemohon",
    "Kontak Responden",
    "Jenis Layanan",
    "Jenis Kelamin",
    "Pendidikan",
    "Rentang Usia",
    "Pekerjaan",
    "Disabilitas",
    "Ragam Disabilitas",
    "Q1 (Informasi)",
    "Q2 (Persyaratan)",
    "Q3 (Prosedur)",
    "Q4 (Kemudahan)",
    "Q5 (Integritas SOP)",
    "Q6 (Waktu Layanan)",
    "Q7 (Kesesuaian Tarif)",
    "Q8 (Bebas Pungli)",
    "Q9 (Bebas Calo)",
    "Q10 (Kualitas Produk)",
    "Q11 (Kecepatan Petugas)",
    "Q12 (Keramahan Petugas)",
    "Q13 (Keadilan Layanan)",
    "Q14 (Anti Gratifikasi)",
    "Q15 (Akses Pengaduan)",
    "Q16 (Sarana Prasarana)",
    "Rata-rata",
    "Skor IKM",
    "Mutu",
    "Kritik & Saran Responden",
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.height = 26;

  headerRow.eachCell((cell) => {
    cell.font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FFFFFFFF" } };
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

  // Populate data rows
  rows.forEach((s, idx) => {
    const ticket = Array.isArray(s.tickets) ? s.tickets[0] : s.tickets;
    const ticketNumber = ticket?.ticket_number || "—";
    const applicantName = ticket?.applicant_name || "—";
    const waNumber = ticket?.whatsapp_number || "—";

    const fillDate = new Date(s.created_at);
    const dateStr = fillDate.toLocaleDateString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timeStr = fillDate
      .toLocaleTimeString("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(":", ".");
    const waktuPengisian = `${dateStr} ${timeStr} WIB`;

    const dataRow = worksheet.addRow([
      idx + 1,
      waktuPengisian,
      ticketNumber,
      applicantName,
      waNumber,
      s.contact_number || "—",
      s.service_type,
      s.gender,
      s.education,
      s.age_range,
      s.occupation,
      s.is_disabled ? "Ya" : "Tidak",
      s.disability_type || "—",
      s.q1,
      s.q2,
      s.q3,
      s.q4,
      s.q5,
      s.q6,
      s.q7,
      s.q8,
      s.q9,
      s.q10,
      s.q11,
      s.q12,
      s.q13,
      s.q14,
      s.q15,
      s.q16,
      Number(s.average_score).toFixed(2),
      Number(s.ikm_score).toFixed(2),
      s.service_grade,
      s.feedback || "—",
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

      // Alignment rules:
      // Text columns (Name, Service, Education, Feedback): Left aligned
      // Numeric/Code/Dates: Center aligned
      if (
        colNumber === 4 ||
        colNumber === 7 ||
        colNumber === 9 ||
        colNumber === 11 ||
        colNumber === 13 ||
        colNumber === 33
      ) {
        cell.alignment = { vertical: "middle", horizontal: "left" };
      } else {
        cell.alignment = { vertical: "middle", horizontal: "center" };
      }

      // Format WhatsApp and Contact columns as text
      if (colNumber === 5 || colNumber === 6) {
        cell.numFmt = "@";
      }
    });
  });

  // Column width: follow header length + comfortable extra spacing
  headers.forEach((h, i) => {
    const col = worksheet.getColumn(i + 1);
    if (i === 0) {
      col.width = 6;
    } else {
      // Header length + 6 padding for comfort
      col.width = Math.max(h.length + 6, 15);
    }
  });

  // Extra width for feedback column
  worksheet.getColumn(33).width = 35;

  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `rekapitulasi_survei_skm_${Date.now()}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
