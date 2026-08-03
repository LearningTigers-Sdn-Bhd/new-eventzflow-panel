import { z } from "zod";

export const createExhibitorVoucherSchema = z
	.object({
		event_id: z.number().min(1, "Event ID is required"),
		exhibitor_booth_price_id: z.number().int().min(1).nullable().optional(),
		exhibitor_package_id: z.number().int().min(1).nullable().optional(),
		discount_type: z.enum(["percentage_off", "fixed_amount_off", "flat_price"]),
		discount_value: z
			.number()
			.min(0.01, "Discount value must be greater than 0"),
	})
	.superRefine((data, context) => {
		if (data.discount_type === "percentage_off" && data.discount_value > 100) {
			context.addIssue({
				code: "custom",
				message: "Percentage discount cannot exceed 100",
				path: ["discount_value"],
			});
		}
	});

export const deleteExhibitorVoucherSchema = z.object({
	id: z.number().min(1, "Voucher ID is required"),
});

export const previewExhibitorVoucherSchema = z.object({
	eventId: z.number().min(1),
	code: z.string().trim().min(1, "Voucher code is required"),
	exhibitorBoothPriceId: z.number().int().min(1),
	exhibitorPackageId: z.number().int().min(1).nullable().optional(),
});

export type CreateExhibitorVoucherRequest = z.infer<
	typeof createExhibitorVoucherSchema
>;
export type DeleteExhibitorVoucherRequest = z.infer<
	typeof deleteExhibitorVoucherSchema
>;
export type PreviewExhibitorVoucherRequest = z.infer<
	typeof previewExhibitorVoucherSchema
>;
