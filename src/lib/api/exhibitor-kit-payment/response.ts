// Payee payment detail (for bank transfer info)
export interface PayeePaymentDetail {
  bank_name: string;
  account_number: string;
  account_name: string;
}

// Backend exhibitor kit payment response
export interface BackendExhibitorKitPayment {
  id: number;
  exhibitor_kit_id: number;
  payee_id: number;
  payee_name: string;
  payee_payment_detail: PayeePaymentDetail | null;
  amount: string; // Decimal comes as string from Rails
  status: "pending" | "submitted" | "verified" | "rejected";
  payment_source: "manual_bank_in" | "payment_gateway" | null;
  payment_proof_url: string | null;
  external_ref: string | null;
  note: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  exhibitor_kit_items?: BackendExhibitorKitItem[];
  exhibitor_kit_printings?: BackendExhibitorKitPrinting[];
}

// Backend exhibitor kit item (nested in payment response)
export interface BackendExhibitorKitItem {
  id: number;
  exhibitor_kit_id: number;
  rentable_item_id: number;
  quantity: number;
  agreed_price: string;
  notes: string | null;
  exhibitor_kit_payment_id: number | null;
  rentable_item?: {
    id: number;
    name: string;
    description: string | null;
    unit_of_measure: string | null;
    default_price: string;
  };
}

// Backend exhibitor kit printing (nested in payment response)
export interface BackendExhibitorKitPrinting {
  id: number;
  exhibitor_kit_id: number;
  printing_service_id: number;
  quantity: number;
  agreed_price: string;
  file_reference: string | null;
  notes: string | null;
  exhibitor_kit_payment_id: number | null;
  printing_service?: {
    id: number;
    name: string;
    description: string | null;
    unit_of_measure: string | null;
    default_price: string;
  };
}

// Frontend payee payment detail
export interface FrontendPayeePaymentDetail {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

// Frontend exhibitor kit payment format
export interface ExhibitorKitPayment {
  id: number;
  exhibitorKitId: number;
  payeeId: number;
  payeeName: string;
  payeePaymentDetail: FrontendPayeePaymentDetail | null;
  amount: number;
  status: "pending" | "submitted" | "verified" | "rejected";
  paymentSource: "manual_bank_in" | "payment_gateway" | null;
  paymentProofUrl: string | null;
  externalRef: string | null;
  note: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  items?: ExhibitorKitPaymentItem[];
  printings?: ExhibitorKitPaymentPrinting[];
}

// Frontend exhibitor kit item
export interface ExhibitorKitPaymentItem {
  id: number;
  exhibitorKitId: number;
  rentableItemId: number;
  quantity: number;
  agreedPrice: number;
  notes: string | null;
  exhibitorKitPaymentId: number | null;
  rentableItem?: {
    id: number;
    name: string;
    description: string | null;
    unitOfMeasure: string | null;
    defaultPrice: number;
  };
}

// Frontend exhibitor kit printing
export interface ExhibitorKitPaymentPrinting {
  id: number;
  exhibitorKitId: number;
  printingServiceId: number;
  quantity: number;
  agreedPrice: number;
  fileReference: string | null;
  notes: string | null;
  exhibitorKitPaymentId: number | null;
  printingService?: {
    id: number;
    name: string;
    description: string | null;
    unitOfMeasure: string | null;
    defaultPrice: number;
  };
}

// Response types for operations
export type UpdateExhibitorKitPaymentResponse = ExhibitorKitPayment;
