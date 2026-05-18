import { restClient } from "@/utils/rest-api";
import {
	type GetReceivedPaymentsRequest,
	getReceivedPaymentsSchema,
} from "./request";
import type { BackendReceivedPayment, ReceivedPayment } from "./response";

// Transform backend payment to frontend format
function transformReceivedPayment(
	backendPayment: BackendReceivedPayment,
): ReceivedPayment {
	return {
		id: backendPayment.id,
		exhibitorKitId: backendPayment.exhibitor_kit_id,
		payeeId: backendPayment.payee_id,
		payeeName: backendPayment.payee_name,
		payeePaymentDetail: backendPayment.payee_payment_detail
			? {
					bankName: backendPayment.payee_payment_detail.bank_name,
					accountNumber: backendPayment.payee_payment_detail.account_number,
					accountName: backendPayment.payee_payment_detail.account_name,
				}
			: null,
		amount: Number.parseFloat(backendPayment.amount),
		status: backendPayment.status,
		paymentSource: backendPayment.payment_source,
		paymentProofUrl: backendPayment.payment_proof_url,
		externalRef: backendPayment.external_ref,
		note: backendPayment.note,
		paidAt: backendPayment.paid_at,
		createdAt: backendPayment.created_at,
		updatedAt: backendPayment.updated_at,
		items: backendPayment.exhibitor_kit_items?.map((item) => ({
			id: item.id,
			exhibitorKitId: item.exhibitor_kit_id,
			rentableItemId: item.rentable_item_id,
			quantity: item.quantity,
			agreedPrice: Number.parseFloat(item.agreed_price),
			notes: item.notes,
			exhibitorKitPaymentId: item.exhibitor_kit_payment_id,
			rentableItem: item.rentable_item
				? {
						id: item.rentable_item.id,
						name: item.rentable_item.name,
						description: item.rentable_item.description,
						unitOfMeasure: item.rentable_item.unit_of_measure,
						defaultPrice: Number.parseFloat(item.rentable_item.default_price),
					}
				: undefined,
		})),
		printings: backendPayment.exhibitor_kit_printings?.map((printing) => ({
			id: printing.id,
			exhibitorKitId: printing.exhibitor_kit_id,
			printingServiceId: printing.printing_service_id,
			quantity: printing.quantity,
			agreedPrice: Number.parseFloat(printing.agreed_price),
			fileReference: printing.file_reference,
			notes: printing.notes,
			exhibitorKitPaymentId: printing.exhibitor_kit_payment_id,
			printingService: printing.printing_service
				? {
						id: printing.printing_service.id,
						name: printing.printing_service.name,
						description: printing.printing_service.description,
						unitOfMeasure: printing.printing_service.unit_of_measure,
						defaultPrice: Number.parseFloat(
							printing.printing_service.default_price,
						),
					}
				: undefined,
		})),
		exhibitorInfo: {
			companyName: backendPayment.exhibitor_info.company_name,
			boothNumber: backendPayment.exhibitor_info.booth_number,
			vendorEmail: backendPayment.exhibitor_info.vendor_email,
			vendorName: backendPayment.exhibitor_info.vendor_name,
		},
	};
}

/**
 * Get all received payments for the current user (as payee)
 * Works for contractors (rentable items) and org_owners (printing services)
 */
export async function getReceivedPayments(
	data: GetReceivedPaymentsRequest,
): Promise<ReceivedPayment[]> {
	try {
		const validated = getReceivedPaymentsSchema.parse(data);

		const response = await restClient.get<BackendReceivedPayment[]>(
			`v1/events/${validated.eventId}/received_payments`,
		);

		return response.map(transformReceivedPayment);
	} catch (error: any) {
		console.error("Error fetching received payments:", error);
		throw new Error(error.message || "Failed to fetch received payments");
	}
}
