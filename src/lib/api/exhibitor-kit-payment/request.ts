import { z } from "zod";

// Validation schema for getting exhibitor kit payments
export const getExhibitorKitPaymentsSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	exhibitorKitId: z.string().min(1, "Exhibitor Kit ID is required"),
});

// Validation schema for getting a single payment
export const getExhibitorKitPaymentSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	exhibitorKitId: z.string().min(1, "Exhibitor Kit ID is required"),
	paymentId: z.string().min(1, "Payment ID is required"),
});

// Validation schema for updating a payment (exhibitor submitting proof or contractor verifying)
export const updateExhibitorKitPaymentSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	exhibitorKitId: z.string().min(1, "Exhibitor Kit ID is required"),
	paymentId: z.string().min(1, "Payment ID is required"),
	// Exhibitor can update these fields
	payment_source: z.enum(["manual_bank_in", "payment_gateway"]).optional(),
	payment_proof_url: z.string().url().optional(),
	external_ref: z.string().optional(),
	note: z.string().optional(),
	// Admin/Contractor can update these fields
	status: z.enum(["pending", "submitted", "verified", "rejected"]).optional(),
	paid_at: z.string().optional(),
});

// Type exports for request data
export type GetExhibitorKitPaymentsRequest = z.infer<
	typeof getExhibitorKitPaymentsSchema
>;
export type GetExhibitorKitPaymentRequest = z.infer<
	typeof getExhibitorKitPaymentSchema
>;
export type UpdateExhibitorKitPaymentRequest = z.infer<
	typeof updateExhibitorKitPaymentSchema
>;
