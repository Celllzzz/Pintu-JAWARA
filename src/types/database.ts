export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin_l1" | "admin_l2" | "pimpinan";

export type TicketStatus =
  | "diajukan"
  | "diverifikasi"
  | "perlu_perbaikan"
  | "disposisi"
  | "diproses"
  | "selesai";

export type SeedClass = "BS" | "FS" | "SS" | "ES" | "NONE";
export type CommodityType = "padi" | "ayam";
export type ServiceMechanism = "komersial" | "bantuan";

export type DocumentType =
  | "persyaratan_awal"
  | "perbaikan_berkas"
  | "bukti_bayar"
  | "surat_tagihan"
  | "hasil_layanan";

export type PaymentStatus =
  | "menunggu_pembayaran"
  | "menunggu_verifikasi"
  | "lunas"
  | "ditolak";

export type ActorType =
  | "pemohon"
  | "admin_l1"
  | "admin_l2"
  | "pimpinan"
  | "system";

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      service_categories: {
        Row: {
          id: string;
          code: string;
          name: string;
          sla_days: number;
          is_commercial: boolean;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          sla_days: number;
          is_commercial?: boolean;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          sla_days?: number;
          is_commercial?: boolean;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      sub_services: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      holidays: {
        Row: {
          id: string;
          date: string;
          name: string;
          is_joint_leave: boolean;
          year: number;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          date: string;
          name: string;
          is_joint_leave?: boolean;
          year: number;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          date?: string;
          name?: string;
          is_joint_leave?: boolean;
          year?: number;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          full_name: string;
          phone_number: string | null;
          role: UserRole;
          team_id: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          full_name: string;
          phone_number?: string | null;
          role: UserRole;
          team_id?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          full_name?: string;
          phone_number?: string | null;
          role?: UserRole;
          team_id?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token_hash?: string;
          expires_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      varieties: {
        Row: {
          id: string;
          code: string;
          name: string;
          seed_class: SeedClass | null;
          commodity_type: CommodityType;
          description: string | null;
          price_per_unit: number;
          unit: string;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          seed_class?: SeedClass | null;
          commodity_type: CommodityType;
          description?: string | null;
          price_per_unit?: number;
          unit?: string;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          seed_class?: SeedClass | null;
          commodity_type?: CommodityType;
          description?: string | null;
          price_per_unit?: number;
          unit?: string;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      variety_batches: {
        Row: {
          id: string;
          variety_id: string;
          batch_number: string;
          initial_stock: number;
          current_stock: number;
          reserved_stock: number;
          expiry_date: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          variety_id: string;
          batch_number: string;
          initial_stock: number;
          current_stock: number;
          reserved_stock?: number;
          expiry_date: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          variety_id?: string;
          batch_number?: string;
          initial_stock?: number;
          current_stock?: number;
          reserved_stock?: number;
          expiry_date?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      tickets: {
        Row: {
          id: string;
          ticket_number: string;
          category_id: string;
          sub_service_id: string;
          team_id: string | null;
          status: TicketStatus;
          applicant_name: string;
          whatsapp_number: string;
          whatsapp_pin_last4: string;
          subject: string;
          description: string;
          mechanism: ServiceMechanism | null;
          variety_id: string | null;
          requested_quantity: number | null;
          estimated_cost: number | null;
          sla_days: number;
          sla_started_at: string | null;
          sla_paused_at: string | null;
          sla_total_paused_seconds: number;
          sla_deadline: string | null;
          is_sla_extended: boolean;
          sla_extension_reason: string | null;
          sla_extended_by: string | null;
          verified_by: string | null;
          disposed_by: string | null;
          disposed_at: string | null;
          processed_by: string | null;
          completed_at: string | null;
          completion_note: string | null;
          version: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          ticket_number: string;
          category_id: string;
          sub_service_id: string;
          team_id?: string | null;
          status?: TicketStatus;
          applicant_name: string;
          whatsapp_number: string;
          whatsapp_pin_last4: string;
          subject: string;
          description: string;
          mechanism?: ServiceMechanism | null;
          variety_id?: string | null;
          requested_quantity?: number | null;
          estimated_cost?: number | null;
          sla_days: number;
          sla_started_at?: string | null;
          sla_paused_at?: string | null;
          sla_total_paused_seconds?: number;
          sla_deadline?: string | null;
          is_sla_extended?: boolean;
          sla_extension_reason?: string | null;
          sla_extended_by?: string | null;
          verified_by?: string | null;
          disposed_by?: string | null;
          disposed_at?: string | null;
          processed_by?: string | null;
          completed_at?: string | null;
          completion_note?: string | null;
          version?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          ticket_number?: string;
          category_id?: string;
          sub_service_id?: string;
          team_id?: string | null;
          status?: TicketStatus;
          applicant_name?: string;
          whatsapp_number?: string;
          whatsapp_pin_last4?: string;
          subject?: string;
          description?: string;
          mechanism?: ServiceMechanism | null;
          variety_id?: string | null;
          requested_quantity?: number | null;
          estimated_cost?: number | null;
          sla_days?: number;
          sla_started_at?: string | null;
          sla_paused_at?: string | null;
          sla_total_paused_seconds?: number;
          sla_deadline?: string | null;
          is_sla_extended?: boolean;
          sla_extension_reason?: string | null;
          sla_extended_by?: string | null;
          verified_by?: string | null;
          disposed_by?: string | null;
          disposed_at?: string | null;
          processed_by?: string | null;
          completed_at?: string | null;
          completion_note?: string | null;
          version?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      ticket_documents: {
        Row: {
          id: string;
          ticket_id: string;
          document_type: DocumentType;
          file_name: string;
          file_path: string;
          file_size_bytes: number | null;
          mime_type: string | null;
          uploaded_by_role: "pemohon" | "admin_l1" | "admin_l2";
          uploaded_by_user: string | null;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          document_type: DocumentType;
          file_name: string;
          file_path: string;
          file_size_bytes?: number | null;
          mime_type?: string | null;
          uploaded_by_role: "pemohon" | "admin_l1" | "admin_l2";
          uploaded_by_user?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          document_type?: DocumentType;
          file_name?: string;
          file_path?: string;
          file_size_bytes?: number | null;
          mime_type?: string | null;
          uploaded_by_role?: "pemohon" | "admin_l1" | "admin_l2";
          uploaded_by_user?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      ticket_billings: {
        Row: {
          id: string;
          ticket_id: string;
          amount: number;
          bank_name: string;
          account_number: string;
          account_holder: string;
          notes: string | null;
          payment_status: PaymentStatus;
          verified_by: string | null;
          verified_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          amount: number;
          bank_name: string;
          account_number: string;
          account_holder: string;
          notes?: string | null;
          payment_status?: PaymentStatus;
          verified_by?: string | null;
          verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          amount?: number;
          bank_name?: string;
          account_number?: string;
          account_holder?: string;
          notes?: string | null;
          payment_status?: PaymentStatus;
          verified_by?: string | null;
          verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      surveys: {
        Row: {
          id: string;
          ticket_id: string;
          contact_number: string | null;
          service_type: string;
          gender: "Laki-Laki" | "Perempuan";
          education: string;
          age_range: string;
          occupation: string;
          is_disabled: boolean;
          disability_type: string | null;
          q1: number;
          q2: number;
          q3: number;
          q4: number;
          q5: number;
          q6: number;
          q7: number;
          q8: number;
          q9: number;
          q10: number;
          q11: number;
          q12: number;
          q13: number;
          q14: number;
          q15: number;
          q16: number;
          feedback: string | null;
          average_score: number;
          ikm_score: number;
          service_grade: "A" | "B" | "C" | "D";
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          contact_number?: string | null;
          service_type: string;
          gender: "Laki-Laki" | "Perempuan";
          education: string;
          age_range: string;
          occupation: string;
          is_disabled?: boolean;
          disability_type?: string | null;
          q1: number;
          q2: number;
          q3: number;
          q4: number;
          q5: number;
          q6: number;
          q7: number;
          q8: number;
          q9: number;
          q10: number;
          q11: number;
          q12: number;
          q13: number;
          q14: number;
          q15: number;
          q16: number;
          feedback?: string | null;
          average_score: number;
          ikm_score: number;
          service_grade: "A" | "B" | "C" | "D";
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          contact_number?: string | null;
          service_type?: string;
          gender?: "Laki-Laki" | "Perempuan";
          education?: string;
          age_range?: string;
          occupation?: string;
          is_disabled?: boolean;
          disability_type?: string | null;
          q1?: number;
          q2?: number;
          q3?: number;
          q4?: number;
          q5?: number;
          q6?: number;
          q7?: number;
          q8?: number;
          q9?: number;
          q10?: number;
          q11?: number;
          q12?: number;
          q13?: number;
          q14?: number;
          q15?: number;
          q16?: number;
          feedback?: string | null;
          average_score?: number;
          ikm_score?: number;
          service_grade?: "A" | "B" | "C" | "D";
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      ticket_audit_logs: {
        Row: {
          id: string;
          ticket_id: string;
          action: string;
          old_status: string | null;
          new_status: string | null;
          actor_type: ActorType;
          actor_id: string | null;
          actor_name: string | null;
          notes: string | null;
          metadata: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          action: string;
          old_status?: string | null;
          new_status?: string | null;
          actor_type: ActorType;
          actor_id?: string | null;
          actor_name?: string | null;
          notes?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
