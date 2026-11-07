import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: varietyId } = await params;
  const body = await req.json();
  const { batch_number, stock_quantity, expiry_date } = body;

  const numStock = Number(stock_quantity);
  if (!batch_number?.trim() || !expiry_date || isNaN(numStock) || numStock <= 0) {
    return NextResponse.json(
      { error: "Nomor batch, jumlah stok masuk (>0), dan tanggal kedaluwarsa wajib diisi." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Verify variety and authority
  const { data: currentVar, error: fetchErr } = await supabase
    .from("varieties")
    .select("id, name, commodity_type, unit")
    .eq("id", varietyId)
    .is("deleted_at", null)
    .single();

  if (fetchErr || !currentVar) {
    return NextResponse.json({ error: "Varietas tidak ditemukan." }, { status: 404 });
  }

  if (user.role === "admin_l2") {
    if (
      (currentVar.commodity_type === "padi" && user.team_code !== "upbs_padi") ||
      (currentVar.commodity_type === "ayam" && user.team_code !== "upbs_ayam")
    ) {
      return NextResponse.json(
        { error: "Akses ditolak: Varietas ini bukan wewenang unit Anda." },
        { status: 403 }
      );
    }
  } else if (user.role !== "admin_l1") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { data: newBatch, error: insertErr } = await supabase
    .from("variety_batches")
    .insert({
      variety_id: varietyId,
      batch_number: batch_number.trim().toUpperCase(),
      initial_stock: numStock,
      current_stock: numStock,
      reserved_stock: 0,
      expiry_date,
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: `Batch stok ${newBatch.batch_number} berhasil ditambahkan (${numStock} ${currentVar.unit}).`,
    batch: newBatch,
  });
}
