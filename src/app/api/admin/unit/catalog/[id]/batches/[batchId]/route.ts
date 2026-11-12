import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

async function authorizeAndFetchBatch(varietyId: string, batchId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const supabase = createAdminClient();

  const { data: currentVar, error: varErr } = await supabase
    .from("varieties")
    .select("id, name, commodity_type, unit")
    .eq("id", varietyId)
    .is("deleted_at", null)
    .single();

  if (varErr || !currentVar) {
    return { error: NextResponse.json({ error: "Varietas tidak ditemukan." }, { status: 404 }) };
  }

  if (user.role === "admin_l2") {
    if (
      (currentVar.commodity_type === "padi" && user.team_code !== "upbs_padi") ||
      (currentVar.commodity_type === "ayam" && user.team_code !== "upbs_ayam")
    ) {
      return {
        error: NextResponse.json(
          { error: "Akses ditolak: Varietas ini bukan wewenang unit Anda." },
          { status: 403 }
        ),
      };
    }
  } else if (user.role !== "admin_l1") {
    return { error: NextResponse.json({ error: "Akses ditolak" }, { status: 403 }) };
  }

  const { data: currentBatch, error: batchErr } = await supabase
    .from("variety_batches")
    .select("id, variety_id, batch_number, initial_stock, current_stock, reserved_stock, expiry_date")
    .eq("id", batchId)
    .eq("variety_id", varietyId)
    .is("deleted_at", null)
    .single();

  if (batchErr || !currentBatch) {
    return { error: NextResponse.json({ error: "Batch stok tidak ditemukan." }, { status: 404 }) };
  }

  return { supabase, currentVar, currentBatch };
}

function purgeCatalogCache() {
  try {
    revalidatePath("/katalog");
    revalidatePath("/ajukan");
    revalidateTag("catalog_varieties", { expire: 0 });
  } catch (err) {
    console.error("Failed to revalidate catalog cache:", err);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; batchId: string }> }
) {
  const { id: varietyId, batchId } = await params;
  const auth = await authorizeAndFetchBatch(varietyId, batchId);
  if ("error" in auth) return auth.error;

  const { supabase, currentVar, currentBatch } = auth;
  const body = await req.json();
  const { batch_number, current_stock, expiry_date } = body;

  const numStock = Number(current_stock);
  if (
    typeof batch_number !== "string" ||
    !batch_number.trim() ||
    typeof expiry_date !== "string" ||
    !expiry_date ||
    !Number.isFinite(numStock) ||
    numStock < 0
  ) {
    return NextResponse.json(
      { error: "Nomor batch, stok fisik (>=0), dan tanggal kedaluwarsa wajib diisi." },
      { status: 400 }
    );
  }

  const reserved = Number(currentBatch.reserved_stock);
  if (numStock < reserved) {
    return NextResponse.json(
      {
        error: `Stok fisik tidak boleh kurang dari stok hold (${reserved} ${currentVar.unit}).`,
      },
      { status: 400 }
    );
  }

  const { data: updated, error: updateErr } = await supabase
    .from("variety_batches")
    .update({
      batch_number: batch_number.trim().toUpperCase(),
      current_stock: numStock,
      expiry_date,
      updated_at: new Date().toISOString(),
    })
    .eq("id", batchId)
    .eq("variety_id", varietyId)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  purgeCatalogCache();

  return NextResponse.json({
    success: true,
    message: `Batch stok ${updated.batch_number} berhasil diperbarui.`,
    batch: updated,
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; batchId: string }> }
) {
  const { id: varietyId, batchId } = await params;
  const auth = await authorizeAndFetchBatch(varietyId, batchId);
  if ("error" in auth) return auth.error;

  const { supabase, currentVar, currentBatch } = auth;
  const reserved = Number(currentBatch.reserved_stock);

  if (reserved > 0) {
    return NextResponse.json(
      {
        error: `Batch ${currentBatch.batch_number} tidak dapat dihapus karena masih memiliki stok hold (${reserved} ${currentVar.unit}).`,
      },
      { status: 400 }
    );
  }

  const nowIso = new Date().toISOString();
  const { error: deleteErr } = await supabase
    .from("variety_batches")
    .update({
      deleted_at: nowIso,
      updated_at: nowIso,
    })
    .eq("id", batchId)
    .eq("variety_id", varietyId);

  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 });
  }

  purgeCatalogCache();

  return NextResponse.json({
    success: true,
    message: `Batch stok ${currentBatch.batch_number} berhasil dihapus.`,
  });
}
