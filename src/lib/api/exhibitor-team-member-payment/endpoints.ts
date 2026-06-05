import { restClient } from "@/utils/rest-api";
import {
	type CreateExhibitorTeamMemberPaymentRequest,
	createExhibitorTeamMemberPaymentSchema,
	type GetExhibitorTeamMemberPaymentRequest,
	type GetExhibitorTeamMemberPaymentsRequest,
	getExhibitorTeamMemberPaymentSchema,
	getExhibitorTeamMemberPaymentsSchema,
	type UpdateExhibitorTeamMemberPaymentRequest,
	updateExhibitorTeamMemberPaymentSchema,
} from "./request";
import type {
	BackendExhibitorTeamMemberPayment,
	CreateExhibitorTeamMemberPaymentResponse,
	CreateRazorpayOrderResponse,
	ExhibitorTeamMemberPayment,
	UpdateExhibitorTeamMemberPaymentResponse,
	VerifyRazorpayPaymentResponse,
} from "./response";

// Transform backend payment to frontend format
function transformPayment(
	backendPayment: BackendExhibitorTeamMemberPayment,
): ExhibitorTeamMemberPayment {
	return {
		id: backendPayment.id,
		exhibitorKitId: backendPayment.exhibitor_kit_id,
		payeeId: backendPayment.payee_id,
		extraMemberCount: backendPayment.extra_member_count,
		feePerMember: Number.parseFloat(backendPayment.fee_per_member),
		amount: Number.parseFloat(backendPayment.amount),
		status: backendPayment.status,
		paymentSource: backendPayment.payment_source,
		paymentProofUrl: backendPayment.payment_proof_url,
		externalRef: backendPayment.external_ref,
		gateway: backendPayment.gateway,
		gatewayPaymentId: backendPayment.gateway_payment_id,
		paymentMethod: backendPayment.payment_method,
		note: backendPayment.note,
		paidAt: backendPayment.paid_at,
		createdAt: backendPayment.created_at,
		updatedAt: backendPayment.updated_at,
		eventId: backendPayment.event_id,
		payeePaymentDetail: backendPayment.payee_payment_detail
			? {
					bankName: backendPayment.payee_payment_detail.bank_name,
					accountNumber: backendPayment.payee_payment_detail.account_number,
					accountName: backendPayment.payee_payment_detail.account_name,
				}
			: null,
		payee: backendPayment.payee
			? {
					id: backendPayment.payee.id,
					email: backendPayment.payee.email,
					firstName: backendPayment.payee.first_name,
					lastName: backendPayment.payee.last_name,
				}
			: null,
	};
}

/**
 * Get all team member payments for an exhibitor kit
 */
export async function getExhibitorTeamMemberPayments(
	data: GetExhibitorTeamMemberPaymentsRequest,
): Promise<ExhibitorTeamMemberPayment[]> {
	try {
		const validated = getExhibitorTeamMemberPaymentsSchema.parse(data);

		const response = await restClient.get<BackendExhibitorTeamMemberPayment[]>(
			`v1/events/${validated.eventId}/exhibitor_kits/${validated.exhibitorKitId}/exhibitor_team_member_payments`,
		);

		return response.map(transformPayment);
	} catch (error: unknown) {
		console.error("Error fetching exhibitor team member payments:", error);
		const message =
			error instanceof Error ? error.message : "Failed to fetch payments";
		throw new Error(message);
	}
}

/**
 * Get a single team member payment
 */
export async function getExhibitorTeamMemberPayment(
	data: GetExhibitorTeamMemberPaymentRequest,
): Promise<ExhibitorTeamMemberPayment> {
	try {
		const validated = getExhibitorTeamMemberPaymentSchema.parse(data);

		const response = await restClient.get<BackendExhibitorTeamMemberPayment>(
			`v1/events/${validated.eventId}/exhibitor_kits/${validated.exhibitorKitId}/exhibitor_team_member_payments/${validated.paymentId}`,
		);

		return transformPayment(response);
	} catch (error: unknown) {
		console.error("Error fetching exhibitor team member payment:", error);
		const message =
			error instanceof Error ? error.message : "Failed to fetch payment";
		throw new Error(message);
	}
}

/**
 * Create a new team member payment with file upload (Active Storage)
 */
