import { z } from "zod";

// A station role/UID-rule change is a correction, not an edit: the backend
// refuses it without a reason and an explicit confirmation. `confirm` is a
// literal so the form schema cannot validate without the operator ticking it.
export const updateRfidStationSchema = z
	.object({
		role: z.enum(["entry", "exit"]).nullable().optional(),
		uid_rule: z.enum(["as_is", "reversed"]).optional(),
		reason: z.string().trim().min(1, "A reason is required."),
		confirm: z.literal(true, {
			error: "This change must be confirmed explicitly.",
		}),
		observation_ids: z.array(z.number().int().positive()).optional(),
	})
	.refine((v) => v.role !== undefined || v.uid_rule !== undefined, {
		message: "role or uid_rule is required",
	});

export const manualExitSchema = z.object({
	// RFC3339 — the backend parses with Time.iso8601.
	at: z
		.string()
		.min(1, "An exit time is required.")
		.refine((v) => !Number.isNaN(Date.parse(v)), {
			message: "at must be a valid timestamp",
		}),
	reason: z.string().trim().min(1, "A reason is required."),
});

export const updateRfidSettingsSchema = z
	.object({
		rfid_mode: z.enum(["bind", "write"]).optional(),
		require_check_in: z.boolean().optional(),
	})
	.refine(
		(v) => v.rfid_mode !== undefined || v.require_check_in !== undefined,
		{
			message: "rfid_mode or require_check_in is required",
		},
	);

export type UpdateRfidStationRequest = z.infer<typeof updateRfidStationSchema>;
export type ManualExitRequest = z.infer<typeof manualExitSchema>;
export type UpdateRfidSettingsRequest = z.infer<
	typeof updateRfidSettingsSchema
>;
