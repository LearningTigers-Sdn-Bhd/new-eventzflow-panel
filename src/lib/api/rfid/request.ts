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

export const manualEntrySchema = z
	.object({
		ticket_public_id: z.string().min(1, "Pick a guest."),
		// RFC3339 — the backend parses with Time.iso8601.
		entry_at: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
			message: "An entry time is required.",
		}),
		// Optional: left blank, the guest is still inside until their next exit.
		exit_at: z
			.string()
			.refine((v) => !Number.isNaN(Date.parse(v)), {
				message: "The left time is not valid.",
			})
			.optional(),
		reason: z.string().trim().min(1, "A reason is required."),
	})
	.refine((v) => !v.exit_at || Date.parse(v.entry_at) < Date.parse(v.exit_at), {
		message: "The entry must be before the exit.",
		path: ["exit_at"],
	});

export const updateRfidSettingsSchema = z
	.object({
		rfid_mode: z.enum(["bind", "write"]).optional(),
		require_check_in: z.boolean().optional(),
		attendance_percent: z.number().int().min(1).max(100).optional(),
	})
	.refine(
		(v) =>
			v.rfid_mode !== undefined ||
			v.require_check_in !== undefined ||
			v.attendance_percent !== undefined,
		{
			message: "rfid_mode, require_check_in or attendance_percent is required",
		},
	);

// Sessions are timed windows staff define; times go out as RFC3339.
export const rfidSessionSchema = z
	.object({
		name: z.string().trim().min(1, "A name is required."),
		starts_at: z.string().min(1, "A start time is required."),
		ends_at: z.string().min(1, "An end time is required."),
		mandatory: z.boolean(),
	})
	.refine((v) => Date.parse(v.ends_at) > Date.parse(v.starts_at), {
		message: "The end must be after the start.",
		path: ["ends_at"],
	});

export const updateRfidBindingSchema = z
	.object({
		ticket_public_id: z.string().uuid().optional(),
		tag_key: z
			.string()
			.trim()
			.regex(/^([0-9a-fA-F]{2})+$/, "Sticker must be even-length hex.")
			.optional(),
	})
	.refine((v) => v.ticket_public_id !== undefined || v.tag_key !== undefined, {
		message: "Change the ticket or the sticker.",
	});

export type UpdateRfidBindingRequest = z.infer<typeof updateRfidBindingSchema>;
export type UpdateRfidStationRequest = z.infer<typeof updateRfidStationSchema>;
export type RfidSessionRequest = z.infer<typeof rfidSessionSchema>;
export type ManualExitRequest = z.infer<typeof manualExitSchema>;
export type ManualEntryRequest = z.infer<typeof manualEntrySchema>;
export type UpdateRfidSettingsRequest = z.infer<
	typeof updateRfidSettingsSchema
>;