export async function createExhibitorTeamMemberPayment(data: {
	eventId: string;
	exhibitorKitId: string;
	paymentProof: File;
	paymentSource?: "manual_bank_in" | "payment_gateway";
	externalRef?: string;
	note?: string;
}): Promise<CreateExhibitorTeamMemberPaymentResponse> {
	try {
		const {
			eventId,
			exhibitorKitId,
			paymentProof,
			paymentSource = "manual_bank_in",
			externalRef,
			note,
		} = data;

		const formData = new FormData();
		formData.append(
			"exhibitor_team_member_payment[payment_proof]",
			paymentProof,
		);
		formData.append(
			"exhibitor_team_member_payment[payment_source]",
			paymentSource,
		);
		if (externalRef) {
			formData.append(
				"exhibitor_team_member_payment[external_ref]",
				externalRef,
			);
		}
		if (note) {
			formData.append("exhibitor_team_member_payment[note]", note);
		}

		const response =
			await restClient.postFormData<BackendExhibitorTeamMemberPayment>(
				`v1/events/${eventId}/exhibitor_kits/${exhibitorKitId}/exhibitor_team_member_payments`,
				formData,
			);

		return transformPayment(response);
	} catch (error: unknown) {
		console.error("Error creating exhibitor team member payment:", error);
		const message =
			error instanceof Error ? error.message : "Failed to create payment";
		throw new Error(message);
	}
}

/**
 * Update a team member payment (resubmit proof or verify/reject)
 */
export async function updateExhibitorTeamMemberPayment(
	data: UpdateExhibitorTeamMemberPaymentRequest,
): Promise<UpdateExhibitorTeamMemberPaymentResponse> {
	try {
		const validated = updateExhibitorTeamMemberPaymentSchema.parse(data);
		const { eventId, exhibitorKitId, paymentId, ...updateData } = validated;

		const response = await restClient.patch<BackendExhibitorTeamMemberPayment>(
			`v1/events/${eventId}/exhibitor_kits/${exhibitorKitId}/exhibitor_team_member_payments/${paymentId}`,
			{ exhibitor_team_member_payment: updateData },
		);

		return transformPayment(response);
	} catch (error: unknown) {
		console.error("Error updating exhibitor team member payment:", error);
		const message =
			error instanceof Error ? error.message : "Failed to update payment";
		throw new Error(message);
	}
}

/**
 * Resubmit payment proof with file upload (for rejected payments)
 */
export async function resubmitTeamMemberPaymentProof(data: {
	eventId: string;
	exhibitorKitId: string;
	paymentId: string;
	paymentProof: File;
	externalRef?: string;
	note?: string;
}): Promise<UpdateExhibitorTeamMemberPaymentResponse> {
	try {
		const {
			eventId,
			exhibitorKitId,
			paymentId,
			paymentProof,
			externalRef,
			note,
		} = data;

		const formData = new FormData();
		formData.append(
			"exhibitor_team_member_payment[payment_proof]",
			paymentProof,
		);
		formData.append(
			"exhibitor_team_member_payment[payment_source]",
			"manual_bank_in",
		);
		if (externalRef) {
			formData.append(
				"exhibitor_team_member_payment[external_ref]",
				externalRef,
			);
		}
		if (note) {
			formData.append("exhibitor_team_member_payment[note]", note);
		}

		const response =
			await restClient.patchFormData<BackendExhibitorTeamMemberPayment>(
				`v1/events/${eventId}/exhibitor_kits/${exhibitorKitId}/exhibitor_team_member_payments/${paymentId}`,
				formData,
			);

		return transformPayment(response);
	} catch (error: unknown) {
		console.error("Error resubmitting payment proof:", error);
		const message =
			error instanceof Error
				? error.message
				: "Failed to resubmit payment proof";
		throw new Error(message);
	}
}

export async function createExtraTeamMemberPaymentOrder(data: {
	eventId: string;
	exhibitorKitId: string;
}): Promise<CreateRazorpayOrderResponse["data"]> {
	try {
		const response = await restClient.post<CreateRazorpayOrderResponse>(
			`v1/events/${data.eventId}/exhibitor_kits/${data.exhibitorKitId}/exhibitor_team_member_payments/razorpay/create_order`,
			{},
		);

		return response.data;
	} catch (error: unknown) {
		console.error("Error creating extra team member payment order:", error);
		const message =
			error instanceof Error ? error.message : "Failed to create payment order";
		throw new Error(message);
	}
}

export async function verifyExtraTeamMemberPayment(data: {
	eventId: string;
	exhibitorKitId: string;
	paymentId: number;
	razorpayOrderId: string;
	razorpayPaymentId: string;
	razorpaySignature: string;
}): Promise<VerifyRazorpayPaymentResponse["data"]> {
	try {
		const response = await restClient.post<VerifyRazorpayPaymentResponse>(
			`v1/events/${data.eventId}/exhibitor_kits/${data.exhibitorKitId}/exhibitor_team_member_payments/razorpay/verify`,
			{
				payment_id: data.paymentId,
				razorpay_order_id: data.razorpayOrderId,
				razorpay_payment_id: data.razorpayPaymentId,
				razorpay_signature: data.razorpaySignature,
			},
		);

		return response.data;
	} catch (error: unknown) {
		console.error("Error verifying extra team member payment:", error);
		const message =
			error instanceof Error ? error.message : "Failed to verify payment";
		throw new Error(message);
	}
}
