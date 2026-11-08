"use client";

import React, { useState, useMemo } from "react";
import { useToast } from "@/components/ui/Toast";
import { ServiceCategoryField } from "./ServiceCategoryField";
import { ServiceApplicantField } from "./ServiceApplicantField";
import { ServiceDocumentField } from "./ServiceDocumentField";
import { UPBSSpecField } from "./UPBSSpecField";
import { SubmissionSuccessModal } from "./SubmissionSuccessModal";
import { CatalogVarietyItem } from "@/lib/services/catalog";

export interface CategoryData {
  id: string;
  code: string;
  name: string;
  sla_days: number;
  is_commercial: boolean;
}

export interface SubServiceData {
  id: string;
  category_id: string;
  name: string;
}

interface ServiceFormProps {
  categories: CategoryData[];
  subServices: SubServiceData[];
  varieties: CatalogVarietyItem[];
  initialCategoryCode?: string;
  initialVarietyId?: string;
}

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

export function ServiceForm({
  categories,
  subServices,
  varieties,
  initialCategoryCode,
  initialVarietyId,
}: ServiceFormProps) {
  const { showToast } = useToast();

  const defaultCatId = useMemo(() => {
    if (initialCategoryCode && categories.length > 0) {
      const match = categories.find(
        (c) => c.code.toUpperCase() === initialCategoryCode.toUpperCase()
      );
      if (match) return match.id;
    }
    return categories[0]?.id || "";
  }, [initialCategoryCode, categories]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(defaultCatId);

  const filteredSubServices = useMemo(() => {
    if (!selectedCategoryId) return [];
    return subServices.filter((s) => s.category_id === selectedCategoryId);
  }, [selectedCategoryId, subServices]);

  const [selectedSubServiceId, setSelectedSubServiceId] = useState<string>(
    () => subServices.find((s) => s.category_id === defaultCatId)?.id || ""
  );

  const [applicantName, setApplicantName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [upbsMechanism, setUpbsMechanism] = useState<"komersial" | "bantuan">("komersial");
  const [upbsVarietyId, setUpbsVarietyId] = useState<string>(initialVarietyId || "");
  const [upbsQuantity, setUpbsQuantity] = useState<string>("");
  const [upbsEstimatedCost, setUpbsEstimatedCost] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<{
    ticketNumber: string;
    pinLast4: string;
    applicantName: string;
  } | null>(null);

  function handleCategoryChange(newCatId: string) {
    setSelectedCategoryId(newCatId);
    const sub = subServices.find((s) => s.category_id === newCatId);
    setSelectedSubServiceId(sub?.id || "");
  }

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId) || null,
    [categories, selectedCategoryId]
  );

  const isUPBSCategory = selectedCategory?.code === "BS";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const chosenFile = e.target.files?.[0] || null;

    if (!chosenFile) {
      setFile(null);
      return;
    }

    if (chosenFile.size > MAX_FILE_SIZE) {
      const errMsg = `Ukuran berkas (${(chosenFile.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas 1 MB.`;
      setFileError(errMsg);
      showToast(errMsg, "error");
      e.target.value = "";
      setFile(null);
      return;
    }

    const ext = chosenFile.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "doc" && ext !== "docx") {
      const errMsg = "Format berkas harus PDF (.pdf) atau Word (.doc, .docx).";
      setFileError(errMsg);
      showToast(errMsg, "error");
      e.target.value = "";
      setFile(null);
      return;
    }

    setFile(chosenFile);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedCategoryId) {
      showToast("Pilih kategori layanan utama terlebih dahulu.", "warning");
      return;
    }

    if (!selectedSubServiceId) {
      showToast("Pilih sub-layanan spesifik terlebih dahulu.", "warning");
      return;
    }

    if (isUPBSCategory) {
      if (!upbsVarietyId) {
        showToast("Pilih varietas benih/bibit terlebih dahulu.", "warning");
        return;
      }
      if (!upbsQuantity.trim() || Number(upbsQuantity) <= 0) {
        showToast("Jumlah kebutuhan benih/bibit wajib diisi.", "warning");
        return;
      }
    }

    if (!applicantName.trim()) {
      showToast("Nama lengkap pemohon wajib diisi.", "warning");
      return;
    }

    const cleanPhoneDigits = whatsappNumber.replace(/\D/g, "");
    if (!cleanPhoneDigits) {
      showToast("Nomor WhatsApp aktif wajib diisi.", "warning");
      return;
    }
    if (cleanPhoneDigits.length < 9) {
      showToast("Nomor WhatsApp tidak valid (minimal 9 digit angka).", "warning");
      return;
    }

    if (!subject.trim()) {
      showToast("Perihal permohonan wajib diisi.", "warning");
      return;
    }

    if (!description.trim()) {
      showToast("Uraian kebutuhan permohonan wajib diisi.", "warning");
      return;
    }

    if (fileError) {
      showToast(fileError, "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("category_id", selectedCategoryId);
      formData.append("sub_service_id", selectedSubServiceId);
      formData.append("applicant_name", applicantName.trim());
      formData.append("whatsapp_number", whatsappNumber.trim());
      formData.append("subject", subject.trim());
      formData.append("description", description.trim());
      if (file) {
        formData.append("file", file);
      }

      if (isUPBSCategory) {
        formData.append("mechanism", upbsMechanism);
        formData.append("variety_id", upbsVarietyId);
        formData.append("requested_quantity", upbsQuantity.trim());
        if (upbsEstimatedCost) {
          formData.append("estimated_cost", upbsEstimatedCost.toString());
        }
      }

      const res = await fetch("/api/tickets/submit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Gagal mengajukan permohonan.", "error");
        return;
      }

      setCreatedTicket({
        ticketNumber: data.ticket_number,
        pinLast4: data.pin_last4,
        applicantName: data.applicant_name,
      });
    } catch {
      showToast("Gangguan koneksi saat mengirim formulir.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <ServiceCategoryField
          categories={categories}
          subServices={filteredSubServices}
          selectedCategoryId={selectedCategoryId}
          onSelectCategoryId={handleCategoryChange}
          selectedSubServiceId={selectedSubServiceId}
          onSelectSubServiceId={setSelectedSubServiceId}
        />

        {isUPBSCategory && (
          <UPBSSpecField
            varieties={varieties}
            selectedVarietyId={upbsVarietyId}
            onSelectVariety={setUpbsVarietyId}
            mechanism={upbsMechanism}
            onChangeMechanism={setUpbsMechanism}
            quantity={upbsQuantity}
            onChangeQuantity={setUpbsQuantity}
            onCostCalculated={setUpbsEstimatedCost}
          />
        )}

        <ServiceApplicantField
          applicantName={applicantName}
          onChangeApplicantName={setApplicantName}
          whatsappNumber={whatsappNumber}
          onChangeWhatsappNumber={setWhatsappNumber}
          subject={subject}
          onChangeSubject={setSubject}
          description={description}
          onChangeDescription={setDescription}
        />

        <ServiceDocumentField
          file={file}
          fileError={fileError}
          onFileChange={handleFileChange}
        />

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || Boolean(fileError)}
            className="flex h-12 min-h-[48px] w-full items-center justify-center rounded-lg bg-[#1e4f28] px-6 text-sm font-bold text-white shadow-sm hover:bg-[#163c1e] disabled:opacity-50 transition-colors"
          >
            <span>{isSubmitting ? "Menerbitkan E-Tiket..." : "Kirim Pengajuan Permohonan"}</span>
          </button>
        </div>
      </form>

      {createdTicket && (
        <SubmissionSuccessModal
          isOpen={Boolean(createdTicket)}
          ticketNumber={createdTicket.ticketNumber}
          pinLast4={createdTicket.pinLast4}
          applicantName={createdTicket.applicantName}
          onClose={() => setCreatedTicket(null)}
        />
      )}
    </>
  );
}
