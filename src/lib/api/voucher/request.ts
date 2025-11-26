import { z } from "zod";

// Zod schemas for form validation and request data
export const createVoucherSchema = z.object({
	vendor_id: z.number(),
	event_id: z.number(),
	title: z.string().min(2, "Title must be at least 2 characters"),
	description: z.string().optional(),
	voucher_code: z.string().optional(),
	status: z.enum(["active", "inactive"]).default("active"),
	start_date: z.string(),
	end_date: z.string(),
	start_time: z.string().optional(),
	end_time: z.string().optional(),
	total_redemption_available: z.number().min(1),
	max_redemptions_per_user: z.number().min(1).default(1),
	voucher_type: z.enum(["fixed_amount", "percentage", "free_item"]),
	voucher_value: z.number().min(0),
	voucher_category: z.string().optional(),
	image: z.any().optional(), // For file upload
});

export const updateVoucherSchema = z.object({
	id: z.union([z.string(), z.number()]),
	vendor_id: z.number().optional(),
	event_id: z.number().optional(),
	title: z.string().min(2, "Title must be at least 2 characters").optional(),
	description: z.string().optional(),
	voucher_code: z.string().nullable().optional(),
	status: z.enum(["active", "inactive"]).optional(),
	start_date: z.string().optional(),
	end_date: z.string().optional(),
	start_time: z.string().optional(),
	end_time: z.string().optional(),
	total_redemption_available: z.number().min(1).optional(),
	max_redemptions_per_user: z.number().min(1).optional(),
	voucher_type: z.enum(["fixed_amount", "percentage", "free_item"]).optional(),
	voucher_value: z.number().min(0).optional(),
	voucher_category: z.string().optional(),
	image: z.any().optional(), // For file upload
	remove_image: z.boolean().optional(), // For removing existing image
});

export const deleteVoucherSchema = z.object({
	id: z.union([z.string(), z.number()]),
});

// Export types for form data
export type CreateVoucherRequest = z.infer<typeof createVoucherSchema>;
export type UpdateVoucherRequest = z.infer<typeof updateVoucherSchema>;
export type DeleteVoucherRequest = z.infer<typeof deleteVoucherSchema>;

