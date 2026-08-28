import { z } from "zod";

export const getScanLogsSchema = z.object({
	eventId: z.union([z.string(), z.number()]),
	page: z.number().optional(),
	perPage: z.number().max(100).optional(),
	q: z.string().optional(),
	source: z.enum(["staff_scan", "self_check_in", "kiosk"]).optional(),
	eventLocationId: z.number().optional(),
	date: z.string().optional(),
	scannableType: z.enum(["Ticket", "Visitor"]).optional(),
	scannableId: z.number().optional(),
});

export type GetScanLogsRequest = z.infer<typeof getScanLogsSchema>;
