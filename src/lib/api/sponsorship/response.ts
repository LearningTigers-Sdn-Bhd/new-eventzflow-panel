export type Sponsor = {
  id: number;
  group_id: number;
  name: string;
  website?: string | null;
  industry?: string | null;
  default_email?: string | null;
  default_whatsapp?: string | null;
  default_contact_name?: string | null;
  default_contact_position?: string | null;
  notes?: string | null;
  logo_path?: string | null;
  is_active: boolean;
  created_by_id?: number | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  // Analytics
  total_sponsorship_count?: number;
  total_pledged_amount?: string;
  total_received_amount?: string;
  event_sponsorships?: EventSponsorship[];
};

export type EventSponsorshipTier = {
  id: number;
  group_id: number;
  event_id: number;
  name: string;
  description?: string | null;
  sponsorship_type_default: "monetary" | "in_kind" | "mixed";
  currency_default: string;
  suggested_value?: string | null; // Decimal comes as string from API usually
  capacity?: number | null;
  benefits?: string | null;
  sort_order?: number | null;
  created_at: string;
  updated_at: string;
};

type UserSnapshot = {
  id: number;
  full_name: string;
  email: string;
};

export type EventSponsorshipItem = {
  id: number;
  event_sponsorship_id: number;
  item_type: "monetary" | "in_kind";
  title: string;
  quantity?: number | null;
  unit_value?: string | null;
  total_value?: string | null;
  notes?: string | null;
  received?: boolean | null;
  created_at: string;
  updated_at: string;
  created_by?: UserSnapshot;
  updated_by?: UserSnapshot;
};

export type EventSponsorship = {
  id: number;
  group_id: number;
  event_id: number;
  sponsor_id: number;
  event_sponsorship_tier_id?: number | null;
  tier_name_snapshot?: string | null;
  title: string;
  sponsorship_type: "monetary" | "in_kind" | "mixed";
  currency: string;
  total_sponsor_amount?: string | null;
  received_total?: string | null;
  last_received_at?: string | null;
  description?: string | null;
  status: "pending" | "partially_received" | "received" | "cancelled";
  contact_name?: string | null;
  contact_email?: string | null;
  contact_whatsapp?: string | null;
  contact_position?: string | null;
  internal_owner_user_id?: number | null;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
  cancel_reason?: string | null;
  created_at: string;
  updated_at: string;
  sponsor?: Sponsor; // Include
  event_sponsorship_tier?: EventSponsorshipTier; // Include
  event_sponsorship_items?: EventSponsorshipItem[]; // Include
  event?: {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    status: string;
  };
};

export type EventSponsorshipPayment = {
  id: number;
  event_sponsorship_id: number;
  amount: string;
  currency: string;
  received_at: string;
  method: "bank_transfer" | "cash" | "card" | "cheque" | "other";
  reference_no?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: UserSnapshot;
  updated_by?: UserSnapshot;
};

export type EventSponsorshipAttachment = {
  id: number;
  event_sponsorship_id: number;
  event_sponsorship_payment_id?: number | null;
  media_type: "image" | "pdf" | "other";
  attachment_type: "other_doc" | "contract" | "receipt" | "logo_pack";
  file_name: string;
  mime_type?: string | null;
  file_size?: number | null;
  storage_path: string;
  uploaded_by_id?: number | null;
  created_at: string;
  file_url?: string;
};