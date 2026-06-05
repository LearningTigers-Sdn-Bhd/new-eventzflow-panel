import type {
	BackendExhibitorKitItem,
	BackendExhibitorKitPrinting,
	ExhibitorKitPaymentItem,
	ExhibitorKitPaymentPrinting,
	FrontendPayeePaymentDetail,
	PayeePaymentDetail,
} from "../exhibitor-kit-payment/response";

// Exhibitor info included in received payment response
export interface ExhibitorInfo {
	company_name: string | null;
	booth_number: string | null;
	vendor_email: string | null;
	vendor_name: string | null;
}

// Backend received payment response (extends payment with exhibitor info)
export interface BackendReceivedPayment {
	id: number;
	exhibitor_kit_id: number;
	payee_id: number;
	payee_name: string;
	payee_payment_detail: PayeePaymentDetail | null;
	amount: string;
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
	exhibitor_info: ExhibitorInfo;
}

// Frontend exhibitor info
export interface FrontendExhibitorInfo {
	companyName: string | null;
	boothNumber: string | null;
	vendorEmail: string | null;
	vendorName: string | null;
}

// Frontend received payment format
export interface ReceivedPayment {
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
	exhibitorInfo: FrontendExhibitorInfo;
}
