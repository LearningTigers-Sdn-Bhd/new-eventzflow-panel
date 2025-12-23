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
	note: string | null;
	paid_at: string | null;
	created_at: string;
	updated_at: string;
	event_id: number;
	payee?: {
		id: number;
		email: string;
		first_name: string | null;
		last_name: string | null;
	} | null;
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
	note: string | null;
	paidAt: string | null;
	createdAt: string;
	updatedAt: string;
	eventId: number;
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
