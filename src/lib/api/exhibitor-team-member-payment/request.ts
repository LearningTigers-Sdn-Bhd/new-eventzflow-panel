import { z } from "zod";

// Validation schema for getting exhibitor team member payments
export const getExhibitorTeamMemberPaymentsSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	exhibitorKitId: z.string().min(1, "Exhibitor Kit ID is required"),
});

// Validation schema for getting a single payment
export const getExhibitorTeamMemberPaymentSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	exhibitorKitId: z.string().min(1, "Exhibitor Kit ID is required"),
	paymentId: z.string().min(1, "Payment ID is required"),
});

// Validation schema for creating a payment (vendor submitting proof)
export const createExhibitorTeamMemberPaymentSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	exhibitorKitId: z.string().min(1, "Exhibitor Kit ID is required"),
	payment_source: z.enum(["manual_bank_in", "payment_gateway"]),
	external_ref: z.string().optional(),
	note: z.string().optional(),
});

// Validation schema for updating a payment (vendor resubmitting or organizer verifying)
export const updateExhibitorTeamMemberPaymentSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	exhibitorKitId: z.string().min(1, "Exhibitor Kit ID is required"),
	paymentId: z.string().min(1, "Payment ID is required"),
	// Vendor can update these fields
	payment_source: z.enum(["manual_bank_in", "payment_gateway"]).optional(),
	external_ref: z.string().optional(),
	note: z.string().optional(),
	// Organizer can update these fields
	status: z.enum(["pending", "submitted", "verified", "rejected"]).optional(),
	paid_at: z.string().optional(),
});

// Type exports for request data
export type GetExhibitorTeamMemberPaymentsRequest = z.infer<
	typeof getExhibitorTeamMemberPaymentsSchema
>;
export type GetExhibitorTeamMemberPaymentRequest = z.infer<
	typeof getExhibitorTeamMemberPaymentSchema
>;
export type CreateExhibitorTeamMemberPaymentRequest = z.infer<
	typeof createExhibitorTeamMemberPaymentSchema
>;
export type UpdateExhibitorTeamMemberPaymentRequest = z.infer<
	typeof updateExhibitorTeamMemberPaymentSchema
>;
