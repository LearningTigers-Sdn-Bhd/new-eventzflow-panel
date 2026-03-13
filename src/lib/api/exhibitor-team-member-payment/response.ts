// Payee payment detail (for bank transfer info)
export interface PayeePaymentDetail {
	bank_name: string;
	account_number: string;
	account_name: string;
}

// Backend exhibitor team member payment response
export interface BackendExhibitorTeamMemberPayment {
	id: number;
	exhibitor_kit_id: number;
	payee_id: number | null;
	extra_member_count: number;
	fee_per_member: string; // Decimal comes as string from Rails
	amount: string; // Decimal comes as string from Rails
	status: "pending" | "submitted" | "verified" | "rejected";
	payment_source: "manual_bank_in" | "payment_gateway" | null;
	payment_proof_url: string | null;
	external_ref: string | null;
	gateway: string | null;
	gateway_payment_id: string | null;
	payment_method: string | null;
	note: string | null;
	paid_at: string | null;
	created_at: string;
	updated_at: string;
	event_id: number;
	payee_payment_detail: PayeePaymentDetail | null;
	payee?: {
		id: number;
		email: string;
		first_name: string | null;
		last_name: string | null;
	} | null;
}

// Frontend payee payment detail
export interface FrontendPayeePaymentDetail {
	bankName: string;
	accountNumber: string;
	accountName: string;
}

// Frontend exhibitor team member payment format
export interface ExhibitorTeamMemberPayment {
	id: number;
	exhibitorKitId: number;
	payeeId: number | null;
	extraMemberCount: number;
	feePerMember: number;
	amount: number;
	status: "pending" | "submitted" | "verified" | "rejected";
	paymentSource: "manual_bank_in" | "payment_gateway" | null;
	paymentProofUrl: string | null;
	externalRef: string | null;
	gateway: string | null;
	gatewayPaymentId: string | null;
	paymentMethod: string | null;
	note: string | null;
	paidAt: string | null;
	createdAt: string;
	updatedAt: string;
	eventId: number;
	payeePaymentDetail: FrontendPayeePaymentDetail | null;
	payee?: {
		id: number;
		email: string;
		firstName: string | null;
		lastName: string | null;
	} | null;
}

// Response types for operations
export type CreateExhibitorTeamMemberPaymentResponse = ExhibitorTeamMemberPayment;
export type UpdateExhibitorTeamMemberPaymentResponse = ExhibitorTeamMemberPayment;

export interface CreateRazorpayOrderResponse {
	success: boolean;
	data: {
		payment_id: number;
		key_id: string;
		order_id: string;
		amount: number;
		currency: string;
		callback_url?: string;
	};
}

export interface VerifyRazorpayPaymentResponse {
	success: boolean;
	data: {
		payment_id: number;
		status: string;
		already_verified?: boolean;
	};
}
